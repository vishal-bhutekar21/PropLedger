import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/client';
import { StatCard, LoadingState, ErrorState } from '../../components/ui';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { OccupancyChart } from '../../components/charts/OccupancyChart';
import { TopPropertiesChart } from '../../components/charts/TopPropertiesChart';
import {
  Building2, Home, Users, DollarSign, AlertCircle,
  Wrench, TrendingDown, Clock, FileWarning
} from 'lucide-react';

function formatCurrency(n: number) {
  if (n >= 1_00_00_000) return '₹' + (n / 1_00_00_000).toFixed(1) + 'Cr';
  if (n >= 1_00_000) return '₹' + (n / 1_00_000).toFixed(1) + 'L';
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

  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  if (isError) return <ErrorState message="Failed to load dashboard." onRetry={refetch} />;

  const s = summary!;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Portfolio overview and key performance indicators</p>
      </div>

      {/* Alert banner */}
      {(s.urgentMaintenanceRequests > 0 || s.overdueInvoices > 0 || s.leasesExpiringIn30Days > 0) && (
        <div className="flex flex-wrap gap-2">
          {s.urgentMaintenanceRequests > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              {s.urgentMaintenanceRequests} urgent maintenance requests
            </div>
          )}
          {s.overdueInvoices > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-medium">
              <FileWarning className="h-3.5 w-3.5" />
              {s.overdueInvoices} overdue invoices
            </div>
          )}
          {s.leasesExpiringIn30Days > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              {s.leasesExpiringIn30Days} leases expiring in 30 days
            </div>
          )}
        </div>
      )}

      {/* KPI Grid — Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Properties" value={s.totalProperties} icon={Building2} color="brand" />
        <StatCard label="Total Units" value={s.totalUnits.toLocaleString()} icon={Home} color="blue" />
        <StatCard label="Occupancy Rate" value={`${s.occupancyRate ?? 0}%`} icon={Users} color="green"
          trend={Number(s.occupancyRate) - 80} trendLabel="vs 80% target" />
        <StatCard label="Active Tenants" value={s.activeTenants} icon={Users} color="purple" />
      </div>

      {/* KPI Grid — Row 2: Financial */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Monthly Revenue" value={formatCurrency(Number(s.monthlyRevenue))} icon={DollarSign} color="green" />
        <StatCard label="Outstanding Rent" value={formatCurrency(Number(s.outstandingAmount))} icon={TrendingDown} color="amber" />
        <StatCard label="Maintenance Cost" value={formatCurrency(Number(s.maintenanceCost))} icon={Wrench} color="red" />
        <StatCard label="Net Op. Income" value={formatCurrency(Number(s.netOperatingIncome))} icon={DollarSign} color="brand" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-text-primary dark:text-white">Revenue Trend (12 months)</h3>
          </div>
          <div className="p-4">
            <RevenueChart data={revenueTrend ?? []} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-text-primary dark:text-white">Occupancy by Status</h3>
          </div>
          <div className="p-4">
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
          <h3 className="text-sm font-semibold text-text-primary dark:text-white">Top Properties by Revenue</h3>
        </div>
        <div className="p-4">
          <TopPropertiesChart data={topProperties ?? []} />
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-xl font-bold text-text-primary dark:text-white">{s.activeLeases}</div>
          <div className="text-xs text-text-secondary dark:text-slate-400 mt-1">Active Leases</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-bold text-text-primary dark:text-white">{s.openMaintenanceRequests}</div>
          <div className="text-xs text-text-secondary dark:text-slate-400 mt-1">Open Requests</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-bold text-text-primary dark:text-white">{s.leasesExpiringIn30Days}</div>
          <div className="text-xs text-text-secondary dark:text-slate-400 mt-1">Expiring (30d)</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-bold text-red-500">{s.overdueInvoices}</div>
          <div className="text-xs text-text-secondary dark:text-slate-400 mt-1">Overdue Invoices</div>
        </div>
      </div>
    </div>
  );
}
