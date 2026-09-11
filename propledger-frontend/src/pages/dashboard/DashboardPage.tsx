import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/client';
import { StatCard, LoadingState, ErrorState } from '../../components/ui';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { OccupancyChart } from '../../components/charts/OccupancyChart';
import { TopPropertiesChart } from '../../components/charts/TopPropertiesChart';
import {
  Building2, Home, Users, DollarSign, AlertCircle,
  Wrench, TrendingDown, Clock, FileWarning, Sparkles
} from 'lucide-react';

function formatCurrency(n: number) {
  if (n >= 1_00_00_000) return '₹' + (n / 1_00_00_000).toFixed(1) + 'Cr';
  if (n >= 1_00_00_000) return '₹' + (n / 1_00_000).toFixed(1) + 'L';
  return '₹' + n.toLocaleString('en-IN');
}

export default function DashboardPage() {
  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
    staleTime: 60_000,
  });

  const { data: revenueTrend } = useQuery({
    queryKey: ['dashboard-revenue-trend'],
    queryFn: () => dashboardApi.revenueTrend(12),
    staleTime: 5 * 60_000,
  });

  const { data: topProperties } = useQuery({
    queryKey: ['dashboard-top-properties'],
    queryFn: () => dashboardApi.topProperties(5),
    staleTime: 5 * 60_000,
  });

  if (isLoading) return <LoadingState message="Loading dashboard intelligence..." />;
  if (isError) return <ErrorState message="Failed to load dashboard portfolio metrics." onRetry={refetch} />;

  const s = summary!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider font-mono">
              Live Edge Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time commercial real estate operations, subledger balances, and asset performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-full bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>AI Cash Flow Forecasting</span>
          </div>
        </div>
      </div>

      {/* Alert Banner Pills (Swish Pill Badges) */}
      {(s.urgentMaintenanceRequests > 0 || s.overdueInvoices > 0 || s.leasesExpiringIn30Days > 0) && (
        <div className="flex flex-wrap gap-2.5">
          {s.urgentMaintenanceRequests > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold shadow-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{s.urgentMaintenanceRequests} urgent maintenance requests</span>
            </div>
          )}
          {s.overdueInvoices > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm">
              <FileWarning className="h-4 w-4 shrink-0" />
              <span>{s.overdueInvoices} overdue rent invoices</span>
            </div>
          )}
          {s.leasesExpiringIn30Days > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-600 dark:text-sky-400 text-xs font-bold shadow-sm">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{s.leasesExpiringIn30Days} leases expiring within 30 days</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Grid — Operational (rounded-3xl cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
        <StatCard label="Total Properties" value={s.totalProperties} icon={Building2} color="brand" />
        <StatCard label="Total Units" value={s.totalUnits.toLocaleString()} icon={Home} color="blue" />
        <StatCard label="Occupancy Rate" value={`${s.occupancyRate ?? 0}%`} icon={Users} color="green"
          trend={Number(s.occupancyRate) - 80} trendLabel="vs 80% target" />
        <StatCard label="Active Tenants" value={s.activeTenants} icon={Users} color="purple" />
      </div>

      {/* KPI Grid — Financial Balances */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
        <StatCard label="Monthly Revenue" value={formatCurrency(Number(s.monthlyRevenue))} icon={DollarSign} color="green" />
        <StatCard label="Outstanding Rent" value={formatCurrency(Number(s.outstandingAmount))} icon={TrendingDown} color="amber" />
        <StatCard label="Maintenance Cost" value={formatCurrency(Number(s.maintenanceCost))} icon={Wrench} color="red" />
        <StatCard label="Net Op. Income" value={formatCurrency(Number(s.netOperatingIncome))} icon={DollarSign} color="brand" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Revenue Trend</h3>
              <p className="text-xs text-slate-400">12-Month recurring rent and billing trend</p>
            </div>
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full bg-brand-500/10">12 MONTHS</span>
          </div>
          <div className="p-6">
            <RevenueChart data={revenueTrend ?? []} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Occupancy by Status</h3>
              <p className="text-xs text-slate-400">Real-time inventory ratio</p>
            </div>
          </div>
          <div className="p-6">
            <OccupancyChart
              occupied={Number(s.occupiedUnits)}
              vacant={Number(s.vacantUnits)}
              maintenance={Number(s.totalUnits) - Number(s.occupiedUnits) - Number(s.vacantUnits)}
            />
          </div>
        </div>
      </div>

      {/* Top Properties */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Top Properties by Cash Generation</h3>
            <p className="text-xs text-slate-400">Highest grossing commercial real estate assets</p>
          </div>
        </div>
        <div className="p-6">
          <TopPropertiesChart data={topProperties ?? []} />
        </div>
      </div>

      {/* Quick Stats Chips (Swish rounded-2xl chips) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5 text-center">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{s.activeLeases}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active Leases</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{s.openMaintenanceRequests}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Open Requests</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{s.leasesExpiringIn30Days}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Expiring (30d)</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-2xl font-black text-rose-500 font-mono">{s.overdueInvoices}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Overdue Invoices</div>
        </div>
      </div>
    </div>
  );
}
