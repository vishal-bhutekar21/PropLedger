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
  FileText,
  Sparkles
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
        setStatusMessage(`Delivered statement ${data.invoiceNumber} to ${recipientEmail} (ID: ${data.messageId || 'OK'})`);
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
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner (Swish / BookMyShow rounded-3xl container) */}
      <div className="card p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-[#121722] to-indigo-950 border border-slate-700/60 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-wider">
                SUPER ADMIN LEVEL
              </span>
              <span className="text-xs text-slate-400 font-mono">Edge Cluster Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-9 h-9 text-emerald-400" />
              Master Operations & Edge Infrastructure
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Global orchestrator for Cloudflare edge deployment at{' '}
              <span className="text-indigo-400 font-mono font-bold">propledger.vishalbhutekar.me</span>, and transactional email distribution via Resend API.
            </p>
          </div>

          <div className="flex items-center gap-3.5 bg-black/40 p-4 px-5 rounded-2xl border border-white/10 backdrop-blur-md self-start md:self-auto">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Master Session</p>
              <p className="text-sm font-bold text-white font-mono">vishal.bhutekar1@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Infrastructure Metrics (Swish Rounded-3xl Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Cloudflare Edge"
          value="propledger"
          subtitle="vishalbhutekar.me"
          icon={<Globe className="w-5 h-5 text-sky-400" />}
          color="sky"
        />
        <StatCard
          title="Email Routing"
          value="Resend Live"
          subtitle="DKIM & SPF Active"
          icon={<Mail className="w-5 h-5 text-emerald-400" />}
          color="emerald"
        />
        <StatCard
          title="Database Core"
          value="Postgres 16"
          subtitle="12 Migrations"
          icon={<Server className="w-5 h-5 text-purple-400" />}
          color="purple"
        />
        <StatCard
          title="Master Security"
          value="BCrypt 12"
          subtitle="Super Admin Role"
          icon={<KeyRound className="w-5 h-5 text-amber-400" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resend Automated Email Dispatching Console */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Transactional Email Console</h2>
              <p className="text-xs text-slate-400">Dispatch branded statements and registration packets</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                Target Recipient Email Address
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="input font-mono"
                placeholder="user@example.com"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold pb-2 border-b border-slate-200/60 dark:border-white/5">
                <span>Packet Manifest:</span>
                <span className="text-emerald-500 flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" /> Ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-500" />
                <span>PropLedger Master Administrator Welcome Credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-500" />
                <span>Invoice Statement: INV-202609-00001 ($3,250.00 Base Rent)</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-brand-500" />
                <span>Comprehensive Engineering Handbook Architecture Suite</span>
              </div>
            </div>

            {statusMessage && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 font-mono ${
                emailStatus === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : emailStatus === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}>
                {emailStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : emailStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              onClick={handleSendInvoiceEmail}
              disabled={emailStatus === 'sending'}
              className="btn-primary w-full py-3.5"
            >
              <Send className="w-4 h-4" />
              <span>{emailStatus === 'sending' ? 'Dispatching via Resend...' : 'Dispatch Invoice & Welcome Packet'}</span>
            </button>
          </div>
        </div>

        {/* Cloudflare Edge Hosting & Infrastructure Panel */}
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-white/5">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Cloudflare Subdomain Routing</h2>
              <p className="text-xs text-slate-400">vishalbhutekar.me enterprise zone status</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Edge Subdomain</p>
                <p className="text-xs text-slate-400 font-mono">propledger.vishalbhutekar.me</p>
              </div>
              <span className="badge-success">
                PROVISIONED
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Cloudflare Zone ID</p>
                <p className="text-xs text-slate-400 font-mono">84d04451d623e1d6885d01c55a89ce3a</p>
              </div>
              <span className="badge-info">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Inbound Support Desk</p>
                <p className="text-xs text-slate-400 font-mono">support@propledger.vishalbhutekar.me</p>
              </div>
              <span className="badge-purple">
                FORWARDING
              </span>
            </div>
          </div>

          {/* Test Inbound Support Dispatch */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Support Forwarding:</span>
              <span className="text-xs font-mono text-slate-400">&rarr; vishal.bhutekar1@gmail.com</span>
            </div>

            {supMessage && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 font-mono ${
                supStatus === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : supStatus === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400'
              }`}>
                {supStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : supStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                <span>{supMessage}</span>
              </div>
            )}

            <button
              onClick={handleTestSupportQuery}
              disabled={supStatus === 'sending'}
              className="btn-secondary w-full py-3 text-xs"
            >
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{supStatus === 'sending' ? 'Routing diagnostic ping...' : 'Simulate Inbound Support Ticket'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminPage;
