import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leasesApi, unitsApi, tenantsApi } from '../../api/client';
import { StatusBadge, SearchBar, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { FileText, Plus, CheckCircle, XCircle } from 'lucide-react';
import type { Lease, Unit, Tenant } from '../../types';

export default function LeasesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [terminateModal, setTerminateModal] = useState<{ isOpen: boolean; leaseId: number | null }>({
    isOpen: false,
    leaseId: null,
  });
  const [terminateReason, setTerminateReason] = useState('');

  // Form state
  const [leaseForm, setLeaseForm] = useState({
    unitId: 0,
    tenantId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentAmount: 35000,
    securityDeposit: 70000,
    paymentDueDay: 5,
    lateFeePercentage: 5,
    gracePeriodDays: 5,
    leaseTerms: 'Standard 11-month residential lease agreement. 2-month notice for termination.',
  });

  const { data: unitsData } = useQuery({
    queryKey: ['available-units'],
    queryFn: () => unitsApi.list({ size: 100 }),
  });

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants-list-all'],
    queryFn: () => tenantsApi.list({ size: 100 }),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['leases', { page, search, status }],
    queryFn: () => leasesApi.list({
      page,
      size: 15,
      search: search || undefined,
      status: status || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (newLease: typeof leaseForm) => leasesApi.create(newLease),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setIsCreateOpen(false);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (leaseId: number) => leasesApi.activate(leaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const terminateMutation = useMutation({
    mutationFn: ({ leaseId, reason }: { leaseId: number; reason: string }) =>
      leasesApi.terminate(leaseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setTerminateModal({ isOpen: false, leaseId: null });
      setTerminateReason('');
    },
  });

  const leases: Lease[] = data?.content || [];
  const units: Unit[] = unitsData?.content || [];
  const tenants: Tenant[] = tenantsData?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lease Agreements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Lifecycle operations, legal contracts, term tracking, and transactional execution
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Draft Lease
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(0); }}
            placeholder="Search by lease # or tenant..."
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="TERMINATED">Terminated</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Leases Table */}
      {isLoading ? (
        <LoadingState message="Loading lease contracts..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load leases'} />
      ) : leases.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No leases found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search filters or draft a new lease contract.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Lease Code</th>
                  <th className="px-4 py-3">Tenant & Property</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Term Duration</th>
                  <th className="px-4 py-3">Monthly Rent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leases.map((lease) => (
                  <tr key={lease.leaseId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {lease.leaseNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{lease.tenantName}</div>
                      <div className="text-[11px] text-slate-400">{lease.propertyName}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {lease.unitNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 dark:text-slate-300">{lease.startDate} &rarr; {lease.endDate}</div>
                      <div className="text-[11px] text-slate-400">Due day: {lease.paymentDueDay}th</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      ₹{Number(lease.rentAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lease.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lease.status === 'DRAFT' && (
                          <button
                            onClick={() => activateMutation.mutate(lease.leaseId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold text-[11px] hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Activate
                          </button>
                        )}
                        {lease.status === 'ACTIVE' && (
                          <button
                            onClick={() => setTerminateModal({ isOpen: true, leaseId: lease.leaseId })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded font-semibold text-[11px] hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Terminate
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

      {/* Create Lease Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Draft New Lease Agreement"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(leaseForm); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Unit *</label>
              <select
                required
                value={leaseForm.unitId}
                onChange={(e) => {
                  const uId = Number(e.target.value);
                  const selectedUnit = units.find(u => u.unitId === uId);
                  setLeaseForm({
                    ...leaseForm,
                    unitId: uId,
                    rentAmount: selectedUnit ? Number(selectedUnit.monthlyRent) : leaseForm.rentAmount,
                    securityDeposit: selectedUnit ? Number(selectedUnit.securityDeposit) : leaseForm.securityDeposit,
                  });
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Unit --</option>
                {units.map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.unitNumber} ({u.propertyName} · ₹{Number(u.monthlyRent).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Tenant *</label>
              <select
                required
                value={leaseForm.tenantId}
                onChange={(e) => setLeaseForm({ ...leaseForm, tenantId: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.tenantId} value={t.tenantId}>
                    {t.fullName} ({t.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={leaseForm.startDate}
                onChange={(e) => setLeaseForm({ ...leaseForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={leaseForm.endDate}
                onChange={(e) => setLeaseForm({ ...leaseForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                required
                value={leaseForm.rentAmount}
                onChange={(e) => setLeaseForm({ ...leaseForm, rentAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Deposit (₹) *</label>
              <input
                type="number"
                required
                value={leaseForm.securityDeposit}
                onChange={(e) => setLeaseForm({ ...leaseForm, securityDeposit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lease Terms / Clauses</label>
            <textarea
              rows={3}
              value={leaseForm.leaseTerms}
              onChange={(e) => setLeaseForm({ ...leaseForm, leaseTerms: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
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
              {createMutation.isPending ? 'Drafting...' : 'Save Draft'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Terminate Modal */}
      <Modal
        isOpen={terminateModal.isOpen}
        onClose={() => setTerminateModal({ isOpen: false, leaseId: null })}
        title="Confirm Lease Early Termination"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Early lease termination triggers a database transaction that marks the lease status as TERMINATED,
            updates the associated unit status back to VACANT, and archives active rent schedules.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Termination Reason *</label>
            <textarea
              required
              rows={3}
              value={terminateReason}
              onChange={(e) => setTerminateReason(e.target.value)}
              placeholder="e.g. Tenant relocation or mutual agreement"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTerminateModal({ isOpen: false, leaseId: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!terminateReason || terminateMutation.isPending}
              onClick={() => {
                if (terminateModal.leaseId) {
                  terminateMutation.mutate({ leaseId: terminateModal.leaseId, reason: terminateReason });
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {terminateMutation.isPending ? 'Processing...' : 'Confirm Termination'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
