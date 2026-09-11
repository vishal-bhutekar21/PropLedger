import os
import urllib.request
import json
import urllib.error

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

CF_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "0f1a504839b6b0767e3ee44da77c2c43")
CF_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
ZONE_ID = os.environ.get("CLOUDFLARE_ZONE_ID", "84d04451d623e1d6885d01c55a89ce3a")

if not CF_TOKEN:
    raise ValueError("CLOUDFLARE_API_TOKEN environment variable or .env file is required")

headers = {
    "Authorization": f"Bearer {CF_TOKEN}",
    "Content-Type": "application/json"
}

def check_status():
    url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/email/routing/addresses"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            for addr in data.get("result", []):
                print(f"Address: {addr.get('email')} -> Status: {addr.get('status')} (Verified: {addr.get('verified')})")
                if addr.get("status") == "verified":
                    return True
    except Exception as e:
        print("Error checking addresses:", e)
    return False

def create_support_rule():
    url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/email/routing/rules"
    rule_data = {
        "name": "Forward Support Queries to Vishal",
        "matchers": [
            {
                "type": "literal",
                "field": "to",
                "value": "support@propledger.vishalbhutekar.me"
            }
        ],
        "actions": [
            {
                "type": "forward",
                "value": [
                    "vishal.bhutekar1@gmail.com"
                ]
            }
        ],
        "enabled": True,
        "priority": 0
    }
    req = urllib.request.Request(url, data=json.dumps(rule_data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print("Successfully created Email Routing Rule:", data)
            return True
    except urllib.error.HTTPError as e:
        print(f"Failed to create rule: HTTP {e.code} - {e.read().decode('utf-8')}")
        return False

if __name__ == "__main__":
    is_verified = check_status()
    if is_verified:
        create_support_rule()
    else:
        print("Please check your Gmail inbox (vishal.bhutekar1@gmail.com) and click the Cloudflare verification link.")
