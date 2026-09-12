import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

worker_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cloudflare", "propledger-worker.js")

with open(worker_file, "r", encoding="utf-8") as f:
    content = f.read()

print(f"Read {len(content)} chars from worker.")

# ==============================================================================
# 1. ADMIN API UPDATES (Image support on properties, Indian defaults)
# ==============================================================================
old_admin_prop_post = """  // 2. POST Add Property
  if (path === '/api/admin/properties' && method === 'POST') {
    return request.json().then(body => {
      const newProp = {
        id: "PROP-" + String(globalAdminStore.properties.length + 1).padStart(3, '0'),
        name: body.name || "Untitled Property Asset",
        address: body.address || "Street Address Pending",
        city: body.city || "Austin",
        state: body.state || "TX",
        zip: body.zip || "78701",
        type: body.type || "Multifamily Luxury",
        unitsCount: parseInt(body.unitsCount) || 12,
        occupiedCount: parseInt(body.occupiedCount) || Math.max(1, (parseInt(body.unitsCount) || 12) - 1),
        grossRent: parseFloat(body.grossRent) || 32000,
        amenities: Array.isArray(body.amenities) ? body.amenities : (body.amenities ? String(body.amenities).split(',').map(s => s.trim()) : ["Security Access", "Parking"]),
        status: "Operational"
      };"""

new_admin_prop_post = """  // 2. POST Add Property
  if (path === '/api/admin/properties' && method === 'POST') {
    return request.json().then(body => {
      const newProp = {
        id: "PROP-" + String(globalAdminStore.properties.length + 1).padStart(3, '0'),
        name: body.name || "Untitled Property Asset",
        image: body.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
        address: body.address || "Street Address Pending",
        city: body.city || "Mumbai",
        state: body.state || "Maharashtra",
        zip: body.zip || "400001",
        type: body.type || "Luxury Residential",
        unitsCount: parseInt(body.unitsCount) || 12,
        occupiedCount: parseInt(body.occupiedCount) || Math.max(1, (parseInt(body.unitsCount) || 12) - 1),
        grossRent: parseFloat(body.grossRent) || 450000,
        amenities: Array.isArray(body.amenities) ? body.amenities : (body.amenities ? String(body.amenities).split(',').map(s => s.trim()) : ["24/7 Security", "Covered Parking", "Elevator"]),
        status: "Operational"
      };"""

if old_admin_prop_post in content:
    content = content.replace(old_admin_prop_post, new_admin_prop_post)
    print("Replaced POST Add Property API handler.")
else:
    print("Warning: old_admin_prop_post not found exactly.")

# Also ensure public properties API includes image
old_public_prop_map = """    const publicProps = (globalAdminStore.properties || []).map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      city: p.city,
      state: p.state,
      type: p.type,"""

new_public_prop_map = """    const publicProps = (globalAdminStore.properties || []).map(p => ({
      id: p.id,
      name: p.name,
      image: p.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      address: p.address,
      city: p.city,
      state: p.state,
      type: p.type,"""

if old_public_prop_map in content:
    content = content.replace(old_public_prop_map, new_public_prop_map)
    print("Added image to public properties mapping.")

# ==============================================================================
# 2. DESKTOP & MOBILE NAVIGATION: #resident-hub ONCLICK HANDLER
# ==============================================================================
old_nav_res = '<a href="#resident-hub" class="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-full transition">Resident Hub</a>'
new_nav_res = '<a href="#resident-hub" onclick="navigateToResidentHub(event)" class="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3.5 py-1.5 rounded-full transition shadow-sm">Resident Hub</a>'
content = content.replace(old_nav_res, new_nav_res)

old_mob_res = '<a href="#resident-hub" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition">Resident Hub</a>'
new_mob_res = '<a href="#resident-hub" onclick="toggleMobileNav(); navigateToResidentHub(event);" class="p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition">Resident Hub</a>'
content = content.replace(old_mob_res, new_mob_res)
print("Updated navigation links with navigateToResidentHub.")

# ==============================================================================
# 3. HERO & HEADINGS COPY SIMPLIFICATION
# ==============================================================================
# Simplify Hero text
content = content.replace(
    'Financial wellbeing,<br>\n          <span class="text-white">built for your properties</span>',
    'Simple, modern<br>\n          <span class="text-white">property management</span>'
)
content = content.replace(
    'PropLedger delivers privacy-first, automated lease tracking and subledger reconciliation, designed to boost portfolio NOI and financial clarity for real estate operators.',
    'PropLedger makes managing rentals effortless. Pay rent online in seconds via UPI, track leases, and manage apartments with zero paperwork or spreadsheets.'
)
content = content.replace('<span>Request a Demo</span>', '<span>Explore Apartments</span>')
content = content.replace('<span>Explore Dual Portal &darr;</span>', '<span>Try Live Portals &darr;</span>')
content = content.replace(
    '<p class="text-[10px] uppercase font-bold tracking-wider text-blue-200">Designed for properties, not spreadsheets</p>\n            <h4 class="text-base font-bold text-white leading-snug">\n              Reduce vacancy stress. Improve portfolio performance.\n            </h4>',
    '<p class="text-[10px] uppercase font-bold tracking-wider text-blue-200">Built for everyday landlords & residents</p>\n            <h4 class="text-base font-bold text-white leading-snug">\n              Zero paperwork stress. 100% digital clarity across India.\n            </h4>'
)

