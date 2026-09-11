/**
 * PropLedger Enterprise - Cloudflare Worker & Edge Mail Routing
 * Inspired by Swish (justswish.in) & BookMyShow:
 * Clean, modern, Figtree typography, smooth rounded corners, ticket receipts, pill badges.
 * Host Subdomain: propledger.vishalbhutekar.me / porpledger.vishalbhutekar.me
 * Support Email: support@propledger.vishalbhutekar.me -> vishal.bhutekar1@gmail.com
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

  // API: Health & Status
  if (url.pathname === '/api/status') {
    return new Response(JSON.stringify({
      status: 'operational',
      app: 'PropLedger Enterprise',
      subdomain: url.hostname,
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
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #0c1017; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #141923; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
    <tr>
      <td style="padding: 36px 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 44px; height: 44px; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); border-radius: 16px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 800; font-size: 20px; line-height: 44px; box-shadow: 0 8px 16px -4px rgba(14, 165, 233, 0.4);">
                    S
                  </td>
                  <td style="padding-left: 14px;">
                    <div style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      PropLedger <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.3); margin-left: 4px; vertical-align: middle;">SUPPORT DESK</span>
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                      support@propledger.vishalbhutekar.me
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; background-color: rgba(14, 165, 233, 0.12); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.25);">
                &bull; Inbound Inquiry
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0e14; border: 1px solid #1e293b; border-radius: 22px; overflow: hidden;">
          <tr>
            <td style="padding: 24px 28px 20px 28px;">
              <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                Resident Inquiry Ticket
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                ${subject}
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                From: <strong style="color: #f1f5f9;">${senderName}</strong> &bull; <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8;">${senderEmail}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px;">
              <div style="border-top: 1px dashed #242d3d; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 22px 28px;">
              <div style="background-color: #141a26; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); padding: 18px 20px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                  Message Content
                </div>
                <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">
${message}
                </div>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${senderEmail}?subject=Re: [PropLedger Support] ${encodeURIComponent(subject)}" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                  Reply to ${senderName} &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 20px 36px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace;">
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
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #0c1017; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #141923; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
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

    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0e14; border: 1px solid #1e293b; border-radius: 22px; overflow: hidden;">
          <tr>
            <td style="padding: 24px 28px 20px 28px;">
              <div style="font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                September 2026 Billing Statement
              </div>
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em;">
                ${invoiceNumber}
              </div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                ${property}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 28px;">
              <div style="border-top: 1px dashed #242d3d; height: 1px; width: 100%;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #141a26; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                      Resident & Account Summary
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 3px 0; color: #64748b; width: 110px;">Tenant:</td>
                        <td style="padding: 3px 0; color: #ffffff; font-weight: 600;">${tenant}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #64748b;">Due Date:</td>
                        <td style="padding: 3px 0; color: #f1f5f9; font-family: 'JetBrains Mono', monospace;">October 01, 2026</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #64748b;">Master Admin:</td>
                        <td style="padding: 3px 0; color: #818cf8; font-family: 'JetBrains Mono', monospace;">vishal.bhutekar1@gmail.com</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.25);">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.06em;">
                      Total Payable
                    </div>
                    <div style="font-size: 24px; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">
                      ${amount}
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

    <tr>
      <td style="padding: 0 32px 28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(14, 165, 233, 0.08); border-radius: 18px; border: 1px solid rgba(14, 165, 233, 0.2);">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    <strong style="color: #38bdf8;">Need assistance?</strong> Submit inquiries directly to <a href="mailto:support@propledger.vishalbhutekar.me" style="color: #38bdf8; text-decoration: none; font-weight: 600; font-family: 'JetBrains Mono', monospace;">support@propledger.vishalbhutekar.me</a>.
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

  // Serve Single Page Web Application
  return new Response(renderWebPage(url.hostname), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

function renderWebPage(hostname) {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger | Modern Property Operations & Financial Ledger</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', sans-serif; background-color: #0b0e14; color: #f8fafc; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .swish-card { background: #121722; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 28px; }
    .swish-inner { background: #0a0d13; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; }
    .pill-tab { border-radius: 9999px; transition: all 0.2s ease; }
    .pill-tab:hover { background-color: rgba(255, 255, 255, 0.08); }
    .dashed-split { border-top: 1px dashed rgba(255, 255, 255, 0.12); }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-indigo-500 selection:text-white pb-28">

  <!-- Swish / BookMyShow Clean Pill Header -->
  <header class="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      
      <!-- Brand Logo Chip -->
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/30">
          P
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-xl tracking-tight text-white">PropLedger</span>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wider">ENTERPRISE</span>
          </div>
          <p class="text-[11px] text-slate-400 font-mono tracking-tight">${hostname}</p>
        </div>
      </div>

      <!-- Quick Action Navigation Pills -->
      <div class="flex items-center gap-2 sm:gap-3">
        <a href="#support-desk" class="pill-tab text-xs font-semibold px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20">
          Support Desk
        </a>
        <a href="#dispatcher-section" class="pill-tab text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20">
          Invoice Console
        </a>
      </div>
    </div>
  </header>

  <!-- Content Container -->
  <main class="max-w-6xl mx-auto px-6 pt-10 space-y-10">

    <!-- Hero Card (BookMyShow / Swish Rounded Style) -->
    <div class="swish-card p-8 sm:p-12 relative overflow-hidden shadow-2xl">
      <div class="max-w-3xl space-y-4 relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Cloudflare Edge Subdomain Active
        </div>

        <h1 class="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Property Management & Financial Subledger
        </h1>

        <p class="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
          High-performance rental operations with automated recurring lease statements, double-entry payment balancing, and instant email dispatch.
        </p>

        <!-- Master Credentials Pill Box -->
        <div class="swish-inner p-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Master Administrator Account</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">SUPER ADMIN</span>
            </div>
            <p class="text-sm font-mono text-white">vishal.bhutekar1@gmail.com</p>
            <p class="text-xs text-slate-400">Direct Inquiries: <span class="text-sky-400 font-mono">support@propledger.vishalbhutekar.me</span></p>
          </div>
          <div class="bg-black/40 px-4 py-2.5 rounded-2xl border border-white/5 text-xs font-mono text-slate-300 self-start sm:self-auto">
            Password: <strong class="text-white">Vishal@1233</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Quick Stats Chips (Swish / BookMyShow rounded-2xl format) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="swish-card p-6">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Subdomain</p>
        <p class="text-lg font-black text-white mt-1">propledger</p>
        <p class="text-xs text-sky-400 font-mono mt-1">vishalbhutekar.me</p>
      </div>

      <div class="swish-card p-6">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbound Support</p>
        <p class="text-lg font-black text-white mt-1">support@</p>
        <p class="text-xs text-emerald-400 font-mono mt-1">Auto-Forwarding</p>
      </div>

      <div class="swish-card p-6">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Core</p>
        <p class="text-lg font-black text-white mt-1">PostgreSQL 16</p>
        <p class="text-xs text-indigo-400 font-mono mt-1">12 Migrations</p>
      </div>

      <div class="swish-card p-6">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mail Routing</p>
        <p class="text-lg font-black text-white mt-1">Resend API</p>
        <p class="text-xs text-purple-400 font-mono mt-1">DKIM & SPF Live</p>
      </div>
    </div>

    <!-- Support Desk Form (BookMyShow clean card style) -->
    <div id="support-desk" class="swish-card p-8 sm:p-10 border border-sky-500/20 space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-white/5">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-black text-white">Support & Resident Concierge</h2>
            <p class="text-xs text-slate-400">Emails submitted to <span class="text-sky-400 font-mono font-medium">support@propledger.vishalbhutekar.me</span> forward directly to <span class="text-white font-mono">vishal.bhutekar1@gmail.com</span></p>
          </div>
        </div>
        <span class="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          Forwarding Active
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sender Name</label>
          <input id="supName" type="text" value="Resident Inquirer" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Email</label>
          <input id="supEmail" type="email" value="resident@example.com" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-sky-500 focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
        <input id="supSubject" type="text" value="Inquiry Regarding September Lease Statement INV-202609-00001" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
        <textarea id="supMessage" rows="3" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">Hello, I would like to inquire about the scheduled HVAC inspection for Unit 402.</textarea>
      </div>

      <button id="supBtn" onclick="submitSupportQuery()" class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Send Query to support@propledger.vishalbhutekar.me</span>
      </button>

      <div id="supStatus" class="hidden p-4 rounded-2xl border text-xs leading-relaxed font-mono"></div>
    </div>

    <!-- Dispatcher & Volumes Row -->
    <div id="dispatcher-section" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Dispatcher Ticket Card -->
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
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Email</label>
            <input id="emailInput" type="email" value="vishal.bhutekar1@gmail.com" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice #</label>
              <input id="invNumber" type="text" value="INV-202609-00001" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount</label>
              <input id="invAmount" type="text" value="$3,250.00" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property Asset</label>
            <input id="invProperty" type="text" value="The Grand Horizon Luxury Suites - Unit 402" class="w-full bg-[#0a0d13] border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none transition">
          </div>

          <button id="sendBtn" onclick="dispatchEmail()" class="w-full py-4 px-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            <span>Dispatch Statement & Itemized Invoice</span>
          </button>

          <div id="statusResult" class="hidden p-4 rounded-2xl border text-xs leading-relaxed font-mono"></div>
        </div>
      </div>

      <!-- Engineering Handbooks Card -->
      <div class="swish-card p-8 space-y-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-3.5 pb-4 border-b border-white/5">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <h2 class="text-xl font-black text-white">Master Engineering Handbooks</h2>
              <p class="text-xs text-slate-400">10 Volumes &bull; 100 Pages Comprehensive Architectural Suite</p>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <div class="swish-inner p-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 1: Enterprise System Architecture</p>
                <p class="text-xs text-slate-400">Spring Boot, Subledger Engine, Clean Architecture</p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold">10 Pages</span>
            </div>

            <div class="swish-inner p-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 4: Concurrency & Double-Booking</p>
                <p class="text-xs text-slate-400">Pessimistic Locking &btree Exclusion Constraints</p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">10 Pages</span>
            </div>

            <div class="swish-inner p-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 5: Billing & Invoicing Engine</p>
                <p class="text-xs text-slate-400">Stripe Webhooks, Resend Integration, Ledger Posting</p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono font-semibold">10 Pages</span>
            </div>

            <div class="swish-inner p-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 8: Analytics & SQL Window Engine</p>
                <p class="text-xs text-slate-400">Rent Roll, Aging AR, 12-Month Property P&L</p>
              </div>
              <span class="text-xs px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono font-semibold">10 Pages</span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-white/5 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-mono">&copy; 2026 PropLedger Technologies</span>
          <a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="pill-tab text-xs text-indigo-400 hover:text-indigo-300 font-bold px-3 py-1.5 border border-indigo-500/30">
            GitHub Repo &rarr;
          </a>
        </div>
      </div>
    </div>
  </main>

  <script>
    async function submitSupportQuery() {
      const btn = document.getElementById('supBtn');
      const statusBox = document.getElementById('supStatus');
      const name = document.getElementById('supName').value;
      const email = document.getElementById('supEmail').value;
      const subject = document.getElementById('supSubject').value;
      const message = document.getElementById('supMessage').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Routing to vishal.bhutekar1@gmail.com...';
      statusBox.className = 'p-4 rounded-2xl border border-sky-500/30 bg-sky-950/40 text-sky-300 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to Cloudflare edge support mail routing...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: name, senderEmail: email, subject: subject, message: message })
        });

        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Query Forwarded!</strong><br>Forwarded To: ' + data.forwardedTo + '<br>Target Address: ' + data.targetEmail + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Routing Status:</strong> ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-2xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = '<strong>Transmission Error:</strong> ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Send Query to support@propledger.vishalbhutekar.me</span>';
      }
    }

    async function dispatchEmail() {
      const btn = document.getElementById('sendBtn');
      const statusBox = document.getElementById('statusResult');
      const email = document.getElementById('emailInput').value;
      const invNum = document.getElementById('invNumber').value;
      const amount = document.getElementById('invAmount').value;
      const property = document.getElementById('invProperty').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Dispatching via Resend API...';
      statusBox.className = 'p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to Resend transactional mail engine at edge...';

      try {
        const resp = await fetch('/api/send-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: email,
            invoiceNumber: invNum,
            amount: amount,
            property: property,
            tenant: 'Vishal Bhutekar'
          })
        });

        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email + '<br>Statement: ' + invNum;
        } else {
          statusBox.className = 'p-4 rounded-2xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Response:</strong> ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-2xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
        statusBox.innerHTML = '<strong>Transmission Error:</strong> ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Dispatch Statement & Itemized Invoice</span>';
      }
    }
  </script>
</body>
</html>`;
}
