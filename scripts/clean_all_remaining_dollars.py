import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

worker_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cloudflare", "propledger-worker.js")
with open(worker_file, "r", encoding="utf-8") as f:
    text = f.read()

print("Initial text length:", len(text))

# 1. Replace default amount in API / edge functions
text = text.replace("data.amount || '$3,250.00'", "data.amount || '₹65,000.00'")
text = text.replace('value="$3,250.00"', 'value="₹65,000.00"')

# 2. Replace Tour Modal triggers
text = text.replace(
    "openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo'",
    "openTourModal('Oberoi Sky City Luxury Suites', '₹32,000 - ₹1,45,000 / mo'"
)

# 3. Landlord roster table rows
old_landlord_tbody = """              <tbody class="divide-y divide-slate-100">
                <tr>
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
                </tr>
              </tbody>"""

new_landlord_tbody = """              <tbody class="divide-y divide-slate-100">
                <tr>
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
                  <td class="py-3 text-right"><button onclick="openTourModal('Unit 503 &bull; 3 BHK High-Rise &bull; Gurugram', '₹75,000 / mo', '1,850 sq ft &bull; 3 Bed', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="text-[#2546A6] hover:underline font-bold">+ Schedule Visit</button></td>
                </tr>
              </tbody>"""

if old_landlord_tbody in text:
    text = text.replace(old_landlord_tbody, new_landlord_tbody)
    print("Replaced Landlord Table Body with Indian flats and ₹ amounts.")

# 4. Itemized Balance in paymentModal
old_itemized_modal = """        <!-- Itemized Balance Display -->
        <div class="p-4 rounded-2xl space-y-2 text-xs bg-slate-50 border border-slate-200/80">
          <div class="flex justify-between text-slate-600">
            <span>Base Apartment Rent (Unit 402):</span>
            <span class="font-bold text-slate-800 tabular-nums">$2,850.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Assigned Parking Bay #14:</span>
            <span class="font-bold text-slate-800 tabular-nums">$250.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Building Services & CAM:</span>
            <span class="font-bold text-slate-800 tabular-nums">$150.00</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
            <span class="text-slate-900">Total Cleared Balance:</span>
            <span class="text-emerald-600 tabular-nums text-base font-black">$3,250.00</span>
          </div>
        </div>"""

new_itemized_modal = """        <!-- Itemized Balance Display -->
        <div class="p-4 rounded-2xl space-y-2 text-xs bg-slate-50 border border-slate-200/80">
          <div class="flex justify-between text-slate-600">
            <span>Base Apartment Rent (Unit 402):</span>
            <span class="font-bold text-slate-800 tabular-nums">₹55,000.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Reserved Covered Parking Bay #14:</span>
            <span class="font-bold text-slate-800 tabular-nums">₹3,500.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Society Maintenance & Clubhouse Amenities:</span>
            <span class="font-bold text-slate-800 tabular-nums">₹6,500.00</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
            <span class="text-slate-900">Total Cleared Balance:</span>
            <span class="text-emerald-600 tabular-nums text-base font-black">₹65,000.00</span>
          </div>
        </div>"""

if old_itemized_modal in text:
    text = text.replace(old_itemized_modal, new_itemized_modal)
    print("Replaced Itemized Balance in paymentModal.")

# 5. Tour Modal unit preview
text = text.replace(
    '<p id="tourUnitRent" class="text-xs font-black text-[#2546A6] tabular-nums mt-0.5">$3,100 / mo</p>',
    '<p id="tourUnitRent" class="text-xs font-black text-[#2546A6] tabular-nums mt-0.5">₹75,000 / mo</p>'
)
text = text.replace(
    '<p class="text-xs text-slate-500 font-medium">Unit 402 &bull; Alex Morgan</p>',
    '<p class="text-xs text-slate-500 font-medium">Unit 402 &bull; Ananya Iyer</p>'
)
text = text.replace(
    '<span class="font-bold text-slate-900">Alex Morgan</span>',
    '<span class="font-bold text-slate-900">Ananya Iyer</span>'
)
text = text.replace('Alex Mercer', 'Rajesh Patel')

# 6. CSV Export Rows
old_csv_rows = """    function exportRentRollCsv() {
      const rows = [
        ['Unit', 'Floor Plan Type', 'Resident Name', 'Monthly Rent (USD)', 'Lease Status', 'Payment Status'],
        ['Unit 101', '1-Bed Studio', 'Sarah Connor', '1650.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 204', '2-Bed Suite', 'Alex Mercer', '2400.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 402', 'Horizon Penthouse', 'Alex Morgan', '2850.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 503', 'Skyline Loft', 'Vacant', '3100.00', 'Available Now', 'Unoccupied']
      ];"""

