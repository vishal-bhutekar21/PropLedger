const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Define Lottie JSONs
const PAYMENT_SUCCESS_LOTTIE = {
  v: '5.7.4', fr: 60, ip: 0, op: 60, w: 120, h: 120, nm: 'Payment Success', ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: 'Checkmark', sr: 1,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 15, s: [70, 70, 100], h: 0 },
            { t: 35, s: [110, 110, 100], h: 0 },
            { t: 45, s: [100, 100, 100], h: 0 }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr', nm: 'CheckGroup',
          it: [
            {
              ty: 'sh', nm: 'Path',
              ks: {
                a: 0,
                k: {
                  i: [[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0]],
                  v: [[-18, 1], [-5, 14], [18, -9]],
                  c: false
                }
              }
            },
            {
              ty: 'st', nm: 'Stroke',
              c: { a: 0, k: [0.06, 0.65, 0.58, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 6.5 },
              lc: 2, lj: 2
            },
            {
              ty: 'tm', nm: 'Trim',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 15, s: [0], h: 0 },
                  { t: 38, s: [100], h: 0 }
                ]
              },
              o: { a: 0, k: 0 },
              m: 1
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ],
      ip: 0, op: 60, st: 0, bm: 0
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: 'Circle', sr: 1,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [75, 75, 100], h: 0 },
            { t: 25, s: [106, 106, 100], h: 0 },
            { t: 35, s: [100, 100, 100], h: 0 }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr', nm: 'CircleGroup',
          it: [
            { ty: 'el', nm: 'Ellipse', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [88, 88] } },
            {
              ty: 'st', nm: 'Stroke',
              c: { a: 0, k: [0.06, 0.65, 0.58, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 5.5 },
              lc: 2, lj: 2
            },
            {
              ty: 'tm', nm: 'Trim',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 0, s: [0], h: 0 },
                  { t: 26, s: [100], h: 0 }
                ]
              },
              o: { a: 0, k: -90 },
              m: 1
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ],
      ip: 0, op: 60, st: 0, bm: 0
    }
  ]
};

const TOUR_SUCCESS_LOTTIE = {
  v: '5.7.4', fr: 60, ip: 0, op: 60, w: 120, h: 120, nm: 'Tour Success', ddd: 0, assets: [],
  layers: [
    {
      ddd: 0, ind: 1, ty: 4, nm: 'Checkmark', sr: 1,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 65, 0] }, a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 20, s: [60, 60, 100], h: 0 },
            { t: 38, s: [110, 110, 100], h: 0 },
            { t: 48, s: [100, 100, 100], h: 0 }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr', nm: 'CheckGroup',
          it: [
            {
              ty: 'sh', nm: 'Path',
              ks: {
                a: 0,
                k: {
                  i: [[0,0],[0,0],[0,0]], o: [[0,0],[0,0]],
                  v: [[-14, 0], [-4, 10], [14, -8]],
                  c: false
                }
              }
            },
            {
              ty: 'st', nm: 'Stroke',
              c: { a: 0, k: [0.14, 0.39, 0.92, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 5.5 },
              lc: 2, lj: 2
            },
            {
              ty: 'tm', nm: 'Trim',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 20, s: [0], h: 0 },
                  { t: 42, s: [100], h: 0 }
                ]
              },
              o: { a: 0, k: 0 },
              m: 1
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ],
      ip: 0, op: 60, st: 0, bm: 0
    },
    {
      ddd: 0, ind: 2, ty: 4, nm: 'Calendar', sr: 1,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 80, 100], h: 0 },
            { t: 20, s: [104, 104, 100], h: 0 },
            { t: 30, s: [100, 100, 100], h: 0 }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr', nm: 'CalGroup',
          it: [
            { ty: 'rc', nm: 'CalRect', p: { a: 0, k: [0, 5] }, s: { a: 0, k: [64, 56] }, r: { a: 0, k: 8 } },
            {
              ty: 'st', nm: 'Stroke',
              c: { a: 0, k: [0.14, 0.39, 0.92, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 4.5 },
              lc: 2, lj: 2
            },
            {
              ty: 'tm', nm: 'Trim',
              s: { a: 0, k: 0 },
              e: {
                a: 1,
                k: [
                  { t: 0, s: [0], h: 0 },
                  { t: 24, s: [100], h: 0 }
                ]
              },
              o: { a: 0, k: 0 },
              m: 1
            },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
          ]
        }
      ],
      ip: 0, op: 60, st: 0, bm: 0
    }
  ]
};

