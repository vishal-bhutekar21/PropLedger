import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../../api/client';
import { StatusBadge, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { Receipt, Eye, Send, CheckCircle2, Download, Building2, Calendar, AlertTriangle } from 'lucide-react';
import type { Invoice } from '../../types';

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentResult, setEmailSentResult] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [lateFeeLoading, setLateFeeLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', { page, status }],
    queryFn: () => invoicesApi.list({
      page,
      size: 15,
      status: status || undefined,
    }),
  });

  const invoices: Invoice[] = data?.content || [];

  const handleRunMonthlyBilling = async () => {
    setBillingLoading(true);
    setActionNotice(null);
    try {
      const res = await invoicesApi.generateMonthly();
      setActionNotice(`Success: Generated ${res.generatedCount} monthly invoices (Total billed: ₹${Number(res.totalBilled || 0).toLocaleString()}). Skipped ${res.skippedCount} already invoiced.`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (e: any) {
      setActionNotice(`Billing error: ${e.response?.data?.message || e.message}`);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleAssessLateFees = async () => {
    setLateFeeLoading(true);
    setActionNotice(null);
    try {
      const res = await invoicesApi.assessLateFees();
      setActionNotice(`Late fees evaluated: Penalties applied to ${res.lateFeesAppliedCount} overdue invoices (Total penalties: ₹${Number(res.totalLateFeesAmount || 0).toLocaleString()}).`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (e: any) {
      setActionNotice(`Late fee error: ${e.response?.data?.message || e.message}`);
    } finally {
      setLateFeeLoading(false);
    }
  };

  const handleDispatchEmail = async (inv: Invoice) => {
    setEmailSending(true);
    setEmailSentResult(null);
    try {
      // Local statement generation simulation
      await new Promise(res => setTimeout(res, 600));
      setEmailSentResult(`Statement generated for ${inv.tenantName} (${inv.invoiceNumber}). Ready for local delivery or printing.`);
    } catch (e: any) {
      setEmailSentResult(`Error: ${e.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rental Invoices & Statements</h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
              {data?.totalElements || 0} TOTAL
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated billing ledger, recurring rent invoices, utility charges, and aging balance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunMonthlyBilling}
            disabled={billingLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <Calendar className="w-3.5 h-3.5" />
            {billingLoading ? 'Generating...' : 'Run Monthly Billing'}
          </button>
          <button
            onClick={handleAssessLateFees}
            disabled={lateFeeLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {lateFeeLoading ? 'Assessing...' : 'Assess Late Fees'}
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs hover:underline text-indigo-500">Dismiss</button>
        </div>
      )}

      {/* Filter Toolbar with Pill Elements */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Receipt className="w-4 h-4 text-brand-500" />
          <span>Billing Ledger Records</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="input !py-2 !px-4 !rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10"
          >
            <option value="">All Invoicing Statuses</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Paid in Full</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOID">Voided</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {isLoading ? (
        <LoadingState message="Loading financial billing invoices..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load invoices'} />
      ) : invoices.length === 0 ? (
        <div className="card p-16 text-center">
          <Receipt className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No invoices found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            There are no invoices matching the selected status filter.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Tenant & Unit</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.invoiceId}>
                  <td className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {inv.invoiceNumber}
                  </td>
                  <td>
                    <div className="font-bold text-slate-900 dark:text-white">{inv.tenantName}</div>
                    <div className="text-xs text-slate-400">{inv.propertyName} · Unit {inv.unitNumber}</div>
                  </td>
                  <td className="text-slate-500 font-mono text-xs">{inv.invoiceDate}</td>
                  <td className="font-semibold text-slate-700 dark:text-slate-200 font-mono text-xs">{inv.dueDate}</td>
                  <td className="font-black text-slate-900 dark:text-white font-mono">
                    ₹{Number(inv.totalAmount).toLocaleString()}
                  </td>
                  <td className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{Number(inv.paidAmount || 0).toLocaleString()}
                  </td>
                  <td className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    ₹{Number(inv.outstandingAmount != null ? inv.outstandingAmount : (inv.totalAmount - (inv.paidAmount || 0))).toLocaleString()}
                  </td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => { setSelectedInvoice(inv); setEmailSentResult(null); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                      title="View Line Items"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ticket</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Enterprise Financial Statement Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title=""
        size="md"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Statement Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedInvoice.propertyName}
                  </h4>
                  <p className="text-xs text-slate-400">Unit {selectedInvoice.unitNumber} &bull; Resident Statement</p>
                </div>
              </div>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            {/* Information Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Tenant</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedInvoice.tenantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Invoice Number</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Invoice Date</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedInvoice.invoiceDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Due Date</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedInvoice.dueDate}</span>
              </div>
            </div>

            {/* Clean Subtle Divider */}
            <div className="border-t border-slate-100 dark:border-white/5 my-2" />

            {/* Line Items Table */}
            {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Breakdown</div>
                <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{it.description}</p>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{it.itemType}</span>
                      </div>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                        ₹{Number(it.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-xs text-slate-400 text-center">
                Standard monthly recurring rent charge
              </div>
            )}

            {/* Total Balance Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 border border-brand-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Total Payable</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Balance Due</span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                  ₹{Number(selectedInvoice.outstandingAmount != null ? selectedInvoice.outstandingAmount : (selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0))).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Email Dispatch & Notification */}
            {emailSentResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                {emailSentResult}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleDispatchEmail(selectedInvoice)}
                disabled={emailSending}
                className="btn-primary flex-1 py-3"
              >
                {emailSending ? (
                  <>
                    <span className="animate-spin mr-1.5">&#9696;</span>
                    <span>Generating Statement...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Statement</span>
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary py-3 px-5"
                title="Print Receipt"
              >
                <Download className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
