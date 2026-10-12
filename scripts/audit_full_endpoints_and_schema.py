import os
import re
import ast

backend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn-backend-api"
frontend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src"

main_py_path = os.path.join(backend_dir, "main.py")
models_py_path = os.path.join(backend_dir, "models.py")
schemas_py_path = os.path.join(backend_dir, "schemas.py")

with open(main_py_path, "r", encoding="utf-8") as f:
    main_code = f.read()

# 1. Parse FastAPI endpoints
# Regex for @app.<method>("<path>")
endpoint_matches = re.finditer(r'@app\.(get|post|put|delete|patch)\(\s*["\']([^"\']+)["\']', main_code)
backend_endpoints = []
for m in endpoint_matches:
    method = m.group(1).upper()
    path = m.group(2)
    # Find the function definition right after
    func_match = re.search(r'def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)', main_code[m.end():m.end()+500])
    func_name = func_match.group(1) if func_match else "unknown"
    func_params = func_match.group(2) if func_match else ""
    backend_endpoints.append({
        'method': method,
        'path': path,
        'func': func_name,
        'params': func_params
    })

print(f"Loaded {len(backend_endpoints)} backend endpoints from main.py")

# 2. Parse backend models and columns
with open(models_py_path, "r", encoding="utf-8") as f:
    models_code = f.read()

# Find class <Name>(Base):
model_classes = re.findall(r'class\s+([a-zA-Z0-9_]+)\s*\(\s*Base\s*\):', models_code)
tables = {}
current_class = None
current_table = None
columns = {}

for line in models_code.split("\n"):
    class_m = re.match(r'class\s+([a-zA-Z0-9_]+)\s*\(\s*Base\s*\):', line)
    if class_m:
        current_class = class_m.group(1)
        current_table = None
        columns[current_class] = []
        continue
    if current_class:
        tbl_m = re.match(r'\s*__tablename__\s*=\s*["\']([^"\']+)["\']', line)
        if tbl_m:
            current_table = tbl_m.group(1)
            tables[current_table] = current_class
        col_m = re.match(r'\s*([a-zA-Z0-9_]+)\s*=\s*Column\(', line)
        if col_m:
            col_name = col_m.group(1)
            columns[current_class].append(col_name)

print(f"Loaded {len(tables)} database tables from models.py:")
for tbl, cls in tables.items():
    print(f"  Table: {tbl:25} (Model: {cls}, {len(columns.get(cls, []))} columns)")

# 3. Check alembic migrations
alembic_versions_dir = os.path.join(backend_dir, "alembic", "versions")
migration_files = os.listdir(alembic_versions_dir) if os.path.exists(alembic_versions_dir) else []
print(f"\nAlembic migrations found ({len(migration_files)}):")
for mf in sorted(migration_files):
    print(f"  - {mf}")

# 4. Parse backend schemas
with open(schemas_py_path, "r", encoding="utf-8") as f:
    schemas_code = f.read()

schema_classes = re.findall(r'class\s+([a-zA-Z0-9_]+)\s*\(\s*BaseModel\s*\):', schemas_code)
print(f"\nLoaded {len(schema_classes)} Pydantic schemas from schemas.py")

# 5. Parse frontend backendApi.js exports and endpoints
backend_api_js = os.path.join(frontend_dir, "utils", "backendApi.js")
with open(backend_api_js, "r", encoding="utf-8") as f:
    fe_code = f.read()

# Match export async function funcName(...) or export function funcName(...) or export const funcName = ...
fe_func_matches = re.finditer(r'export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{|export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{', fe_code)

func_positions = []
for m in fe_func_matches:
    fname = m.group(1) or m.group(3)
    fargs = m.group(2) or m.group(4)
    func_positions.append((fname, fargs, m.start()))

print(f"\nLoaded {len(func_positions)} exported functions from backendApi.js")

fe_api_mappings = []
for idx, (fname, fargs, start_pos) in enumerate(func_positions):
    end_pos = func_positions[idx + 1][2] if idx + 1 < len(func_positions) else len(fe_code)
    body = fe_code[start_pos:end_pos]
    
    # Look for fetch(`${FASTAPI_BASE_URL}...`) or fetch(`${BASE_URL}...`) or fetch("...")
    fetches = re.finditer(r'fetch\(\s*`\$\{FASTAPI_BASE_URL\}([^`]+)`(?:\s*,\s*\{([^}]*)\})?', body)
    for fm in fetches:
        url = fm.group(1)
        opts = fm.group(2) or ""
        method_m = re.search(r'method:\s*["\']([a-zA-Z]+)["\']', opts)
        method = method_m.group(1).upper() if method_m else "GET"
        fe_api_mappings.append({
            'func': fname,
            'url': url,
            'method': method,
            'opts': opts
        })

print(f"Mapped {len(fe_api_mappings)} fetch calls in backendApi.js")

# Normalize paths for matching
def normalize_path(path):
    path_no_q = path.split('?')[0]
    p = re.sub(r'\$\{[^}]+\}', '{param}', path_no_q)
    p = re.sub(r'\{[^}]+\}', '{param}', p)
    if not p.startswith('/'):
        p = '/' + p
    return p

backend_route_map = {}
for be in backend_endpoints:
    norm = normalize_path(be['path'])
    key = (be['method'], norm)
    backend_route_map[key] = be

matched_fe = []
unmatched_fe = []
method_mismatch = []

for fe in fe_api_mappings:
    norm_fe = normalize_path(fe['url'])
    key = (fe['method'], norm_fe)
    if key in backend_route_map:
        matched_fe.append((fe, backend_route_map[key]))
    else:
        alt_methods = [be for be in backend_endpoints if normalize_path(be['path']) == norm_fe]
        if alt_methods:
            method_mismatch.append((fe, alt_methods))
        else:
            unmatched_fe.append((fe, norm_fe))

print(f"\n==========================================")
print(f"FRONTEND -> BACKEND MATCH RESULTS")
print(f"==========================================")
print(f"Successfully matched: {len(matched_fe)} calls")
print(f"Method mismatches: {len(method_mismatch)}")
for fe, alts in method_mismatch:
    print(f"  [METHOD MISMATCH] in {fe['func']}:")
    print(f"     FE: {fe['method']} {fe['url']}")
    for a in alts:
        print(f"     BE: {a['method']} {a['path']}")

print(f"\nUnmatched FE calls: {len(unmatched_fe)}")
for fe, norm in unmatched_fe:
    print(f"  [UNMATCHED] in {fe['func']}:")
    print(f"     FE: {fe['method']} {fe['url']} (normalized: {norm})")

# Check backend endpoints not called
matched_be_set = {(be['method'], normalize_path(be['path'])) for fe, be in matched_fe}
unused_be = []
for be in backend_endpoints:
    norm = normalize_path(be['path'])
    if (be['method'], norm) not in matched_be_set:
        unused_be.append(be)

print(f"\nBackend endpoints not called by backendApi.js: {len(unused_be)}")
for u in unused_be:
    print(f"  [NOT CALLED IN FE] {u['method']:6} {u['path']:45} (func: {u['func']})")


