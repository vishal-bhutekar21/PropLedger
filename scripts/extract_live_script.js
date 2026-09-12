const vm = require('vm');

async function testLiveScript() {
  const res = await fetch('https://propledger.vishalbhutekar.me/');
  const html = await res.text();
  
  const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
  let match;
  let idx = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    idx++;
    console.log(`=== LIVE SCRIPT TAG #${idx} ===`);
    const code = match[1];
    console.log(`Length: ${code.length}`);
    
    // Test compilation with vm.Script
    try {
      const script = new vm.Script(code, { filename: `inline_script_${idx}.js` });
      console.log(`Script #${idx} compiles successfully in VM!`);
    } catch (err) {
      console.error(`Script #${idx} COMPILE ERROR:`, err.message);
      console.error(err.stack);
      
      // Print lines around error if line number is available
      const lineMatch = err.stack.match(/inline_script_\d+\.js:(\d+)/);
      if (lineMatch) {
        const errLine = parseInt(lineMatch[1], 10);
        const codeLines = code.split('\n');
        console.log(`Error on script line ${errLine}:`);
        for (let i = Math.max(0, errLine - 5); i < Math.min(codeLines.length, errLine + 5); i++) {
          console.log(`L${i+1}: ${codeLines[i]}`);
        }
      }
    }
  }
}

testLiveScript();
