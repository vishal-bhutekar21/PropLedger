# -*- coding: utf-8 -*-
"""
Assemble and inject the full PropLedger Executive Admin Dashboard into cloudflare/propledger-worker.js
"""
import json
import os

with open(r'd:\FreeLance\Yardi\scripts\admin_api_module.py', 'r', encoding='utf-8') as f:
    api_module_content = f.read()

# Extract admin_api_and_store_code
start_marker = "admin_api_and_store_code = r'''"
end_marker = "'''"
api_code = api_module_content[api_module_content.find(start_marker) + len(start_marker):api_module_content.rfind(end_marker)].strip()

print(f"Extracted API code: {len(api_code)} chars")