# Why it matters simplification
content = content.replace(
    'Why prioritizing property financial health matters',
    'Why simple property management matters'
)
content = content.replace(
    'We turn chaotic leases into reliable cashflow with collision-free dates, automated digital statements, and instant online rent payments.',
    'We turn messy rent collections into smooth, automated payments with instant UPI receipts and calendar-protected bookings.'
)

# How it works simplification
content = content.replace(
    '<p class="text-xs text-slate-600 leading-relaxed">\n            Go live in just one minute. Add your building name (e.g. "The Grand Horizon"), list apartment units, and set monthly base rents.\n          </p>',
    '<p class="text-xs text-slate-600 leading-relaxed">\n            Go live in one minute. Add your property (e.g. "Oberoi Sky City, Mumbai"), list your flats, and set monthly rents in Rupees.\n          </p>'
)
content = content.replace(
    '<p class="text-xs text-slate-600 leading-relaxed">\n            Tenants receive clean, itemized statements via email on the 1st of every month with a 1-click button to pay with ACH or Card.\n          </p>',
    '<p class="text-xs text-slate-600 leading-relaxed">\n            Tenants receive clean, itemized rent bills via WhatsApp or Email on the 1st of every month with an instant button to pay via UPI or Card.\n          </p>'
)

# ==============================================================================
# 4. DUAL EXPERIENCE & RESIDENT HUB ANCHOR
# ==============================================================================
# Add dedicated anchor right above dual experience
old_dual_section = '<section id="dual-experience" class="py-24 px-6 max-w-6xl mx-auto space-y-8">'
new_dual_section = '<!-- RESIDENT HUB ANCHOR -->\n  <div id="resident-hub" class="scroll-mt-24"></div>\n  <section id="dual-experience" class="py-24 px-6 max-w-6xl mx-auto space-y-8">'
if old_dual_section in content:
    content = content.replace(old_dual_section, new_dual_section)
    print("Added #resident-hub scroll anchor above dual-experience.")

# Update Landlord View Stats to Rupees & Indian numbers
content = content.replace(
    '<span class="text-2xl font-black text-slate-900 tabular-nums">$128,450.00</span>',
    '<span class="text-2xl font-black text-slate-900 tabular-nums">₹36,40,000.00</span>'
)
content = content.replace(
    '<p class="text-[11px] text-slate-400 mt-1">Settled via Automated ACH</p>',
    '<p class="text-[11px] text-slate-400 mt-1">Settled via UPI & Direct NetBanking</p>'
)
content = content.replace('402 / 405 Units', '56 / 60 Flats')
content = content.replace('Only 3 units available', 'Only 4 flats available')

# Update Landlord Unit Roster Table Rows to Indian Data & Rupees
old_roster_rows = """                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 101</td>
                  <td class="py-3 text-slate-600">1-Bed Studio</td>
                  <td class="py-3 text-slate-800 font-medium">Sarah Connor</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$1,650.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-700 font-bold text-[11px]">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 204</td>
                  <td class="py-3 text-slate-600">2-Bed Suite</td>
                  <td class="py-3 text-slate-800 font-medium">Alex Mercer</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$2,400.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-700 font-bold text-[11px]">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 402</td>
                  <td class="py-3 text-slate-600">Horizon Penthouse</td>
                  <td class="py-3 text-slate-800 font-medium">Alex Morgan</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$2,850.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-700 font-bold text-[11px]">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 503</td>
                  <td class="py-3 text-slate-600">Skyline Loft</td>
                  <td class="py-3 text-slate-400 italic">None (Vacant)</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$3,100.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">Available Now</span></td>
                  <td class="py-3 text-right"><button onclick="openTourModal('Unit 503 &bull; Skyline Loft', '$3,100 / mo', '1,850 sq ft &bull; 2 Bed', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="text-[#2546A6] hover:underline font-bold">+ Schedule Tour</button></td>
                </tr>"""

new_roster_rows = """                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 101</td>
                  <td class="py-3 text-slate-600">1 BHK Studio</td>
                  <td class="py-3 text-slate-800 font-medium">Ananya Iyer</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">₹32,000.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-700 font-bold text-[11px]">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 204</td>
                  <td class="py-3 text-slate-600">2 BHK Suite</td>
                  <td class="py-3 text-slate-800 font-medium">Rohan Deshmukh</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">₹52,000.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-700 font-bold text-[11px]">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 402</td>
                  <td class="py-3 text-slate-600">3 BHK Penthouse</td>
                  <td class="py-3 text-slate-800 font-medium">Vishal Bhutekar</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">₹65,000.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-700 font-bold text-[11px]">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 503</td>
                  <td class="py-3 text-slate-600">3 BHK High-Rise</td>
                  <td class="py-3 text-slate-400 italic">None (Vacant)</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">₹75,000.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">Available Now</span></td>
                  <td class="py-3 text-right"><button onclick="openTourModal('Unit 503 &bull; 3 BHK High-Rise', '₹75,000 / mo', '1,850 sq ft &bull; 3 Bed', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="text-[#2546A6] hover:underline font-bold">+ Schedule Visit</button></td>
                </tr>"""

if old_roster_rows in content:
    content = content.replace(old_roster_rows, new_roster_rows)
    print("Updated Landlord Unit Roster table rows.")

