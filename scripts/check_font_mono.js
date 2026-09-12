const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const lines = fs.readFileSync(targetPath, 'utf8').split(/\r?\n/);

console.log('=== SAMPLES OF font-mono USAGES ===');
let count = 0;
lines.forEach((line, idx) => {
  if (line.includes('font-mono') && count < 25) {
    console.log(`L${idx + 1}: ${line.trim().substring(0, 100)}`);
    count++;
  }
});
