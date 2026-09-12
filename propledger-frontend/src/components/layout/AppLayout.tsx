import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Building2, Home, Users, FileText, Receipt,
  CreditCard, TrendingUp, Wrench, Store, BarChart3, Shield,
  Settings, LogOut, Menu, Sun, Moon, ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/master-admin', icon: ShieldCheck,    label: 'Master Admin' },
  { to: '/properties',  icon: Building2,       label: 'Properties' },
  { to: '/units',       icon: Home,            label: 'Units' },
  { to: '/tenants',     icon: Users,           label: 'Tenants' },
  { to: '/leases',      icon: FileText,        label: 'Leases' },
  { to: '/invoices',    icon: Receipt,         label: 'Invoices' },
  { to: '/payments',    icon: CreditCard,      label: 'Payments' },
  { to: '/expenses',    icon: TrendingUp,      label: 'Expenses' },
  { to: '/maintenance', icon: Wrench,          label: 'Maintenance' },
  { to: '/vendors',     icon: Store,           label: 'Vendors' },
  { to: '/reports',     icon: BarChart3,       label: 'Reports' },
  { to: '/audit',       icon: Shield,          label: 'Audit Logs' },
  { to: '/settings',    icon: Settings,        label: 'Settings' },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark') ||
           localStorage.getItem('pl_theme') === 'dark';
  });
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('pl_theme', next ? 'dark' : 'light');
  };
  return { dark, toggle };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-40 w-64 flex flex-col',
      'bg-white dark:bg-[#0e121a] border-r border-slate-200/80 dark:border-white/5',
      'transition-transform duration-300 ease-in-out',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    )}>
      {/* Logo Header */}
      <div className="h-18 flex items-center px-6 border-b border-slate-100 dark:border-white/5 shrink-0 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30 text-white font-black text-lg">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">PropLedger</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Real Estate</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            )}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section (Pill card format) */}
      <div className="shrink-0 p-4 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-sm">
              {user?.fullName?.[0] ?? 'V'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'Vishal Bhutekar'}</p>
              <p className="text-[10px] text-slate-400 truncate font-mono">{user?.roles?.[0] || 'SUPER_ADMIN'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#0b0e14]">
      <Sidebar />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top Floating Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white/80 dark:bg-[#0e121a]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 sticky top-0 z-20">
          <button
            className="p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden text-slate-700 dark:text-slate-300"
            onClick={() => setSidebarOpen(true)}
            title="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono tracking-tight">Spring Boot 3.3 • PostgreSQL</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all"
              title="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="hidden md:inline">{user?.fullName || 'Master Administrator'}</span>
              <span className="font-mono text-[10px] text-slate-400">Local Enterprise</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
