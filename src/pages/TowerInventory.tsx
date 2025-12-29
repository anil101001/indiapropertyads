import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, ArrowLeft, Plus, Grid3X3, List,
  AlertCircle, Search, MoreVertical
} from 'lucide-react';
import {
  towerService, unitService, Tower, Unit,
  getUnitStatusColor, getUnitStatusLabel, getConstructionStatusColor,
  getConstructionStatusLabel, getFacingLabel, formatPrice, formatArea
} from '../services/inventoryService';

type ViewMode = 'grid' | 'list' | 'floor';

export default function TowerInventory() {
  const { towerId } = useParams<{ towerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tower, setTower] = useState<Tower | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showGenerateUnits, setShowGenerateUnits] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    if (towerId) {
      fetchTower();
      fetchUnits();
    }
  }, [towerId]);

  useEffect(() => {
    if (towerId) {
      fetchUnits();
    }
  }, [statusFilter, unitTypeFilter, floorFilter, pagination.page]);

  const fetchTower = async () => {
    try {
      const data = await towerService.getTower(towerId!);
      setTower(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tower');
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const data = await unitService.getTowerUnits(towerId!, {
        status: statusFilter || undefined,
        unitType: unitTypeFilter || undefined,
        floor: floorFilter ? Number(floorFilter) : undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      setUnits(data.units);
      setStatusCounts(data.statusCounts);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err: any) {
      console.error('Failed to fetch units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitAction = async (unitId: string, action: string, data?: any) => {
    try {
      await unitService.updateStatus(unitId, action as any, data);
      fetchUnits();
      setSelectedUnit(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const getUniqueUnitTypes = () => {
    if (!tower?.unitTypes) return [];
    return tower.unitTypes.map(ut => ut.type);
  };

  const getFloorNumbers = () => {
    if (!tower) return [];
    const floors: number[] = [];
    const start = tower.structure.groundFloor ? 0 : 1;
    const end = tower.structure.groundFloor ? tower.structure.totalFloors - 1 : tower.structure.totalFloors;
    for (let i = start; i <= end; i++) {
      floors.push(i);
    }
    return floors;
  };

  const filteredUnits = units.filter(unit => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return unit.unitNumber.toLowerCase().includes(query) ||
        unit.unitType.toLowerCase().includes(query);
    }
    return true;
  });

  const unitsByFloor = filteredUnits.reduce((acc, unit) => {
    const floor = unit.floor;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(unit);
    return acc;
  }, {} as Record<number, Unit[]>);

  if (error && !tower) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{tower?.name || 'Tower'}</h1>
                {tower && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getConstructionStatusColor(tower.construction.status)}`}>
                    {getConstructionStatusLabel(tower.construction.status)}
                  </span>
                )}
              </div>
              <p className="text-gray-500">
                {tower?.structure.totalFloors} floors - {tower?.structure.unitsPerFloor} units/floor - {tower?.structure.totalUnits} total
              </p>
            </div>
            <div className="flex gap-3">
              {units.length === 0 && (
                <button
                  onClick={() => setShowGenerateUnits(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  Generate Units
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { key: '', label: 'All Units', count: Object.values(statusCounts).reduce((a, b) => a + b, 0), color: 'primary' },
            { key: 'available', label: 'Available', count: statusCounts.available || 0, color: 'green' },
            { key: 'booked', label: 'Booked', count: statusCounts.booked || 0, color: 'yellow' },
            { key: 'sold', label: 'Sold', count: statusCounts.sold || 0, color: 'blue' },
            { key: 'blocked', label: 'Blocked', count: statusCounts.blocked || 0, color: 'red' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`p-4 rounded-xl transition ${
                statusFilter === item.key 
                  ? `bg-${item.color}-600 text-white` 
                  : 'bg-white shadow hover:shadow-md'
              }`}
            >
              <p className="text-sm opacity-80">{item.label}</p>
              <p className="text-2xl font-bold">{item.count}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by unit number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={unitTypeFilter}
              onChange={(e) => setUnitTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              {getUniqueUnitTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Floors</option>
              {getFloorNumbers().map(floor => (
                <option key={floor} value={floor}>
                  {floor === 0 ? 'Ground Floor' : `Floor ${floor}`}
                </option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('floor')}
                className={`p-2 ${viewMode === 'floor' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Building2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Units Found</h3>
            <p className="text-gray-500 mb-4">
              {units.length === 0 ? 'Generate units for this tower to get started' : 'Try adjusting your filters'}
            </p>
            {units.length === 0 && (
              <button
                onClick={() => setShowGenerateUnits(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Generate Units
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredUnits.map(unit => (
              <button
                key={unit._id}
                onClick={() => setSelectedUnit(unit)}
                className={`p-4 rounded-xl text-left transition hover:shadow-md ${
                  unit.status === 'available' ? 'bg-green-50 border-2 border-green-200' :
                  unit.status === 'booked' ? 'bg-yellow-50 border-2 border-yellow-200' :
                  unit.status === 'sold' ? 'bg-blue-50 border-2 border-blue-200' :
                  'bg-red-50 border-2 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{unit.unitNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getUnitStatusColor(unit.status)}`}>
                    {getUnitStatusLabel(unit.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{unit.unitType}</p>
                <p className="text-xs text-gray-500">{formatArea(unit.area.superBuiltUp)}</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">{formatPrice(unit.pricing.totalPrice)}</p>
              </button>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Unit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Floor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Area</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Facing</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(unit => (
                  <tr key={unit._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{unit.unitNumber}</td>
                    <td className="py-3 px-4">{unit.unitType}</td>
                    <td className="py-3 px-4">{unit.floor === 0 ? 'G' : unit.floor}</td>
                    <td className="py-3 px-4">{formatArea(unit.area.superBuiltUp)}</td>
                    <td className="py-3 px-4">{getFacingLabel(unit.facing)}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatPrice(unit.pricing.totalPrice)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getUnitStatusColor(unit.status)}`}>
                        {getUnitStatusLabel(unit.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => setSelectedUnit(unit)} className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(unitsByFloor)
              .sort((a, b) => Number(b) - Number(a))
              .map(floor => (
                <div key={floor} className="bg-white rounded-xl shadow p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {Number(floor) === 0 ? 'Ground Floor' : `Floor ${floor}`}
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {unitsByFloor[Number(floor)].map(unit => (
                      <button
                        key={unit._id}
                        onClick={() => setSelectedUnit(unit)}
                        className={`p-3 rounded-lg text-center transition ${
                          unit.status === 'available' ? 'bg-green-100 hover:bg-green-200 text-green-800' :
                          unit.status === 'booked' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' :
                          unit.status === 'sold' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' :
                          'bg-red-100 hover:bg-red-200 text-red-800'
                        }`}
                      >
                        <p className="font-medium text-sm">{unit.unitNumber.split('-').pop()}</p>
                        <p className="text-xs opacity-75">{unit.unitType}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {showGenerateUnits && tower && (
          <GenerateUnitsModal
            tower={tower}
            onClose={() => setShowGenerateUnits(false)}
            onSuccess={() => { setShowGenerateUnits(false); fetchUnits(); }}
          />
        )}

        {selectedUnit && (
          <UnitDetailModal
            unit={selectedUnit}
            onClose={() => setSelectedUnit(null)}
            onAction={handleUnitAction}
          />
        )}
      </div>
    </div>
  );
}

function GenerateUnitsModal({ tower, onClose, onSuccess }: { tower: Tower; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    unitType: '2 BHK', category: 'apartment', facing: 'east',
    carpetArea: 800, builtUpArea: 1000, superBuiltUpArea: 1200,
    bedrooms: 2, bathrooms: 2, balconies: 1, parking: 1,
    pricePerSqft: 5000, floorRisePerFloor: 50
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      await unitService.generateUnits(tower._id, [config]);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate units');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Generate Units for {tower.name}</h2>
          <p className="text-sm text-gray-500">This will create {tower.structure.totalUnits} units</p>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
              <select value={config.unitType} onChange={(e) => setConfig({ ...config, unitType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
              <select value={config.facing} onChange={(e) => setConfig({ ...config, facing: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="north">North</option>
                <option value="south">South</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carpet Area</label>
              <input type="number" value={config.carpetArea} onChange={(e) => setConfig({ ...config, carpetArea: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Built-up Area</label>
              <input type="number" value={config.builtUpArea} onChange={(e) => setConfig({ ...config, builtUpArea: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Super Built-up</label>
              <input type="number" value={config.superBuiltUpArea} onChange={(e) => setConfig({ ...config, superBuiltUpArea: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Sqft</label>
              <input type="number" value={config.pricePerSqft} onChange={(e) => setConfig({ ...config, pricePerSqft: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor Rise (per sqft)</label>
              <input type="number" value={config.floorRisePerFloor} onChange={(e) => setConfig({ ...config, floorRisePerFloor: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
          <button onClick={handleGenerate} disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Generating...' : `Generate ${tower.structure.totalUnits} Units`}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnitDetailModal({ unit, onClose, onAction }: { unit: Unit; onClose: () => void; onAction: (id: string, action: string, data?: any) => void }) {
  const [bookingData, setBookingData] = useState({ customerName: '', customerPhone: '', bookingAmount: '' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{unit.unitNumber}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUnitStatusColor(unit.status)}`}>
              {getUnitStatusLabel(unit.status)}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-sm text-gray-500">Type</p><p className="font-medium">{unit.unitType}</p></div>
            <div><p className="text-sm text-gray-500">Floor</p><p className="font-medium">{unit.floor === 0 ? 'Ground' : unit.floor}</p></div>
            <div><p className="text-sm text-gray-500">Facing</p><p className="font-medium">{getFacingLabel(unit.facing)}</p></div>
            <div><p className="text-sm text-gray-500">Area</p><p className="font-medium">{formatArea(unit.area.superBuiltUp)}</p></div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Base Price</span>
              <span className="font-medium">{formatPrice(unit.pricing.basePrice)}</span>
            </div>
            {unit.pricing.floorRise && unit.pricing.floorRise > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Floor Rise</span>
                <span className="font-medium">+{formatPrice(unit.pricing.floorRise)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t">
              <span>Total Price</span>
              <span className="text-primary-600">{formatPrice(unit.pricing.totalPrice)}</span>
            </div>
          </div>

          {unit.status === 'available' && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Quick Book</h4>
              <input
                type="text"
                placeholder="Customer Name"
                value={bookingData.customerName}
                onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={bookingData.customerPhone}
                onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Booking Amount"
                value={bookingData.bookingAmount}
                onChange={(e) => setBookingData({ ...bookingData, bookingAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {unit.status === 'booked' && unit.booking && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Booking Details</h4>
              <p className="text-sm"><span className="text-gray-500">Customer:</span> {unit.booking.customerName}</p>
              <p className="text-sm"><span className="text-gray-500">Phone:</span> {unit.booking.customerPhone}</p>
              <p className="text-sm"><span className="text-gray-500">Amount:</span> {formatPrice(unit.booking.bookingAmount)}</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t flex flex-wrap gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Close</button>
          
          {unit.status === 'available' && (
            <>
              <button
                onClick={() => onAction(unit._id, 'hold', { customerName: 'Hold', holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Hold
              </button>
              <button
                onClick={() => onAction(unit._id, 'block', { reason: 'Blocked by builder' })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Block
              </button>
              <button
                onClick={() => {
                  if (bookingData.customerName && bookingData.customerPhone) {
                    onAction(unit._id, 'book', { ...bookingData, bookingAmount: Number(bookingData.bookingAmount) });
                  }
                }}
                disabled={!bookingData.customerName || !bookingData.customerPhone}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Book Now
              </button>
            </>
          )}

          {unit.status === 'booked' && (
            <>
              <button
                onClick={() => onAction(unit._id, 'release', { reason: 'Booking cancelled' })}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Release
              </button>
              <button
                onClick={() => onAction(unit._id, 'sell', {})}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mark Sold
              </button>
            </>
          )}

          {(unit.status === 'blocked' || unit.status === 'hold') && (
            <button
              onClick={() => onAction(unit._id, 'release', { reason: 'Released' })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Release
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
