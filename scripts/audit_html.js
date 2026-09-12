const fs = require('fs');
globalThis.RESEND_API_KEY = 'test';
globalThis.addEventListener = () => {};
const code = fs.readFileSync('cloudflare/propledger-worker.js', 'utf8');
eval(code);

const html = renderHomePage('propledger.vishalbhutekar.me');
const lines = html.split('\n');
const sensitive = [
  'vishal.bhutekar1@gmail.com',
  'vishalbhutekar.me',
  'gmail.com',
  'postgresql 16',
  'flyway',
  'double-entry subledger',
  'cryptographic',
  'edge worker',
  'anycast',
  'tco',
  'developer'
];

console.log('--- Checking generated HTML for non-technical user friendliness ---');
sensitive.forEach(kw => {
  const matches = [];
  lines.forEach((l, i) => {
    const lower = l.toLowerCase();
    // Allow domain hostname if it contains vishalbhutekar.me in support email or host text
    if (kw === 'vishalbhutekar.me') {
      if (lower.includes('vishalbhutekar.me') && !lower.includes('propledger.vishalbhutekar.me')) {
        matches.push((i+1) + ': ' + l.trim());
      }
    } else if (lower.includes(kw)) {
      matches.push((i+1) + ': ' + l.trim());
    }
  });
  console.log(kw + ':', matches.length > 0 ? matches : 'CLEAN (0)');
});

const devLinks = lines.filter(l => l.includes('href="#developer"'));
console.log('Links to #developer:', devLinks.length > 0 ? devLinks : 'CLEAN (0)');
