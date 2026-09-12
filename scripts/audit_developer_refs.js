const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

// Check within renderHomePage only (before renderAdminPage)
const renderHomePageCode = raw.substring(0, raw.indexOf('function renderAdminPage'));

const keywords = ['vishal', 'bhutekar', 'github.com', 'postgresql', 'flyway', 'cloudflare worker', 'subledger engine', 'developer'];
keywords.forEach(kw => {
  const matches = [...renderHomePageCode.matchAll(new RegExp(kw, 'gi'))];
  console.log(`Keyword "${kw}": ${matches.length} occurrences in renderHomePage`);
  if (matches.length > 0 && matches.length < 10) {
    matches.forEach(m => {
      const start = Math.max(0, m.index - 40);
      const end = Math.min(renderHomePageCode.length, m.index + 50);
      console.log('   ...', renderHomePageCode.substring(start, end).replace(/\r?\n/g, ' '), '...');
    });
  }
});
