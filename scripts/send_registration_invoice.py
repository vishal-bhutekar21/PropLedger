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

# Ultra-Premium Minimalist Executive Invoice Email
html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger Statement & Provisioning</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; margin: 0 auto; background-color: #0f1523; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);">
    
    <!-- Top Header Brand Strip -->
    <tr>
      <td style="padding: 36px 40px 28px 40px; border-bottom: 1px solid #1e293b; background: linear-gradient(180deg, #131b2e 0%, #0f1523 100%);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 36px; height: 36px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 10px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 800; font-size: 18px; line-height: 36px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);">
                    P
                  </td>
                  <td style="padding-left: 12px;">
                    <div style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">
                      PropLedger <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 2px 6px; border-radius: 4px; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); margin-left: 4px; vertical-align: middle;">ENTERPRISE</span>
                    </div>
                    <div style="font-size: 11px; color: #64748b; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin-top: 2px;">
                      propledger.vishalbhutekar.me
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 6px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">
                Provisioned & Verified
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 40px 40px 32px 40px;">
        
        <!-- Welcome Heading -->
        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3;">
          Commercial Statement & Account Activation
        </h1>
        <p style="margin: 0 0 28px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
          Your master credentials and commercial property statement have been compiled by the PropLedger transaction coordinator. Review your access and itemized charges below.
        </p>

        <!-- Credentials Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090d16; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
          <tr>
            <td style="padding: 16px 20px; background-color: #111827; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.06em;">
                    Master Admin Credentials
                  </td>
                  <td style="text-align: right; font-size: 11px; color: #818cf8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
                    Super Admin Clearance
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 140px;">Primary Email:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #f1f5f9; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600;">vishal.bhutekar1@gmail.com</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Initial Password:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #f1f5f9; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600;">Vishal@1233</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Assigned Role:</td>
                  <td style="padding: 6px 0; font-size: 12px; color: #34d399; font-weight: 600;">ROLE_SUPER_ADMIN, ROLE_PROPERTY_MANAGER</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Portal Endpoint:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #818cf8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
                    <a href="https://propledger.vishalbhutekar.me/master-admin" style="color: #818cf8; text-decoration: none;">https://propledger.vishalbhutekar.me/master-admin</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Itemized Invoice Statement -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #090d16; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 28px;">
          <tr>
            <td style="padding: 16px 20px; background-color: #111827; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.06em;">
                    Statement &bull; INV-202609-00001
                  </td>
                  <td style="text-align: right; font-size: 11px; color: #94a3b8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
                    Due: Oct 01, 2026
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <!-- Metadata Header -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #1e293b;">
                <tr>
                  <td>
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Property Unit</div>
                    <div style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px;">The Grand Horizon Luxury Suites &bull; Unit 402</div>
                  </td>
                  <td style="text-align: right;">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Billing Period</div>
                    <div style="font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #cbd5e1; margin-top: 2px;">Sep 01 – Sep 30, 2026</div>
                  </td>
                </tr>
              </table>

              <!-- Line Items Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                <thead>
                  <tr style="border-bottom: 1px solid #1e293b;">
                    <th align="left" style="padding: 8px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Line Item Description</th>
                    <th align="right" style="padding: 8px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Amount (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 10px 0; color: #e2e8f0; border-bottom: 1px solid #131b2e;">Residential Space Lease Fee (Unit 402)</td>
                    <td align="right" style="padding: 10px 0; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600; border-bottom: 1px solid #131b2e;">$2,850.00</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #e2e8f0; border-bottom: 1px solid #131b2e;">Common Area Maintenance (CAM Allocation)</td>
                    <td align="right" style="padding: 10px 0; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600; border-bottom: 1px solid #131b2e;">$250.00</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #e2e8f0; border-bottom: 1px solid #131b2e;">Secured Parking Bay #14 (Subterranean)</td>
                    <td align="right" style="padding: 10px 0; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 600; border-bottom: 1px solid #131b2e;">$150.00</td>
                  </tr>
                  <!-- Total Due Row -->
                  <tr>
                    <td style="padding: 16px 0 0 0; color: #ffffff; font-weight: 700; font-size: 14px;">Total Balance Due</td>
                    <td align="right" style="padding: 16px 0 0 0; color: #34d399; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; font-size: 18px;">$3,250.00</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>

        <!-- Action Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 28px;">
          <tr>
            <td align="center">
              <a href="https://propledger.vishalbhutekar.me/invoices" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: -0.01em; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Review & Settle Invoice Online &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Support Info Strip -->
        <div style="padding: 14px 18px; border-radius: 8px; background-color: rgba(14, 165, 233, 0.08); border-left: 3px solid #0ea5e9;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                <strong style="color: #38bdf8;">Need Assistance?</strong> Submit queries directly to <code style="font-family: ui-monospace, monospace; color: #e0f2fe; background: rgba(14,165,233,0.15); padding: 2px 4px; border-radius: 4px;">support@propledger.vishalbhutekar.me</code> or use the portal support desk.
              </td>
            </tr>
          </table>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 40px; background-color: #090d16; border-top: 1px solid #1e293b; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569; font-weight: 500;">
          PropLedger Technologies Inc. &bull; Autonomous Property Management & Subledger Engine
        </p>
        <p style="margin: 0; font-size: 11px; color: #334155; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
          Cloudflare Edge Node Protected &bull; TLS 1.3 &bull; Attachment: Volume 01 Handbook
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
        "subject": "PropLedger — Master Administrator Account Provisioned & Statement INV-202609-00001",
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
            print("DELIVERY SUCCESSFUL:", data)
            return True, data
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        print(f"DELIVERY FAILED: HTTP {e.code} - {err}")
        return False, err

if __name__ == "__main__":
    send_email()
