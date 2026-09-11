import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/client';
import { Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { ShieldCheck, Eye, Terminal } from 'lucide-react';
import type { AuditLog } from '../../types';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['audit-logs', { page, entityType, action }],
    queryFn: () => auditApi.list({
      page,
      size: 20,
      entityType: entityType || undefined,
      action: action || undefined,
    }),
  });

  const logs: AuditLog[] = data?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compliance & System Audit Trail</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Immutable SOC2 and regulatory logging with change deltas and user attribution
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {data?.totalElements || 0} Audit Events
        </div>
        <div className="flex items-center gap-3">
          <select
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Entities</option>
            <option value="Property">Property</option>
            <option value="Unit">Unit</option>
            <option value="Lease">Lease</option>
            <option value="Payment">Payment</option>
            <option value="Invoice">Invoice</option>
            <option value="MaintenanceRequest">Maintenance</option>
          </select>

          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="STATUS_CHANGE">Status Change</option>
            <option value="PAYMENT_RECORDED">Payment Recorded</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <LoadingState message="Loading immutable audit logs..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load audit logs'} />
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No audit records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Activity is automatically logged upon any create, update, or payment event.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type & ID</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-sans font-bold text-slate-900 dark:text-white">
                      {log.username || `User #${log.userId}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('DELETE') ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{log.entityType}</span>
                      <span className="text-slate-400 ml-1">#{log.entityId}</span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-300 truncate max-w-xs">
                      {log.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      {(log.oldValue || log.newValue) && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                          title="View JSON Delta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
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

      {/* JSON Diff / Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Delta: ${selectedLog?.action} on ${selectedLog?.entityType} #${selectedLog?.entityId}`}
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Terminal className="w-4 h-4 text-indigo-500" />
              <span>Event ID: {selectedLog.logId} · User: {selectedLog.username}</span>
            </div>

            {selectedLog.oldValue && (
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State Before (Old Value)</div>
                <pre className="p-3 bg-slate-900 text-rose-300 text-[11px] rounded-lg overflow-x-auto font-mono">
                  {JSON.stringify(selectedLog.oldValue, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.newValue && (
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State After (New Value)</div>
                <pre className="p-3 bg-slate-900 text-emerald-300 text-[11px] rounded-lg overflow-x-auto font-mono">
                  {JSON.stringify(selectedLog.newValue, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