# Update Tenant Portal (Resident Hub) card
content = content.replace(
    '<h4 class="font-bold text-sm text-slate-900">The Grand Horizon</h4>\n                <p class="text-xs text-slate-500">Unit 402 &bull; Resident Portal</p>',
    '<h4 class="font-bold text-sm text-slate-900">Oberoi Sky City Residences</h4>\n                <p class="text-xs text-slate-500">Unit 402 &bull; Mumbai Resident Hub</p>'
)
content = content.replace(
    '<span>Parking Bay:</span>\n                <span class="font-medium text-slate-900">Subterranean #14</span>',
    '<span>Parking Bay:</span>\n                <span class="font-medium text-slate-900">Covered Bay #14</span>'
)
content = content.replace(
    '<p id="autopayStatusText" class="text-[10px] text-emerald-600 font-medium">Active &bull; Chase &bull;&bull;&bull;&bull;8421</p>',
    '<p id="autopayStatusText" class="text-[10px] text-emerald-600 font-medium">Active &bull; HDFC UPI AutoPay (ananya@okhdfcbank)</p>'
)
content = content.replace(
    '<span>Pay October Rent ($3,250.00)</span>',
    '<span>Pay October Rent (₹65,000.00)</span>'
)

# Update Transparent Resident Statement in Tenant Portal
content = content.replace(
    '<span class="font-bold text-slate-900 tabular-nums self-center">$2,850.00</span>',
    '<span class="font-bold text-slate-900 tabular-nums self-center">₹55,000.00</span>'
)
content = content.replace(
    'Monthly contractual rent for Penthouse Unit 402',
    'Monthly base rent for 3 BHK Unit 402'
)
content = content.replace(
    'Reserved Underground Parking Bay #14',
    'Reserved Covered Car Parking Bay #14'
)
content = content.replace(
    '<span class="font-bold text-slate-900 tabular-nums self-center">$250.00</span>',
    '<span class="font-bold text-slate-900 tabular-nums self-center">₹3,500.00</span>'
)
content = content.replace(
    'Building Services & Common Maintenance',
    'Society Maintenance & Clubhouse Amenities'
)
content = content.replace(
    'Elevator upkeep, concierge desk, security',
    '24/7 Security, power backup, lifts & gym maintenance'
)
content = content.replace(
    '<span class="font-bold text-slate-900 tabular-nums self-center">$150.00</span>',
    '<span class="font-bold text-slate-900 tabular-nums self-center">₹6,500.00</span>'
)
content = content.replace(
    '<span class="text-2xl font-black text-emerald-600 tabular-nums">$3,250.00</span>',
    '<span class="text-2xl font-black text-emerald-600 tabular-nums">₹65,000.00</span>'
)

# ==============================================================================
# 5. FEATURED APARTMENTS INVENTORY (#unit-gallery)
# ==============================================================================
content = content.replace(
    '<span>The Grand Horizon Residences</span>',
    '<span>Prime Indian Metropolitan Residencies</span>'
)
content = content.replace(
    '<h2 class="text-3xl font-black text-slate-900 tracking-tight">Featured Apartment Inventory</h2>\n        <p class="text-xs sm:text-sm text-slate-500">Live inventory of premium luxury living spaces with real-time lease status.</p>',
    '<h2 class="text-3xl font-black text-slate-900 tracking-tight">Featured Rental Apartments</h2>\n        <p class="text-xs sm:text-sm text-slate-500">Explore verified luxury homes available in Mumbai, Bengaluru, Pune, and Gurugram.</p>'
)

# Unit 1
content = content.replace(
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Unit 101 &bull; 1st Floor</span>\n            <h3 class="text-base font-bold text-slate-900">Executive Urban Studio</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">540 sq ft &bull; 1 Bed &bull; 1 Bath</p>',
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Borivali East &bull; Mumbai</span>\n            <h3 class="text-base font-bold text-slate-900">1 BHK Executive Modern Studio</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">540 sq ft &bull; 1 Bed &bull; 1 Bath &bull; Unit 101</p>'
)
content = content.replace(
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">$1,650</span>',
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">₹32,000</span>'
)
content = content.replace(
    "openTourModal('Unit 101 &bull; Executive Urban Studio', '$1,650 / mo', '540 sq ft &bull; 1 Bed &bull; 1 Bath', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80')",
    "openTourModal('Unit 101 &bull; 1 BHK Studio &bull; Mumbai', '₹32,000 / mo', '540 sq ft &bull; 1 Bed &bull; 1 Bath', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80')"
)

# Unit 2
content = content.replace(
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Unit 204 &bull; 2nd Floor</span>\n            <h3 class="text-base font-bold text-slate-900">Modern 2-Bedroom Suite</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">1,150 sq ft &bull; 2 Bed &bull; 2 Bath</p>',
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Kadubeesanahalli &bull; Bengaluru</span>\n            <h3 class="text-base font-bold text-slate-900">2 BHK Modern Tech Park Suite</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">1,150 sq ft &bull; 2 Bed &bull; 2 Bath &bull; Unit 204</p>'
)
content = content.replace(
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">$2,400</span>',
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">₹52,000</span>'
)
content = content.replace(
    "openTourModal('Unit 204 &bull; Modern 2-Bedroom Suite', '$2,400 / mo', '1,150 sq ft &bull; 2 Bed &bull; 2 Bath', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80')",
    "openTourModal('Unit 204 &bull; 2 BHK Suite &bull; Bengaluru', '₹52,000 / mo', '1,150 sq ft &bull; 2 Bed &bull; 2 Bath', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80')"
)

