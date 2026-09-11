import os
import json
import urllib.request
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
WORKER_NAME = "propledger-worker"

if not CF_TOKEN:
    raise ValueError("CLOUDFLARE_API_TOKEN environment variable or .env file is required")

script_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cloudflare", "propledger-worker.js")
with open(script_path, "r", encoding="utf-8") as f:
    worker_code = f.read()

# Inject RESEND_API_KEY from environment if needed
resend_key = os.environ.get("RESEND_API_KEY", "")

boundary = "----WebKitFormBoundaryPropLedger2026"
metadata = {
    "body_part": "script",
    "bindings": [
        {
            "name": "RESEND_API_KEY",
            "type": "secret_text",
            "text": resend_key
        }
    ] if resend_key else [],
    "compatibility_date": "2025-01-01"
}

body_lines = [
    f"--{boundary}",
    'Content-Disposition: form-data; name="metadata"',
    'Content-Type: application/json',
    '',
    json.dumps(metadata),
    f"--{boundary}",
    'Content-Disposition: form-data; name="script"',
    'Content-Type: application/javascript',
    '',
    worker_code,
    f"--{boundary}--",
    ''
]
body_data = "\r\n".join(body_lines).encode("utf-8")

url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/workers/scripts/{WORKER_NAME}"
req = urllib.request.Request(
    url,
    data=body_data,
    headers={
        "Authorization": f"Bearer {CF_TOKEN}",
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    },
    method="PUT"
)

try:
    with urllib.request.urlopen(req) as resp:
        res = resp.read().decode("utf-8")
        print("WORKER DEPLOYMENT SUCCESSFUL:")
        print(res[:300])
except urllib.error.HTTPError as e:
    err = e.read().decode("utf-8")
    print(f"DEPLOYMENT FAILED: HTTP {e.code}")
    print(err)
