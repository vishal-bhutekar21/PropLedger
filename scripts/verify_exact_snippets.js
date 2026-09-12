const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const raw = fs.readFileSync(targetPath, 'utf8');
const content = raw.replace(/\r\n/g, '\n');

function checkSnippet(name, str) {
  const exists = content.includes(str);
  console.log(`${name}: ${exists ? 'FOUND' : 'NOT FOUND'}`);
  if (!exists) {
    // print first 50 chars
    console.log('Searching for:', str.substring(0, 60));
  }
}

checkSnippet('Landlord Header', 'Current Unit Roster & Lease Tracking');
checkSnippet('Batch Dispatch Btn', 'dispatchBatchBills()');
checkSnippet('Pay October Rent Btn', 'Pay October Rent ($3,250.00)');
checkSnippet('Download PDF Btn', 'downloadStatementPdf()');
checkSnippet('Unit Gallery Filter', 'filterUnits(\'all\')');
checkSnippet('FAQ Question 1', 'Do I need any technical or accounting skills?');
checkSnippet('Mobile Menu script anchor', '// ── Mobile Navigation Menu');
