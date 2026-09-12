const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');

const targetStr = `  <!-- SECTION 2: WHY PRIORITIZING OPERATIONS MATTERS (Koshpal Blue Section with Donut Cards) -->
  <section id="why-it-matters" class="koshpal-bg-light py-20 px-6 text-white text-center relative">`;

const replacementStr = `  <!-- SECTION 2: WHY PRIORITIZING OPERATIONS MATTERS (Koshpal Blue Section with Donut Cards) -->
  <section id="why-it-matters" class="py-24 px-6 text-white text-center relative overflow-hidden bg-[#1D45A3]">
    <!-- Open-Source Modern Architecture Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80" alt="Luxury Residential Development" class="w-full h-full object-cover object-center opacity-20 mix-blend-overlay transform scale-105">
      <div class="absolute inset-0 bg-gradient-to-t from-[#15337C] via-[#1D45A3]/90 to-[#15337C]"></div>
    </div>`;

raw = raw.replace(targetStr, replacementStr);
fs.writeFileSync(targetPath, raw, 'utf8');
console.log('Successfully enhanced Why It Matters background!');
