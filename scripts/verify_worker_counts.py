with open('cloudflare/propledger-worker.js', 'r', encoding='utf-8') as f:
    text = f.read()

print('id="resident-hub" count:', text.count('id="resident-hub"'))
print('navigateToResidentHub count:', text.count('navigateToResidentHub'))
print('support@propledger.vishalbhutekar.me count:', text.count('support@propledger.vishalbhutekar.me'))
print('concierge@propledger.com count:', text.count('concierge@propledger.com'))
print('Rupee symbol count:', text.count('\u20b9'))
