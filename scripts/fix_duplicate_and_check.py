import re
import subprocess
import tempfile
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('cloudflare/propledger-worker.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the duplicate let activePayMethod in renderHomePage:
# Find "let activePayMethod = 'ach';" and remove it
if "let activePayMethod = 'ach';" in text:
    text = text.replace("let activePayMethod = 'ach';\n", "")
    print("Removed duplicate 'let activePayMethod = 'ach';'")
    with open('cloudflare/propledger-worker.js', 'w', encoding='utf-8') as f:
        f.write(text)

# Now test evaluated script content for both renderHomePage and renderAdminPage
# In renderHomePage:
m1 = re.search(r'function renderHomePage\(hostname\)\s*\{\s*return `(.*?)`;\s*\}', text, re.DOTALL)
if m1:
    home_html = m1.group(1).replace(r'\`', '`').replace(r'\${', '${')
    scripts1 = re.findall(r'<script>(.*?)</script>', home_html, re.DOTALL)
    for idx, s in enumerate(scripts1):
        with tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w', encoding='utf-8') as tf:
            tf.write(s)
            tf_name = tf.name
        res = subprocess.run(['node', '-c', tf_name], capture_output=True, text=True)
        print(f'renderHomePage Script {idx+1} syntax: {"OK" if res.returncode == 0 else "ERROR"}')
        if res.returncode != 0:
            print(res.stderr)

# In renderAdminPage:
m2 = re.search(r'function renderAdminPage\(hostname\)\s*\{\s*return `(.*?)`;\s*\}', text, re.DOTALL)
if m2:
    admin_html = m2.group(1).replace(r'\`', '`').replace(r'\${', '${')
    scripts2 = re.findall(r'<script>(.*?)</script>', admin_html, re.DOTALL)
    for idx, s in enumerate(scripts2):
        with tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w', encoding='utf-8') as tf:
            tf.write(s)
            tf_name = tf.name
        res = subprocess.run(['node', '-c', tf_name], capture_output=True, text=True)
        print(f'renderAdminPage Script {idx+1} syntax: {"OK" if res.returncode == 0 else "ERROR"}')
        if res.returncode != 0:
            print(res.stderr)
