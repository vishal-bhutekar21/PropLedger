import urllib.request
import urllib.error
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "https://propledger.vishalbhutekar.me"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
}

results = []

def run_test(category, name, method, url, payload=None, expected_status=200, check_fn=None):
    req_data = json.dumps(payload).encode('utf-8') if payload else None
    req = urllib.request.Request(url, data=req_data, headers=HEADERS, method=method)
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            duration = int((time.time() - start) * 1000)
            body_bytes = resp.read()
            body_str = body_bytes.decode('utf-8', errors='replace')
            status = resp.status
            
            # Try parsing JSON
            json_data = None
            try:
                json_data = json.loads(body_str)
            except Exception:
                pass

            passed = (status == expected_status)
            detail = ""
            if check_fn and json_data:
                passed, detail = check_fn(json_data)
            elif check_fn and not json_data:
                passed, detail = check_fn(body_str)
            else:
                detail = f"Status {status}"

            res = {
                "category": category,
                "name": name,
                "method": method,
                "url": url,
                "status": status,
                "duration_ms": duration,
                "passed": passed,
                "detail": detail,
                "data": json_data
            }
            results.append(res)
            mark = "✓ PASS" if passed else "✗ FAIL"
            print(f"[{mark}] {category:15} | {name:38} | {duration:4}ms | {detail}")
            return res
    except urllib.error.HTTPError as e:
        duration = int((time.time() - start) * 1000)
        err_body = e.read().decode('utf-8', errors='replace')
        passed = (e.code == expected_status)
        detail = f"HTTP {e.code}: {err_body[:80]}"
        res = {
            "category": category,
            "name": name,
            "method": method,
            "url": url,
            "status": e.code,
            "duration_ms": duration,
            "passed": passed,
            "detail": detail
        }
        results.append(res)
        mark = "✓ PASS" if passed else "✗ FAIL"
        print(f"[{mark}] {category:15} | {name:38} | {duration:4}ms | {detail}")
        return res
    except Exception as e:
        duration = int((time.time() - start) * 1000)
        res = {
            "category": category,
            "name": name,
            "method": method,
            "url": url,
            "status": 0,
            "duration_ms": duration,
            "passed": False,
            "detail": str(e)
        }
        results.append(res)
        print(f"[✗ FAIL] {category:15} | {name:38} | {duration:4}ms | {e}")
        return res

print("================================================================================")
print("             PROPLEDGER COMPREHENSIVE BACKEND & SUBDOMAINS AUDIT                ")
print("================================================================================")

# ------------------------------------------------------------------------------
# 1. PUBLIC API FUNCTIONALITIES
# ------------------------------------------------------------------------------
print("\n--- 1. PUBLIC APIS & WORKER ROUTING ---")
run_test("Public API", "System Health & Status", "GET", f"{BASE_URL}/api/status",
         check_fn=lambda d: (d.get("status") == "operational", f"App: {d.get('app')}, Support: {d.get('supportEmail')}"))

run_test("Public API", "Public Properties Listing", "GET", f"{BASE_URL}/api/public/properties",
         check_fn=lambda d: (d.get("success") and len(d.get("properties", [])) > 0, f"{len(d.get('properties', []))} properties returned with INR rents"))

run_test("Public API", "Public Announcements", "GET", f"{BASE_URL}/api/public/announcements",
         check_fn=lambda d: (d.get("success"), f"{len(d.get('announcements', []))} active notices"))

run_test("Public API", "Submit Maintenance Request", "POST", f"{BASE_URL}/api/public/submit-maintenance",
         payload={
             "residentName": "Ananya Iyer",
             "unit": "402",
             "email": "vishal.bhutekar1@gmail.com",
             "category": "Electrical & HVAC",
             "urgency": "Routine",
             "description": "Living room light fixture needs replacement."
         },
         check_fn=lambda d: (d.get("success") and "ticketId" in d, f"Created Ticket: {d.get('ticketId')}"))