# Unit 3
content = content.replace(
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Unit 402 &bull; 4th Floor</span>\n            <h3 class="text-base font-bold text-slate-900">Horizon Luxury Penthouse</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">2,400 sq ft &bull; 3 Bed &bull; 3 Bath</p>',
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Kharadi &bull; Pune</span>\n            <h3 class="text-base font-bold text-slate-900">3 BHK Luxury Sky Penthouse</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">2,400 sq ft &bull; 3 Bed &bull; 3 Bath &bull; Unit 402</p>'
)
content = content.replace(
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">$2,850</span>',
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">₹1,25,000</span>'
)
content = content.replace(
    "openTourModal('Unit 402 &bull; Horizon Luxury Penthouse', '$2,850 / mo', '2,400 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80')",
    "openTourModal('Unit 402 &bull; 3 BHK Penthouse &bull; Pune', '₹1,25,000 / mo', '2,400 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80')"
)

# Unit 4
content = content.replace(
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Unit 503 &bull; 5th Floor</span>\n            <h3 class="text-base font-bold text-slate-900">Panoramic Skyline Loft</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath</p>',
    '<span class="text-[11px] font-bold text-slate-500 uppercase">Golf Course Road &bull; Gurugram</span>\n            <h3 class="text-base font-bold text-slate-900">3 BHK Panoramic Cyber Loft</h3>\n            <p class="text-xs text-slate-500 font-medium mt-0.5">1,850 sq ft &bull; 3 Bed &bull; 3 Bath &bull; Unit 503</p>'
)
content = content.replace(
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">$3,100</span>',
    '<span class="text-lg font-black text-[#2546A6] tabular-nums">₹1,45,000</span>'
)
content = content.replace(
    "openTourModal('Unit 503 &bull; Panoramic Skyline Loft', '$3,100 / mo', '1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')",
    "openTourModal('Unit 503 &bull; 3 BHK High-Rise &bull; Gurugram', '₹1,45,000 / mo', '1,850 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')"
)

# ==============================================================================
# 6. ROI CALCULATOR IN RUPEES
# ==============================================================================
content = content.replace(
    '<span id="sliderRentVal" class="text-[#2546A6] font-bold text-sm tabular-nums">$2,200 / mo</span>',
    '<span id="sliderRentVal" class="text-[#2546A6] font-bold text-sm tabular-nums">₹45,000 / mo</span>'
)
content = content.replace(
    '<input type="range" id="sliderRent" min="800" max="5000" step="50" value="2200" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2546A6]">',
    '<input type="range" id="sliderRent" min="15000" max="250000" step="2500" value="45000" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2546A6]">'
)
content = content.replace(
    '<span>$800</span>\n              <span>$2,500</span>\n              <span>$5,000</span>',
    '<span>₹15,000</span>\n              <span>₹1,00,000</span>\n              <span>₹2,50,000</span>'
)
content = content.replace(
    '<p id="outRevenue" class="text-2xl sm:text-3xl font-black text-white tabular-nums">$26,400 / mo</p>',
    '<p id="outRevenue" class="text-2xl sm:text-3xl font-black text-white tabular-nums">₹5,40,000 / mo</p>'
)
content = content.replace(
    '<p id="outSavings" class="text-xl font-bold text-[#38BDF8] tabular-nums">$5,400 / yr</p>',
    '<p id="outSavings" class="text-xl font-bold text-[#38BDF8] tabular-nums">₹1,44,000 / yr</p>'
)

# ==============================================================================
# 7. PAYMENT MODAL WITH UPI & NETBANKING (INR)
# ==============================================================================
old_pay_method_buttons = """          <div class="grid grid-cols-3 gap-2 text-xs">
            <button onclick="setPayMethod('ach')" id="pmAch" class="p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition">
              Bank ACH (0% Fee)
            </button>
            <button onclick="setPayMethod('card')" id="pmCard" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              Card (0% Fee)
            </button>
            <button onclick="setPayMethod('apple')" id="pmApple" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              Apple Pay / GPay
            </button>
          </div>"""

new_pay_method_buttons = """          <div class="grid grid-cols-3 gap-2 text-xs">
            <button onclick="setPayMethod('upi')" id="pmUpi" class="p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition">
              UPI / QR (0% Fee)
            </button>
            <button onclick="setPayMethod('netbanking')" id="pmNetbanking" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              NetBanking
            </button>
            <button onclick="setPayMethod('card')" id="pmCard" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              Debit / Card
            </button>
          </div>"""

if old_pay_method_buttons in content:
    content = content.replace(old_pay_method_buttons, new_pay_method_buttons)
    print("Updated Payment method buttons for Indian payment rails.")

