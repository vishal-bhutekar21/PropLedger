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

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC WEBSITE: home.propledger.vishalbhutekar.me
// Clean modern enterprise aesthetic for general public & residents
// ─────────────────────────────────────────────────────────────────────────────
function renderHomePage(hostname) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger | Autonomous Property Operations & Financial Ledger</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #070a10; color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .swish-card { background: #0f141f; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; box-shadow: 0 20px 45px -12px rgba(0,0,0,0.6); }
    .swish-inner { background: #080b12; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1.5px); }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-indigo-500 selection:text-white pb-32">

  <!-- Floating Sticky Header -->
  <div class="sticky top-4 z-50 px-4 max-w-6xl mx-auto">
    <header class="bg-[#0b0f19]/85 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3.5 shadow-2xl flex items-center justify-between">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/30">
          P
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-black text-lg tracking-tight text-white">PropLedger</span>
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wider">PLATFORM</span>
          </div>
          <p class="text-[10px] text-slate-400 font-mono tracking-tight">${hostname}</p>
        </div>
      </a>

      <!-- Quick Nav Links -->
      <nav class="hidden md:flex items-center gap-2">
        <a href="#features" class="pill-btn text-xs font-bold px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5">Features</a>
        <a href="#resident-voucher" class="pill-btn text-xs font-bold px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5">Financial Statement</a>
        <a href="#concierge" class="pill-btn text-xs font-bold px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5">Concierge Desk</a>
        <a href="#handbooks" class="pill-btn text-xs font-bold px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5">Documentation</a>
      </nav>

      <!-- Admin Portal Action Button -->
      <div class="flex items-center gap-2">
        <a href="https://admin.vishalbhutekar.me" class="pill-btn text-xs font-black px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5">
          <span>Master Admin</span>
          <span>&rarr;</span>
        </a>
      </div>
    </header>
  </div>

  <!-- Hero Section -->
  <main class="max-w-6xl mx-auto px-6 pt-12 space-y-16">

    <div class="text-center max-w-3xl mx-auto space-y-6 pt-6">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Enterprise Cloudflare Edge Platform Live
      </div>

      <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
        Autonomous Property Operations & Financial Subledger
      </h1>

      <p class="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
        Engineered with the transactional consistency of Tier-1 ERPs (Yardi, RealPage). Automated recurring billing, GAAP balance double-entry, and instant edge communication.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a href="#resident-voucher" class="pill-btn px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl">
          Explore Financial Statement &darr;
        </a>
        <a href="https://admin.vishalbhutekar.me" class="pill-btn px-7 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-white/10 font-bold text-sm shadow-xl">
          Launch Master Admin Console &rarr;
        </a>
      </div>
    </div>

    <!-- 4 Key Architecture Pillars -->
    <div id="features" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="swish-card p-7 space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-lg border border-indigo-500/20">
          01
        </div>
        <h3 class="text-lg font-black text-white">Subledger Engine</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Double-entry bookkeeping balancing rent invoices, utilities, late penalties, and payments with zero discrepancy.
        </p>
      </div>

      <div class="swish-card p-7 space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/20">
          02
        </div>
        <h3 class="text-lg font-black text-white">Anti-Collision Shield</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          PostgreSQL <code class="font-mono text-emerald-400">btree_gist</code> temporal exclusion constraints completely prevent overlapping unit leases.
        </p>
      </div>

      <div class="swish-card p-7 space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-lg border border-purple-500/20">
          03
        </div>
        <h3 class="text-lg font-black text-white">Automated Billing</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Scheduled billing engine auto-generates recurring invoices and itemized statements with automated email delivery via Resend.
        </p>
      </div>

      <div class="swish-card p-7 space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-black text-lg border border-sky-500/20">
          04
        </div>
        <h3 class="text-lg font-black text-white">Facilities & Triage</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Priority ticket triage with automated SLA tracking, vendor dispatch, and work order cost allocation to operating expenses.
        </p>
      </div>
    </div>

    <!-- Clean Enterprise Resident Statement Card -->
    <div id="resident-voucher" class="swish-card p-8 sm:p-12 relative overflow-hidden">
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <span class="text-xs font-extrabold px-3.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
            Automated Ledger Statement
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">Resident Billing & Financial Statement</h2>
          <p class="text-xs text-slate-400">Real-time resident subledger breakdown, line-item reconciliation, and payment settlement</p>
        </div>

        <div class="relative bg-[#090d15] border border-white/10 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between pb-6 border-b border-white/10">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/30">
                P
              </div>
              <div>
                <h3 class="font-black text-base text-white">The Grand Horizon Luxury Suites</h3>
                <p class="text-xs text-slate-400 font-mono">Unit 402 &bull; Resident: Vishal Bhutekar</p>
              </div>
            </div>
            <span class="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
              POSTED &bull; CLEARED
            </span>
          </div>

          <!-- Metadata Ribbon -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
            <div>
              <span class="text-slate-400 block font-medium">Billing Period</span>
              <span class="text-white font-mono font-semibold">Sep 01 – Sep 30, 2026</span>
            </div>
            <div>
              <span class="text-slate-400 block font-medium">Statement ID</span>
              <span class="text-indigo-400 font-mono font-bold">STM-202609-0402</span>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <span class="text-slate-400 block font-medium">Payment Method</span>
              <span class="text-emerald-400 font-mono font-semibold">Automated Bank ACH</span>
            </div>
          </div>

          <!-- Itemized Breakdown -->
          <div class="space-y-3 text-xs">
            <div class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pb-1 border-b border-white/5">
              Itemized Charges
            </div>
            <div class="flex justify-between py-1.5 border-b border-white/[0.04]">
              <div>
                <span class="text-slate-200 font-medium block">Residential Space Lease Fee (Unit 402)</span>
                <span class="text-[10px] text-slate-500">Contractual Monthly Base Rent</span>
              </div>
              <span class="text-white font-mono font-bold self-center">$2,850.00</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-white/[0.04]">
              <div>
                <span class="text-slate-200 font-medium block">Assigned Subterranean Parking Bay #14</span>
                <span class="text-[10px] text-slate-500">Dedicated Secure Vehicle Space</span>
              </div>
              <span class="text-white font-mono font-bold self-center">$250.00</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-white/[0.04]">
              <div>
                <span class="text-slate-200 font-medium block">Common Area Maintenance (CAM Allocation)</span>
                <span class="text-[10px] text-slate-500">HVAC, Security & Building Services</span>
              </div>
              <span class="text-white font-mono font-bold self-center">$150.00</span>
            </div>
          </div>

          <!-- Total Balance Summary -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider">Total Statement Balance</span>
              <p class="text-3xl font-black text-emerald-400 font-mono tracking-tight mt-1">$3,250.00</p>
            </div>
            <a href="mailto:support@propledger.vishalbhutekar.me?subject=Inquiry%20regarding%20Unit%20402%20Statement" class="pill-btn px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 text-center">
              Inquire with Concierge Desk &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Resident Concierge Inbound Desk -->
    <div id="concierge" class="swish-card p-8 sm:p-10 border border-sky-500/20 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-white">Resident Support & Concierge</h2>
            <p class="text-xs text-slate-400">Direct inquiries sent to <span class="text-sky-400 font-mono font-medium">support@propledger.vishalbhutekar.me</span></p>
          </div>
        </div>
        <span class="hidden sm:inline-flex px-3.5 py-1 rounded-full text-xs font-mono font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          Auto-Forwarding Active
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Your Name</label>
          <input id="pubName" type="text" placeholder="John Doe" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Your Email</label>
          <input id="pubEmail" type="email" placeholder="john@example.com" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-sky-500 focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
        <input id="pubSubject" type="text" value="Resident Inquiry regarding amenities & parking" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">
      </div>

      <div>
        <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Inquiry Details</label>
        <textarea id="pubMessage" rows="3" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition" placeholder="Write your inquiry here...">Hello concierge team, I would like to confirm my parking bay allocation for Unit 402.</textarea>
      </div>

      <button id="pubBtn" onclick="submitPublicQuery()" class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Send Inquiry to support@propledger.vishalbhutekar.me</span>
      </button>

      <div id="pubStatus" class="hidden p-4 rounded-2xl border text-xs leading-relaxed font-mono"></div>
    </div>

    <!-- Master Architecture Handbooks Section -->
    <div id="handbooks" class="swish-card p-8 sm:p-10 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-white">Master Engineering Handbooks</h2>
            <p class="text-xs text-slate-400">10 Volumes &bull; 100 Pages of Enterprise Technical Specifications</p>
          </div>
        </div>
        <a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="pill-btn text-xs text-indigo-400 hover:text-indigo-300 font-extrabold px-4 py-2 border border-indigo-500/30">
          GitHub Repo &rarr;
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="swish-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-white">Vol 1: Enterprise Architecture</p>
            <p class="text-xs text-slate-400">Spring Boot & Subledger Topology</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold">10 Pages</span>
        </div>
        <div class="swish-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-white">Vol 4: Concurrency & Locks</p>
            <p class="text-xs text-slate-400">Pessimistic & GiST Constraints</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">10 Pages</span>
        </div>
        <div class="swish-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-white">Vol 5: Billing & Invoicing Engine</p>
            <p class="text-xs text-slate-400">Resend & Transactional Ledger</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono font-semibold">10 Pages</span>
        </div>
        <div class="swish-inner p-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-white">Vol 8: Financial SQL Analytics</p>
            <p class="text-xs text-slate-400">Rent Roll, Aging AR, P&L Reports</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono font-semibold">10 Pages</span>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
    <p>&copy; 2026 PropLedger Technologies &bull; Powered by Cloudflare Edge & Spring Boot</p>
    <div class="flex items-center gap-4">
      <a href="https://admin.propledger.vishalbhutekar.me" class="text-indigo-400 hover:text-indigo-300 font-bold">Admin Portal</a>
      <a href="https://zensar-prep.vishalbhutekar.me" target="_blank" class="hover:text-slate-300">Zensar Prep Suite</a>
      <a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="hover:text-slate-300">GitHub</a>
    </div>
  </footer>

  <script>
    async function submitPublicQuery() {
      const btn = document.getElementById('pubBtn');
      const statusBox = document.getElementById('pubStatus');
      const name = document.getElementById('pubName').value || 'Resident';
      const email = document.getElementById('pubEmail').value || 'resident@example.com';
      const subject = document.getElementById('pubSubject').value;
      const message = document.getElementById('pubMessage').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Forwarding to concierge desk...';
      statusBox.className = 'p-4 rounded-2xl border border-sky-500/30 bg-sky-950/40 text-sky-300 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Routing to support@propledger.vishalbhutekar.me...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: name, senderEmail: email, subject: subject, message: message })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Inquiry Forwarded Successfully!</strong><br>Our team has received your inquiry and will respond directly to ' + email + '.';
        } else {
          statusBox.className = 'p-4 rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Status notice: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-2xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
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
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger Master Admin | Executive Control Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #080b11; color: #f8fafc; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .swish-card { background: #101521; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
    .swish-inner { background: #090d15; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 22px; }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1px); }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-indigo-500 selection:text-white pb-32">

  <!-- Floating Sticky Header -->
  <div class="sticky top-4 z-50 px-4 max-w-6xl mx-auto">
    <header class="bg-[#0e131f]/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3.5 shadow-2xl flex items-center justify-between">
      
      <!-- Brand Logo & Super Admin Pill -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-emerald-500/30">
          M
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-black text-lg tracking-tight text-white">PropLedger</span>
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider">MASTER ADMIN</span>
          </div>
          <p class="text-[10px] text-slate-400 font-mono tracking-tight">${hostname}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-3">
        <a href="https://propledger.vishalbhutekar.me" class="pill-btn text-xs font-bold px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10">
          &larr; Public Website
        </a>
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>vishal.bhutekar1@gmail.com</span>
        </div>
      </div>
    </header>
  </div>

  <!-- Admin Content Container -->
  <main class="max-w-6xl mx-auto px-6 pt-10 space-y-10">

    <!-- Hero Header -->
    <div class="swish-card p-8 sm:p-10 relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#101521] to-indigo-950/80">
      <div class="max-w-3xl space-y-4">
        <div class="flex items-center gap-3">
          <span class="px-3.5 py-1 text-xs font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider">
            ROOT EXECUTIVE PRIVILEGES
          </span>
          <span class="text-xs text-slate-400 font-mono">Global Edge Active</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Master Operations & Cloudflare Infrastructure Console
        </h1>

        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          Dedicated administrative control plane for transactional email triggers, Cloudflare edge subdomains, database schema integrity, and inbound concierge routing.
        </p>
      </div>
    </div>

    <!-- 4 System Infrastructure Status Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="swish-card p-6">
        <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Public Portal</p>
        <p class="text-lg font-black text-white mt-1">propledger</p>
        <p class="text-xs text-sky-400 font-mono mt-1">vishalbhutekar.me</p>
      </div>

      <div class="swish-card p-6">
        <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Admin Portal</p>
        <p class="text-lg font-black text-white mt-1">admin</p>
        <p class="text-xs text-emerald-400 font-mono mt-1">vishalbhutekar.me</p>
      </div>

      <div class="swish-card p-6">
        <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Inbound Concierge</p>
        <p class="text-lg font-black text-white mt-1">support@</p>
        <p class="text-xs text-indigo-400 font-mono mt-1">Forwarding Active</p>
      </div>

      <div class="swish-card p-6">
        <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Transactional Mail</p>
        <p class="text-lg font-black text-white mt-1">Resend API</p>
        <p class="text-xs text-purple-400 font-mono mt-1">DKIM & SPF Live</p>
      </div>
    </div>

    <!-- Master Credentials Pill Card -->
    <div class="swish-card p-8 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/5">
        <h2 class="text-lg font-black text-white tracking-tight">Master Administrator Account Specification</h2>
        <span class="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          BCrypt 12 Provisioned
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div class="swish-inner p-4">
          <span class="text-slate-400 block mb-1">Master Email Address</span>
          <span class="text-white font-bold text-sm">vishal.bhutekar1@gmail.com</span>
        </div>
        <div class="swish-inner p-4">
          <span class="text-slate-400 block mb-1">Security Password</span>
          <span class="text-white font-bold text-sm">Vishal@1233</span>
        </div>
        <div class="swish-inner p-4">
          <span class="text-slate-400 block mb-1">Security Roles</span>
          <span class="text-emerald-400 font-bold text-xs">SUPER_ADMIN, MGR, ACCT</span>
        </div>
      </div>
    </div>

    <!-- Operations & Dispatcher Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Statement Dispatch Console -->
      <div class="swish-card p-8 space-y-6">
        <div class="flex items-center gap-3.5 pb-4 border-b border-white/5">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-white">Commercial Statement Dispatcher</h2>
            <p class="text-xs text-slate-400">Trigger branded statement email with itemized charges</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Recipient Email Address</label>
            <input id="adminEmailInput" type="email" value="vishal.bhutekar1@gmail.com" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Invoice #</label>
              <input id="adminInvNumber" type="text" value="INV-202609-00001" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
              <input id="adminInvAmount" type="text" value="$3,250.00" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
            </div>
          </div>

          <div>
            <label class="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Property Asset</label>
            <input id="adminInvProperty" type="text" value="The Grand Horizon Luxury Suites - Unit 402" class="w-full bg-[#080b12] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none transition">
          </div>

          <button id="adminSendBtn" onclick="adminDispatchEmail()" class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            <span>Dispatch Statement via Resend</span>
          </button>

          <div id="adminStatusResult" class="hidden p-4 rounded-2xl border text-xs leading-relaxed font-mono"></div>
        </div>
      </div>

      <!-- Inbound Support Pipeline Simulator -->
      <div class="swish-card p-8 space-y-6">
        <div class="flex items-center gap-3.5 pb-4 border-b border-white/5">
          <div class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-white">Inbound Support Routing Monitor</h2>
            <p class="text-xs text-slate-400">Verifies pipeline to <span class="text-sky-400 font-mono">vishal.bhutekar1@gmail.com</span></p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="swish-inner p-4 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-300 font-bold">
              <span>Target Inbound Address:</span>
              <span class="font-mono text-sky-400">support@propledger.vishalbhutekar.me</span>
            </div>
            <div class="flex items-center justify-between text-slate-400">
              <span>Forward Destination:</span>
              <span class="font-mono text-white">vishal.bhutekar1@gmail.com</span>
            </div>
            <div class="flex items-center justify-between text-slate-400">
              <span>Cloudflare Zone:</span>
              <span class="font-mono">84d04451d623e1d6885d01c55a89ce3a</span>
            </div>
          </div>

          <button id="adminPingBtn" onclick="adminPingSupport()" class="w-full py-4 px-6 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm transition border border-white/10 flex items-center justify-center gap-2">
            <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Simulate Live Inbound Support Forwarding</span>
          </button>

          <div id="adminPingResult" class="hidden p-4 rounded-2xl border text-xs leading-relaxed font-mono"></div>
        </div>
      </div>
    </div>
  </main>

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
      statusBox.className = 'p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to transactional mail engine...';

      try {
        const resp = await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail: email, invoiceNumber: invNum, amount: amount, property: property, tenant: 'Vishal Bhutekar' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email;
        } else {
          statusBox.className = 'p-4 rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-2xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
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
      statusBox.className = 'p-4 rounded-2xl border border-sky-500/30 bg-sky-950/40 text-sky-300 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Sending diagnostic packet...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: 'Admin Portal Ping', senderEmail: 'diagnostics@propledger.com', subject: 'Diagnostic verification of edge forward pipeline', message: 'Testing forward routing to vishal.bhutekar1@gmail.com' })
        });
        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Support Routing Verified!</strong><br>Forwarded to: ' + data.forwardedTo + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = 'Response: ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-2xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = 'Error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Simulate Live Inbound Support Forwarding</span>';
      }
    }
  </script>
</body>
</html>`;
}
