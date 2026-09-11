import os
import sys
sys.path.append(os.path.dirname(__file__))
from engine import PropLedgerPdfEngine

def build_doc_09(output_path="docs/pdf/09_Frontend_Architecture_And_React19.pdf"):
    doc = PropLedgerPdfEngine(
        filename=output_path,
        volume_num=9,
        volume_title="Frontend Architecture & React 19",
        volume_category="FRONTEND ENGINEERING & DESIGN SYSTEMS"
    )

    # PAGE 1: COVER PAGE
    topics = [
        ["02", "React 19 Core Paradigms", "Actions, async transitions, ref as prop, and Fiber reconciliation"],
        ["03", "Enterprise TypeScript Architecture", "Strict typings, generics envelopes, and discriminated unions"],
        ["04", "State Management Taxonomy", "Server state vs global client state vs local UI state breakdown"],
        ["05", "TanStack React Query v5", "Stale-while-revalidate, automatic deduplication, and cache invalidation"],
        ["06", "Atomic Component Architecture", "Custom UI kit: StatCard, Modal, StatusBadge, Pagination, SearchBar"],
        ["07", "Responsive Layout & Protected Routes", "Sidebar navigation, TopNav, and client-side authentication guards"],
        ["08", "Tailwind CSS & Design Systems", "Utility-first design tokens, dark-slate palette, and zero-runtime CSS"],
        ["09", "Interactive Financial Charts", "Recharts SVG visualizations: Area, Bar, and Pie distribution charts"],
        ["10", "Top 25 Frontend Interview Questions", "High-yield React, hooks, performance, and Web Vitals interview Q&A"]
    ]
    doc.draw_cover_page(
        title="Frontend Architecture & React 19",
        subtitle="TypeScript, TanStack Query, Tailwind CSS & Enterprise UI Kit",
        volume_desc="This volume establishes the frontend engineering standards of PropLedger. Built with React 19, TypeScript 5.6, Vite 6, and Tailwind CSS 3.4, it provides an exhaustive technical analysis of modern component architectures, server-state management via TanStack React Query v5, custom design system primitives, and 25 real-world technical interview questions.",
        key_topics=topics
    )

    # PAGE 2: REACT 19 CORE PARADIGMS
    doc.start_page("2. REACT 19 CORE PARADIGMS & FIBER RECONCILIATION", "Modern Functional Components, Actions & Virtual DOM")
    doc.add_section("1. Key Architectural Additions in React 19")
    doc.add_bullet("1. Actions & Async Transitions", "Built-in handling of asynchronous mutations via useActionState and useOptimistic, eliminating manual loading state flags.")
    doc.add_bullet("2. ref as a Standard Prop", "Function components accept 'ref' directly as a prop; 'forwardRef' is officially deprecated.")
    doc.add_bullet("3. Native Document Metadata", "Built-in support for <title> and <meta> tags directly inside components with automated hoisting to document <head>.")
    doc.add_bullet("4. React Compiler Readiness", "Prepares the codebase for automated memoization, phasing out manual useMemo/useCallback boilerplate.")

    doc.add_section("2. The Fiber Reconciliation Engine")
    doc.add_paragraph("React's Fiber architecture divides rendering into two distinct phases:")
    doc.add_bullet("Render Phase (Asynchronous)", "Builds Virtual DOM tree, computes diffs using an O(N) heuristic algorithm, and can be paused or aborted.")
    doc.add_bullet("Commit Phase (Synchronous)", "Applies calculated mutations to the actual browser DOM in a single atomic flush, preventing layout thrashing.")
    doc.end_page()

    # PAGE 3: ENTERPRISE TYPESCRIPT ARCHITECTURE
    doc.start_page("3. ENTERPRISE TYPESCRIPT ARCHITECTURE", "Strict Typings, Generics & Discriminated Unions")
    doc.add_section("1. Type Parity Between Frontend and Backend")
    doc.add_paragraph("To eliminate runtime payload mismatch bugs, PropLedger's TypeScript interfaces (src/types/index.ts) mirror Java DTOs 1:1:")
    code = """// propledger-frontend/src/types/index.ts
export interface Invoice {
  id: number;
  invoiceNumber: string;
  leaseId: number;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  items?: InvoiceItem[];
}

// Discriminated String Union Types:
export type InvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID';
export type LeaseStatus = 'DRAFT' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED' | 'RENEWED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';"""
    doc.add_code_block(code, "TypeScript 5.6 — Domain Interfaces & Discriminated Unions")

    doc.add_section("2. Generic API Response Envelopes")
    doc.add_paragraph("PropLedger wraps all network calls in generic interfaces: 'ApiResponse<T>' and 'PagedResponse<T>', providing compile-time auto-completion down to individual entity attributes.")
    doc.end_page()

    # PAGE 4: STATE MANAGEMENT TAXONOMY
    doc.start_page("4. STATE MANAGEMENT TAXONOMY: WHY NOT REDUX?", "Server State vs Global Client State vs Ephemeral UI State")
    doc.add_section("1. The Three State Categories in PropLedger")
    headers = ["State Category", "Management Tool", "Data Examples", "Key Operational Features"]
    rows = [
        ["Server State", "TanStack React Query v5", "Invoices, Leases, Units, Metrics", "Stale-while-revalidate, auto-caching, deduplication."],
        ["Global Client State", "React Context API", "Auth Token, User Profile, Theme", "Low-frequency updates, accessible across DOM."],
        ["Local UI State", "useState / useReducer", "Modal Open/Close, Form Inputs", "Ephemeral, isolated to individual component tree."]
    ]
    doc.add_table(headers, rows, [110, 125, 145, 152])

    doc.add_section("2. Why Redux is an Anti-Pattern in Modern Real Estate SPAs")
    doc.add_paragraph("In enterprise SaaS platforms, 90% of data is owned by the server. Redux forces hundreds of lines of boilerplate (actions, reducers, thunks, selectors, normalization) simply to mirror server data. TanStack Query manages server state natively in 5 lines of declarative code.")
    doc.end_page()

    # PAGE 5: TANSTACK REACT QUERY V5
    doc.start_page("5. TANSTACK REACT QUERY V5 & CACHE INVALIDATION", "Stale-While-Revalidate Caching & Coordinated Invalidation")
    doc.add_section("1. The Coordinated Invalidation Pattern")
    doc.add_paragraph("When a user records a payment, four independent UI widgets must update simultaneously: the invoice grid, the payments history list, the dashboard revenue charts, and the aging AR breakdown:")
    code = """// PaymentsPage.tsx: Multi-Cache Invalidation on Mutation
const queryClient = useQueryClient();

const paymentMutation = useMutation({
  mutationFn: (paymentData: PaymentRequest) => api.post('/api/payments', paymentData),
  onSuccess: () => {
    // Atomically invalidate and trigger background refetch of all dependent queries:
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['aging-ar'] });
  },
  onError: (err: any) => {
    toast.error(err.response?.data?.message || 'Payment recording failed');
  }
});"""
    doc.add_code_block(code, "TypeScript — TanStack Query Invalidation Pattern")

    doc.add_section("2. Stale-While-Revalidate Settings")
    doc.add_paragraph("Queries are configured with 'staleTime: 60000' (1 minute). Navigating between pages reuses cached data instantly with zero layout shifts, while refreshing in the background.")
    doc.end_page()

    # PAGE 6: ATOMIC COMPONENT ARCHITECTURE
    doc.start_page("6. ATOMIC COMPONENT ARCHITECTURE & UI PRIMITIVES", "Custom Enterprise Design System Primitives")
    doc.add_section("1. Custom UI Kit Inventory (src/components/ui/)")
    headers = ["Component", "Key Props", "Design Functionality"]
    rows = [
        ["StatCard", "title, value, icon, change, trend", "Executive metric card with trending color accents."],
        ["Modal", "isOpen, onClose, title, children", "Accessible dialog with backdrop blur, portal rendering."],
        ["StatusBadge", "status (string)", "Semantic color pill (PAID = emerald, OVERDUE = rose, PENDING = amber)."],
        ["Pagination", "currentPage, totalPages, onPageChange", "0-indexed page controls with active page indicators."],
        ["SearchBar", "value, onChange, placeholder", "Debounced search input with clearing action."]
    ]
    doc.add_table(headers, rows, [95, 185, 252])

    doc.add_section("2. Production Code: StatusBadge Component")
    code = """// src/components/ui/index.tsx: StatusBadge Component
export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    OCCUPIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    OVERDUE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    MAINTENANCE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-slate-800 text-slate-400'}`}>
      {status}
    </span>
  );
};"""
    doc.add_code_block(code, "TSX — StatusBadge Design Token Implementation")
    doc.end_page()

    # PAGE 7: RESPONSIVE LAYOUT & PROTECTED ROUTES
    doc.start_page("7. RESPONSIVE LAYOUT & CLIENT ROUTE GUARDS", "Collapsible Sidebar, Navigation & React Router v6")
    doc.add_section("1. Client Layout Architecture")
    doc.add_paragraph("PropLedger implements a responsive dashboard layout with persistent left navigation, top bar controls, and protected route guards:")
    code = """// App.tsx: Protected Route Architecture with React Router v6
const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => user?.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};"""
    doc.add_code_block(code, "TSX — Protected Route Guard Implementation")

    doc.add_section("2. Navigation Hierarchy")
    doc.add_paragraph("The navigation sidebar links to all 13 core enterprise modules: Dashboard, Properties, Units, Tenants, Leases, Invoices, Payments, Expenses, Vendors, Maintenance, Reports, and Audit Logs.")
    doc.end_page()

    # PAGE 8: TAILWIND CSS & DESIGN SYSTEM
    doc.start_page("8. TAILWIND CSS & ENTERPRISE DESIGN TOKENS", "Zero-Runtime CSS, Purging & Dark-Slate Aesthetics")
    doc.add_section("1. Why Tailwind CSS Over Runtime CSS-in-JS")
    doc.add_paragraph("Runtime CSS-in-JS (like styled-components) parses CSS in JavaScript on every render, adding CPU and memory overhead. Tailwind CSS generates static utility classes at build time, resulting in **zero runtime overhead** and sub-50KB production CSS bundles.")

    doc.add_section("2. PropLedger Enterprise Design Palette")
    headers = ["Token Category", "Tailwind Class", "HEX Code", "Design Role"]
    rows = [
        ["Background Dark", "bg-slate-950", "#020617", "Global application canvas background"],
        ["Surface Card", "bg-slate-900/50", "#0f172a", "Glassmorphic card panels and modals"],
        ["Primary Accent", "text-emerald-500", "#10b981", "KPI stat gains, paid badges, submit buttons"],
        ["Secondary Accent", "text-sky-500", "#0ea5e9", "Links, active tabs, unit selections"],
        ["Border Accent", "border-slate-800", "#1e293b", "Clean structural divider lines"]
    ]
    doc.add_table(headers, rows, [110, 115, 80, 227])
    doc.end_page()

    # PAGE 9: INTERACTIVE FINANCIAL CHARTS
    doc.start_page("9. INTERACTIVE FINANCIAL DATA VISUALIZATIONS", "Recharts Declarative SVG Curves, Tooltips & Area Charts")
    doc.add_section("1. Recharts Architecture in PropLedger")
    doc.add_paragraph("PropLedger leverages Recharts to render high-performance, responsive SVG charts without canvas pixelation:")
    code = """// RevenueChart.tsx: Monthly Revenue vs OpEx Curves
export const RevenueChart = ({ data }: { data: MonthlyFinancial[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <XAxis dataKey="month" stroke="#64748b" />
      <YAxis stroke="#64748b" tickFormatter={(v) => `$${v / 1000}k`} />
      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
      <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" />
      <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="none" />
    </AreaChart>
  </ResponsiveContainer>
);"""
    doc.add_code_block(code, "TSX — Recharts AreaChart Implementation")
    doc.end_page()

    # PAGE 10: TOP 25 FRONTEND INTERVIEW QUESTIONS
    doc.start_page("10. TOP 25 FRONTEND INTERVIEW QUESTIONS & ANSWERS", "Senior React & TypeScript Engineering Scenarios")
    doc.add_section("1. High-Yield Frontend Interview Questions")

    doc.add_subsection("Question 1: Explain the difference between useMemo, useCallback, and React.memo.")
    doc.add_paragraph("Answer: React.memo is a higher-order component memoizing component render output based on prop shallow equality. useMemo caches the computed result of an expensive calculation between renders. useCallback caches a function definition to preserve reference equality when passing callbacks to memoized child components.")

    doc.add_subsection("Question 2: Why is using array index as a key prop in lists an anti-pattern?")
    doc.add_paragraph("Answer: React uses keys to match virtual DOM nodes across renders. If array indexes are used and items are sorted, filtered, or prepended, indexes shift, causing React to associate existing DOM nodes with different data items. This corrupts form inputs, breaks CSS animations, and causes unnecessary re-renders.")

    doc.add_subsection("Question 3: How do you prevent race conditions in rapid search inputs?")
    doc.add_paragraph("Answer: 1) Debounce search input changes by 300ms. 2) In TanStack Query or Axios, pass an AbortController signal to the fetcher function. When the user types a new character, previous pending HTTP requests are aborted at the browser network layer, guaranteeing that stale responses never overwrite fresh data.")

    doc.add_callout("Frontend Interview Key Takeaway", 
        "Articulating server-state management via React Query versus global client state proves you can build production SPAs without unnecessary Redux overhead.",
        "tip"
    )
    doc.end_page()

    saved = doc.save()
    print(f"Generated Doc 09: {output_path} ({saved} pages)")
    return saved

if __name__ == "__main__":
    build_doc_09()
