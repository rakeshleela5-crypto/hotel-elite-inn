import os
import re

frontend_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src"

api_calls = []

# Regex patterns for API calls or endpoints
patterns = [
    re.compile(r'fastApiFetch\(\s*[`\'"]([^`\'"]+)[`\'"]', re.IGNORECASE),
    re.compile(r'fetch\(\s*[`\'"]([^`\'"]+)[`\'"]', re.IGNORECASE),
    re.compile(r'fetchWithAuth\(\s*[`\'"]([^`\'"]+)[`\'"]', re.IGNORECASE),
    re.compile(r'apiClient\.(?:get|post|put|delete|patch)\(\s*[`\'"]([^`\'"]+)[`\'"]', re.IGNORECASE),
    re.compile(r'[`\'"](/api/[^`\'"]+)[`\'"]', re.IGNORECASE),
    re.compile(r'FASTAPI_URL\s*\+\s*[`\'"]([^`\'"]+)[`\'"]', re.IGNORECASE),
    re.compile(r'\${FASTAPI_URL}([^`\'"]+)', re.IGNORECASE),
    re.compile(r'\${FASTAPI_BASE_URL}([^`\'"]+)', re.IGNORECASE),
    re.compile(r'\${BASE_URL}([^`\'"]+)', re.IGNORECASE),
    re.compile(r'\${API_BASE_URL}([^`\'"]+)', re.IGNORECASE),
    re.compile(r'endpoint\s*=\s*[`\'"]([^`\'"]+)[`\'"]', re.IGNORECASE),
]

results = []

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath, frontend_dir)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for line_idx, line in enumerate(lines):
                    for pat in patterns:
                        matches = pat.findall(line)
                        for m in matches:
                            results.append({
                                'file': relpath,
                                'line': line_idx + 1,
                                'match': m.strip(),
                                'raw': line.strip()
                            })

print(f"Total API references found in frontend: {len(results)}")
# Deduplicate by endpoint pattern
unique_endpoints = {}
for r in results:
    m = r['match']
    # Clean up template literal syntax like ${id}
    clean = re.sub(r'\$\{[^}]+\}', '{param}', m)
    if clean not in unique_endpoints:
        unique_endpoints[clean] = []
    unique_endpoints[clean].append(f"{r['file']}:{r['line']}")

for ep, files in sorted(unique_endpoints.items()):
    print(f"\n{ep} ({len(files)} occurrences):")
    for f in files[:3]:
        print(f"   {f}")
    if len(files) > 3:
        print(f"   ... and {len(files) - 3} more")
