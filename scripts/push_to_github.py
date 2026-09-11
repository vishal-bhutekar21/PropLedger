import subprocess
import sys
import time
import urllib.request
import urllib.error

REPO_URL = "https://github.com/vishal-bhutekar21/PropLedger"

def check_and_push():
    print(f"Checking if repository exists at {REPO_URL}...")
    try:
        req = urllib.request.Request(REPO_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            if resp.status == 200:
                print("Repository detected on GitHub! Pushing code...")
                res = subprocess.run(["git", "push", "-u", "origin", "main"], capture_output=True, text=True)
                print("STDOUT:", res.stdout)
                print("STDERR:", res.stderr)
                if res.returncode == 0:
                    print("SUCCESSFULLY PUSHED ALL CODE TO GITHUB!")
                    return True
    except urllib.error.HTTPError as e:
        print(f"Repository not found yet (HTTP {e.code}).")
        return False
    return False

if __name__ == "__main__":
    check_and_push()
