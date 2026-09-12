const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Mobile Drawer: replace Developer link with Security
const oldMobDev = `<a href="#developer" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 transition">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse flex-shrink-0" aria-hidden="true"></span>
          Developer
        </a>`;

const newMobDev = `<a href="#security" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security & Reliability
        </a>`;

content = content.replace(oldMobDev, newMobDev);

// 2. Desktop Nav: replace Developer link with Security
const oldDeskDev = `<a href="#developer" class="text-xs font-bold text-[#2546A6] hover:text-[#1D367E] transition flex items-center gap-1.5 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-200/60" aria-label="Developer section">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00A896] animate-pulse" aria-hidden="true"></span>
          <span>Developer</span>
        </a>`;

const newDeskDev = `<a href="#security" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Security</a>`;

content = content.replace(oldDeskDev, newDeskDev);

// 3. Hero Badge & Subtitle
const oldHeroBadge = `<a href="#developer" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold transition group">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Engineered by <strong>Vishal Bhutekar</strong> &bull; <span class="font-mono text-[#38BDF8]">vishalbhutekar.me</span></span>
          <span class="group-hover:translate-x-0.5 transition-transform text-[#38BDF8]">&rarr;</span>
        </a>`;

const newHeroBadge = `<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Modern Property Management &bull; Trusted by 500+ Properties</span>
        </div>`;

content = content.replace(oldHeroBadge, newHeroBadge);

const oldHeroDesc = 'PropLedger delivers privacy-first, automated lease tracking and subledger reconciliation, designed to boost portfolio NOI and financial clarity for real estate operators.';
const newHeroDesc = 'Smart, effortless property management. PropLedger automates your rent collection, organizes your leases, and gives you crystal-clear finances — without paperwork or spreadsheets.';

content = content.replace(oldHeroDesc, newHeroDesc);

// 4. Footer Developer Column
const oldFooterCol = `      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Developer &amp; Architecture</p>
        <p><a href="#developer" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Vishal Bhutekar (Lead Architect)</span></a></p>
        <p><a href="https://vishalbhutekar.me" class="text-blue-200 hover:text-white transition font-mono">vishalbhutekar.me</a></p>
        <p><a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="text-blue-200 hover:text-white transition">GitHub Repository</a></p>
        <p><a href="https://github.com/vishal-bhutekar21/PropLedger/blob/main/docs/YARDI_ENTERPRISE_PROPOSAL.md" target="_blank" class="text-blue-200 hover:text-white transition">Yardi Proposal Whitepaper</a></p>
      </div>`;

const newFooterCol = `      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Security &amp; Trust</p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Security &amp; Reliability</span></a></p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition">Double-Booking Defense</a></p>
        <p><a href="#faq" class="text-blue-200 hover:text-white transition">Frequently Asked Questions</a></p>
        <p><a href="#concierge" class="text-blue-200 hover:text-white transition">Resident Concierge Desk</a></p>
      </div>`;

content = content.replace(oldFooterCol, newFooterCol);

// 5. Footer Copyright
const oldFootCopy = `<p>&copy; 2026 PropLedger Technologies &bull; Architected by Vishal Bhutekar (vishalbhutekar.me)</p>
      <p>Host: \${hostname} &bull; TLS 1.3 Protected</p>`;

const newFootCopy = `<p>&copy; 2026 PropLedger Technologies. All rights reserved.</p>
      <p>Bank-Grade 256-Bit Security &bull; 99.9% Uptime SLA</p>`;

content = content.replace(oldFootCopy, newFootCopy);

// 6. Floating Dock: Replace Developer
const oldDockDev = `      <a href="#developer" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>Developer</span>
      </a>`;

const newDockDev = `      <a href="#security" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-[#00A896]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Security</span>
      </a>`;

content = content.replace(oldDockDev, newDockDev);

// 7. Payment Receipt View Lottie Container & Names
content = content.replace(
  'Touch ID / Face ID encrypted cryptographic key exchange',
  'Touch ID / Face ID encrypted instant payment'
);
content = content.replace(
  'Funds transferred and registered in PropLedger subledger.',
  'Your payment is confirmed and recorded to your resident statement.'
);
content = content.replace(
  'Vishal Bhutekar &bull; Unit 402',
  'Alex Morgan &bull; Unit 402'
);
content = content.replace(
  'Unit 402 &bull; Vishal Bhutekar',
  'Unit 402 &bull; Alex Morgan'
);
content = content.replace(
  '<input type="text" value="Vishal Bhutekar"',
  '<input type="text" value="Alex Morgan"'
);

// 8. In Payment Receipt Container: replace static &check; with lottie container
const oldReceiptHeader = `        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black mx-auto shadow-inner">
            &check;
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Settled & Reconciled!</h4>`;

const newReceiptHeader = `        <div class="text-center space-y-2">
          <div id="lottiePaymentSuccess" class="w-16 h-16 mx-auto flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">&check;</div>
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Completed!</h4>`;

content = content.replace(oldReceiptHeader, newReceiptHeader);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Targeted cleanup script complete!');
