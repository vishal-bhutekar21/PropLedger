const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const content = fs.readFileSync(targetPath, 'utf8');

const lines = content.split(/\r?\n/);
lines.forEach((line, idx) => {
  if (line.includes('<section') || line.includes('function render') || line.includes('id="toastContainer"') || line.includes('id="addUnitModal"')) {
    console.log(`L${idx + 1}: ${line.trim().substring(0, 100)}`);
  }
});
