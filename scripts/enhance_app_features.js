const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');
let content = raw.replace(/\r\n/g, '\n');

// 1. Add Toast Container right after <body ...>
const bodyTagRegex = /<body class="[^"]*">/;
const matchBody = content.match(bodyTagRegex);
if (matchBody) {
  const toastContainerHtml = `\n  <!-- Floating Toast Notification System -->\n  <div id="toastContainer" class="fixed top-6 right-6 z-[70] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0"></div>\n`;
  content = content.replace(matchBody[0], matchBody[0] + toastContainerHtml);
}

// 2. Add New Modals: Add Unit Modal and View Lease Agreement Modal (before <script>)
const newModalsHtml = `  <!-- 3. ADD APARTMENT UNIT MODAL (Landlord Tool) -->
  <div id="addUnitModal" onclick="if(event.target === this) closeAddUnitModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 modal-card-animate overflow-hidden">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900">Add New Apartment</h4>
            <p class="text-xs text-slate-500">Register a unit into your property roster</p>
          </div>
        </div>
        <button onclick="closeAddUnitModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-slate-700 uppercase mb-1">Unit Number / Identifier</label>
          <input type="text" id="newUnitId" placeholder="e.g. Unit 305" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Floor Plan Type</label>
            <select id="newUnitType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
              <option value="1-Bed Studio">1-Bed Studio</option>
              <option value="1-Bed Luxury">1-Bed Luxury</option>
              <option value="2-Bed Suite" selected>2-Bed Suite</option>
              <option value="3-Bed Townhome">3-Bed Townhome</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ($)</label>
            <input type="number" id="newUnitRent" placeholder="2200" value="2200" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 uppercase mb-1">Assigned Resident Name (Optional)</label>
          <input type="text" id="newUnitTenant" placeholder="Leave blank if currently vacant" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>
      </div>

      <div class="pt-2 flex items-center justify-end gap-2.5">
        <button onclick="closeAddUnitModal()" class="pill-btn px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition">Cancel</button>
        <button onclick="submitNewUnit()" class="pill-btn px-5 py-2.5 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5">
          <span>Save to Property Roster</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 4. VIEW LEASE AGREEMENT MODAL (Resident & Landlord Tool) -->
  <div id="leaseModal" onclick="if(event.target === this) closeLeaseModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 modal-card-animate overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900">Residential Lease Agreement</h4>
            <p class="text-xs text-slate-500">Contract #LSE-2026-402-01 &bull; Active</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
          &check; Digitally Signed
        </span>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs leading-relaxed">
        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <span class="text-slate-500 block">Property & Unit:</span>
            <span class="font-bold text-slate-900">The Grand Horizon &bull; Penthouse #402</span>
          </div>
          <div>
            <span class="text-slate-500 block">Primary Resident:</span>
            <span class="font-bold text-slate-900">Alex Morgan</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <span class="text-slate-500 block">Lease Term:</span>
            <span class="font-bold text-slate-900">Sep 01, 2026 – Aug 31, 2027</span>
          </div>
          <div>
            <span class="text-slate-500 block">Monthly Rent:</span>
            <span class="font-bold text-emerald-600">$2,850.00 / month</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pb-2">
          <div>
            <span class="text-slate-500 block">Security Deposit:</span>
            <span class="font-bold text-slate-900">$2,850.00 (Escrow Protected)</span>
          </div>
          <div>
            <span class="text-slate-500 block">Parking Stall:</span>
            <span class="font-bold text-slate-900">Assigned Bay #14</span>
          </div>
        </div>
      </div>

      <div class="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-blue-900 text-xs flex items-center gap-2.5">
        <svg class="w-4 h-4 text-[#2546A6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>This lease is locked into the schedule. Overlapping bookings are permanently prevented.</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <button onclick="window.print()" class="pill-btn px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          <span>Print Agreement</span>
        </button>
        <button onclick="closeLeaseModal()" class="pill-btn px-6 py-2 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs font-bold transition">Done</button>
      </div>
    </div>
  </div>\n`;

content = content.replace('  <script>', newModalsHtml + '\n  <script>');

// 3. Upgrade Landlord Roster Toolbar (Search input + Export CSV + Add Unit)
const oldLandlordHeader = `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="font-bold text-sm text-slate-900">Current Unit Roster & Lease Tracking</h4>
              <p class="text-xs text-slate-500">Real-time status of all apartments under management</p>
            </div>
            <button onclick="dispatchBatchBills()" id="batchDispatchBtn" class="pill-btn px-5 py-2.5 bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>Batch Send Monthly Invoices</span>
            </button>
          </div>`;

