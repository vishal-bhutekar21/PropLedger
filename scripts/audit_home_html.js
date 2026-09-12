const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

const start = raw.indexOf('function renderHomePage');
const end = raw.indexOf('function renderAdminPage');
const homeHtml = raw.substring(start, end);

const keywords = ['vishal', 'bhutekar', 'admin.', 'github.com', 'postgresql', 'flyway', 'developer'];
keywords.forEach(kw => {
  const matches = [...homeHtml.matchAll(new RegExp(kw, 'gi'))];
  console.log(`Keyword "${kw}": ${matches.length} occurrences in renderHomePage`);
  matches.forEach(m => {
    const s = Math.max(0, m.index - 40);
    const e = Math.min(homeHtml.length, m.index + 50);
    console.log('   ...', homeHtml.substring(s, e).replace(/\r?\n/g, ' '), '...');
  });
});
