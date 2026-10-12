/**
 * Deep recheck script — comprehensive audit of:
 * 1. Genuinely broken inputs: multi-line inputs with value= but NO readOnly AND NO onChange
 * 2. FastAPI endpoint URL final check
 * 3. JSX syntax validation (unclosed input tags)
 * 4. Backend schema vs frontend field map
 */
const fs = require('fs');
const path = require('path');

const IDS_DIR = path.join(__dirname, '..', 'src', 'components', 'ids');
const files = fs.readdirSync(IDS_DIR).filter(f => f.endsWith('.jsx'));

let genuineMissing = [];
let brokenJsx = [];

console.log('=== DEEP RECHECK: IDS Modal Input Fields ===\n');

for (const file of files) {
  const filePath = path.join(IDS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check 1: Find truly unclosed input tags (no closing />)
  // Pattern: <input ... className="ids-input" ... (not ending with />) directly followed by </
  const unclosedPattern = /<input\b[^>]*className="ids-input"[^>]*(?<!\/)\s*(?=<\/)/g;
  let m;
  while ((m = unclosedPattern.exec(content)) !== null) {
    const lineNo = content.substring(0, m.index).split('\n').length;
    brokenJsx.push({ file, line: lineNo, snippet: m[0].substring(0, 80) });
  }

  // Check 2: Find multi-line input blocks with value= but NEITHER onChange NOR readOnly NOR disabled
  // Extract all input blocks using a state machine
  let i = 0;
  while (i < content.length) {
    const inputIdx = content.indexOf('<input', i);
    if (inputIdx === -1) break;

    // Find the end of this input tag (the first /> not inside a string)
    let depth = 0;
    let inStr = false;
    let strChar = '';
    let braceDepth = 0;
    let j = inputIdx + 6; // skip '<input'
    let tagEnd = -1;

    while (j < content.length) {
      const ch = content[j];
      if (inStr) {
        if (ch === strChar && content[j-1] !== '\\') inStr = false;
      } else if (ch === '"' || ch === "'") {
        inStr = true; strChar = ch;
      } else if (ch === '{') {
        braceDepth++;
      } else if (ch === '}') {
        braceDepth--;
      } else if (braceDepth === 0 && ch === '/' && content[j+1] === '>') {
        tagEnd = j + 2;
        break;
      } else if (braceDepth === 0 && ch === '>' && content[j-1] !== '/') {
        tagEnd = j + 1; // self-closed without /
        break;
      }
      j++;
    }

    if (tagEnd === -1) { i = inputIdx + 6; continue; }

    const tagContent = content.substring(inputIdx, tagEnd);

    // Only check ids-input
    if (tagContent.includes('className="ids-input"') || tagContent.includes("className='ids-input'")) {
      const hasOnChange = tagContent.includes('onChange');
      const hasReadOnly = tagContent.includes('readOnly');
      const hasDisabled = tagContent.includes('disabled');
      const hasValue = tagContent.includes('value=') && !tagContent.includes('defaultValue=');
      const hasDefaultValue = tagContent.includes('defaultValue=');

      // Genuine issue: has value= (controlled), no onChange, no readOnly, no disabled
      if (hasValue && !hasOnChange && !hasReadOnly && !hasDisabled) {
        const lineNo = content.substring(0, inputIdx).split('\n').length;
        genuineMissing.push({
          file, line: lineNo,
          snippet: tagContent.replace(/\s+/g, ' ').substring(0, 100)
        });
      }
    }

    i = tagEnd;
  }
}

console.log(`Truly missing onChange (controlled inputs without handler): ${genuineMissing.length}`);
if (genuineMissing.length > 0) {
  for (const g of genuineMissing) {
    console.log(`  ${g.file} L${g.line}: ${g.snippet}`);
  }
}

console.log(`\nBroken JSX (unclosed input tags): ${brokenJsx.length}`);
if (brokenJsx.length > 0) {
  for (const b of brokenJsx) {
    console.log(`  ${b.file} L${b.line}: ${b.snippet}`);
  }
}

// === Check FastAPI endpoint URLs ===
console.log('\n=== DEEP RECHECK: FastAPI Endpoint URLs ===\n');
const apiFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'backendApi.js'), 'utf8');

