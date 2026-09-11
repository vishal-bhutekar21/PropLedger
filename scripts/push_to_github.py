import os
import subprocess
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

pat = os.environ.get("GITHUB_PAT", "")

if pat:
    auth_url = f"https://{pat}@github.com/vishal-bhutekar21/PropLedger.git"
    print("Attempting push to GitHub with PAT authentication...")
    res = subprocess.run(["git", "push", auth_url, "main"], capture_output=True, text=True)
    clean_stdout = res.stdout.replace(pat, "[REDACTED_PAT]")
    clean_stderr = res.stderr.replace(pat, "[REDACTED_PAT]")
    print("STDOUT:", clean_stdout)
    print("STDERR:", clean_stderr)
    if res.returncode == 0:
        print("ALL CODE, HANDBOOKS, AND REDESIGNED UI SUCCESSFULLY PUSHED TO GITHUB!")
        sys.exit(0)
    print("PAT push encountered an issue, falling back to standard git push using local credentials...")

print("Pushing to GitHub via default git remote...")
res = subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
print("Return code:", res.returncode)

if res.returncode == 0:
    print("ALL CODE, HANDBOOKS, AND REDESIGNED UI SUCCESSFULLY PUSHED TO GITHUB!")
else:
    print("To push directly from your terminal, run:")
    print("  git push -u origin main")