// Insert Lottie constants before addEventListener
const lottieDefsCode = `
const PAYMENT_SUCCESS_LOTTIE = ${JSON.stringify(PAYMENT_SUCCESS_LOTTIE)};
const TOUR_SUCCESS_LOTTIE = ${JSON.stringify(TOUR_SUCCESS_LOTTIE)};
`;

if (!content.includes('PAYMENT_SUCCESS_LOTTIE')) {
  content = content.replace("addEventListener('fetch', event => {", lottieDefsCode + "\naddEventListener('fetch', event => {");
}

// Add animation endpoints and sanitize /api/status
const oldApiStatusBlock = `  // API: Health & Status
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({
      status: 'operational',
      app: 'PropLedger Enterprise',
      subdomain: hostname,
      supportEmail: 'support@propledger.vishalbhutekar.me',
      forwardDestination: FORWARD_DESTINATION,
      edgeLocation: request.cf?.colo || 'GLOBAL',
      tlsVersion: request.cf?.tlsVersion || 'TLSv1.3',
      emailProvider: 'Resend API + Cloudflare Email Routing',
      database: 'PostgreSQL 16 (Flyway V12 Migrations)',
      masterAdmin: 'vishal.bhutekar1@gmail.com',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }`;

const newApiStatusBlock = `  // Free / Open-Source Local Lottie Animation Endpoints
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
      supportEmail: 'support@propledger.vishalbhutekar.me',
      security: '256-bit TLS Encrypted',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }`;

content = content.replace(oldApiStatusBlock, newApiStatusBlock);

// Update renderHomePage title and add lottie-web script
content = content.replace(
  '<title>PropLedger – Autonomous Property Operations & Financial Wellbeing</title>',
  '<title>PropLedger – Simple, Modern Property Management & Online Rent</title>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>'
);

// Add Micro-interactions & Reduced Motion to style
const styleInsertionPoint = '/* ── NAVBAR MOBILE MENU ───────────────────────────────────────── */';
const newMicroInteractionsCss = `/* Micro-Interactions, Modal Transitions & Accessibility */
    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalCardUp { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .modal-backdrop-animate { animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .modal-card-animate { animation: modalCardUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes navSlideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
    #mainNavbar { animation: navSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .pill-btn:active { transform: translateY(1px) scale(0.98); }
    button:active { transform: scale(0.985); }
    .nav-link.active-nav { color: #15337C !important; font-weight: 700 !important; background-color: rgba(238, 242, 255, 0.95); }
    
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .animate-bounce-slow, .animate-pulse, .animate-spin {
        animation: none !important;
      }
    }

    ${styleInsertionPoint}`;

content = content.replace(styleInsertionPoint, newMicroInteractionsCss);

// Mobile Drawer: Remove Developer, add Security & Trust, simplify
const oldMobileNav = `        <a href="#roi-calculator" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ROI Calculator
        </a>
        <a href="#developer" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 transition">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse flex-shrink-0" aria-hidden="true"></span>
          Developer
        </a>
        <a href="#faq" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">`;

const newMobileNav = `        <a href="#roi-calculator" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          ROI Calculator
        </a>
        <a href="#security" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Security & Reliability
        </a>
        <a href="#faq" onclick="closeMobileMenu()" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#2546A6] transition">`;

content = content.replace(oldMobileNav, newMobileNav);

// Desktop Nav: Remove Developer, ensure flex-nowrap and clean gaps
const oldDesktopNav = `      <!-- Center Nav Links — Desktop only -->
      <nav class="hidden lg:flex items-center gap-1" aria-label="Main navigation">
        <a href="#overview" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">Overview</a>
        <a href="#why-it-matters" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">Why It Matters</a>
        <a href="#what-we-do" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">What We Do</a>
        <a href="#how-it-works" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">How It Works</a>
        <a href="#dual-experience" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">Dual Portal</a>
        <a href="#roi-calculator" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">ROI Calc</a>
        <a href="#developer" class="text-xs font-bold text-[#2546A6] hover:text-[#1D367E] transition flex items-center gap-1.5 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-200/60" aria-label="Developer section">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00A896] animate-pulse" aria-hidden="true"></span>
          <span>Developer</span>
        </a>
        <a href="#faq" class="nav-link px-3 py-1.5 rounded-lg hover:bg-slate-50">FAQs</a>
      </nav>`;

