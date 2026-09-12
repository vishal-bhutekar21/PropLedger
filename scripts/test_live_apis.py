import urllib.request
import json
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')
base_url = 'https://propledger.vishalbhutekar.me'

def test_api(name, path, method='GET', data=None):
    print(f"\n==========================================")
    print(f"=== Testing: {name} ({method} {path}) ===")
    url = base_url + path
    headers = {'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json'}
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8') if data else None,
        headers=headers,
        method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print(f"Status: {resp.status}")
            print(f"Response snippet: {body[:300]}")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        print(f"FAILED HTTP {e.code}: {e.read().decode('utf-8')}")
        return None
    except Exception as e:
        print(f"FAILED Exception: {e}")
        return None

# 1. Test public properties
props = test_api('Public Properties', '/api/public/properties')

# 2. Test Concierge Query (Send Inquiry to Concierge Desk)
concierge_payload = {
    'senderName': 'John Doe',
    'senderEmail': 'vishal.bhutekar1@gmail.com', # verified recipient to test delivery
    'subject': 'Question about rental management',
    'message': 'Hello, I would like to learn more about setting up PropLedger for my rental property.'
}
test_api('Concierge Desk Inquiry', '/api/support-query', method='POST', data=concierge_payload)

# 3. Test Tour Booking / Reservation
tour_payload = {
    'name': 'Aarav Sharma',
    'email': 'vishal.bhutekar1@gmail.com',
    'phone': '+91 98200 99887',
    'unit': 'Oberoi Sky City Residences • Mumbai',
    'tourType': 'In-Person Tour',
    'slot': 'Tomorrow 10:30 AM'
}
test_api('Tour Booking / Reservation', '/api/public/tour-booking', method='POST', data=tour_payload)

# 4. Test Image Upload to Cloudflare KV
# 1x1 transparent PNG base64
dummy_png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
upload_payload = {
    'filename': 'godrej_tower.png',
    'contentType': 'image/png',
    'base64': dummy_png
}
upload_res = test_api('Cloudflare KV Image Upload', '/api/admin/upload-image', method='POST', data=upload_payload)

if upload_res and upload_res.get('url'):
    media_url = upload_res['url']
    print(f"\nTesting Media Retrieval for: {media_url}")
    try:
        with urllib.request.urlopen(urllib.request.Request(base_url + media_url, headers={'User-Agent': 'Mozilla/5.0'})) as m_resp:
            ct = m_resp.headers.get('Content-Type')
            content = m_resp.read()
            print(f"Media Status: {m_resp.status}, Content-Type: {ct}, Length: {len(content)} bytes")
    except Exception as e:
        print(f"Media fetch error: {e}")

# 5. Add new property with image in admin
new_prop_payload = {
    'name': 'Godrej Horizon Luxury Residencies',
    'image': upload_res['url'] if upload_res and 'url' in upload_res else 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'address': 'Wadala Skywalk Boulevard',
    'city': 'Mumbai',
    'state': 'Maharashtra',
    'type': 'Luxury Residential',
    'unitsCount': 30,
    'grossRent': 1800000,
    'amenities': ['Infinity Pool', 'EV Fast Charging', '24/7 Security Desk']
}
add_res = test_api('Register Property in Admin', '/api/admin/properties', method='POST', data=new_prop_payload)

# 6. Re-check public properties to ensure new property is live!
props_after = test_api('Public Properties After Add', '/api/public/properties')
if props_after and 'properties' in props_after:
    names = [p['name'] for p in props_after['properties']]
    print("\n--- Summary of Public Properties ---")
    for n in names:
        print(f" • {n}")
    is_present = 'Godrej Horizon Luxury Residencies' in names
    print(f"\nVerified: 'Godrej Horizon Luxury Residencies' is LIVE on public site: {is_present}")
