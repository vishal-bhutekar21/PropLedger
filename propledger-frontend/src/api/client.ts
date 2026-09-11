import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pl_token');
      localStorage.removeItem('pl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────
export const authApi = {
  login: (data: { usernameOrEmail: string; password: string }) =>
    apiClient.post('/api/auth/login', data).then(r => r.data),
  register: (data: unknown) =>
    apiClient.post('/api/auth/register', data).then(r => r.data),
  me: () => apiClient.get('/api/auth/me').then(r => r.data),
};

// ── Dashboard ─────────────────────────────────
export const dashboardApi = {
  summary: () => apiClient.get('/api/dashboard/summary').then(r => r.data),
  revenueTrend: (months = 12) => apiClient.get(`/api/dashboard/revenue-trend?months=${months}`).then(r => r.data),
  topProperties: (limit = 5) => apiClient.get(`/api/dashboard/top-properties?limit=${limit}`).then(r => r.data),
};

// ── Properties ────────────────────────────────
export const propertiesApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/properties', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/properties/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/properties', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put(`/api/properties/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/properties/${id}`).then(r => r.data),
  financialSummary: (id: number) => apiClient.get(`/api/properties/${id}/financial-summary`).then(r => r.data),
};

// ── Buildings ─────────────────────────────────
export const buildingsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/buildings', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/buildings/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/buildings', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put(`/api/buildings/${id}`, data).then(r => r.data),
};

// ── Units ─────────────────────────────────────
export const unitsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/units', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/units/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/units', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put(`/api/units/${id}`, data).then(r => r.data),
};

// ── Tenants ───────────────────────────────────
export const tenantsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/tenants', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/tenants/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/tenants', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put(`/api/tenants/${id}`, data).then(r => r.data),
};

// ── Leases ────────────────────────────────────
export const leasesApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/leases', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/leases/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/leases', data).then(r => r.data),
  activate: (id: number) => apiClient.put(`/api/leases/${id}/activate`).then(r => r.data),
  terminate: (id: number, reason: string) => apiClient.put(`/api/leases/${id}/terminate`, { reason }).then(r => r.data),
  renew: (id: number, data: unknown) => apiClient.post(`/api/leases/${id}/renew`, data).then(r => r.data),
  expiring: (days = 30) => apiClient.get(`/api/leases/expiring?days=${days}`).then(r => r.data),
};

// ── Invoices ──────────────────────────────────
export const invoicesApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/invoices', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/invoices/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/invoices', data).then(r => r.data),
};

// ── Payments ──────────────────────────────────
export const paymentsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/payments', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/payments/${id}`).then(r => r.data),
  record: (data: unknown) => apiClient.post('/api/payments', data).then(r => r.data),
};

// ── Expenses ──────────────────────────────────
export const expensesApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/expenses', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/expenses/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/expenses', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put(`/api/expenses/${id}`, data).then(r => r.data),
};

// ── Vendors ───────────────────────────────────
export const vendorsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/vendors', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/vendors/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/vendors', data).then(r => r.data),
};

// ── Maintenance ───────────────────────────────
export const maintenanceApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/maintenance', { params }).then(r => r.data),
  get: (id: number) => apiClient.get(`/api/maintenance/${id}`).then(r => r.data),
  create: (data: unknown) => apiClient.post('/api/maintenance', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put(`/api/maintenance/${id}`, data).then(r => r.data),
  workOrders: (id: number) => apiClient.get(`/api/maintenance/${id}/work-orders`).then(r => r.data),
};

// ── Reports ───────────────────────────────────
export const reportsApi = {
  occupancy: () => apiClient.get('/api/reports/occupancy').then(r => r.data),
  outstandingRent: (params?: Record<string, unknown>) => apiClient.get('/api/reports/outstanding-rent', { params }).then(r => r.data),
  profitability: (params?: Record<string, unknown>) => apiClient.get('/api/reports/profitability', { params }).then(r => r.data),
  maintenancePerformance: () => apiClient.get('/api/reports/maintenance-performance').then(r => r.data),
  revenueTrend: (months = 12) => apiClient.get(`/api/reports/revenue-trend?months=${months}`).then(r => r.data),
};

// ── Audit Logs ────────────────────────────────
export const auditApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/api/audit-logs', { params }).then(r => r.data),
};
