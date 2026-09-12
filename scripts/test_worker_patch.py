# -*- coding: utf-8 -*-
"""
Generates the complete executive admin dashboard in cloudflare/propledger-worker.js
"""
import re

with open(r'd:\FreeLance\Yardi\cloudflare\propledger-worker.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the multi-level redirect that prevented direct access to admin.propledger.vishalbhutekar.me
old_redirect = """  // Multi-level subdomains (2 dots) cannot be covered by Cloudflare's free Universal SSL (*.vishalbhutekar.me).
  // Redirect any HTTP requests to their secure, working single-level counterparts!
  if (hostname === 'admin.propledger.vishalbhutekar.me') {
    return Response.redirect(`https://admin.vishalbhutekar.me${url.pathname}${url.search}`, 301);
  }
  if (hostname === 'home.propledger.vishalbhutekar.me') {
    return Response.redirect(`https://propledger.vishalbhutekar.me${url.pathname}${url.search}`, 301);
  }"""

new_redirect_replacement = """  // Both admin.propledger.vishalbhutekar.me and home.propledger.vishalbhutekar.me now have
  // dedicated, active Google Trust Services TLS certificates via Cloudflare Worker Custom Domains."""

if old_redirect in content:
    content = content.replace(old_redirect, new_redirect_replacement)
    print("Replaced old multi-level redirects.")
else:
    print("Note: old_redirect snippet not found exactly, continuing...")

# Let's inspect where handleRequest starts
print("Worker length:", len(content))