const newLandlordHeader = `<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h4 class="font-bold text-sm text-slate-900">Current Unit Roster & Lease Tracking</h4>
              <p class="text-xs text-slate-500">Real-time status of all apartments under management</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <input type="text" id="rosterSearchInput" oninput="filterRosterTable()" placeholder="Search unit, tenant, or rent..." class="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2546A6] transition">
              <button onclick="exportRentRollCsv()" class="pill-btn px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition" title="Download Excel/CSV Spreadsheet">
                <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Export CSV</span>
              </button>
              <button onclick="openAddUnitModal()" class="pill-btn px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span>Add Unit</span>
              </button>
              <button onclick="dispatchBatchBills()" id="batchDispatchBtn" class="pill-btn px-4 py-1.5 bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Send Invoices</span>
              </button>
            </div>
          </div>`;

content = content.replace(oldLandlordHeader, newLandlordHeader);

// 4. Upgrade Tenant Portal with AutoPay toggle and View Lease button
const oldTenantLeftCardBtn = `<button onclick="openPaymentModal()" class="w-full py-3 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pay October Rent ($3,250.00)</span>
            </button>`;

const newTenantLeftCardWithAutoPay = `<!-- AutoPay Quick Strip -->
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-slate-900">AutoPay (1st of month)</p>
                  <p id="autopayStatusText" class="text-[10px] text-emerald-600 font-medium">Active &bull; Chase &bull;&bull;&bull;&bull;8421</p>
                </div>
              </div>
              <button id="autopayToggleBtn" onclick="toggleAutoPay()" role="switch" aria-checked="true" class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none">
                <span id="autopayToggleKnob" class="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <button onclick="openPaymentModal()" class="w-full py-3 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pay October Rent ($3,250.00)</span>
            </button>`;

content = content.replace(oldTenantLeftCardBtn, newTenantLeftCardWithAutoPay);

// Add View Lease button in statement action buttons
const oldTenantStatementBtns = `<button onclick="downloadStatementPdf()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>Download PDF</span>
                </button>`;

const newTenantStatementBtns = `<button onclick="openLeaseModal()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span>View Lease</span>
                </button>
                <button onclick="downloadStatementPdf()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>Download PDF</span>
                </button>`;

content = content.replace(oldTenantStatementBtns, newTenantStatementBtns);

// 5. Upgrade Unit Gallery with Search Bar & Bedroom Filter Chips
const oldUnitGalleryHeader = `      <!-- Filter Buttons -->
      <div class="flex items-center gap-2 p-1.5 bg-slate-100 rounded-full border border-slate-200 self-start md:self-auto">
        <button onclick="filterUnits('all')" id="filterBtn-all" class="pill-btn px-4 py-1.5 text-xs font-bold active-tab">All Units</button>
        <button onclick="filterUnits('available')" id="filterBtn-available" class="pill-btn px-4 py-1.5 text-xs font-bold inactive-tab">Available Now</button>
        <button onclick="filterUnits('leased')" id="filterBtn-leased" class="pill-btn px-4 py-1.5 text-xs font-bold inactive-tab">Leased</button>
      </div>
    </div>`;

const newUnitGalleryHeader = `      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto w-full md:w-auto">
        <div class="relative">
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="unitSearchInput" oninput="filterUnitsCombined()" placeholder="Search residences..." class="pl-8 pr-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2546A6] transition w-full sm:w-44">
        </div>
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto">
          <button onclick="setBedroomFilter('all', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold active-tab">All</button>
          <button onclick="setBedroomFilter('studio', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Studio</button>
          <button onclick="setBedroomFilter('2bed', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">2-Bed</button>
          <button onclick="setBedroomFilter('penthouse', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Penthouse</button>
          <button onclick="setBedroomFilter('available', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Available</button>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
      <span id="unitResultsCount">Showing 4 of 4 Luxury Residences</span>
      <span class="text-emerald-700 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Live Inventory Guaranteed</span>
    </div>`;

content = content.replace(oldUnitGalleryHeader, newUnitGalleryHeader);

// Add bedroom data attributes to unit cards for instant multi-filtering
content = content.replace(
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="leased">',
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="studio">'
);
content = content.replace(
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="leased">',
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="2bed">'
);
content = content.replace(
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="leased">',
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="penthouse">'
);
content = content.replace(
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="available">',
  '<div class="koshpal-card overflow-hidden group unit-card" data-status="available" data-type="2bed">'
);

