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


const PAYMENT_SUCCESS_LOTTIE = {"v":"5.7.4","fr":60,"ip":0,"op":60,"w":120,"h":120,"nm":"Payment Success","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Checkmark","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,60,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":15,"s":[70,70,100],"h":0},{"t":35,"s":[110,110,100],"h":0},{"t":45,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CheckGroup","it":[{"ty":"sh","nm":"Path","ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-18,1],[-5,14],[18,-9]],"c":false}}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.06,0.65,0.58,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":6.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":15,"s":[0],"h":0},{"t":38,"s":[100],"h":0}]},"o":{"a":0,"k":0},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Circle","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,60,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":0,"s":[75,75,100],"h":0},{"t":25,"s":[106,106,100],"h":0},{"t":35,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CircleGroup","it":[{"ty":"el","nm":"Ellipse","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[88,88]}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.06,0.65,0.58,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":5.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"h":0},{"t":26,"s":[100],"h":0}]},"o":{"a":0,"k":-90},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0}]};
const TOUR_SUCCESS_LOTTIE = {"v":"5.7.4","fr":60,"ip":0,"op":60,"w":120,"h":120,"nm":"Tour Success","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Checkmark","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,65,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":20,"s":[60,60,100],"h":0},{"t":38,"s":[110,110,100],"h":0},{"t":48,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CheckGroup","it":[{"ty":"sh","nm":"Path","ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0]],"v":[[-14,0],[-4,10],[14,-8]],"c":false}}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.14,0.39,0.92,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":5.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":20,"s":[0],"h":0},{"t":42,"s":[100],"h":0}]},"o":{"a":0,"k":0},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Calendar","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[60,60,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":0,"s":[80,80,100],"h":0},{"t":20,"s":[104,104,100],"h":0},{"t":30,"s":[100,100,100],"h":0}]}},"ao":0,"shapes":[{"ty":"gr","nm":"CalGroup","it":[{"ty":"rc","nm":"CalRect","p":{"a":0,"k":[0,5]},"s":{"a":0,"k":[64,56]},"r":{"a":0,"k":8}},{"ty":"st","nm":"Stroke","c":{"a":0,"k":[0.14,0.39,0.92,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":4.5},"lc":2,"lj":2},{"ty":"tm","nm":"Trim","s":{"a":0,"k":0},"e":{"a":1,"k":[{"t":0,"s":[0],"h":0},{"t":24,"s":[100],"h":0}]},"o":{"a":0,"k":0},"m":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0}]};

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
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  return new Response(renderHomePage(hostname), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

// 1. PUBLIC WEBSITE: propledger.vishalbhutekar.me (Koshpal Aesthetic)
function renderHomePage(hostname) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PropLedger – Simple, Modern Property Management & Online Rent</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #ffffff; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    /* Koshpal Signature Blueprint Grid Background */
    .koshpal-bg {
      background-color: #15337C !important;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(180deg, #15337C 0%, #173B8D 45%, #1D45A3 100%) !important;
      background-size: 48px 48px, 48px 48px, 100% 100% !important;
      background-repeat: repeat, repeat, no-repeat !important;
    }
    .koshpal-bg-light {
      background-color: #1D45A3 !important;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(180deg, #1D45A3 0%, #2546A6 100%) !important;
      background-size: 48px 48px, 48px 48px, 100% 100% !important;
      background-repeat: repeat, repeat, no-repeat !important;
    }
    .koshpal-footer-bg {
      background-color: #15337C !important;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(180deg, #1D45A3 0%, #0F2356 60%, #0B1B3D 100%) !important;
      background-size: 48px 48px, 48px 48px, 100% 100% !important;
      background-repeat: repeat, repeat, no-repeat !important;
    }

    /* Koshpal Signature Cards */
    .koshpal-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 28px;
      box-shadow: 0 10px 30px -4px rgba(16, 24, 40, 0.06), 0 4px 10px -2px rgba(16, 24, 40, 0.03);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .koshpal-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 40px -6px rgba(16, 24, 40, 0.1), 0 6px 16px -3px rgba(16, 24, 40, 0.04);
    }
    .pill-btn { border-radius: 9999px; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    .pill-btn:hover { transform: translateY(-1.5px); }
    
    @keyframes bounceSlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-bounce-slow {
      animation: bounceSlow 3.5s ease-in-out infinite;
    }
    .active-tab { background-color: #2546A6; color: #ffffff !important; box-shadow: 0 4px 14px 0 rgba(37, 70, 166, 0.35); }
    .inactive-tab { background-color: #f1f5f9; color: #475569; }
    .inactive-tab:hover { background-color: #e2e8f0; color: #0f172a; }
  </style>
</head>
<body class="min-h-screen antialiased bg-white text-slate-900 pb-28">

  <!-- Floating Toast Notification System -->
  <div id="toastContainer" class="fixed top-6 right-6 z-[80] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0"></div>

  <!-- Floating Capsule Navigation Bar -->
  <div class="fixed top-5 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
    <header class="pointer-events-auto w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-full px-5 sm:px-8 py-3.5 shadow-[0_12px_36px_-4px_rgba(16,24,40,0.12),0_4px_12px_-2px_rgba(16,24,40,0.06)] flex items-center justify-between border border-slate-100 transition-all">
      
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-3 group">
        <svg class="w-8 h-8 group-hover:scale-105 transition-transform flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="11" height="11" rx="5.5" fill="#15337C" />
          <rect x="17" y="4" width="11" height="11" rx="5.5" fill="#2563EB" />
          <rect x="4" y="17" width="11" height="11" rx="5.5" fill="#00A896" />
          <rect x="17" y="17" width="11" height="11" rx="5.5" fill="#38BDF8" />
        </svg>
        <div>
          <span class="font-black text-xl tracking-tight text-[#111827]">PropLedger</span>
          <p class="text-[11px] text-slate-500 font-medium tracking-tight -mt-0.5 hidden sm:block">Seamless Property Operations</p>
        </div>
      </a>

      <!-- Center Desktop Navigation Links (No wrapping, perfect spacing) -->
      <nav class="hidden lg:flex items-center gap-6">
        <a href="#overview" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Overview</a>
        <a href="#what-we-do" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Features</a>
        <a href="#how-it-works" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">How It Works</a>
        <a href="#dual-experience" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Live Portals</a>
        <a href="#unit-gallery" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Apartments</a>
        <a href="#security" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">Security</a>
        <a href="#faq" class="text-xs font-semibold text-slate-700 hover:text-[#2546A6] transition">FAQs</a>
      </nav>

      <!-- Right Actions (Pay Rent + Tour / Mobile Toggle) -->
      <div class="flex items-center gap-2.5">
        <a href="#unit-gallery" class="hidden sm:inline-flex pill-btn px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition">
          Browse Units
        </a>
        <button onclick="openPaymentModal()" class="pill-btn px-5 sm:px-6 py-2.5 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 transition flex items-center gap-2">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span>Pay Rent</span>
        </button>

        <!-- Mobile Hamburger Toggle -->
        <button id="mobileNavBtn" onclick="toggleMobileNav()" class="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none" aria-label="Toggle Navigation Menu">
          <svg id="hamburgerIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg id="closeNavIcon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </header>
  </div>

  <!-- Mobile Navigation Drawer Dropdown -->
  <div id="mobileNavDrawer" class="fixed inset-x-4 top-24 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 hidden lg:hidden transition-all duration-300 transform scale-95 opacity-0">
    <div class="grid grid-cols-2 gap-3 text-xs font-bold">
      <a href="#overview" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Overview</a>
      <a href="#what-we-do" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Features</a>
      <a href="#how-it-works" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">How It Works</a>
      <a href="#dual-experience" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Live Portals</a>
      <a href="#unit-gallery" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Apartments</a>
      <a href="#security" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">Security</a>
      <a href="#roi-calculator" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">ROI Calculator</a>
      <a href="#faq" onclick="toggleMobileNav()" class="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-[#2546A6] text-slate-800 transition">FAQs</a>
    </div>
    <div class="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
      <button onclick="toggleMobileNav(); openPaymentModal();" class="w-full py-3 rounded-2xl bg-[#2546A6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        <span>Pay Rent Online</span>
      </button>
      <a href="#unit-gallery" onclick="toggleMobileNav()" class="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-center font-bold text-xs hover:bg-slate-50 transition">
        Browse Available Apartments &rarr;
      </a>
    </div>
  </div>

  <!-- HERO SECTION (Koshpal Deep Royal Blue Blueprint Canvas & Signature Card Composition) -->
  <section id="overview" class="relative koshpal-bg pt-32 pb-24 sm:pb-32 px-6 overflow-hidden">
    <!-- Open-Source Architectural Glass High-Rise Background (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" alt="Modern Architecture" class="w-full h-full object-cover object-center opacity-15 mix-blend-luminosity filter saturate-150 transform scale-105">
      <div class="absolute inset-0 bg-gradient-to-b from-[#15337C]/85 via-[#15337C]/75 to-[#15337C]"></div>
    </div>
    <!-- Glowing Radial Light Orbs -->
    <div class="absolute -top-24 -right-24 w-[600px] h-[600px] bg-gradient-to-br from-[#00A896]/25 via-[#2563EB]/25 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
      
      <!-- Left Column: Typography & CTAs -->
      <div class="lg:col-span-7 space-y-6 text-left">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Enterprise Cloud Platform &bull; <strong class="text-[#38BDF8]">99.9% Uptime SLA</strong></span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          Financial wellbeing,<br>
          <span class="text-white">built for your properties</span>
        </h1>

        <p class="text-blue-100/90 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
          PropLedger delivers privacy-first, automated lease tracking and subledger reconciliation, designed to boost portfolio NOI and financial clarity for real estate operators.
        </p>

        <div class="flex flex-wrap items-center gap-3.5 pt-2">
          <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Portfolio Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-8 py-4 bg-white hover:bg-slate-50 text-[#15337C] font-extrabold text-sm shadow-xl shadow-blue-950/30 flex items-center gap-2 transition">
            <span>Request a Demo</span>
            <span>&rarr;</span>
          </button>
          <a href="#dual-experience" class="pill-btn px-7 py-4 border-2 border-white/30 hover:border-white text-white font-bold text-sm backdrop-blur-sm transition flex items-center gap-2">
            <span>Explore Dual Portal &darr;</span>
          </a>
        </div>

        <!-- Trust Badges -->
        <div class="pt-4 flex flex-wrap items-center gap-6 text-xs text-blue-100/80 font-medium">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#00A896]/30 text-[#2DD4BF] flex items-center justify-center font-bold text-[11px]">&check;</span>
            <span>Zero Double-Bookings</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[11px]">&check;</span>
            <span>Automated Monthly Billing</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center font-bold text-[11px]">&check;</span>
            <span>Instant Online Rent Payments</span>
          </div>
        </div>
      </div>

      <!-- Right Column: The Signature Koshpal 3-Card Stack -->
      <div class="lg:col-span-5 relative space-y-4">
        
        <!-- Top Row: Quarter Circle Graphic + White Stat Card -->
        <div class="grid grid-cols-12 gap-4 items-end">
          
          <!-- Quarter-Circle Graphic Card with Glowing Up-Trend Badge -->
          <div class="col-span-5 h-[220px] rounded-tl-[140px] rounded-tr-3xl rounded-b-3xl bg-[#1E3E8F] border border-white/15 p-5 relative flex items-start justify-end shadow-2xl overflow-hidden">
            <div class="w-13 h-13 rounded-full bg-[#0B1E48] border border-white/20 text-[#2DD4BF] p-3 shadow-lg animate-bounce-slow flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>

          <!-- 85% / 99.2% Stat Card (Clean White Koshpal Style) -->
          <div class="col-span-7 bg-white rounded-[28px] p-6 shadow-2xl space-y-2 border border-slate-100">
            <div class="text-5xl font-black text-slate-900 tracking-tight">
              99.2%
            </div>
            <p class="text-xs text-slate-600 font-medium leading-snug">
              on-time rent collection rate reported across portfolio units
            </p>
            <!-- Cyan Progress Bar -->
            <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
              <div class="w-[94%] h-full bg-[#00A896] rounded-full"></div>
            </div>
          </div>

        </div>

        <!-- Bottom Executive Cutout Card (Koshpal Dark Navy Banner) -->
        <div class="rounded-[28px] p-6 bg-[#0B1D47]/95 backdrop-blur-md border border-white/15 text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div class="space-y-1.5 max-w-[280px] z-10">
            <div class="w-8 h-0.5 bg-blue-400 mb-2"></div>
            <p class="text-[10px] uppercase font-bold tracking-wider text-blue-200">Designed for properties, not spreadsheets</p>
            <h4 class="text-base font-bold text-white leading-snug">
              Reduce vacancy stress. Improve portfolio performance.
            </h4>
          </div>
          <!-- Person cutout preview / architectural emblem -->
          <div class="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 shadow-inner flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" alt="Executive" class="w-full h-full object-cover">
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- SECTION 2: WHY PRIORITIZING OPERATIONS MATTERS (Koshpal Blue Section with Donut Cards) -->
  <section id="why-it-matters" class="koshpal-bg-light py-20 px-6 text-white text-center relative">
    <div class="max-w-4xl mx-auto space-y-4 mb-12">
      <h2 class="text-3xl sm:text-5xl font-black tracking-tight">
        Why prioritizing property financial health matters
      </h2>
      <p class="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
        We turn chaotic leases into reliable cashflow with collision-free dates, automated digital statements, and instant online rent payments.
      </p>
    </div>

    <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      <!-- Card 1 -->
      <div class="bg-[#F0F4FA] rounded-[32px] p-8 sm:p-10 text-slate-900 shadow-xl flex items-center justify-between gap-6">
        <div class="space-y-3">
          <h3 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
            Save up to 70% in operating costs compared to traditional property software
          </h3>
          <p class="text-xs text-slate-500 font-medium">Independent Property Management Operations Study</p>
        </div>
        <!-- Donut Ring Chart Graphic -->
        <div class="w-16 h-16 rounded-full border-8 border-[#2563EB] border-t-[#00A896] border-r-[#00A896] flex-shrink-0"></div>
      </div>

      <!-- Card 2 -->
      <div class="bg-[#F0F4FA] rounded-[32px] p-8 sm:p-10 text-slate-900 shadow-xl flex items-center justify-between gap-6">
        <div class="space-y-3">
          <h3 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-snug">
            Zero double-bookings with smart automated calendar protection
          </h3>
          <p class="text-xs text-slate-500 font-medium">PropLedger Automated Booking Guarantee</p>
        </div>
        <!-- Donut Ring Chart Graphic -->
        <div class="w-16 h-16 rounded-full border-8 border-[#00A896] border-t-[#2563EB] flex-shrink-0"></div>
      </div>
    </div>
  </section>

  <!-- SECTION 3: WHAT MAKES US DIFFERENT (4 Koshpal Signature Pastel Cards) -->
  <section id="what-we-do" class="py-24 px-6 bg-white">
    <div class="max-w-6xl mx-auto space-y-12">
      
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#2546A6] text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-[#00A896]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          <span>What Makes Us Different</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Help landlords and tenants take control of rental finances
        </h2>
        <p class="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          PropLedger replaces messy spreadsheets and paper receipts with smart booking protection, clear financial records, and effortless online rent payments.
        </p>
      </div>

      <!-- The 4 Koshpal Pastel Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Pastel 1: Soft Mint Green -->
        <div class="rounded-[28px] p-8 bg-[#E8F5E9] border border-emerald-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-emerald-950">Privacy-First Technology</h3>
          <p class="text-xs text-emerald-900/80 leading-relaxed">
            Your financial data is completely protected. We use bank-grade 256-bit encryption and never share sensitive banking credentials.
          </p>
        </div>

        <!-- Pastel 2: Soft Rose / Coral -->
        <div class="rounded-[28px] p-8 bg-[#FDE8E8] border border-rose-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <h3 class="text-lg font-bold text-rose-950">Real-time Insights</h3>
          <p class="text-xs text-rose-900/80 leading-relaxed">
            Auto-capture lease transitions and billing dispatches so you never miss a payment or accidentally let an apartment sit vacant.
          </p>
        </div>

        <!-- Pastel 3: Soft Ice Blue -->
        <div class="rounded-[28px] p-8 bg-[#E0E7FF] border border-indigo-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <h3 class="text-lg font-bold text-indigo-950">Automated Settlement</h3>
          <p class="text-xs text-indigo-900/80 leading-relaxed">
            Fast, secure 1-click rent payments via bank transfer or credit/debit card with instant digital receipts.
          </p>
        </div>

        <!-- Pastel 4: Soft Amber / Gold -->
        <div class="rounded-[28px] p-8 bg-[#FEF3C7] border border-amber-200/50 space-y-4 hover:-translate-y-1.5 transition-all shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-700/20">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
          </div>
          <h3 class="text-lg font-bold text-amber-950">ROI Tracking</h3>
          <p class="text-xs text-amber-900/80 leading-relaxed">
            See your monthly rental income, track property expenses, and view your profits at a glance with zero manual math.
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- SECTION 4: HOW PROPLEDGER WORKS? (3-Step Process) -->
  <section id="how-it-works" class="py-24 px-6 bg-slate-50 border-y border-slate-200/80 relative overflow-hidden">
    <!-- Subtle Ambient Blueprint Dot Matrix & Light Accents -->
    <div class="absolute inset-0 pointer-events-none opacity-40" style="background-image: radial-gradient(#2546A6 0.75px, transparent 0.75px); background-size: 24px 24px;"></div>
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none"></div>
    <div class="max-w-6xl mx-auto space-y-12">
      
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How PropLedger works?
        </h2>
        <p class="text-xs sm:text-sm text-slate-500">Getting started takes less than 2 minutes. No training or technical experience required.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div class="koshpal-card p-8 space-y-4 bg-white">
          <div class="text-xs font-black uppercase text-[#2546A6] tracking-wider font-bold">Step 1</div>
          <h3 class="text-2xl font-black text-[#15337C]">Set Up Instantly</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Go live in just one minute. Add your building name (e.g. "The Grand Horizon"), list apartment units, and set monthly base rents.
          </p>
        </div>

        <div class="koshpal-card p-8 space-y-4 bg-white">
          <div class="text-xs font-black uppercase text-[#00A896] tracking-wider font-bold">Step 2</div>
          <h3 class="text-2xl font-black text-[#15337C]">Engage Every Tenant</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Tenants receive clean, itemized statements via email on the 1st of every month with a 1-click button to pay with ACH or Card.
          </p>
        </div>

        <div class="koshpal-card p-8 space-y-4 bg-white">
          <div class="text-xs font-black uppercase text-[#2563EB] tracking-wider font-bold">Step 3</div>
          <h3 class="text-2xl font-black text-[#15337C]">Reconcile on Autopilot</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Every payment is logged automatically with instant digital receipts, updated statements, and zero manual bookkeeping.
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- SECTION 5: INTERACTIVE DUAL EXPERIENCE SWITCHER (LANDLORD VS RESIDENT) -->
  <section id="dual-experience" class="py-24 px-6 max-w-6xl mx-auto space-y-8">
    <div class="koshpal-card p-8 sm:p-12 space-y-8 bg-gradient-to-b from-white to-slate-50/70 border border-slate-200">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-[#2546A6] text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span>Interactive App Experience</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Experience Both Sides of PropLedger</h2>
        <p class="text-xs sm:text-sm text-slate-500">Toggle between the Landlord Management Console and the Resident Portal below.</p>
        
        <!-- Toggle Switcher -->
        <div class="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200 gap-2 mt-4">
          <button onclick="switchExperience('landlord')" id="tabBtnLandlord" class="pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
            <span>Landlord Experience</span>
          </button>
          <button onclick="switchExperience('tenant')" id="tabBtnTenant" class="pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Resident & Tenant Portal</span>
          </button>
        </div>
      </div>

      <!-- VIEW A: LANDLORD CONSOLE PREVIEW -->
      <div id="viewLandlord" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium block">Total Monthly Rent Collected</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-slate-900 tabular-nums">$128,450.00</span>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+8.4%</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Settled via Automated ACH</p>
          </div>

          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium block">Occupancy Rate</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-slate-900 tabular-nums">99.2%</span>
              <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">402 / 405 Units</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Only 3 units available</p>
          </div>

          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span class="text-xs text-slate-500 font-medium block">Double-Booking Collision Rate</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-2xl font-black text-[#2546A6] tabular-nums">0.00%</span>
              <span class="text-xs font-bold text-[#2546A6] bg-blue-50 px-2 py-0.5 rounded-full">Protected</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Calendar locking active</p>
          </div>
        </div>

        <!-- Landlord Live Units List -->
        <div class="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 class="font-bold text-sm text-slate-900">Current Unit Roster & Lease Tracking</h4>
              <p class="text-xs text-slate-500">Real-time status of all apartments under management</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <input type="text" id="rosterSearchInput" oninput="filterRosterTable()" placeholder="Search unit, tenant, or rent..." class="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2546A6] transition">
              <button onclick="exportRentRollCsv()" class="pill-btn px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition" title="Download Excel/CSV Spreadsheet">
                <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Export CSV</span>
              </button>
              <button onclick="openAddUnitModal()" class="pill-btn px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
                <span>Add Unit</span>
              </button>
              <button onclick="dispatchBatchBills()" id="batchDispatchBtn" class="pill-btn px-4 py-2 bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Send Invoices</span>
              </button>
            </div>
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
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$1,650.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 204</td>
                  <td class="py-3 text-slate-600">2-Bed Suite</td>
                  <td class="py-3 text-slate-800 font-medium">Alex Mercer</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$2,400.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 402</td>
                  <td class="py-3 text-slate-600">Horizon Penthouse</td>
                  <td class="py-3 text-slate-800 font-medium">Alex Morgan</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$2,850.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">Active Lease</span></td>
                  <td class="py-3 text-right"><span class="text-emerald-600 font-bold">Paid (Sep 01)</span></td>
                </tr>
                <tr>
                  <td class="py-3 font-bold text-slate-900">Unit 503</td>
                  <td class="py-3 text-slate-600">Skyline Loft</td>
                  <td class="py-3 text-slate-400 italic">None (Vacant)</td>
                  <td class="py-3 font-bold text-slate-900 tabular-nums">$3,100.00</td>
                  <td class="py-3"><span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">Available Now</span></td>
                  <td class="py-3 text-right"><button onclick="openTourModal('Unit 503 &bull; Skyline Loft', '$3,100 / mo', '1,850 sq ft &bull; 2 Bed', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="text-[#2546A6] hover:underline font-bold">+ Schedule Tour</button></td>
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
          <div class="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
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
                <span class="font-bold text-[#2546A6]">October 01, 2026</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Parking Bay:</span>
                <span class="font-medium text-slate-900">Subterranean #14</span>
              </div>
            </div>

            <!-- AutoPay Quick Strip -->
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                </div>
                <div>
                  <p class="text-[11px] font-bold text-slate-900">AutoPay (1st of month)</p>
                  <p id="autopayStatusText" class="text-[10px] text-emerald-600 font-medium">Active &bull; Chase &bull;&bull;&bull;&bull;8421</p>
                </div>
              </div>
              <button id="autopayToggleBtn" onclick="toggleAutoPay()" role="switch" aria-checked="true" class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none">
                <span id="autopayToggleKnob" class="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <button onclick="openPaymentModal()" class="w-full py-3 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pay October Rent ($3,250.00)</span>
            </button>
          </div>

          <div class="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span class="text-[10px] font-bold text-[#2546A6] uppercase tracking-wider">Transparent Resident Statement</span>
                <h4 class="font-bold text-base text-slate-900">Statement #STM-202609-0402</h4>
              </div>
              <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                &bull; Reconciled & Clear
              </span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Residential Apartment Base Rent</span>
                  <span class="text-slate-500 text-[11px]">Monthly contractual rent for Penthouse Unit 402</span>
                </div>
                <span class="font-bold text-slate-900 tabular-nums self-center">$2,850.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Reserved Underground Parking Bay #14</span>
                  <span class="text-slate-500 text-[11px]">Dedicated stall with remote fob access</span>
                </div>
                <span class="font-bold text-slate-900 tabular-nums self-center">$250.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <div>
                  <span class="font-bold text-slate-800 block">Building Services & Common Maintenance</span>
                  <span class="text-slate-500 text-[11px]">Elevator upkeep, concierge desk, security</span>
                </div>
                <span class="font-bold text-slate-900 tabular-nums self-center">$150.00</span>
              </div>
            </div>

            <div class="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-xs text-slate-500 block">Total Statement Balance</span>
                <span class="text-2xl font-black text-emerald-600 tabular-nums">$3,250.00</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button onclick="openMaintenanceModal()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                  <span>Report Repair</span>
                </button>
                <button onclick="openLeaseModal()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span>View Lease</span>
                </button>
                <button onclick="downloadStatementPdf()" class="pill-btn px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>Download PDF</span>
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
  </section>

  <!-- SECTION 6: UNIT GALLERY (APARTMENTS SHOWCASE) -->
  <section id="unit-gallery" class="py-16 px-6 max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2546A6] text-xs font-bold mb-2">
          <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
          <span>The Grand Horizon Residences</span>
        </div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Featured Apartment Inventory</h2>
        <p class="text-xs sm:text-sm text-slate-500">Live inventory of premium luxury living spaces with real-time lease status.</p>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto w-full md:w-auto">
        <div class="relative">
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="unitSearchInput" oninput="filterUnitsCombined()" placeholder="Search residences..." class="pl-8 pr-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2546A6] transition w-full sm:w-44">
        </div>
        <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full border border-slate-200 overflow-x-auto">
          <button onclick="setBedroomFilter('all', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold active-tab">All</button>
          <button onclick="setBedroomFilter('studio', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Studio</button>
          <button onclick="setBedroomFilter('2bed', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">2-Bed</button>
          <button onclick="setBedroomFilter('penthouse', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Penthouse</button>
          <button onclick="setBedroomFilter('available', this)" class="bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab">Available</button>
        </div>
      </div>
    </div>
    
    <div class="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
      <span id="unitResultsCount">Showing 4 of 4 Luxury Residences</span>
      <span class="text-emerald-700 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Live Inventory Guaranteed</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Unit Card 1 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="studio">
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
            <p class="text-xs text-slate-500 font-medium mt-0.5">540 sq ft &bull; 1 Bed &bull; 1 Bath</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">$1,650</span>
            </div>
            <button onclick="openTourModal('Unit 101 &bull; Executive Urban Studio', '$1,650 / mo', '540 sq ft &bull; 1 Bed &bull; 1 Bath', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
              Schedule Tour &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Unit Card 2 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="2bed">
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
            <p class="text-xs text-slate-500 font-medium mt-0.5">1,150 sq ft &bull; 2 Bed &bull; 2 Bath</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">$2,400</span>
            </div>
            <button onclick="openTourModal('Unit 204 &bull; Modern 2-Bedroom Suite', '$2,400 / mo', '1,150 sq ft &bull; 2 Bed &bull; 2 Bath', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition">
              Schedule Tour &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Unit Card 3 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="leased" data-type="penthouse">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" alt="Horizon Penthouse" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#2546A6] backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide">
            Penthouse
          </span>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <span class="text-[11px] font-bold text-slate-500 uppercase">Unit 402 &bull; 4th Floor</span>
            <h3 class="text-base font-bold text-slate-900">Horizon Luxury Penthouse</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">2,400 sq ft &bull; 3 Bed &bull; 3 Bath</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">$2,850</span>
            </div>
            <button onclick="openTourModal('Unit 402 &bull; Horizon Luxury Penthouse', '$2,850 / mo', '2,400 sq ft &bull; 3 Bed &bull; 3 Bath', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2546A6] text-xs font-bold transition">
              Schedule Tour &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Unit Card 4 -->
      <div class="koshpal-card overflow-hidden group unit-card" data-status="available" data-type="2bed">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" alt="Skyline Loft" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wide animate-pulse">
            Available Now
          </span>
        </div>
        <div class="p-5 space-y-3">
          <div>
            <span class="text-[11px] font-bold text-slate-500 uppercase">Unit 503 &bull; 5th Floor</span>
            <h3 class="text-base font-bold text-slate-900">Panoramic Skyline Loft</h3>
            <p class="text-xs text-slate-500 font-medium mt-0.5">1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath</p>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 block">Monthly Rent</span>
              <span class="text-lg font-black text-[#2546A6] tabular-nums">$3,100</span>
            </div>
            <button onclick="openTourModal('Unit 503 &bull; Panoramic Skyline Loft', '$3,100 / mo', '1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition">
              Apply / Tour &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- SECTION 7: INTERACTIVE LANDLORD ROI CALCULATOR -->
  <section id="roi-calculator" class="py-20 px-6 max-w-6xl mx-auto relative">
    <div class="relative rounded-[36px] overflow-hidden shadow-2xl border border-slate-200/80">
      <!-- Open-Source Luxury Loft Interior Backdrop (Unsplash License) -->
      <div class="absolute inset-0 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" alt="Luxury Residence Interior" class="w-full h-full object-cover object-center opacity-15">
        <div class="absolute inset-0 bg-white/92 backdrop-blur-md"></div>
      </div>
      <div class="relative z-10 p-8 sm:p-12 space-y-8">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span>Landlord Profit & Efficiency Calculator</span>
        </div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Calculate Your Time & Money Saved</h2>
        <p class="text-xs sm:text-sm text-slate-500">See how much manual paperwork PropLedger eliminates for your rental portfolio.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        <!-- Sliders -->
        <div class="space-y-6">
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-800">
              <span>Total Units You Manage:</span>
              <span id="sliderUnitsVal" class="text-[#2546A6] font-bold text-sm tabular-nums">12 Units</span>
            </div>
            <input type="range" id="sliderUnits" min="1" max="100" value="12" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2546A6]">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>1 Unit</span>
              <span>50 Units</span>
              <span>100+ Units</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-bold text-slate-800">
              <span>Average Rent per Unit:</span>
              <span id="sliderRentVal" class="text-[#2546A6] font-bold text-sm tabular-nums">$2,200 / mo</span>
            </div>
            <input type="range" id="sliderRent" min="800" max="5000" step="50" value="2200" oninput="calculateRoi()" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2546A6]">
            <div class="flex justify-between text-[11px] text-slate-400">
              <span>$800</span>
              <span>$2,500</span>
              <span>$5,000</span>
            </div>
          </div>
        </div>

        <!-- Real-Time Metrics Output (Navy Card) -->
        <div class="p-7 sm:p-8 bg-[#0B1B3D] text-white space-y-4 rounded-[28px] shadow-xl border border-white/10">
          <span class="text-xs font-bold text-[#00A896] uppercase tracking-wider block">Estimated Automated Impact</span>
          
          <div class="space-y-3">
            <div>
              <span class="text-xs text-slate-400 block">Monthly Rental Revenue Managed:</span>
              <p id="outRevenue" class="text-2xl sm:text-3xl font-black text-white tabular-nums">$26,400 / mo</p>
            </div>
            <div class="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <span class="text-xs text-slate-400 block">Hours Saved / Month:</span>
                <p id="outHours" class="text-xl font-bold text-[#2DD4BF] tabular-nums">36 Hours</p>
              </div>
              <div>
                <span class="text-xs text-slate-400 block">Annual Savings:</span>
                <p id="outSavings" class="text-xl font-bold text-[#38BDF8] tabular-nums">$5,400 / yr</p>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-slate-400 leading-relaxed pt-2">
            Eliminates paper receipts, phone rent reminders, bank reconciliation, and spreadsheet formula repairs.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 8: COMMONLY ASKED QUESTIONS (Koshpal Exact Style) -->
  <section id="faq" class="py-20 px-6 bg-slate-50 border-t border-slate-200/80">
    <div class="max-w-4xl mx-auto space-y-8">
      
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#E0E7FF] text-[#1E3A8A] text-xs font-bold">
          <svg class="w-3.5 h-3.5 text-[#1E3A8A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>Frequently Asked Questions</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Commonly asked <span class="text-[#00A896]">questions</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500">Everything you need to know about getting started with PropLedger.</p>
      </div>

      <!-- FAQ Search Bar -->
      <div class="max-w-md mx-auto relative">
        <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="faqSearchInput" oninput="filterFaqQuestions()" placeholder="Search questions (e.g. payments, leases, deposits, AutoPay)..." class="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#2546A6] focus:ring-1 focus:ring-[#2546A6] shadow-sm transition">
      </div>

      <div class="space-y-3" id="faqAccordionList">
        
        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all" open>
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Do I need any technical or accounting skills?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            No! PropLedger was built specifically for ordinary landlords and property owners. If you can send a text or open an email, you can manage your properties in PropLedger without any issues.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How does the system stop double-booked apartments?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            PropLedger has built-in calendar protection. Once an apartment is booked for specific dates (e.g., September 1 to August 31), the system automatically locks the schedule and physically prevents any other booking for that same unit during those dates. You will never experience double-booked units.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How do tenants receive and pay their rent bills?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            On the 1st of every month, your tenants receive a friendly automated statement by email. It contains an itemized breakdown of rent, parking, and utilities, with a secure 1-click button to pay online via Bank ACH or Card.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Can residents set up automatic monthly rent payments (AutoPay)?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Yes! Residents can toggle AutoPay with one click from their resident portal. Rent is automatically cleared on the 1st of each month with instant digital receipts sent to both tenant and landlord.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>How do security deposits and move-out refunds work?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Security deposits are tracked in a dedicated digital ledger. When a lease finishes and the move-out inspection is completed, refunds can be initiated back to the resident's original bank account with an itemized closing receipt.
          </p>
        </details>

        <details class="faq-item group koshpal-card p-6 bg-white cursor-pointer transition-all">
          <summary class="flex items-center justify-between font-bold text-sm sm:text-base text-slate-900 list-none">
            <span>Can I manage multiple properties and buildings at once?</span>
            <svg class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <p class="text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100 mt-3">
            Yes. PropLedger is built for any size portfolio. You can add unlimited properties, buildings, and apartments. The system tracks each unit individually while giving you an all-in-one financial summary across all your buildings.
          </p>
        </details>

      </div>

    </div>
  </section>

    <!-- SECTION 9: ENTERPRISE SECURITY & RELIABILITY INFOGRAPHICS -->
  <section id="security" class="py-24 px-6 bg-[#0B1736] text-white relative overflow-hidden">
    <!-- Open-Source Architectural Night Skyline Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=80" alt="Architectural Skyline" class="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity filter saturate-150">
      <div class="absolute inset-0 bg-gradient-to-b from-[#0B1736]/90 via-[#0B1736]/80 to-[#0B1736]"></div>
    </div>
    <!-- Blueprint Grid overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px); background-size: 48px 48px;"></div>
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#00A896]/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto space-y-16 relative z-10">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-semibold">
          <span class="w-2 h-2 rounded-full bg-[#00A896] animate-pulse"></span>
          <span>Enterprise-Grade Security &amp; 99.9% Reliability</span>
        </div>
        <h2 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Protected by <span class="text-[#38BDF8]">Bank-Grade Security</span>
        </h2>
        <p class="text-blue-200/80 text-sm sm:text-base leading-relaxed">
          PropLedger safeguards your rental operations with end-to-end encryption, automated schedule conflict prevention, and 24/7 cloud reliability.
        </p>
      </div>

      <!-- 4 Pillars of Trust Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Pillar 1 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#38BDF8]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center font-mono font-bold text-base">
            01
          </div>
          <div>
            <span class="text-[10px] text-[#38BDF8] uppercase font-bold tracking-wider block">Data Protection</span>
            <h4 class="text-base font-bold text-white mt-1">256-Bit Bank Encryption</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Encrypted online rent payments</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Private resident personal data</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Secure digital lease document storage</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Strict role-based account access</span></li>
          </ul>
        </div>

        <!-- Pillar 2 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#2563EB]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center font-mono font-bold text-base">
            02
          </div>
          <div>
            <span class="text-[10px] text-[#60A5FA] uppercase font-bold tracking-wider block">Scheduling Accuracy</span>
            <h4 class="text-base font-bold text-white mt-1">Double-Booking Defense</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Automated calendar locks</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Zero overlapping lease dates</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant move-in date verification</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>No human double-entry mistakes</span></li>
          </ul>
        </div>

        <!-- Pillar 3 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#00A896]/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-[#00A896]/20 text-[#2DD4BF] flex items-center justify-center font-mono font-bold text-base">
            03
          </div>
          <div>
            <span class="text-[10px] text-[#2DD4BF] uppercase font-bold tracking-wider block">Financial Precision</span>
            <h4 class="text-base font-bold text-white mt-1">Automatic Bookkeeping</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant payment matching</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Automated receipts for tenants</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Full audit trail for every dollar</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>One-click tax &amp; profit summaries</span></li>
          </ul>
        </div>

        <!-- Pillar 4 -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-400/50 transition shadow-lg">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-base">
            04
          </div>
          <div>
            <span class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Cloud Uptime</span>
            <h4 class="text-base font-bold text-white mt-1">99.99% Reliability</h4>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>24/7 online tenant rent portal</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Continuous automatic backups</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Fast loading on phone &amp; desktop</span></li>
            <li class="flex items-start gap-1.5"><span class="text-[#00A896]">&check;</span> <span>Instant maintenance alerts</span></li>
          </ul>
        </div>
      </div>

      <!-- Comparison: Traditional Spreadsheets vs PropLedger Protected Platform -->
      <div class="bg-white/5 border border-white/10 rounded-[32px] p-8 sm:p-10 space-y-8">
        <div class="border-b border-white/10 pb-6">
          <span class="text-xs font-bold text-[#00A896] uppercase tracking-wider">Operations Comparison</span>
          <h3 class="text-2xl font-black text-white mt-1">Traditional Property Methods vs. PropLedger Protected Platform</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- The Old Way -->
          <div class="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">&times;</div>
              <h4 class="text-base font-bold text-red-200">The Old Way (Spreadsheets &amp; Paper Receipts)</h4>
            </div>
            <ul class="text-xs text-red-300/90 space-y-2.5">
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Tenants forget payment dates, requiring awkward manual reminders</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Risk of double-booking an apartment between different managers</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Hours spent every month manually calculating expenses and matching bank statements</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Lost paper checks, missing receipts, and stressful tax season audits</span></li>
            </ul>
          </div>

          <!-- The PropLedger Way -->
          <div class="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">&check;</div>
              <h4 class="text-base font-bold text-emerald-200">The PropLedger Way (Automated &amp; Protected)</h4>
            </div>
            <ul class="text-xs text-emerald-300 space-y-2.5">
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Automated friendly statements sent on the 1st of every month</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Smart calendar protection physically prevents any overlapping bookings</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Rent clears online with instant digital receipts for both tenant and landlord</span></li>
              <li class="flex items-start gap-2"><span>&bull;</span> <span>Clear, exportable financial statements ready anytime with zero manual math</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Trust Metrics & Badges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-white tabular-nums">99.99%</div>
          <div class="text-xs text-[#00A896] font-bold uppercase tracking-wider">Uptime SLA</div>
          <p class="text-[11px] text-slate-400">Always available for residents</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-[#38BDF8] tabular-nums">0.00%</div>
          <div class="text-xs text-[#38BDF8] font-bold uppercase tracking-wider">Double-Booking Rate</div>
          <p class="text-[11px] text-slate-400">Protected calendar locks</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-emerald-400 tabular-nums">256-Bit</div>
          <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Bank Security</div>
          <p class="text-[11px] text-slate-400">Encrypted financial processing</p>
        </div>
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-1.5 shadow-lg">
          <div class="text-3xl sm:text-4xl font-black text-[#F59E0B] tabular-nums">24/7</div>
          <div class="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">Automated Billing</div>
          <p class="text-[11px] text-slate-400">Effortless rent collection</p>
        </div>
      </div>

      <!-- Customer Callout Card -->
      <div class="p-8 rounded-3xl bg-gradient-to-r from-[#15337C] to-[#1D45A3] border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div class="space-y-1 text-center sm:text-left">
          <h4 class="text-xl font-black text-white">Ready to simplify your rental operations?</h4>
          <p class="text-xs text-blue-100">See how easy it is to manage your properties, collect rent online, and maintain crystal-clear financial records.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Portfolio Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="pill-btn px-6 py-3 bg-white text-[#15337C] hover:bg-slate-100 font-black text-xs shadow-lg transition flex items-center gap-1.5">
            <span>Request a Free Demo</span>
            <span>&rarr;</span>
          </button>
          <a href="#concierge" class="pill-btn px-5 py-3 border border-white/40 hover:border-white text-white font-bold text-xs transition">
            Contact Support
          </a>
        </div>
      </div>

    </div>
  </section>

  <!-- SECTION 10: RESIDENT SUPPORT & CONCIERGE DESK -->
  <section id="concierge" class="py-24 px-6 relative overflow-hidden bg-slate-900">
    <!-- Open-Source Luxury Concierge Lounge Backdrop (Unsplash License) -->
    <div class="absolute inset-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=80" alt="Luxury Concierge Lounge" class="w-full h-full object-cover object-center opacity-25">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-950"></div>
    </div>
    <div class="max-w-4xl mx-auto relative z-10">
      <div class="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 space-y-7 shadow-2xl border border-white/20">
      <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100">
        <div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900">Contact Resident Support & Concierge</h2>
          <p class="text-xs text-slate-500">Inquiries route directly to our dedicated property operations desk</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Name</label>
          <input id="pubName" type="text" placeholder="John Doe" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-[#2546A6] focus:outline-none transition">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Email</label>
          <input id="pubEmail" type="email" placeholder="john@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-mono focus:bg-white focus:border-[#2546A6] focus:outline-none transition">
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Subject</label>
        <input id="pubSubject" type="text" value="Question about rental management" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-[#2546A6] focus:outline-none transition">
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Message</label>
        <textarea id="pubMessage" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:bg-white focus:border-[#2546A6] focus:outline-none transition">Hello, I would like to learn more about setting up PropLedger for my rental property.</textarea>
      </div>

      <button id="pubBtn" onclick="submitPublicQuery()" class="w-full py-3.5 px-6 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <span>Send Inquiry to Concierge Team</span>
      </button>

      <div id="pubStatus" class="hidden p-4 rounded-xl border text-xs leading-relaxed font-mono"></div>
      
      <!-- VIP Concierge Service Guarantees -->
      <div class="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-slate-600">
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; 2-Hour Response</p>
          <p class="text-[10px] text-slate-500">Dedicated desk</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Private Tours</p>
          <p class="text-[10px] text-slate-500">In-person &amp; virtual</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Zero Paperwork</p>
          <p class="text-[10px] text-slate-500">100% digital leases</p>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p class="text-xs font-bold text-slate-900">&check; Escrow Protection</p>
          <p class="text-[10px] text-slate-500">Safe security deposits</p>
        </div>
      </div>
    </div>
  </section>

  <!-- KOSHPAL DEEP NAVY BLUEPRINT FOOTER -->
  <footer class="koshpal-footer-bg py-16 px-6 text-white border-t border-white/10 mt-16">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      
      <!-- Brand column -->
      <div class="space-y-4 md:col-span-2">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="11" height="11" rx="5.5" fill="#38BDF8" />
            <rect x="17" y="4" width="11" height="11" rx="5.5" fill="#2563EB" />
            <rect x="4" y="17" width="11" height="11" rx="5.5" fill="#00A896" />
            <rect x="17" y="17" width="11" height="11" rx="5.5" fill="#ffffff" />
          </svg>
          <span class="font-black text-2xl tracking-tight text-white">PropLedger</span>
        </div>
        <p class="text-xs text-blue-200/80 leading-relaxed max-w-sm">
          Where property operations and financial clarity make sense. Smart booking protection, automated monthly billing, and effortless rent collection.
        </p>
        <p class="text-xs text-slate-400 font-medium">
          Inquiries: concierge@propledger.com
        </p>
      </div>

      <!-- Links Column 1 -->
      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Navigation</p>
        <p><a href="#overview" class="text-blue-200 hover:text-white transition">Overview</a></p>
        <p><a href="#why-it-matters" class="text-blue-200 hover:text-white transition">Why It Matters</a></p>
        <p><a href="#what-we-do" class="text-blue-200 hover:text-white transition">What We Do</a></p>
        <p><a href="#dual-experience" class="text-blue-200 hover:text-white transition">Dual Experience</a></p>
        <p><a href="#roi-calculator" class="text-blue-200 hover:text-white transition">ROI Calculator</a></p>
      </div>

      <!-- Links Column 2 -->
      <div class="space-y-2.5 text-xs">
        <p class="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Trust &amp; Platform</p>
        <p><a href="#security" class="text-blue-200 hover:text-white transition flex items-center gap-1"><span class="text-[#00A896]">&bull;</span><span>Enterprise Security</span></a></p>
        <p><a href="#unit-gallery" class="text-blue-200 hover:text-white transition">Luxury Residences</a></p>
        <p><a href="#roi-calculator" class="text-blue-200 hover:text-white transition">Savings Calculator</a></p>
        <p><a href="#faq" class="text-blue-200 hover:text-white transition">Knowledge Base &amp; FAQ</a></p>
        <p><a href="#concierge" class="text-blue-200 hover:text-white transition">Contact Concierge</a></p>
      </div>

    </div>

    <div class="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/70">
      <p>&copy; 2026 PropLedger Technologies. All rights reserved. Built for modern property owners and residents.</p>
      <p class="text-blue-300/50">TLS 1.3 Protected &bull; 99.9% Cloud Uptime</p>
    </div>
  </footer>

  <!-- Floating Quick-Action Capsule Dock (Koshpal Style) -->
  <div class="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
    <div class="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full px-5 py-2.5 shadow-[0_12px_36px_-4px_rgba(16,24,40,0.14)] flex items-center gap-2 sm:gap-4 transition hover:scale-[1.02]">
      <button onclick="openPaymentModal()" class="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2546A6] hover:bg-[#1D367E] px-4 py-2 rounded-full shadow-sm transition">
        <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        <span>Pay Rent</span>
      </button>
      <button onclick="openTourModal('The Grand Horizon Luxury Suites', '$1,650 - $3,100 / mo', 'Full Suite Inventory', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80')" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span class="hidden sm:inline">Schedule Tour</span>
        <span class="sm:hidden">Tour</span>
      </button>
      <button onclick="openMaintenanceModal()" class="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
        <span>Resident Desk</span>
      </button>
      <a href="#faq" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>FAQ</span>
      </a>
      <a href="#concierge" class="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition">
        <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span class="hidden sm:inline">Concierge</span>
      </a>
    </div>
  </div>

  <!-- 1. INTERACTIVE PAYMENT MODAL & DIGITAL RECEIPT -->
  <div id="paymentModal" onclick="if(event.target === this) closePaymentModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-black">
            <svg class="w-5 h-5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Secure Rent Settlement</h3>
            <p class="text-xs text-slate-500 font-medium">The Grand Horizon &bull; Unit 402</p>
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
            <button onclick="setPayMethod('ach')" id="pmAch" class="p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition">
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
        <div id="payDetailsAch" class="p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wide">Connected Checking Account</span>
            <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full font-mono">&check; Verified ACH</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" class="p-2 rounded-xl border-2 border-[#2546A6] bg-white text-xs font-bold text-slate-800 text-left">
              <span class="text-[10px] text-[#2546A6] block">Primary</span>
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
          <div class="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1">
            <span>Routing: <strong>021000021</strong></span>
            <span>Clearing Speed: <strong>Instant Settlement</strong></span>
          </div>
        </div>

        <div id="payDetailsCard" class="hidden p-4 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80">
          <div class="space-y-1">
            <label class="block text-[11px] font-bold text-slate-700 uppercase">Cardholder Name</label>
            <input type="text" value="Alex Morgan" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium">
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

        <div id="payDetailsApple" class="hidden p-5 rounded-2xl space-y-3 bg-slate-50 border border-slate-200/80 text-center">
          <p class="text-xs text-slate-600">Biometric 1-click authorization via Apple Wallet or Google Pay.</p>
          <div class="p-3 rounded-2xl bg-black text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-slate-900 transition">
            <span> Pay</span>
            <span class="font-bold text-slate-900 tabular-nums">$3,250.00</span>
          </div>
          <p class="text-[10px] text-slate-400 font-medium">Touch ID / Face ID encrypted cryptographic key exchange</p>
        </div>

        <!-- Itemized Balance Display -->
        <div class="p-4 rounded-2xl space-y-2 text-xs bg-slate-50 border border-slate-200/80">
          <div class="flex justify-between text-slate-600">
            <span>Base Apartment Rent (Unit 402):</span>
            <span class="font-bold text-slate-800 tabular-nums">$2,850.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Assigned Parking Bay #14:</span>
            <span class="font-bold text-slate-800 tabular-nums">$250.00</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Building Services & CAM:</span>
            <span class="font-bold text-slate-800 tabular-nums">$150.00</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
            <span class="text-slate-900">Total Cleared Balance:</span>
            <span class="text-emerald-600 tabular-nums text-base font-black">$3,250.00</span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="space-y-3">
          <button id="paySubmitBtn" onclick="processTestPayment()" class="w-full py-3.5 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-sm shadow-md shadow-blue-900/25 flex items-center justify-center gap-2 transition">
            <span>Confirm & Settle $3,250.00</span>
            <span>&rarr;</span>
          </button>
          <p class="text-[11px] text-center text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>256-Bit Bank Grade Encryption &bull; Instant Payment Confirmation</span>
          </p>
        </div>
      </div>

      <!-- Success Receipt View -->
      <div id="paymentReceiptContainer" class="hidden space-y-5">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black mx-auto shadow-inner">
            &check;
          </div>
          <h4 class="text-xl font-black text-slate-900">Payment Settled & Reconciled!</h4>
          <p class="text-xs text-slate-500">Funds transferred and registered in PropLedger subledger.</p>
        </div>

        <div class="p-5 rounded-2xl space-y-3.5 bg-slate-50 border border-slate-200 text-xs font-mono">
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
            <span class="font-bold text-slate-900">Alex Morgan &bull; Unit 402</span>
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
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Print Receipt</span>
          </button>
          <button onclick="downloadStatementPdf()" class="flex-1 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Download PDF</span>
          </button>
          <button onclick="closePaymentModal()" class="flex-1 py-3 rounded-xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
            <span>Done</span>
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- 2. INTERACTIVE SCHEDULE TOUR & APPLICATION MODAL -->
  <div id="tourModal" onclick="if(event.target === this) closeTourModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-black">
            <svg class="w-5 h-5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Schedule Private Tour & Apply</h3>
            <p class="text-xs text-slate-500 font-medium" id="tourModalSubtitle">The Grand Horizon Luxury Suites</p>
          </div>
        </div>
        <button onclick="closeTourModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm">
          &times;
        </button>
      </div>

      <!-- Unit Preview Snapshot -->
      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
        <img id="tourUnitImg" src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=160&q=80" alt="Apartment preview" class="w-16 h-16 rounded-xl object-cover">
        <div>
          <h4 id="tourUnitTitle" class="font-bold text-sm text-slate-900">Unit 503 &bull; Panoramic Skyline Loft</h4>
          <p id="tourUnitSpecs" class="text-xs text-slate-500 font-medium">1,850 sq ft &bull; 2 Bed &bull; 2.5 Bath</p>
          <p id="tourUnitRent" class="text-xs font-black text-[#2546A6] tabular-nums mt-0.5">$3,100 / mo</p>
        </div>
      </div>

      <div id="tourFormContainer" class="space-y-4">
        <!-- Tour Type Toggle -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Tour Experience</label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onclick="setTourType('person')" id="ttPerson" class="p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-[#2546A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path></svg>
              <span>In-Person Tour</span>
            </button>
            <button type="button" onclick="setTourType('video')" id="ttVideo" class="p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300 flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              <span>4K Virtual Walkthrough</span>
            </button>
          </div>
        </div>

        <!-- Preferred Time Slot -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preferred Date & Time</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button type="button" onclick="setTourTime(this)" class="p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/40 font-bold text-[#2546A6] text-center">
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
            <input id="tourName" type="text" placeholder="Alex Mercer" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input id="tourPhone" type="tel" placeholder="+1 (555) 019-2834" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>

        <div class="text-xs">
          <label class="block font-bold text-slate-700 uppercase mb-1">Email Address for Tour Invitation</label>
          <input id="tourEmail" type="email" placeholder="alex@example.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>

        <button id="tourSubmitBtn" onclick="submitTourRequest()" class="w-full py-3.5 rounded-2xl bg-[#2546A6] hover:bg-[#1D367E] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition">
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
  <div id="maintenanceModal" onclick="if(event.target === this) closeMaintenanceModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
            <svg class="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Resident Maintenance Desk</h3>
            <p class="text-xs text-slate-500 font-medium">Unit 402 &bull; Alex Morgan</p>
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
            <button type="button" onclick="setMaintCategory(this, 'Plumbing & Water')" class="p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-left flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
              <span>Plumbing / Leak</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'HVAC & Climate')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"></path></svg>
              <span>HVAC / A/C</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Electrical & Lighting')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>Electrical</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Kitchen Appliance')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="4" y1="10" x2="20" y2="10"></line><line x1="15" y1="4" x2="15" y2="6"></line><line x1="15" y1="14" x2="15" y2="18"></line></svg>
              <span>Appliances</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'Lock & Keycard')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1.5 1.5L14 9l-3-3-4 4 3 3-5 5a2.12 2.12 0 0 0 3 3l5-5 3 3 4-4-3-3 3.5-3.5L22 4z"></path><circle cx="7.5" cy="16.5" r="1.5"></circle></svg>
              <span>Key & Fob</span>
            </button>
            <button type="button" onclick="setMaintCategory(this, 'General Repair')" class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-left hover:border-slate-300 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              <span>Other Repair</span>
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Urgency Level</label>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" onclick="setMaintUrgency(this, 'Routine')" class="p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center">
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
          <textarea id="maintDescription" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none" placeholder="Describe the issue (e.g. Master bathroom sink pressure is low)...">Master bathroom sink hot water valve has minor dripping.</textarea>
        </div>

        <div class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-pointer hover:bg-slate-100 transition">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <span>Attach Photo or Video (Optional)</span>
        </div>

        <button id="maintSubmitBtn" onclick="submitMaintenanceTicket()" class="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition">
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

  <!-- 3. ADD APARTMENT UNIT MODAL (Landlord Tool) -->
  <div id="addUnitModal" onclick="if(event.target === this) closeAddUnitModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 modal-card-animate overflow-hidden">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900">Add New Apartment</h4>
            <p class="text-xs text-slate-500">Register a unit into your property roster</p>
          </div>
        </div>
        <button onclick="closeAddUnitModal()" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
      </div>

      <div class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-slate-700 uppercase mb-1">Unit Identifier</label>
          <input type="text" id="newUnitId" placeholder="e.g. Unit 305" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Floor Plan</label>
            <select id="newUnitType" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
              <option value="1-Bed Studio">1-Bed Studio</option>
              <option value="1-Bed Luxury">1-Bed Luxury</option>
              <option value="2-Bed Suite" selected>2-Bed Suite</option>
              <option value="3-Bed Townhome">3-Bed Townhome</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 uppercase mb-1">Monthly Rent ($)</label>
            <input type="number" id="newUnitRent" placeholder="2200" value="2200" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 uppercase mb-1">Assigned Resident Name (Optional)</label>
          <input type="text" id="newUnitTenant" placeholder="Leave blank if currently vacant" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#2546A6] focus:outline-none">
        </div>
      </div>

      <div class="pt-2 flex items-center justify-end gap-2.5">
        <button onclick="closeAddUnitModal()" class="pill-btn px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition">Cancel</button>
        <button onclick="submitNewUnit()" class="pill-btn px-5 py-2.5 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5">
          <span>Save to Property Roster</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 4. VIEW LEASE AGREEMENT MODAL (Resident & Landlord Tool) -->
  <div id="leaseModal" onclick="if(event.target === this) closeLeaseModal()" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4 modal-backdrop-animate">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 modal-card-animate overflow-hidden max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#2546A6] flex items-center justify-center font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div>
            <h4 class="font-bold text-base text-slate-900">Residential Lease Agreement</h4>
            <p class="text-xs text-slate-500">Contract #LSE-2026-402-01 &bull; Active</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
          &check; Digitally Signed
        </span>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs leading-relaxed">
        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <span class="text-slate-500 block">Property &amp; Unit:</span>
            <span class="font-bold text-slate-900">The Grand Horizon &bull; Penthouse #402</span>
          </div>
          <div>
            <span class="text-slate-500 block">Primary Resident:</span>
            <span class="font-bold text-slate-900">Alex Morgan</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200/60">
          <div>
            <span class="text-slate-500 block">Lease Term:</span>
            <span class="font-bold text-slate-900">Sep 01, 2026 – Aug 31, 2027</span>
          </div>
          <div>
            <span class="text-slate-500 block">Monthly Rent:</span>
            <span class="font-bold text-emerald-600">$2,850.00 / month</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pb-2">
          <div>
            <span class="text-slate-500 block">Security Deposit:</span>
            <span class="font-bold text-slate-900">$2,850.00 (Escrow Protected)</span>
          </div>
          <div>
            <span class="text-slate-500 block">Parking Stall:</span>
            <span class="font-bold text-slate-900">Assigned Bay #14</span>
          </div>
        </div>
      </div>

      <div class="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 text-blue-900 text-xs flex items-center gap-2.5">
        <svg class="w-4 h-4 text-[#2546A6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>This lease is locked into the schedule. Overlapping bookings are permanently prevented.</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <button onclick="window.print()" class="pill-btn px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          <span>Print Agreement</span>
        </button>
        <button onclick="closeLeaseModal()" class="pill-btn px-6 py-2 bg-[#2546A6] hover:bg-[#1D367E] text-white text-xs font-bold transition">Done</button>
      </div>
    </div>
  </div>

  <script>

    // ── Toast Notification System ──────────────────────────────────
    function showToast(title, message, type) {
      type = type || 'success';
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      const isSuccess = type === 'success';
      const bgClass = 'bg-white border-slate-200 text-slate-800';
      const iconColor = isSuccess ? 'text-emerald-600 bg-emerald-50' : 'text-[#2546A6] bg-blue-50';
      const iconSvg = isSuccess 
        ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/></svg>';
      
      toast.className = 'pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 transform translate-y-2 opacity-0 transition-all duration-300 ' + bgClass;
      toast.innerHTML = '<div class="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ' + iconColor + '">' + iconSvg + '</div>' +
        '<div class="flex-1 min-w-0"><p class="text-xs font-bold text-slate-900">' + title + '</p><p class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">' + message + '</p></div>' +
        '<button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-base font-bold ml-1">&times;</button>';
      
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // ── Mobile Navigation Drawer Toggle ────────────────────────────
    let mobileNavOpen = false;
    function toggleMobileNav() {
      mobileNavOpen = !mobileNavOpen;
      const drawer = document.getElementById('mobileNavDrawer');
      const hamIcon = document.getElementById('hamburgerIcon');
      const closeIcon = document.getElementById('closeNavIcon');
      if (!drawer) return;

      if (mobileNavOpen) {
        drawer.classList.remove('hidden');
        requestAnimationFrame(() => {
          drawer.classList.remove('scale-95', 'opacity-0');
          drawer.classList.add('scale-100', 'opacity-100');
        });
        if (hamIcon) hamIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      } else {
        drawer.classList.remove('scale-100', 'opacity-100');
        drawer.classList.add('scale-95', 'opacity-0');
        setTimeout(() => drawer.classList.add('hidden'), 250);
        if (hamIcon) hamIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      }
    }

    // ── Export Rent Roll as CSV Spreadsheet ────────────────────────
    function exportRentRollCsv() {
      const rows = [
        ['Unit', 'Floor Plan Type', 'Resident Name', 'Monthly Rent (USD)', 'Lease Status', 'Payment Status'],
        ['Unit 101', '1-Bed Studio', 'Sarah Connor', '1650.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 204', '2-Bed Suite', 'Alex Mercer', '2400.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 402', 'Horizon Penthouse', 'Alex Morgan', '2850.00', 'Active Lease', 'Paid (Sep 01)'],
        ['Unit 503', 'Skyline Loft', 'Vacant', '3100.00', 'Available Now', 'Unoccupied']
      ];
      
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join(String.fromCharCode(10));
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'PropLedger_RentRoll_September2026.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Rent Roll Exported', 'Downloaded PropLedger_RentRoll_September2026.csv successfully.');
    }

    // ── Add Unit Modal Logic ───────────────────────────────────────
    function openAddUnitModal() {
      const m = document.getElementById('addUnitModal');
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeAddUnitModal() {
      const m = document.getElementById('addUnitModal');
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    function submitNewUnit() {
      const unitId = (document.getElementById('newUnitId') ? document.getElementById('newUnitId').value : '') || 'Unit 305';
      const unitType = (document.getElementById('newUnitType') ? document.getElementById('newUnitType').value : '2-Bed Suite');
      const rent = (document.getElementById('newUnitRent') ? document.getElementById('newUnitRent').value : '') || '2200';
      const tenant = (document.getElementById('newUnitTenant') ? document.getElementById('newUnitTenant').value.trim() : '') || 'None (Vacant)';
      const isVacant = tenant === 'None (Vacant)';

      const tbody = document.querySelector('#viewLandlord table tbody');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.className = 'border-t border-slate-100 bg-emerald-50/30 transition';
        const formattedRent = '$' + parseFloat(rent).toLocaleString('en-US', { minimumFractionDigits: 2 });
        tr.innerHTML = '<td class="py-3 font-bold text-slate-900">' + unitId + '</td>' +
          '<td class="py-3 text-slate-600">' + unitType + '</td>' +
          '<td class="py-3 ' + (isVacant ? 'text-slate-400 italic' : 'text-slate-800 font-medium') + '">' + tenant + '</td>' +
          '<td class="py-3 font-bold text-slate-900">' + formattedRent + '</td>' +
          '<td class="py-3"><span class="px-2.5 py-1 rounded-full ' + (isVacant ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700') + ' font-semibold text-[11px]">' + (isVacant ? 'Available Now' : 'Active Lease') + '</span></td>' +
          '<td class="py-3 text-right"><span class="' + (isVacant ? 'text-amber-600' : 'text-emerald-600') + ' font-bold text-[11px]">' + (isVacant ? 'Vacant' : 'Active (Oct 01)') + '</span></td>';
        tbody.appendChild(tr);
      }

      closeAddUnitModal();
      showToast('Unit Added to Roster', unitId + ' (' + unitType + ') registered at $' + parseFloat(rent).toLocaleString() + '/mo.');
    }

    // ── Filter Landlord Roster in Real Time ────────────────────────
    function filterRosterTable() {
      const q = (document.getElementById('rosterSearchInput') ? document.getElementById('rosterSearchInput').value.toLowerCase() : '');
      document.querySelectorAll('#viewLandlord table tbody tr').forEach(tr => {
        const text = tr.innerText.toLowerCase();
        tr.style.display = text.includes(q) ? '' : 'none';
      });
    }

    // ── AutoPay Enrollment Switch ──────────────────────────────────
    let autoPayEnabled = true;
    function toggleAutoPay() {
      autoPayEnabled = !autoPayEnabled;
      const btn = document.getElementById('autopayToggleBtn');
      const knob = document.getElementById('autopayToggleKnob');
      const statusText = document.getElementById('autopayStatusText');

      if (autoPayEnabled) {
        if (btn) btn.className = 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none';
        if (knob) knob.className = 'translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        if (statusText) {
          statusText.innerText = 'Active • Chase ••••8421';
          statusText.className = 'text-[10px] text-emerald-600 font-medium';
        }
        showToast('AutoPay Activated', 'Monthly rent ($3,250.00) will be automatically cleared on the 1st of every month.');
      } else {
        if (btn) btn.className = 'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 transition-colors duration-200 ease-in-out focus:outline-none';
        if (knob) knob.className = 'translate-x-0 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        if (statusText) {
          statusText.innerText = 'Paused • Manual monthly payment required';
          statusText.className = 'text-[10px] text-amber-600 font-medium';
        }
        showToast('AutoPay Paused', 'Automatic rent deduction has been turned off.', 'info');
      }
    }

    // ── Digital Lease Agreement Modal ──────────────────────────────
    function openLeaseModal() {
      const m = document.getElementById('leaseModal');
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeLeaseModal() {
      const m = document.getElementById('leaseModal');
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    // ── Combined Unit Gallery Filter (Search + Bedroom category) ────
    let activeBedFilter = 'all';

    function setBedroomFilter(category, btn) {
      activeBedFilter = category;
      document.querySelectorAll('.bed-btn').forEach(b => {
        b.className = 'bed-btn pill-btn px-3 py-1 text-xs font-bold inactive-tab';
      });
      btn.className = 'bed-btn pill-btn px-3 py-1 text-xs font-bold active-tab';
      filterUnitsCombined();
    }

    function filterUnitsCombined() {
      const search = (document.getElementById('unitSearchInput') ? document.getElementById('unitSearchInput').value.toLowerCase() : '');
      const cards = document.querySelectorAll('.unit-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const cardText = card.innerText.toLowerCase();
        const status = card.getAttribute('data-status');
        const type = card.getAttribute('data-type') || '';

        const matchesSearch = !search || cardText.includes(search);
        let matchesCategory = true;
        if (activeBedFilter === 'available') {
          matchesCategory = status === 'available';
        } else if (activeBedFilter !== 'all') {
          matchesCategory = type === activeBedFilter;
        }

        if (matchesSearch && matchesCategory) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const countEl = document.getElementById('unitResultsCount');
      if (countEl) {
        countEl.innerText = 'Showing ' + visibleCount + ' of ' + cards.length + ' Luxury Residences';
      }
    }

    // ── Filter FAQ Questions in Real Time ──────────────────────────
    function filterFaqQuestions() {
      const query = (document.getElementById('faqSearchInput') ? document.getElementById('faqSearchInput').value.toLowerCase() : '');
      document.querySelectorAll('#faqAccordionList details').forEach(d => {
        const text = d.innerText.toLowerCase();
        if (!query || text.includes(query)) {
          d.style.display = '';
          if (query) d.open = true;
        } else {
          d.style.display = 'none';
        }
      });
    }

    // 1. Dual Experience Switcher
    function switchExperience(type) {
      const landlordView = document.getElementById('viewLandlord');
      const tenantView = document.getElementById('viewTenant');
      const btnL = document.getElementById('tabBtnLandlord');
      const btnT = document.getElementById('tabBtnTenant');

      if (type === 'landlord') {
        landlordView.classList.remove('hidden');
        tenantView.classList.add('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5';
      } else {
        landlordView.classList.add('hidden');
        tenantView.classList.remove('hidden');
        btnL.className = 'pill-btn px-6 py-2.5 text-xs font-bold inactive-tab flex items-center gap-1.5';
        btnT.className = 'pill-btn px-6 py-2.5 text-xs font-bold active-tab flex items-center gap-1.5';
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
        btn.innerHTML = '<span class="flex items-center justify-center gap-1.5"><svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Invoices Dispatched (402 Sent)</span></span>';
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

    // 4. Payment Modal Logic
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
      document.getElementById('pmAch').className = m === 'ach' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      document.getElementById('pmCard').className = m === 'card' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';
      document.getElementById('pmApple').className = m === 'apple' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center transition' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center transition';

      document.getElementById('payDetailsAch').classList.toggle('hidden', m !== 'ach');
      document.getElementById('payDetailsCard').classList.toggle('hidden', m !== 'card');
      document.getElementById('payDetailsApple').classList.toggle('hidden', m !== 'apple');
    }

    function processTestPayment() {
      const btn = document.getElementById('paySubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 1/3: Securing payment with 256-bit encryption...';

      setTimeout(() => {
        btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 2/3: Verifying payment details...';
      }, 500);

      setTimeout(() => {
        btn.innerHTML = '<span class="animate-spin mr-2">&#9696;</span> Step 3/3: Confirming bank clearance...';
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
        playLottie('lottiePaymentSuccess', '/animations/payment-success.json', '<div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">&check;</div>');
        btn.disabled = false;
        btn.innerHTML = '<span>Confirm & Settle $3,250.00</span><span>&rarr;</span>';
      }, 1400);
    }

    // 5. Schedule Tour Modal Logic
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
      document.getElementById('ttPerson').className = t === 'person' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300';
      document.getElementById('ttVideo').className = t === 'video' ? 'p-2.5 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center' : 'p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-600 text-center hover:border-slate-300';
    }

    function setTourTime(btn) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/40 font-bold text-[#2546A6] text-center';
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
      playLottie('lottieTourSuccess', '/animations/tour-success.json', '<div class="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xl font-bold">&check;</div>');
      document.getElementById('tourSuccessMsg').innerHTML = 'Tour confirmed for <strong>' + selectedTourSlot + '</strong> (' + selectedTourType + '). An invitation and digital lease packet have been emailed to ' + email + '.';
      btn.disabled = false;
      btn.innerHTML = '<span>Confirm Tour & Receive Application Packet &rarr;</span>';
    }

    // 6. Resident Maintenance Desk Logic
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
      btn.className = 'p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-left';
      maintCategory = cat;
    }

    function setMaintUrgency(btn, urg) {
      btn.parentElement.querySelectorAll('button').forEach(b => {
        b.className = 'p-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-center hover:border-slate-300';
      });
      btn.className = 'p-2 rounded-xl border-2 border-[#2546A6] bg-blue-50/50 font-bold text-[#2546A6] text-center';
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
            senderName: 'Alex Morgan (Unit 402)',
            senderEmail: 'alex.morgan@example.com',
            subject: 'Maintenance Ticket [Unit 402]: ' + maintCategory + ' (' + maintUrgency + ')',
            message: ['Resident: Alex Morgan', 'Unit: 402', 'Category: ' + maintCategory, 'Priority: ' + maintUrgency, 'Details: ' + desc].join('\\n')
          })
        });
      } catch (e) {
        console.error(e);
      }

      document.getElementById('maintFormContainer').classList.add('hidden');
      document.getElementById('maintSuccessCard').classList.remove('hidden');
      playLottie('lottieMaintSuccess', '/animations/maint-success.json', '<div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">&check;</div>');
      btn.disabled = false;
      btn.innerHTML = '<span>Submit Maintenance Ticket &rarr;</span>';
    }

    // 7. Download Statement Helper
    function downloadStatementPdf() {
      window.print();
    }

    // 8. Public Query Form Handler
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
      statusBox.innerHTML = 'Connecting with property concierge desk...';

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
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg><span>Send Inquiry to Concierge Desk</span>';
      }
    }

    // Explicit global bindings for inline event attributes
    window.showToast = showToast;
    window.toggleMobileNav = toggleMobileNav;
    window.exportRentRollCsv = exportRentRollCsv;
    window.openAddUnitModal = openAddUnitModal;
    window.closeAddUnitModal = closeAddUnitModal;
    window.submitNewUnit = submitNewUnit;
    window.filterRosterTable = filterRosterTable;
    window.toggleAutoPay = toggleAutoPay;
    window.openLeaseModal = openLeaseModal;
    window.closeLeaseModal = closeLeaseModal;
    window.setBedroomFilter = setBedroomFilter;
    window.filterUnitsCombined = filterUnitsCombined;
    window.filterFaqQuestions = filterFaqQuestions;
    window.switchExperience = switchExperience;
    window.dispatchBatchBills = dispatchBatchBills;
    window.filterUnits = filterUnits;
    window.calculateRoi = calculateRoi;
    window.openPaymentModal = openPaymentModal;
    window.closePaymentModal = closePaymentModal;
    window.setPayMethod = setPayMethod;
    window.processTestPayment = processTestPayment;
    window.openTourModal = openTourModal;
    window.closeTourModal = closeTourModal;
    window.setTourType = setTourType;
    window.setTourTime = setTourTime;
    window.submitTourRequest = submitTourRequest;
    window.openMaintenanceModal = openMaintenanceModal;
    window.closeMaintenanceModal = closeMaintenanceModal;
    window.setMaintCategory = setMaintCategory;
    window.setMaintUrgency = setMaintUrgency;
    window.submitMaintenanceTicket = submitMaintenanceTicket;
    window.downloadStatementPdf = downloadStatementPdf;
    window.submitPublicQuery = submitPublicQuery;

    // Dismiss any open modal on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePaymentModal();
        closeTourModal();
        closeMaintenanceModal();
        closeAddUnitModal();
        closeLeaseModal();
      }
    });
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
          <span>admin@propledger.com</span>
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
