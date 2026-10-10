const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const dir = path.join(__dirname, '..', 'src', 'components', 'ids');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const GLOBALS = new Set([
  'window', 'document', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'alert', 'prompt', 'confirm', 'Math', 'Date', 'Number', 'String', 'Boolean', 'Array', 'Object',
  'RegExp', 'JSON', 'parseFloat', 'parseInt', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
  'fetch', 'localStorage', 'sessionStorage', 'navigator', 'location', 'history', 'URL', 'Event',
  'Blob', 'File', 'FormData', 'FileReader', 'Set', 'Map', 'WeakMap', 'WeakSet', 'Promise', 'Error',
  'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'Intl', 'requestAnimationFrame', 'cancelAnimationFrame',
  'undefined', 'NaN', 'Infinity', 'React'
]);

let totalIssues = 0;

files.forEach(file => {
  const filePath = path.join(dir, file);
  const code = fs.readFileSync(filePath, 'utf8');

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    const fileIssues = [];

    traverse(ast, {
      ReferencedIdentifier(p) {
        const name = p.node.name;
        if (GLOBALS.has(name)) return;
        
        // Ignore JSX element names if they could be global or standard
        if (p.parentPath.isJSXOpeningElement() && p.key === 'name') {
          // If lowercase, it's HTML tag
          if (/^[a-z]/.test(name)) return;
        }

        // Check if binding exists in current scope chain
        if (!p.scope.hasBinding(name)) {
          fileIssues.push({
            name,
            line: p.node.loc ? p.node.loc.start.line : 'unknown'
          });
        }
      }
    });

    if (fileIssues.length > 0) {
      console.log(`\n[!] ${file}: ${fileIssues.length} undeclared reference(s):`);
      fileIssues.forEach(iss => {
        console.log(`    Line ${iss.line}: ${iss.name}`);
        totalIssues++;
      });
    }
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
});

console.log(`\nScan complete. Total undeclared references: ${totalIssues}`);
