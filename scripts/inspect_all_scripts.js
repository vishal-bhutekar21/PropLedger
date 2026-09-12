const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

const start = raw.indexOf('function renderHomePage');
const end = raw.indexOf('function renderAdminPage');
const homeCode = raw.substring(start, end);

const scriptMatches = homeCode.match(/<script>([\s\S]*?)<\/script>/g) || [];
console.log(`Found ${scriptMatches.length} <script> tags in renderHomePage`);

scriptMatches.forEach((s, idx) => {
  const code = s.replace(/<script>/, '').replace(/<\/script>/, '');
  console.log(`Script #${idx+1} lines:`, code.split('\n').length);
  
  // List all declared functions
  const fnMatches = [...code.matchAll(/(?:function\s+([a-zA-Z0-9_$]+)|(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=)/g)];
  console.log(`Declared identifiers:`, fnMatches.map(m => m[1] || m[2]));
});
