const fs = require('fs');
const lines = fs.readFileSync('cloudflare/propledger-worker.js', 'utf8').split('\n');

const anchors = [
  'id="dual-experience"',
  'id="unit-gallery"',
  'id="faq"',
  'id="security"',
  'id="paymentModal"',
  'id="tourModal"',
  'id="maintenanceModal"',
  '<script>'
];

anchors.forEach(a => {
  const idx = lines.findIndex(l => l.includes(a));
  console.log(a, '-> line:', idx + 1);
});
