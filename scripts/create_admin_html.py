# -*- coding: utf-8 -*-
"""
Constructs the complete renderAdminPage HTML and JavaScript for the PropLedger Executive Dashboard
"""

def get_admin_html():
    return r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger Executive Operations Center | Master Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .soft-card { background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.85); border-radius: 24px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .soft-card:hover { box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.02); }
    .soft-inner { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 16px; }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1px); }
    .tab-active { background-color: #1e293b !important; color: #ffffff !important; box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.25); }
    .chart-tooltip { pointer-events: none; transition: opacity 0.15s ease, transform 0.15s ease; }
    .modal-backdrop { background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); }
  </style>
</head>
<body class="min-h-screen antialiased bg-slate-50 text-slate-900 pb-32">

  <!-- Toast Container -->
  <div id="toastContainer" class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"></div>

  <!-- Sticky Executive Header -->
  <div class="sticky top-4 z-50 px-4 max-w-7xl mx-auto">
    <header class="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full px-6 py-3.5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] flex items-center justify-between">
      
      <!-- Brand & Subdomain -->
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-emerald-500/20">
          P
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">PropLedger Executive</span>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Operations Center
            </span>
          </div>
          <p class="text-[11px] text-slate-500 font-mono tracking-tight flex items-center gap-2">
            <span>${hostname}</span>
            <span class="text-slate-300">&bull;</span>
            <span id="liveClock" class="text-slate-600 font-semibold"></span>
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-3">
        <div class="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span id="currentDateBadge">Saturday, Sep 12, 2026</span>
        </div>
        
        <a href="https://propledger.vishalbhutekar.me" class="pill-btn text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5">
          <span>&larr;</span>
          <span>Public Portal</span>
        </a>
      </div>
    </header>
  </div>

  <!-- Main Executive Dashboard Container -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

    <!-- Top Executive Navigation Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button onclick="switchTab('properties')" id="tabBtn-properties" class="tab-btn tab-active px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span>🏢</span>
        <span>Properties & Units</span>
        <span id="badge-propCount" class="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-800 font-mono font-bold">3</span>
      </button>

      <button onclick="switchTab('users')" id="tabBtn-users" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span>👥</span>
        <span>User Management</span>
        <span id="badge-userCount" class="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-800 font-mono font-bold">7</span>
      </button>

      <button onclick="switchTab('financials')" id="tabBtn-financials" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span>📈</span>
        <span>Financials & Profits</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">73.9% Net</span>
      </button>

      <button onclick="switchTab('tasks')" id="tabBtn-tasks" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span>🛠️</span>
        <span>Real-Time Tasks</span>
        <span id="badge-taskCount" class="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">5</span>
      </button>

      <button onclick="switchTab('activity')" id="tabBtn-activity" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span>📅</span>
        <span>Today's Activity</span>
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </button>

      <button onclick="switchTab('diagnostics')" id="tabBtn-diagnostics" class="tab-btn px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-nowrap">
        <span>⚙️</span>
        <span>System & Mail</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 1: PROPERTIES & UNITS -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <div id="tabContent-properties" class="tab-pane space-y-6">
      
      <!-- KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Properties Managed</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-totalProperties" class="text-2xl sm:text-3xl font-black text-slate-900">3</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">100% Active</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Austin & San Francisco</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-totalUnits" class="text-2xl sm:text-3xl font-black text-slate-900">48</span>
            <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">46 Occupied</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">2 Units In Turnover</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-occupancyRate" class="text-2xl sm:text-3xl font-black text-emerald-700">95.8%</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">+2.1% MoM</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Industry avg: 92.4%</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Monthly Roll</p>
          <div class="flex items-baseline justify-between mt-2">
            <span id="stat-grossRentRoll" class="text-2xl sm:text-3xl font-black text-slate-900">$148,250</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Sep 2026</span>
          </div>
          <p class="text-xs text-slate-500 mt-2">Annualized: $1.78M</p>
        </div>
      </div>

      <!-- Action & Filter Bar -->
      <div class="soft-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 sm:w-80">
            <input type="text" id="propertySearch" oninput="filterProperties()" placeholder="Search properties, address, city..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button onclick="setPropFilter('all')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm" data-filter="all">All</button>
            <button onclick="setPropFilter('Multifamily')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="Multifamily">Multifamily</button>
            <button onclick="setPropFilter('Residential')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="Residential">Residential</button>
            <button onclick="setPropFilter('Commercial')" class="prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="Commercial">Commercial</button>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onclick="openModal('addPropertyModal')" class="pill-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Add New Property</span>
          </button>
          <button onclick="openModal('addUnitModal')" class="pill-btn px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 flex items-center gap-2">
            <span>+ Add Unit</span>
          </button>
        </div>
      </div>

      <!-- Properties Roster Grid -->
      <div id="propertiesGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 2: USER MANAGEMENT & ROLES -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <div id="tabContent-users" class="tab-pane hidden space-y-6">
      
      <!-- Users KPI Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Directory Accounts</p>
          <p id="stat-usersTotal" class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">7</p>
          <p class="text-xs text-slate-500 mt-2">Across all 5 permission roles</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Residents & Tenants</p>
          <p id="stat-usersTenants" class="text-2xl sm:text-3xl font-black text-blue-600 mt-2">3</p>
          <p class="text-xs text-slate-500 mt-2">Active leases on file</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property Managers</p>
          <p id="stat-usersManagers" class="text-2xl sm:text-3xl font-black text-indigo-600 mt-2">1</p>
          <p class="text-xs text-slate-500 mt-2">Regional Operations</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Technicians</p>
          <p id="stat-usersTechs" class="text-2xl sm:text-3xl font-black text-amber-600 mt-2">1</p>
          <p class="text-xs text-slate-500 mt-2">Field emergency dispatch</p>
        </div>
      </div>

      <!-- Action & Search Bar -->
      <div class="soft-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div class="relative flex-1 sm:w-80">
            <input type="text" id="userSearch" oninput="filterUsers()" placeholder="Search user name, email, unit..." class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button onclick="setUserFilter('all')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm" data-filter="all">All</button>
            <button onclick="setUserFilter('TENANT')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="TENANT">Tenants</button>
            <button onclick="setUserFilter('PROPERTY_MANAGER')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="PROPERTY_MANAGER">Managers</button>
            <button onclick="setUserFilter('MAINTENANCE_TECH')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="MAINTENANCE_TECH">Techs</button>
            <button onclick="setUserFilter('SUPER_ADMIN')" class="user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900" data-filter="SUPER_ADMIN">Admins</button>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onclick="exportUsersCSV()" class="pill-btn px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>Export Directory (CSV)</span>
          </button>
          <button onclick="openModal('addUserModal')" class="pill-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Add New User</span>
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="soft-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">User Details</th>
                <th class="px-6 py-4">Role / Permissions</th>
                <th class="px-6 py-4">Property & Unit</th>
                <th class="px-6 py-4">Phone Contact</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="usersTableBody" class="divide-y divide-slate-100 text-slate-700"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 3: FINANCIAL ANALYTICS & PROFIT GRAPHS -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <div id="tabContent-financials" class="tab-pane hidden space-y-6">
      
      <!-- 5 KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Monthly Income</p>
          <p class="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">$148,250</p>
          <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-emerald-100">+8.4% MoM</span>
        </div>

        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Expenses</p>
          <p class="text-xl sm:text-2xl font-black text-rose-600 mt-1.5">$38,620</p>
          <span class="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-2 inline-block">26.1% Expense Ratio</span>
        </div>

        <div class="soft-card p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border-emerald-200">
          <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Operating Profit</p>
          <p class="text-xl sm:text-2xl font-black text-emerald-900 mt-1.5">$109,630</p>
          <span class="text-[11px] font-extrabold text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full mt-2 inline-block">73.9% Profit Margin</span>
        </div>

        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rent Collection Rate</p>
          <p class="text-xl sm:text-2xl font-black text-indigo-700 mt-1.5">96.8%</p>
          <span class="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-indigo-100">47 of 49 Paid</span>
        </div>

        <div class="soft-card p-5">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Overdue</p>
          <p class="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">$4,800</p>
          <span class="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-block border border-amber-100">2 Accounts Grace</span>
        </div>
      </div>

      <!-- Main Visual Graph: Income vs Expenses vs Net Profit -->
      <div class="soft-card p-6 sm:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Portfolio Financial Growth: Gross Income, Expenses & Net Profit (2026)</h2>
            <p class="text-xs text-slate-500">Interactive Month-by-Month Performance & Cashflow Velocity Curve</p>
          </div>
          <div class="flex items-center gap-4 text-xs font-bold">
            <div class="flex items-center gap-1.5 text-blue-600">
              <span class="w-3 h-3 rounded-full bg-blue-600"></span>
              <span>Gross Income</span>
            </div>
            <div class="flex items-center gap-1.5 text-emerald-600">
              <span class="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Net Profit</span>
            </div>
            <div class="flex items-center gap-1.5 text-rose-500">
              <span class="w-3 h-3 rounded-full bg-rose-500"></span>
              <span>Operating Expenses</span>
            </div>
          </div>
        </div>

        <!-- SVG Multi-Series Interactive Area Chart -->
        <div class="relative w-full overflow-hidden">
          <svg id="financialChartSvg" viewBox="0 0 900 320" class="w-full h-64 sm:h-80 overflow-visible">
            <defs>
              <linearGradient id="incomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0"/>
              </linearGradient>
              <linearGradient id="profitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#059669" stop-opacity="0.28"/>
                <stop offset="100%" stop-color="#059669" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- Y-Axis Grid Lines & Labels -->
            <line x1="50" y1="40" x2="880" y2="40" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="44" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">$150k</text>

            <line x1="50" y1="100" x2="880" y2="100" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="104" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">$120k</text>

            <line x1="50" y1="160" x2="880" y2="160" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="164" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">$90k</text>

            <line x1="50" y1="220" x2="880" y2="220" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
            <text x="40" y="224" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">$50k</text>

            <line x1="50" y1="270" x2="880" y2="270" stroke="#cbd5e1" stroke-width="1.5"/>
            <text x="40" y="274" text-anchor="end" fill="#94a3b8" font-size="10" font-family="JetBrains Mono">$0</text>

            <!-- Area Fills -->
            <polygon points="70,270 70,72 170,68 270,62 370,58 470,54 570,50 670,47 770,45 860,42 860,270" fill="url(#incomeGrad)" />
            <polygon points="70,270 70,128 170,124 270,120 370,115 470,115 570,110 670,110 770,106 860,107 860,270" fill="url(#profitGrad)" />

            <!-- Stroke Lines -->
            <!-- 1. Income Line (Blue) -->
            <path d="M 70,72 L 170,68 L 270,62 L 370,58 L 470,54 L 570,50 L 670,47 L 770,45 L 860,42" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- 2. Net Profit Line (Emerald) -->
            <path d="M 70,128 L 170,124 L 270,120 L 370,115 L 470,115 L 570,110 L 670,110 L 770,106 L 860,107" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- 3. Expenses Line (Rose) -->
            <path d="M 70,224 L 170,222 L 270,220 L 370,222 L 470,218 L 570,220 L 670,216 L 770,218 L 860,215" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="4" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Interactive Month Markers & Hover Targets -->
            <!-- Jan -->
            <circle cx="70" cy="72" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jan 2026', '$132,000', '$34,000', '$98,000')" onmouseleave="hideChartTip()"/>
            <circle cx="70" cy="128" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jan 2026', '$132,000', '$34,000', '$98,000')" onmouseleave="hideChartTip()"/>
            <text x="70" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Jan</text>

            <!-- Feb -->
            <circle cx="170" cy="68" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Feb 2026', '$135,000', '$35,000', '$100,000')" onmouseleave="hideChartTip()"/>
            <circle cx="170" cy="124" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Feb 2026', '$135,000', '$35,000', '$100,000')" onmouseleave="hideChartTip()"/>
            <text x="170" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Feb</text>

            <!-- Mar -->
            <circle cx="270" cy="62" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Mar 2026', '$138,000', '$36,000', '$102,000')" onmouseleave="hideChartTip()"/>
            <circle cx="270" cy="120" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Mar 2026', '$138,000', '$36,000', '$102,000')" onmouseleave="hideChartTip()"/>
            <text x="270" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Mar</text>

            <!-- Apr -->
            <circle cx="370" cy="58" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Apr 2026', '$140,000', '$35,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <circle cx="370" cy="115" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Apr 2026', '$140,000', '$35,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <text x="370" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Apr</text>

            <!-- May -->
            <circle cx="470" cy="54" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'May 2026', '$142,000', '$37,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <circle cx="470" cy="115" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'May 2026', '$142,000', '$37,000', '$105,000')" onmouseleave="hideChartTip()"/>
            <text x="470" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">May</text>

            <!-- Jun -->
            <circle cx="570" cy="50" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jun 2026', '$144,000', '$36,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <circle cx="570" cy="110" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jun 2026', '$144,000', '$36,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <text x="570" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Jun</text>

            <!-- Jul -->
            <circle cx="670" cy="47" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jul 2026', '$146,000', '$38,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <circle cx="670" cy="110" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Jul 2026', '$146,000', '$38,000', '$108,000')" onmouseleave="hideChartTip()"/>
            <text x="670" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Jul</text>

            <!-- Aug -->
            <circle cx="770" cy="45" r="5" fill="#2563eb" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Aug 2026', '$147,000', '$37,000', '$110,000')" onmouseleave="hideChartTip()"/>
            <circle cx="770" cy="106" r="5" fill="#059669" class="transition-all hover:r-7 cursor-pointer" onmouseenter="showChartTip(event, 'Aug 2026', '$147,000', '$37,000', '$110,000')" onmouseleave="hideChartTip()"/>
            <text x="770" y="295" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600">Aug</text>

            <!-- Sep (Current) -->
            <circle cx="860" cy="42" r="7" fill="#2563eb" stroke="#ffffff" stroke-width="2.5" class="transition-all hover:r-9 cursor-pointer" onmouseenter="showChartTip(event, 'Current (Sep 2026)', '$148,250', '$38,620', '$109,630')" onmouseleave="hideChartTip()"/>
            <circle cx="860" cy="107" r="7" fill="#059669" stroke="#ffffff" stroke-width="2.5" class="transition-all hover:r-9 cursor-pointer" onmouseenter="showChartTip(event, 'Current (Sep 2026)', '$148,250', '$38,620', '$109,630')" onmouseleave="hideChartTip()"/>
            <text x="860" y="295" text-anchor="middle" fill="#0f172a" font-weight="800" font-size="11">Sep (Now)</text>
          </svg>

          <!-- Floating Tooltip -->
          <div id="chartTipBox" class="chart-tooltip hidden absolute bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl text-xs space-y-1 z-20 pointer-events-none">
            <p id="tipMonth" class="font-bold text-slate-300"></p>
            <div class="flex items-center justify-between gap-4"><span class="text-blue-400">Income:</span><span id="tipIncome" class="font-mono font-bold"></span></div>
            <div class="flex items-center justify-between gap-4"><span class="text-rose-400">Expenses:</span><span id="tipExpense" class="font-mono font-bold"></span></div>
            <div class="flex items-center justify-between gap-4 pt-1 border-t border-slate-700"><span class="text-emerald-400 font-bold">Net Profit:</span><span id="tipProfit" class="font-mono font-bold text-emerald-400"></span></div>
          </div>
        </div>
      </div>

      <!-- Secondary Visual Graphs: Donut Revenue by Asset + Cashflow Waterfall -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Graph 2: Revenue by Asset -->
        <div class="soft-card p-6 sm:p-8 space-y-5">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Revenue Contribution by Property Asset</h3>
            <p class="text-xs text-slate-500">Gross Monthly Distribution of $148,250.00</p>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <!-- Donut Chart -->
            <div class="relative w-44 h-44 flex-shrink-0">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <!-- Grand Horizon (46.1%) -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1d4ed8" stroke-width="16" stroke-dasharray="110 238" stroke-dashoffset="0" />
                <!-- Skyline Bay (35.1%) -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="#0d9488" stroke-width="16" stroke-dasharray="84 238" stroke-dashoffset="-110" />
                <!-- Tech Nexus (18.8%) -->
                <circle cx="50" cy="50" r="38" fill="none" stroke="#7c3aed" stroke-width="16" stroke-dasharray="44 238" stroke-dashoffset="-194" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span class="text-xs text-slate-400 font-bold uppercase">Total Gross</span>
                <span class="text-lg font-black text-slate-900 font-mono">$148.2K</span>
              </div>
            </div>

            <!-- Legend List -->
            <div class="space-y-3 flex-1 text-xs">
              <div class="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-blue-700"></span>
                  <span class="font-bold text-slate-900">The Grand Horizon</span>
                </div>
                <div class="text-right font-mono">
                  <span class="font-bold text-slate-900">$68,400</span>
                  <span class="text-slate-500 text-[11px] block">(46.1%)</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-teal-600"></span>
                  <span class="font-bold text-slate-900">Skyline Bay Lofts</span>
                </div>
                <div class="text-right font-mono">
                  <span class="font-bold text-slate-900">$52,000</span>
                  <span class="text-slate-500 text-[11px] block">(35.1%)</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-purple-600"></span>
                  <span class="font-bold text-slate-900">Austin Tech Nexus</span>
                </div>
                <div class="text-right font-mono">
                  <span class="font-bold text-slate-900">$27,850</span>
                  <span class="text-slate-500 text-[11px] block">(18.8%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Graph 3: Cashflow Waterfall -->
        <div class="soft-card p-6 sm:p-8 space-y-5">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Operating Cashflow Waterfall</h3>
            <p class="text-xs text-slate-500">Inflows vs Expense Breakdown vs Net NOI</p>
          </div>

          <div class="space-y-3.5 pt-2 text-xs">
            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Residential Rents</span>
                <span class="font-mono text-emerald-700">+$118,000</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-emerald-600 h-full rounded-full" style="width: 79.6%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Commercial Office Leases</span>
                <span class="font-mono text-emerald-700">+$27,850</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 18.8%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Parking & Amenities Fees</span>
                <span class="font-mono text-emerald-700">+$2,400</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full rounded-full" style="width: 1.6%;"></div>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-100">
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Maintenance & Repair Outflows</span>
                <span class="font-mono text-rose-600">-$14,200</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full" style="width: 36.7%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Management & Leasing Fees</span>
                <span class="font-mono text-rose-600">-$11,500</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full" style="width: 29.7%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-slate-700">Municipal Utilities & Insurance</span>
                <span class="font-mono text-rose-600">-$12,920</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="bg-slate-400 h-full rounded-full" style="width: 33.6%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 4: REAL-TIME TASK OPERATIONS SUITE -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <div id="tabContent-tasks" class="tab-pane hidden space-y-6">
      
      <!-- Tasks Header & Filter Bar -->
      <div class="soft-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">Real-Time Operational Work Orders & Tasks</h2>
            <p class="text-xs text-slate-500">Live Kanban Workflow & Task Progression Engine</p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onclick="openModal('addTaskModal')" class="pill-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>+ Create New Task</span>
          </button>
        </div>
      </div>

      <!-- 4 Kanban Columns -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        
        <!-- Column 1: Backlog -->
        <div class="bg-slate-100/80 p-4 rounded-3xl border border-slate-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-200">
            <span class="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <span>📋</span>
              <span>Backlog / New</span>
            </span>
            <span id="count-backlog" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">1</span>
          </div>
          <div id="col-backlog" class="space-y-3 min-h-[140px]"></div>
        </div>

        <!-- Column 2: In Progress -->
        <div class="bg-blue-50/60 p-4 rounded-3xl border border-blue-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-blue-200">
            <span class="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
              <span>⚡</span>
              <span>In Progress</span>
            </span>
            <span id="count-in_progress" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">2</span>
          </div>
          <div id="col-in_progress" class="space-y-3 min-h-[140px]"></div>
        </div>

        <!-- Column 3: Review -->
        <div class="bg-amber-50/60 p-4 rounded-3xl border border-amber-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-amber-200">
            <span class="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <span>🔍</span>
              <span>Pending Review</span>
            </span>
            <span id="count-review" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">1</span>
          </div>
          <div id="col-review" class="space-y-3 min-h-[140px]"></div>
        </div>

        <!-- Column 4: Completed -->
        <div class="bg-emerald-50/60 p-4 rounded-3xl border border-emerald-200/80 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-emerald-200">
            <span class="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <span>✅</span>
              <span>Resolved</span>
            </span>
            <span id="count-completed" class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">1</span>
          </div>
          <div id="col-completed" class="space-y-3 min-h-[140px]"></div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 5: TODAY'S LIVE ACTIVITY & AUDIT STREAM -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <div id="tabContent-activity" class="tab-pane hidden space-y-6">
      
      <!-- Stamped Header Card -->
      <div class="soft-card p-8 bg-slate-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
        <div class="max-w-3xl space-y-3">
          <div class="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-Time Immutable Audit Ledger &bull; Live Stream</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Today's Operating Activity Log
          </h2>

          <p class="text-slate-300 text-sm leading-relaxed">
            Every property asset created, tenant registered, rent roll transaction dispatched, and work order advanced is cryptographically recorded with today's live timestamp: <strong class="text-white font-mono">Saturday, September 12, 2026</strong>.
          </p>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button onclick="downloadAuditJSON()" class="pill-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5">
            <span>Download Audit (JSON)</span>
          </button>
          <button onclick="resetDataToSeed()" class="pill-btn px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
            <span>&#8634; Reload Sample Seed</span>
          </button>
        </div>
      </div>

      <!-- Activity Timeline List -->
      <div class="soft-card p-6 sm:p-8 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">Chronological Event Timeline</h3>
          <span class="text-xs text-slate-500 font-mono">Auto-refreshed in Real-Time</span>
        </div>

        <div id="activityStreamContainer" class="divide-y divide-slate-100 space-y-1"></div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 6: SYSTEM DIAGNOSTICS & MAIL ENGINE -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <div id="tabContent-diagnostics" class="tab-pane hidden space-y-8">
      
      <!-- 4 System Infrastructure Status Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Portal</p>
          <p class="text-lg font-bold text-slate-900 mt-1">propledger</p>
          <p class="text-xs text-indigo-600 font-mono mt-1">vishalbhutekar.me</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Portal</p>
          <p class="text-lg font-bold text-slate-900 mt-1">admin</p>
          <p class="text-xs text-emerald-700 font-mono mt-1">Dedicated GTS SSL Active</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbound Concierge</p>
          <p class="text-lg font-bold text-slate-900 mt-1">support@</p>
          <p class="text-xs text-indigo-600 font-mono mt-1">Forwarding Active</p>
        </div>

        <div class="soft-card p-6">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactional Mail</p>
          <p class="text-lg font-bold text-slate-900 mt-1">Resend API</p>
          <p class="text-xs text-purple-600 font-mono mt-1">DKIM & SPF Live</p>
        </div>
      </div>

      <!-- Master Credentials Card -->
      <div class="soft-card p-8 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 class="text-lg font-bold text-slate-900 tracking-tight">Master Administrator Account Specification</h2>
          <span class="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            BCrypt 12 Provisioned
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div class="soft-inner p-4">
            <span class="text-slate-500 block mb-1">Master Email Address</span>
            <span class="text-slate-900 font-bold text-sm">vishal.bhutekar1@gmail.com</span>
          </div>
          <div class="soft-inner p-4">
            <span class="text-slate-500 block mb-1">Security Password</span>
            <span class="text-slate-900 font-bold text-sm">Vishal@1233</span>
          </div>
          <div class="soft-inner p-4">
            <span class="text-slate-500 block mb-1">Security Roles</span>
            <span class="text-emerald-700 font-bold text-xs">SUPER_ADMIN, MGR, ACCT</span>
          </div>
        </div>
      </div>

      <!-- Commercial Statement Dispatcher & Inbound Simulator -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Statement Dispatcher -->
        <div class="soft-card p-8 space-y-6">
          <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Commercial Statement Dispatcher</h2>
              <p class="text-xs text-slate-500">Trigger branded statement email via Resend API</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Recipient Email Address</label>
              <input id="adminEmailInput" type="email" value="vishal.bhutekar1@gmail.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Invoice #</label>
                <input id="adminInvNumber" type="text" value="INV-202609-00001" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Amount</label>
                <input id="adminInvAmount" type="text" value="$3,250.00" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Property Asset</label>
              <input id="adminInvProperty" type="text" value="The Grand Horizon Luxury Suites - Unit 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            </div>

            <button id="adminSendBtn" onclick="adminDispatchEmail()" class="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              <span>Dispatch Statement via Resend</span>
            </button>

            <div id="adminStatusResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
          </div>
        </div>

        <!-- Inbound Routing Simulator -->
        <div class="soft-card p-8 space-y-6">
          <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Inbound Support Routing Monitor</h2>
              <p class="text-xs text-slate-500">Target: <span class="text-indigo-600 font-mono">vishal.bhutekar1@gmail.com</span></p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="soft-inner p-4 space-y-2 text-xs">
              <div class="flex items-center justify-between text-slate-700 font-semibold">
                <span>Target Inbound Address:</span>
                <span class="font-mono text-indigo-600">support@propledger.vishalbhutekar.me</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span>Forward Destination:</span>
                <span class="font-mono text-slate-900">vishal.bhutekar1@gmail.com</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span>Cloudflare Zone:</span>
                <span class="font-mono">84d04451d623e1d6885d01c55a89ce3a</span>
              </div>
            </div>

            <button id="adminPingBtn" onclick="adminPingSupport()" class="w-full py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition border border-slate-200 flex items-center justify-center gap-2">
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Simulate Live Inbound Support Forwarding</span>
            </button>

            <div id="adminPingResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- ════════════════════════════════════════════════════════════════════════ -->
  <!-- MODALS -->
  <!-- ════════════════════════════════════════════════════════════════════════ -->

  <!-- 1. Add Property Modal -->
  <div id="addPropertyModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Register New Property Asset</h3>
        <button onclick="closeModal('addPropertyModal')" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
      </div>

      <form onsubmit="submitNewProperty(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Property Name</label>
          <input id="propName" type="text" required placeholder="e.g. The Paramount Heights" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Property Type</label>
            <select id="propType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Multifamily Luxury">Multifamily Luxury</option>
              <option value="Luxury Residential">Luxury Residential</option>
              <option value="Commercial Office">Commercial Office</option>
              <option value="Mixed-Use Retail">Mixed-Use Retail</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Total Units</label>
            <input id="propUnits" type="number" min="1" max="500" value="12" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Street Address</label>
          <input id="propAddress" type="text" required placeholder="e.g. 500 Congress Avenue" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">City</label>
            <input id="propCity" type="text" value="Austin" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">State</label>
            <input id="propState" type="text" value="TX" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Gross Target ($/mo)</label>
            <input id="propRent" type="number" value="38500" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Amenities (Comma separated)</label>
          <input id="propAmenities" type="text" value="Heated Pool, EV Chargers, Concierge, Rooftop Terrace" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addPropertyModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Register Property</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 2. Add Unit Modal -->
  <div id="addUnitModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Add Unit to Property</h3>
        <button onclick="closeModal('addUnitModal')" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
      </div>

      <form onsubmit="submitNewUnit(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Target Property</label>
          <select id="unitTargetProperty" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"></select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Unit Number / ID</label>
            <input id="unitNumber" type="text" required placeholder="e.g. Unit 504" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Monthly Rent ($)</label>
            <input id="unitRent" type="number" value="3150" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Bedrooms</label>
            <input id="unitBeds" type="text" value="2 Bed" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Bathrooms</label>
            <input id="unitBaths" type="text" value="2 Bath" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Status</label>
            <select id="unitStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
              <option value="Under Renovation">Under Renovation</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Assigned Resident Name</label>
          <input id="unitTenant" type="text" value="Vacant / Open" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addUnitModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Add Unit</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 3. Add User Modal -->
  <div id="addUserModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Add User / Member</h3>
        <button onclick="closeModal('addUserModal')" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
      </div>

      <form onsubmit="submitNewUser(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Full Legal Name</label>
          <input id="userName" type="text" required placeholder="e.g. Jessica Sterling" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Address</label>
            <input id="userEmail" type="email" required placeholder="jessica@horizon.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input id="userPhone" type="text" value="+1 (512) 680-9921" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">System Role</label>
            <select id="userRole" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="TENANT">Tenant / Resident</option>
              <option value="PROPERTY_MANAGER">Property Manager</option>
              <option value="MAINTENANCE_TECH">Maintenance Tech</option>
              <option value="LANDLORD">Landlord / Owner</option>
              <option value="SUPER_ADMIN">Executive Administrator</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Account Status</label>
            <select id="userStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Active">Active</option>
              <option value="Pending">Pending Invitation</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Assigned Property</label>
            <input id="userProperty" type="text" value="The Grand Horizon" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Assigned Unit</label>
            <input id="userUnit" type="text" value="Unit 305" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addUserModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Create User Account</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 4. Add Task Modal -->
  <div id="addTaskModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900">Create Operational Task</h3>
        <button onclick="closeModal('addTaskModal')" class="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
      </div>

      <form onsubmit="submitNewTask(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Task Title</label>
          <input id="taskTitle" type="text" required placeholder="e.g. Repair Balcony Railing Sensor" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Category</label>
            <select id="taskCategory" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Plumbing & Water">Plumbing & Water</option>
              <option value="Electrical & HVAC">Electrical & HVAC</option>
              <option value="Lease Renewal">Lease Renewal</option>
              <option value="Safety & Compliance">Safety & Compliance</option>
              <option value="Unit Turn">Unit Turn</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Priority</label>
            <select id="taskPriority" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="URGENT">URGENT (24h)</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM" selected>MEDIUM</option>
              <option value="ROUTINE">ROUTINE</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Property</label>
            <input id="taskProperty" type="text" value="The Grand Horizon" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Unit / Location</label>
            <input id="taskUnit" type="text" value="Unit 204" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Assignee</label>
            <input id="taskAssignee" type="text" value="Marcus Brody" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Due Timeline</label>
            <input id="taskDue" type="text" value="Today, 6:00 PM" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3">
          <button type="button" onclick="closeModal('addTaskModal')" class="pill-btn px-4 py-2 text-slate-600 hover:text-slate-900 font-bold">Cancel</button>
          <button type="submit" class="pill-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">Create Task</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Clean Minimal Footer -->
  <footer class="mt-20 border-t border-slate-200/80 bg-white py-10 text-center">
    <div class="max-w-7xl mx-auto px-6 space-y-2">
      <p class="text-xs font-semibold text-slate-700">
        PropLedger Technologies &bull; Executive Administration & Portfolio Control Center
      </p>
      <p class="text-[11px] text-slate-500 font-mono">
        Cloudflare Edge Protected &bull; TLS 1.3 &bull; Real-time Operations Active
      </p>
    </div>
  </footer>

  <!-- ════════════════════════════════════════════════════════════════════════ -->
  <!-- CLIENT JAVASCRIPT LOGIC & STATE PERSISTENCE -->
  <!-- ════════════════════════════════════════════════════════════════════════ -->
  <script>
    // State initialization from seed or local cache
    const STORAGE_KEY = 'propledger_admin_state_v1';
    let appData = null;
    let currentPropFilter = 'all';
    let currentUserFilter = 'all';

    // Live clock
    function updateClock() {
      const now = new Date();
      const clockEl = document.getElementById('liveClock');
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Tab Switching
    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));

      const targetPane = document.getElementById('tabContent-' + tabId);
      const targetBtn = document.getElementById('tabBtn-' + tabId);
      if (targetPane) targetPane.classList.remove('hidden');
      if (targetBtn) targetBtn.classList.add('tab-active');
    }

    // Modal helpers
    function openModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('hidden');
      if (id === 'addUnitModal') populateUnitPropertyDropdown();
    }
    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('hidden');
    }

    // Toast alert
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const bg = type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-white' : 'bg-red-900 border-red-500 text-white';
      toast.className = 'pointer-events-auto px-5 py-3 rounded-2xl border shadow-xl text-xs font-bold flex items-center gap-2.5 transition-all transform translate-y-4 opacity-0 ' + bg;
      toast.innerHTML = (type === 'success' ? '<span class="text-emerald-400">✔</span>' : '<span class="text-red-400">✖</span>') + '<span>' + message + '</span>';
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      }, 50);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Initialize application data
    async function initData() {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          appData = JSON.parse(cached);
        } catch(e) {}
      }

      // Try fetching fresh data from Worker edge API
      try {
        const resp = await fetch('/api/admin/dashboard-data');
        if (resp.ok) {
          const res = await resp.json();
          if (res.success && res.data) {
            appData = res.data;
            saveState();
          }
        }
      } catch (err) {
        console.warn('Working in offline/cached mode:', err);
      }

      if (!appData) {
        // Fallback default
        appData = window.__INITIAL_ADMIN_DATA__;
      }

      renderAll();
    }

    function saveState() {
      if (appData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      }
    }

    function renderAll() {
      renderProperties();
      renderUsers();
      renderTasks();
      renderActivity();
      updateBadges();
    }

    function updateBadges() {
      if (!appData) return;
      document.getElementById('badge-propCount').textContent = appData.properties.length;
      document.getElementById('badge-userCount').textContent = appData.users.length;
      document.getElementById('badge-taskCount').textContent = appData.tasks.filter(t => t.status !== 'completed').length;
      
      document.getElementById('stat-totalProperties').textContent = appData.properties.length;
      const totalUnits = appData.properties.reduce((sum, p) => sum + (p.unitsCount || 0), 0);
      const occupiedUnits = appData.properties.reduce((sum, p) => sum + (p.occupiedCount || 0), 0);
      const grossRoll = appData.properties.reduce((sum, p) => sum + (p.grossRent || 0), 0);
      
      document.getElementById('stat-totalUnits').textContent = totalUnits;
      document.getElementById('stat-occupancyRate').textContent = totalUnits ? ((occupiedUnits / totalUnits) * 100).toFixed(1) + '%' : '100%';
      document.getElementById('stat-grossRentRoll').textContent = '$' + grossRoll.toLocaleString();
    }

    // Properties Render
    function renderProperties() {
      const grid = document.getElementById('propertiesGrid');
      if (!grid || !appData) return;
      const query = (document.getElementById('propertySearch').value || '').toLowerCase();

      const filtered = appData.properties.filter(p => {
        const matchType = currentPropFilter === 'all' || p.type.toLowerCase().includes(currentPropFilter.toLowerCase());
        const matchQuery = p.name.toLowerCase().includes(query) || p.address.toLowerCase().includes(query) || p.city.toLowerCase().includes(query);
        return matchType && matchQuery;
      });

      grid.innerHTML = filtered.map(p => `
        <div class="soft-card p-6 flex flex-col justify-between space-y-5">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                ${p.type}
              </span>
              <span class="text-xs font-mono font-bold text-slate-400">${p.id}</span>
            </div>

            <div>
              <h3 class="text-lg font-black text-slate-900 tracking-tight">${p.name}</h3>
              <p class="text-xs text-slate-500 mt-0.5">${p.address}, ${p.city}, ${p.state} ${p.zip}</p>
            </div>

            <!-- Occupancy bar -->
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-slate-600">Occupancy: ${p.occupiedCount}/${p.unitsCount} Units</span>
                <span class="text-emerald-700 font-bold">${((p.occupiedCount / p.unitsCount) * 100).toFixed(0)}%</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full" style="width: ${(p.occupiedCount / p.unitsCount) * 100}%"></div>
              </div>
            </div>

            <!-- Amenities -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${(p.amenities || []).map(a => `<span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">${a}</span>`).join('')}
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase font-bold">Monthly Gross</span>
              <span class="text-slate-900 font-black font-mono text-sm">$${p.grossRent.toLocaleString()}</span>
            </div>
            <button onclick="quickAddUnitTo('${p.name}')" class="pill-btn px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">
              + Unit
            </button>
          </div>
        </div>
      `).join('');
    }

    function setPropFilter(type) {
      currentPropFilter = type;
      document.querySelectorAll('.prop-filter-btn').forEach(btn => {
        if (btn.dataset.filter === type) {
          btn.className = 'prop-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm';
        } else {
          btn.className = 'prop-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900';
        }
      });
      renderProperties();
    }

    function filterProperties() {
      renderProperties();
    }

    function populateUnitPropertyDropdown() {
      const select = document.getElementById('unitTargetProperty');
      if (!select || !appData) return;
      select.innerHTML = appData.properties.map(p => `<option value="${p.name}">${p.name} (${p.city}, ${p.state})</option>`).join('');
    }

    function quickAddUnitTo(propName) {
      openModal('addUnitModal');
      setTimeout(() => {
        const select = document.getElementById('unitTargetProperty');
        if (select) select.value = propName;
      }, 50);
    }

    // Submit New Property
    async function submitNewProperty(e) {
      e.preventDefault();
      const name = document.getElementById('propName').value;
      const type = document.getElementById('propType').value;
      const unitsCount = parseInt(document.getElementById('propUnits').value);
      const address = document.getElementById('propAddress').value;
      const city = document.getElementById('propCity').value;
      const state = document.getElementById('propState').value;
      const grossRent = parseFloat(document.getElementById('propRent').value);
      const amenities = document.getElementById('propAmenities').value.split(',').map(s => s.trim());

      const payload = { name, type, unitsCount, address, city, state, grossRent, amenities };

      // Local optimistic update
      const newProp = {
        id: "PROP-" + String(appData.properties.length + 1).padStart(3, '0'),
        ...payload,
        occupiedCount: Math.max(1, unitsCount - 1),
        zip: "78701",
        status: "Operational"
      };
      appData.properties.unshift(newProp);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Property Registered",
        description: `New asset '${newProp.name}' (${newProp.unitsCount} units) registered in system.`,
        category: "property"
      });

      saveState();
      renderAll();
      closeModal('addPropertyModal');
      showToast(`Property "${name}" registered successfully!`);

      // Post to edge API
      fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Edge sync error:', err));
    }

    // Submit New Unit
    function submitNewUnit(e) {
      e.preventDefault();
      const propName = document.getElementById('unitTargetProperty').value;
      const unitNum = document.getElementById('unitNumber').value;
      const rent = parseFloat(document.getElementById('unitRent').value);
      const tenant = document.getElementById('unitTenant').value;

      const prop = appData.properties.find(p => p.name === propName);
      if (prop) {
        prop.unitsCount += 1;
        prop.grossRent += rent;
        if (tenant && tenant.toLowerCase() !== 'vacant') {
          prop.occupiedCount += 1;
        }
      }

      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Unit Appended",
        description: `${unitNum} added to ${propName} ($${rent.toLocaleString()}/mo).`,
        category: "property"
      });

      saveState();
      renderAll();
      closeModal('addUnitModal');
      showToast(`Unit ${unitNum} added to ${propName}!`);
    }

    // Users Render
    function renderUsers() {
      const tbody = document.getElementById('usersTableBody');
      if (!tbody || !appData) return;
      const query = (document.getElementById('userSearch').value || '').toLowerCase();

      const filtered = appData.users.filter(u => {
        const matchRole = currentUserFilter === 'all' || u.role === currentUserFilter;
        const matchQuery = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.property.toLowerCase().includes(query);
        return matchRole && matchQuery;
      });

      // Update counters
      document.getElementById('stat-usersTotal').textContent = appData.users.length;
      document.getElementById('stat-usersTenants').textContent = appData.users.filter(u => u.role === 'TENANT').length;
      document.getElementById('stat-usersManagers').textContent = appData.users.filter(u => u.role === 'PROPERTY_MANAGER').length;
      document.getElementById('stat-usersTechs').textContent = appData.users.filter(u => u.role === 'MAINTENANCE_TECH').length;

      const roleBadges = {
        'SUPER_ADMIN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'PROPERTY_MANAGER': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'TENANT': 'bg-blue-100 text-blue-800 border-blue-200',
        'MAINTENANCE_TECH': 'bg-amber-100 text-amber-800 border-amber-200',
        'LANDLORD': 'bg-purple-100 text-purple-800 border-purple-200'
      };

      tbody.innerHTML = filtered.map(u => `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                ${u.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm leading-tight">${u.name}</p>
                <p class="text-xs text-slate-500 font-mono">${u.email}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border ${roleBadges[u.role] || 'bg-slate-100 text-slate-700 border-slate-200'}">
              ${u.role}
            </span>
          </td>
          <td class="px-6 py-4">
            <p class="font-semibold text-slate-900 text-xs">${u.property}</p>
            <p class="text-[11px] text-slate-500 font-mono">${u.unit}</p>
          </td>
          <td class="px-6 py-4 font-mono text-xs text-slate-600">${u.phone || 'N/A'}</td>
          <td class="px-6 py-4">
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (u.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200')}">
              ${u.status}
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <div class="flex items-center justify-end gap-2">
              <button onclick="toggleUserStatus('${u.id}')" class="pill-btn px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200">
                ${u.status === 'Active' ? 'Suspend' : 'Activate'}
              </button>
              <button onclick="deleteUser('${u.id}')" class="text-slate-400 hover:text-red-600 text-sm px-1.5 py-1" title="Remove Account">
                &times;
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    function setUserFilter(role) {
      currentUserFilter = role;
      document.querySelectorAll('.user-filter-btn').forEach(btn => {
        if (btn.dataset.filter === role) {
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg font-bold bg-white text-slate-900 shadow-sm';
        } else {
          btn.className = 'user-filter-btn px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-slate-900';
        }
      });
      renderUsers();
    }

    function filterUsers() {
      renderUsers();
    }

    function toggleUserStatus(userId) {
      const user = appData.users.find(u => u.id === userId);
      if (user) {
        user.status = user.status === 'Active' ? 'Suspended' : 'Active';
        appData.activity.unshift({
          id: "ACT-" + Date.now().toString().slice(-4),
          timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: "Status Updated",
          description: `Account for ${user.name} (${user.id}) changed to '${user.status}'.`,
          category: "user"
        });
        saveState();
        renderAll();
        showToast(`User ${user.name} status updated to ${user.status}`);
        fetch('/api/admin/users/' + userId + '/toggle-status', { method: 'POST' }).catch(()=>{});
      }
    }

    function deleteUser(userId) {
      const idx = appData.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        const name = appData.users[idx].name;
        appData.users.splice(idx, 1);
        saveState();
        renderAll();
        showToast(`User account ${name} removed`);
      }
    }

    // Submit New User
    function submitNewUser(e) {
      e.preventDefault();
      const name = document.getElementById('userName').value;
      const email = document.getElementById('userEmail').value;
      const phone = document.getElementById('userPhone').value;
      const role = document.getElementById('userRole').value;
      const status = document.getElementById('userStatus').value;
      const property = document.getElementById('userProperty').value;
      const unit = document.getElementById('userUnit').value;

      const newUser = {
        id: "USR-" + String(appData.users.length + 1).padStart(3, '0'),
        name, email, phone, role, status, property, unit,
        joinedDate: "Today, Sep 12"
      };

      appData.users.unshift(newUser);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "User Onboarded",
        description: `${newUser.name} onboarded as ${newUser.role} (${newUser.property}).`,
        category: "user"
      });

      saveState();
      renderAll();
      closeModal('addUserModal');
      showToast(`User ${name} registered successfully!`);

      fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(()=>{});
    }

    function exportUsersCSV() {
      if (!appData) return;
      const headers = ["ID,Full Name,Email,Role,Property,Unit,Phone,Status,Joined Date"];
      const rows = appData.users.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.property}","${u.unit}","${u.phone}","${u.status}","${u.joinedDate}"`);
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join(String.fromCharCode(10));
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `PropLedger_Users_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("User directory exported to CSV!");
    }

    // Tasks Render
    function renderTasks() {
      if (!appData) return;
      const columns = ['backlog', 'in_progress', 'review', 'completed'];
      columns.forEach(col => {
        const container = document.getElementById('col-' + col);
        const countBadge = document.getElementById('count-' + col);
        const tasks = appData.tasks.filter(t => t.status === col);
        if (countBadge) countBadge.textContent = tasks.length;

        if (container) {
          if (tasks.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">No tasks in this lane</div>';
          } else {
            container.innerHTML = tasks.map(t => {
              const priorityClass = t.priority === 'URGENT' 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : (t.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200');
              
              const nextBtnText = col === 'backlog' ? 'Start ➔' : (col === 'in_progress' ? 'Review ➔' : (col === 'review' ? 'Resolve ➔' : 'Reopen &#8634;'));

              return `
                <div class="soft-card p-4 space-y-3 bg-white border border-slate-200/90 rounded-2xl shadow-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityClass}">
                      ${t.priority}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400 font-bold">${t.id}</span>
                  </div>

                  <div>
                    <h4 class="font-bold text-slate-900 text-xs leading-snug">${t.title}</h4>
                    <p class="text-[11px] text-slate-500 mt-1">${t.property} &bull; <strong class="text-slate-700">${t.unit}</strong></p>
                  </div>

                  <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <div class="flex items-center gap-1.5 text-slate-600">
                      <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                      <span>${t.assignee}</span>
                    </div>
                    <span class="text-slate-500 font-mono">${t.dueDate}</span>
                  </div>

                  <button onclick="advanceTaskStatus('${t.id}')" class="w-full mt-2 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition">
                    <span>${nextBtnText}</span>
                  </button>
                </div>
              `;
            }).join('');
          }
        }
      });
    }

    function advanceTaskStatus(taskId) {
      const task = appData.tasks.find(t => t.id === taskId);
      if (task) {
        const order = ['backlog', 'in_progress', 'review', 'completed'];
        const curr = order.indexOf(task.status);
        task.status = curr < order.length - 1 ? order[curr + 1] : order[0];
        
        appData.activity.unshift({
          id: "ACT-" + Date.now().toString().slice(-4),
          timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          action: "Task Advanced",
          description: `Work order #${task.id} advanced to status '${task.status}'.`,
          category: "task"
        });

        saveState();
        renderAll();
        showToast(`Task #${task.id} moved to ${task.status.replace('_', ' ')}!`);
        fetch('/api/admin/tasks/' + taskId + '/advance', { method: 'POST' }).catch(()=>{});
      }
    }

    // Submit New Task
    function submitNewTask(e) {
      e.preventDefault();
      const title = document.getElementById('taskTitle').value;
      const category = document.getElementById('taskCategory').value;
      const priority = document.getElementById('taskPriority').value;
      const property = document.getElementById('taskProperty').value;
      const unit = document.getElementById('taskUnit').value;
      const assignee = document.getElementById('taskAssignee').value;
      const dueDate = document.getElementById('taskDue').value;

      const newTask = {
        id: "TSK-" + (100 + appData.tasks.length + 1),
        title, category, priority, property, unit, assignee, dueDate,
        status: "backlog",
        createdDate: "Sep 12, 2026"
      };

      appData.tasks.unshift(newTask);
      appData.activity.unshift({
        id: "ACT-" + Date.now().toString().slice(-4),
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        action: "Task Created",
        description: `Work order '${newTask.title}' [${newTask.priority}] assigned to ${newTask.assignee}.`,
        category: "task"
      });

      saveState();
      renderAll();
      closeModal('addTaskModal');
      showToast(`Work order #${newTask.id} created!`);

      fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      }).catch(()=>{});
    }

    // Activity Stream Render
    function renderActivity() {
      const container = document.getElementById('activityStreamContainer');
      if (!container || !appData) return;

      const catBadges = {
        'financial': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'property': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'user': 'bg-blue-100 text-blue-800 border-blue-200',
        'task': 'bg-amber-100 text-amber-800 border-amber-200',
        'security': 'bg-purple-100 text-purple-800 border-purple-200'
      };

      container.innerHTML = (appData.activity || []).map(act => `
        <div class="py-3 flex items-start justify-between gap-4 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${catBadges[act.category] || 'bg-slate-100 text-slate-700'}">
                ${act.action}
              </span>
              <span class="text-slate-400 font-mono text-[11px]">${act.id}</span>
            </div>
            <p class="font-medium text-slate-800">${act.description}</p>
          </div>
          <span class="font-mono text-[11px] text-slate-500 flex-shrink-0">${act.timestamp}</span>
        </div>
      `).join('');
    }

    function downloadAuditJSON() {
      if (!appData) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `PropLedger_Executive_Audit_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Daily audit report downloaded as JSON!");
    }

    async function resetDataToSeed() {
      if (confirm("Reset all properties, users, and tasks to default seed data?")) {
        localStorage.removeItem(STORAGE_KEY);
        try {
          await fetch('/api/admin/reset', { method: 'POST' });
        } catch(e) {}
        appData = JSON.parse(JSON.stringify(window.__INITIAL_ADMIN_DATA__));
        saveState();
        renderAll();
        showToast("System reset to production sample seed!");
      }
    }

    // Chart Tooltip logic
    function showChartTip(e, month, income, expense, profit) {
      const tip = document.getElementById('chartTipBox');
      document.getElementById('tipMonth').textContent = month;
      document.getElementById('tipIncome').textContent = income;
      document.getElementById('tipExpense').textContent = expense;
      document.getElementById('tipProfit').textContent = profit;

      tip.classList.remove('hidden');
      const rect = e.target.getBoundingClientRect();
      const parentRect = document.getElementById('financialChartSvg').getBoundingClientRect();
      tip.style.left = (rect.left - parentRect.left - 40) + 'px';
      tip.style.top = (rect.top - parentRect.top - 85) + 'px';
    }

    function hideChartTip() {
      document.getElementById('chartTipBox').classList.add('hidden');
    }

    // Resend email dispatch function
    async function adminDispatchEmail() {
      const btn = document.getElementById('adminSendBtn');
      const statusBox = document.getElementById('adminStatusResult');
      const email = document.getElementById('adminEmailInput').value;
      const invNum = document.getElementById('adminInvNumber').value;
      const amount = document.getElementById('adminInvAmount').value;
      const property = document.getElementById('adminInvProperty').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Dispatching via Resend API...';
      statusBox.className = 'p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to transactional mail engine...';

      try {
        const resp = await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: email, invoiceNumber: invNum, amount: amount, property: property, tenant: 'Vishal Bhutekar' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email;
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Dispatch Statement via Resend</span>';
      }
    }

    async function adminPingSupport() {
      const btn = document.getElementById('adminPingBtn');
      const statusBox = document.getElementById('adminPingResult');

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Testing forward routing...';
      statusBox.className = 'p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Sending diagnostic packet...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: 'Admin Portal Ping', senderEmail: 'diagnostics@propledger.com', subject: 'Diagnostic verification of edge forward pipeline', message: 'Testing forward routing to vishal.bhutekar1@gmail.com' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Support Routing Verified!</strong><br>Forwarded to: ' + data.forwardedTo + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Simulate Live Inbound Support Forwarding</span>';
      }
    }

    // Kickoff
    document.addEventListener('DOMContentLoaded', initData);
  </script>
</body>
</html>"""

if __name__ == '__main__':
    html = get_admin_html()
    print("Admin HTML length:", len(html))
