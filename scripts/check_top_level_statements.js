const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

const start = raw.indexOf('function renderHomePage');
const end = raw.indexOf('function renderAdminPage');
const homeCode = raw.substring(start, end);

const scriptMatch = homeCode.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  const code = scriptMatch[1];
  const lines = code.split('\n');
  let inFunction = 0;
  lines.forEach((l, idx) => {
    const trimmed = l.trim();
    if (trimmed.includes('{')) inFunction += (trimmed.match(/{/g) || []).length;
    if (inFunction === 0 && trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
      console.log(`Top-level L${idx+1}: ${trimmed}`);
    }
    if (trimmed.includes('}')) inFunction -= (trimmed.match(/}/g) || []).length;
  });
}
