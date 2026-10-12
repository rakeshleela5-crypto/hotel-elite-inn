import re
import os

backend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn-backend-api"
main_py = os.path.join(backend_dir, "main.py")

with open(main_py, "r", encoding="utf-8") as f:
    content = f.read()

endpoints = re.findall(r'@app\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]', content)
print(f"Total endpoints found in main.py: {len(endpoints)}")

endpoints_set = set()
for method, path in sorted(endpoints, key=lambda x: (x[1], x[0])):
    print(f"{method.upper():6} {path}")
    endpoints_set.add((method.upper(), path))

# Now let's scan all routers or other files in backend
for root, dirs, files in os.walk(backend_dir):
    for file in files:
        if file.endswith(".py") and file != "main.py" and not "venv" in root and not ".git" in root:
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                c = f.read()
                routers = re.findall(r'@(?:router|app)\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]', c)
                if routers:
                    print(f"\nIn {file}:")
                    for m, p in routers:
                        print(f"  {m.upper():6} {p}")
