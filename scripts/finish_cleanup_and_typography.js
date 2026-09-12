const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');
let content = raw.replace(/\r\n/g, '\n');

function safeReplace(str, target, replacement) {
  if (!str.includes(target)) {
    console.warn('WARNING: Target string not found for replacement:\n' + target.substring(0, 80));
    return str;
  }
  return str.replace(target, () => replacement);
}

// 1. Clean Hero Badge (L658-662)
const oldHeroBadgeBlock = `<a href="#developer" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold transition group">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Engineered by <strong>Vishal Bhutekar</strong> &bull; <span class="font-mono text-[#38BDF8]">vishalbhutekar.me</span></span>
          <span class="group-hover:translate-x-0.5 transition-transform text-[#38BDF8]">&rarr;</span>
        </a>`;

const newHeroBadgeBlock = `<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Enterprise Cloud Platform &bull; <strong class="text-[#38BDF8]">99.9% Uptime SLA</strong></span>
        </div>`;

content = safeReplace(content, oldHeroBadgeBlock, newHeroBadgeBlock);

// 2. Clean FAQ Container (L1372-1402)
const oldFaqBlock = `<div class="space-y-4">
        
        <div class="koshpal-card p-6 sm:p-7 space-y-2 bg-white">
          <h3 class="font-bold text-base text-slate-900">Do I need any technical or accounting skills?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            No! PropLedger was built specifically for ordinary landlords and property owners. If you can send a message or open an email, you can manage your properties in PropLedger without any issues.
          </p>
        </div>

        <div class="koshpal-card p-6 sm:p-7 space-y-2 bg-white">
          <h3 class="font-bold text-base text-slate-900">How does the system physically stop double-booking?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            PropLedger has built-in calendar protection. Once an apartment is booked for specific dates (e.g., September 1 to August 31), the system automatically locks the schedule and prevents any other booking for that same unit. You will never have double-booked apartments.
          </p>
        </div>

        <div class="koshpal-card p-6 sm:p-7 space-y-2 bg-white">
          <h3 class="font-bold text-base text-slate-900">How do tenants receive and pay their bills?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            On the 1st of every month, your tenants receive an automated, polite email statement. Inside is an itemized breakdown of what they owe (rent, parking, utilities) and a secure button to pay online with Bank ACH or Card.
          </p>
        </div>

        <div class="koshpal-card p-6 sm:p-7 space-y-2 bg-white">
          <h3 class="font-bold text-base text-slate-900">Where can I see the Master Admin control plane?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            You can access the Master Admin operations portal directly at <a href="https://admin.vishalbhutekar.me" class="text-[#2546A6] font-bold hover:underline">admin.vishalbhutekar.me</a> to view the full management dashboard, add properties, view tenant profiles, and trigger rent dispatches.
          </p>
        </div>

      </div>`;

const newFaqBlock = `<!-- FAQ Search Bar -->
      <div class="max-w-md mx-auto relative">
        <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="faqSearchInput" oninput="filterFaqQuestions()" placeholder="Search questions (e.g. payments, leases, deposits, AutoPay)..." class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#2546A6] focus:ring-1 focus:ring-[#2546A6] shadow-sm transition">
      </div>

      <div class="space-y-3" id="faqAccordionList">
        
        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all" open>
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Do I need any technical or accounting skills?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            No! PropLedger was built specifically for ordinary landlords and property owners. If you can send a text or open an email, you can manage your properties in PropLedger without any issues.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How does the system stop double-booked apartments?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            PropLedger has built-in calendar protection. Once an apartment is booked for specific dates (e.g., September 1 to August 31), the system automatically locks the schedule and physically prevents any other booking for that same unit during those dates. You will never experience double-booked units.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How do tenants receive and pay their rent bills?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            On the 1st of every month, your tenants receive a friendly automated statement by email. It contains an itemized breakdown of rent, parking, and utilities, with a secure 1-click button to pay online via Bank ACH or Card.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Can residents set up automatic monthly rent payments (AutoPay)?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Yes! Residents can toggle AutoPay with one click from their resident portal. Rent is automatically cleared on the 1st of each month with instant digital receipts sent to both tenant and landlord.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How do security deposits and move-out refunds work?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Security deposits are tracked in a dedicated digital ledger. When a lease finishes and the move-out inspection is completed, refunds can be initiated back to the resident's original bank account with an itemized closing receipt.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Can I manage multiple properties and buildings at once?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Yes. PropLedger is built for any size portfolio. You can add unlimited properties, buildings, and apartments. The system tracks each unit individually while giving you an all-in-one financial summary across all your buildings.
          </p>
        </details>

      </div>`;

content = safeReplace(content, oldFaqBlock, newFaqBlock);

// 3. Clean Footer Column 2 & Bottom (L1660-1675)
const oldFooterCol2 = `      <!-- Links Column 2 -->
      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Developer &amp; Architecture</p>
        <p><a href="#developer" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Vishal Bhutekar (Lead Architect)</span></a></p>
        <p><a href="https://vishalbhutekar.me" class="text-blue-200 hover:text-white transition font-mono">vishalbhutekar.me</a></p>
        <p><a href="https://admin.vishalbhutekar.me" class="text-blue-200 hover:text-white transition">Master Admin Console</a></p>
        <p><a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="text-blue-200 hover:text-white transition">GitHub Repository</a></p>
        <p><a href="https://github.com/vishal-bhutekar21/PropLedger/blob/main/docs/YARDI_ENTERPRISE_PROPOSAL.md" target="_blank" class="text-blue-200 hover:text-white transition">Yardi Proposal Whitepaper</a></p>
      </div>`;

