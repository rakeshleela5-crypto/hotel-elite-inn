import os
import re

backend_main = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn-backend-api\main.py"
frontend_api = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src\utils\backendApi.js"

with open(backend_main, "r", encoding="utf-8") as f:
    main_code = f.read()

# Collect all backend routes: (method, normalized_path)
backend_routes = []
for m in re.finditer(r'@app\.(get|post|put|delete|patch)\(\s*["\']([^"\']+)["\']', main_code):
    method = m.group(1).upper()
    path = m.group(2)
    # Normalize: replace {param} with {*}
    norm_path = re.sub(r'\{[^}]+\}', '{*}', path)
    backend_routes.append((method, norm_path, path))

with open(frontend_api, "r", encoding="utf-8") as f:
    fe_code = f.read()

# Extract all exported functions and what URLs they fetch
func_blocks = re.findall(r'export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{([\s\S]*?)(?=\nexport|\Z)', fe_code)

print(f"Total exported functions in backendApi.js: {len(func_blocks)}")

mismatches = []
all_fe_calls = []

for fname, fargs, body in func_blocks:
    # Find all fetch calls by finding 'fetch(' and matching parentheses
    pos = 0
    while True:
        idx = body.find('fetch(', pos)
        if idx == -1:
            break
        # find matching paren
        p_count = 1
        i = idx + 6
        while i < len(body) and p_count > 0:
            if body[i] == '(':
                p_count += 1
            elif body[i] == ')':
                p_count -= 1
            i += 1
        fetch_call = body[idx:i]
        pos = i
        
        # Determine method inside fetch_call
        method_m = re.search(r'method:\s*["\']([a-zA-Z]+)["\']', fetch_call)
        method = method_m.group(1).upper() if method_m else "GET"
        
        # Find URL expression (the first argument to fetch)
        # Match up to comma before options or closing paren
        arg_match = re.search(r'fetch\(\s*([^,\)]+)', fetch_call)
        url_expr = arg_match.group(1).strip() if arg_match else ""
        
        resolved_url = url_expr
        if url_expr in ["url", "finalUrl", "targetUrl"]:
            var_m = re.search(r'(?:const|let|var)\s+' + url_expr + r'\s*=\s*([^;]+);', body)
            if var_m:
                resolved_url = var_m.group(1).strip()
        
        # Extract path
        path_m = re.search(r'/(?:api/[^`\'"?\s\)]+|health)', resolved_url)
        if path_m:
            raw_path = path_m.group(0)
            norm_fe_path = re.sub(r'\$\{[^}]+\}', '{*}', raw_path)
            all_fe_calls.append({
                'func': fname,
                'method': method,
                'path': raw_path,
                'norm_path': norm_fe_path,
                'raw_expr': url_expr
            })
            
            matched = False
            for b_method, b_norm_path, b_orig_path in backend_routes:
                if b_method == method and b_norm_path == norm_fe_path:
                    matched = True
                    break
            
            if not matched:
                alt_methods = [b[0] for b in backend_routes if b[1] == norm_fe_path]
                similar_paths = [b for b in backend_routes if b[0] == method and len(norm_fe_path.split('/')) > 2 and norm_fe_path.split('/')[2] in b[1]]
                mismatches.append({
                    'func': fname,
                    'method': method,
                    'path': raw_path,
                    'norm': norm_fe_path,
                    'alt_methods': alt_methods,
                    'similar_paths': similar_paths[:3]
                })


print(f"Total endpoints fetched by backendApi.js: {len(all_fe_calls)}")
print(f"Mismatches / Unmatched calls: {len(mismatches)}")
for m in mismatches:
    print(f"\n[MISMATCH] In function: {m['func']}()")
    print(f"   FE calls: {m['method']} {m['path']}")
    if m['alt_methods']:
        print(f"   Path exists in backend with method: {m['alt_methods']}")
    if m['similar_paths']:
        print(f"   Similar backend endpoints:")
        for sm, sp, so in m['similar_paths']:
            print(f"      - {sm} {so}")

