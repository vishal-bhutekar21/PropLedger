/**
 * PropLedger Enterprise - Cloudflare Worker & Edge Mail Routing
 * Host Subdomains:
 * - Public Main Portal: home.propledger.vishalbhutekar.me / propledger.vishalbhutekar.me
 * - Master Admin Console: admin.propledger.vishalbhutekar.me
 * - Inbound Support Desk: support@propledger.vishalbhutekar.me -> vishal.bhutekar1@gmail.com
 * Zone ID: 84d04451d623e1d6885d01c55a89ce3a
 */

const RESEND_API_KEY = typeof globalThis.RESEND_API_KEY !== 'undefined' ? globalThis.RESEND_API_KEY : '';
const FROM_EMAIL = "PropLedger <notifications@vishalbhutekar.me>";
const FALLBACK_FROM_EMAIL = "PropLedger <onboarding@resend.dev>";
const FORWARD_DESTINATION = "vishal.bhutekar1@gmail.com";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();

  // Multi-level subdomains (2 dots) cannot be covered by Cloudflare's free Universal SSL (*.vishalbhutekar.me).
  // Redirect any HTTP requests to their secure, working single-level counterparts!
  if (hostname === 'admin.propledger.vishalbhutekar.me') {
    return Response.redirect(`https://admin.vishalbhutekar.me${url.pathname}${url.search}`, 301);
  }
  if (hostname === 'home.propledger.vishalbhutekar.me') {
    return Response.redirect(`https://propledger.vishalbhutekar.me${url.pathname}${url.search}`, 301);
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  // 1. Zensar Prep Suite Proxy (https://zensar-prep-suite-vishal.netlify.app/)
  if (hostname.includes('zensar-prep')) {
    try {
      const netlifyUrl = new URL(request.url);
      netlifyUrl.hostname = 'zensar-prep-suite-vishal.netlify.app';
      netlifyUrl.protocol = 'https:';
      netlifyUrl.port = '';

      const netlifyResp = await fetch(netlifyUrl.toString(), {
        method: request.method,
        headers: {
          'Host': 'zensar-prep-suite-vishal.netlify.app',
          'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
          'Accept': request.headers.get('accept') || '*/*',
          'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9',
        }
      });

      const respHeaders = new Headers(netlifyResp.headers);
      respHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(netlifyResp.body, {
        status: netlifyResp.status,
        statusText: netlifyResp.statusText,
        headers: respHeaders
      });
    } catch (e) {
      return new Response('Netlify Proxy Error: ' + e.message, { status: 502 });
    }
  }

  // API: Health & Status
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({
      status: 'operational',
      app: 'PropLedger Enterprise',
      subdomain: hostname,
      supportEmail: 'support@propledger.vishalbhutekar.me',
      forwardDestination: FORWARD_DESTINATION,
      edgeLocation: request.cf?.colo || 'GLOBAL',
      tlsVersion: request.cf?.tlsVersion || 'TLSv1.3',
      emailProvider: 'Resend API + Cloudflare Email Routing',
      database: 'PostgreSQL 16 (Flyway V12 Migrations)',
      masterAdmin: 'vishal.bhutekar1@gmail.com',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // API: Support Query Forwarding
  if (url.pathname === '/api/support-query' && request.method === 'POST') {
    try {
      const data = await request.json();
      const senderName = data.senderName || 'Resident Inquirer';
      const senderEmail = data.senderEmail || 'resident@propledger.com';
      const subject = data.subject || 'General Property Inquiry';
      const message = data.message || 'No inquiry text provided.';
      const colo = request.cf?.colo || 'GLOBAL';

      const supportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PropLedger Support Ticket</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #080b11; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);">
    <tr>
      <td style="padding: 36px 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 46px; height: 46px; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border-radius: 18px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 900; font-size: 20px; line-height: 46px; box-shadow: 0 8px 20px -4px rgba(14, 165, 233, 0.45);">
                    S
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 19px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
                      PropLedger <span style="font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); margin-left: 4px; vertical-align: middle;">CONCIERGE</span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                      support@propledger.vishalbhutekar.me
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 7px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; background-color: rgba(14, 165, 233, 0.12); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.25);">
                &bull; Inbound Query
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0d14; border: 1px solid #1e2638; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 26px 30px 22px 30px;">
              <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Resident Inquiry Ticket
              </div>
              <div style="font-size: 21px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.3;">
                ${subject}
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">
                From: <strong style="color: #f1f5f9;">${senderName}</strong> &bull; <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">${senderEmail}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px;">
              <div style="border-top: 2px dashed #222c3f; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 30px;">
              <div style="background-color: #121824; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 20px 22px; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                  Message Content
                </div>
                <div style="font-size: 14px; color: #e2e8f0; line-height: 1.65; white-space: pre-wrap;">
${message}
                </div>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${senderEmail}?subject=Re: [PropLedger Support] ${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 9999px; font-weight: 800; font-size: 13px; box-shadow: 0 6px 16px rgba(2, 132, 199, 0.4);">
                  Reply to ${senderName} &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 22px 36px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
          Forwarded via Cloudflare Edge (${colo}) &bull; Destination: ${FORWARD_DESTINATION}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      let resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [FORWARD_DESTINATION],
          reply_to: senderEmail,
          subject: `[PropLedger Support] ${subject} (From: ${senderName})`,
          html: supportHtml
        })
      });

      let resData = await resendResp.json();

      if (!resendResp.ok) {
        resendResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FALLBACK_FROM_EMAIL,
            to: [FORWARD_DESTINATION],
            reply_to: senderEmail,
            subject: `[PropLedger Support] ${subject} (From: ${senderName})`,
            html: supportHtml
          })
        });
        resData = await resendResp.json();
      }

      return new Response(JSON.stringify({
        success: resendResp.ok,
        messageId: resData.id,
        forwardedTo: FORWARD_DESTINATION,
        targetEmail: 'support@propledger.vishalbhutekar.me',
        message: 'Your query has been forwarded to support administrator Vishal Bhutekar.'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // API: Send Invoice & Registration Email
  if ((url.pathname === '/api/send-invoice' || url.pathname === '/api/admin/dispatch-invoice-email') && request.method === 'POST') {
    try {
      const data = await request.json();
      const recipient = data.recipientEmail || 'vishal.bhutekar1@gmail.com';
      const invoiceNumber = data.invoiceNumber || 'INV-202609-00001';
      const amount = data.amount || '$3,250.00';
      const property = data.property || 'The Grand Horizon Luxury Suites - Unit 402';
      const tenant = data.tenant || 'Vishal Bhutekar';

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PropLedger Statement</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #080b11; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8);">
    <tr>
      <td style="padding: 36px 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 46px; height: 46px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 18px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 900; font-size: 21px; line-height: 46px; box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.45);">
                    P
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 19px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
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
              <span style="display: inline-block; padding: 7px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25);">
                &bull; Active Statement
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0d14; border: 1px solid #1e2638; border-radius: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 26px 30px 22px 30px;">
              <div style="font-size: 11px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                September 2026 Billing Statement
              </div>
              <div style="font-size: 23px; font-weight: 900; color: #ffffff; letter-spacing: -0.03em;">
                ${invoiceNumber}
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 5px;">
                ${property}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px;">
              <div style="border-top: 2px dashed #222c3f; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #121824; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 22px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;">
                      Resident & Account Summary
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; width: 110px;">Tenant:</td>
                        <td style="padding: 4px 0; color: #ffffff; font-weight: 700;">${tenant}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Due Date:</td>
                        <td style="padding: 4px 0; color: #f1f5f9; font-family: 'JetBrains Mono', monospace;">October 01, 2026</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Master Admin:</td>
                        <td style="padding: 4px 0; color: #818cf8; font-family: 'JetBrains Mono', monospace;">vishal.bhutekar1@gmail.com</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.14) 0%, rgba(99, 102, 241, 0.08) 100%); border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.3);">
                <tr>
                  <td style="padding: 18px 22px;">
                    <div style="font-size: 11px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.06em;">
                      Total Payable
                    </div>
                    <div style="font-size: 26px; font-weight: 900; color: #34d399; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">
                      ${amount}
                    </div>
                  </td>
                  <td style="text-align: right; padding: 18px 22px;">
                    <a href="https://propledger.vishalbhutekar.me/invoices" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 9999px; font-weight: 800; font-size: 13px; box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);">
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

    <tr>
      <td style="padding: 0 32px 28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(14, 165, 233, 0.08); border-radius: 20px; border: 1px solid rgba(14, 165, 233, 0.22);">
          <tr>
            <td style="padding: 16px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    <strong style="color: #38bdf8;">Need assistance?</strong> Submit inquiries directly to <a href="mailto:support@propledger.vishalbhutekar.me" style="color: #38bdf8; text-decoration: none; font-weight: 700; font-family: 'JetBrains Mono', monospace;">support@propledger.vishalbhutekar.me</a>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 24px 32px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 500;">
          PropLedger Technologies &bull; Automated Enterprise Operations
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

      let resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [recipient],
          subject: `PropLedger Statement: ${invoiceNumber} - ${property}`,
          html: emailHtml
        })
      });

      let resData = await resendResp.json();

      if (!resendResp.ok) {
        resendResp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FALLBACK_FROM_EMAIL,
            to: [recipient],
            subject: `PropLedger Statement: ${invoiceNumber} - ${property}`,
            html: emailHtml
          })
        });
        resData = await resendResp.json();
      }

      return new Response(JSON.stringify({
        success: resendResp.ok,
        messageId: resData.id,
        recipient,
        invoiceNumber,
        status: resendResp.ok ? 'DELIVERED' : 'ERROR',
        details: resData
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // Subdomain Routing Engine:
  // - admin.propledger.vishalbhutekar.me / admin.vishalbhutekar.me (or /admin) -> Master Admin Console
  // - home.propledger.vishalbhutekar.me / propledger.vishalbhutekar.me -> Public Website
  const isAdminHost = hostname.startsWith('admin.') || hostname.startsWith('admin-') || url.pathname.startsWith('/admin');

  if (isAdminHost) {
    return new Response(renderAdminPage(hostname), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }

  return new Response(renderHomePage(hostname), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

// 1. PUBLIC WEBSITE: propledger.vishalbhutekar.me
function renderHomePage(hostname) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger | Autonomous Property Operations & Rental Management</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .soft-card { background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.85); border-radius: 24px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .soft-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.02); }
    .soft-inner { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 16px; }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1.5px); }
    .active-tab { background-color: #4f46e5; color: #ffffff !important; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3); }
    .inactive-tab { background-color: #f1f5f9; color: #475569; }
    .inactive-tab:hover { background-color: #e2e8f0; color: #0f172a; }
  </style>
</head>
<body class="min-h-screen antialiased bg-white text-slate-900 pb-32">

  <!-- Floating Sticky Header (Soft UI) -->
  <div class="sticky top-4 z-50 px-4 max-w-6xl mx-auto">
    <header class="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full px-6 py-3.5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] flex items-center justify-between">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-indigo-500/20">
          P
        </div>
        <div>
          <span class="font-extrabold text-lg tracking-tight text-slate-900">PropLedger</span>
          <p class="text-[11px] text-slate-500 font-mono tracking-tight">${hostname}</p>
        </div>
      </a>

      <!-- Quick Nav Links -->
      <nav class="hidden md:flex items-center gap-1">
        <a href="#dual-experience" class="pill-btn text-xs font-semibold px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">Client Experience</a>
        <a href="#live-simulator" class="pill-btn text-xs font-semibold px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">Live Simulator</a>
        <a href="#unit-gallery" class="pill-btn text-xs font-semibold px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">Unit Showcase</a>
        <a href="#roi-calculator" class="pill-btn text-xs font-semibold px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">ROI Calculator</a>
        <a href="#resident-voucher" class="pill-btn text-xs font-semibold px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">Sample Bill</a>
        <a href="#faq" class="pill-btn text-xs font-semibold px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">FAQ</a>
      </nav>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button onclick="openPaymentModal()" class="pill-btn text-xs font-bold px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 hidden sm:flex items-center gap-1.5 transition">
          <span>💳 Pay Rent Online</span>
        </button>
        <a href="https://admin.vishalbhutekar.me" class="pill-btn text-xs font-bold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 flex items-center gap-1.5">
          <span>Master Admin</span>
          <span>&rarr;</span>
        </a>
      </div>
    </header>
  </div>

  <!-- Main Public Content -->
  <main class="max-w-6xl mx-auto px-6 pt-12 space-y-24">

    <!-- 1. Super Clear, Beginner-Friendly Hero Section -->
    <div class="text-center max-w-3xl mx-auto space-y-6 pt-4">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Simple, Stress-Free Rental Management Platform
      </div>

      <h1 class="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
        Never Chase Rent Again.
        <span class="block text-indigo-600 font-extrabold text-3xl sm:text-5xl mt-2">Manage Properties & Leases on Autopilot.</span>
      </h1>

      <p class="text-slate-600 text-base sm:text-lg leading-relaxed font-normal max-w-2xl mx-auto">
        PropLedger is the all-in-one software for landlords and property managers to track apartments, prevent accidental double-bookings, and collect rent payments online without confusing spreadsheets or paper receipts.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a href="#dual-experience" class="pill-btn px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/25 flex items-center gap-2">
          <span>Explore Interactive App &darr;</span>
        </a>
        <button onclick="openPaymentModal()" class="pill-btn px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm shadow-sm flex items-center gap-2">
          <span>Test Tenant Online Payment &rarr;</span>
        </button>
      </div>

      <!-- Trust Badges -->
      <div class="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto border-t border-slate-100">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">&check;</span>
          <span class="text-xs text-slate-600 font-medium">Zero Double-Bookings</span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">&check;</span>
          <span class="text-xs text-slate-600 font-medium">Auto-Emailed Bills</span>
        </div>
        <div class="col-span-2 sm:col-span-1 flex items-center gap-2.5 justify-center sm:justify-start">
          <span class="w-7 h-7 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs">&check;</span>
          <span class="text-xs text-slate-600 font-medium">1-Click Online Payments</span>
        </div>
      </div>
    </div>

    <!-- Architectural Stock Image Showcase with Soft UI Overlays -->
    <div class="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] bg-slate-100">
      <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80" alt="Modern Luxury Apartment Architecture" class="w-full h-72 sm:h-96 md:h-[420px] object-cover">
      
      <!-- Floating Soft Cards -->
      <div class="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-lg flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <div>
          <p class="text-xs font-bold text-slate-900">The Grand Horizon &bull; 402 Units</p>
          <p class="text-[11px] text-slate-500">100% On-Time Rent Collection Rate</p>
        </div>
      </div>

      <div class="hidden sm:flex absolute top-6 right-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 py-3.5 shadow-lg items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
          $
        </div>
        <div>
          <p class="text-xs font-bold text-slate-900">Automatic Rent Bills</p>
          <p class="text-[11px] text-slate-500">Sent on the 1st of every month</p>
        </div>
      </div>
    </div>

    <!-- 2. "WHAT DOES PROPLEDGER DO?" (The 4 Core Things Every Beginner Understands) -->
    <div id="what-it-does" class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What Does PropLedger Do For You?</h2>
        <p class="text-xs sm:text-sm text-slate-500">If you manage rental homes, flats, or commercial spaces, here is how PropLedger helps you every day:</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div class="soft-card p-6 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl">
            🏢
          </div>
          <h3 class="text-base font-bold text-slate-900">1. Organize Your Units</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            See all your properties, apartments, and parking spots in one clean list. Know instantly which units are rented and which are empty.
          </p>
        </div>

        <div class="soft-card p-6 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl">
            📅
          </div>
          <h3 class="text-base font-bold text-slate-900">2. Prevent Double-Booking</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Sign digital rental agreements with start and end dates. Our smart guard makes it impossible to accidentally rent the same flat twice.
          </p>
        </div>

        <div class="soft-card p-6 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xl">
            ✉️
          </div>
          <h3 class="text-base font-bold text-slate-900">3. Email Rent Invoices</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            On the 1st of every month, your tenants automatically receive a clear bill with an easy online payment button right in their email.
          </p>
        </div>

        <div class="soft-card p-6 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-xl">
            💰
          </div>
          <h3 class="text-base font-bold text-slate-900">4. Track Every Dollar</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            See exactly who has paid, who is overdue, and your total monthly profit. No accounting degree or complex spreadsheets required.
          </p>
        </div>

      </div>
    </div>

    <!-- 3. INTERACTIVE DUAL EXPERIENCE SWITCHER (LANDLORD VS TENANT) -->
    <div id="dual-experience" class="soft-card p-8 sm:p-12 space-y-8 bg-gradient-to-b from-white to-slate-50/60">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
          ⚡ Interactive App Tour
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Experience Both Sides of PropLedger</h2>
        <p class="text-xs sm:text-sm text-slate-500">Toggle between the Landlord Management Console and the Resident Portal below to see how easy both sides are.</p>
        
        <!-- Toggle Buttons -->
        <div class="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200 gap-2 mt-4">
          <button onclick="switchExperience('landlord')" id="tabBtnLandlord" class="pill-btn px-6 py-2.5 text-xs font-bold active-tab">
            🏢 Landlord Experience
          </button>
          <button onclick="switchExperience('tenant')" id="tabBtnTenant" class="pill-btn px-6 py-2.5 text-xs font-bold inactive-tab">
            🏡 Resident & Tenant Portal
          </button>
        </div>
      </div>

      <!-- VIEW A: LANDLORD CONSOLE PREVIEW -->
      <div id="viewLandlord" class="space-y-6">
        <!-- Landlord Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="soft-inner p-5 bg-white border border-slate-200">
            <span class="text-xs text-slate-500 font-medium block">Total Monthly Rent Collected</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-slate-900 font-mono">$128,450.00</span>
              <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">+8.4%</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Settled via Automated ACH</p>
          </div>

          <div class="soft-inner p-5 bg-white border border-slate-200">
            <span class="text-xs text-slate-500 font-medium block">Occupancy Rate</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-slate-900 font-mono">99.2%</span>
              <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">402 / 405 Units</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Only 3 units available</p>
          </div>

          <div class="soft-inner p-5 bg-white border border-slate-200">
            <span class="text-xs text-slate-500 font-medium block">Double-Booking Collision Rate</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-indigo-600 font-mono">0.00%</span>
              <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-mono">Protected</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Calendar locking active</p>
          </div>
        </div>

        <!-- Landlord Live Units List -->
        <div class="soft-inner p-6 bg-white border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-bold text-sm text-slate-900">Current Unit Roster & Lease Tracking</h4>
              <p class="text-xs text-slate-500">Real-time status of all apartments under management</p>
            </div>
            <button onclick="dispatchBatchBills()" id="batchDispatchBtn" class="pill-btn px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5">
              <span>⚡ Batch Send Monthly Invoices</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th class="py-2.5">Unit</th>
                  <th class="py-2.5">Type</th>
                  <th class="py-2.5">Tenant</th>
                  <th class="py-2.5">Rent / Month</th>
                  <th class="py-2.5">Lease Status</th>
                  <th class="py-2.5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 101</td>
                  <td class="py-3 text-slate-600">1-Bed Studio</td>
                  <td class="py-3 text-slate-800 font-medium">Sarah Connor</td>
                  <td class="py-3 font-mono font-bold text-slate-900">$1,650.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold font-mono">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 204</td>
                  <td class="py-3 text-slate-600">2-Bed Suite</td>
                  <td class="py-3 text-slate-800 font-medium">Alex Mercer</td>
                  <td class="py-3 font-mono font-bold text-slate-900">$2,400.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold font-mono">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 402</td>
                  <td class="py-3 text-slate-600">Horizon Penthouse</td>
                  <td class="py-3 text-slate-800 font-medium">Vishal Bhutekar</td>
                  <td class="py-3 font-mono font-bold text-slate-900">$2,850.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold font-mono">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 501</td>
                  <td class="py-3 text-slate-600">Panoramic Loft</td>
                  <td class="py-3 text-slate-400 italic">None (Vacant)</td>
                  <td class="py-3 font-mono font-bold text-slate-900">$3,100.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">Available</span></td>
                  <td class="py-3 text-right"><a href="#concierge" class="text-indigo-600 hover:underline font-bold">+ Sign Lease</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div id="batchDispatchNotice" class="hidden p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-mono"></div>
        </div>
      </div>

      <!-- VIEW B: TENANT CONSOLE PREVIEW -->
      <div id="viewTenant" class="hidden space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Tenant Home Summary -->
          <div class="soft-inner p-6 bg-white border border-slate-200 space-y-4">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80" alt="Apartment" class="w-12 h-12 rounded-2xl object-cover">
              <div>
                <h4 class="font-bold text-sm text-slate-900">The Grand Horizon</h4>
                <p class="text-xs text-slate-500">Unit 402 &bull; Resident Portal</p>
              </div>
            </div>
            
            <div class="space-y-2 pt-2 text-xs border-t border-slate-100">
              <div class="flex justify-between text-slate-600">
                <span>Lease Period:</span>
                <span class="font-medium text-slate-900">Sep 2026 – Aug 2027</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Next Rent Due:</span>
                <span class="font-bold text-indigo-600 font-mono">October 01, 2026</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Parking Space:</span>
                <span class="font-medium text-slate-900">Subterranean Bay #14</span>
              </div>
            </div>

            <button onclick="openPaymentModal()" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition">
              <span>💳 Pay October Rent ($3,250.00)</span>
            </button>
          </div>

          <!-- Current Itemized Bill -->
          <div class="md:col-span-2 soft-inner p-6 bg-white border border-slate-200 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Transparent Resident Statement</span>
                <h4 class="font-bold text-base text-slate-900">Statement #STM-202609-0402</h4>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs font-mono">
                &bull; Reconciled & Clear
              </span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Residential Apartment Base Rent</span>
                  <span class="text-slate-500 text-[11px]">Monthly contractual rent for Penthouse Unit 402</span>
                </div>
                <span class="font-mono font-bold text-slate-900 self-center">$2,850.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Reserved Underground Parking Bay #14</span>
                  <span class="text-slate-500 text-[11px]">Dedicated secure stall with remote fob access</span>
                </div>
                <span class="font-mono font-bold text-slate-900 self-center">$250.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Building Services & Common Maintenance</span>
                  <span class="text-slate-500 text-[11px]">Elevator upkeep, concierge desk, security</span>
                </div>
                <span class="font-mono font-bold text-slate-900 self-center">$150.00</span>
              </div>
            </div>

            <div class="pt-3 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-500 block">Total Statement Balance</span>
                <span class="text-2xl font-black text-emerald-600 font-mono">$3,250.00</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="openMaintenanceModal()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition">
                  🛠️ Report Repair
                </button>
                <button onclick="downloadStatementPdf()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition">
                  📄 Download PDF
                </button>
                <button onclick="openPaymentModal()" class="pill-btn px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition">
                  Pay Now &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 4. HOW IT WORKS IN 3 EASY STEPS -->
    <div id="how-it-works" class="space-y-8 pt-4">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How It Works in 3 Easy Steps</h2>
        <p class="text-xs sm:text-sm text-slate-500">Getting started takes less than 2 minutes. No training or technical experience required.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="soft-card p-8 space-y-4 relative">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100">
            1
          </div>
          <h3 class="text-lg font-bold text-slate-900">Add Your Building & Flats</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Enter your property name (e.g., "The Grand Horizon") and list your unit numbers with their monthly rent price. That's it!
          </p>
        </div>

        <div class="soft-card p-8 space-y-4 relative">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-100">
            2
          </div>
          <h3 class="text-lg font-bold text-slate-900">Add Tenant & Dates</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Type the tenant's name and lease duration. The system locks those dates so nobody else can book the same apartment.
          </p>
        </div>

        <div class="soft-card p-8 space-y-4 relative">
          <div class="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-lg border border-violet-100">
            3
          </div>
          <h3 class="text-lg font-bold text-slate-900">Collect Rent On Autopilot</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Sit back! Every month, rent bills are emailed automatically, tenants pay online, and your income dashboard updates in real time.
          </p>
        </div>
      </div>
    </div>

    <!-- 5. INTERACTIVE LIVE SIMULATOR ("TRY IT RIGHT NOW") -->
    <div id="live-simulator" class="soft-card p-8 sm:p-12 space-y-8 bg-gradient-to-b from-white to-slate-50/50">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
          ⚡ Interactive Live Simulator
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Try PropLedger Right Now</h2>
        <p class="text-xs sm:text-sm text-slate-500">Pick an apartment below to see how rent is automatically calculated, itemized, and dispatched.</p>
      </div>

      <!-- Simulator Controls -->
      <div class="max-w-3xl mx-auto space-y-6">
        
        <!-- Unit Selector Pills -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 1: Choose a Sample Unit</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onclick="selectSimUnit('Unit 101', 1650, 'Sarah Connor')" id="simBtn-101" class="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white text-left transition shadow-sm">
              <div class="font-bold text-sm text-slate-900">Unit 101 (1 Bed)</div>
              <div class="text-xs text-slate-500">Resident: Sarah Connor</div>
              <div class="text-base font-extrabold text-indigo-600 font-mono mt-1">$1,650/mo</div>
            </button>
            <button onclick="selectSimUnit('Unit 204', 2400, 'Alex Mercer')" id="simBtn-204" class="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white text-left transition shadow-sm">
              <div class="font-bold text-sm text-slate-900">Unit 204 (2 Bed)</div>
              <div class="text-xs text-slate-500">Resident: Alex Mercer</div>
              <div class="text-base font-extrabold text-indigo-600 font-mono mt-1">$2,400/mo</div>
            </button>
            <button onclick="selectSimUnit('Unit 402', 2850, 'Vishal Bhutekar')" id="simBtn-402" class="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 text-left transition shadow-sm">
              <div class="font-bold text-sm text-slate-900">Unit 402 (Penthouse)</div>
              <div class="text-xs text-slate-500">Resident: Vishal Bhutekar</div>
              <div class="text-base font-extrabold text-indigo-600 font-mono mt-1">$2,850/mo</div>
            </button>
          </div>
        </div>

        <!-- Add-on Toggles -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 2: Add-on Amenities (Optional)</label>
          <div class="flex flex-wrap justify-center gap-4 text-xs font-medium">
            <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition">
              <input type="checkbox" id="simParking" checked onchange="updateSimTotal()" class="w-4 h-4 text-indigo-600 rounded">
              <span>Dedicated Underground Parking (+$250)</span>
            </label>
            <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition">
              <input type="checkbox" id="simCAM" checked onchange="updateSimTotal()" class="w-4 h-4 text-indigo-600 rounded">
              <span>Building Services & Maintenance (+$150)</span>
            </label>
            <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition">
              <input type="checkbox" id="simFiber" onchange="updateSimTotal()" class="w-4 h-4 text-indigo-600 rounded">
              <span>Gigabit Fiber Internet (+$80)</span>
            </label>
          </div>
        </div>

        <!-- Live Generated Bill Preview -->
        <div class="soft-inner p-6 sm:p-8 space-y-4 border border-indigo-100 bg-white shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span class="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Simulated Auto-Statement</span>
              <h4 id="simPreviewTitle" class="text-base font-bold text-slate-900">The Grand Horizon &bull; Unit 402</h4>
            </div>
            <div id="simResidentBadge" class="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Tenant: Vishal Bhutekar
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-slate-700">
              <span id="simRentLabel">Monthly Apartment Rent</span>
              <span id="simRentVal" class="font-mono font-bold text-slate-900">$2,850.00</span>
            </div>
            <div id="simParkingRow" class="flex justify-between text-slate-700">
              <span>Assigned Parking Bay #14</span>
              <span class="font-mono font-bold text-slate-900">$250.00</span>
            </div>
            <div id="simCAMRow" class="flex justify-between text-slate-700">
              <span>Building Maintenance & Security</span>
              <span class="font-mono font-bold text-slate-900">$150.00</span>
            </div>
            <div id="simFiberRow" class="hidden justify-between text-slate-700">
              <span>Dedicated High-Speed Fiber</span>
              <span class="font-mono font-bold text-slate-900">$80.00</span>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs text-slate-500 block">Total Due from Tenant:</span>
              <span id="simTotalDisplay" class="text-3xl font-black text-emerald-600 font-mono">$3,250.00</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button onclick="openPaymentModal()" class="pill-btn px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm">
                Test Payment Modal
              </button>
              <button onclick="runSimDispatch()" id="simDispatchBtn" class="pill-btn px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                <span>Click to Send Simulated Rent Email &rarr;</span>
              </button>
            </div>
          </div>

          <div id="simAlert" class="hidden p-3.5 rounded-xl border text-xs font-mono"></div>
        </div>

      </div>
    </div>

    <!-- 6. INTERACTIVE AVAILABLE UNITS SHOWCASE (UNIT GALLERY) -->
    <div id="unit-gallery" class="space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            🏢 The Grand Horizon Residences
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explore Featured Apartment Suites</h2>
          <p class="text-xs sm:text-sm text-slate-500">Live inventory of premium luxury living spaces with real-time lease status.</p>
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-center gap-2 p-1.5 bg-slate-100 rounded-full border border-slate-200 self-start md:self-auto">
          <button onclick="filterUnits('all')" id="filterBtn-all" class="pill-btn px-4 py-1.5 text-xs font-bold active-tab">All Units</button>
          <button onclick="filterUnits('available')" id="filterBtn-available" class="pill-btn px-4 py-1.5 text-xs font-bold inactive-tab">Available Now</button>
          <button onclick="filterUnits('leased')" id="filterBtn-leased" class="pill-btn px-4 py-1.5 text-xs font-bold inactive-tab">Leased</button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Unit Card 1 -->
        <div class="soft-card overflow-hidden group unit-card" data-status="leased">
          <div class="relative h-48 overflow-hidden bg-slate-100">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80" alt="Executive Studio" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
              Leased
            </span>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase">Unit 101 &bull; 1st Floor</span>
              <h3 class="text-base font-bold text-slate-900">Executive Urban Studio</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5">540 sq ft &bull; 1 Bed &bull; 1 Bath</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
                <span class="text-lg font-black text-indigo-600 font-mono">$1,650</span>
              </div>
              <button onclick="openTourModal('Unit 101 &bull; Executive Urban Studio', '$1,650 / mo', '540 sq ft &bull; 1 Bed &bull; 1 Bath', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                Schedule Tour &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Unit Card 2 -->
        <div class="soft-card overflow-hidden group unit-card" data-status="leased">
          <div class="relative h-48 overflow-hidden bg-slate-100">
            <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" alt="Modern 2-Bedroom" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
              Leased
            </span>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase">Unit 204 &bull; 2nd Floor</span>
              <h3 class="text-base font-bold text-slate-900">Modern 2-Bedroom Suite</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5">1,150 sq ft &bull; 2 Bed &bull; 2 Bath</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
                <span class="text-lg font-black text-indigo-600 font-mono">$2,400</span>
              </div>
              <button onclick="openTourModal('Unit 204 &bull; Modern 2-Bedroom Suite', '$2,400 / mo', '1,150 sq ft &bull; 2 Bed &bull; 2 Bath', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
                Schedule Tour &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Unit Card 3 -->
        <div class="soft-card overflow-hidden group unit-card" data-status="leased">
          <div class="relative h-48 overflow-hidden bg-slate-100">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" alt="Horizon Penthouse" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
              Penthouse
            </span>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase">Unit 402 &bull; 4th Floor</span>
              <h3 class="text-base font-bold text-slate-900">Horizon Luxury Penthouse</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5">2,400 sq ft &bull; 3 Bed &bull; 3 Bath</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
                <span class="text-lg font-black text-indigo-600 font-mono">$2,850</span>
              </div>
              <button onclick="openTourModal('Unit 402 &bull; Horizon Luxury Penthouse', '$2,850 / mo', '2,400 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition">
                Schedule Tour &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Unit Card 4 -->
        <div class="soft-card overflow-hidden group unit-card" data-status="available">
          <div class="relative h-48 overflow-hidden bg-slate-100">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" alt="Skyline Loft" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide animate-pulse">
              Available Now
            </span>
          </div>
          <div class="p-5 space-y-3">
            <div>
              <span class="text-[11px] font-bold text-slate-500 uppercase">Unit 503 &bull; 5th Floor</span>
              <h3 class="text-base font-bold text-slate-900">Panoramic Skyline Loft</h3>
              <p class="text-xs text-slate-500 font-mono mt-0.5">1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath</p>
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
                <span class="text-lg font-black text-indigo-600 font-mono">$3,100</span>
              </div>
              <button onclick="openTourModal('Unit 503 &bull; Panoramic Skyline Loft', '$3,100 / mo', '1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition">
                Apply / Tour &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 7. INTERACTIVE ROI & REVENUE CALCULATOR FOR LANDLORDS -->
    <div id="roi-calculator" class="soft-card p-8 sm:p-12 space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          💰 Landlord Profit & Efficiency Calculator
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Calculate Your Time & Money Saved</h2>
        <p class="text-xs sm:text-sm text-slate-500">See how much paperwork and manual bookkeeping PropLedger eliminates for your rental portfolio.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        <!-- Sliders -->
        <div class="space-y-6">
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-800">
              <span>Total Units You Manage:</span>
              <span id="sliderUnitsVal" class="text-indigo-600 font-mono text-sm font-black">12 Units</span>
            </div>
            <input type="range" id="sliderUnits" min="1" max="100" value="12" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>1 Unit</span>
              <span>50 Units</span>
              <span>100+ Units</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-800">
              <span>Average Rent per Unit:</span>
              <span id="sliderRentVal" class="text-indigo-600 font-mono text-sm font-black">$2,200 / mo</span>
            </div>
            <input type="range" id="sliderRent" min="800" max="5000" step="50" value="2200" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>$800</span>
              <span>$2,500</span>
              <span>$5,000</span>
            </div>
          </div>
        </div>

        <!-- Real-Time Metrics Output -->
        <div class="soft-inner p-6 sm:p-8 bg-slate-900 text-white space-y-4 rounded-3xl shadow-lg">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Estimated Automated Impact</span>
          
          <div class="space-y-3">
            <div>
              <span class="text-xs text-slate-400 block">Monthly Rental Revenue Managed:</span>
              <p id="outRevenue" class="text-2xl sm:text-3xl font-black text-white font-mono">$26,400 / mo</p>
            </div>
            <div class="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-slate-400 block">Hours Saved / Month:</span>
                <p id="outHours" class="text-xl font-bold text-emerald-400 font-mono">36 Hours</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 block">Annual Savings:</span>
                <p id="outSavings" class="text-xl font-bold text-indigo-400 font-mono">$5,400 / yr</p>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-slate-400 leading-relaxed pt-2">
            Eliminates paper receipt writing, phone rent reminders, bank reconciliation, and spreadsheet formula repairs.
          </p>
        </div>
      </div>
    </div>

    <!-- 8. "BEFORE VS AFTER" (Old Way vs PropLedger Way) -->
    <div class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Why Switch to PropLedger?</h2>
        <p class="text-xs sm:text-sm text-slate-500">Stop juggling paper diaries, phone reminders, and spreadsheet formulas.</p>
      </div>

      <div class="soft-card overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          <!-- Old Way -->
          <div class="p-8 sm:p-10 space-y-6 bg-slate-50/40">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">&times;</span>
              <h3 class="text-lg font-bold text-slate-800">The Old Way (Notebooks & Excel)</h3>
            </div>
            <ul class="space-y-4 text-xs text-slate-600">
              <li class="flex items-start gap-2.5">
                <span class="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>Double-booking risks:</strong> Accidentally agreeing to rent an apartment to two different tenants.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>Awkward payment chasing:</strong> Having to send repetitive WhatsApp messages or phone calls on rent day.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>Lost paper receipts:</strong> Writing receipts by hand with zero permanent digital history.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-red-500 font-bold mt-0.5">&times;</span>
                <span><strong>Messy spreadsheets:</strong> Broken formulas and forgotten updates leading to financial confusion.</span>
              </li>
            </ul>
          </div>

          <!-- The PropLedger Way -->
          <div class="p-8 sm:p-10 space-y-6 bg-white">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">&check;</span>
              <h3 class="text-lg font-bold text-slate-900">The PropLedger Way</h3>
            </div>
            <ul class="space-y-4 text-xs text-slate-600">
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold mt-0.5">&check;</span>
                <span><strong>100% Locked Dates:</strong> The system automatically blocks conflicting leases so double-booking is impossible.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold mt-0.5">&check;</span>
                <span><strong>Automated Invoices:</strong> Polite, clear email bills dispatched on the 1st of every month automatically.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold mt-0.5">&check;</span>
                <span><strong>Permanent Digital Records:</strong> Every transaction, bill, and payment is saved in your digital ledger.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="text-emerald-500 font-bold mt-0.5">&check;</span>
                <span><strong>Instant Profit Insights:</strong> Total income, paid rent, and pending balances update live with zero effort.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- 9. CLEAN RESIDENT FINANCIAL STATEMENT (Sample Bill) -->
    <div id="resident-voucher" class="soft-card p-8 sm:p-12 relative overflow-hidden">
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What a Tenant Bill Looks Like</h2>
          <p class="text-xs text-slate-500">Clean, clear, and itemized. Tenants know exactly what they are paying for, with zero hidden surprises.</p>
        </div>

        <div class="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
          <!-- Header with Thumbnail Photo -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div class="flex items-center gap-3.5">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80" alt="The Grand Horizon" class="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm">
              <div>
                <h3 class="font-bold text-base text-slate-900">The Grand Horizon Luxury Suites</h3>
                <p class="text-xs text-slate-500 font-mono">Unit 402 &bull; Resident: Vishal Bhutekar</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full self-start sm:self-auto font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Paid & Reconciled</span>
            </div>
          </div>

          <!-- Metadata Ribbon -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 text-xs">
            <div>
              <span class="text-slate-500 block font-medium">Billing Period</span>
              <span class="text-slate-900 font-mono font-semibold">Sep 01 – Sep 30, 2026</span>
            </div>
            <div>
              <span class="text-slate-500 block font-medium">Statement ID</span>
              <span class="text-indigo-600 font-mono font-bold">STM-202609-0402</span>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <span class="text-slate-500 block font-medium">Payment Method</span>
              <span class="text-emerald-700 font-mono font-semibold">Automated Bank ACH</span>
            </div>
          </div>

          <!-- Itemized Breakdown -->
          <div class="space-y-3 text-xs bg-white p-5 rounded-2xl border border-slate-200/80">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
              Itemized Charges
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <div>
                <span class="text-slate-800 font-medium block">Monthly Rent (Unit 402)</span>
                <span class="text-[10px] text-slate-500">Base Contractual Apartment Fee</span>
              </div>
              <span class="text-slate-900 font-mono font-bold self-center">$2,850.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <div>
                <span class="text-slate-800 font-medium block">Assigned Parking Bay #14</span>
                <span class="text-[10px] text-slate-500">Dedicated Underground Vehicle Space</span>
              </div>
              <span class="text-slate-900 font-mono font-bold self-center">$250.00</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100">
              <div>
                <span class="text-slate-800 font-medium block">Building Services & Maintenance (CAM)</span>
                <span class="text-[10px] text-slate-500">Security, Elevator & Common Space Upkeep</span>
              </div>
              <span class="text-slate-900 font-mono font-bold self-center">$150.00</span>
            </div>
          </div>

          <!-- Total Balance Summary -->
          <div class="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Statement Balance</span>
              <p class="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight mt-0.5">$3,250.00</p>
            </div>
            <div class="flex gap-2">
              <button onclick="openPaymentModal()" class="pill-btn px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs shadow-md text-center">
                💳 Test Online Payment &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 10. CLIENT TESTIMONIALS & TRUST -->
    <div class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Trusted by Property Owners & Residents</h2>
        <p class="text-xs sm:text-sm text-slate-500">What landlords and tenants say about their experience with PropLedger.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="soft-card p-6 space-y-4">
          <div class="text-amber-400 text-sm">★★★★★</div>
          <p class="text-xs text-slate-600 leading-relaxed italic">
            "PropLedger completely removed the anxiety of rent week. Every tenant gets their bill on the 1st automatically, and we have had zero double-booking issues across our 120 units."
          </p>
          <div class="pt-2 border-t border-slate-100">
            <p class="text-xs font-bold text-slate-900">Marcus Vance</p>
            <p class="text-[11px] text-slate-500">Managing Partner, Vanguard Living</p>
          </div>
        </div>

        <div class="soft-card p-6 space-y-4">
          <div class="text-amber-400 text-sm">★★★★★</div>
          <p class="text-xs text-slate-600 leading-relaxed italic">
            "As a tenant, receiving a clear breakdown of rent, parking, and building services with a one-click payment button makes paying rent completely hassle-free."
          </p>
          <div class="pt-2 border-t border-slate-100">
            <p class="text-xs font-bold text-slate-900">Elena Rostova</p>
            <p class="text-[11px] text-slate-500">Resident at The Grand Horizon</p>
          </div>
        </div>

        <div class="soft-card p-6 space-y-4">
          <div class="text-amber-400 text-sm">★★★★★</div>
          <p class="text-xs text-slate-600 leading-relaxed italic">
            "The automated subledger saved our accounting team over 15 hours at the end of every month. Everything reconciles down to the exact penny."
          </p>
          <div class="pt-2 border-t border-slate-100">
            <p class="text-xs font-bold text-slate-900">David Chen</p>
            <p class="text-[11px] text-slate-500">CPA & Portfolio Asset Controller</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 11. FREQUENTLY ASKED QUESTIONS (FAQ FOR NEW USERS) -->
    <div id="faq" class="space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        <p class="text-xs sm:text-sm text-slate-500">Everything you need to know about getting started with PropLedger.</p>
      </div>

      <div class="max-w-3xl mx-auto space-y-4">
        
        <div class="soft-card p-6 space-y-2">
          <h3 class="font-bold text-sm text-slate-900">Do I need any technical or accounting skills?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            No! PropLedger was built specifically for ordinary landlords and property owners. If you can use an email app or send a text message, you can manage your properties in PropLedger without any issues.
          </p>
        </div>

        <div class="soft-card p-6 space-y-2">
          <h3 class="font-bold text-sm text-slate-900">How does the system stop double-booking?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            PropLedger uses an automated calendar lock. Once a lease is signed for an apartment from September 1 to August 31, the system physically prevents anyone from creating another lease on that unit during those dates.
          </p>
        </div>

        <div class="soft-card p-6 space-y-2">
          <h3 class="font-bold text-sm text-slate-900">How do tenants receive and pay their bills?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            On the 1st of every month, your tenants receive an automated, polite email bill. Inside the email is a clear list of what they owe (rent, parking, utilities) and a secure button to pay online with their bank account or card.
          </p>
        </div>

        <div class="soft-card p-6 space-y-2">
          <h3 class="font-bold text-sm text-slate-900">I only own one or two apartments. Can I still use PropLedger?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Yes! PropLedger works great whether you have 1 single apartment or manage 500 units across multiple luxury complexes.
          </p>
        </div>

        <div class="soft-card p-6 space-y-2">
          <h3 class="font-bold text-sm text-slate-900">Where can I see the Master Admin console?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            You can access the Master Admin operations portal directly at <a href="https://admin.vishalbhutekar.me" class="text-indigo-600 font-bold hover:underline">admin.vishalbhutekar.me</a> to view the full management dashboard, add properties, view tenant profiles, and trigger rent dispatches.
          </p>
        </div>

      </div>
    </div>

    <!-- 12. RESIDENT SUPPORT & CONCIERGE DESK (Soft UI) -->
    <div id="concierge" class="soft-card p-8 sm:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Contact Resident Support & Concierge</h2>
            <p class="text-xs text-slate-500">Need help or have questions? Email us directly at <span class="text-indigo-600 font-mono font-medium">support@propledger.vishalbhutekar.me</span></p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Name</label>
          <input id="pubName" type="text" placeholder="John Doe" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Email</label>
          <input id="pubEmail" type="email" placeholder="john@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Subject</label>
        <input id="pubSubject" type="text" value="Question about rental management" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Message</label>
        <textarea id="pubMessage" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition" placeholder="Write your question here...">Hello, I would like to learn more about setting up PropLedger for my rental property.</textarea>
      </div>

      <button id="pubBtn" onclick="submitPublicQuery()" class="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Send Inquiry to support@propledger.vishalbhutekar.me</span>
      </button>

      <div id="pubStatus" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
    </div>

    <!-- 13. ENGINEERING SPECIFICATIONS & STRATEGIC WHITE PAPERS -->
    <div id="handbooks" class="soft-card p-8 sm:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Engineering Documentation & Enterprise Proposals</h2>
            <p class="text-xs text-slate-500">For CTOs, Lead Architects, and Enterprise Evaluators</p>
          </div>
        </div>
        <a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="pill-btn text-xs text-indigo-600 hover:text-indigo-700 font-bold px-4 py-2 border border-slate-200 bg-white shadow-sm">
          GitHub Repo &rarr;
        </a>
      </div>

      <!-- Strategic Yardi Proposal Card -->
      <div class="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <span class="text-xs font-bold text-indigo-700">PROP-YRD-2026-V1 &bull; Strategic Enterprise Whitepaper</span>
          <h3 class="text-base font-bold text-slate-900">Modernizing Real Estate Operations: The PropLedger Proposal</h3>
          <p class="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Complete architectural proposal for Yardi Systems and enterprise REITs explaining PostgreSQL exclusion constraints, subledger architecture, and 73.7% 5-year TCO reduction.
          </p>
        </div>
        <a href="https://github.com/vishal-bhutekar21/PropLedger/blob/main/docs/YARDI_ENTERPRISE_PROPOSAL.md" target="_blank" class="pill-btn px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm text-center whitespace-nowrap self-start md:self-center">
          Read Executive Proposal &rarr;
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="soft-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-900">Vol 1: Enterprise Architecture</p>
            <p class="text-xs text-slate-500">Spring Boot & Subledger Topology</p>
          </div>
        </div>
        <div class="soft-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-900">Vol 4: Concurrency & Locks</p>
            <p class="text-xs text-slate-500">Pessimistic & GiST Anti-Collision</p>
          </div>
        </div>
        <div class="soft-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-900">Vol 5: Billing & Invoicing Engine</p>
            <p class="text-xs text-slate-500">Resend & Transactional Ledger</p>
          </div>
        </div>
        <div class="soft-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-slate-900">Vol 8: Financial SQL Analytics</p>
            <p class="text-xs text-slate-500">Double-Entry & Window Functions</p>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- Clean Minimal Footer (Soft UI) -->
  <footer class="mt-20 border-t border-slate-200/80 bg-slate-50 py-10 text-center">
    <div class="max-w-6xl mx-auto px-6 space-y-2">
      <p class="text-xs font-semibold text-slate-700">
        PropLedger Technologies &bull; Autonomous Property Management & Subledger Platform
      </p>
      <p class="text-[11px] text-slate-500 font-mono">
        Cloudflare Edge Protected &bull; TLS 1.3 &bull; propledger.vishalbhutekar.me
      </p>
    </div>
  </footer>

  <!-- Floating Quick-Action Dock (Modern Glass Island) -->
  <div class="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
    <div class="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full px-5 py-2.5 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.12)] flex items-center gap-2 sm:gap-4 transition hover:shadow-[0_14px_45px_-5px_rgba(0,0,0,0.16)]">
      <button onclick="openPaymentModal()" class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200/80 transition">
        <span>💳</span>
        <span>Pay Rent</span>
      </button>
      <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Suite Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition">
        <span>📅</span>
        <span class="hidden sm:inline">Schedule Tour</span>
        <span class="sm:hidden">Tour</span>
      </button>
      <button onclick="openMaintenanceModal()" class="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition">
        <span>🛠️</span>
        <span>Resident Desk</span>
      </button>
      <a href="#concierge" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition">
        <span>💬</span>
        <span class="hidden sm:inline">Concierge</span>
      </a>
      <div class="h-4 w-px bg-slate-200"></div>
      <a href="https://admin.vishalbhutekar.me" class="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
        <span>⚡ Master Admin</span>
      </a>
    </div>
  </div>

  <!-- 1. INTERACTIVE PAYMENT MODAL & DIGITAL RECEIPT -->
  <div id="paymentModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
            💳
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Secure Rent Settlement</h3>
            <p class="text-xs text-slate-500 font-mono">The Grand Horizon &bull; Unit 402</p>
          </div>
        </div>
        <button onclick="closePaymentModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <!-- Main Payment Flow Container -->
      <div id="paymentFlowContainer" class="space-y-5">
        <!-- Payment Method Switcher -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Payment Method</label>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button onclick="setPayMethod('ach')" id="pmAch" class="p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center transition">
              Bank ACH (0% Fee)
            </button>
            <button onclick="setPayMethod('card')" id="pmCard" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              Card (0% Fee)
            </button>
            <button onclick="setPayMethod('apple')" id="pmApple" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition">
              Apple Pay / GPay
            </button>
          </div>
        </div>

        <!-- Dynamic Payment Method Details -->
        <div id="payDetailsAch" class="soft-inner p-4 space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Connected Checking Account</span>
            <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full font-mono">&check; Verified ACH</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" class="p-2 rounded-xl border-2 border-indigo-600 bg-white text-xs font-bold text-slate-800 text-left">
              <span class="text-[10px] text-indigo-600 block">Primary</span>
              Chase &bull; 8421
            </button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-left hover:border-slate-300">
              <span class="text-[10px] text-slate-400 block">Secondary</span>
              BofA &bull; 1904
            </button>
            <button type="button" class="p-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 text-left hover:border-slate-300">
              <span class="text-[10px] text-slate-400 block">Savings</span>
              Wells &bull; 5532
            </button>
          </div>
          <div class="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>Routing: <strong>021000021</strong></span>
            <span>Clearing Speed: <strong>Instant Settlement</strong></span>
          </div>
        </div>

        <div id="payDetailsCard" class="hidden soft-inner p-4 space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Cardholder Name</label>
            <input type="text" value="Vishal Bhutekar" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">
          </div>
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Card Number</label>
            <input type="text" value="4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">Expires</label>
              <input type="text" value="08 / 29" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
            <div class="space-y-1">
              <label class="block text-[11px] font-bold text-slate-700 uppercase">CVC</label>
              <input type="text" value="842" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 font-medium">
            </div>
          </div>
        </div>

        <div id="payDetailsApple" class="hidden soft-inner p-5 space-y-3 bg-slate-50 border border-slate-200/80 text-center">
          <p class="text-xs text-slate-600">Biometric 1-click authorization via Apple Wallet or Google Pay.</p>
          <div class="p-3 rounded-2xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-slate-900 transition">
            <span> Pay</span>
            <span class="font-mono">$3,250.00</span>
          </div>
          <p class="text-[10px] text-slate-400 font-mono">Touch ID / Face ID encrypted cryptographic key exchange</p>
        </div>

        <!-- Itemized Balance Display -->
        <div class="soft-inner p-4 space-y-2 text-xs bg-slate-50 border border-slate-200/80">
          <div class="flex justify-between text-slate-600">
            <span>Base Apartment Rent (Unit 402):</span>
            <span class="font-mono font-bold text-slate-800">$2,850.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Assigned Parking Bay #14:</span>
            <span class="font-mono font-bold text-slate-800">$250.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Building Services & CAM:</span>
            <span class="font-mono font-bold text-slate-800">$150.00</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
            <span class="text-slate-900">Total Cleared Balance:</span>
            <span class="text-emerald-600 font-mono text-base font-black">$3,250.00</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="space-y-3">
          <button id="paySubmitBtn" onclick="processTestPayment()" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition">
            <span>Confirm & Settle $3,250.00</span>
            <span>&rarr;</span>
          </button>
          <p class="text-[11px] text-center text-slate-400 font-mono">
            🔒 256-Bit Bank Grade Encryption &bull; Instant Subledger Clearance
          </p>
        </div>
      </div>

      <!-- Success Receipt View (Rendered dynamically upon payment) -->
      <div id="paymentReceiptContainer" class="hidden space-y-5">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black mx-auto shadow-inner">
            &check;
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Settled & Reconciled!</h4>
          <p class="text-xs text-slate-500">Funds transferred and registered in PropLedger subledger.</p>
        </div>

        <div class="soft-inner p-5 space-y-3.5 bg-slate-50 border border-slate-200 text-xs font-mono">
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Transaction ID:</span>
            <span class="font-bold text-slate-900">TXN-2026-ACH-98214</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Cleared Amount:</span>
            <span class="font-bold text-emerald-600 text-sm">$3,250.00 USD</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Resident / Unit:</span>
            <span class="font-bold text-slate-900">Vishal Bhutekar &bull; Unit 402</span>
          </div>
          <div class="flex justify-between border-b border-slate-200/80 pb-2">
            <span class="text-slate-500">Settlement Method:</span>
            <span class="font-bold text-slate-900" id="receiptMethodText">Automated Bank ACH (Chase)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Timestamp:</span>
            <span class="text-slate-700" id="receiptTimestamp">Sep 12, 2026 &bull; Real-time</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button onclick="window.print()" class="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <span>🖨️ Print Receipt</span>
          </button>
          <button onclick="downloadStatementPdf()" class="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <span>📥 Download PDF</span>
          </button>
          <button onclick="closePaymentModal()" class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <span>Done</span>
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- 2. INTERACTIVE SCHEDULE TOUR & APPLICATION MODAL -->
  <div id="tourModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
            🏢
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Schedule Private Tour & Apply</h3>
            <p class="text-xs text-slate-500 font-mono" id="tourModalSubtitle">The Grand Horizon Luxury Suites</p>
          </div>
        </div>
        <button onclick="closeTourModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <!-- Unit Preview Snapshot -->
      <div class="soft-inner p-4 bg-slate-50 border border-slate-200 flex items-center gap-3.5">
        <img id="tourUnitImg" src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=160&q=80" alt="Apartment preview" class="w-16 h-16 rounded-xl object-cover">
        <div>
          <h4 id="tourUnitTitle" class="font-bold text-sm text-slate-900">Unit 503 &bull; Panoramic Skyline Loft</h4>
          <p id="tourUnitSpecs" class="text-xs text-slate-500 font-mono">1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath</p>
          <p id="tourUnitRent" class="text-xs font-black text-indigo-600 font-mono mt-0.5">$3,100 / mo</p>
        </div>
      </div>

      <div id="tourFormContainer" class="space-y-4">
        <!-- Tour Type Toggle -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Tour Experience</label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onclick="setTourType('person')" id="ttPerson" class="p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center">
              🏢 In-Person Tour
            </button>
            <button type="button" onclick="setTourType('video')" id="ttVideo" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300">
              📹 4K Virtual Walkthrough
            </button>
          </div>
        </div>

        <!-- Preferred Time Slot -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preferred Date & Time</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/40 font-bold text-indigo-700 text-center">
              Tomorrow 10:30 AM
            </button>
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Tomorrow 2:00 PM
            </button>
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Saturday 11:00 AM
            </button>
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Sunday 3:30 PM
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Your Full Name</label>
            <input id="tourName" type="text" placeholder="Alex Mercer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input id="tourPhone" type="tel" placeholder="+1 (555) 019-2834" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
          </div>
        </div>

        <div class="text-xs">
          <label class="block font-bold text-slate-700 uppercase mb-1">Email Address for Tour Invitation</label>
          <input id="tourEmail" type="email" placeholder="alex@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none">
        </div>

        <button id="tourSubmitBtn" onclick="submitTourRequest()" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition">
          <span>Confirm Tour & Receive Application Packet &rarr;</span>
        </button>
      </div>

      <div id="tourSuccessCard" class="hidden space-y-4 text-center py-4">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
          &check;
        </div>
        <h4 class="text-lg font-bold text-slate-900">Tour Reservation Confirmed!</h4>
        <p class="text-xs text-slate-600 max-w-sm mx-auto" id="tourSuccessMsg">
          A calendar invite and application link have been forwarded to your email. Our concierge desk will meet you at the primary lobby.
        </p>
        <button onclick="closeTourModal()" class="pill-btn px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold">
          Close Window
        </button>
      </div>
    </div>
  </div>

  <!-- 3. INTERACTIVE RESIDENT MAINTENANCE & REPAIR MODAL -->
  <div id="maintenanceModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-lg">
            🛠️
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Resident Maintenance Desk</h3>
            <p class="text-xs text-slate-500 font-mono">Unit 402 &bull; Vishal Bhutekar</p>
          </div>
        </div>
        <button onclick="closeMaintenanceModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <div id="maintFormContainer" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Issue Category</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button type="button" onclick="setMaintCategory(this, 'Plumbing & Water')" class="p-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-left">
              💧 Plumbing / Leak
            </button>
            <button type="button" onclick="setMaintCategory(this, 'HVAC & Climate')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300">
              ❄️ HVAC / A/C
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Electrical & Lighting')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300">
              ⚡ Electrical
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Kitchen Appliance')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300">
              🍳 Appliances
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Lock & Keycard')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300">
              🔑 Key & Fob
            </button>
            <button type="button" onclick="setMaintCategory(this, 'General Repair')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300">
              📦 Other Repair
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Urgency Level</label>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" onclick="setMaintUrgency(this, 'Routine')" class="p-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center">
              Routine (48h)
            </button>
            <button type="button" onclick="setMaintUrgency(this, 'Priority')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Priority (24h)
            </button>
            <button type="button" onclick="setMaintUrgency(this, 'Emergency')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300">
              Emergency (24/7)
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Problem Details</label>
          <textarea id="maintDescription" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none" placeholder="Describe the issue (e.g. Master bathroom sink pressure is low)...">Master bathroom sink hot water valve has minor dripping.</textarea>
        </div>

        <div class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 transition">
          <span>📷</span>
          <span>Attach Photo or Video (Optional)</span>
        </div>

        <button id="maintSubmitBtn" onclick="submitMaintenanceTicket()" class="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition">
          <span>Submit Maintenance Ticket &rarr;</span>
        </button>
      </div>

      <div id="maintSuccessCard" class="hidden space-y-4 text-center py-4 font-mono">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mx-auto">
          &check;
        </div>
        <h4 class="text-base font-bold text-slate-900">Work Order Created: TKT-2026-402-918</h4>
        <p class="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
          Assigned to: <strong>Metro Facilities Team Lead Dave M.</strong><br>
          A technician has been dispatched to Unit 402. Updates will be sent via SMS and email.
        </p>
        <button onclick="closeMaintenanceModal()" class="pill-btn px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-sans">
          Close Window
        </button>
      </div>
    </div>
  </div>

  <script>
    // 1. Dual Experience Switcher
    function switchExperience(type) {
      const landlordView = document.getElementById('viewLandlord');
      const tenantView = document.getElementById('viewTenant');
      const btnL = document.getElementById('tabBtnLandlord');
      const btnT = document.getElementById('tabBtnTenant');

      if (type === 'landlord') {
        landlordView.classList.remove('hidden');
        tenantView.classList.add('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab';
      } else {
        landlordView.classList.add('hidden');
        tenantView.classList.remove('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab';
      }
    }

    function dispatchBatchBills() {
      const btn = document.getElementById('batchDispatchBtn');
      const notice = document.getElementById('batchDispatchNotice');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-1">&#9696;</span> Dispatching across 402 units...';

      setTimeout(() => {
        notice.classList.remove('hidden');
        notice.innerHTML = '<strong>Batch Invoicing Complete!</strong><br>Successfully generated and emailed itemized statements across all 402 occupied units via Resend API.';
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ Invoices Dispatched (402 Sent)</span>';
      }, 800);
    }

    // 2. Unit Gallery Filtering
    function filterUnits(category) {
      document.querySelectorAll('[id^="filterBtn-"]').forEach(b => {
        b.className = 'pill-btn px-4 py-1.5 text-xs font-bold inactive-tab';
      });
      document.getElementById('filterBtn-' + category).className = 'pill-btn px-4 py-1.5 text-xs font-bold active-tab';

      document.querySelectorAll('.unit-card').forEach(card => {
        if (category === 'all') {
          card.style.display = 'block';
        } else {
          card.style.display = card.getAttribute('data-status') === category ? 'block' : 'none';
        }
      });
    }

    // 3. ROI Calculator
    function calculateRoi() {
      const units = parseInt(document.getElementById('sliderUnits').value);
      const rent = parseInt(document.getElementById('sliderRent').value);

      document.getElementById('sliderUnitsVal').innerText = units + (units === 1 ? ' Unit' : ' Units');
      document.getElementById('sliderRentVal').innerText = '$' + rent.toLocaleString() + ' / mo';

      const monthlyRev = units * rent;
      const hoursSaved = Math.round(units * 3.2);
      const annualSavings = Math.round(units * 450);

      document.getElementById('outRevenue').innerText = '$' + monthlyRev.toLocaleString() + ' / mo';
      document.getElementById('outHours').innerText = hoursSaved + ' Hours';
      document.getElementById('outSavings').innerText = '$' + annualSavings.toLocaleString() + ' / yr';
    }

    // 4. Live Simulator Logic
    let currentRent = 2850;
    let currentUnit = 'Unit 402';
    let currentTenant = 'Vishal Bhutekar';

    function selectSimUnit(unit, rent, tenant) {
      currentRent = rent;
      currentUnit = unit;
      currentTenant = tenant;

      document.querySelectorAll('[id^="simBtn-"]').forEach(btn => {
        btn.className = 'p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-white text-left transition shadow-sm';
      });

      const btnId = 'simBtn-' + unit.replace('Unit ', '');
      const selBtn = document.getElementById(btnId);
      if (selBtn) {
        selBtn.className = 'p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 text-left transition shadow-sm';
      }

      document.getElementById('simPreviewTitle').innerText = 'The Grand Horizon • ' + unit;
      document.getElementById('simResidentBadge').innerText = 'Tenant: ' + tenant;
      document.getElementById('simRentVal').innerText = '$' + rent.toLocaleString() + '.00';
      
      updateSimTotal();
    }

    function updateSimTotal() {
      let total = currentRent;
      const parking = document.getElementById('simParking').checked;
      const cam = document.getElementById('simCAM').checked;
      const fiber = document.getElementById('simFiber').checked;

      document.getElementById('simParkingRow').style.display = parking ? 'flex' : 'none';
      document.getElementById('simCAMRow').style.display = cam ? 'flex' : 'none';
      document.getElementById('simFiberRow').style.display = fiber ? 'flex' : 'none';

      if (parking) total += 250;
      if (cam) total += 150;
      if (fiber) total += 80;

      document.getElementById('simTotalDisplay').innerText = '$' + total.toLocaleString() + '.00';
    }

    function runSimDispatch() {
      const btn = document.getElementById('simDispatchBtn');
      const alertBox = document.getElementById('simAlert');
      const total = document.getElementById('simTotalDisplay').innerText;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Generating & Dispatching Bill...';

      setTimeout(() => {
        alertBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs font-mono leading-relaxed';
        alertBox.innerHTML = '<strong>Success! Real-time Statement Generated:</strong><br>' +
          'Dispatched statement of <strong>' + total + '</strong> for ' + currentUnit + ' to resident (' + currentTenant + '). ' +
          'Tenant has received a secure payment link via email with 1-click bank transfer.';
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Bill Dispatched Successfully! Click to Test Again</span>';
      }, 700);
    }

    // 5. Payment Modal Logic
    let activePayMethod = 'ach';

    function openPaymentModal() {
      const modal = document.getElementById('paymentModal');
      document.getElementById('paymentFlowContainer').classList.remove('hidden');
      document.getElementById('paymentReceiptContainer').classList.add('hidden');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closePaymentModal() {
      const modal = document.getElementById('paymentModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setPayMethod(m) {
      activePayMethod = m;
      document.getElementById('pmAch').className = m === 'ach' ? 'p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      document.getElementById('pmCard').className = m === 'card' ? 'p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      document.getElementById('pmApple').className = m === 'apple' ? 'p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';

      document.getElementById('payDetailsAch').classList.toggle('hidden', m !== 'ach');
      document.getElementById('payDetailsCard').classList.toggle('hidden', m !== 'card');
      document.getElementById('payDetailsApple').classList.toggle('hidden', m !== 'apple');
    }

    function processTestPayment() {
      const btn = document.getElementById('paySubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 1/3: Encrypting via 256-bit TLS...';

      setTimeout(() => {
        btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 2/3: Validating Subledger...';
      }, 500);

      setTimeout(() => {
        btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 3/3: Settling to Escrow...';
      }, 900);

      setTimeout(() => {
        document.getElementById('paymentFlowContainer').classList.add('hidden');
        const receiptContainer = document.getElementById('paymentReceiptContainer');
        receiptContainer.classList.remove('hidden');

        const methodMap = {
          'ach': 'Automated Bank ACH (Chase Checking • 8421)',
          'card': 'Debit / Credit Card (Visa • 4242)',
          'apple': 'Apple Pay Biometric Clearance'
        };
        document.getElementById('receiptMethodText').innerText = methodMap[activePayMethod] || 'Automated Clearing House';
        document.getElementById('receiptTimestamp').innerText = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US');
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Settle $3,250.00</span><span>&rarr;</span>';
      }, 1400);
    }

    // 6. Schedule Tour Modal Logic
    let selectedTourType = 'In-Person Tour';
    let selectedTourSlot = 'Tomorrow 10:30 AM';

    function openTourModal(title, rent, specs, img) {
      document.getElementById('tourUnitTitle').innerHTML = title;
      document.getElementById('tourUnitRent').innerText = rent;
      document.getElementById('tourUnitSpecs').innerHTML = specs;
      if (img) document.getElementById('tourUnitImg').src = img;
      document.getElementById('tourFormContainer').classList.remove('hidden');
      document.getElementById('tourSuccessCard').classList.add('hidden');
      const modal = document.getElementById('tourModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeTourModal() {
      const modal = document.getElementById('tourModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setTourType(t) {
      selectedTourType = t === 'person' ? 'In-Person Tour' : '4K Virtual Walkthrough';
      document.getElementById('ttPerson').className = t === 'person' ? 'p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300';
      document.getElementById('ttVideo').className = t === 'video' ? 'p-2.5 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300';
    }

    function setTourTime(btn) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/40 font-bold text-indigo-700 text-center';
      selectedTourSlot = btn.innerText.trim();
    }

    async function submitTourRequest() {
      const btn = document.getElementById('tourSubmitBtn');
      const name = document.getElementById('tourName').value || 'Prospective Resident';
      const email = document.getElementById('tourEmail').value || 'resident@example.com';
      const phone = document.getElementById('tourPhone').value || 'Unspecified';
      const unit = document.getElementById('tourUnitTitle').innerText;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Registering reservation...';

      try {
        await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName: name,
            senderEmail: email,
            subject: 'Tour Reservation: ' + unit + ' (' + selectedTourSlot + ')',
            message: ['Applicant: ' + name, 'Email: ' + email, 'Phone: ' + phone, 'Tour Type: ' + selectedTourType, 'Time Slot: ' + selectedTourSlot, 'Unit: ' + unit].join('\\n')
          })
        });
      } catch (e) {
        console.error(e);
      }

      document.getElementById('tourFormContainer').classList.add('hidden');
      document.getElementById('tourSuccessCard').classList.remove('hidden');
      document.getElementById('tourSuccessMsg').innerHTML = 'Tour confirmed for <strong>' + selectedTourSlot + '</strong> (' + selectedTourType + '). An invitation and digital lease packet have been emailed to ' + email + '.';
      btn.disabled = false;
      btn.innerHTML = '<span>Confirm Tour & Receive Application Packet &rarr;</span>';
    }

    // 7. Resident Maintenance Desk Logic
    let maintCategory = 'Plumbing & Water';
    let maintUrgency = 'Routine';

    function openMaintenanceModal() {
      document.getElementById('maintFormContainer').classList.remove('hidden');
      document.getElementById('maintSuccessCard').classList.add('hidden');
      const modal = document.getElementById('maintenanceModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeMaintenanceModal() {
      const modal = document.getElementById('maintenanceModal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setMaintCategory(btn, cat) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-left';
      maintCategory = cat;
    }

    function setMaintUrgency(btn, urg) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700 text-center';
      maintUrgency = urg;
    }

    async function submitMaintenanceTicket() {
      const btn = document.getElementById('maintSubmitBtn');
      const desc = document.getElementById('maintDescription').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Dispatching work order...';

      try {
        await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName: 'Vishal Bhutekar (Unit 402)',
            senderEmail: 'vishal.bhutekar1@gmail.com',
            subject: 'Maintenance Ticket [Unit 402]: ' + maintCategory + ' (' + maintUrgency + ')',
            message: ['Resident: Vishal Bhutekar', 'Unit: 402', 'Category: ' + maintCategory, 'Priority: ' + maintUrgency, 'Details: ' + desc].join('\\n')
          })
        });
      } catch (e) {
        console.error(e);
      }

      document.getElementById('maintFormContainer').classList.add('hidden');
      document.getElementById('maintSuccessCard').classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '<span>Submit Maintenance Ticket &rarr;</span>';
    }

    // 8. Download Statement Helper
    function downloadStatementPdf() {
      window.print();
    }

    // 9. Public Query Form Handler
    async function submitPublicQuery() {
      const btn = document.getElementById('pubBtn');
      const statusBox = document.getElementById('pubStatus');
      const name = document.getElementById('pubName').value || 'Resident';
      const email = document.getElementById('pubEmail').value || 'resident@example.com';
      const subject = document.getElementById('pubSubject').value;
      const message = document.getElementById('pubMessage').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Forwarding to concierge desk...';
      statusBox.className = 'p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Routing to support@propledger.vishalbhutekar.me...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: name, senderEmail: email, subject: subject, message: message })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Inquiry Forwarded Successfully!</strong><br>Our team has received your inquiry and will respond directly to ' + email + '.';
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Status notice: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error transmitting inquiry: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Send Inquiry to support@propledger.vishalbhutekar.me</span>';
      }
    }
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MASTER ADMIN PORTAL: admin.propledger.vishalbhutekar.me
// Executive Master Operations & Infrastructure Control Center
// ─────────────────────────────────────────────────────────────────────────────
function renderAdminPage(hostname) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger Master Admin | Executive Control Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .soft-card { background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.85); border-radius: 24px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02); transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .soft-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.02); }
    .soft-inner { background: #f8fafc; border: 1px solid #edf2f7; border-radius: 16px; }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1.5px); }
  </style>
</head>
<body class="min-h-screen antialiased bg-white text-slate-900 pb-32">

  <!-- Floating Sticky Header (Soft UI) -->
  <div class="sticky top-4 z-50 px-4 max-w-6xl mx-auto">
    <header class="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full px-6 py-3.5 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)] flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-emerald-500/20">
          M
        </div>
        <div>
          <span class="font-extrabold text-lg tracking-tight text-slate-900">PropLedger Master Admin</span>
          <p class="text-[11px] text-slate-500 font-mono tracking-tight">${hostname}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-3">
        <a href="https://propledger.vishalbhutekar.me" class="pill-btn text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
          &larr; Public Website
        </a>
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>vishal.bhutekar1@gmail.com</span>
        </div>
      </div>
    </header>
  </div>

  <!-- Admin Content Container -->
  <main class="max-w-6xl mx-auto px-6 pt-10 space-y-10">

    <!-- Hero Header (Soft UI) -->
    <div class="soft-card p-8 sm:p-10 bg-slate-900 text-white rounded-3xl shadow-lg relative overflow-hidden">
      <div class="max-w-3xl space-y-3">
        <div class="flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Global Edge Operations Plane &bull; Active</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Master Operations & Cloudflare Infrastructure Console
        </h1>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          Dedicated administrative control plane for transactional email triggers, Cloudflare edge subdomains, database schema integrity, and inbound concierge routing.
        </p>
      </div>
    </div>

    <!-- 4 System Infrastructure Status Cards (Soft UI) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="soft-card p-6">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Portal</p>
        <p class="text-lg font-bold text-slate-900 mt-1">propledger</p>
        <p class="text-xs text-indigo-600 font-mono mt-1">vishalbhutekar.me</p>
      </div>

      <div class="soft-card p-6">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Portal</p>
        <p class="text-lg font-bold text-slate-900 mt-1">admin</p>
        <p class="text-xs text-emerald-700 font-mono mt-1">vishalbhutekar.me</p>
      </div>

      <div class="soft-card p-6">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbound Concierge</p>
        <p class="text-lg font-bold text-slate-900 mt-1">support@</p>
        <p class="text-xs text-indigo-600 font-mono mt-1">Forwarding Active</p>
      </div>

      <div class="soft-card p-6">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transactional Mail</p>
        <p class="text-lg font-bold text-slate-900 mt-1">Resend API</p>
        <p class="text-xs text-purple-600 font-mono mt-1">DKIM & SPF Live</p>
      </div>
    </div>

    <!-- Master Credentials Card (Soft UI) -->
    <div class="soft-card p-8 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-900 tracking-tight">Master Administrator Account Specification</h2>
        <span class="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          BCrypt 12 Provisioned
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div class="soft-inner p-4">
          <span class="text-slate-500 block mb-1">Master Email Address</span>
          <span class="text-slate-900 font-bold text-sm">vishal.bhutekar1@gmail.com</span>
        </div>
        <div class="soft-inner p-4">
          <span class="text-slate-500 block mb-1">Security Password</span>
          <span class="text-slate-900 font-bold text-sm">Vishal@1233</span>
        </div>
        <div class="soft-inner p-4">
          <span class="text-slate-500 block mb-1">Security Roles</span>
          <span class="text-emerald-700 font-bold text-xs">SUPER_ADMIN, MGR, ACCT</span>
        </div>
      </div>
    </div>

    <!-- Operations & Dispatcher Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Statement Dispatch Console (Soft UI) -->
      <div class="soft-card p-8 space-y-6">
        <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Commercial Statement Dispatcher</h2>
            <p class="text-xs text-slate-500">Trigger branded statement email with itemized charges</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Recipient Email Address</label>
            <input id="adminEmailInput" type="email" value="vishal.bhutekar1@gmail.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Invoice #</label>
              <input id="adminInvNumber" type="text" value="INV-202609-00001" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Amount</label>
              <input id="adminInvAmount" type="text" value="$3,250.00" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-indigo-500 focus:outline-none transition">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Property Asset</label>
            <input id="adminInvProperty" type="text" value="The Grand Horizon Luxury Suites - Unit 402" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition">
          </div>

          <button id="adminSendBtn" onclick="adminDispatchEmail()" class="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            <span>Dispatch Statement via Resend</span>
          </button>

          <div id="adminStatusResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
        </div>
      </div>

      <!-- Inbound Support Pipeline Simulator (Soft UI) -->
      <div class="soft-card p-8 space-y-6">
        <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Inbound Support Routing Monitor</h2>
            <p class="text-xs text-slate-500">Verifies pipeline to <span class="text-indigo-600 font-mono">vishal.bhutekar1@gmail.com</span></p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="soft-inner p-4 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-700 font-semibold">
              <span>Target Inbound Address:</span>
              <span class="font-mono text-indigo-600">support@propledger.vishalbhutekar.me</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>Forward Destination:</span>
              <span class="font-mono text-slate-900">vishal.bhutekar1@gmail.com</span>
            </div>
            <div class="flex items-center justify-between text-slate-600">
              <span>Cloudflare Zone:</span>
              <span class="font-mono">84d04451d623e1d6885d01c55a89ce3a</span>
            </div>
          </div>

          <button id="adminPingBtn" onclick="adminPingSupport()" class="w-full py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition border border-slate-200 flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Simulate Live Inbound Support Forwarding</span>
          </button>

          <div id="adminPingResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
        </div>
      </div>
    </div>
  </main>

  <!-- Clean Minimal Footer -->
  <footer class="mt-20 border-t border-slate-200/80 bg-slate-50 py-10 text-center">
    <div class="max-w-6xl mx-auto px-6 space-y-2">
      <p class="text-xs font-semibold text-slate-700">
        PropLedger Technologies &bull; Master Administration & Global Operations Console
      </p>
      <p class="text-[11px] text-slate-500 font-mono">
        Cloudflare Edge Protected &bull; TLS 1.3 &bull; admin.vishalbhutekar.me
      </p>
    </div>
  </footer>

  <script>
    async function adminDispatchEmail() {
      const btn = document.getElementById('adminSendBtn');
      const statusBox = document.getElementById('adminStatusResult');
      const email = document.getElementById('adminEmailInput').value;
      const invNum = document.getElementById('adminInvNumber').value;
      const amount = document.getElementById('adminInvAmount').value;
      const property = document.getElementById('adminInvProperty').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Dispatching via Resend API...';
      statusBox.className = 'p-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to transactional mail engine...';

      try {
        const resp = await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: email, invoiceNumber: invNum, amount: amount, property: property, tenant: 'Vishal Bhutekar' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email;
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Dispatch Statement via Resend</span>';
      }
    }

    async function adminPingSupport() {
      const btn = document.getElementById('adminPingBtn');
      const statusBox = document.getElementById('adminPingResult');

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Testing forward routing...';
      statusBox.className = 'p-4 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Sending diagnostic packet...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: 'Admin Portal Ping', senderEmail: 'diagnostics@propledger.com', subject: 'Diagnostic verification of edge forward pipeline', message: 'Testing forward routing to vishal.bhutekar1@gmail.com' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Support Routing Verified!</strong><br>Forwarded to: ' + data.forwardedTo + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Simulate Live Inbound Support Forwarding</span>';
      }
    }
  </script>
</body>
</html>`;
}