old_pay_details_blocks = """        <!-- Dynamic Payment Method Details -->
        <div id="payDetailsAch" class="p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Connected Checking Account</span>
            <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full font-mono">&check; Verified ACH</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" class="p-2 rounded-xl border-2 border-[#2546A6] bg-white text-xs font-bold text-slate-800 text-left">
              <span class="text-[10px] text-[#2546A6] block">Primary</span>
              Chase &bull; 8421
            </button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-left hover:border-slate-300">
              <span class="text-[10px] text-slate-400 block">Secondary</span>
              BofA &bull; 1904
            </button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-left hover:border-slate-300">
              <span class="text-[10px] text-slate-400 block">Savings</span>
              Wells &bull; 5532
            </button>
          </div>
          <div class="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1">
            <span>Routing: <strong>021000021</strong></span>
            <span>Clearing Speed: <strong>Instant Settlement</strong></span>
          </div>
        </div>

        <div id="payDetailsCard" class="hidden p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Cardholder Name</label>
            <input type="text" value="Alex Morgan" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">
          </div>
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Card Number</label>
            <input type="text" value="4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Expires</label>
              <input type="text" value="08 / 29" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">CVC</label>
              <input type="text" value="842" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
          </div>
        </div>

        <div id="payDetailsApple" class="hidden p-5 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80 text-center">
          <p class="text-xs text-slate-600">Biometric 1-click authorization via Apple Wallet or Google Pay.</p>
          <div class="p-3 rounded-2xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-slate-900 transition">
            <span> Pay</span>
            <span class="font-bold text-slate-900 tabular-nums">$3,250.00</span>
          </div>
          <p class="text-[10px] text-slate-400 font-medium">Touch ID / Face ID encrypted cryptographic key exchange</p>
        </div>"""

new_pay_details_blocks = """        <!-- Dynamic Payment Method Details -->
        <div id="payDetailsUpi" class="p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Instant UPI Transfer</span>
            <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full font-mono">&check; Instant Settlement</span>
          </div>
          <div class="space-y-2">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Enter Virtual Payment Address (VPA / UPI ID)</label>
            <div class="flex items-center gap-2">
              <input type="text" id="upiInputId" value="ananya@okhdfcbank" class="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:border-[#2546A6]">
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">&check; Verified</span>
            </div>
          </div>
          <div class="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Supported: <strong>GPay, PhonePe, Paytm, BHIM</strong></span>
            <span>Zero Processing Fees</span>
          </div>
        </div>

        <div id="payDetailsNetbanking" class="hidden p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Your Bank</span>
            <span class="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 font-semibold px-2 py-0.5 rounded-full font-mono">NEFT / RTGS</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button type="button" class="p-2 rounded-xl border-2 border-[#2546A6] bg-white text-xs font-bold text-slate-800 text-center">HDFC Bank</button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-center hover:border-slate-300">ICICI Bank</button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-center hover:border-slate-300">SBI</button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-center hover:border-slate-300">Axis Bank</button>
          </div>
        </div>

        <div id="payDetailsCard" class="hidden p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Cardholder Name</label>
            <input type="text" value="Ananya Iyer" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">
          </div>
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">RuPay / Visa / MasterCard Number</label>
            <input type="text" value="4524 •••• •••• 9821" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Expires</label>
              <input type="text" value="08 / 29" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">CVV</label>
              <input type="text" value="•••" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
          </div>
        </div>"""

if old_pay_details_blocks in content:
    content = content.replace(old_pay_details_blocks, new_pay_details_blocks)
    print("Replaced payment details blocks with UPI, NetBanking, Card.")

content = content.replace(
    '<span>Confirm & Settle $3,250.00</span>',
    '<span>Confirm & Pay ₹65,000.00</span>'
)
content = content.replace(
    '<span class="font-bold text-slate-900">TXN-2026-ACH-98214</span>',
    '<span class="font-bold text-slate-900">TXN-2026-UPI-98214</span>'
)
content = content.replace(
    '<span class="font-bold text-emerald-600 text-sm">$3,250.00 USD</span>',
    '<span class="font-bold text-emerald-600 text-sm">₹65,000.00 INR</span>'
)
content = content.replace(
    'Alex Morgan &bull; Unit 402',
    'Ananya Iyer &bull; Unit 402, Oberoi Sky City'
)

# ==============================================================================
# 8. RESIDENT MAINTENANCE & REPAIR MODAL: ADD MISSING INPUTS
# ==============================================================================
old_maint_container = """      <div id="maintFormContainer" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Issue Category</label>"""

new_maint_container = """      <div id="maintFormContainer" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name</label>
            <input id="maintResidentName" type="text" value="Ananya Iyer" placeholder="Enter your full name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Email (for updates)</label>
            <input id="maintResidentEmail" type="email" value="ananya.iyer@gmail.com" placeholder="email@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1">Flat / Unit Number</label>
          <input id="maintResidentUnit" type="text" value="Unit 402, Oberoi Sky City" placeholder="e.g. Unit 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Issue Category</label>"""

if old_maint_container in content:
    content = content.replace(old_maint_container, new_maint_container)
    print("Added resident contact inputs to Maintenance modal.")

content = content.replace(
    'Assigned to: <strong>Metro Facilities Team Lead Dave M.</strong><br>\n          A technician has been dispatched to Unit 402. Updates will be sent via SMS and email.',
    'Assigned to: <strong>Maintenance Specialist Suresh Kumar</strong><br>\n          A technician has been assigned to Unit 402. Email updates will be delivered via Resend notifications.'
)

