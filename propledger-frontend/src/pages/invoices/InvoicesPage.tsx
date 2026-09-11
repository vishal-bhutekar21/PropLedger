import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../../api/client';
import { StatusBadge, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { Receipt, Eye } from 'lucide-react';
import type { Invoice } from '../../types';

export default function InvoicesPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoices', { page, status }],
    queryFn: () => invoicesApi.list({
      page,
      size: 15,
      status: status || undefined,
    }),
  });

  const invoices: Invoice[] = data?.content || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rental Billing & Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Automated billing ledger, recurring rent invoices, utility charges, and aging
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {data?.totalElements || 0} Invoices
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No invoices found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            There are no invoices matching the selected status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Tenant & Unit</th>
                  <th className="px-4 py-3">Invoice Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Paid Amount</th>
                  <th className="px-4 py-3">Balance Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.tenantName}</div>
                      <div className="text-[11px] text-slate-400">{inv.propertyName} · Unit {inv.unitNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      ₹{Number(inv.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(inv.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                      ₹{Number(inv.outstandingAmount != null ? inv.outstandingAmount : (inv.totalAmount - (inv.paidAmount || 0))).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                        title="View Line Items"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice Breakdown: ${selectedInvoice?.invoiceNumber}`}
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              <div>
                <span className="text-slate-400">Tenant:</span>
                <span className="ml-1 font-bold text-slate-900 dark:text-white">{selectedInvoice.tenantName}</span>
              </div>
              <div>
                <span className="text-slate-400">Unit:</span>
                <span className="ml-1 font-bold text-slate-900 dark:text-white">{selectedInvoice.unitNumber}</span>
              </div>
              <div>
                <span className="text-slate-400">Due Date:</span>
                <span className="ml-1 font-bold text-slate-900 dark:text-white">{selectedInvoice.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <span className="ml-1"><StatusBadge status={selectedInvoice.status} /></span>
              </div>
            </div>

            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Itemized Breakdown</div>
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                    <tr>
                      <th className="py-1 text-left">Description</th>
                      <th className="py-1 text-center">Type</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-slate-800 dark:text-slate-200">{it.description}</td>
                        <td className="py-2 text-center text-slate-500 font-mono text-[10px]">{it.itemType}</td>
                        <td className="py-2 text-right font-bold text-slate-900 dark:text-white">
                          ₹{Number(it.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
              <span>Total Invoice Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