// 6. Upgrade FAQ section to interactive expandable accordions with search input
const oldFaqContainer = `      <div class="space-y-4">
        
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
          <h3 class="font-bold text-base text-slate-900">Can I manage multiple properties at once?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Yes. PropLedger is built for any size portfolio. You can add unlimited properties, buildings, and apartments. The system tracks each unit's rent and expenses individually while giving you an all-in-one financial summary across all your properties.
          </p>
        </div>

      </div>`;

const newFaqContainer = `      <!-- FAQ Search Bar -->
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

content = content.replace(oldFaqContainer, newFaqContainer);

// 7. Add all new JavaScript handlers
const newJsHandlers = `
    // ── Toast Notification System ──────────────────────────────────
    function showToast(title, message, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      const isSuccess = type === 'success';
      const bgClass = 'bg-white border-slate-200 text-slate-800';
      const iconColor = isSuccess ? 'text-emerald-600 bg-emerald-50' : 'text-[#2546A6] bg-blue-50';
      const iconSvg = isSuccess 
        ? '<svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><polyline points=\"20 6 9 17 4 12\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>'
        : '<svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\" stroke-width=\"2\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\" stroke-width=\"2\"/><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\" stroke-width=\"2\"/></svg>';
      
      toast.className = 'pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 transform translate-y-2 opacity-0 transition-all duration-300 ' + bgClass;
      toast.innerHTML = '<div class=\"w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ' + iconColor + '\">' + iconSvg + '</div>' +
        '<div class=\"flex-1 min-w-0\"><p class=\"text-xs font-bold text-slate-900\">' + title + '</p><p class=\"text-[11px] text-slate-600 mt-0.5 leading-relaxed\">' + message + '</p></div>' +
        '<button onclick=\"this.parentElement.remove()\" class=\"text-slate-400 hover:text-slate-600 text-base font-bold ml-1\">&times;</button>';
      
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // ── Export Rent Roll as CSV Spreadsheet ────────────────────────
    function exportRentRollCsv() {
      const rows = [
        ['Unit', 'Floor Plan Type', 'Resident Name', 'Monthly Rent (USD)', 'Lease Status', 'Payment Status'],
        ['Unit 101', '1-Bed Studio', 'Sarah Connor', '1650.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 204', '2-Bed Suite', 'Alex Mercer', '2400.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 402', 'Horizon Penthouse', 'Alex Morgan', '2850.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 503', 'Skyline Loft', 'Vacant', '3100.00', 'Available Now', 'Unoccupied']
      ];
      
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'PropLedger_RentRoll_September2026.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Rent Roll Exported', 'Downloaded PropLedger_RentRoll_September2026.csv successfully.');
    }

    // ── Add Unit Modal Logic ───────────────────────────────────────
    function openAddUnitModal() {
      const m = document.getElementById('addUnitModal');
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeAddUnitModal() {
      const m = document.getElementById('addUnitModal');
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    function submitNewUnit() {
      const unitId = document.getElementById('newUnitId').value || 'Unit 305';
      const unitType = document.getElementById('newUnitType').value;
      const rent = document.getElementById('newUnitRent').value || '2200';
      const tenant = document.getElementById('newUnitTenant').value.trim() || 'None (Vacant)';
      const isVacant = tenant === 'None (Vacant)';

      const tbody = document.querySelector('#viewLandlord table tbody');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.className = 'border-t border-slate-100 bg-emerald-50/30 transition';
        tr.innerHTML = '<td class=\"py-3 font-bold text-slate-900\">' + unitId + '</td>' +
          '<td class=\"py-3 text-slate-600\">' + unitType + '</td>' +
          '<td class=\"py-3 ' + (isVacant ? 'text-slate-400 italic' : 'text-slate-800 font-medium') + '\">' + tenant + '</td>' +
          '<td class=\"py-3 font-bold text-slate-900\">$' + parseFloat(rent).toLocaleString('en-US', { minimumFractionDigits: 2 }) + '</td>' +
          '<td class=\"py-3\"><span class=\"px-2.5 py-1 rounded-full ' + (isVacant ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700') + ' font-semibold text-[11px]\">' + (isVacant ? 'Available Now' : 'Active Lease') + '</span></td>' +
          '<td class=\"py-3 text-right\"><span class=\"' + (isVacant ? 'text-amber-600' : 'text-emerald-600') + ' font-bold text-[11px]\">' + (isVacant ? 'Vacant' : 'Active (Oct 01)') + '</span></td>';
        tbody.appendChild(tr);
      }

      closeAddUnitModal();
      showToast('Unit Added to Roster', unitId + ' (' + unitType + ') registered at $' + parseFloat(rent).toLocaleString() + '/mo.');
    }

    // ── Filter Landlord Roster in Real Time ────────────────────────
    function filterRosterTable() {
      const q = document.getElementById('rosterSearchInput').value.toLowerCase();
      document.querySelectorAll('#viewLandlord table tbody tr').forEach(tr => {
        const text = tr.innerText.toLowerCase();
        tr.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // ── AutoPay Enrollment Switch ──────────────────────────────────
    let autoPayEnabled = true;
    function toggleAutoPay() {
      autoPayEnabled = !autoPayEnabled;
      const btn = document.getElementById('autopayToggleBtn');
      const knob = document.getElementById('autopayToggleKnob');
      const statusText = document.getElementById('autopayStatusText');

      if (autoPayEnabled) {
        btn.className = 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none';
        knob.className = 'translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        statusText.innerText = 'Active • Chase ••••8421';
        statusText.className = 'text-[10px] text-emerald-600 font-medium';
        showToast('AutoPay Activated', 'Monthly rent ($3,250.00) will be automatically cleared on the 1st of every month.');
      } else {
        btn.className = 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 transition-colors duration-200 ease-in-out focus:outline-none';
        knob.className = 'translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        statusText.innerText = 'Paused • Manual monthly payment required';
        statusText.className = 'text-[10px] text-amber-600 font-medium';
        showToast('AutoPay Paused', 'Automatic rent deduction has been turned off.', 'info');
      }
    }

    // ── Digital Lease Agreement Modal ──────────────────────────────
    function openLeaseModal() {
      const m = document.getElementById('leaseModal');
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeLeaseModal() {
      const m = document.getElementById('leaseModal');
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    // ── Combined Unit Gallery Filter (Search + Bedroom category) ────
    let activeBedFilter = 'all';

    function setBedroomFilter(category, btn) {
      activeBedFilter = category;
      document.querySelectorAll('.bed-btn').forEach(b => {
        b.className = 'bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab';
      });
      btn.className = 'bed-btn pill-btn px-3 py-1 text-xs font-bold active-tab';
      filterUnitsCombined();
    }

    function filterUnitsCombined() {
      const search = (document.getElementById('unitSearchInput') ? document.getElementById('unitSearchInput').value.toLowerCase() : '');
      const cards = document.querySelectorAll('.unit-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const cardText = card.innerText.toLowerCase();
        const status = card.getAttribute('data-status');
        const type = card.getAttribute('data-type') || '';

        const matchesSearch = !search || cardText.includes(search);
        let matchesCategory = true;
        if (activeBedFilter === 'available') {
          matchesCategory = status === 'available';
        } else if (activeBedFilter !== 'all') {
          matchesCategory = type === activeBedFilter;
        }

        if (matchesSearch && matchesCategory) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const countEl = document.getElementById('unitResultsCount');
      if (countEl) {
        countEl.innerText = 'Showing ' + visibleCount + ' of ' + cards.length + ' Luxury Residences';
      }
    }

    // ── Filter FAQ Questions in Real Time ──────────────────────────
    function filterFaqQuestions() {
      const query = (document.getElementById('faqSearchInput') ? document.getElementById('faqSearchInput').value.toLowerCase() : '');
      document.querySelectorAll('#faqAccordionList details').forEach(d => {
        const text = d.innerText.toLowerCase();
        if (!query || text.includes(query)) {
          d.style.display = '';
          if (query) d.open = true;
        } else {
          d.style.display = 'none';
        }
      });
    }
`;

content = content.replace('    // ── Mobile Navigation Menu ─────────────────────────────────────', newJsHandlers + '\n    // ── Mobile Navigation Menu ─────────────────────────────────────');

// Update Escape key listener to also close addUnitModal and leaseModal
content = content.replace(
  'closeMaintenanceModal();',
  'closeMaintenanceModal();\n        closeAddUnitModal();\n        closeLeaseModal();'
);

// Format and write back
fs.writeFileSync(targetPath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('App user features and theme enhancements applied successfully!');