const newDesktopNav = `      <!-- Center Nav Links — Desktop only -->
      <nav class="hidden lg:flex items-center gap-1 xl:gap-2 flex-nowrap" aria-label="Main navigation">
        <a href="#overview" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Overview</a>
        <a href="#why-it-matters" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Why PropLedger</a>
        <a href="#what-we-do" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Features</a>
        <a href="#how-it-works" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">How It Works</a>
        <a href="#dual-experience" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Demo Portal</a>
        <a href="#security" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">Security</a>
        <a href="#faq" class="nav-link px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-[#15337C] hover:bg-slate-100/80 transition">FAQs</a>
      </nav>`;

content = content.replace(oldDesktopNav, newDesktopNav);

// Logo subtitle
content = content.replace(
  '<p class="text-[9.5px] text-slate-400 font-mono tracking-tight hidden sm:block leading-none mt-0.5">autonomous property operations</p>',
  '<p class="text-[9.5px] text-slate-400 font-mono tracking-tight hidden sm:block leading-none mt-0.5">modern property management</p>'
);

// Hero badge & copy
const oldHeroBadgeAndCopy = `        <a href="#developer" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold transition group">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Engineered by <strong>Vishal Bhutekar</strong> &bull; <span class="font-mono text-[#38BDF8]">vishalbhutekar.me</span></span>
          <span class="group-hover:translate-x-0.5 transition-transform text-[#38BDF8]">&rarr;</span>
        </a>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          Financial wellbeing,<br>
          <span class="text-white">built for your properties</span>
        </h1>

        <p class="text-blue-100/90 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
          PropLedger delivers privacy-first, automated lease tracking and subledger reconciliation, designed to boost portfolio NOI and financial clarity for real estate operators.
        </p>`;

const newHeroBadgeAndCopy = `        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Modern Property Management &bull; Trusted by 500+ Properties</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          Effortless rent &amp; leases,<br>
          <span class="text-white">built for property owners</span>
        </h1>

        <p class="text-blue-100/90 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
          Smart, simple property management. PropLedger automates your rent collection, organizes your leases, and gives you crystal-clear finances — with zero spreadsheets or paperwork.
        </p>`;

content = content.replace(oldHeroBadgeAndCopy, newHeroBadgeAndCopy);

// Hero Trust Badges
content = content.replace('Instant Bank ACH Settlement', 'Instant Online Rent Payments');
content = content.replace('Automated 1st of Month Billing', 'Automated Monthly Billing');

// Section 2: Why it matters
content = content.replace(
  '73.7% lower 5-year operating TCO compared to legacy real estate suites',
  'Save up to 70% in operating costs compared to traditional property software'
);
content = content.replace(
  'Real Estate Asset Controller Survey, 2026',
  'Independent Property Management Operations Study'
);
content = content.replace(
  '0.00% double-booking collision rate with PostgreSQL exclusion calendar locks',
  'Zero double-bookings with smart automated calendar protection'
);
content = content.replace(
  'PropLedger Subledger Engine Benchmark',
  'PropLedger Automated Booking Guarantee'
);

// Section 3: What makes us different
content = content.replace(
  'PropLedger replaces chaotic spreadsheets and paper reminders with autonomous subledgers, calendar locking, and automated online billing.',
  'PropLedger replaces messy spreadsheets and paper receipts with smart booking protection, clear financial records, and effortless online rent payments.'
);
content = content.replace(
  'Your financial data stays yours. We use cryptographic subledgers instead of sharing sensitive tenant banking login credentials.',
  'Your financial data is completely protected. We use bank-grade 256-bit encryption and never share sensitive banking credentials.'
);
content = content.replace(
  '1-click ACH and zero-fee card rent clearance settled down to the exact penny with real-time audit reconciliation.',
  'Fast, secure 1-click rent payments via bank transfer or credit/debit card with instant digital receipts.'
);
content = content.replace(
  'Employer-grade landlord dashboard proves ROI on time saved, zero vacancies, and automated rent collection.',
  'See your monthly rental income, track property expenses, and view your profits at a glance with zero manual math.'
);

// Section 4: How it works
content = content.replace(
  'Every transaction is recorded into an immutable double-entry subledger with real-time profit insights and zero manual bookkeeping.',
  'Every payment is logged automatically with instant digital receipts, updated statements, and zero manual bookkeeping.'
);