run_test("Public API", "Request Rent Statement", "POST", f"{BASE_URL}/api/public/request-statement",
         payload={
             "residentName": "Rohan Deshmukh",
             "unit": "204",
             "email": "vishal.bhutekar1@gmail.com",
             "monthYear": "September 2026"
         },
         check_fn=lambda d: (d.get("success"), d.get("message", "Dispatched")))

run_test("Public API", "Tour Booking / Reservation", "POST", f"{BASE_URL}/api/public/tour-booking",
         payload={
             "name": "Kavita Sen",
             "email": "vishal.bhutekar1@gmail.com",
             "phone": "+91 98112 33445",
             "unit": "Prestige Tech Vista Suites • Bengaluru",
             "tourType": "In-Person Tour",
             "slot": "Tomorrow 11:30 AM"
         },
         check_fn=lambda d: (d.get("success") and "bookingId" in d, f"Booking Ref: {d.get('bookingId')}"))

run_test("Public API", "Concierge Desk Inbound Query", "POST", f"{BASE_URL}/api/support-query",
         payload={
             "senderName": "John Doe",
             "senderEmail": "vishal.bhutekar1@gmail.com",
             "subject": "Question about rental management",
             "message": "Hello, I would like to learn more about setting up PropLedger for my rental property."
         },
         check_fn=lambda d: (d.get("success"), f"Ticket #{d.get('ticketId')}, Forwarded to: {d.get('forwardedTo')}"))

# ------------------------------------------------------------------------------
# 2. CLOUDFLARE KV MEDIA STORAGE
# ------------------------------------------------------------------------------
print("\n--- 2. CLOUDFLARE KV MEDIA & IMAGE STORAGE ---")
sample_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
upload_res = run_test("KV Media", "Upload Image to Cloudflare KV", "POST", f"{BASE_URL}/api/admin/upload-image",
                      payload={
                          "filename": "audit_test_suite.png",
                          "contentType": "image/png",
                          "base64": sample_png_base64
                      },
                      check_fn=lambda d: (d.get("success") and "url" in d, f"Media ID: {d.get('mediaId')}, URL: {d.get('url')}"))

if upload_res and upload_res.get("data") and upload_res["data"].get("url"):
    media_url = upload_res["data"]["url"]
    run_test("KV Media", "Serve Image from Cloudflare Edge", "GET", f"{BASE_URL}{media_url}",
             check_fn=lambda b: (len(b) > 0, f"Retrieved {len(b)} bytes from KV"))

# ------------------------------------------------------------------------------
# 3. MASTER ADMIN REST APIS & DATA STORE
# ------------------------------------------------------------------------------
print("\n--- 3. MASTER ADMIN REST APIS & STATE ---")
run_test("Admin API", "Get Full Dashboard Data", "GET", f"{BASE_URL}/api/admin/dashboard-data",
         check_fn=lambda d: (d.get("success") and "properties" in d.get("data", {}),
                             f"{len(d['data']['properties'])} props, {len(d['data'].get('users', []))} users, {len(d['data'].get('tasks', []))} tasks"))

test_prop_id = None
new_prop_res = run_test("Admin API", "Register New Property Asset", "POST", f"{BASE_URL}/api/admin/properties",
                        payload={
                            "name": "Audit Grand Residency",
                            "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                            "address": "Linking Road, Bandra West",
                            "city": "Mumbai",
                            "state": "Maharashtra",
                            "type": "Luxury High-Rise",
                            "unitsCount": 20,
                            "grossRent": 1600000,
                            "amenities": ["Infinity Pool", "Concierge Desk", "EV Fast Charging"]
                        },
                        check_fn=lambda d: (d.get("success") and "property" in d, f"Registered: {d.get('property', {}).get('id')} - {d.get('property', {}).get('name')}"))

if new_prop_res and new_prop_res.get("data") and new_prop_res["data"].get("property"):
    test_prop_id = new_prop_res["data"]["property"].get("id")

