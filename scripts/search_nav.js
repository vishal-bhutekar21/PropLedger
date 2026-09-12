const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');
const lines = raw.split(/\r?\n/);

lines.forEach((line, idx) => {
  if (line.includes('mobileMenu') || line.includes('hamburger') || line.includes('toggleMobile') || line.includes('drawer')) {
    console.log(`L${idx + 1}: ${line.trim().substring(0, 100)}`);
  }
});
