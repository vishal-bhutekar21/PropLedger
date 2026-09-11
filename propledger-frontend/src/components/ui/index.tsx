import { clsx } from 'clsx';

// ── StatusBadge ──────────────────────────────────────────
const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'badge-success',
  OCCUPIED: 'badge-info',
  VACANT: 'badge-neutral',
  MAINTENANCE: 'badge-warning',
  RESERVED: 'badge-purple',
  INACTIVE: 'badge-neutral',
  BLACKLISTED: 'badge-danger',
  PENDING: 'badge-warning',
  EXPIRED: 'badge-neutral',
  TERMINATED: 'badge-danger',
  PAID: 'badge-success',
  PARTIALLY_PAID: 'badge-warning',
  UNPAID: 'badge-neutral',
  OVERDUE: 'badge-danger',
  VOID: 'badge-neutral',
  SUCCESS: 'badge-success',
  FAILED: 'badge-danger',
  REFUNDED: 'badge-purple',
  CANCELLED: 'badge-neutral',
  OPEN: 'badge-info',
  ASSIGNED: 'badge-warning',
  IN_PROGRESS: 'badge-purple',
  RESOLVED: 'badge-success',
  CLOSED: 'badge-neutral',
  LOW: 'badge-neutral',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
  URGENT: 'badge-danger',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status] ?? 'badge-neutral';
  return <span className={cls}>{status.replace(/_/g, ' ')}</span>;
}

// ── LoadingState ─────────────────────────────────────────
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-text-secondary dark:text-slate-400">
        <svg className="animate-spin h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-sm">{message}</span>
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
    <div className="empty-state">
      <svg className="h-12 w-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="font-medium text-text-primary dark:text-slate-200">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── ErrorState ───────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="empty-state">
      <svg className="h-12 w-12 mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="font-medium text-text-primary dark:text-slate-200">Something went wrong</p>
      {message && <p className="text-sm mt-1">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-4">Try again</button>
      )}
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────
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
      <div className="flex items-start justify-between">
        <span className="stat-label">{cardTitle}</span>
        {Icon && (
          <div className={clsx('p-2 rounded', `bg-${color}-50 dark:bg-${color}-900/20`)}>
            {typeof Icon === 'function' ? (
              <Icon className={clsx('h-4 w-4', `text-${color}-500`)} />
            ) : (
              Icon
            )}
          </div>
        )}
      </div>
      <span className="stat-value">{value}</span>
      {(trend !== undefined || subtitle) && (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={clsx('stat-change', trendPos ? 'up' : 'down')}>
              {trendPos ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {(trendLabel || subtitle) && (
            <span className="text-xs text-text-secondary dark:text-slate-500">
              {trendLabel ?? subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────
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
    <div className="flex items-center justify-between px-4 py-3 border-t border-border dark:border-border-dark text-sm">
      <span className="text-text-secondary dark:text-slate-400">
        Showing {from}–{to} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        <button className="btn-ghost btn-sm" disabled={activePage === 0} onClick={() => onPageChange(0)}>«</button>
        <button className="btn-ghost btn-sm" disabled={activePage === 0} onClick={() => onPageChange(activePage - 1)}>‹</button>
        <span className="px-3 py-1 text-xs font-medium">{activePage + 1} / {totalPages}</span>
        <button className="btn-ghost btn-sm" disabled={activePage >= totalPages - 1} onClick={() => onPageChange(activePage + 1)}>›</button>
        <button className="btn-ghost btn-sm" disabled={activePage >= totalPages - 1} onClick={() => onPageChange(totalPages - 1)}>»</button>
      </div>
    </div>
  );
}

// ── SearchBar ────────────────────────────────────────────
export function SearchBar({
  value, onChange, placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary"
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 w-64"
      />
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={clsx('relative w-full card shadow-modal animate-slide-in', widths[size])}>
        <div className="card-header">
          <h3 className="font-semibold text-text-primary dark:text-white">{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="card-body">{children}</div>
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
      <p className="text-sm text-text-secondary dark:text-slate-400 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

// ── Skeleton rows ────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border dark:border-border-dark">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="skeleton h-4 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
