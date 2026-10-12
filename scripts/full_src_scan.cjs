/**
 * Broad scan: finds controlled inputs (value= prop) missing onChange
 * across the ENTIRE src directory, not just IDS modals.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

function scanDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...scanDir(full));
    else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) results.push(full);
  }
  return results;
}

const files = scanDir(SRC_DIR);
let totalBroken = 0;
let totalControlledMissingOnChange = 0;
const fileIssues = {};

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(SRC_DIR, filePath);

  // Find unclosed input tags
  const unclosed = (content.match(/<input\b[^>]*className="ids-input"[^>]*(?<!\/)(?=\s*<\/)/g) || []);
  if (unclosed.length > 0) {
    if (!fileIssues[rel]) fileIssues[rel] = [];
    fileIssues[rel].push(...unclosed.map(u => `UNCLOSED: ${u.substring(0, 80)}`));
    totalBroken += unclosed.length;
  }

  // AST-safe: find controlled inputs (value=) without onChange or readOnly/disabled
  let i = 0;
  while (i < content.length) {
    const idx = content.indexOf('<input', i);
    if (idx === -1) break;

    // Find closing />
    let braceDepth = 0;
    let inStr = false, strChar = '';
    let j = idx + 6;
    let tagEnd = -1;
    while (j < content.length && j < idx + 2000) {
      const ch = content[j];
      if (inStr) {
        if (ch === strChar && content[j-1] !== '\\') inStr = false;
      } else if (ch === '"' || ch === "'") {
        inStr = true; strChar = ch;
      } else if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
      else if (!inStr && braceDepth === 0 && ch === '/' && content[j+1] === '>') {
        tagEnd = j + 2; break;
      } else if (!inStr && braceDepth === 0 && ch === '>' && content[j-1] !== '/') {
        tagEnd = j + 1; break;
      }
      j++;
    }
    if (tagEnd === -1) { i = idx + 6; continue; }
    
    const tag = content.substring(idx, tagEnd);
    if (
      (tag.includes('className="ids-input"') || tag.includes("className='ids-input'")) &&
      tag.includes('value=') &&
      !tag.includes('defaultValue=') &&
      !tag.includes('onChange') &&
      !tag.includes('readOnly') &&
      !tag.includes('disabled')
    ) {
      const lineNo = content.substring(0, idx).split('\n').length;
      if (!fileIssues[rel]) fileIssues[rel] = [];
      fileIssues[rel].push(`L${lineNo} CONTROLLED-NO-HANDLER: ${tag.replace(/\s+/g, ' ').substring(0, 100)}`);
      totalControlledMissingOnChange++;
    }
    i = tagEnd;
  }
}

console.log('=== FULL SOURCE DEEP SCAN ===\n');
console.log(`Unclosed input tags: ${totalBroken}`);
console.log(`Controlled inputs missing onChange: ${totalControlledMissingOnChange}`);
console.log(`Files with issues: ${Object.keys(fileIssues).length}\n`);

for (const [file, issues] of Object.entries(fileIssues)) {
  console.log(`--- ${file} ---`);
  for (const issue of issues) console.log(`  ${issue}`);
}
if (Object.keys(fileIssues).length === 0) {
  console.log('✅ No issues found across entire src/ directory.');
}
