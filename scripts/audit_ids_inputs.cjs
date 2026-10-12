const fs = require('fs');
const path = require('path');

const IDS_DIR = path.join(__dirname, '..', 'src', 'components', 'ids');

// Get all jsx files
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

console.log(`Scanning ${files.length} IDS modal files for readonly/unclickable inputs...\n`);

let totalReadOnly = 0;
let totalNoOnChange = 0;
const findings = [];

for (const file of files) {
  const filePath = path.join(IDS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let fileReadOnlyCount = 0;
  let fileNoOnChangeCount = 0;
  const fileFindings = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Check for readOnly inputs (except ones that SHOULD be read only like system-generated IDs)
    if (line.includes('readOnly') && (line.includes('ids-input') || line.includes('<input'))) {
      // Skip truly system fields
      if (!line.includes('booking_reference') && !line.includes('receipt_number') && !line.includes('tracking_no')) {
        fileReadOnlyCount++;
        fileFindings.push({ line: lineNum, type: 'readOnly', content: line.trim().substring(0, 120) });
      }
    }
    
    // Check for input fields with static values and no onChange
    if ((line.includes('className="ids-input"') || line.includes("className='ids-input'")) 
        && !line.includes('onChange') && !line.includes('readOnly') && !line.includes('disabled')) {
      // Look ahead 5 lines for an onChange
      let hasOnChange = false;
      for (let j = i; j < Math.min(i + 8, lines.length); j++) {
        if (lines[j].includes('onChange')) { hasOnChange = true; break; }
        if (lines[j].includes('/>') || lines[j].includes('</input>')) break;
      }
      if (!hasOnChange) {
        fileNoOnChangeCount++;
        fileFindings.push({ line: lineNum, type: 'no-onChange', content: line.trim().substring(0, 120) });
      }
    }
  }
  
  if (fileFindings.length > 0) {
    totalReadOnly += fileReadOnlyCount;
    totalNoOnChange += fileNoOnChangeCount;
    findings.push({ file, readOnly: fileReadOnlyCount, noOnChange: fileNoOnChangeCount, items: fileFindings });
  }
}

console.log('=== SUMMARY ===');
console.log(`Total readOnly inputs: ${totalReadOnly}`);
console.log(`Total inputs missing onChange: ${totalNoOnChange}`);
console.log(`Files with issues: ${findings.length}/${files.length}\n`);

for (const f of findings) {
  console.log(`\n--- ${f.file} (readOnly: ${f.readOnly}, no-onChange: ${f.noOnChange}) ---`);
  for (const item of f.items.slice(0, 10)) {
    console.log(`  L${item.line} [${item.type}]: ${item.content}`);
  }
  if (f.items.length > 10) console.log(`  ... and ${f.items.length - 10} more`);
}
