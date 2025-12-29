import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2, ArrowLeft, Plus, ChevronRight, AlertCircle
} from 'lucide-react';
import {
  towerService, inventoryService, Tower, InventorySummary,
  getConstructionStatusColor, getConstructionStatusLabel, formatPrice
} from '../services/inventoryService';

export default function ProjectInventory() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [towers, setTowers] = useState<Tower[]>([]);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [showAddTower, setShowAddTower] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [towersData, inventoryData] = await Promise.all([
        towerService.getProjectTowers(projectId!, true),
        inventoryService.getProjectInventory(projectId!)
      ]);
      setTowers(towersData);
      setInventory(inventoryData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/builder/projects')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const summary = inventory?.summary || {
    total: 0, available: 0, booked: 0, sold: 0, blocked: 0, hold: 0,
    totalValue: 0, availableValue: 0, soldValue: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/builder/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {inventory?.project.name || 'Project'} - Inventory
              </h1>
              <p className="text-gray-500">Manage towers, units, and availability</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddTower(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Tower
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Units</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-green-600">{summary.available}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Booked</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.booked}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Sold</p>
            <p className="text-2xl font-bold text-blue-600">{summary.sold}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Available Value</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(summary.availableValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Sold Value</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(summary.soldValue)}</p>
          </div>
        </div>

        {/* Towers Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Towers / Phases</h2>
          
          {towers.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Towers Yet</h3>
              <p className="text-gray-500 mb-4">Add towers or phases to manage your project inventory</p>
              <button
                onClick={() => setShowAddTower(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                Add First Tower
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {towers.map(tower => (
                <Link
                  key={tower._id}
                  to={`/builder/inventory/towers/${tower._id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                          {tower.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{tower.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConstructionStatusColor(tower.construction.status)}`}>
                        {getConstructionStatusLabel(tower.construction.status)}
                      </span>
                    </div>

                    {/* Structure Info */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{tower.structure.totalFloors}</p>
                        <p className="text-xs text-gray-500">Floors</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{tower.structure.unitsPerFloor}</p>
                        <p className="text-xs text-gray-500">Units/Floor</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{tower.structure.totalUnits}</p>
                        <p className="text-xs text-gray-500">Total Units</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Construction Progress</span>
                        <span>{tower.construction.progressPercentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all"
                          style={{ width: `${tower.construction.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Inventory Status */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{tower.inventory.available}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{tower.inventory.booked}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">{tower.inventory.sold}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Unit Type Distribution */}
        {inventory && inventory.unitTypeStats.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Unit Type Distribution</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-500">Unit Type</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-500">Available</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-500">Booked</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-gray-500">Sold</th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-gray-500">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Group by unit type */}
                  {Array.from(new Set(inventory.unitTypeStats.map(s => s._id.unitType))).map(unitType => {
                    const stats = inventory.unitTypeStats.filter(s => s._id.unitType === unitType);
                    const available = stats.find(s => s._id.status === 'available')?.count || 0;
                    const booked = stats.find(s => s._id.status === 'booked')?.count || 0;
                    const sold = stats.find(s => s._id.status === 'sold')?.count || 0;
                    const avgPrice = stats.reduce((a, b) => a + b.avgPrice, 0) / stats.length;
                    
                    return (
                      <tr key={unitType} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{unitType}</td>
                        <td className="py-3 px-4 text-center text-green-600">{available}</td>
                        <td className="py-3 px-4 text-center text-yellow-600">{booked}</td>
                        <td className="py-3 px-4 text-center text-blue-600">{sold}</td>
                        <td className="py-3 px-4 text-right">{formatPrice(avgPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Tower Modal */}
        {showAddTower && (
          <AddTowerModal
            projectId={projectId!}
            onClose={() => setShowAddTower(false)}
            onSuccess={() => {
              setShowAddTower(false);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
}

// Add Tower Modal Component
function AddTowerModal({ projectId, onClose, onSuccess }: {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'tower' as const,
    totalFloors: 10,
    basementFloors: 0,
    groundFloor: true,
    unitsPerFloor: 4,
    constructionStatus: 'not-started',
    progressPercentage: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await towerService.create(projectId, {
        name: formData.name,
        type: formData.type,
        structure: {
          totalFloors: formData.totalFloors,
          basementFloors: formData.basementFloors,
          groundFloor: formData.groundFloor,
          unitsPerFloor: formData.unitsPerFloor
        },
        construction: {
          status: formData.constructionStatus,
          progressPercentage: formData.progressPercentage
        }
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tower');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Tower</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tower Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Tower A, Phase 1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="tower">Tower</option>
              <option value="phase">Phase</option>
              <option value="block">Block</option>
              <option value="wing">Wing</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units per Floor</label>
              <input
                type="number"
                value={formData.unitsPerFloor}
                onChange={(e) => setFormData({ ...formData, unitsPerFloor: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
                max="50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="groundFloor"
              checked={formData.groundFloor}
              onChange={(e) => setFormData({ ...formData, groundFloor: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="groundFloor" className="text-sm text-gray-700">
              Ground floor has units
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Construction Status</label>
            <select
              value={formData.constructionStatus}
              onChange={(e) => setFormData({ ...formData, constructionStatus: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="not-started">Not Started</option>
              <option value="foundation">Foundation</option>
              <option value="structure">Structure</option>
              <option value="finishing">Finishing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress: {formData.progressPercentage}%
            </label>
            <input
              type="range"
              value={formData.progressPercentage}
              onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
              className="w-full"
              min="0"
              max="100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Tower'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
