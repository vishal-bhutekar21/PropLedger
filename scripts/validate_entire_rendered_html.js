const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');

// Find all <script>...</script> tags in the file
const scriptMatches = raw.match(/<script[\s\S]*?<\/script>/g) || [];
console.log(`Found ${scriptMatches.length} <script> blocks`);

scriptMatches.forEach((s, idx) => {
  // strip <script> and </script>
  const code = s.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
  try {
    new Function(code);
    console.log(`Script Block #${idx+1} syntax: VALID!`);
  } catch (err) {
    console.error(`Script Block #${idx+1} ERROR:`, err.message);
  }
});
