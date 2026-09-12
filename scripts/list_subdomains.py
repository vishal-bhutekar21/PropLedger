import os
import json
import urllib.request

env_path = os.path.join(os.getcwd(), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for l in f:
            if '=' in l and not l.startswith('#'):
                k, v = l.strip().split('=', 1)
                os.environ[k.strip()] = v.strip()

token = os.environ.get('CLOUDFLARE_API_TOKEN')
account_id = os.environ.get('CLOUDFLARE_ACCOUNT_ID', '0f1a504839b6b0767e3ee44da77c2c43')
zone_id = '84d04451d623e1d6885d01c55a89ce3a'

# 1. DNS Records
req_dns = urllib.request.Request(
    f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?per_page=100',
    headers={'Authorization': f'Bearer {token}'}
)
try:
    with urllib.request.urlopen(req_dns) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        records = data.get('result', [])
        print(f"=== CLOUDFLARE DNS RECORDS ({len(records)} found) ===")
        for r in records:
            p_status = "Proxied" if r.get('proxied') else "DNS Only"
            print(f"{r['type']:6} | {r['name']:40} | {r['content'][:35]:35} | {p_status}")
except Exception as e:
    print(f"DNS query error: {e}")

# 2. Worker Custom Domains
req_domains = urllib.request.Request(
    f'https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/domains',
    headers={'Authorization': f'Bearer {token}'}
)
try:
    with urllib.request.urlopen(req_domains) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        domains = data.get('result', [])
        print(f"\n=== WORKER CUSTOM DOMAINS ({len(domains)} found) ===")
        for d in domains:
            print(f"Hostname: {d.get('hostname')} | Service: {d.get('service')} | Environment: {d.get('environment')}")
except Exception as e:
    print(f"Worker domains query error: {e}")
