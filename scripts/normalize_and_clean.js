const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');

// Normalize to \n for consistent regex & multiline replace
let content = raw.replace(/\r\n/g, '\n');

// 0. Update /api/status and add /animations/* endpoints
const oldApiRegex = /\/\/ API: Health & Status[\s\S]*?if \(url\.pathname === '\/api\/status'\) \{[\s\S]*?masterAdmin: 'vishal\.bhutekar1@gmail\.com',[\s\S]*?\}\);[\s\S]*?\}/;
const newApiBlock = `// Free / Open-Source Local Lottie Animation Endpoints
  if (url.pathname === '/animations/payment-success.json') {
    return new Response(JSON.stringify(PAYMENT_SUCCESS_LOTTIE), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' }
    });
  }
  if (url.pathname === '/animations/tour-success.json') {
    return new Response(JSON.stringify(TOUR_SUCCESS_LOTTIE), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' }
    });
  }
  if (url.pathname === '/animations/maint-success.json') {
    return new Response(JSON.stringify(PAYMENT_SUCCESS_LOTTIE), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' }
    });
  }

  // API: Health & Status (Public, privacy-sanitized)
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({
      status: 'operational',
      app: 'PropLedger',
      subdomain: hostname,
      security: '256-bit TLS Encrypted',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }`;
content = content.replace(oldApiRegex, newApiBlock);

// 1. Mobile Drawer: Replace Developer link with Security
content = content.replace(
  /<a href="#developer" onclick="closeMobileMenu\(\)" class="flex items-center gap-3 px-3 py-2\.5 rounded-xl text-sm font-bold text-\[#2546A6\] bg-blue-50 hover:bg-blue-100 transition">[\s\S]*?Developer[\s\S]*?<\/a>/,
  `<a href="#security" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security & Reliability
        </a>`
);

// 2. Desktop Nav: Replace Developer with Security
content = content.replace(
  /<a href="#developer" class="text-xs font-bold text-\[#2546A6\] hover:text-\[#1D367E\] transition flex items-center gap-1\.5 bg-blue-50\/80 px-3 py-1\.5 rounded-full border border-blue-200\/60" aria-label="Developer section">[\s\S]*?<span>Developer<\/span>[\s\S]*?<\/a>/,
  `<a href="#security" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Security</a>`
);

// 3. Hero Badge
content = content.replace(
  /<a href="#developer" class="inline-flex items-center gap-2 px-4 py-1\.5 rounded-full bg-white\/10 hover:bg-white\/20 backdrop-blur-md border border-white\/15 text-blue-100 text-xs font-semibold transition group">[\s\S]*?<\/a>/,
  `<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Modern Property Management &bull; Trusted by 500+ Properties</span>
        </div>`
);

// 4. Hero description
content = content.replace(
  'PropLedger delivers privacy-first, automated lease tracking and subledger reconciliation, designed to boost portfolio NOI and financial clarity for real estate operators.',
  'Smart, effortless property management. PropLedger automates your rent collection, organizes your leases, and gives you crystal-clear finances — without paperwork or spreadsheets.'
);

// 5. Line 1483: bank reconciliation in Section 7 ROI card
content = content.replace(
  'Eliminates paper receipts, phone rent reminders, bank reconciliation, and spreadsheet formula repairs.',
  'Eliminates paper receipts, phone rent reminders, manual bank checking, and stressful spreadsheet formulas.'
);

// 6. Footer Developer Column
content = content.replace(
  /<div class="space-y-2\.5 text-xs">\s*<p class="font-bold text-white uppercase tracking-wider text-\[11px\] mb-3">Developer &amp; Architecture<\/p>[\s\S]*?<\/div>/,
  `<div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Security &amp; Trust</p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Security &amp; Reliability</span></a></p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition">Double-Booking Defense</a></p>
        <p><a href="#faq" class="text-blue-200 hover:text-white transition">Frequently Asked Questions</a></p>
        <p><a href="#concierge" class="text-blue-200 hover:text-white transition">Resident Concierge Desk</a></p>
      </div>`
);

// 7. Footer Copyright
content = content.replace(
  /<p>&copy; 2026 PropLedger Technologies &bull; Architected by Vishal Bhutekar \(vishalbhutekar\.me\)<\/p>[\s\S]*?<p>Host: \${hostname} &bull; TLS 1\.3 Protected<\/p>/,
  `<p>&copy; 2026 PropLedger Technologies. All rights reserved.</p>
      <p>Bank-Grade 256-Bit Security &bull; 99.9% Uptime SLA</p>`
);

// 8. Floating Dock: Replace Developer
content = content.replace(
  /<a href="#developer" class="hidden sm:flex items-center gap-1\.5 text-xs font-bold text-\[#2546A6\] bg-blue-50 hover:bg-blue-100 px-3\.5 py-2 rounded-full transition">[\s\S]*?<span>Developer<\/span>[\s\S]*?<\/a>/,
  `<a href="#security" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-[#00A896]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Security</span>
      </a>`
);

// 9. Payment receipt resident name if still Vishal
content = content.replace(/Vishal Bhutekar &bull; Unit 402/g, 'Alex Morgan &bull; Unit 402');
content = content.replace(/Unit 402 &bull; Vishal Bhutekar/g, 'Unit 402 &bull; Alex Morgan');
content = content.replace(/value="Vishal Bhutekar"/g, 'value="Alex Morgan"');

// 10. Image enhancements: Descriptive alt tags and loading="lazy"
content = content.replace('alt="Executive"', 'alt="Portfolio manager avatar" loading="lazy"');
content = content.replace('alt="Apartment" class="w-12', 'alt="The Grand Horizon luxury apartment exterior" loading="lazy" class="w-12');
content = content.replace('alt="Executive Studio"', 'alt="Executive Studio interior" loading="lazy"');
content = content.replace('alt="Modern 2-Bedroom"', 'alt="Modern 2-Bedroom living room" loading="lazy"');
content = content.replace('alt="Horizon Penthouse"', 'alt="Horizon Penthouse terrace and skyline" loading="lazy"');
content = content.replace('alt="Skyline Loft"', 'alt="Skyline Loft architectural view" loading="lazy"');
content = content.replace('id="tourUnitImg" src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=160&q=80" alt="Apartment preview"', 'id="tourUnitImg" src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=160&q=80" alt="Apartment preview" loading="lazy"');

// 10. Convert back to CRLF
const updatedRaw = content.replace(/\n/g, '\r\n');
fs.writeFileSync(targetPath, updatedRaw, 'utf8');
console.log('Normalized and cleaned successfully!');
