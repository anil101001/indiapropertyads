import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  BarChart3,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock admin data
  const platformStats = {
    totalUsers: 12450,
    totalProperties: 8920,
    totalAgents: 2340,
    monthlyRevenue: 12500000,
    activeLeads: 3450,
    conversionRate: 16.8,
    growth: {
      users: 12.5,
      properties: 18.3,
      revenue: 24.7,
    },
  };

  const revenueData = [
    { month: 'Jan', amount: 8500000 },
    { month: 'Feb', amount: 9200000 },
    { month: 'Mar', amount: 10100000 },
    { month: 'Apr', amount: 11800000 },
    { month: 'May', amount: 12500000 },
  ];

  const topAgents = [
    { name: 'Rajesh Kumar', deals: 45, revenue: 6750000, rating: 4.9 },
    { name: 'Priya Sharma', deals: 38, revenue: 5700000, rating: 4.8 },
    { name: 'Amit Patel', deals: 32, revenue: 4800000, rating: 4.7 },
    { name: 'Sneha Reddy', deals: 28, revenue: 4200000, rating: 4.9 },
  ];

  const topCities = [
    { city: 'Mumbai', properties: 2840, revenue: 4250000, growth: 15.2 },
    { city: 'Bangalore', properties: 2120, revenue: 3180000, growth: 22.8 },
    { city: 'Delhi NCR', properties: 1890, revenue: 2835000, growth: 18.5 },
    { city: 'Pune', properties: 1450, revenue: 2175000, growth: 12.3 },
  ];

  const recentActivity = [
    { type: 'property', message: 'New property listed in Bandra', time: '5 min ago', status: 'success' },
    { type: 'user', message: 'New agent registration', time: '12 min ago', status: 'success' },
    { type: 'alert', message: 'Fraudulent listing detected', time: '1 hour ago', status: 'warning' },
    { type: 'payment', message: 'Commission payment processed', time: '2 hours ago', status: 'success' },
  ];

  const pendingVerifications = [
    { id: 'V001', type: 'Agent KYC', name: 'Rahul Verma', submitted: '2 hours ago' },
    { id: 'V002', type: 'Property', name: 'Luxury Villa in Whitefield', submitted: '5 hours ago' },
    { id: 'V003', type: 'Agent KYC', name: 'Anita Singh', submitted: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform analytics and management</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={() => navigate('/admin-insights')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition font-medium shadow-lg"
            >
              <BarChart3 className="h-5 w-5" />
              <span>View Insights</span>
            </button>
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">+{platformStats.growth.users}%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{platformStats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-blue-100">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">+{platformStats.growth.properties}%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{platformStats.totalProperties.toLocaleString()}</p>
            <p className="text-sm text-green-100">Total Properties</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">+{platformStats.growth.revenue}%</span>
            </div>
            <p className="text-3xl font-bold mb-1">₹{(platformStats.monthlyRevenue / 10000000).toFixed(1)} Cr</p>
            <p className="text-sm text-purple-100">Monthly Revenue</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">{platformStats.conversionRate}%</span>
            </div>
            <p className="text-3xl font-bold mb-1">{platformStats.activeLeads.toLocaleString()}</p>
            <p className="text-sm text-yellow-100">Active Leads</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend</h3>
            <div className="space-y-4">
              {revenueData.map((data, idx) => {
                const maxAmount = Math.max(...revenueData.map((d) => d.amount));
                const widthPercent = (data.amount / maxAmount) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{data.month}</span>
                      <span className="text-sm font-bold text-gray-900">₹{(data.amount / 10000000).toFixed(1)} Cr</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.status === 'success'
                        ? 'bg-green-100'
                        : activity.status === 'warning'
                        ? 'bg-yellow-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performing Agents */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Agents</h3>
            <div className="space-y-4">
              {topAgents.map((agent, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{agent.rating}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{agent.deals} deals</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">₹{(agent.revenue / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Top Cities</h3>
            <div className="space-y-4">
              {topCities.map((city, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      <span className="font-semibold text-gray-900">{city.city}</span>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">+{city.growth}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Properties</p>
                      <p className="font-bold text-gray-900">{city.properties.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-bold text-primary-600">₹{(city.revenue / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Pending Verifications</h3>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
              {pendingVerifications.length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVerifications.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{item.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {item.submitted}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition">
                          Reject
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
