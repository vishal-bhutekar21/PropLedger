const fs = require('fs');
const content = fs.readFileSync('cloudflare/propledger-worker.js', 'utf8');

console.log('=== APP AUDIT ===');
console.log('Total length:', content.length);
console.log('Total lines:', content.split('\n').length);

// 1. Check fonts and typography
const fontMonoCount = (content.match(/font-mono/g) || []).length;
console.log('font-mono count:', fontMonoCount);

// 2. Sections
const sections = [...content.matchAll(/<section\s+id="([^"]+)"[^>]*>/g)].map(m => m[1]);
console.log('Sections IDs:', sections);

// 3. Modals
const modals = [...content.matchAll(/id="([^"]*Modal[^"]*)"/g)].map(m => m[1]);
console.log('Modals IDs:', modals);

// 4. Buttons and actions
const buttons = [...content.matchAll(/<button[^>]*onclick="([^"]+)"[^>]*>/g)].map(m => m[1]);
console.log('Interactive button actions count:', buttons.length);
const uniqueActions = [...new Set(buttons.map(b => b.split('(')[0]))];
console.log('Unique interactive actions:', uniqueActions);

// 5. Check theme colors & consistency
const hexColors = [...content.matchAll(/#[0-9A-Fa-f]{6}/g)].map(m => m[0].toUpperCase());
const colorCounts = {};
hexColors.forEach(c => colorCounts[c] = (colorCounts[c] || 0) + 1);
console.log('Dominant Colors:', Object.entries(colorCounts).sort((a,b) => b[1] - a[1]).slice(0, 10));
