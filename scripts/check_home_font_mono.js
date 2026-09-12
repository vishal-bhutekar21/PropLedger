const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

const start = raw.indexOf('function renderHomePage');
const end = raw.indexOf('function renderAdminPage');
const homeHtml = raw.substring(start, end);

const lines = homeHtml.split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes('font-mono')) {
    console.log(`L${i+1}: ${l.trim().substring(0, 100)}`);
  }
});
