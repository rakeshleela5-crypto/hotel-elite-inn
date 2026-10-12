const fs = require('fs');
const path = require('path');
const IDS_DIR = path.join('src', 'components', 'ids');
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

const CLS = 'className="ids-input"';

for (const file of files) {
  const content = fs.readFileSync(path.join(IDS_DIR, file), 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(CLS)) {
      const start = Math.max(0, i - 3);
      const end = Math.min(lines.length - 1, i + 6);
      const window = lines.slice(start, end + 1).join('\n');
      if (!window.includes('onChange') && !window.includes('readOnly') && !window.includes('disabled')) {
        let hasValue = false;
        for (let j = start; j <= end; j++) {
          if (lines[j].includes('value=') || lines[j].includes('defaultValue=')) {
            hasValue = true;
            break;
          }
        }
        if (hasValue) {
          console.log(file + ' L' + (i+1) + ': ' + lines[i].trim());
        }
      }
    }
  }
}
