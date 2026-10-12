const fs = require('fs');
const c = fs.readFileSync('src/utils/backendApi.js', 'utf8');
const lines = c.split('\n');
const targets = ['restaurant/tables', "'/api/corporate`", '/api/defects', '/void-item', '/merge-tables', '/api/night-audit/rollover', 'laundry/orders$'];
for (const t of targets) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(t)) console.log('L' + (i+1) + ': ' + lines[i].trim().substring(0, 140));
  }
}
