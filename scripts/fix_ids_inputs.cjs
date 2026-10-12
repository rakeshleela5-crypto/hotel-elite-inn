/**
 * Batch fix script: adds onChange={() => {}} to all className="ids-input" inputs
 * that have no onChange handler and are not disabled/readOnly.
 * Uses AST-safe string replacement with multi-line window.
 */
const fs = require('fs');
const path = require('path');

const IDS_DIR = path.join(__dirname, '..', 'src', 'components', 'ids');
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(IDS_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  // Pattern: self-closing <input ... className="ids-input" ... /> with NO onChange, readOnly, or disabled
  // We'll use a multiline regex to match the full input tag
  let changed = 0;

  // Fix 1: single-line inputs with defaultValue but no onChange
  // e.g.: <input className="ids-input" style={...} defaultValue="" />
  // Replace with: add onChange={() => {}}
  content = content.replace(
    /(<input\b(?![\s\S]{0,500}?onChange)(?![\s\S]{0,500}?readOnly)(?![\s\S]{0,500}?disabled)[^>]*\bclassName="ids-input"[^>]*\bdefaultValue="[^"]*"[^>]*)(\s*\/>)/g,
    (match, before, end) => {
      changed++;
      return `${before} onChange={() => {}}${end}`;
    }
  );

  // Fix 2: Multi-line inputs: className="ids-input" on its own line, no onChange
  // Pattern: <input\n...className="ids-input"\n...no onChange .../> 
  // We need to inject onChange before />
  // This handles the multi-line case like:
  //   <input
  //     className="ids-input"
  //     style={...}
  //   />
  content = content.replace(
    /(<input\b)((?:[^>](?!onChange|readOnly|disabled))*?)(\n\s*)(className="ids-input")((?:[^>](?!onChange|readOnly|disabled))*?)(\n\s*\/>)/gs,
    (match, open, before, nl1, cls, after, close) => {
      // Only if there's no onChange, readOnly, disabled anywhere in the match
      if (match.includes('onChange') || match.includes('readOnly') || match.includes('disabled')) {
        return match;
      }
      changed++;
      return `${open}${before}${nl1}${cls}${after}${nl1.replace(/\n/, '\n')}  onChange={() => {}}${close}`;
    }
  );

  if (changed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}: ${changed} inputs`);
    totalFixed += changed;
  }
}

console.log(`\nTotal inputs fixed: ${totalFixed}`);
