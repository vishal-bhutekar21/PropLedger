import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../../api/client';
import { StatusBadge, SearchBar, Pagination, LoadingState, ErrorState, Modal } from '../../components/ui';
import { Building2, Plus, MapPin, Layers } from 'lucide-react';
import type { Property } from '../../types';

export default function PropertiesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    ownerId: 1,
    propertyName: '',
    propertyType: 'RESIDENTIAL_MULTIFAMILY',
    addressLine1: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    description: '',
    totalAreaSqft: '',
    yearBuilt: 2022,
    status: 'ACTIVE',
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['properties', { page, search, propertyType, status }],
    queryFn: () => propertiesApi.list({ page, size: 9, search: search || undefined, propertyType: propertyType || undefined, status: status || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (newProp: typeof form) => propertiesApi.create(newProp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsCreateOpen(false);
      setForm({
        ownerId: 1,
        propertyName: '',
        propertyType: 'RESIDENTIAL_MULTIFAMILY',
        addressLine1: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        description: '',
        totalAreaSqft: '',
        yearBuilt: 2022,
        status: 'ACTIVE',
      });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      ownerId: Number(form.ownerId),
      totalAreaSqft: form.totalAreaSqft ? String(form.totalAreaSqft) : '0',
    });
  };

  const properties: Property[] = data?.content || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Properties Portfolio</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage real estate assets, buildings, occupancy metrics, and operational performance
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setPage(0); }}
            placeholder="Search by property name, city, address..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={propertyType}
            onChange={(e) => { setPropertyType(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Asset Types</option>
            <option value="RESIDENTIAL_MULTIFAMILY">Residential Multifamily</option>
            <option value="COMMERCIAL_OFFICE">Commercial Office</option>
            <option value="COMMERCIAL_RETAIL">Commercial Retail</option>
            <option value="INDUSTRIAL_WAREHOUSE">Industrial Warehouse</option>
            <option value="MIXED_USE">Mixed Use</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <LoadingState message="Loading properties portfolio..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load properties'} />
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No properties found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search criteria or add your first property.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.propertyId}
              to={`/properties/${property.propertyId}`}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {property.propertyType.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {property.propertyName}
                    </h3>
                  </div>
                  <StatusBadge status={property.status} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{property.addressLine1}, {property.city}, {property.state}</span>
                </div>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center mb-4">
                  <div>
                    <div className="text-xs text-slate-400">Units</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {property.occupiedUnits ?? 0}/{property.totalUnits ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Occupancy</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {property.occupancyRate != null ? `${property.occupancyRate}%` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Built</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {property.yearBuilt || '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {property.buildings?.length ?? 1} Building(s)
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  View Details &rarr;
                </span>
              </div>
            </Link>
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

      {/* Create Property Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Property"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Property Name *</label>
            <input
              type="text"
              required
              value={form.propertyName}
              onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
              placeholder="e.g. Prestige Tech Park Towers"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asset Type *</label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="RESIDENTIAL_MULTIFAMILY">Residential Multifamily</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office</option>
                <option value="COMMERCIAL_RETAIL">Commercial Retail</option>
                <option value="INDUSTRIAL_WAREHOUSE">Industrial Warehouse</option>
                <option value="MIXED_USE">Mixed Use</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address Line 1 *</label>
            <input
              type="text"
              required
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              placeholder="Street address or block"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City *</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State *</label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Zip Code *</label>
              <input
                type="text"
                required
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                placeholder="560103"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Area (sqft)</label>
              <input
                type="number"
                value={form.totalAreaSqft}
                onChange={(e) => setForm({ ...form, totalAreaSqft: e.target.value })}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year Built</label>
              <input
                type="number"
                value={form.yearBuilt}
                onChange={(e) => setForm({ ...form, yearBuilt: Number(e.target.value) })}
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
              {createMutation.isPending ? 'Creating...' : 'Save Property'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
