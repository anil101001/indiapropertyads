import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Plus,
  Search
} from 'lucide-react';
import crmService, { 
  DashboardStats, 
  Lead, 
  LeadStatus, 
  LeadFilters,
  LeadsResponse 
} from '../services/crmService';
import { useAuth } from '../context/AuthContext';

const PIPELINE_STAGES: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'bg-blue-500' },
  { status: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { status: 'interested', label: 'Interested', color: 'bg-purple-500' },
  { status: 'site-visit', label: 'Site Visit', color: 'bg-indigo-500' },
  { status: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { status: 'closed-won', label: 'Won', color: 'bg-green-500' },
  { status: 'closed-lost', label: 'Lost', color: 'bg-red-500' },
];

export default function CRMDashboard() {
  useAuth(); // Verify user is authenticated
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsStats, setLeadsStats] = useState<LeadsResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'pipeline'>('list');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, leadsData] = await Promise.all([
        crmService.getDashboardStats(),
        crmService.getLeads({ ...filters, search: searchQuery || undefined })
      ]);
      setDashboardStats(statsData);
      setLeads(leadsData.leads);
      setLeadsStats(leadsData.stats);
    } catch (error) {
      console.error('Failed to fetch CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchData();
  };

  const handleStatusFilter = (status: LeadStatus | '') => {
    setFilters({ 
      ...filters, 
      status: status || undefined, 
      page: 1 
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await crmService.updateLeadStatus(leadId, newStatus);
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your leads and close more deals</p>
            </div>
            <Link
              to="/my-properties"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{dashboardStats?.overview.totalLeads || 0}</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">Total Leads</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{dashboardStats?.overview.newLeadsThisWeek || 0}</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">New This Week</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">{dashboardStats?.overview.pendingFollowUps || 0}</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">Pending Follow-ups</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <CheckSquare className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{dashboardStats?.overview.pendingTasks || 0}</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">Pending Tasks</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold">{dashboardStats?.overview.overdueTasks || 0}</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">Overdue Tasks</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-bold">{dashboardStats?.overview.conversionRate || 0}%</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">Conversion Rate</p>
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Pipeline</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage) => {
              const count = leadsStats?.statusCounts[stage.status] || 0;
              return (
                <button
                  key={stage.status}
                  onClick={() => handleStatusFilter(filters.status === stage.status ? '' : stage.status)}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                    filters.status === stage.status 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <span className="font-medium text-gray-900">{stage.label}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-sm">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'pipeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pipeline View
              </button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Lead</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Property</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Priority</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No leads found</p>
                        <p className="text-sm">Leads will appear here when buyers inquire about your properties</p>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{lead.buyerInfo.name}</p>
                            <p className="text-sm text-gray-500">{lead.buyerInfo.email}</p>
                            <p className="text-sm text-gray-500">{lead.buyerInfo.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {lead.property?.images?.[0] && (
                              <img 
                                src={lead.property.images[0]} 
                                alt="" 
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 line-clamp-1">
                                {lead.property?.title || 'Property'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatPrice(lead.property?.pricing?.expectedPrice || 0)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${crmService.getStatusColor(lead.status)}`}
                          >
                            {PIPELINE_STAGES.map((stage) => (
                              <option key={stage.status} value={stage.status}>
                                {stage.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${crmService.getPriorityColor(lead.priority)}`}>
                            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">{formatDate(lead.createdAt)}</p>
                          {lead.nextFollowUpDate && (
                            <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Follow-up: {formatDate(lead.nextFollowUpDate)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lead.buyerInfo.phone}`}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/91${lead.buyerInfo.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                            <a
                              href={`mailto:${lead.buyerInfo.email}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                            <Link
                              to={`/crm/leads/${lead._id}`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="View Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pipeline View (Kanban) */}
        {activeTab === 'pipeline' && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.filter(s => !['closed-won', 'closed-lost'].includes(s.status)).map((stage) => {
              const stageLeads = leads.filter(l => l.status === stage.status);
              return (
                <div key={stage.status} className="flex-shrink-0 w-72">
                  <div className={`${stage.color} text-white px-4 py-2 rounded-t-xl font-medium flex items-center justify-between`}>
                    <span>{stage.label}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                      {leadsStats?.statusCounts[stage.status] || 0}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-b-xl p-2 min-h-[400px] space-y-2">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900 text-sm">{lead.buyerInfo.name}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${crmService.getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                          {lead.property?.title}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          {formatPrice(lead.property?.pricing?.expectedPrice || 0)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{formatDate(lead.createdAt)}</span>
                          <div className="flex gap-1">
                            <a
                              href={`tel:${lead.buyerInfo.phone}`}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://wa.me/91${lead.buyerInfo.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                            <Link
                              to={`/crm/leads/${lead._id}`}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Activity */}
        {dashboardStats?.recentActivities && dashboardStats.recentActivities.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboardStats.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{crmService.getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
