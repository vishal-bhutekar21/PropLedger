import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi } from '../../api/client';
import { StatusBadge, SearchBar, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { Users, Plus, Mail, Phone, MapPin } from 'lucide-react';
import type { Tenant } from '../../types';

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Tenant form state
  const [tenantForm, setTenantForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    nationalId: '',
    addressLine1: '',
    city: '',
    state: '',
    country: 'India',
    status: 'ACTIVE',
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tenants', { page, search, status }],
    queryFn: () => tenantsApi.list({
      page,
      size: 15,
      search: search || undefined,
      status: status || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (newTenant: typeof tenantForm) => tenantsApi.create(newTenant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsCreateOpen(false);
      setTenantForm({
        fullName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        nationalId: '',
        addressLine1: '',
        city: '',
        state: '',
        country: 'India',
        status: 'ACTIVE',
      });
    },
  });

  const tenants: Tenant[] = data?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tenant Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resident profiles, identity verification (KYC), contact details, and lease history
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Tenant
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(0); }}
            placeholder="Search by name, email, or phone..."
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROSPECT">Prospect</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLACKLISTED">Blacklisted</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      {isLoading ? (
        <LoadingState message="Loading tenant profiles..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load tenants'} />
      ) : tenants.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No tenants found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search criteria or register a new tenant.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Tenant Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">National ID / KYC</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{tenant.fullName}</div>
                      <div className="text-[11px] text-slate-400">ID: #{tenant.tenantId}</div>
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tenant.email}</span>
                      </div>
                      {tenant.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tenant.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {tenant.nationalId || 'Verified'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{tenant.city || '—'}, {tenant.state || ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '—'}
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

      {/* Create Tenant Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Tenant"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(tenantForm); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={tenantForm.fullName}
              onChange={(e) => setTenantForm({ ...tenantForm, fullName: e.target.value })}
              placeholder="e.g. Ramesh Chandra Sharma"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={tenantForm.email}
                onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                placeholder="ramesh@example.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={tenantForm.phone}
                onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">National ID / PAN / Aadhaar</label>
              <input
                type="text"
                value={tenantForm.nationalId}
                onChange={(e) => setTenantForm({ ...tenantForm, nationalId: e.target.value })}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={tenantForm.status}
                onChange={(e) => setTenantForm({ ...tenantForm, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PROSPECT">PROSPECT</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={tenantForm.city}
                onChange={(e) => setTenantForm({ ...tenantForm, city: e.target.value })}
                placeholder="Bangalore"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                value={tenantForm.state}
                onChange={(e) => setTenantForm({ ...tenantForm, state: e.target.value })}
                placeholder="Karnataka"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Register Tenant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
