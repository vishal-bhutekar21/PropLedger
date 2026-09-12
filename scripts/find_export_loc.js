const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');
const lines = raw.split(/\r?\n/);

lines.forEach((l, i) => {
  if (l.includes('exportRentRollCsv') || l.includes('String.fromCharCode(10)')) {
    console.log(`L${i+1}: ${l}`);
  }
});
