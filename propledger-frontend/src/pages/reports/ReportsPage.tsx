import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/client';
import { LoadingState } from '../../components/ui';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { BarChart3, TrendingUp, Clock, AlertOctagon, Building2 } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'occupancy' | 'outstanding' | 'profitability' | 'maintenance' | 'trends'>('occupancy');

  const { data: occupancyData, isLoading: isOccLoading } = useQuery({
    queryKey: ['report-occupancy'],
    queryFn: () => reportsApi.occupancy(),
    enabled: activeTab === 'occupancy',
  });

  const { data: outstandingData, isLoading: isOutLoading } = useQuery({
    queryKey: ['report-outstanding'],
    queryFn: () => reportsApi.outstandingRent(),
    enabled: activeTab === 'outstanding',
  });

  const { data: profitData, isLoading: isProfitLoading } = useQuery({
    queryKey: ['report-profitability'],
    queryFn: () => reportsApi.profitability(),
    enabled: activeTab === 'profitability',
  });

  const { data: maintData, isLoading: isMaintLoading } = useQuery({
    queryKey: ['report-maintenance'],
    queryFn: () => reportsApi.maintenancePerformance(),
    enabled: activeTab === 'maintenance',
  });

  const { data: trendData, isLoading: isTrendLoading } = useQuery({
    queryKey: ['report-trend'],
    queryFn: () => reportsApi.revenueTrend(12),
    enabled: activeTab === 'trends',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enterprise Financial & Operational Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Advanced PostgreSQL analytics powered by window functions, CTEs, and financial aggregations
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('occupancy')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'occupancy'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Portfolio Occupancy
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'outstanding'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Rent Roll & Aging (30/60/90+)
        </button>
        <button
          onClick={() => setActiveTab('profitability')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profitability'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Property Profitability & NOI
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Maintenance SLAs & MTTR
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'trends'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Cash Flow Trends
        </button>
      </div>

      {/* Tab 1: Occupancy */}
      {activeTab === 'occupancy' && (
        <div className="space-y-4">
          {isOccLoading ? (
            <LoadingState message="Calculating occupancy metrics..." />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Property Name</th>
                      <th className="px-4 py-3">Total Units</th>
                      <th className="px-4 py-3">Occupied</th>
                      <th className="px-4 py-3">Vacant</th>
                      <th className="px-4 py-3">Reserved</th>
                      <th className="px-4 py-3">Occupancy Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(Array.isArray(occupancyData) ? occupancyData : []).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {row.property_name || row.propertyName}
                        </td>
                        <td className="px-4 py-3">{row.total_units || row.totalUnits}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          {row.occupied_units || row.occupiedUnits}
                        </td>
                        <td className="px-4 py-3 text-rose-500">
                          {row.vacant_units || row.vacantUnits}
                        </td>
                        <td className="px-4 py-3 text-blue-500">
                          {row.reserved_units || row.reservedUnits || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${row.occupancy_rate || row.occupancyRate || 0}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {row.occupancy_rate || row.occupancyRate || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Outstanding Rent Aging */}
      {activeTab === 'outstanding' && (
        <div className="space-y-4">
          {isOutLoading ? (
            <LoadingState message="Running aging analysis..." />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Tenant Name</th>
                      <th className="px-4 py-3">Unit / Property</th>
                      <th className="px-4 py-3">Current (0-30d)</th>
                      <th className="px-4 py-3">31-60 Days</th>
                      <th className="px-4 py-3">61-90 Days</th>
                      <th className="px-4 py-3">90+ Days (Critical)</th>
                      <th className="px-4 py-3">Total Overdue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(Array.isArray(outstandingData) ? outstandingData : []).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {row.tenant_name || row.tenantName}
                        </td>
                        <td className="px-4 py-3">
                          {row.unit_number || row.unitNumber} ({row.property_name || row.propertyName})
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          ₹{Number(row.days_0_30 || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-amber-600">
                          ₹{Number(row.days_31_60 || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-orange-600 font-semibold">
                          ₹{Number(row.days_61_90 || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-bold">
                          ₹{Number(row.days_90_plus || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          ₹{Number(row.total_overdue || row.totalOutstanding || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profitability & NOI */}
      {activeTab === 'profitability' && (
        <div className="space-y-4">
          {isProfitLoading ? (
            <LoadingState message="Aggregating revenue and expenses..." />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Property Name</th>
                      <th className="px-4 py-3">Total Invoiced</th>
                      <th className="px-4 py-3">Total Collected</th>
                      <th className="px-4 py-3">Total Expenses</th>
                      <th className="px-4 py-3">Net Operating Income (NOI)</th>
                      <th className="px-4 py-3">Operating Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(Array.isArray(profitData) ? profitData : []).map((row: any, idx: number) => {
                      const collected = Number(row.total_collected || row.totalCollected || 0);
                      const expenses = Number(row.total_expenses || row.totalExpenses || 0);
                      const noi = Number(row.net_operating_income || row.noi || (collected - expenses));
                      const margin = collected > 0 ? Math.round((noi / collected) * 100) : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {row.property_name || row.propertyName}
                          </td>
                          <td className="px-4 py-3">
                            ₹{Number(row.total_invoiced || row.totalInvoiced || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                            ₹{collected.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
                            ₹{expenses.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            ₹{noi.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                            {margin}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Maintenance SLAs & MTTR */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {isMaintLoading ? (
            <LoadingState message="Benchmarking maintenance resolution..." />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Property / Category</th>
                      <th className="px-4 py-3">Total Requests</th>
                      <th className="px-4 py-3">Resolved</th>
                      <th className="px-4 py-3">Resolution Rate</th>
                      <th className="px-4 py-3">Avg MTTR (Hours)</th>
                      <th className="px-4 py-3">Total Maintenance Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(Array.isArray(maintData) ? maintData : []).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {row.property_name || row.category || 'General Operations'}
                        </td>
                        <td className="px-4 py-3">{row.total_requests || row.totalRequests || 0}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          {row.resolved_requests || row.resolvedRequests || 0}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {row.resolution_rate || row.resolutionRate || 100}%
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                          {row.avg_resolution_hours || row.avgHours || 24} hrs
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          ₹{Number(row.total_cost || row.totalCost || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Cash Flow Trends Chart */}
      {activeTab === 'trends' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Trailing 12-Month Invoiced vs Collected Cash Flow</h2>
          </div>
          {isTrendLoading ? (
            <LoadingState message="Rendering historical cash flow..." />
          ) : (
            <RevenueChart data={Array.isArray(trendData) ? trendData : []} />
          )}
        </div>
      )}
    </div>
  );
}
