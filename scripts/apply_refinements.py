import re

worker_path = 'cloudflare/propledger-worker.js'

with open(worker_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Clean up AutoPay toast rent
text = text.replace(
    "showToast('AutoPay Activated', 'Monthly rent ($3,250.00) will be automatically cleared on the 1st of every month.');",
    "showToast('AutoPay Activated', 'Monthly rent (₹65,000.00) will be automatically cleared on the 1st of every month.');"
)

# 2. Clean up submitNewUnit description
text = re.sub(
    r'description:\s*`\$\{unitNum\}\s*added\s*to\s*\$\{propName\}\s*\(\$\$\{rent\.toLocaleString\(\)\}/mo\)\.`',
    r'description: `${unitNum} added to ${propName} (₹${rent.toLocaleString("en-IN")}/mo).`',
    text
)

# 3. Clean up tour phone placeholder & email placeholder
text = text.replace(
    'placeholder="+1 (555) 019-2834"',
    'placeholder="+91 98201 23456"'
)
text = text.replace(
    'placeholder="alex@example.com"',
    'placeholder="rajesh@example.in"'
)

# 4. Clean up #dual-experience navbar links
text = text.replace(
    '<a href="#dual-experience" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Live Portals</a>',
    '<a href="#resident-hub" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Resident Hub</a>'
)
text = text.replace(
    '<a href="#dual-experience" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Live Portals</a>',
    '<a href="#resident-hub" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Resident Hub</a>'
)
text = text.replace(
    '<a href="#dual-experience" class="pill-btn px-7 py-4 border-2 border-white/30 hover:border-white text-white font-bold text-sm backdrop-blur-sm transition flex items-center gap-2">\n            <span>Try Live Portals &darr;</span>',
    '<a href="#resident-hub" class="pill-btn px-7 py-4 border-2 border-white/30 hover:border-white text-white font-bold text-sm backdrop-blur-sm transition flex items-center gap-2">\n            <span>Resident Hub &darr;</span>'
)
text = text.replace(
    '<p><a href="#dual-experience" class="text-blue-200 hover:text-white transition">Dual Experience</a></p>',
    '<p><a href="#resident-hub" class="text-blue-200 hover:text-white transition">Resident & Tenant Hub</a></p>'
)

# 5. Add BroadcastChannel listener in loadDynamicProperties
target_broadcast_anchor = 'window.loadDynamicProperties = loadDynamicProperties;'
if target_broadcast_anchor in text:
    replacement = """    try {
      const bc = new BroadcastChannel('propledger_channel');
      bc.onmessage = function(e) {
        if (e.data && (e.data.type === 'PROPERTY_ADDED' || e.data.type === 'PROPERTY_DELETED')) {
          loadDynamicProperties();
        }
      };
    } catch (e) {}

    window.loadDynamicProperties = loadDynamicProperties;"""
    text = text.replace(target_broadcast_anchor, replacement, 1)

with open(worker_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully applied all script refinements.')
