import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

worker_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cloudflare", "propledger-worker.js")
with open(worker_path, "r", encoding="utf-8") as f:
    code = f.read()

print(f"Original length: {len(code)}")

# 1. Remove the "Add Unit" button from the public homepage landlord preview table
old_btn = """              <button onclick="openAddUnitModal()" class="pill-btn px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span>Add Unit</span>
              </button>"""

new_btn = """              <a href="/admin" target="_blank" class="pill-btn px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shadow-sm flex items-center gap-1.5 transition" title="Open Master Admin Operations Portal">
                <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" stroke-width="2"/></svg>
                <span>Admin Operations &rarr;</span>
              </a>"""

if old_btn in code:
    code = code.replace(old_btn, new_btn, 1)
    print("STEP 1 (Replaced Add Unit button on homepage with Admin Portal link): SUCCESS")
else:
    print("STEP 1: target old_btn not found!")

# 2. Remove the addUnitModal HTML completely from renderHomePage
modal_regex = re.compile(r'\s*<!-- 3\. ADD UNIT MODAL.*?-->\s*<div id="addUnitModal".*?</div>\s*</div>\s*</div>', re.DOTALL)
if modal_regex.search(code):
    code = modal_regex.sub("", code, count=1)
    print("STEP 2 (Removed addUnitModal HTML from renderHomePage): SUCCESS")
else:
    print("STEP 2: modal_regex not found!")

# 3. Remove client-side openAddUnitModal, closeAddUnitModal, submitNewUnit from renderHomePage
functions_regex = re.compile(r'\s*// ── Add Unit Modal Logic ──.*?\n\s*function submitNewUnit\(\) \{.*?\n\s*\}\n', re.DOTALL)
if functions_regex.search(code):
    code = functions_regex.sub("\n", code, count=1)
    print("STEP 3 (Removed Add Unit client JS functions from renderHomePage): SUCCESS")
else:
    print("STEP 3: functions_regex not found!")

# 4. Clean window bindings on homepage
code = code.replace("window.openAddUnitModal = openAddUnitModal;\n", "")
code = code.replace("window.closeAddUnitModal = closeAddUnitModal;\n", "")
code = code.replace("window.submitNewUnit = submitNewUnit;\n", "")
print("STEP 4 (Cleaned window bindings): SUCCESS")

# 5. Language Simplification
code = code.replace(
    '<span>Enterprise Cloud Platform &bull; <strong class="text-[#38BDF8]">99.9% Uptime SLA</strong></span>',
    '<span>Safe, Fast &bull; <strong class="text-[#38BDF8]">100% Online Always</strong></span>'
)
code = code.replace(
    'PropLedger Technologies &bull; Automated Enterprise Operations',
    'PropLedger &bull; Simple Property Management & Rent Payments for India'
)
code = code.replace(
    '<span>Enterprise-Grade Security &amp; 99.9% Reliability</span>',
    '<span>Bank-Grade 256-bit Security &amp; 100% Reliable Data</span>'
)
code = code.replace(
    'Dual-Experience Interactive Demo',
    'Experience Both Sides: Resident & Landlord'
)
code = code.replace(
    'Toggle between the Tenant Resident Experience and Landlord Operating System',
    'See how simple it is for residents to pay rent, and for landlords to track income'
)

with open(worker_path, "w", encoding="utf-8") as f:
    f.write(code)

print(f"Updated worker written successfully! New length: {len(code)}")
