import os
import json
import base64
import urllib.request
import urllib.error

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

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RECIPIENT_EMAIL = "vishal.bhutekar1@gmail.com"

if not RESEND_API_KEY:
    raise ValueError("RESEND_API_KEY environment variable or .env file is required")

# Read sample PDF attachment
pdf_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "pdf", "01_Enterprise_System_Architecture.pdf")
pdf_b64 = ""
if os.path.exists(pdf_path):
    with open(pdf_path, "rb") as f:
        pdf_b64 = base64.b64encode(f.read()).decode("utf-8")

# Swish & BookMyShow Inspired Clean, Rounded-Corner Email Design
html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger Statement</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #0c1017; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  
  <!-- Outer Card Container with 28px Round Corners -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #141923; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
    
    <!-- Top Branding Header -->
    <tr>
      <td style="padding: 36px 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 44px; height: 44px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 16px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 800; font-size: 20px; line-height: 44px; box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);">
                    P
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      PropLedger
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                      Commercial Real Estate Operations
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">
                &bull; Active Statement
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Ticket-Style Receipt Card with 20px Corners -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0e14; border: 1px solid #1e293b; border-radius: 22px; overflow: hidden;">
          
          <!-- Statement Title Bar -->
          <tr>
            <td style="padding: 24px 28px 20px 28px;">
              <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                September 2026 Billing Statement
              </div>
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em;">
                INV-202609-00001
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                The Grand Horizon Luxury Suites &bull; Unit 402
              </div>
            </td>
          </tr>

          <!-- Perforated Dashed Divider (BookMyShow / Swish Receipt Style) -->
          <tr>
            <td style="padding: 0 28px;">
              <div style="border-top: 1px dashed #242d3d; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <!-- Master Admin Credentials Box -->
          <tr>
            <td style="padding: 22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #141a26; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">
                      Master Administrative Access
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 3px 0; color: #64748b; width: 120px;">Username:</td>
                        <td style="padding: 3px 0; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-weight: 600;">vishal.bhutekar1@gmail.com</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #64748b;">Password:</td>
                        <td style="padding: 3px 0; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-weight: 600;">Vishal@1233</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #64748b;">Role:</td>
                        <td style="padding: 3px 0; color: #34d399; font-weight: 600;">Super Administrator</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Line Items -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #cbd5e1;">Base Residential Rent (Unit 402)</td>
                  <td style="padding: 8px 0; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-weight: 600; text-align: right;">$2,850.00</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #cbd5e1;">Common Area Maintenance (CAM)</td>
                  <td style="padding: 8px 0; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-weight: 600; text-align: right;">$250.00</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #cbd5e1;">Underground Parking Bay #14</td>
                  <td style="padding: 8px 0; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-weight: 600; text-align: right;">$150.00</td>
                </tr>
              </table>

              <!-- Bottom Total Banner -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.25);">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.06em;">
                      Total Payable
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">
                      $3,250.00
                    </div>
                  </td>
                  <td style="text-align: right; padding: 16px 20px;">
                    <a href="https://propledger.vishalbhutekar.me/invoices" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
                      Pay Online &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Support Desk Quick Strip -->
    <tr>
      <td style="padding: 0 32px 28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(14, 165, 233, 0.08); border-radius: 18px; border: 1px solid rgba(14, 165, 233, 0.2);">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    <strong style="color: #38bdf8;">Questions about your lease?</strong> Email the concierge desk at <a href="mailto:support@propledger.vishalbhutekar.me" style="color: #38bdf8; text-decoration: none; font-weight: 600; font-family: 'JetBrains Mono', monospace;">support@propledger.vishalbhutekar.me</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Clean Minimal Footer -->
    <tr>
      <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 500;">
          PropLedger Technologies &bull; Automated Enterprise Operations
        </p>
        <p style="margin: 0; font-size: 11px; color: #475569; font-family: 'JetBrains Mono', monospace;">
          Cloudflare Edge Verified &bull; propledger.vishalbhutekar.me
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
"""

def send_email():
    payload = {
        "from": "PropLedger <notifications@vishalbhutekar.me>",
        "to": [RECIPIENT_EMAIL],
        "subject": "PropLedger Statement #INV-202609-00001 & Account Activation",
        "html": html_content
    }
    if pdf_b64:
        payload["attachments"] = [
            {
                "filename": "PropLedger_Architecture_Volume_01.pdf",
                "content": pdf_b64
            }
        ]

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "PropLedger/2.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode("utf-8")
            print("SWISH / BOOKMYSHOW STYLE EMAIL DELIVERED:", data)
            return True, data
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        print(f"DELIVERY FAILED: HTTP {e.code} - {err}")
        return False, err

if __name__ == "__main__":
    send_email()
