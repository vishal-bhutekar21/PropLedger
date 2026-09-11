/**
 * PropLedger Enterprise - Cloudflare Worker & Edge Mail Routing
 * Host Subdomain: propledger.vishalbhutekar.me / porpledger.vishalbhutekar.me
 * Support Email: support@propledger.vishalbhutekar.me -> vishal.bhutekar1@gmail.com
 * Zone ID: 84d04451d623e1d6885d01c55a89ce3a
 */

// Resend API Key is supplied via Cloudflare Worker Secret Binding or injected during deployment
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

  // API: Support Query Forwarding to vishal.bhutekar1@gmail.com
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
</head>
<body style="margin:0; padding:32px 16px; background-color:#07090e; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#e2e8f0; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; margin:0 auto; background-color:#0f1523; border:1px solid #1e293b; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px -15px rgba(0,0,0,0.8);">
    <tr>
      <td style="padding:32px 36px 24px 36px; border-bottom:1px solid #1e293b; background:linear-gradient(180deg, #131b2e 0%, #0f1523 100%);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:34px; height:34px; background:linear-gradient(135deg, #0284c7 0%, #2563eb 100%); border-radius:8px; text-align:center; vertical-align:middle; color:#ffffff; font-weight:800; font-size:16px; line-height:34px;">
                    S
                  </td>
                  <td style="padding-left:12px;">
                    <div style="font-size:16px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                      PropLedger <span style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; background-color:rgba(14,165,233,0.15); color:#38bdf8; border:1px solid rgba(14,165,233,0.3); margin-left:4px; vertical-align:middle;">SUPPORT DESK</span>
                    </div>
                    <div style="font-size:11px; color:#64748b; font-family:ui-monospace, monospace; margin-top:2px;">
                      support@propledger.vishalbhutekar.me
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align:right;">
              <span style="display:inline-block; padding:4px 10px; border-radius:9999px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; background-color:rgba(14,165,233,0.1); color:#38bdf8; border:1px solid rgba(14,165,233,0.25);">
                Forwarded via Edge
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 36px 28px 36px;">
        <h2 style="margin:0 0 6px 0; font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.02em;">
          New Resident Inquiry
        </h2>
        <p style="margin:0 0 24px 0; font-size:13px; color:#94a3b8; line-height:1.6;">
          A resident or prospective client has submitted an inquiry to <strong>support@propledger.vishalbhutekar.me</strong>.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#090d16; border:1px solid #1e293b; border-radius:10px; margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">
                <tr>
                  <td style="padding:4px 0; color:#64748b; width:130px;">Sender Name:</td>
                  <td style="padding:4px 0; color:#f1f5f9; font-weight:600;">${senderName}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#64748b;">Sender Email:</td>
                  <td style="padding:4px 0; color:#38bdf8; font-family:ui-monospace, monospace;">${senderEmail}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#64748b;">Subject:</td>
                  <td style="padding:4px 0; color:#f1f5f9; font-weight:600;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#64748b;">Routing Node:</td>
                  <td style="padding:4px 0; color:#94a3b8; font-family:ui-monospace, monospace;">Cloudflare Edge (${colo})</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div style="background-color:#090d16; border-left:3px solid #0284c7; border:1px solid #1e293b; border-left-color:#0284c7; border-radius:8px; padding:18px 20px; margin-bottom:28px;">
          <div style="font-size:11px; font-weight:700; color:#38bdf8; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px;">
            Inquiry Message
          </div>
          <div style="font-size:13px; color:#e2e8f0; line-height:1.6; white-space:pre-wrap;">
