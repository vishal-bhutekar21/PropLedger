worker_path = 'cloudflare/propledger-worker.js'

with open(worker_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Let's inspect line range around 3088 to 3123
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if '// ── Export Rent Roll as CSV Spreadsheet' in line:
        start_idx = i
    if '// ── AutoPay Enrollment Switch' in line and start_idx is not None:
        end_idx = i
        break

if start_idx is not None and end_idx is not None:
    print(f'Removing lines {start_idx+1} to {end_idx}')
    lines[start_idx:end_idx] = []

text = ''.join(lines)

# Replace switchExperience and dispatchBatchBills with safe no-ops
old_switch = """    // 1. Dual Experience Switcher
    function switchExperience(type) {
      const landlordView = document.getElementById('viewLandlord');
      const tenantView = document.getElementById('viewTenant');
      const btnL = document.getElementById('tabBtnLandlord');
      const btnT = document.getElementById('tabBtnTenant');

      if (type === 'landlord') {
        landlordView.classList.remove('hidden');
        tenantView.classList.add('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5';
      } else {
        landlordView.classList.add('hidden');
        tenantView.classList.remove('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5';
      }
    }

    function dispatchBatchBills() {
      const btn = document.getElementById('batchDispatchBtn');
      const notice = document.getElementById('batchDispatchNotice');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-1">&#9696;</span> Dispatching across 402 units...';

      setTimeout(() => {
        notice.classList.remove('hidden');
        notice.innerHTML = '<strong>Batch Invoicing Complete!</strong><br>Successfully generated and emailed itemized statements across all 402 occupied units via Resend API.';
        btn.disabled = false;
        btn.innerHTML = '<span class="flex items-center justify-center gap-1.5"><svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Invoices Dispatched (402 Sent)</span></span>';
      }, 800);
    }"""

new_switch = """    // 1. Resident Portal Navigator
    function switchExperience(type) {
      const el = document.getElementById('resident-hub');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function dispatchBatchBills() {
      showToast('Admin Operations', 'Batch billing is managed securely in the Executive Admin Portal.');
    }"""

if old_switch in text:
    text = text.replace(old_switch, new_switch)
    print('Replaced switchExperience cleanly.')
else:
    print('old_switch not matched directly.')

with open(worker_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done cleaning legacy code.')
