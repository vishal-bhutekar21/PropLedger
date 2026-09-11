import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, unitsApi } from '../../api/client';
import { StatusBadge, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { Wrench, Plus } from 'lucide-react';
import type { MaintenanceRequest, Unit } from '../../types';

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolveModal, setResolveModal] = useState<{ isOpen: boolean; requestId: number | null }>({
    isOpen: false,
    requestId: null,
  });
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actualCost, setActualCost] = useState('');

  // Form state
  const [ticketForm, setTicketForm] = useState({
    unitId: 0,
    tenantId: undefined as number | undefined,
    title: '',
    description: '',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    estimatedCost: 1500,
  });

  const { data: unitsData } = useQuery({
    queryKey: ['units-list-all'],
    queryFn: () => unitsApi.list({ size: 100 }),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['maintenance', { page, priority, status }],
    queryFn: () => maintenanceApi.list({
      page,
      size: 15,
      priority: priority || undefined,
      status: status || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (newTicket: typeof ticketForm) => maintenanceApi.create({
      ...newTicket,
      unitId: Number(newTicket.unitId),
      tenantId: newTicket.tenantId ? Number(newTicket.tenantId) : undefined,
      estimatedCost: Number(newTicket.estimatedCost),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setIsCreateOpen(false);
      setTicketForm({
        unitId: 0,
        tenantId: undefined,
        title: '',
        description: '',
        category: 'PLUMBING',
        priority: 'MEDIUM',
        estimatedCost: 1500,
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus, notes, cost }: { id: number; newStatus: string; notes?: string; cost?: number }) =>
      maintenanceApi.update(id, {
        status: newStatus,
        resolutionNotes: notes,
        actualCost: cost,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setResolveModal({ isOpen: false, requestId: null });
      setResolutionNotes('');
      setActualCost('');
    },
  });

  const requests: MaintenanceRequest[] = data?.content || [];
  const units: Unit[] = unitsData?.content || [];

  const getPriorityBadge = (p: string) => {
    switch (p?.toUpperCase()) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Operations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Work order tracking, preventive maintenance, repair SLAs, and vendor assignment
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Ticket
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {data?.totalElements || 0} Tickets
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table */}
      {isLoading ? (
        <LoadingState message="Loading maintenance work orders..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load maintenance tickets'} />
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No maintenance tickets</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Create Ticket" to lodge a repair or service request.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Ticket ID & Title</th>
                  <th className="px-4 py-3">Location & Tenant</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Cost (Est / Act)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{req.title}</div>
                      <div className="text-[11px] text-slate-400">#{req.requestId} · {req.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{req.propertyName} · Unit {req.unitNumber}</div>
                      <div className="text-[11px] text-slate-400">{req.tenantName || 'Vacant Unit'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                      {req.category}
                    </td>
                    <td className="px-4 py-3">
                      {getPriorityBadge(req.priority)}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      ₹{Number(req.estimatedCost || 0).toLocaleString()} / <span className="font-bold text-slate-900 dark:text-white">₹{Number(req.actualCost || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'OPEN' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: req.requestId, newStatus: 'IN_PROGRESS' })}
                            className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded font-semibold text-[10px] hover:bg-blue-100 transition-colors"
                          >
                            Start Work
                          </button>
                        )}
                        {req.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => setResolveModal({ isOpen: true, requestId: req.requestId })}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold text-[10px] hover:bg-emerald-100 transition-colors"
                          >
                            Resolve Ticket
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

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Lodge Maintenance Request"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(ticketForm); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Unit *</label>
            <select
              required
              value={ticketForm.unitId}
              onChange={(e) => setTicketForm({ ...ticketForm, unitId: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="">-- Choose Affected Unit --</option>
              {units.map((u) => (
                <option key={u.unitId} value={u.unitId}>
                  {u.unitNumber} ({u.propertyName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              value={ticketForm.title}
              onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
              placeholder="e.g. Master bathroom water heater leaking"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="APPLIANCE">Appliance</option>
                <option value="STRUCTURAL">Structural</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
              <select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="LOW">Low (7 days)</option>
                <option value="MEDIUM">Medium (48 hrs)</option>
                <option value="HIGH">High (24 hrs)</option>
                <option value="URGENT">Urgent (4 hrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Location</label>
            <textarea
              rows={2}
              required
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              placeholder="Describe the issue in detail..."
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
              disabled={createMutation.isPending || !ticketForm.unitId}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? 'Lodging...' : 'Lodge Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve Ticket Modal */}
      <Modal
        isOpen={resolveModal.isOpen}
        onClose={() => setResolveModal({ isOpen: false, requestId: null })}
        title="Resolve Maintenance Ticket"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Actual Repair Cost (₹) *</label>
            <input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              placeholder="e.g. 1800"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resolution Summary / Technician Notes *</label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Replaced damaged gasket and verified pressure integrity."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setResolveModal({ isOpen: false, requestId: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!resolutionNotes || updateStatusMutation.isPending}
              onClick={() => {
                if (resolveModal.requestId) {
                  updateStatusMutation.mutate({
                    id: resolveModal.requestId,
                    newStatus: 'RESOLVED',
                    notes: resolutionNotes,
                    cost: actualCost ? Number(actualCost) : undefined,
                  });
                }
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {updateStatusMutation.isPending ? 'Resolving...' : 'Complete & Resolve'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
