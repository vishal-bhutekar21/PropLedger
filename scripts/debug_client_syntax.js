const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const workerContent = fs.readFileSync(targetPath, 'utf8');

// We extract renderHomePage function and run it
// We can look for <script> tags inside renderHomePage
const scriptTagRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let count = 0;
while ((match = scriptTagRegex.exec(workerContent)) !== null) {
  count++;
  console.log(`=== SCRIPT TAG #${count} ===`);
  const scriptContent = match[1];
  console.log(`Length: ${scriptContent.length}`);
  
  // Try checking syntax of this script block
  try {
    new Function(scriptContent);
    console.log(`Script #${count} syntax OK!`);
  } catch (err) {
    console.error(`ERROR in Script #${count}:`, err.message);
    // Find line number of error
    const scriptLines = scriptContent.split('\n');
    console.log('Script total lines:', scriptLines.length);
    // Print lines around typical syntax issues
    scriptLines.forEach((l, idx) => {
      if (idx < 50 || idx > scriptLines.length - 50) {
        // console.log(`${idx+1}: ${l}`);
      }
    });
  }
}
