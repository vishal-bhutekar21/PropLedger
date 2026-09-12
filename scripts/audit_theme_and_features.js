const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
const content = fs.readFileSync(targetPath, 'utf8');

console.log('=== FONT LINKS ===');
const fontLinks = content.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"'\s]+/g);
console.log(fontLinks ? [...new Set(fontLinks)] : 'None');

console.log('=== CSS FONT FAMILIES ===');
const fontFamilies = content.match(/font-family:[^;}\n]+/gi);
console.log(fontFamilies ? [...new Set(fontFamilies)] : 'None');

console.log('=== TAILWIND FONT CLASSES ===');
const fontClasses = content.match(/font-(mono|sans|serif|body|heading)/g);
const counts = {};
if (fontClasses) {
  fontClasses.forEach(c => counts[c] = (counts[c] || 0) + 1);
}
console.log(counts);

console.log('=== COLORS AND THEME USAGE ===');
const colorMatches = content.match(/#[0-9a-fA-F]{3,6}/g);
const colorCounts = {};
if (colorMatches) {
  colorMatches.forEach(c => {
    const uc = c.toUpperCase();
    colorCounts[uc] = (colorCounts[uc] || 0) + 1;
  });
}
console.log(colorCounts);
