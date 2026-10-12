/**
 * Fix all inputs broken by phase2 regex — any input ending with defaultValue="..." 
 * but missing the closing />
 */
const fs = require('fs');
const path = require('path');
const IDS_DIR = path.join(__dirname, '..', 'src', 'components', 'ids');
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(IDS_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  let changed = 0;
  const fixed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Detect lines that are an unclosed input tag (ends with defaultValue="..." or similar but no />)
    // Pattern: line contains 'className="ids-input"' or starts an input, ends with a prop value but no /> 
    if (
      line.includes('className="ids-input"') &&
      !line.trim().endsWith('/>') &&
      !line.trim().endsWith('>') &&
      !line.includes('onChange') &&
      !line.includes('readOnly') &&
      !line.includes('disabled')
    ) {
      // Check if next non-empty line starts with < (which means it's a new element — our input has no />)
      let nextMeaningfulLine = '';
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const trimmed = lines[j].trim();
        if (trimmed.length > 0) { nextMeaningfulLine = trimmed; break; }
      }
      if (nextMeaningfulLine.startsWith('<') && !nextMeaningfulLine.startsWith('<input')) {
        // This input line is missing its />
        fixed.push(line + ' onChange={() => {}} />');
        changed++;
        console.log(`${file} L${i+1}: fixed unclosed input`);
        continue;
      }
    }
    fixed.push(line);
  }

  if (changed > 0) {
    fs.writeFileSync(filePath, fixed.join('\n'), 'utf8');
    totalFixed += changed;
  }
}

console.log(`\nTotal unclosed inputs fixed: ${totalFixed}`);
