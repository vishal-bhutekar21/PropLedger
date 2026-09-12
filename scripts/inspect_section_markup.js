const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

const sections = [
  'id="overview"',
  'id="why-it-matters"',
  'id="what-we-do"',
  'id="how-it-works"',
  'id="roi-calculator"',
  'id="security"',
  'id="concierge"'
];

sections.forEach(sec => {
  const idx = raw.indexOf(sec);
  if (idx !== -1) {
    const start = Math.max(0, idx - 80);
    const end = Math.min(raw.length, idx + 400);
    console.log(`=== SECTION: ${sec} ===`);
    console.log(raw.substring(start, end).replace(/\r?\n/g, '\n'));
  }
});
