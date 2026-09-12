const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let workerContent = fs.readFileSync(targetPath, 'utf8');

// Replace export default with module.exports so we can require it
const tempWorker = workerContent.replace('export default {', 'module.exports = {');
const tempFile = path.join(__dirname, 'temp_worker_export.js');
fs.writeFileSync(tempFile, tempWorker, 'utf8');

try {
  const worker = require(tempFile);
  // simulate request to https://propledger.vishalbhutekar.me/
  const req = new Request('https://propledger.vishalbhutekar.me/');
  worker.fetch(req, {}).then(async (res) => {
    const html = await res.text();
    console.log('HTML Total Lines:', html.split('\n').length);
    const lines = html.split('\n');
    console.log('=== LINES 1780 TO 1820 OF RENDERED HTML ===');
    for (let i = 1775; i < Math.min(lines.length, 1820); i++) {
      console.log(`L${i+1}: ${lines[i]}`);
    }
  }).catch(e => console.error('Fetch error:', e));
} catch (e) {
  console.error('Require error:', e);
}