const newFooterCol2 = `      <!-- Links Column 2 -->
      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Trust &amp; Platform</p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Enterprise Security</span></a></p>
        <p><a href="#unit-gallery" class="text-blue-200 hover:text-white transition">Luxury Residences</a></p>
        <p><a href="#roi-calculator" class="text-blue-200 hover:text-white transition">Savings Calculator</a></p>
        <p><a href="#faq" class="text-blue-200 hover:text-white transition">Knowledge Base &amp; FAQ</a></p>
        <p><a href="#concierge" class="text-blue-200 hover:text-white transition">Contact Concierge</a></p>
      </div>`;

content = safeReplace(content, oldFooterCol2, newFooterCol2);

const oldFooterBottom = `<div class="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/60 font-mono">
      <p>&copy; 2026 PropLedger Technologies &bull; Architected by Vishal Bhutekar (vishalbhutekar.me)</p>
      <p>Host: \${hostname} &bull; TLS 1.3 Protected</p>
    </div>`;

const newFooterBottom = `<div class="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/70">
      <p>&copy; 2026 PropLedger Technologies. All rights reserved. Built for modern property owners and residents.</p>
      <p class="text-blue-300/50">TLS 1.3 Protected &bull; 99.9% Cloud Uptime</p>
    </div>`;

content = safeReplace(content, oldFooterBottom, newFooterBottom);

// 4. Clean Floating Action Dock (L1684-1706)
const oldDockBlock = `      <a href="#developer" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>Developer</span>
      </a>
      <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Suite Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span class="hidden sm:inline">Schedule Tour</span>
        <span class="sm:hidden">Tour</span>
      </button>
      <button onclick="openMaintenanceModal()" class="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        <span>Resident Desk</span>
      </button>
      <a href="#concierge" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span class="hidden sm:inline">Concierge</span>
      </a>
      <div class="h-4 w-px bg-slate-200"></div>
      <a href="https://admin.vishalbhutekar.me" class="flex items-center gap-1.5 text-xs font-bold text-[#2546A6] hover:underline transition">
        <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <span>Master Admin</span>
      </a>`;

const newDockBlock = `      <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Suite Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span class="hidden sm:inline">Schedule Tour</span>
        <span class="sm:hidden">Tour</span>
      </button>
      <button onclick="openMaintenanceModal()" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        <span>Resident Desk</span>
      </button>
      <a href="#faq" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>FAQ</span>
      </a>
      <a href="#concierge" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span class="hidden sm:inline">Concierge</span>
      </a>`;

content = safeReplace(content, oldDockBlock, newDockBlock);

// 5. Typography Consistency: Replace inappropriate font-mono with Figtree styling
// We target renderHomePage only
let homePageCode = content.substring(0, content.indexOf('function renderAdminPage'));
const restOfCode = content.substring(content.indexOf('function renderAdminPage'));

// Replace font-mono in step headers, metrics, and badges
homePageCode = homePageCode.replace(/tracking-wider font-mono">Step (\d)<\/div>/g, 'tracking-wider font-bold">Step $1</div>');
homePageCode = homePageCode.replace(/text-slate-500 font-mono">/g, 'text-slate-500 font-medium">');
homePageCode = homePageCode.replace(/text-slate-400 font-mono/g, 'text-slate-400 font-medium');
homePageCode = homePageCode.replace(/font-mono font-bold text-slate-900/g, 'font-bold text-slate-900 tabular-nums');
homePageCode = homePageCode.replace(/text-emerald-600 font-bold font-mono/g, 'text-emerald-600 font-bold');
homePageCode = homePageCode.replace(/text-emerald-700 font-bold text-xs font-mono/g, 'text-emerald-700 font-bold text-xs');
homePageCode = homePageCode.replace(/text-2xl font-black text-slate-900 font-mono/g, 'text-2xl font-black text-slate-900 tabular-nums');
homePageCode = homePageCode.replace(/text-2xl font-black text-\[#2546A6\] font-mono/g, 'text-2xl font-black text-[#2546A6] tabular-nums');
homePageCode = homePageCode.replace(/text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono/g, 'text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full');
homePageCode = homePageCode.replace(/text-xs font-bold text-\[#2546A6\] bg-blue-50 px-2 py-0.5 rounded-full font-mono/g, 'text-xs font-bold text-[#2546A6] bg-blue-50 px-2 py-0.5 rounded-full');
homePageCode = homePageCode.replace(/font-bold text-\[#2546A6\] font-mono/g, 'font-bold text-[#2546A6]');
homePageCode = homePageCode.replace(/font-mono font-medium/g, 'font-medium');
homePageCode = homePageCode.replace(/text-slate-900 font-mono tracking-tight/g, 'text-slate-900 tracking-tight');
homePageCode = homePageCode.replace(/font-mono text-sm font-black/g, 'font-bold text-sm tabular-nums');
homePageCode = homePageCode.replace(/font-black text-white font-mono/g, 'font-black text-white tabular-nums');
homePageCode = homePageCode.replace(/font-bold text-\[#2DD4BF\] font-mono/g, 'font-bold text-[#2DD4BF] tabular-nums');

content = homePageCode + restOfCode;

// Write back with CRLF
fs.writeFileSync(targetPath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('Cleanup and typography enhancement completed successfully!');
