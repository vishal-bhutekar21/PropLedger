async function checkLivePage() {
  const res = await fetch('https://propledger.vishalbhutekar.me');
  const html = await res.text();
  const lines = html.split('\n');
  console.log('Total Lines:', lines.length);
  console.log('=== LINES 1780 TO 1820 ===');
  for (let i = 1775; i < Math.min(lines.length, 1825); i++) {
    console.log(`L${i+1}: ${lines[i]}`);
  }
}
checkLivePage();