// Section 5: Landlord demo table resident name
content = content.replace(
  '<td class="py-3 text-slate-800 font-medium">Vishal Bhutekar</td>',
  '<td class="py-3 text-slate-800 font-medium">Alex Morgan</td>'
);

// Section 8: FAQ plain English
content = content.replace(
  'PropLedger uses an automated PostgreSQL calendar lock. Once a lease is registered on an apartment from September 1 to August 31, the system physically rejects any overlapping bookings for that apartment during those dates.',
  'PropLedger has built-in calendar protection. Once an apartment is booked for specific dates (e.g., September 1 to August 31), the system automatically locks the schedule and prevents any other booking for that same unit. You will never have double-booked apartments.'
);
content = content.replace(
  'Yes. PropLedger is built for portfolio-scale operations. You can add unlimited properties, units, and tenants. The subledger tracks each unit independently while giving you a consolidated financial view across your entire portfolio.',
  'Yes. PropLedger is built for any size portfolio. You can add unlimited properties, buildings, and apartments. The system tracks each unit\'s rent and expenses individually while giving you an all-in-one financial summary across all your properties.'
);

// SECTION 9: Completely replace Developer with Enterprise Security & Reliability Section
const newSection9 = `  <!-- SECTION 9: ENTERPRISE SECURITY & RELIABILITY INFOGRAPHICS -->
  <section id="security" class="py-24 px-6 bg-[#0B1736] text-white relative overflow-hidden">
    <!-- Blueprint Grid overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-25" style="background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 48px 48px;"></div>
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto space-y-16 relative z-10">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Enterprise-Grade Security &amp; 99.9% Reliability</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Protected by <span class="text-[#38BDF8]">Bank-Grade Security</span>
        </h2>
        <p class="text-blue-200/80 text-sm sm:text-base leading-relaxed">
          PropLedger safeguards your rental operations with end-to-end encryption, automated schedule conflict prevention, and 24/7 cloud reliability.
        </p>
      </div>

      <!-- 4 Pillars of Trust Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Pillar 1 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#38BDF8]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-mono font-bold text-base">
            01
          </div>
          <div>
            <span class="text-[10px] font-mono text-[#38BDF8] uppercase font-bold tracking-wider block">Data Protection</span>
            <h4 class="text-base font-bold text-white mt-1">256-Bit Bank Encryption</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Encrypted online rent payments</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Private resident personal data</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Secure digital lease document storage</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Strict role-based account access</span></li>
          </ul>
        </div>

        <!-- Pillar 2 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#2563EB]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center font-mono font-bold text-base">
            02
          </div>
          <div>
            <span class="text-[10px] font-mono text-[#60A5FA] uppercase font-bold tracking-wider block">Scheduling Accuracy</span>
            <h4 class="text-base font-bold text-white mt-1">Double-Booking Defense</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Automated calendar locks</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Zero overlapping lease dates</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant move-in date verification</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>No human double-entry mistakes</span></li>
          </ul>
        </div>

        <!-- Pillar 3 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#00A896]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#00A896]/20 text-[#2DD4BF] flex items-center justify-center font-mono font-bold text-base">
            03
          </div>
          <div>
            <span class="text-[10px] font-mono text-[#2DD4BF] uppercase font-bold tracking-wider block">Financial Precision</span>
            <h4 class="text-base font-bold text-white mt-1">Automatic Bookkeeping</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant payment matching</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Automated receipts for tenants</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Full audit trail for every dollar</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>One-click tax &amp; profit summaries</span></li>
          </ul>
        </div>

        <!-- Pillar 4 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-400/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-base">
            04
          </div>
          <div>
            <span class="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider block">Cloud Uptime</span>
            <h4 class="text-base font-bold text-white mt-1">99.99% Reliability</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>24/7 online tenant rent portal</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Continuous automatic backups</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Fast loading on phone &amp; desktop</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant maintenance alerts</span></li>
          </ul>
        </div>
      </div>

      <!-- Comparison: Traditional Spreadsheets vs PropLedger Protected Platform -->
      <div class="bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 space-y-8">
        <div class="border-b border-white/10 pb-6">
          <span class="text-xs font-bold text-[#00A896] uppercase tracking-wider font-mono">Operations Comparison</span>
          <h3 class="text-2xl font-black text-white mt-1">Traditional Property Methods vs. PropLedger Protected Platform</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- The Old Way -->
          <div class="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">&times;</div>
              <h4 class="text-base font-bold text-red-200">The Old Way (Spreadsheets &amp; Paper Receipts)</h4>
            </div>
            <ul class="text-xs text-red-300/90 space-y-2.5">
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Tenants forget payment dates, requiring awkward manual reminders</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Risk of double-booking an apartment between different managers</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Hours spent every month manually calculating expenses and matching bank statements</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Lost paper checks, missing receipts, and stressful tax season audits</span></li>
            </ul>
          </div>

          <!-- The PropLedger Way -->
          <div class="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">&check;</div>
              <h4 class="text-base font-bold text-emerald-200">The PropLedger Way (Automated &amp; Protected)</h4>
            </div>
            <ul class="text-xs text-emerald-300 space-y-2.5">
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Automated friendly statements sent on the 1st of every month</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Smart calendar protection physically prevents any overlapping bookings</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Rent clears online with instant digital receipts for both tenant and landlord</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Clear, exportable financial statements ready anytime with zero manual math</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Trust Metrics & Badges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-white font-mono">99.99%</div>
          <div class="text-xs text-[#00A896] font-bold uppercase tracking-wider">Uptime SLA</div>
          <p class="text-[11px] text-slate-400">Always available for residents</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-[#38BDF8] font-mono">0.00%</div>
          <div class="text-xs text-[#38BDF8] font-bold uppercase tracking-wider">Double-Booking Rate</div>
          <p class="text-[11px] text-slate-400">Protected calendar locks</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">256-Bit</div>
          <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Bank Security</div>
          <p class="text-[11px] text-slate-400">Encrypted financial processing</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-[#F59E0B] font-mono">24/7</div>
          <div class="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">Automated Billing</div>
          <p class="text-[11px] text-slate-400">Effortless rent collection</p>
        </div>
      </div>

      <!-- Customer Callout Card -->
      <div class="p-8 rounded-3xl bg-gradient-to-r from-[#15337C] to-[#1D45A3] border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div class="space-y-1 text-center sm:text-left">
          <h4 class="text-xl font-black text-white">Ready to simplify your rental operations?</h4>
          <p class="text-xs text-blue-100">See how easy it is to manage your properties, collect rent online, and maintain crystal-clear financial records.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Portfolio Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-6 py-3 bg-white text-[#15337C] hover:bg-slate-100 font-black text-xs shadow-lg transition flex items-center gap-1.5">
            <span>Request a Free Demo</span>
            <span>&rarr;</span>
          </button>
          <a href="#concierge" class="pill-btn px-5 py-3 border border-white/40 hover:border-white text-white font-bold text-xs transition">
            Contact Support
          </a>
        </div>
      </div>

    </div>
  </section>`;

