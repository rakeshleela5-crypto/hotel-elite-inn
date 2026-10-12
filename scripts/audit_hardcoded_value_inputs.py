import os
import re

src_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src"

hardcoded_inputs = []

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.jsx', '.js')):
            fpath = os.path.join(root, f)
            relpath = os.path.relpath(fpath, src_dir)
            with open(fpath, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            for line_idx, line in enumerate(lines):
                if '<input' in line:
                    snippet = line
                    k = line_idx + 1
                    while k < len(lines) and '/>' not in snippet and '>' not in snippet and k < line_idx + 15:
                        snippet += lines[k]
                        k += 1
                    
                    # Check for value="some literal string"
                    # But exclude type="checkbox", type="radio", type="button", type="submit", type="hidden"
                    type_m = re.search(r'type=["\']([^"\']+)["\']', snippet)
                    itype = type_m.group(1) if type_m else 'text'
                    if itype in ['checkbox', 'radio', 'button', 'submit', 'reset', 'hidden', 'color']:
                        continue
                    
                    val_match = re.search(r'\bvalue="([^"]*)"', snippet)
                    if val_match:
                        is_readonly = 'readOnly' in snippet or 'readonly' in snippet
                        is_disabled = 'disabled' in snippet
                        hardcoded_inputs.append({
                            'file': relpath,
                            'line': line_idx + 1,
                            'val': val_match.group(1),
                            'is_readonly': is_readonly,
                            'is_disabled': is_disabled,
                            'snippet': snippet.strip()
                        })

print(f"Total inputs with hardcoded value=\"...\": {len(hardcoded_inputs)}")
not_readonly = [h for h in hardcoded_inputs if not h['is_readonly'] and not h['is_disabled']]
print(f"Of which NOT marked readOnly or disabled (FROZEN INPUTS!): {len(not_readonly)}")
for item in not_readonly:
    print(f"\n{item['file']}:{item['line']} (val=\"{item['val']}\")")
    print(f"  {item['snippet'][:150]}")