# ==============================================================================
# 9. LEASE MODAL & ADD UNIT MODAL (HOME PAGE)
# ==============================================================================
content = content.replace(
    'The Grand Horizon &bull; Penthouse #402',
    'Oberoi Sky City &bull; Unit 402, Mumbai'
)
content = content.replace(
    '<span class="font-bold text-emerald-600">$2,850.00 / month</span>',
    '<span class="font-bold text-emerald-600">₹65,000.00 / month</span>'
)
content = content.replace(
    '<span class="font-bold text-slate-900">$2,850.00 (Escrow Protected)</span>',
    '<span class="font-bold text-slate-900">₹1,50,000.00 (Security Deposit in Escrow)</span>'
)
content = content.replace(
    'Monthly Rent ($)',
    'Monthly Rent (₹)'
)
content = content.replace(
    '<input type="number" id="newUnitRent" placeholder="2200" value="2200"',
    '<input type="number" id="newUnitRent" placeholder="45000" value="45000"'
)

# ==============================================================================
# 10. JAVASCRIPT FUNCTIONS IN RENDERHOMEPAGE
# ==============================================================================
# Update setPayMethod to support upi, netbanking, card
old_set_pay_method = """    function setPayMethod(m) {
      activePayMethod = m;
      document.getElementById('pmAch').className = m === 'ach' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      document.getElementById('pmCard').className = m === 'card' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      document.getElementById('pmApple').className = m === 'apple' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';

      document.getElementById('payDetailsAch').classList.toggle('hidden', m !== 'ach');
      document.getElementById('payDetailsCard').classList.toggle('hidden', m !== 'card');
      document.getElementById('payDetailsApple').classList.toggle('hidden', m !== 'apple');
    }"""

new_set_pay_method = """    let activePayMethod = 'upi';
    function setPayMethod(m) {
      activePayMethod = m;
      if (document.getElementById('pmUpi')) document.getElementById('pmUpi').className = m === 'upi' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      if (document.getElementById('pmNetbanking')) document.getElementById('pmNetbanking').className = m === 'netbanking' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      if (document.getElementById('pmCard')) document.getElementById('pmCard').className = m === 'card' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';

      if (document.getElementById('payDetailsUpi')) document.getElementById('payDetailsUpi').classList.toggle('hidden', m !== 'upi');
      if (document.getElementById('payDetailsNetbanking')) document.getElementById('payDetailsNetbanking').classList.toggle('hidden', m !== 'netbanking');
      if (document.getElementById('payDetailsCard')) document.getElementById('payDetailsCard').classList.toggle('hidden', m !== 'card');
    }"""

if old_set_pay_method in content:
    content = content.replace(old_set_pay_method, new_set_pay_method)
    print("Updated setPayMethod implementation.")

# Update processTestPayment for UPI
old_test_payment = """        const methodMap = {
          'ach': 'Automated Bank ACH (Chase Checking • 8421)',
          'card': 'Debit / Credit Card (Visa • 4242)',
          'apple': 'Apple Pay Biometric Clearance'
        };
        document.getElementById('receiptMethodText').innerText = methodMap[activePayMethod] || 'Automated Clearing House';
        document.getElementById('receiptTimestamp').innerText = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US');
        playLottie('lottiePaymentSuccess', '/animations/payment-success.json', '<div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">&check;</div>');
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Settle $3,250.00</span><span>&rarr;</span>';"""

new_test_payment = """        const methodMap = {
          'upi': 'Instant UPI Settlement (Google Pay • ananya@okhdfcbank)',
          'netbanking': 'NetBanking IMPS Direct Clearance (HDFC Bank)',
          'card': 'Debit / Credit Card (RuPay • 9821)'
        };
        document.getElementById('receiptMethodText').innerText = methodMap[activePayMethod] || 'Instant UPI Settlement';
        document.getElementById('receiptTimestamp').innerText = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-IN');
        playLottie('lottiePaymentSuccess', '/animations/payment-success.json', '<div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">&check;</div>');
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Pay ₹65,000.00</span><span>&rarr;</span>';"""

if old_test_payment in content:
    content = content.replace(old_test_payment, new_test_payment)
    print("Updated processTestPayment for Indian rails.")

# Update calculateRoi
old_calc_roi = """    function calculateRoi() {
      const units = parseInt(document.getElementById('sliderUnits').value);
      const rent = parseInt(document.getElementById('sliderRent').value);

      document.getElementById('sliderUnitsVal').innerText = units + (units === 1 ? ' Unit' : ' Units');
      document.getElementById('sliderRentVal').innerText = '$' + rent.toLocaleString() + ' / mo';

      const monthlyRev = units * rent;
      const hoursSaved = Math.round(units * 3.2);
      const annualSavings = Math.round(units * 450);

      document.getElementById('outRevenue').innerText = '$' + monthlyRev.toLocaleString() + ' / mo';
      document.getElementById('outHours').innerText = hoursSaved + ' Hours';
      document.getElementById('outSavings').innerText = '$' + annualSavings.toLocaleString() + ' / yr';
    }"""

