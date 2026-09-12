const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');

// Replace the multiline join or any broken join
const regex = /rows\.map\(e => e\.join\(','\)\)\.join\([^)]*\)/g;
raw = raw.replace(regex, "rows.map(e => e.join(',')).join(String.fromCharCode(10))");

fs.writeFileSync(targetPath, raw, 'utf8');
console.log('Fixed CSV newline syntax error!');
