import os
import re

backend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn-backend-api"
frontend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src"

models_py = os.path.join(backend_dir, "models.py")
schemas_py = os.path.join(backend_dir, "schemas.py")
backend_api_js = os.path.join(frontend_dir, "utils", "backendApi.js")

with open(models_py, "r", encoding="utf-8") as f:
    models_code = f.read()

with open(schemas_py, "r", encoding="utf-8") as f:
    schemas_code = f.read()

with open(backend_api_js, "r", encoding="utf-8") as f:
    fe_code = f.read()

# Check all POST/PUT/PATCH fetch payloads in backendApi.js
# Match body: JSON.stringify(...)
payloads = re.findall(r'export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)[\s\S]*?body:\s*JSON\.stringify\(([^)]+)\)', fe_code)

print(f"Found {len(payloads)} functions sending JSON bodies in backendApi.js")
for func, body_arg in payloads:
    body_var = body_arg.strip()
    func_match = re.search(r'export\s+(?:async\s+)?function\s+' + func + r'[\s\S]*?(?=\nexport|\Z)', fe_code)
    if func_match:
        ftext = func_match.group(0)
        # Look for object definition: const payload = { ... };
        var_match = re.search(r'(?:const|let)\s+' + re.escape(body_var) + r'\s*=\s*\{([\s\S]*?)\};\s*(?:const|let|var|try|fetch|\$)', ftext)
        if var_match:
            block = var_match.group(1)
            # Find top-level property keys
            keys = re.findall(r'^\s*([a-zA-Z0-9_]+)\s*:', block, re.MULTILINE)
            print(f"Function {func}(): {len(keys)} keys -> {', '.join(keys)}")
        else:
            # Maybe body_var is an argument passed directly (e.g. orderData, itemData)
            print(f"Function {func}(): receives argument '{body_var}' directly")

