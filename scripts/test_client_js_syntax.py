# -*- coding: utf-8 -*-
import urllib.request
import subprocess

req = urllib.request.Request('https://admin.propledger.vishalbhutekar.me/', headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8')

# Find all <script> and </script> tags
s_idx = html.rfind('<script>')
e_idx = html.find('</script>', s_idx)
js_code = html[s_idx + len('<script>'):e_idx]

# Replace the broken join("\n") with String.fromCharCode(10)
js_code_fixed = js_code.replace('join("\n");', 'join(String.fromCharCode(10));')

with open('scratch_admin_client.js', 'w', encoding='utf-8') as f:
    f.write(js_code_fixed)

res = subprocess.run(['node', '-c', 'scratch_admin_client.js'], capture_output=True, text=True)
print("Node -c exit code:", res.returncode)
if res.returncode != 0:
    print("Stderr:", res.stderr)
else:
    print("SUCCESS! Client JS has zero syntax errors when String.fromCharCode(10) is used!")
