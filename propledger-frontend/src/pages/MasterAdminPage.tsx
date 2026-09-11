import { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Server, 
  KeyRound, 
  FileText 
} from 'lucide-react';
import { StatCard } from '../components/ui';

export const MasterAdminPage = () => {
  const [recipientEmail, setRecipientEmail] = useState('vishal.bhutekar1@gmail.com');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const [supStatus, setSupStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [supMessage, setSupMessage] = useState('');

  const handleSendInvoiceEmail = async () => {
    setEmailStatus('sending');
    setStatusMessage('Dispatching registration and statement packet via Cloudflare edge...');
    try {
      const response = await fetch('https://propledger.vishalbhutekar.me/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          invoiceNumber: 'INV-202609-00001',
          amount: '$3,250.00',
          property: 'The Grand Horizon Luxury Suites - Unit 402',
          tenant: 'Vishal Bhutekar'
        })
      });
      const data = await response.json();
      if (data.success) {
        setEmailStatus('success');
        setStatusMessage(`Successfully delivered statement ${data.invoiceNumber} to ${recipientEmail} (ID: ${data.messageId || 'OK'})`);
      } else {
        setEmailStatus('error');
        setStatusMessage(data.error || 'Failed to dispatch email');
      }
    } catch (err: any) {
      setEmailStatus('error');
      setStatusMessage(err.message || 'Failed to dispatch email');
    }
  };

  const handleTestSupportQuery = async () => {
    setSupStatus('sending');
    setSupMessage('Routing test inquiry to support@propledger.vishalbhutekar.me...');
    try {
      const response = await fetch('https://propledger.vishalbhutekar.me/api/support-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: 'Master Portal Operator',
          senderEmail: 'admin.inquiry@propledger.com',
          subject: 'Diagnostic Verification of Support Mail Pipeline',
          message: 'This is an automated operational ping verifying inbound routing to vishal.bhutekar1@gmail.com.'
        })
      });
      const data = await response.json();
      if (data.success) {
        setSupStatus('success');
        setSupMessage(`Forwarded to ${data.forwardedTo} (ID: ${data.messageId || 'OK'})`);
      } else {
        setSupStatus('error');
        setSupMessage(data.error || 'Failed to route query');
      }
    } catch (err: any) {
      setSupStatus('error');
      setSupMessage(err.message || 'Transmission error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-2xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider">
                SUPER ADMIN LEVEL
              </span>
              <span className="text-xs text-slate-400">Enterprise Tenant Controller</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              Master Operations & Cloudflare Admin
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Central orchestrator for production infrastructure, Cloudflare edge deployment at{' '}
              <span className="text-indigo-400 font-mono">propledger.vishalbhutekar.me</span>, and transactional email distribution via Resend.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Active Session</p>
              <p className="text-sm font-bold text-white font-mono">vishal.bhutekar1@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Infrastructure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Cloudflare Subdomain"
          value="propledger.vishalbhutekar.me"
          subtitle="SSL / CDN Active"
          icon={<Globe className="w-6 h-6 text-sky-400" />}
        />
        <StatCard
          title="Email Engine"
          value="Resend API Active"
          subtitle="vishalbhutekar.me domain"
          icon={<Mail className="w-6 h-6 text-emerald-400" />}
        />
        <StatCard
          title="Database Cluster"
          value="PostgreSQL 16"
          subtitle="12 Flyway Migrations"
          icon={<Server className="w-6 h-6 text-purple-400" />}
        />
        <StatCard
          title="Master Security"
          value="Super Admin Active"
          subtitle="BCrypt Work Factor 12"
          icon={<KeyRound className="w-6 h-6 text-amber-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resend Automated Email Dispatching Console */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Resend Email & Invoice Dispatch Console</h2>
              <p className="text-xs text-slate-400">Trigger branded registration and invoice notification packets</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Recipient Email Address
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="user@example.com"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between text-slate-300 font-medium pb-1.5 border-b border-slate-800">
                <span>Packet Contents:</span>
                <span className="text-emerald-400">Ready for Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>PropLedger Master Administrator Account Welcome & Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Invoice INV-202609-00001 ($2,400.00 Base Rent & Parking)</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>PDF Attachment: Volume 01 Architecture Handbook</span>
              </div>
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                emailStatus === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : emailStatus === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
              }`}>
                {emailStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : emailStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              onClick={handleSendInvoiceEmail}
              disabled={emailStatus === 'sending'}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {emailStatus === 'sending' ? 'Dispatching via Resend...' : 'Dispatch Invoice & Registration Packet'}
            </button>
          </div>
        </div>

        {/* Cloudflare Edge Hosting & Infrastructure Panel */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cloudflare Edge & Subdomain Routing</h2>
              <p className="text-xs text-slate-400">vishalbhutekar.me enterprise zone status</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">Target Subdomain</p>
                <p className="text-xs text-slate-400 font-mono">propledger.vishalbhutekar.me</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PROVISIONED
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">Cloudflare Zone ID</p>
                <p className="text-xs text-slate-400 font-mono">84d04451d623e1d6885d01c55a89ce3a</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">TLS / SSL Protocol</p>
                <p className="text-xs text-slate-400">Full (Strict) HTTPS Termination</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ENCRYPTED
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">Support Routing</p>
                <p className="text-xs text-slate-400 font-mono">support@propledger.vishalbhutekar.me</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Test Inbound Support Dispatch */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Test Support Forwarding:</span>
              <span className="text-[11px] font-mono text-slate-400">&rarr; vishal.bhutekar1@gmail.com</span>
            </div>

            {supMessage && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                supStatus === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : supStatus === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
              }`}>
                {supStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : supStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>{supMessage}</span>
              </div>
            )}

            <button
              onClick={handleTestSupportQuery}
              disabled={supStatus === 'sending'}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition border border-slate-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              {supStatus === 'sending' ? 'Routing ping...' : 'Simulate Inbound Support Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminPage;
