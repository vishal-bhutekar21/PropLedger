const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');
const lines = raw.split(/\r?\n/);

lines.forEach((l, i) => {
  if (l.includes('id="faq"') || (l.includes('FAQ') && l.includes('section'))) {
    console.log(`L${i+1}: ${l}`);
  }
});
