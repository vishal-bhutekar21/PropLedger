import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, invoicesApi } from '../../api/client';
import { StatusBadge, SearchBar, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { CreditCard, Plus } from 'lucide-react';
import type { Payment, Invoice } from '../../types';

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

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
    </div>
  );
}