// Replace from `<!-- SECTION 9:` to `<!-- SECTION 10:`
const sec9Start = content.indexOf('<!-- SECTION 9:');
const sec10Start = content.indexOf('<!-- SECTION 10:');
if (sec9Start !== -1 && sec10Start !== -1) {
  content = content.substring(0, sec9Start) + newSection9 + '\n\n  ' + content.substring(sec10Start);
}

// Footer: Replace developer column & copyright
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

// Footer Brand Copy
content = content.replace(
  'Where property operations and financial clarity make sense. Autonomous subledger, calendar lease protection, and automated tenant billing.',
  'Where property operations and financial clarity make sense. Smart booking protection, automated monthly billing, and effortless rent collection.'
);

// Footer copyright
const oldFooterBottom = `<p>&copy; 2026 PropLedger Technologies &bull; Architected by Vishal Bhutekar (vishalbhutekar.me)</p>
      <p>Host: \${hostname} &bull; TLS 1.3 Protected</p>`;
const newFooterBottom = `<p>&copy; 2026 PropLedger Technologies. All rights reserved.</p>
      <p>Bank-Grade 256-Bit Security &bull; 99.9% Uptime SLA</p>`;
content = content.replace(oldFooterBottom, newFooterBottom);

// Floating Capsule Dock: Replace Developer button with Security
const oldDockDevBtn = `      <a href="#developer" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>Developer</span>
      </a>`;

const newDockDevBtn = `      <a href="#security" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2546A6] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-[#00A896]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Security</span>
      </a>`;

content = content.replace(oldDockDevBtn, newDockDevBtn);

