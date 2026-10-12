/**
 * Phase 2 batch fix: handles multi-line <input className="ids-input"> blocks
 * that have a value= prop but no onChange.
 * Inserts onChange={() => {}} before the closing />
 */
const fs = require('fs');
const path = require('path');

const IDS_DIR = path.join(__dirname, '..', 'src', 'components', 'ids');
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(IDS_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');

  // Match multi-line input blocks:
  // <input
  //   ...className="ids-input"...
  //   ...value=...
  //   ... (no onChange, readOnly, disabled)
  // />
  const regex = /<input\b((?:[^>]|\n)*?)className="ids-input"((?:[^>]|\n)*?)\/>/g;
  
  let content = original;
  let changed = 0;

  content = content.replace(regex, (match, before, after) => {
    const full = before + after;
    // Skip if already has onChange, readOnly, or disabled
    if (full.includes('onChange') || full.includes('readOnly') || full.includes('disabled')) {
      return match;
    }
    // Only add onChange if there's a value= or defaultValue= prop
    if (!full.includes('value=') && !full.includes('defaultValue=')) {
      return match;
    }
    // Insert onChange={() => {}} before the closing />
    changed++;
    return `<input${before}className="ids-input"${after.replace(/(\s*)\/>$/, '$1onChange={() => {}}\n$1/>')}`;
  });

  if (changed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}: ${changed} inputs`);
    totalFixed += changed;
  }
}

console.log(`\nTotal phase-2 inputs fixed: ${totalFixed}`);
