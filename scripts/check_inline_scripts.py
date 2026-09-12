import re
import subprocess
import tempfile
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('cloudflare/propledger-worker.js', 'r', encoding='utf-8') as f:
    text = f.read()

scripts = re.findall(r'<script>(.*?)</script>', text, re.DOTALL)
print('Total <script> blocks found in worker:', len(scripts))

for i, s in enumerate(scripts):
    clean_s = re.sub(r'\\\$\{', '${', s)
    clean_s = re.sub(r'\$\{[^}]*\}', '"dummy"', clean_s)
    with tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w', encoding='utf-8') as tf:
        tf.write(clean_s)
        tf_name = tf.name
    res = subprocess.run(['node', '-c', tf_name], capture_output=True, text=True)
    print(f'Script {i+1} status: {res.returncode}')
    if res.returncode != 0:
        print(f'Error in script {i+1}:\n', res.stderr)