new_calc_roi = """    function calculateRoi() {
      const units = parseInt(document.getElementById('sliderUnits').value);
      const rent = parseInt(document.getElementById('sliderRent').value);

      document.getElementById('sliderUnitsVal').innerText = units + (units === 1 ? ' Unit' : ' Units');
      document.getElementById('sliderRentVal').innerText = '₹' + rent.toLocaleString('en-IN') + ' / mo';

      const monthlyRev = units * rent;
      const hoursSaved = Math.round(units * 3.2);
      const annualSavings = Math.round(units * 12000);

      document.getElementById('outRevenue').innerText = '₹' + monthlyRev.toLocaleString('en-IN') + ' / mo';
      document.getElementById('outHours').innerText = hoursSaved + ' Hours';
      document.getElementById('outSavings').innerText = '₹' + annualSavings.toLocaleString('en-IN') + ' / yr';
    }"""

if old_calc_roi in content:
    content = content.replace(old_calc_roi, new_calc_roi)
    print("Updated calculateRoi implementation for ₹.")

# Update submitNewUnit in renderHomePage for ₹
old_submit_new_unit = """        const formattedRent = '$' + parseFloat(rent).toLocaleString('en-US', { minimumFractionDigits: 2 });
        tr.innerHTML = '<td class="py-3 font-bold text-slate-900">' + unitId + '</td>' +
          '<td class="py-3 text-slate-600">' + unitType + '</td>' +
          '<td class="py-3 ' + (isVacant ? 'text-slate-400 italic' : 'text-slate-800 font-medium') + '">' + tenant + '</td>' +
          '<td class="py-3 font-bold text-slate-900">' + formattedRent + '</td>' +
          '<td class="py-3"><span class="px-2.5 py-1 rounded-full ' + (isVacant ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700') + ' font-semibold text-[11px]">' + (isVacant ? 'Available Now' : 'Active Lease') + '</span></td>' +
          '<td class="py-3 text-right"><span class="' + (isVacant ? 'text-amber-600' : 'text-emerald-600') + ' font-bold text-[11px]">' + (isVacant ? 'Vacant' : 'Active (Oct 01)') + '</span></td>';
        tbody.appendChild(tr);
      }

      closeAddUnitModal();
      showToast('Unit Added to Roster', unitId + ' (' + unitType + ') registered at $' + parseFloat(rent).toLocaleString() + '/mo.');"""

new_submit_new_unit = """        const formattedRent = '₹' + parseFloat(rent).toLocaleString('en-IN', { minimumFractionDigits: 2 });
        tr.innerHTML = '<td class="py-3 font-bold text-slate-900">' + unitId + '</td>' +
          '<td class="py-3 text-slate-600">' + unitType + '</td>' +
          '<td class="py-3 ' + (isVacant ? 'text-slate-400 italic' : 'text-slate-800 font-medium') + '">' + tenant + '</td>' +
          '<td class="py-3 font-bold text-slate-900">' + formattedRent + '</td>' +
          '<td class="py-3"><span class="px-2.5 py-1 rounded-full ' + (isVacant ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700') + ' font-semibold text-[11px]">' + (isVacant ? 'Available Now' : 'Active Lease') + '</span></td>' +
          '<td class="py-3 text-right"><span class="' + (isVacant ? 'text-amber-600' : 'text-emerald-600') + ' font-bold text-[11px]">' + (isVacant ? 'Vacant' : 'Active (Oct 01)') + '</span></td>';
        tbody.appendChild(tr);
      }

      closeAddUnitModal();
      showToast('Unit Added to Roster', unitId + ' (' + unitType + ') registered at ₹' + parseFloat(rent).toLocaleString('en-IN') + '/mo.');"""

if old_submit_new_unit in content:
    content = content.replace(old_submit_new_unit, new_submit_new_unit)
    print("Updated submitNewUnit formatting for ₹.")

# Add navigateToResidentHub and automatic hash listener
hash_routing_code = """
    // ── Dedicated Resident Hub Routing ─────────────────────────────
    function navigateToResidentHub(e) {
      if (e && e.preventDefault) e.preventDefault();
      switchExperience('tenant');
      if (history.pushState) {
        history.pushState(null, null, '#resident-hub');
      } else {
        location.hash = '#resident-hub';
      }
      setTimeout(() => {
        const el = document.getElementById('resident-hub');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    window.navigateToResidentHub = navigateToResidentHub;

    function handleHashRouting() {
      if (window.location.hash === '#resident-hub') {
        switchExperience('tenant');
        setTimeout(() => {
          const el = document.getElementById('resident-hub');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    window.addEventListener('hashchange', handleHashRouting);
    window.addEventListener('DOMContentLoaded', handleHashRouting);
    handleHashRouting();
"""

if "window.navigateToResidentHub = navigateToResidentHub;" not in content:
    content = content.replace("window.switchExperience = switchExperience;", "window.switchExperience = switchExperience;\n" + hash_routing_code)
    print("Injected navigateToResidentHub & automatic hash router.")

