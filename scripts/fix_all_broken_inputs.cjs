/**
 * Final comprehensive fixer: scans all JSX files for input tags that are syntactically
 * broken (missing closing />) due to prior regex scripts.
 * 
 * Patterns detected:
 * 1. Single-line: <input ... defaultValue="..." (no closing />)
 * 2. Inline combined: <td><input ... defaultValue="..." (no closing />) </td>
 */
const fs = require('fs');
const path = require('path');
const IDS_DIR = path.join(__dirname, '..', 'src', 'components', 'ids');
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(IDS_DIR, file);
  const original = fs.readFileSync(filePath, 'utf8');

  // Pattern: an <input ...> tag that has no /> before the next < tag
  // Use a regex that finds input tags NOT properly closed with />
  // Match: <input (anything without >) where no /> before the next tag-open <
  let content = original;
  let changed = 0;

  // Fix inline single-line pattern: input ends with some prop " </ or " < or " />< — missing />
  // e.g. <td><input className="ids-input" style={{...}} defaultValue="" <td>
  // Fix by inserting onChange={() => {}} /> before the next tag
  content = content.replace(
    /(<input\b[^>]*\bclassName="ids-input"[^>]*\bdefaultValue="[^"]*")\s*(<[^/])/g,
    (match, inputPart, nextTag) => {
      // Only fix if inputPart doesn't already have />
      if (inputPart.trimEnd().endsWith('/>')) return match;
      changed++;
      return `${inputPart} onChange={() => {}} />${nextTag.startsWith('\n') ? nextTag : '\n' + nextTag}`;
    }
  );

  // Also fix: input ends with style={{...}} and no closing />
  content = content.replace(
    /(<input\b[^>]*\bclassName="ids-input"[^>]*)\s+(<[^/!])/g,
    (match, inputPart, nextTag) => {
      // Only fix if inputPart is actually an unclosed input (has < props but no />)
      if (inputPart.trimEnd().endsWith('/>')) return match;
      if (inputPart.trimEnd().endsWith('>')) return match;
      if (inputPart.includes('onChange') || inputPart.includes('readOnly') || inputPart.includes('disabled')) {
        // Still broken — add just the closing />
        changed++;
        return `${inputPart} />${nextTag.startsWith('\n') ? '' : '\n'}${nextTag}`;
      }
      return match;
    }
  );

  if (changed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}: ${changed} broken inputs`);
    totalFixed += changed;
  }
}

console.log(`\nTotal broken inputs fixed: ${totalFixed}`);
