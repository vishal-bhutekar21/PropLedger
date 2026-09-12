import re

with open('cloudflare/propledger-worker.js', 'r', encoding='utf-8') as f:
    code = f.read()

dollar_amounts = re.findall(r'\$[0-9,]+(?:\.[0-9]{2})?', code)
print('Unique dollar amounts count:', len(set(dollar_amounts)))
print('Sample dollar amounts:', sorted(list(set(dollar_amounts)))[:30])

us_words = ['Austin', 'San Francisco', 'New York', 'TX', 'CA', 'Dallas', 'Chase', 'Wells Fargo', 'IRS', 'ACH', 'SSN']
for w in us_words:
    matches = len(re.findall(r'\b' + re.escape(w) + r'\b', code))
    print(f'{w}: {matches} matches')

# Check Add Property / Add Unit modals
print("\n--- Modals ---")
for m in re.finditer(r'<form[^>]*id=["\']([^"\']+)["\']', code):
    print("Form ID:", m.group(1))

# Check where properties are rendered in home and admin
print("\n--- Property Renderers ---")
for m in re.finditer(r'function\s+(render[A-Za-z0-9_]*)', code):
    print("Function:", m.group(1))
