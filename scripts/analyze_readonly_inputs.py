import os
import re

ids_dir = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src\components\ids"
files = [f for f in os.listdir(ids_dir) if f.endswith('.jsx')]

potential_editable_fields = []

# Keywords that indicate a field that users usually TYPE into
keywords = [
    'name', 'phone', 'mobile', 'email', 'address', 'company', 'remarks', 'note',
    'id', 'proof', 'vehicle', 'pax', 'guest', 'amount', 'rate', 'discount',
    'user', 'staff', 'pin', 'reason', 'purpose', 'from', 'to', 'city', 'state',
    'voucher', 'cheque', 'reference', 'ref', 'card', 'bill', 'receipt', 'date',
    'time', 'desc', 'description', 'title', 'instruction', 'special'
]

for filename in sorted(files):
    filepath = os.path.join(ids_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if 'readOnly' in line or 'readonly' in line:
            # Look at 5 lines before and 5 lines after
            start_l = max(0, i - 4)
            end_l = min(len(lines), i + 5)
            context = "".join(lines[start_l:end_l])
            
            # Extract input tag
            inp_match = re.search(r'<input\b([\s\S]*?)(?:/>|>)', context)
            if inp_match:
                tag = inp_match.group(0)
                # Check if it has an id, name, or preceding label
                label_m = re.findall(r'<label[^>]*>([^<]+)</label>|<span[^>]*>([^<]+)</span>', context)
                labels = [l[0] or l[1] for l in label_m if (l[0] or l[1])]
                
                # Check if context contains any of our keywords
                matched_kw = [kw for kw in keywords if kw in context.lower()]
                if matched_kw:
                    potential_editable_fields.append({
                        'file': filename,
                        'line': i + 1,
                        'tag': tag.strip().replace('\n', ' '),
                        'labels': labels,
                        'kw': matched_kw[:4]
                    })

print(f"Total readOnly inputs found with data/form keywords: {len(potential_editable_fields)}")
# Group by file
by_file = {}
for p in potential_editable_fields:
    fn = p['file']
    if fn not in by_file:
        by_file[fn] = []
    by_file[fn].append(p)

for fn, items in sorted(by_file.items()):
    print(f"\n{fn} ({len(items)} inputs):")
    for it in items[:5]:
        lbl_str = ", ".join(it['labels'][:2]) if it['labels'] else "no label"
        print(f"  Line {it['line']} [{lbl_str}] -> {it['tag'][:90]}")
    if len(items) > 5:
        print(f"  ... and {len(items)-5} more")