new_csv_rows = """    function exportRentRollCsv() {
      const rows = [
        ['Unit', 'Floor Plan Type', 'Resident Name', 'Monthly Rent (INR ₹)', 'Lease Status', 'Payment Status'],
        ['Unit 101', '1 BHK Studio', 'Ananya Iyer', '32000.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 204', '2 BHK Suite', 'Rohan Deshmukh', '52000.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 402', '3 BHK Penthouse', 'Vishal Bhutekar', '65000.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 503', '3 BHK High-Rise', 'Vacant', '75000.00', 'Available Now', 'Unoccupied']
      ];"""

if old_csv_rows in text:
    text = text.replace(old_csv_rows, new_csv_rows)
    print("Replaced exportRentRollCsv rows with ₹ and Indian names.")

# 7. AutoPay toast and text
text = text.replace("statusText.innerText = 'Active • Chase ••••8421';", "statusText.innerText = 'Active • HDFC UPI AutoPay (ananya@okhdfcbank)';")
text = text.replace("Monthly rent ($3,250.00) will be automatically cleared on the 1st of every month via Chase Checking ••••8421.", "Monthly rent (₹65,000.00) will be automatically cleared on the 1st of each month via UPI AutoPay.")

# 8. Financials tab in Admin
text = text.replace('<p class="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">$148,250</p>', '<p class="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">₹36,40,000</p>')
text = text.replace('<p class="text-xl sm:text-2xl font-black text-rose-600 mt-1.5">$38,620</p>', '<p class="text-xl sm:text-2xl font-black text-rose-600 mt-1.5">₹8,20,000</p>')
text = text.replace('<p class="text-xl sm:text-2xl font-black text-emerald-900 mt-1.5">$109,630</p>', '<p class="text-xl sm:text-2xl font-black text-emerald-900 mt-1.5">₹28,20,000</p>')
text = text.replace('<p class="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">$4,800</p>', '<p class="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">₹52,000</p>')

# Financial Chart Axis
text = text.replace('font-family="JetBrains Mono">$150k</text>', 'font-family="JetBrains Mono">₹40L</text>')
text = text.replace('font-family="JetBrains Mono">$100k</text>', 'font-family="JetBrains Mono">₹30L</text>')
text = text.replace('font-family="JetBrains Mono">$90k</text>', 'font-family="JetBrains Mono">₹25L</text>')
text = text.replace('font-family="JetBrains Mono">$50k</text>', 'font-family="JetBrains Mono">₹15L</text>')
text = text.replace('font-family="JetBrains Mono">$0</text>', 'font-family="JetBrains Mono">₹0</text>')

# Financial Breakdown
text = text.replace('<p class="text-xs text-slate-500">Gross Monthly Distribution of $148,250.00</p>', '<p class="text-xs text-slate-500">Gross Monthly Distribution of ₹36,40,000.00</p>')
text = text.replace('<span class="text-lg font-black text-slate-900 font-mono">$148.2K</span>', '<span class="text-lg font-black text-slate-900 font-mono">₹36.4L</span>')

# Property revenue breakdown in Admin
text = text.replace('<span class="font-bold text-slate-900">$68,400</span>', '<span class="font-bold text-slate-900">₹14,50,000</span>')
text = text.replace('<span class="font-bold text-slate-900">$52,000</span>', '<span class="font-bold text-slate-900">₹9,80,000</span>')
text = text.replace('Austin Tech Nexus', 'DLF Cyber Enclave')
text = text.replace('<span class="font-bold text-slate-900">$27,850</span>', '<span class="font-bold text-slate-900">₹5,40,000</span>')
text = text.replace('Skyline Bay Lofts', 'Panchshil Towers')

# Transactions in Admin
text = text.replace('<span class="font-mono text-emerald-700">+$118,000</span>', '<span class="font-mono text-emerald-700">+₹14,50,000</span>')
text = text.replace('<span class="font-mono text-emerald-700">+$27,850</span>', '<span class="font-mono text-emerald-700">+₹9,80,000</span>')
text = text.replace('<span class="font-mono text-emerald-700">+$2,400</span>', '<span class="font-mono text-emerald-700">+₹6,70,000</span>')
text = text.replace('<span class="font-mono text-rose-600">-$14,200</span>', '<span class="font-mono text-rose-600">-₹3,20,000</span>')
text = text.replace('<span class="font-mono text-rose-600">-$11,500</span>', '<span class="font-mono text-rose-600">-₹2,50,000</span>')
text = text.replace('<span class="font-mono text-rose-600">-$12,920</span>', '<span class="font-mono text-rose-600">-₹2,50,000</span>')

# Replace any lingering "The Grand Horizon" with "Oberoi Sky City Residences"
text = text.replace("The Grand Horizon", "Oberoi Sky City Residences")

# Save
with open(worker_file, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Cleaned all remaining dollars and US references. Final size: {len(text)} chars.")