// Payment Modal Receipt View: Add Lottie Container + sanitize name
const oldPaymentReceiptView = `      <!-- Success Receipt View -->
      <div id="paymentReceiptContainer" class="hidden space-y-5">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black mx-auto shadow-inner">
            &check;
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Settled & Reconciled!</h4>
          <p class="text-xs text-slate-500">Funds transferred and registered in PropLedger subledger.</p>
        </div>

        <div class="p-5 rounded-2xl space-y-3.5 bg-slate-50 border border-slate-200 text-xs font-mono">
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Transaction ID:</span>
            <span class="font-bold text-slate-900">TXN-2026-ACH-98214</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Cleared Amount:</span>
            <span class="font-bold text-emerald-600 text-sm">$3,250.00 USD</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Resident / Unit:</span>
            <span class="font-bold text-slate-900">Vishal Bhutekar &bull; Unit 402</span>
          </div>`;

const newPaymentReceiptView = `      <!-- Success Receipt View -->
      <div id="paymentReceiptContainer" class="hidden space-y-5">
        <div class="text-center space-y-2">
          <div id="lottiePaymentSuccess" class="w-16 h-16 mx-auto flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">
              &check;
            </div>
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Completed!</h4>
          <p class="text-xs text-slate-500">Your rent has been cleared and recorded to your resident statement.</p>
        </div>

        <div class="p-5 rounded-2xl space-y-3.5 bg-slate-50 border border-slate-200 text-xs font-mono">
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Transaction ID:</span>
            <span class="font-bold text-slate-900">TXN-2026-ACH-98214</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Cleared Amount:</span>
            <span class="font-bold text-emerald-600 text-sm">$3,250.00 USD</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Resident / Unit:</span>
            <span class="font-bold text-slate-900">Alex Morgan &bull; Unit 402</span>
          </div>`;

content = content.replace(oldPaymentReceiptView, newPaymentReceiptView);

// Tour Success Card: Add Lottie Container
const oldTourSuccessCard = `      <div id="tourSuccessCard" class="hidden space-y-4 text-center py-4">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
          &check;
        </div>
        <h4 class="text-lg font-bold text-slate-900">Tour Reservation Confirmed!</h4>`;

const newTourSuccessCard = `      <div id="tourSuccessCard" class="hidden space-y-4 text-center py-4">
        <div id="lottieTourSuccess" class="w-16 h-16 mx-auto flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold">
            &check;
          </div>
        </div>
        <h4 class="text-lg font-bold text-slate-900">Tour Reservation Confirmed!</h4>`;

content = content.replace(oldTourSuccessCard, newTourSuccessCard);

// Maintenance Success Card: Add Lottie Container
const oldMaintSuccessCard = `      <div id="maintSuccessCard" class="hidden space-y-4 text-center py-4 font-mono">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
          &check;
        </div>
        <h4 class="text-base font-bold text-slate-900">Work Order Created: TKT-2026-402-918</h4>`;

const newMaintSuccessCard = `      <div id="maintSuccessCard" class="hidden space-y-4 text-center py-4 font-mono">
        <div id="lottieMaintSuccess" class="w-16 h-16 mx-auto flex items-center justify-center">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
            &check;
          </div>
        </div>
        <h4 class="text-base font-bold text-slate-900">Work Order Created: TKT-2026-402-918</h4>`;

content = content.replace(oldMaintSuccessCard, newMaintSuccessCard);

// Modal container classes for smooth entrance animations
content = content.replace(
  'id="paymentModal" onclick="if(event.target === this) closePaymentModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">',
  'id="paymentModal" onclick="if(event.target === this) closePaymentModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">'
);
content = content.replace(
  'id="tourModal" onclick="if(event.target === this) closeTourModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">',
  'id="tourModal" onclick="if(event.target === this) closeTourModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">'
);
content = content.replace(
  'id="maintenanceModal" onclick="if(event.target === this) closeMaintenanceModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">',
  'id="maintenanceModal" onclick="if(event.target === this) closeMaintenanceModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">'
);

