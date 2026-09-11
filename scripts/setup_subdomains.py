import os
import urllib.request
import json
import sys

def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

load_env()

CF_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
ZONE_ID = os.environ.get("CLOUDFLARE_ZONE_ID", "84d04451d623e1d6885d01c55a89ce3a")

if not CF_TOKEN:
    print("Error: CLOUDFLARE_API_TOKEN not found in environment or .env")
    sys.exit(1)

def cf_api(endpoint, method="GET", data=None):
    url = f"https://api.cloudflare.com/client/v4{endpoint}"
    req_data = json.dumps(data).encode("utf-8") if data else None
    headers = {
        "Authorization": f"Bearer {CF_TOKEN}",
        "Content-Type": "application/json"
    }
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} on {method} {endpoint}: {err_msg}")
        return json.loads(err_msg) if err_msg.startswith("{") else {"success": False, "error": err_msg}

# 1. Check existing DNS records
dns_resp = cf_api(f"/zones/{ZONE_ID}/dns_records")
existing_records = {r["name"]: r for r in dns_resp.get("result", [])}

records_to_create = [
    {
        "name": "home.propledger",
        "full_name": "home.propledger.vishalbhutekar.me",
        "type": "A",
        "content": "192.0.2.1",
        "proxied": True
    },
    {
        "name": "admin.propledger",
        "full_name": "admin.propledger.vishalbhutekar.me",
        "type": "A",
        "content": "192.0.2.1",
        "proxied": True
    },
    {
        "name": "admin-propledger",
        "full_name": "admin-propledger.vishalbhutekar.me",
        "type": "A",
        "content": "192.0.2.1",
        "proxied": True
    },
    {
        "name": "admin",
        "full_name": "admin.vishalbhutekar.me",
        "type": "A",
        "content": "192.0.2.1",
        "proxied": True
    },
    {
        "name": "home-propledger",
        "full_name": "home-propledger.vishalbhutekar.me",
        "type": "A",
        "content": "192.0.2.1",
        "proxied": True
    },
    {
        "name": "zensar-prep",
        "full_name": "zensar-prep.vishalbhutekar.me",
        "type": "A",
        "content": "192.0.2.1",
        "proxied": True
    }
]

print("=== CREATING / UPDATING DNS RECORDS ===")
for rec in records_to_create:
    full = rec["full_name"]
    if full in existing_records:
        rec_id = existing_records[full]["id"]
        print(f"Updating DNS record {full} ({rec['type']} -> {rec['content']})...")
        res = cf_api(f"/zones/{ZONE_ID}/dns_records/{rec_id}", method="PUT", data={
            "type": rec["type"],
            "name": rec["name"],
            "content": rec["content"],
            "proxied": rec["proxied"],
            "ttl": 1
        })
        print("Result:", res.get("success"))
    else:
        print(f"Creating DNS record {full} ({rec['type']} -> {rec['content']})...")
        res = cf_api(f"/zones/{ZONE_ID}/dns_records", method="POST", data={
            "type": rec["type"],
            "name": rec["name"],
            "content": rec["content"],
            "proxied": rec["proxied"],
            "ttl": 1
        })
        print("Result:", res.get("success"), res.get("errors"))

# 2. Check and add Worker Routes
print("\n=== CONFIGURING WORKER ROUTES ===")
routes_resp = cf_api(f"/zones/{ZONE_ID}/workers/routes")
existing_routes = {r["pattern"]: r for r in routes_resp.get("result", [])}

routes_to_add = [
    "home.propledger.vishalbhutekar.me/*",
    "admin.propledger.vishalbhutekar.me/*",
    "admin-propledger.vishalbhutekar.me/*",
    "admin.vishalbhutekar.me/*",
    "home-propledger.vishalbhutekar.me/*",
    "zensar-prep.vishalbhutekar.me/*"
]

for pattern in routes_to_add:
    if pattern in existing_routes:
        print(f"Route {pattern} already active.")
    else:
        print(f"Creating Worker route {pattern} -> propledger-worker...")
        res = cf_api(f"/zones/{ZONE_ID}/workers/routes", method="POST", data={
            "pattern": pattern,
            "script": "propledger-worker"
        })
        print("Result:", res.get("success"), res.get("errors"))

print("\nSubdomain and routing setup complete!")
