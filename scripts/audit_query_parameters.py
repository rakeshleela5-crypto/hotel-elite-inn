import os
import re

backend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn-backend-api"
frontend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src"

main_py = os.path.join(backend_dir, "main.py")
backend_api_js = os.path.join(frontend_dir, "utils", "backendApi.js")

with open(main_py, "r", encoding="utf-8") as f:
    main_code = f.read()

with open(backend_api_js, "r", encoding="utf-8") as f:
    fe_code = f.read()

lines = main_code.split("\n")
query_endpoints = []
current_route = None

for i, line in enumerate(lines):
    route_m = re.match(r'@app\.(get|post|put|delete|patch)\(\s*["\']([^"\']+)["\']', line.strip())
    if route_m:
        current_route = (route_m.group(1).upper(), route_m.group(2))
        continue
    if current_route and "def " in line:
        # Check this line and subsequent lines for Query(
        func_def = ""
        j = i
        while j < len(lines) and "):" not in func_def and not func_def.endswith("):"):
            func_def += " " + lines[j].strip()
            if "):" in lines[j] or ") ->" in lines[j]:
                break
            j += 1
        
        if "Query(" in func_def:
            q_params = re.findall(r'([a-zA-Z0-9_]+)\s*:[^=,]+\s*=\s*Query\(([^)]*)\)', func_def)
            query_endpoints.append({
                'method': current_route[0],
                'path': current_route[1],
                'func_def': func_def,
                'q_params': q_params
            })
        current_route = None


print(f"Total backend endpoints with Query(...) params: {len(query_endpoints)}")
for qe in query_endpoints:
    print(f"\n{qe['method']:6} {qe['path']}")
    for pname, qdef in qe['q_params']:
        is_required = "..." in qdef
        print(f"   - {pname}: required={is_required} ({qdef.strip()[:40]})")

