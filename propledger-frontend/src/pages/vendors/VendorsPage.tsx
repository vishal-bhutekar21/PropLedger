import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '../../api/client';
import { StatusBadge, SearchBar, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { Briefcase, Plus, Star, Phone, Mail } from 'lucide-react';
import type { Vendor } from '../../types';

export default function VendorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [vendorForm, setVendorForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    serviceType: 'Plumbing',
    address: '',
    taxId: '',
    rating: 5,
    status: 'ACTIVE',
    notes: '',
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vendors', { page, search, serviceType }],
    queryFn: () => vendorsApi.list({
      page,
      size: 15,
      search: search || undefined,
      serviceType: serviceType || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (newVendor: typeof vendorForm) => vendorsApi.create(newVendor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsCreateOpen(false);
      setVendorForm({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        serviceType: 'Plumbing',
        address: '',
        taxId: '',
        rating: 5,
        status: 'ACTIVE',
        notes: '',
      });
    },
  });

  const vendors: Vendor[] = data?.content || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contractors & Vendors</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Certified service providers, ratings, contact roster, and maintenance dispatching
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(0); }}
            placeholder="Search vendor or contact person..."
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={serviceType}
            onChange={(e) => { setServiceType(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Services</option>
            <option value="HVAC">HVAC & Climate Control</option>
            <option value="Plumbing">Plumbing & Sanitary</option>
            <option value="Electrical">Electrical Works</option>
            <option value="Elevator">Elevator Maintenance</option>
            <option value="Cleaning">Facility Janitorial & Cleaning</option>
            <option value="Security">Security Services</option>
            <option value="Pest Control">Pest Control</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      {isLoading ? (
        <LoadingState message="Loading vendor roster..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load vendors'} />
      ) : vendors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No vendors found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Add Vendor" to register contractor partnerships.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((vendor) => (
            <div
              key={vendor.vendorId}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {vendor.serviceType}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {vendor.companyName}
                    </h3>
                  </div>
                  <StatusBadge status={vendor.status} />
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (vendor.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    {vendor.rating || 5}.0
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {vendor.contactPerson && (
                    <div>Contact: <span className="font-semibold text-slate-800 dark:text-slate-200">{vendor.contactPerson}</span></div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {vendor.taxId && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
                  GST/Tax: {vendor.taxId}
                </div>
              )}
            </div>
          ))}
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

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Contractor / Vendor"
      >
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(vendorForm); }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Trade Name *</label>
            <input
              type="text"
              required
              value={vendorForm.companyName}
              onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
              placeholder="e.g. Apex Elevators & Escalators Pvt Ltd"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                placeholder="Manager name"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Type *</label>
              <input
                type="text"
                required
                value={vendorForm.serviceType}
                onChange={(e) => setVendorForm({ ...vendorForm, serviceType: e.target.value })}
                placeholder="e.g. Plumbing, HVAC"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                placeholder="info@vendor.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                placeholder="+91 80 2345 6789"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN / Tax ID</label>
              <input
                type="text"
                value={vendorForm.taxId}
                onChange={(e) => setVendorForm({ ...vendorForm, taxId: e.target.value })}
                placeholder="29AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quality Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={vendorForm.rating}
                onChange={(e) => setVendorForm({ ...vendorForm, rating: Number(e.target.value) })}
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
              {createMutation.isPending ? 'Saving...' : 'Register Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
