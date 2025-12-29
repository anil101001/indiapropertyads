import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, Plus, Eye, Users, Search,
  MoreVertical, Edit, Trash2, Send, Archive, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { projectService, Project, getConstructionStatusColor, getConstructionStatusLabel, formatPrice } from '../services/builderService';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Live' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' }
];

export default function BuilderProjects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, pagination.page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMyProjects({
        status: statusFilter || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      setProjects(data.projects);
      setStatusCounts(data.statusCounts);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleAction = async (projectId: string, action: string) => {
    setActionMenuOpen(null);
    try {
      switch (action) {
        case 'edit':
          navigate(`/builder/projects/${projectId}/edit`);
          break;
        case 'submit':
          await projectService.updateStatus(projectId, 'pending-approval');
          fetchProjects();
          break;
        case 'archive':
          await projectService.delete(projectId);
          fetchProjects();
          break;
        case 'restore':
          await projectService.updateStatus(projectId, 'draft');
          fetchProjects();
          break;
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const filteredProjects = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.city.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending-approval': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-500 mt-1">Manage your property projects</p>
            </div>
            <Link
              to="/builder/projects/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 w-fit"
            >
              <Plus className="h-4 w-4" />
              Add New Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Tabs */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex overflow-x-auto">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`flex-1 min-w-[120px] px-4 py-4 text-center border-b-2 transition ${
                  statusFilter === option.value
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{option.label}</span>
                {option.value && statusCounts[option.value] !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    statusFilter === option.value ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    {statusCounts[option.value] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-4">
              {statusFilter ? `No ${STATUS_OPTIONS.find(s => s.value === statusFilter)?.label.toLowerCase()} projects` : 'Start by adding your first project'}
            </p>
            <Link
              to="/builder/projects/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="divide-y">
              {filteredProjects.map(project => (
                <div
                  key={project._id}
                  className="p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div
                      className="cursor-pointer"
                      onClick={() => navigate(`/builder/projects/${project._id}`)}
                    >
                      {project.media.images[0] ? (
                        <img
                          src={project.media.images[0].url}
                          alt={project.name}
                          className="h-20 w-32 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-20 w-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div
                          className="cursor-pointer"
                          onClick={() => navigate(`/builder/projects/${project._id}`)}
                        >
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {project.location.locality}, {project.location.city}
                          </p>
                        </div>

                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === project._id ? null : project._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                          </button>
                          
                          {actionMenuOpen === project._id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                              <button
                                onClick={() => navigate(`/builder/inventory/${project._id}`)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-primary-600"
                              >
                                <Building2 className="h-4 w-4" /> Manage Inventory
                              </button>
                              <button
                                onClick={() => navigate(`/builder/pricing/${project._id}`)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                              >
                                <Building2 className="h-4 w-4" /> Pricing & Offers
                              </button>
                              <button
                                onClick={() => handleAction(project._id, 'edit')}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" /> Edit Project
                              </button>
                              {project.status === 'draft' && (
                                <button
                                  onClick={() => handleAction(project._id, 'submit')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                >
                                  <Send className="h-4 w-4" /> Submit for Approval
                                </button>
                              )}
                              {project.status === 'rejected' && (
                                <button
                                  onClick={() => handleAction(project._id, 'submit')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                >
                                  <Send className="h-4 w-4" /> Resubmit
                                </button>
                              )}
                              {project.status === 'archived' ? (
                                <button
                                  onClick={() => handleAction(project._id, 'restore')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Archive className="h-4 w-4" /> Restore
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAction(project._id, 'archive')}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" /> Archive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConstructionStatusColor(project.construction.status)}`}>
                          {getConstructionStatusLabel(project.construction.status)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatPrice(project.details.priceRange.min)} - {formatPrice(project.details.priceRange.max)}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {project.details.totalUnits} units
                        </span>
                      </div>

                      {/* Stats & Status */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {project.stats.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> {project.stats.inquiries}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.status === 'approved' ? 'bg-green-100 text-green-800' :
                            project.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'pending-approval' ? 'Pending' : project.status}
                          </span>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {project.status === 'rejected' && project.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <strong>Rejection reason:</strong> {project.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
