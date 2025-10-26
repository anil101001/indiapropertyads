import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Phone,
  Mail,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3,
  Plus,
  Filter,
  Download,
} from 'lucide-react';

export default function AgentDashboard() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'properties' | 'leads' | 'commission'>('overview');

  // Mock agent data
  const agentStats = {
    totalListings: 24,
    activeLeads: 18,
    commission: {
      earned: 450000,
      pending: 280000,
      monthly: 125000,
    },
    performance: {
      responseTime: '1.5 hrs',
      conversionRate: 18.5,
      satisfaction: 4.8,
    },
  };

  const recentLeads = [
    {
      id: 'L001',
      name: 'Amit Sharma',
      property: 'Luxury 3BHK Apartment',
      aiScore: 92,
      status: 'hot',
      contact: '+91 98765 43210',
      email: 'amit.sharma@email.com',
      budget: '1.2 Cr',
      timestamp: '2 hours ago',
    },
    {
      id: 'L002',
      name: 'Priya Patel',
      property: 'Modern 2BHK Flat',
      aiScore: 85,
      status: 'warm',
      contact: '+91 98765 43211',
      email: 'priya.patel@email.com',
      budget: '85 Lakh',
      timestamp: '5 hours ago',
    },
    {
      id: 'L003',
      name: 'Rahul Verma',
      property: 'Villa with Garden',
      aiScore: 78,
      status: 'warm',
      contact: '+91 98765 43212',
      email: 'rahul.verma@email.com',
      budget: '2.5 Cr',
      timestamp: '1 day ago',
    },
    {
      id: 'L004',
      name: 'Sneha Reddy',
      property: 'Commercial Office Space',
      aiScore: 65,
      status: 'cold',
      contact: '+91 98765 43213',
      email: 'sneha.reddy@email.com',
      budget: '3.5 Cr',
      timestamp: '2 days ago',
    },
  ];

  const myProperties = [
    {
      id: '1',
      title: 'Luxury 3BHK Apartment in Bandra',
      price: 12500000,
      views: 245,
      leads: 12,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    },
    {
      id: '2',
      title: 'Modern 2BHK Near Koramangala',
      price: 8500000,
      views: 312,
      leads: 18,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    },
    {
      id: '3',
      title: 'Spacious Villa with Garden',
      price: 22000000,
      views: 156,
      leads: 8,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
    },
  ];

  const commissionHistory = [
    { id: 'C001', property: 'Bandra Apartment', amount: 187500, status: 'paid', date: '2024-01-15' },
    { id: 'C002', property: 'Koramangala Flat', amount: 127500, status: 'paid', date: '2024-01-10' },
    { id: 'C003', property: 'Whitefield Villa', amount: 330000, status: 'pending', date: '2024-01-20' },
  ];

  const getAIScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-red-100 text-red-700';
      case 'warm':
        return 'bg-yellow-100 text-yellow-700';
      case 'cold':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your performance overview</p>
          </div>
          <Link
            to="/add-property"
            className="mt-4 md:mt-0 flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            <Plus className="h-5 w-5" />
            Add Property
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Home className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+12%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{agentStats.totalListings}</p>
            <p className="text-sm text-gray-600">Active Listings</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+8%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{agentStats.activeLeads}</p>
            <p className="text-sm text-gray-600">Active Leads</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+15%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ₹{(agentStats.commission.earned / 100000).toFixed(1)}L
            </p>
            <p className="text-sm text-gray-600">Commission Earned</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-semibold">+5%</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{agentStats.performance.conversionRate}%</p>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'properties', label: 'My Properties' },
                { id: 'leads', label: 'Leads' },
                { id: 'commission', label: 'Commission' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-2 font-medium transition border-b-2 ${
                    selectedTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-primary-600" />
                        <p className="text-sm font-medium text-gray-700">Avg Response Time</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.performance.responseTime}</p>
                      <p className="text-xs text-green-600 mt-1">↓ 20% faster</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-primary-600" />
                        <p className="text-sm font-medium text-gray-700">Conversion Rate</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.performance.conversionRate}%</p>
                      <p className="text-xs text-green-600 mt-1">↑ 5% increase</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-primary-600" />
                        <p className="text-sm font-medium text-gray-700">Customer Rating</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{agentStats.performance.satisfaction}/5</p>
                      <p className="text-xs text-green-600 mt-1">From 45 reviews</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">New lead for Bandra Apartment</p>
                        <p className="text-sm text-gray-600">2 hours ago • AI Score: 92</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Property viewing scheduled</p>
                        <p className="text-sm text-gray-600">5 hours ago • Koramangala Flat</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">Commission payment received</p>
                        <p className="text-sm text-gray-600">1 day ago • ₹1,87,500</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Properties Tab */}
            {selectedTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">My Properties</h3>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myProperties.map((property) => (
                    <Link
                      key={property.id}
                      to={`/property/${property.id}`}
                      className="group border rounded-xl overflow-hidden hover:shadow-xl transition"
                    >
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h4>
                        <p className="text-primary-600 font-bold mb-3">
                          ₹{(property.price / 10000000).toFixed(2)} Cr
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{property.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{property.leads} leads</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded capitalize">
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Leads Tab */}
            {selectedTab === 'leads' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Lead Management</h3>
                    <p className="text-sm text-gray-600 mt-1">AI-powered lead scoring and prioritization</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="border rounded-xl p-4 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold">
                              {lead.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                            <p className="text-sm text-gray-600">{lead.property}</p>
                            <p className="text-xs text-gray-500 mt-1">{lead.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getAIScoreColor(lead.aiScore)}`}>
                            <Sparkles className="h-3 w-3 inline mr-1" />
                            AI: {lead.aiScore}%
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="h-4 w-4 text-primary-600" />
                          <span>{lead.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="h-4 w-4 text-primary-600" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <DollarSign className="h-4 w-4 text-primary-600" />
                          <span>Budget: {lead.budget}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`tel:${lead.contact}`}
                          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center text-sm font-medium"
                        >
                          Call Now
                        </a>
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center text-sm font-medium"
                        >
                          Send Email
                        </a>
                        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                          Schedule
                        </button>
                      </div>

                      {/* AI Insights */}
                      {lead.aiScore >= 85 && (
                        <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                          <p className="text-sm text-primary-900">
                            <Sparkles className="h-4 w-4 inline mr-1" />
                            <strong>AI Insight:</strong> High conversion probability. Budget matches property. Quick
                            response recommended.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commission Tab */}
            {selectedTab === 'commission' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Commission Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700 mb-1">Total Earned</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{(agentStats.commission.earned / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700 mb-1">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        ₹{(agentStats.commission.pending / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-gray-700 mb-1">This Month</p>
                      <p className="text-3xl font-bold text-primary-600">
                        ₹{(agentStats.commission.monthly / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Property</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissionHistory.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{item.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{item.property}</td>
                            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                              ₹{item.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
