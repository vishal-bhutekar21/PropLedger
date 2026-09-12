const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');
const lines = raw.split(/\r?\n/);

console.log('=== HERO BADGE (L620-L650) ===');
lines.slice(620, 650).forEach((l, i) => console.log(`L${621+i}: ${l}`));

console.log('=== FAQ CONTAINER (L1280-L1340) ===');
lines.slice(1280, 1340).forEach((l, i) => console.log(`L${1281+i}: ${l}`));

console.log('=== FOOTER (L1580-L1650) ===');
lines.slice(1580, 1650).forEach((l, i) => console.log(`L${1581+i}: ${l}`));
