import os
import re

src_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src"

dummy_inputs = []

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.jsx', '.js')):
            fpath = os.path.join(root, f)
            relpath = os.path.relpath(fpath, src_dir)
            with open(fpath, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            for line_idx, line in enumerate(lines):
                if '<input' in line or '<textarea' in line:
                    # gather tag snippet
                    snippet = line
                    k = line_idx + 1
                    while k < len(lines) and '/>' not in snippet and '>' not in snippet and k < line_idx + 20:
                        snippet += lines[k]
                        k += 1
                    
                    # Check if it has onChange={() => {}} or onChange={(e) => {}}
                    if re.search(r'onChange=\{\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>\s*\{\s*\}\s*\}', snippet):
                        # check if it is readOnly
                        if 'readOnly' not in snippet and 'disabled' not in snippet:
                            dummy_inputs.append({
                                'file': relpath,
                                'line': line_idx + 1,
                                'snippet': snippet.strip()
                            })

print(f"Total inputs with dummy onChange and NOT readOnly: {len(dummy_inputs)}")
for item in dummy_inputs:
    print(f"\n{item['file']}:{item['line']}")
    print(f"  {item['snippet'][:150]}")

