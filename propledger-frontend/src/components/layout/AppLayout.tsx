import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Building2, Home, Users, FileText, Receipt,
  CreditCard, TrendingUp, Wrench, Store, BarChart3, Shield,
  Settings, LogOut, Menu, Sun, Moon, ChevronDown, ShieldCheck
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
      'fixed inset-y-0 left-0 z-40 w-60 flex flex-col',
      'bg-white dark:bg-[#13151f] border-r border-border dark:border-border-dark',
      'transition-transform duration-200',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    )}>
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border dark:border-border-dark shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-brand-500 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-text-primary dark:text-white">PropLedger</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-border dark:border-border-dark p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-muted dark:hover:bg-slate-800 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.fullName?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary dark:text-white truncate">{user?.fullName}</p>
            <p className="text-2xs text-text-secondary dark:text-slate-500 truncate">{user?.roles?.[0]}</p>
          </div>
          <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost btn-icon p-1" title="Sign out">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-muted dark:bg-[#0f1117]">
      <Sidebar />

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-60 min-w-0">
        {/* Top bar */}
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 bg-white dark:bg-[#13151f] border-b border-border dark:border-border-dark sticky top-0 z-20">
          <button className="btn-ghost btn-icon lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <button onClick={toggle} className="btn-ghost btn-icon" title="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
            <span className="hidden sm:block">{user?.fullName}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
