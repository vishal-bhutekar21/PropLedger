import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi, unitsApi } from '../../api/client';
import { StatusBadge, LoadingState, ErrorState, Modal, StatCard } from '../../components/ui';
import { OccupancyChart } from '../../components/charts/OccupancyChart';
import { ArrowLeft, Plus, MapPin, Building2, Layers, DollarSign, Activity } from 'lucide-react';
import type { Property, Unit } from '../../types';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);
  const queryClient = useQueryClient();

  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({
    buildingId: 0,
    unitNumber: '',
    unitType: '2BHK',
    floorNumber: 1,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1100,
    monthlyRent: 35000,
    securityDeposit: 70000,
    status: 'VACANT',
    description: '',
    amenities: 'Balcony, Modular Kitchen',
  });

  const { data: property, isLoading, isError, error } = useQuery<Property>({
    queryKey: ['property', propertyId],
    queryFn: () => propertiesApi.get(propertyId),
    enabled: !!propertyId,
  });

  const { data: unitsData } = useQuery({
    queryKey: ['property-units', propertyId],
    queryFn: () => unitsApi.list({ propertyId, size: 50 }),
    enabled: !!propertyId,
  });

  const { data: financialData } = useQuery({
    queryKey: ['property-financial', propertyId],
    queryFn: () => propertiesApi.financialSummary(propertyId),
    enabled: !!propertyId,
  });

  const addUnitMutation = useMutation({
    mutationFn: (data: typeof unitForm) => unitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property-units', propertyId] });
      setIsAddUnitOpen(false);
    },
  });

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultBuildingId = property?.buildings?.[0]?.buildingId || 1;
    addUnitMutation.mutate({
      ...unitForm,
      buildingId: unitForm.buildingId || defaultBuildingId,
    });
  };

  if (isLoading) return <LoadingState message="Loading property details..." />;
  if (isError || !property) return <ErrorState message={(error as Error)?.message || 'Property not found'} />;

  const units: Unit[] = unitsData?.content || [];
  const occupiedCount = units.filter(u => u.status === 'OCCUPIED').length;
  const vacantCount = units.filter(u => u.status === 'VACANT').length;
  const maintenanceCount = units.filter(u => u.status === 'MAINTENANCE').length;
  const reservedCount = units.filter(u => u.status === 'RESERVED').length;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div>
        <Link
          to="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Properties
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{property.propertyName}</h1>
              <StatusBadge status={property.status} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {property.addressLine1}, {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          <button
            onClick={() => setIsAddUnitOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Unit
          </button>
        </div>
      </div>

      {/* Financial & Performance KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={units.length || property.totalUnits || 0}
          subtitle={`${occupiedCount} Occupied · ${vacantCount} Vacant`}
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          title="Gross Invoiced"
          value={financialData ? `₹${Number(financialData.totalInvoiced || 0).toLocaleString()}` : '—'}
          subtitle="All-time billing"
          icon={<DollarSign className="w-5 h-5 text-indigo-500" />}
        />
        <StatCard
          title="Total Collected"
          value={financialData ? `₹${Number(financialData.totalCollected || 0).toLocaleString()}` : '—'}
          subtitle={financialData?.collectionRate ? `${financialData.collectionRate}% collection rate` : 'Cash collected'}
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Net Operating Income"
          value={financialData ? `₹${Number(financialData.netOperatingIncome || 0).toLocaleString()}` : '—'}
          subtitle="Revenue minus expenses"
          icon={<Activity className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Two column: Property info + Occupancy Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Property Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-slate-400">Asset Category</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {property.propertyType.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-slate-400">Total Area</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {property.totalAreaSqft ? `${Number(property.totalAreaSqft).toLocaleString()} sqft` : '—'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-slate-400">Year Built</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {property.yearBuilt || '—'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-slate-400">Owner Entity</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {property.ownerName || 'Prime Properties Ltd.'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-slate-400">Buildings Count</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {property.buildings?.length || 1} Building(s)
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-slate-400">System ID</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                #{property.propertyId}
              </div>
            </div>
          </div>

          {property.description && (
            <div className="pt-2">
              <div className="text-xs text-slate-400 mb-1 font-semibold">Description</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}
        </div>

        {/* Occupancy Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Occupancy Ratio</h2>
          <OccupancyChart
            occupied={occupiedCount}
            vacant={vacantCount}
            reserved={reservedCount}
            maintenance={maintenanceCount}
          />
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Property Units Inventory ({units.length})
          </h3>
        </div>

        {units.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No units configured for this property. Click "Add Unit" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Bed/Bath</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Monthly Rent</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {units.map((unit) => (
                  <tr key={unit.unitId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {unit.unitNumber}
                    </td>
                    <td className="px-4 py-3">{unit.unitType}</td>
                    <td className="px-4 py-3">Floor {unit.floorNumber}</td>
                    <td className="px-4 py-3">{unit.bedrooms}B / {unit.bathrooms}B</td>
                    <td className="px-4 py-3">{unit.areaSqft ? `${unit.areaSqft} sqft` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      ₹{Number(unit.monthlyRent).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={unit.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        title="Add Unit to Property"
      >
        <form onSubmit={handleAddUnitSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Number *</label>
              <input
                type="text"
                required
                value={unitForm.unitNumber}
                onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })}
                placeholder="e.g. A-402"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Type</label>
              <input
                type="text"
                value={unitForm.unitType}
                onChange={(e) => setUnitForm({ ...unitForm, unitType: e.target.value })}
                placeholder="e.g. 2BHK, Penthouse"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Floor</label>
              <input
                type="number"
                value={unitForm.floorNumber}
                onChange={(e) => setUnitForm({ ...unitForm, floorNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bedrooms</label>
              <input
                type="number"
                value={unitForm.bedrooms}
                onChange={(e) => setUnitForm({ ...unitForm, bedrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bathrooms</label>
              <input
                type="number"
                value={unitForm.bathrooms}
                onChange={(e) => setUnitForm({ ...unitForm, bathrooms: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                required
                value={unitForm.monthlyRent}
                onChange={(e) => setUnitForm({ ...unitForm, monthlyRent: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={unitForm.securityDeposit}
                onChange={(e) => setUnitForm({ ...unitForm, securityDeposit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddUnitOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addUnitMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {addUnitMutation.isPending ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
