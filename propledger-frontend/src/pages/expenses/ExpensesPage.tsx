import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, propertiesApi, vendorsApi } from '../../api/client';
import { StatusBadge, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { DollarSign, Plus, Tag } from 'lucide-react';
import type { Expense, Property, Vendor } from '../../types';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('');
  const [propertyId, setPropertyId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    propertyId: 1,
    vendorId: undefined as number | undefined,
    category: 'MAINTENANCE',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    status: 'PAID',
    notes: '',
  });

  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list-all'],
    queryFn: () => propertiesApi.list({ size: 100 }),
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors-list-all'],
    queryFn: () => vendorsApi.list({ size: 100 }),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expenses', { page, category, propertyId }],
    queryFn: () => expensesApi.list({
      page,
      size: 15,
      category: category || undefined,
      propertyId: propertyId || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (newExp: typeof expenseForm) => expensesApi.create({
      ...newExp,
      propertyId: Number(newExp.propertyId),
      vendorId: newExp.vendorId ? Number(newExp.vendorId) : undefined,
      amount: Number(newExp.amount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsCreateOpen(false);
      setExpenseForm({
        propertyId: 1,
        vendorId: undefined,
        category: 'MAINTENANCE',
        description: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        status: 'PAID',
        notes: '',
      });
    },
  });

  const expenses: Expense[] = data?.content || [];
  const properties: Property[] = propertiesData?.content || [];
  const vendors: Vendor[] = vendorsData?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operational Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Property OPEX tracking, vendor disbursements, maintenance costs, and utility overhead
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {data?.totalElements || 0} Expenses
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={propertyId || ''}
            onChange={(e) => { setPropertyId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p.propertyId} value={p.propertyId}>
                {p.propertyName}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="MAINTENANCE">Maintenance & Repairs</option>
            <option value="UTILITIES">Utilities (Water/Power)</option>
            <option value="INSURANCE">Property Insurance</option>
            <option value="TAXES">Property Taxes</option>
            <option value="MANAGEMENT_FEE">Management Fees</option>
            <option value="MARKETING">Marketing & Advertising</option>
            <option value="LEGAL">Legal & Professional</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {isLoading ? (
        <LoadingState message="Loading operational expenses..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load expenses'} />
      ) : expenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No expenses logged</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Log Expense" to record maintenance costs or operational bills.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((exp) => (
                  <tr key={exp.expenseId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {exp.description}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {exp.propertyName || `Property #${exp.propertyId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {exp.vendorName || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{exp.expenseDate}</td>
                    <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400 text-sm">
                      ₹{Number(exp.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exp.status} />
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

      {/* Log Expense Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log Operational Expense"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(expenseForm); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Property *</label>
              <select
                required
                value={expenseForm.propertyId}
                onChange={(e) => setExpenseForm({ ...expenseForm, propertyId: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                {properties.map((p) => (
                  <option key={p.propertyId} value={p.propertyId}>
                    {p.propertyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="MAINTENANCE">Maintenance & Repairs</option>
                <option value="UTILITIES">Utilities</option>
                <option value="INSURANCE">Insurance</option>
                <option value="TAXES">Taxes</option>
                <option value="MANAGEMENT_FEE">Management Fee</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <input
              type="text"
              required
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="e.g. Elevator quarterly maintenance contract"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                placeholder="25000"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor (Optional)</label>
            <select
              value={expenseForm.vendorId || ''}
              onChange={(e) => setExpenseForm({ ...expenseForm, vendorId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="">-- Direct Payment (No Vendor) --</option>
              {vendors.map((v) => (
                <option key={v.vendorId} value={v.vendorId}>
                  {v.companyName} ({v.serviceType})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