${message}
          </div>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <a href="mailto:${senderEmail}?subject=Re: [PropLedger Support] ${encodeURIComponent(subject)}" style="display:inline-block; background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:8px; font-weight:600; font-size:13px; box-shadow:0 4px 12px rgba(2,132,199,0.35);">
                Reply to ${senderName} &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 36px; background-color:#090d16; border-top:1px solid #1e293b; text-align:center;">
        <p style="margin:0; font-size:11px; color:#475569; font-family:ui-monospace, monospace;">
          PropLedger Technologies &bull; Automated Edge Forwarding to vishal.bhutekar1@gmail.com
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
</head>
<body style="margin:0; padding:32px 16px; background-color:#07090e; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#e2e8f0; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; margin:0 auto; background-color:#0f1523; border:1px solid #1e293b; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px -15px rgba(0,0,0,0.8);">
    <tr>
      <td style="padding:32px 36px 24px 36px; border-bottom:1px solid #1e293b; background:linear-gradient(180deg, #131b2e 0%, #0f1523 100%);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:34px; height:34px; background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius:8px; text-align:center; vertical-align:middle; color:#ffffff; font-weight:800; font-size:16px; line-height:34px;">
                    P
                  </td>
                  <td style="padding-left:12px;">
                    <div style="font-size:16px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                      PropLedger <span style="font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; background-color:rgba(99,102,241,0.15); color:#818cf8; border:1px solid rgba(99,102,241,0.3); margin-left:4px; vertical-align:middle;">STATEMENT</span>
                    </div>
                    <div style="font-size:11px; color:#64748b; font-family:ui-monospace, monospace; margin-top:2px;">
                      ${invoiceNumber}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align:right;">
              <span style="display:inline-block; padding:4px 10px; border-radius:9999px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; background-color:rgba(16,185,129,0.1); color:#34d399; border:1px solid rgba(16,185,129,0.25);">
                Due Oct 01, 2026
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 36px 28px 36px;">
        <h2 style="margin:0 0 6px 0; font-size:20px; font-weight:700; color:#ffffff; letter-spacing:-0.02em;">
          Monthly Rental & Operations Statement
        </h2>
        <p style="margin:0 0 24px 0; font-size:13px; color:#94a3b8; line-height:1.6;">
          Dear ${tenant}, an itemized invoice statement has been finalized for <strong>${property}</strong>.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#090d16; border:1px solid #1e293b; border-radius:10px; margin-bottom:24px;">
          <tr>
            <td style="padding:18px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;">
                <tr>
                  <td style="padding:5px 0; color:#64748b;">Primary Asset / Unit:</td>
                  <td style="padding:5px 0; color:#ffffff; font-weight:600; text-align:right;">${property}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0; color:#64748b;">Billing Cycle:</td>
                  <td style="padding:5px 0; color:#cbd5e1; font-family:ui-monospace, monospace; text-align:right;">September 2026</td>
                </tr>
                <tr>
                  <td style="padding:5px 0; color:#64748b;">Due Date:</td>
                  <td style="padding:5px 0; color:#cbd5e1; font-family:ui-monospace, monospace; text-align:right;">October 1, 2026</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 4px 0; color:#ffffff; font-weight:700; font-size:14px; border-top:1px solid #1e293b;">Total Amount Due:</td>
                  <td style="padding:12px 0 4px 0; color:#34d399; font-family:ui-monospace, monospace; font-weight:800; font-size:17px; text-align:right; border-top:1px solid #1e293b;">${amount}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr>
            <td align="center">
              <a href="https://propledger.vishalbhutekar.me/invoices" style="display:inline-block; background:linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color:#ffffff; text-decoration:none; padding:13px 34px; border-radius:8px; font-weight:600; font-size:13px; box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                Review & Settle Invoice Online &rarr;
              </a>
            </td>
          </tr>
        </table>

        <div style="background-color:rgba(14,165,233,0.06); border-left:3px solid #0ea5e9; border-radius:6px; padding:12px 16px; font-size:12px; color:#94a3b8; line-height:1.5;">
          <strong style="color:#38bdf8;">Questions?</strong> Contact the on-site operations desk at <span style="color:#e0f2fe; font-family:ui-monospace, monospace;">support@propledger.vishalbhutekar.me</span>.
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 36px; background-color:#090d16; border-top:1px solid #1e293b; text-align:center;">
        <p style="margin:0; font-size:11px; color:#475569; font-family:ui-monospace, monospace;">
          PropLedger Technologies &bull; Autonomous Property Management Subledger Engine
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
  <title>PropLedger Enterprise | Property Management & Financial Ledger</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #07090e; color: #f8fafc; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .glass-card { background: rgba(15, 21, 35, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.07); }
    .glass-card:hover { border-color: rgba(255, 255, 255, 0.12); }
    .glow-indigo { box-shadow: 0 0 60px -15px rgba(99, 102, 241, 0.25); }
    .glow-sky { box-shadow: 0 0 60px -15px rgba(14, 165, 233, 0.25); }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-indigo-500 selection:text-white pb-24">

  <!-- Header Navigation -->
  <header class="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/30">
          P
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-lg tracking-tight text-white">PropLedger</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 tracking-wider">ENTERPRISE</span>
          </div>
          <p class="text-[11px] text-slate-400 font-mono tracking-tight">${hostname}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Edge Active</span>
        </div>
        <a href="#support-desk" class="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm shadow-sky-600/20">
          Support Desk
        </a>
        <a href="#dispatcher-section" class="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/20">
          Invoice Console
        </a>
      </div>
    </div>
  </header>

  <!-- Main Hero -->
  <main class="max-w-7xl mx-auto px-6 pt-10 space-y-10">
    <div class="glass-card rounded-3xl p-8 lg:p-12 relative overflow-hidden glow-indigo">
      <div class="relative z-10 max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          Cloudflare Edge Subdomain &bull; Resend Transactional Mail
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Enterprise Property Management & Subledger Platform
        </h1>
        <p class="text-slate-300 text-base sm:text-lg leading-relaxed">
          Architected for Tier-1 real estate operations. Features PostgreSQL 16 ACID double-entry subledger engines, automated lease invoicing, and edge mail routing.
        </p>

        <!-- Credentials Bar -->
        <div class="mt-6 p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <p class="text-xs text-indigo-400 font-bold uppercase tracking-wider">Master Administrative Access</p>
            <p class="text-sm font-mono text-white">vishal.bhutekar1@gmail.com &bull; <span class="text-emerald-400 font-semibold">ROLE_SUPER_ADMIN</span></p>
            <p class="text-xs text-slate-400 font-mono">Support Channel: <span class="text-sky-400">support@propledger.vishalbhutekar.me</span></p>
          </div>
          <div class="text-xs font-mono text-slate-300 bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800 self-start sm:self-auto">
            Password: <span class="text-white font-bold">Vishal@1233</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="glass-card p-6 rounded-2xl">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Edge Subdomain</p>
        <h3 class="text-xl font-bold text-white mt-1">propledger</h3>
        <p class="text-xs text-sky-400 mt-2 font-mono flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          vishalbhutekar.me (Proxied)
        </p>
      </div>

      <div class="glass-card p-6 rounded-2xl">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbound Support</p>
        <h3 class="text-xl font-bold text-white mt-1">support@</h3>
        <p class="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Forward &rarr; vishal.bhutekar1
        </p>
      </div>

      <div class="glass-card p-6 rounded-2xl">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Engine</p>
        <h3 class="text-xl font-bold text-white mt-1">PostgreSQL 16</h3>
        <p class="text-xs text-indigo-400 mt-2 font-mono flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          12 Flyway Migrations
        </p>
      </div>

      <div class="glass-card p-6 rounded-2xl">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mail Pipeline</p>
        <h3 class="text-xl font-bold text-white mt-1">Resend + Workers</h3>
        <p class="text-xs text-purple-400 mt-2 font-mono flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          DKIM, SPF & MX Verified
        </p>
      </div>
    </div>

    <!-- Support Desk & Inquiry Section -->
    <div id="support-desk" class="glass-card rounded-3xl p-8 lg:p-10 border border-sky-500/30 glow-sky space-y-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/25 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Live Support Desk &bull; <span class="text-sky-400 font-mono">support@propledger.vishalbhutekar.me</span></h2>
            <p class="text-xs text-slate-400">Inquiries submitted here are automatically routed directly to <span class="text-slate-300 font-mono">vishal.bhutekar1@gmail.com</span></p>
          </div>
        </div>
        <span class="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 bg-sky-950/40 px-3 py-1 rounded-full border border-sky-500/30">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          Auto-Forward Active
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sender Name</label>
          <input id="supName" type="text" value="Resident Inquirer" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Email</label>
          <input id="supEmail" type="email" value="resident@example.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-sky-500 focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
        <input id="supSubject" type="text" value="Inquiry Regarding Lease Statement INV-202609-00001" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
        <textarea id="supMessage" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-sky-500 focus:outline-none transition">Hello, I have a quick question about the CAM allocation and scheduled HVAC service for Unit 402.</textarea>
      </div>

      <button id="supBtn" onclick="submitSupportQuery()" class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Send Query to support@propledger.vishalbhutekar.me</span>
      </button>

      <div id="supStatus" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
    </div>

    <!-- Invoice Dispatcher & Architecture Volumes -->
    <div id="dispatcher-section" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Dispatcher Card -->
      <div class="glass-card rounded-3xl p-8 space-y-6">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Commercial Statement Dispatcher</h2>
            <p class="text-xs text-slate-400">Trigger branded statement email with itemized charges</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recipient Email</label>
            <input id="emailInput" type="email" value="vishal.bhutekar1@gmail.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice #</label>
              <input id="invNumber" type="text" value="INV-202609-00001" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Amount</label>
              <input id="invAmount" type="text" value="$3,250.00" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none transition">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Property Asset</label>
            <input id="invProperty" type="text" value="The Grand Horizon Luxury Suites - Unit 402" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 focus:outline-none transition">
          </div>

          <button id="sendBtn" onclick="dispatchEmail()" class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            <span>Dispatch Statement & Itemized Invoice</span>
          </button>

          <div id="statusResult" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
        </div>
      </div>

      <!-- Architecture Documentation Handbooks -->
      <div class="glass-card rounded-3xl p-8 space-y-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Master Engineering Handbooks</h2>
              <p class="text-xs text-slate-400">10 Volumes &bull; 100 Pages Comprehensive Architectural Suite</p>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 1: Enterprise System Architecture</p>
                <p class="text-xs text-slate-400">Spring Boot, Subledger Engine, Clean Architecture</p>
              </div>
              <span class="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono">10 Pages</span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 4: Concurrency & Double-Booking</p>
                <p class="text-xs text-slate-400">Pessimistic Locking &btree Exclusion Constraints</p>
              </div>
              <span class="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">10 Pages</span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 5: Billing & Invoicing Engine</p>
                <p class="text-xs text-slate-400">Stripe Webhooks, Resend Integration, Ledger Posting</p>
              </div>
              <span class="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-mono">10 Pages</span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-white">Vol 8: Analytics & SQL Window Engine</p>
                <p class="text-xs text-slate-400">Rent Roll, Aging AR, 12-Month Property P&L</p>
              </div>
              <span class="text-xs px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 font-mono">10 Pages</span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-mono">&copy; 2026 PropLedger Technologies</span>
          <a href="https://github.com/vishal-bhutekar21/PropLedger" target="_blank" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            GitHub Repository &rarr;
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
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Forwarding to vishal.bhutekar1@gmail.com...';
      statusBox.className = 'p-4 rounded-xl border border-sky-500/30 bg-sky-950/40 text-sky-300 block text-xs leading-relaxed font-mono';
      statusBox.innerHTML = 'Connecting to Cloudflare edge support mail routing...';

      try {
        const resp = await fetch('/api/support-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: name, senderEmail: email, subject: subject, message: message })
        });

        const data = await resp.json();
        if (data.success) {
          statusBox.className = 'p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Support Query Successfully Forwarded!</strong><br>Forwarded to: ' + data.forwardedTo + '<br>Target Address: ' + data.targetEmail + '<br>Message ID: ' + (data.messageId || 'OK');
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Routing Status:</strong> ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
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
      statusBox.className = 'p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 block text-xs leading-relaxed font-mono';
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
          statusBox.className = 'p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Successfully Delivered!</strong><br>Message ID: ' + (data.messageId || 'OK') + '<br>Recipient: ' + email + '<br>Statement: ' + invNum;
        } else {
          statusBox.className = 'p-4 rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300 block text-xs leading-relaxed font-mono';
          statusBox.innerHTML = '<strong>Email Response:</strong> ' + JSON.stringify(data);
        }
      } catch (e) {
        statusBox.className = 'p-4 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 block text-xs leading-relaxed font-mono';
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