run_test("Admin API", "Get Maintenance Tickets Queue", "GET", f"{BASE_URL}/api/admin/maintenance-tickets",
         check_fn=lambda d: (d.get("success"), f"{len(d.get('tickets', []))} maintenance tickets in queue"))

run_test("Admin API", "Get Tour Requests Queue", "GET", f"{BASE_URL}/api/admin/tour-requests",
         check_fn=lambda d: (d.get("success"), f"{len(d.get('tours', []))} tour requests logged"))

run_test("Admin API", "Add New Resident / Tenant", "POST", f"{BASE_URL}/api/admin/users",
         payload={
             "name": "Vikram Malhotra",
             "email": "vikram.malhotra@example.com",
             "phone": "+91 98200 44556",
             "role": "TENANT",
             "property": "Oberoi Sky City Residences",
             "unit": "Unit 305",
             "rent": 55000,
             "status": "Active"
         },
         check_fn=lambda d: (d.get("success"), f"Created User: {d.get('user', {}).get('id')}"))

run_test("Admin API", "Add Task / Work Order", "POST", f"{BASE_URL}/api/admin/tasks",
         payload={
             "title": "Quarterly Generator Load Bank Testing",
             "category": "Electrical & HVAC",
             "priority": "MEDIUM",
             "property": "DLF Cyber Enclave",
             "unit": "Substation B",
             "assignee": "Suresh Kumar",
             "dueDate": "Sep 20, 2026"
         },
         check_fn=lambda d: (d.get("success"), f"Created Task: {d.get('task', {}).get('id')}"))

run_test("Admin API", "Publish Society Announcement", "POST", f"{BASE_URL}/api/admin/announcements",
         payload={
             "title": "Ganesh Utsav Society Celebration",
             "body": "Join us at the clubhouse for cultural evening and pooja this weekend.",
             "priority": "info"
         },
         check_fn=lambda d: (d.get("success"), f"Announcement Created: {d.get('announcement', {}).get('id')}"))

# Cleanup the test property so production stays pristine
if test_prop_id:
    run_test("Admin API", "Delete Property Asset (Cleanup)", "POST", f"{BASE_URL}/api/admin/properties/delete",
             payload={"id": test_prop_id},
             check_fn=lambda d: (d.get("success"), d.get("message", "Deleted")))

# ------------------------------------------------------------------------------
# 4. SUBDOMAIN & HOST AUDIT
# ------------------------------------------------------------------------------
print("\n--- 4. SUBDOMAINS & NETWORK GATEWAYS ---")

subdomains = [
    ("https://propledger.vishalbhutekar.me", "Primary Public Website & Discovery Portal"),
    ("https://home.propledger.vishalbhutekar.me", "Public Website Worker Custom Domain Gateway"),
    ("https://admin.propledger.vishalbhutekar.me", "Master Admin Console Custom Domain"),
    ("https://admin-propledger.vishalbhutekar.me", "Admin Alternative Hostname"),
    ("https://admin.vishalbhutekar.me", "Root Admin Subdomain Routing"),
    ("https://home-propledger.vishalbhutekar.me", "Public Portal Alternative Hostname"),
    ("https://porpledger.vishalbhutekar.me", "Friendly Typo-Catch Subdomain"),
    ("https://zensar-prep.vishalbhutekar.me", "Zensar Prep Suite Netlify Edge Proxy"),
    ("https://new.vishalbhutekar.me", "Cloudflare Pages Portfolio Gateway"),
    ("https://vishalbhutekar.me", "Apex Root Domain Gateway")
]

for url, description in subdomains:
    run_test("Subdomain", description, "GET", url,
             check_fn=lambda b: (len(b) > 100, f"HTTP 200 OK ({len(b)} bytes rendered)"))

# Summary
passed_count = sum(1 for r in results if r["passed"])
total_count = len(results)
print("\n================================================================================")
print(f"AUDIT SUMMARY: {passed_count} of {total_count} CHECKS PASSED ({int(passed_count/total_count*100)}% SUCCESS RATE)")
print("================================================================================")
