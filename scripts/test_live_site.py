import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request('https://propledger.vishalbhutekar.me', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode('utf-8')
        print('Status code:', resp.status)
        print('Live HTML size:', len(html))
        print('Contains id="resident-hub":', 'id="resident-hub"' in html)
        print('Contains navigateToResidentHub:', 'navigateToResidentHub' in html)
        print('Contains support@propledger.vishalbhutekar.me:', 'support@propledger.vishalbhutekar.me' in html)
        print('Contains concierge@propledger.com:', 'concierge@propledger.com' in html)
        print('Contains Oberoi Sky City:', 'Oberoi Sky City' in html)
        print('Contains Rupee symbol:', '₹' in html)
        print('Rupee count in live HTML:', html.count('₹'))
        print('Contains UPI:', 'UPI' in html)
        print('Contains simple English hero:', 'Simple, modern' in html)
except Exception as e:
    print('Fetch error:', e)
