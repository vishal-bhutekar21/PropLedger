import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, invoicesApi } from '../../api/client';
import { StatusBadge, SearchBar, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { CreditCard, Plus, FileText, RotateCcw, Printer, CheckCircle2 } from 'lucide-react';
import type { Payment, Invoice } from '../../types';

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; paymentId: number | null }>({
    isOpen: false,
    paymentId: null,
  });
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Form state
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: 0,
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    transactionReference: '',
    notes: 'Received via online payment gateway',
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['unpaid-invoices'],
    queryFn: () => invoicesApi.list({ size: 100 }),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['payments', { page, search }],
    queryFn: () => paymentsApi.list({
      page,
      size: 15,
      search: search || undefined,
    }),
  });

  const recordMutation = useMutation({
    mutationFn: (data: typeof paymentForm) => paymentsApi.record({
      ...data,
      invoiceId: Number(data.invoiceId),
      amount: Number(data.amount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsRecordOpen(false);
      setPaymentForm({
        invoiceId: 0,
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        transactionReference: '',
        notes: 'Received via online payment gateway',
      });
    },
  });

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModal.paymentId) return;
    setRefundLoading(true);
    try {
      await paymentsApi.refund(refundModal.paymentId, refundReason);
      setPaymentNotice(`Refund successfully processed for Payment #${refundModal.paymentId}. Invoice status reopened.`);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setRefundModal({ isOpen: false, paymentId: null });
      setRefundReason('');
    } catch (err: any) {
      alert('Failed to process refund: ' + (err.response?.data?.message || err.message));
    } finally {
      setRefundLoading(false);
    }
  };

  const payments: Payment[] = data?.content || [];
  const invoices: Invoice[] = invoicesData?.content || [];
  const pendingInvoices = invoices.filter(i => i.status !== 'PAID' && i.status !== 'VOID');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Collections</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Payment gateway reconciliations, double-entry audit records, and invoice settlements
          </p>
        </div>
        <button
          onClick={() => setIsRecordOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {paymentNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{paymentNotice}</span>
          </div>
          <button onClick={() => setPaymentNotice(null)} className="text-xs hover:underline text-emerald-500">Dismiss</button>
        </div>
      )}

      {/* Filter / Search */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(0); }}
            placeholder="Search by reference or invoice #..."
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Total Transactions: {data?.totalElements || 0}
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <LoadingState message="Loading payment transactions..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load payments'} />
      ) : payments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No payments recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Record Payment" to process rent receipts.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Receipt / Txn Ref</th>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.paymentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {p.transactionReference || `PAY-${p.paymentId}`}
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                      {p.invoiceNumber || `INV-${p.invoiceId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.paymentDate}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                      {p.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={async () => {
                            setReceiptLoading(true);
                            try {
                              const rcpt = await paymentsApi.receipt(p.paymentId);
                              setReceiptData(rcpt);
                            } catch (e: any) {
                              alert('Failed to load receipt: ' + (e.response?.data?.message || e.message));
                            } finally {
                              setReceiptLoading(false);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded font-semibold text-[11px] hover:bg-indigo-100 transition-colors disabled:opacity-50"
                          title="Generate Official Receipt"
                          disabled={receiptLoading}
                        >
                          <FileText className="w-3 h-3" />
                          {receiptLoading ? '...' : 'Receipt'}
                        </button>
                        {p.status === 'SUCCESS' && (
                          <button
                            onClick={() => {
                              setRefundModal({ isOpen: true, paymentId: p.paymentId });
                              setRefundReason('Customer requested reversal / reconciliation adjustment');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded font-semibold text-[11px] hover:bg-rose-100 transition-colors"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Record Tenant Payment"
      >
        <form onSubmit={(e) => { e.preventDefault(); recordMutation.mutate(paymentForm); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Invoice to Settle *</label>
            <select
              required
              value={paymentForm.invoiceId}
              onChange={(e) => {
                const invId = Number(e.target.value);
                const selectedInv = invoices.find(i => i.invoiceId === invId);
                setPaymentForm({
                  ...paymentForm,
                  invoiceId: invId,
                  amount: selectedInv ? String(selectedInv.outstandingAmount || selectedInv.totalAmount) : '',
                });
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="">-- Choose Pending Invoice --</option>
              {pendingInvoices.map((inv) => (
                <option key={inv.invoiceId} value={inv.invoiceId}>
                  {inv.invoiceNumber} — {inv.tenantName} (Due: ₹{Number(inv.outstandingAmount || inv.totalAmount).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Paid (₹) *</label>
              <input
                type="number"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Amount"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="NEFT">NEFT / RTGS / IMPS Bank Transfer</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Transaction Ref / UTR</label>
              <input
                type="text"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
                placeholder="e.g. UTR1938472910"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Narration</label>
            <textarea
              rows={2}
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordMutation.isPending || !paymentForm.invoiceId}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {recordMutation.isPending ? 'Processing Transaction...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Rent Receipt Modal */}
      <Modal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        title="Official Rent Payment Receipt"
      >
        {receiptData && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">PROPLAND ENTERPRISE ERP</div>
                  <div className="text-[11px] text-slate-400">Official GST & Rent Payment Acknowledgment</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{receiptData.receiptNumber}</div>
                  <div className="text-[10px] text-slate-400">{receiptData.paymentDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Tenant / Resident</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{receiptData.tenantName}</div>
                  <div className="text-slate-500">{receiptData.tenantEmail}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Property & Unit</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">{receiptData.propertyName}</div>
                  <div className="text-slate-500">Unit {receiptData.unitNumber} &bull; {receiptData.propertyAddress}</div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Settled Invoice</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{receiptData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Invoice Total</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">₹{Number(receiptData.invoiceTotalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Payment Mode / Ref</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{receiptData.paymentMethod} &bull; {receiptData.transactionReference || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Remaining Balance Due</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">₹{Number(receiptData.invoiceRemainingBalance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Amount Paid & Settle:</span>
                  <span>₹{Number(receiptData.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic pt-2">
                Recorded By: {receiptData.recordedBy || 'System Cashier'} &bull; Status: {receiptData.status}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Confirmation Modal */}
      <Modal
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, paymentId: null })}
        title="Authorize Payment Refund / Reversal"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200">
            <span className="font-bold block">Caution: Irreversible Transaction Action</span>
            Refunding Payment #{refundModal.paymentId} will mark this payment as REFUNDED, decrement the invoice's paid amount, and return the invoice to unpaid/partially paid status.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Refund Reason / Narration *</label>
            <textarea
              required
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Accidental double transfer, resident lease canceled, etc."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRefundModal({ isOpen: false, paymentId: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={refundLoading || !refundReason.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {refundLoading ? 'Processing Refund...' : 'Confirm Refund & Reversal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