// Payment submit process steps text
content = content.replace(
  "btn.innerHTML = '<span class=\"animate-spin mr-2\">&#9696;</span> Step 1/3: Encrypting via 256-bit TLS...';",
  "btn.innerHTML = '<span class=\"animate-spin mr-2\">&#9696;</span> Step 1/3: Securing payment with 256-bit encryption...';"
);
content = content.replace(
  "btn.innerHTML = '<span class=\"animate-spin mr-2\">&#9696;</span> Step 2/3: Validating Subledger...';",
  "btn.innerHTML = '<span class=\"animate-spin mr-2\">&#9696;</span> Step 2/3: Verifying payment details...';"
);
content = content.replace(
  "btn.innerHTML = '<span class=\"animate-spin mr-2\">&#9696;</span> Step 3/3: Settling to Escrow...';",
  "btn.innerHTML = '<span class=\"animate-spin mr-2\">&#9696;</span> Step 3/3: Confirming bank clearance...';"
);
content = content.replace(
  '<span>256-Bit Bank Grade Encryption &bull; Instant Subledger Clearance</span>',
  '<span>256-Bit Bank Grade Encryption &bull; Instant Payment Confirmation</span>'
);

// In payment modal input:
content = content.replace(
  '<input type="text" value="Vishal Bhutekar" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">',
  '<input type="text" value="Alex Morgan" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">'
);
content = content.replace(
  '<p class="text-xs text-slate-500 font-mono">Unit 402 &bull; Vishal Bhutekar</p>',
  '<p class="text-xs text-slate-500 font-mono">Unit 402 &bull; Alex Morgan</p>'
);

// In maintenance ticket submission script:
content = content.replace(
  "senderName: 'Vishal Bhutekar (Unit 402)',",
  "senderName: 'Alex Morgan (Unit 402)',"
);
content = content.replace(
  "senderEmail: 'vishal.bhutekar1@gmail.com',",
  "senderEmail: 'alex.morgan@example.com',"
);
content = content.replace(
  "message: ['Resident: Vishal Bhutekar', 'Unit: 402', 'Category: ' + maintCategory, 'Priority: ' + maintUrgency, 'Details: ' + desc].join('\\\\n')",
  "message: ['Resident: Alex Morgan', 'Unit: 402', 'Category: ' + maintCategory, 'Priority: ' + maintUrgency, 'Details: ' + desc].join('\\\\n')"
);

// Add Lottie helper and trigger functions into <script>
const scriptEndTag = '    // ── Mobile Navigation Menu ─────────────────────────────────────';
const lottieHelperAndScrollspy = `    // ── Open-Source Lottie Animation Helper (Reduced-Motion Compliant) ─
    function playLottie(containerId, animationPath, fallbackSvg) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      
      const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced || typeof lottie === 'undefined') {
        container.innerHTML = fallbackSvg || '<div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">&check;</div>';
        return;
      }
      
      try {
        lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path: animationPath
        });
      } catch (err) {
        container.innerHTML = fallbackSvg || '<div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">&check;</div>';
      }
    }

    // ── Active Navigation Scrollspy ────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link');

      function updateActiveNav() {
        let current = '';
        const scrollPos = window.scrollY + 160;
        sections.forEach(sec => {
          const top = sec.offsetTop;
          const height = sec.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = '#' + sec.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.remove('active-nav');
          if (link.getAttribute('href') === current) {
            link.classList.add('active-nav');
          }
        });
      }

      window.addEventListener('scroll', updateActiveNav, { passive: true });
      updateActiveNav();
    });

    ${scriptEndTag}`;

content = content.replace(scriptEndTag, lottieHelperAndScrollspy);

// Hook up playLottie in processTestPayment
content = content.replace(
  "document.getElementById('receiptTimestamp').innerText = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US');",
  "document.getElementById('receiptTimestamp').innerText = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US');\n        playLottie('lottiePaymentSuccess', '/animations/payment-success.json', '<div class=\"w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner\">&check;</div>');"
);

// Hook up playLottie in submitTourRequest
content = content.replace(
  "document.getElementById('tourSuccessCard').classList.remove('hidden');",
  "document.getElementById('tourSuccessCard').classList.remove('hidden');\n      playLottie('lottieTourSuccess', '/animations/tour-success.json', '<div class=\"w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold\">&check;</div>');"
);

// Hook up playLottie in submitMaintenanceTicket
content = content.replace(
  "document.getElementById('maintSuccessCard').classList.remove('hidden');",
  "document.getElementById('maintSuccessCard').classList.remove('hidden');\n      playLottie('lottieMaintSuccess', '/animations/maint-success.json', '<div class=\"w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold\">&check;</div>');"
);

// Update renderAdminPage developer email display to System Administrator
content = content.replace('<span>vishal.bhutekar1@gmail.com</span>', '<span>admin@propledger.com</span>');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Update complete! Target file rewritten successfully.');
