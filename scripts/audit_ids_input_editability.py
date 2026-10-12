import os
import re

ids_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src\components\ids"

files = [f for f in os.listdir(ids_dir) if f.endswith(('.jsx', '.js'))]
print(f"Scanning {len(files)} files in {ids_dir}...")

dummy_onchange_inputs = []
no_onchange_controlled = []
readonly_inputs = []
disabled_inputs = []

for filename in sorted(files):
    filepath = os.path.join(ids_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all <input ... />
    input_matches = re.finditer(r'<input\b([\s\S]*?)(?:/>|>)', content)
    for m in input_matches:
        tag_str = m.group(0)
        attrs = m.group(1)
        line_no = content[:m.start()].count('\n') + 1
        
        # Check type
        type_m = re.search(r'type=["\']([^"\']+)["\']', attrs)
        input_type = type_m.group(1) if type_m else 'text'
        if input_type in ['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset']:
            continue
        
        # Check value
        has_value = bool(re.search(r'\bvalue=\{', attrs) or re.search(r'\bvalue="', attrs))
        has_default_val = bool(re.search(r'\bdefaultValue=', attrs))
        has_onchange = bool(re.search(r'\bonChange=', attrs))
        is_readonly = bool(re.search(r'\breadOnly\b', attrs))
        is_disabled = bool(re.search(r'\bdisabled\b', attrs))
        
        # Check if onChange is a dummy empty arrow function like () => {} or (e) => {}
        is_dummy_onchange = bool(re.search(r'onChange=\{\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>\s*\{\s*\}\s*\}', attrs))
        
        if is_dummy_onchange and not is_readonly and not is_disabled:
            dummy_onchange_inputs.append({
                'file': filename,
                'line': line_no,
                'tag': tag_str[:120],
                'attrs': attrs
            })
        
        if has_value and not has_onchange and not is_readonly and not is_disabled:
            no_onchange_controlled.append({
                'file': filename,
                'line': line_no,
                'tag': tag_str[:120]
            })
            
        if is_readonly:
            # Check if this input has a name or placeholder or label suggesting it should be editable
            readonly_inputs.append({
                'file': filename,
                'line': line_no,
                'tag': tag_str[:120]
            })

print(f"\n1. Inputs with DUMMY onChange () => {{}} (cursor shows, but typing does nothing!): {len(dummy_onchange_inputs)}")
for d in dummy_onchange_inputs:
    print(f"   {d['file']}:{d['line']} -> {d['tag']}")

print(f"\n2. Controlled inputs with NO onChange (React freeze!): {len(no_onchange_controlled)}")
for n in no_onchange_controlled[:10]:
    print(f"   {n['file']}:{n['line']} -> {n['tag']}")
if len(no_onchange_controlled) > 10:
    print(f"   ... and {len(no_onchange_controlled) - 10} more")

print(f"\n3. Total inputs marked readOnly: {len(readonly_inputs)}")
for r in readonly_inputs[:10]:
    print(f"   {r['file']}:{r['line']} -> {r['tag']}")
if len(readonly_inputs) > 10:
    print(f"   ... and {len(readonly_inputs) - 10} more")
