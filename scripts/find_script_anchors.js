const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');
const lines = raw.split(/\r?\n/);

console.log('=== SCRIPT ANCHORS IN HOME PAGE (around L1600-L2300) ===');
lines.forEach((line, idx) => {
  if (line.includes('<script') || (line.includes('function ') && idx < 2320 && idx > 1500) || line.includes('// ──')) {
    console.log(`L${idx + 1}: ${line.trim().substring(0, 80)}`);
  }
});