# ==============================================================================
# 11. ADMIN PAGE: PROPERTY IMAGES & ADD PROPERTY MODAL PRESETS
# ==============================================================================
# Update KPI gross roll in renderAdminPage
content = content.replace(
    "<p class=\"text-xs text-slate-500 mt-2\">Austin & San Francisco</p>",
    "<p class=\"text-xs text-slate-500 mt-2\">Mumbai, Bengaluru, Pune & Gurugram</p>"
)
content = content.replace(
    "<span id=\"stat-grossRentRoll\" class=\"text-2xl sm:text-3xl font-black text-slate-900\">$148,250</span>",
    "<span id=\"stat-grossRentRoll\" class=\"text-2xl sm:text-3xl font-black text-slate-900\">₹36,40,000</span>"
)
content = content.replace(
    "<p class=\"text-xs text-slate-500 mt-2\">Annualized: $1.78M</p>",
    "<p class=\"text-xs text-slate-500 mt-2\">Annualized: ₹4.36 Cr</p>"
)
content = content.replace(
    "document.getElementById('stat-grossRentRoll').textContent = '$' + grossRoll.toLocaleString();",
    "document.getElementById('stat-grossRentRoll').textContent = '₹' + grossRoll.toLocaleString('en-IN');"
)

# Update renderProperties to show images on cards and ₹ currency
old_render_props_map = """      grid.innerHTML = filtered.map(p => `
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
            </div>"""

new_render_props_map = """      grid.innerHTML = filtered.map(p => `
        <div class="soft-card overflow-hidden flex flex-col justify-between">
          <div class="relative h-44 w-full bg-slate-100 overflow-hidden">
            <img src="${p.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}" alt="${p.name}" class="w-full h-full object-cover hover:scale-105 transition duration-500">
            <span class="absolute top-3 left-3 text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-indigo-700 shadow-sm">
              ${p.type}
            </span>
            <span class="absolute top-3 right-3 text-xs font-mono font-bold text-slate-800 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm">${p.id}</span>
          </div>

          <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div class="space-y-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 tracking-tight">${p.name}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${p.address}, ${p.city}, ${p.state} ${p.zip}</p>
              </div>"""

if old_render_props_map in content:
    content = content.replace(old_render_props_map, new_render_props_map)
    print("Updated renderProperties to display property image.")

# Change Monthly Gross on card from $ to ₹
content = content.replace(
    '<span class="text-slate-900 font-black font-mono text-sm">${p.grossRent.toLocaleString()}</span>',
    '<span class="text-slate-900 font-black font-mono text-sm">₹${p.grossRent.toLocaleString("en-IN")}</span>'
)
content = content.replace(
    '<span class="text-slate-900 font-black font-mono text-sm">$${p.grossRent.toLocaleString()}</span>',
    '<span class="text-slate-900 font-black font-mono text-sm">₹${p.grossRent.toLocaleString("en-IN")}</span>'
)

# Update Add Property Modal in Admin
old_add_prop_modal_body = """        <div>
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
        </div>"""

new_add_prop_modal_body = """        <div>
          <label class="block font-bold text-slate-700 mb-1">Property Name</label>
          <input id="propName" type="text" required placeholder="e.g. Lodha Belmondo Heights" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Property Image URL</label>
          <input id="propImage" type="url" required value="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" placeholder="https://..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          <div class="flex flex-wrap gap-1.5 mt-2 text-[11px]">
            <span class="text-slate-500 font-medium self-center">Presets:</span>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Luxury High-Rise</button>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Garden Suites</button>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Modern Villa</button>
            <button type="button" onclick="document.getElementById('propImage').value='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'" class="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">Tech Park</button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Property Type</label>
            <select id="propType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
              <option value="Luxury Residential">Luxury Residential</option>
              <option value="Premium Residential">Premium Residential</option>
              <option value="Commercial Office">Commercial Office</option>
              <option value="Executive Suites">Executive Suites</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Total Units</label>
            <input id="propUnits" type="number" min="1" max="500" value="16" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Street Address</label>
          <input id="propAddress" type="text" required placeholder="e.g. Senapati Bapat Marg, Lower Parel" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">City</label>
            <input id="propCity" type="text" value="Mumbai" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">State</label>
            <input id="propState" type="text" value="Maharashtra" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Target Rent (₹/mo)</label>
            <input id="propRent" type="number" value="550000" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>"""

if old_add_prop_modal_body in content:
    content = content.replace(old_add_prop_modal_body, new_add_prop_modal_body)
    print("Added Image input & Indian fields to Add Property Modal.")

# Update submitNewProperty in renderAdminPage to read propImage
old_submit_prop_js = """    async function submitNewProperty(e) {
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
      };"""

new_submit_prop_js = """    async function submitNewProperty(e) {
      e.preventDefault();
      const name = document.getElementById('propName').value;
      const image = document.getElementById('propImage') ? document.getElementById('propImage').value : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
      const type = document.getElementById('propType').value;
      const unitsCount = parseInt(document.getElementById('propUnits').value);
      const address = document.getElementById('propAddress').value;
      const city = document.getElementById('propCity').value;
      const state = document.getElementById('propState').value;
      const grossRent = parseFloat(document.getElementById('propRent').value);
      const amenities = document.getElementById('propAmenities').value.split(',').map(s => s.trim());

      const payload = { name, image, type, unitsCount, address, city, state, grossRent, amenities };

      // Local optimistic update
      const newProp = {
        id: "PROP-" + String(appData.properties.length + 1).padStart(3, '0'),
        ...payload,
        occupiedCount: Math.max(1, unitsCount - 1),
        zip: "400001",
        status: "Operational"
      };"""

if old_submit_prop_js in content:
    content = content.replace(old_submit_prop_js, new_submit_prop_js)
    print("Updated submitNewProperty to save image and Indian pin.")

# Save modified worker
with open(worker_file, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully updated worker! Total length: {len(content)} chars.")
