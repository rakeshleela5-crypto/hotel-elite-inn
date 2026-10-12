import re

filepath = r"c:\Users\rakes\.gemini\antigravity-ide\scratch\hotel-elite-inn\src\components\ids\IdsWalkInModal.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse JSX tags properly
lines = content.split('\n')
for i, line in enumerate(lines):
    if '<input' in line:
        # Grab next 15 lines
        snippet = '\n'.join(lines[i:min(len(lines), i+15)])
        end_idx = snippet.find('/>')
        if end_idx == -1:
            end_idx = snippet.find('>')
        tag = snippet[:end_idx+2] if end_idx != -1 else snippet[:150]
        print(f"Line {i+1}:")
        print(f"  {tag.strip()}\n")