const knownBadPatterns = [
  { bad: '/api/restaurant/tables', good: '/api/pos/tables' },
  { bad: "'/api/corporate`", good: '/api/corporate-accounts' },
  { bad: '/api/defects`', good: '/api/housekeeping/defects' },
  { bad: '/void-item`', good: '/items/${itemId}/void' },
  { bad: '/merge-tables`', good: '/pos/tables/merge' },
];

let urlIssues = 0;
for (const p of knownBadPatterns) {
  if (apiFile.includes(p.bad)) {
    console.log(`  STILL BROKEN: ${p.bad} → should be ${p.good}`);
    urlIssues++;
  }
}

// Check for any remaining old URL patterns
const lines = apiFile.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('FASTAPI_BASE_URL') && lines[i].includes('/api/')) {
    const match = lines[i].match(/`\$\{FASTAPI_BASE_URL\}([^`\s]+)`/);
    if (match) {
      const url = match[1];
      // Flag any obviously wrong paths
      if (url.startsWith('/api/corporate`') || url === '/api/defects`') {
        console.log(`  ISSUE at L${i+1}: ${url}`);
        urlIssues++;
      }
    }
  }
}

if (urlIssues === 0) console.log('  ✅ All previously flagged endpoint URLs are fixed.');

// === Check missing connector functions ===
console.log('\n=== DEEP RECHECK: Missing Connector Functions ===\n');
const expectedFunctions = [
  'adjustFastApiInventoryItem',
  'recordFastApiCorporatePayment',
  'resolveFastApiDefect',
  'updateFastApiGstFilingStatus',
  'rolloverFastApiNightAudit',
];
for (const fn of expectedFunctions) {
  if (apiFile.includes(`function ${fn}`)) {
    console.log(`  ✅ ${fn} - present`);
  } else {
    console.log(`  ❌ ${fn} - MISSING`);
  }
}

// === Check models.py has new columns ===
console.log('\n=== DEEP RECHECK: PostgreSQL booking columns ===\n');
const modelsFile = fs.readFileSync(
  path.join(__dirname, '..', '..', 'hotel-elite-inn-backend-api', 'models.py'), 'utf8'
);
const expectedCols = [
  'nationality', 'arrival_from', 'proceeding_to', 'identification_no',
  'company_name', 'rate_authorized_by', 'special_instructions',
  'guest_status', 'rate_amount', 'rate_option', 'rollover_status'
];
for (const col of expectedCols) {
  if (modelsFile.includes(`'${col}'`) || modelsFile.includes(`"${col}"`) || modelsFile.includes(col + ' =')) {
    console.log(`  ✅ ${col}`);
  } else {
    console.log(`  ❌ ${col} - MISSING from models.py`);
  }
}

console.log('\n=== DEEP RECHECK: Night-audit rollover endpoint in main.py ===\n');
const mainFile = fs.readFileSync(
  path.join(__dirname, '..', '..', 'hotel-elite-inn-backend-api', 'main.py'), 'utf8'
);
if (mainFile.includes('/api/night-audit/rollover')) {
  console.log('  ✅ POST /api/night-audit/rollover - present');
} else {
  console.log('  ❌ POST /api/night-audit/rollover - MISSING');
}

// Check the 4 missing backend endpoints
const backendEndpoints = [
  '/api/inventory/{item_id}/adjust',
  '/api/corporate-accounts/{company_id}/payment',
  '/api/housekeeping/defects/{defect_id}/resolve',
  '/api/gst/filings/{filing_id}/status',
];
for (const ep of backendEndpoints) {
  if (mainFile.includes(ep) || mainFile.includes(ep.replace('{item_id}','').replace('{company_id}','').replace('{defect_id}','').replace('{filing_id}',''))) {
    console.log(`  ✅ ${ep} - present`);
  } else {
    console.log(`  ⚠️  ${ep} - NOT in backend (frontend connector exists but backend endpoint missing)`);
  }
}

console.log('\n=== RECHECK COMPLETE ===');
