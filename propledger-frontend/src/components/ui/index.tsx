import { clsx } from 'clsx';

// ── StatusBadge (Swish / BookMyShow pill chip with status dot) ───────
const STATUS_CLASSES: Record<string, { bg: string; dot: string }> = {
  ACTIVE:         { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  OCCUPIED:       { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', dot: 'bg-sky-500' },
  VACANT:         { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  MAINTENANCE:    { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  RESERVED:       { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', dot: 'bg-purple-500' },
  INACTIVE:       { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  BLACKLISTED:    { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
  PENDING:        { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  EXPIRED:        { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  TERMINATED:     { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
  PAID:           { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  PARTIALLY_PAID: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  PARTIAL:        { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  UNPAID:         { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  OVERDUE:        { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500 animate-pulse' },
  VOID:           { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  SUCCESS:        { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  FAILED:         { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
  REFUNDED:       { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', dot: 'bg-purple-500' },
  CANCELLED:      { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  OPEN:           { bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20', dot: 'bg-sky-500' },
  ASSIGNED:       { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  IN_PROGRESS:    { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', dot: 'bg-purple-500' },
  RESOLVED:       { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  CLOSED:         { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  LOW:            { bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  MEDIUM:         { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500' },
  HIGH:           { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
  URGENT:         { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500 animate-pulse' },
  APPROVED:       { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
  REJECTED:       { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', dot: 'bg-rose-500' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_CLASSES[status] ?? {
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400'
  };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border', meta.bg)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', meta.dot)} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ── LoadingState ─────────────────────────────────────────
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4 text-text-secondary dark:text-slate-400">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
          <div className="absolute w-2 h-2 rounded-full bg-brand-500 animate-ping" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-600 dark:text-slate-300">{message}</span>
      </div>
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────
export function EmptyState({
  title = 'No data found',
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-12 flex flex-col items-center justify-center text-center my-6">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="font-extrabold text-base text-text-primary dark:text-white">{title}</p>
      {description && <p className="text-sm text-text-secondary dark:text-slate-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── ErrorState ───────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="card p-12 flex flex-col items-center justify-center text-center my-6 border-rose-500/20">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="font-bold text-base text-text-primary dark:text-white">Something went wrong</p>
      {message && <p className="text-sm text-text-secondary dark:text-slate-400 mt-1 max-w-md font-mono text-xs">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-5">Try again</button>
      )}
    </div>
  );
}

// ── StatCard (Swish style with pill trend and rounded-2xl icon badge) ─
export function StatCard({
  label,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'brand',
}: {
  label?: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
  trend?: number;
  trendLabel?: string;
  color?: string;
}) {
  const trendPos = trend !== undefined && trend >= 0;
  const cardTitle = label || title || '';
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <span className="stat-label">{cardTitle}</span>
        {Icon && (
          <div className={clsx('p-2.5 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', `bg-${color}-500/10 text-${color}-500`)}>
            {typeof Icon === 'function' ? (
              <Icon className="h-5 w-5" />
            ) : (
              Icon
            )}
          </div>
        )}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {(trend !== undefined || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {trend !== undefined && (
              <span className={clsx('stat-change', trendPos ? 'up' : 'down')}>
                {trendPos ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {(trendLabel || subtitle) && (
              <span className="text-xs font-medium text-text-secondary dark:text-slate-400">
                {trendLabel ?? subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pagination (Swish rounded-full pill buttons) ────────────────────
export function Pagination({
  page, currentPage, totalPages, onPageChange, totalElements, size = 15,
}: {
  page?: number;
  currentPage?: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalElements?: number;
  size?: number;
}) {
  const activePage = page ?? currentPage ?? 0;
  const total = totalElements ?? (totalPages * size);
  const from = activePage * size + 1;
  const to = Math.min((activePage + 1) * size, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 card rounded-2xl text-sm">
      <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">
        Showing <strong className="text-text-primary dark:text-white font-mono">{from}–{to}</strong> of <strong className="text-text-primary dark:text-white font-mono">{total.toLocaleString()}</strong> records
      </span>
      <div className="flex items-center gap-1.5">
        <button className="btn-secondary btn-sm" disabled={activePage === 0} onClick={() => onPageChange(0)} title="First page">«</button>
        <button className="btn-secondary btn-sm" disabled={activePage === 0} onClick={() => onPageChange(activePage - 1)} title="Previous page">‹ Prev</button>
        <span className="px-3.5 py-1 text-xs font-bold font-mono rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {activePage + 1} / {totalPages}
        </span>
        <button className="btn-secondary btn-sm" disabled={activePage >= totalPages - 1} onClick={() => onPageChange(activePage + 1)} title="Next page">Next ›</button>
        <button className="btn-secondary btn-sm" disabled={activePage >= totalPages - 1} onClick={() => onPageChange(totalPages - 1)} title="Last page">»</button>
      </div>
    </div>
  );
}

// ── SearchBar (Rounded-full pill search input) ──────────────────────
export function SearchBar({
  value, onChange, placeholder = 'Search portfolio...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary dark:text-slate-400 pointer-events-none"
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-11 pr-4 py-2.5 rounded-full text-xs font-medium w-full sm:w-72"
      />
    </div>
  );
}

// ── Modal (Swish rounded-3xl smooth backdrop blur modal) ────────────
export function Modal({
  open, isOpen, onClose, title, children, size = 'md',
}: {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const isVisible = open ?? isOpen ?? false;
  if (!isVisible) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={clsx('relative w-full card shadow-modal animate-slide-in overflow-hidden z-10', widths[size])}>
        <div className="card-header bg-slate-50/50 dark:bg-white/[0.02]">
          <h3 className="font-extrabold text-base text-text-primary dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-icon" title="Close">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="card-body max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ── ConfirmDialog ────────────────────────────────────────
export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-text-secondary dark:text-slate-300 mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-2.5">
        <button className="btn-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// ── Skeleton rows ────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border dark:border-white/5">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-5 py-4">
              <div className="skeleton h-4 rounded-xl w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
