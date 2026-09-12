const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');
let content = raw.replace(/\r\n/g, '\n');

function safeReplace(str, target, replacement, desc) {
  if (!str.includes(target)) {
    console.warn(`WARNING: Target string not found for [${desc}]:\n` + target.substring(0, 80));
    return str;
  }
  console.log(`SUCCESS: Replaced [${desc}]`);
  return str.replace(target, () => replacement);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO SECTION (#overview): Architectural High-Rise Glass Skyline Backdrop
// ─────────────────────────────────────────────────────────────────────────────
const oldHeroOpening = `  <!-- HERO SECTION (Koshpal Deep Royal Blue Blueprint Canvas & Signature Card Composition) -->
  <section id="overview" class="relative koshpal-bg pt-32 pb-24 sm:pb-32 px-6 overflow-hidden">
    <!-- Glowing Radial Light Orbs -->
    <div class="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-[#00A896]/20 via-[#2563EB]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none"></div>`;

const newHeroOpening = `  <!-- HERO SECTION (Koshpal Deep Royal Blue Blueprint Canvas & Signature Card Composition) -->
  <section id="overview" class="relative koshpal-bg pt-32 pb-24 sm:pb-32 px-6 overflow-hidden">
    <!-- Open-Source Architectural Glass High-Rise Background (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" alt="Modern Architecture" class="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity filter saturate-150 transform scale-105">
      <div class="absolute inset-0 bg-gradient-to-b from-[#15337C]/85 via-[#15337C]/75 to-[#15337C]"></div>
    </div>
    <!-- Glowing Radial Light Orbs -->
    <div class="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-[#00A896]/25 via-[#2563EB]/25 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>`;

content = safeReplace(content, oldHeroOpening, newHeroOpening, 'Hero Section Background');

// ─────────────────────────────────────────────────────────────────────────────
// 2. WHY IT MATTERS (#why-it-matters): Luxury Modern Architecture Backdrop
// ─────────────────────────────────────────────────────────────────────────────
const oldWhyOpening = `  <!-- SECTION 2: WHY MODERNIZING OPERATIONS MATTERS (Koshpal Blue Section with Donut Cards) -->
  <section id="why-it-matters" class="koshpal-bg-light py-20 px-6 text-white text-center relative">`;

const newWhyOpening = `  <!-- SECTION 2: WHY MODERNIZING OPERATIONS MATTERS (Koshpal Blue Section with Donut Cards) -->
  <section id="why-it-matters" class="py-24 px-6 text-white text-center relative overflow-hidden bg-[#1D45A3]">
    <!-- Open-Source Modern Residential Architectural Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80" alt="Luxury Residential Development" class="w-full h-full object-cover object-center opacity-20 mix-blend-overlay transform scale-105">
      <div class="absolute inset-0 bg-gradient-to-t from-[#15337C] via-[#1D45A3]/90 to-[#15337C]"></div>
    </div>`;

content = safeReplace(content, oldWhyOpening, newWhyOpening, 'Why It Matters Background');

// ─────────────────────────────────────────────────────────────────────────────
// 3. HOW PROPLEDGER WORKS (#how-it-works): Subtle Architectural Blueprint Grid
// ─────────────────────────────────────────────────────────────────────────────
const oldHowOpening = `  <!-- SECTION 4: HOW PROPLEDGER WORKS? (3-Step Process) -->
  <section id="how-it-works" class="py-20 px-6 bg-slate-50 border-y border-slate-200/80">`;

const newHowOpening = `  <!-- SECTION 4: HOW PROPLEDGER WORKS? (3-Step Process) -->
  <section id="how-it-works" class="py-24 px-6 bg-slate-50 border-y border-slate-200/80 relative overflow-hidden">
    <!-- Subtle Ambient Blueprint Dot Matrix & Light Accents -->
    <div class="absolute inset-0 pointer-events-none opacity-40" style="background-image: radial-gradient(#2546A6 0.75px, transparent 0.75px); background-size: 24px 24px;"></div>
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none"></div>`;

content = safeReplace(content, oldHowOpening, newHowOpening, 'How It Works Background');

// ─────────────────────────────────────────────────────────────────────────────
// 4. ROI CALCULATOR (#roi-calculator): Luxury Penthouse Interior Backdrop
// ─────────────────────────────────────────────────────────────────────────────
const oldRoiBlock = `  <!-- SECTION 7: INTERACTIVE LANDLORD ROI CALCULATOR -->
  <section id="roi-calculator" class="py-16 px-6 max-w-6xl mx-auto">
    <div class="koshpal-card p-8 sm:p-12 space-y-8 border border-slate-200">`;

const newRoiBlock = `  <!-- SECTION 7: INTERACTIVE LANDLORD ROI CALCULATOR -->
  <section id="roi-calculator" class="py-20 px-6 max-w-6xl mx-auto relative">
    <div class="relative rounded-[36px] overflow-hidden shadow-2xl border border-slate-200/80">
      <!-- Open-Source Luxury Loft Interior Backdrop (Unsplash License) -->
      <div class="absolute inset-0 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" alt="Luxury Residence Interior" class="w-full h-full object-cover object-center opacity-15">
        <div class="absolute inset-0 bg-white/92 backdrop-blur-md"></div>
      </div>
      <div class="relative z-10 p-8 sm:p-12 space-y-8">`;

content = safeReplace(content, oldRoiBlock, newRoiBlock, 'ROI Calculator Background');

// ─────────────────────────────────────────────────────────────────────────────
// 5. ENTERPRISE SECURITY (#security): Night Architectural Skyline Backdrop
// ─────────────────────────────────────────────────────────────────────────────
const oldSecurityOpening = `  <!-- SECTION 9: ENTERPRISE SECURITY & RELIABILITY INFOGRAPHICS -->
  <section id="security" class="py-24 px-6 bg-[#0B1736] text-white relative overflow-hidden">
    <!-- Blueprint Grid overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-25" style="background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 48px 48px;"></div>
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none"></div>`;

const newSecurityOpening = `  <!-- SECTION 9: ENTERPRISE SECURITY & RELIABILITY INFOGRAPHICS -->
  <section id="security" class="py-24 px-6 bg-[#0B1736] text-white relative overflow-hidden">
    <!-- Open-Source Architectural Night Skyline Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80" alt="Architectural Skyline" class="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity filter saturate-150">
      <div class="absolute inset-0 bg-gradient-to-b from-[#0B1736]/90 via-[#0B1736]/80 to-[#0B1736]"></div>
    </div>
    <!-- Blueprint Grid overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 48px 48px;"></div>
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none"></div>`;

content = safeReplace(content, oldSecurityOpening, newSecurityOpening, 'Security Section Background');

// ─────────────────────────────────────────────────────────────────────────────
// 6. VIP CONCIERGE DESK (#concierge): 5-Star Boutique Concierge Lobby Backdrop
// ─────────────────────────────────────────────────────────────────────────────
const oldConciergeBlock = `  <!-- SECTION 10: RESIDENT SUPPORT & CONCIERGE DESK -->
  <section id="concierge" class="py-16 px-6 max-w-4xl mx-auto">
    <div class="koshpal-card p-8 sm:p-10 space-y-6 bg-white border border-slate-200">`;

const newConciergeBlock = `  <!-- SECTION 10: RESIDENT SUPPORT & CONCIERGE DESK -->
  <section id="concierge" class="py-24 px-6 relative overflow-hidden bg-slate-900">
    <!-- Open-Source Luxury Concierge Lounge Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=80" alt="Luxury Concierge Lounge" class="w-full h-full object-cover object-center opacity-25">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-950"></div>
    </div>
    <div class="max-w-4xl mx-auto relative z-10">
      <div class="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 space-y-7 shadow-2xl border border-white/20">`;

content = safeReplace(content, oldConciergeBlock, newConciergeBlock, 'Concierge Section Background');

// Close the extra outer div added in concierge
const oldConciergeClosing = `      <div id="pubStatus" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
    </div>
  </section>`;

const newConciergeClosing = `      <div id="pubStatus" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
      
      <!-- VIP Concierge Service Guarantees -->
      <div class="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-slate-600">
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; 2-Hour Response</p>
          <p class="text-[10px] text-slate-500">Dedicated desk</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Private Tours</p>
          <p class="text-[10px] text-slate-500">In-person &amp; virtual</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Zero Paperwork</p>
          <p class="text-[10px] text-slate-500">100% digital leases</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Escrow Protection</p>
          <p class="text-[10px] text-slate-500">Safe security deposits</p>
        </div>
      </div>
    </div>
  </section>`;

content = safeReplace(content, oldConciergeClosing, newConciergeClosing, 'Concierge Service Badges');

// Write back with CRLF
fs.writeFileSync(targetPath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Rich open-source backgrounds applied successfully!');
