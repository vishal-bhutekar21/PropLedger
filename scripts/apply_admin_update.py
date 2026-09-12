# -*- coding: utf-8 -*-
"""
Applies the full executive admin dashboard update to cloudflare/propledger-worker.js
"""

import sys
import os
import json

from create_admin_html import get_admin_html

with open(r'd:\FreeLance\Yardi\cloudflare\propledger-worker.js', 'r', encoding='utf-8') as f:
    worker_code = f.read()

# 1. Update multi-level redirects
old_redirect = """  // Multi-level subdomains (2 dots) cannot be covered by Cloudflare's free Universal SSL (*.vishalbhutekar.me).
  // Redirect any HTTP requests to their secure, working single-level counterparts!
  if (hostname === 'admin.propledger.vishalbhutekar.me') {
    return Response.redirect(`https://admin.vishalbhutekar.me${url.pathname}${url.search}`, 301);
  }
  if (hostname === 'home.propledger.vishalbhutekar.me') {
    return Response.redirect(`https://propledger.vishalbhutekar.me${url.pathname}${url.search}`, 301);
  }"""

new_redirect_comment = """  // Both admin.propledger.vishalbhutekar.me and home.propledger.vishalbhutekar.me now have
  // dedicated, active Google Trust Services TLS certificates via Cloudflare Worker Custom Domains."""

if old_redirect in worker_code:
    worker_code = worker_code.replace(old_redirect, new_redirect_comment)
    print("Updated redirects comment.")

# 2. Extract admin API code
with open(r'd:\FreeLance\Yardi\scripts\admin_api_module.py', 'r', encoding='utf-8') as f:
    api_module_code = f.read()

start_marker = "admin_api_and_store_code = r'''"
end_marker = "'''"
api_code = api_module_code[api_module_code.find(start_marker) + len(start_marker):api_module_code.rfind(end_marker)].strip()

# Check if api_code is already in worker_code
if "DEFAULT_ADMIN_STORE" not in worker_code:
    # Insert right above handleRequest
    hr_idx = worker_code.find("async function handleRequest(request) {")
    if hr_idx != -1:
        worker_code = worker_code[:hr_idx] + api_code + "\n\n" + worker_code[hr_idx:]
        print("Injected DEFAULT_ADMIN_STORE and handleAdminApi above handleRequest.")
    else:
        print("ERROR: handleRequest not found!")
        sys.exit(1)

# 3. Add API call in handleRequest
api_call_marker = "const adminApiResp = await handleAdminApi(url, request);"
if api_call_marker not in worker_code:
    target_spot = "const hostname = url.hostname.toLowerCase();"
    idx = worker_code.find(target_spot)
    if idx != -1:
        insert_code = """
  // 0. PropLedger Executive Admin REST API
  if (url.pathname.startsWith('/api/admin/')) {
    const adminApiResp = await handleAdminApi(url, request);
    if (adminApiResp) return adminApiResp;
  }
"""
        worker_code = worker_code[:idx + len(target_spot)] + insert_code + worker_code[idx + len(target_spot):]
        print("Injected admin REST API handler in handleRequest.")
    else:
        print("ERROR: target spot for API handler not found!")
        sys.exit(1)

# 4. Replace renderAdminPage(hostname) function
html_template = get_admin_html()

# Let's find where renderAdminPage starts
render_admin_start = worker_code.find("function renderAdminPage(hostname) {")
if render_admin_start == -1:
    print("ERROR: renderAdminPage not found!")
    sys.exit(1)

# Inside the HTML template, ensure ${hostname} remains and window.__INITIAL_ADMIN_DATA__ is injected at runtime
seed_script = "<script>window.__INITIAL_ADMIN_DATA__ = ${JSON.stringify(globalAdminStore)};</script>"

html_template_with_seed = html_template.replace("</head>", seed_script + "\n</head>")

# Find the main client-side <script> tag at the bottom
s_idx = html_template_with_seed.rfind("<script>")
if s_idx != -1:
    markup_part = html_template_with_seed[:s_idx + len("<script>")]
    js_part = html_template_with_seed[s_idx + len("<script>"):]
    
    # Escape backticks
    escaped_js = js_part.replace("\\`", "\x01").replace("`", "\\`").replace("\x01", "\\`")
    # Escape ${
    escaped_js = escaped_js.replace("\\${", "\x02").replace("${", "\\${").replace("\x02", "\\${")
    
    html_template_with_seed = markup_part + escaped_js
    print("Successfully escaped client-side JS backticks and template expressions.")
else:
    print("WARNING: Client-side script marker not found, check template!")

new_render_admin_func = f"""function renderAdminPage(hostname) {{
  return `{html_template_with_seed}`;
}}
"""

worker_code = worker_code[:render_admin_start] + new_render_admin_func

with open(r'd:\FreeLance\Yardi\cloudflare\propledger-worker.js', 'w', encoding='utf-8') as f:
    f.write(worker_code)

print("Updated cloudflare/propledger-worker.js successfully!")
print("New worker size:", len(worker_code))
