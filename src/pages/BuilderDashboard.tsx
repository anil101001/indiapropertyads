import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Eye, Users, TrendingUp, Clock, CheckCircle,
  AlertCircle, Settings, ChevronRight, BarChart3, FileText, FolderOpen
} from 'lucide-react';
import { builderService, projectService, BuilderProfile, Project, getConstructionStatusColor, getConstructionStatusLabel, formatPrice } from '../services/builderService';

export default function BuilderDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [, setProjectCounts] = useState<Record<string, number>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get builder profile
      const profileData = await builderService.getMyProfile();
      setBuilder(profileData.builder);
      setProjectCounts(profileData.projectCounts);

      // Get projects
      const projectsData = await projectService.getMyProjects({ limit: 10 });
      setProjects(projectsData.projects);
      setStatusCounts(projectsData.statusCounts);

    } catch (err: any) {
      if (err.response?.status === 404) {
        // No builder profile - redirect to registration
        navigate('/builder/register');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load dashboard');
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
            onClick={fetchData}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!builder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <Building2 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Become a Builder</h2>
          <p className="text-gray-600 mb-6">
            Register as a builder/developer to list your projects and reach more buyers.
          </p>
          <Link
            to="/builder/register"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
          >
            Register Now
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = builder.verification.status === 'verified';
  const isPending = builder.verification.status === 'pending' || builder.verification.status === 'under-review';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {builder.logo ? (
                <img src={builder.logo} alt={builder.companyName} className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{builder.companyName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isVerified ? 'bg-green-100 text-green-800' :
                    isPending ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {builder.verification.status.charAt(0).toUpperCase() + builder.verification.status.slice(1)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {builder.portfolio.completedProjects} projects completed
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/builder/profile"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Link>
              {isVerified && (
                <Link
                  to="/builder/projects/new"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Warning */}
        {!isVerified && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            isPending ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`h-5 w-5 mt-0.5 ${isPending ? 'text-yellow-600' : 'text-red-600'}`} />
            <div>
              <h3 className={`font-semibold ${isPending ? 'text-yellow-800' : 'text-red-800'}`}>
                {isPending ? 'Verification Pending' : 'Verification Rejected'}
              </h3>
              <p className={`text-sm ${isPending ? 'text-yellow-700' : 'text-red-700'}`}>
                {isPending 
                  ? 'Your builder profile is under review. You can add projects once verified.'
                  : builder.verification.rejectionReason || 'Your verification was rejected. Please contact support.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{builder.portfolio.totalProjects}</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{builder.stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{builder.stats.totalLeads.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {builder.stats.avgRating?.toFixed(1) || '-'}
                  <span className="text-lg text-gray-400">/5</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Project Status Summary */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'draft', label: 'Draft', icon: FileText, color: 'gray' },
              { key: 'pending-approval', label: 'Pending', icon: Clock, color: 'yellow' },
              { key: 'approved', label: 'Live', icon: CheckCircle, color: 'green' },
              { key: 'rejected', label: 'Rejected', icon: AlertCircle, color: 'red' },
              { key: 'archived', label: 'Archived', icon: FileText, color: 'gray' }
            ].map(status => (
              <div
                key={status.key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow ${
                  statusCounts[status.key] > 0 ? `border-${status.color}-200 bg-${status.color}-50` : 'border-gray-100 bg-gray-50'
                }`}
                onClick={() => navigate(`/builder/projects?status=${status.key}`)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <status.icon className={`h-4 w-4 text-${status.color}-600`} />
                  <span className="text-sm font-medium text-gray-700">{status.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{statusCounts[status.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link
              to="/builder/projects"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-4">Start by adding your first project</p>
              {isVerified && (
                <Link
                  to="/builder/projects/new"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {projects.map(project => (
                <div
                  key={project._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/builder/projects/${project._id}`)}
                >
                  <div className="flex items-center gap-4">
                    {project.media.images[0] ? (
                      <img
                        src={project.media.images[0].url}
                        alt={project.name}
                        className="h-16 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.location.locality}, {project.location.city}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConstructionStatusColor(project.construction.status)}`}>
                          {getConstructionStatusLabel(project.construction.status)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatPrice(project.details.priceRange.min)} - {formatPrice(project.details.priceRange.max)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" /> {project.stats.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> {project.stats.inquiries}
                        </span>
                      </div>
                      <span className={`mt-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                        project.status === 'approved' ? 'bg-green-100 text-green-800' :
                        project.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to="/crm"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Lead Management</h3>
              <p className="text-sm text-gray-500">Manage inquiries & follow-ups</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </Link>

          <Link
            to="/builder/analytics"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-500">View performance metrics</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </Link>

          <Link
            to="/builder/documents"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <p className="text-sm text-gray-500">Manage documents & templates</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </Link>

          <Link
            to="/builder/subscription"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition flex items-center gap-4"
          >
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Subscription</h3>
              <p className="text-sm text-gray-500">{builder.subscription.plan} plan</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}
