import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, Users, Eye,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { builderService } from '../services/builderService';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalInquiries: number;
    totalLeads: number;
    conversionRate: number;
    viewsChange: number;
    inquiriesChange: number;
  };
  projects: {
    total: number;
    active: number;
    draft: number;
    archived: number;
  };
  inventory: {
    totalUnits: number;
    available: number;
    booked: number;
    sold: number;
  };
  revenue: {
    totalValue: number;
    soldValue: number;
    bookedValue: number;
    availableValue: number;
  };
  topProjects: {
    _id: string;
    name: string;
    views: number;
    inquiries: number;
  }[];
  monthlyTrends: {
    month: string;
    views: number;
    inquiries: number;
    bookings: number;
  }[];
}

export default function BuilderAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await builderService.getMyProfile();
      const profile = profileData.builder;

      // Mock analytics data - in production, this would come from an API
      setAnalytics({
        overview: {
          totalViews: profile.stats.totalViews,
          totalInquiries: profile.stats.totalInquiries,
          totalLeads: profile.stats.totalLeads,
          conversionRate: profile.stats.totalViews > 0 
            ? (profile.stats.totalInquiries / profile.stats.totalViews) * 100 
            : 0,
          viewsChange: 12.5,
          inquiriesChange: 8.3
        },
        projects: {
          total: profile.portfolio.totalProjects,
          active: profile.portfolio.ongoingProjects,
          draft: 0,
          archived: 0
        },
        inventory: {
          totalUnits: 500,
          available: 200,
          booked: 150,
          sold: 150
        },
        revenue: {
          totalValue: 250000000,
          soldValue: 75000000,
          bookedValue: 75000000,
          availableValue: 100000000
        },
        topProjects: [
          { _id: '1', name: 'Project Alpha', views: 1250, inquiries: 45 },
          { _id: '2', name: 'Project Beta', views: 980, inquiries: 32 },
          { _id: '3', name: 'Project Gamma', views: 750, inquiries: 28 }
        ],
        monthlyTrends: [
          { month: 'Jul', views: 1200, inquiries: 45, bookings: 12 },
          { month: 'Aug', views: 1450, inquiries: 52, bookings: 15 },
          { month: 'Sep', views: 1680, inquiries: 61, bookings: 18 },
          { month: 'Oct', views: 1520, inquiries: 55, bookings: 14 },
          { month: 'Nov', views: 1890, inquiries: 68, bookings: 22 },
          { month: 'Dec', views: 2100, inquiries: 75, bookings: 25 }
        ]
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-500">Start adding projects to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/builder/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500">Track your project performance and leads</p>
            </div>

            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    dateRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`flex items-center gap-1 text-sm ${analytics.overview.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.overview.viewsChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(analytics.overview.viewsChange)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Views</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className={`flex items-center gap-1 text-sm ${analytics.overview.inquiriesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.overview.inquiriesChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(analytics.overview.inquiriesChange)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalInquiries.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Inquiries</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalLeads.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <PieChart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.overview.conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Conversion Rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Inventory Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Units</span>
                <span className="font-semibold">{analytics.inventory.totalUnits}</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${(analytics.inventory.available / analytics.inventory.totalUnits) * 100}%` }}
                />
                <div 
                  className="bg-yellow-500 h-full" 
                  style={{ width: `${(analytics.inventory.booked / analytics.inventory.totalUnits) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(analytics.inventory.sold / analytics.inventory.totalUnits) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                  <p className="font-semibold">{analytics.inventory.available}</p>
                  <p className="text-gray-500">Available</p>
                </div>
                <div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                  <p className="font-semibold">{analytics.inventory.booked}</p>
                  <p className="text-gray-500">Booked</p>
                </div>
                <div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                  <p className="font-semibold">{analytics.inventory.sold}</p>
                  <p className="text-gray-500">Sold</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.totalValue)}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(analytics.revenue.soldValue)}</p>
                  <p className="text-xs text-gray-500">Sold</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-yellow-600">{formatCurrency(analytics.revenue.bookedValue)}</p>
                  <p className="text-xs text-gray-500">Booked</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(analytics.revenue.availableValue)}</p>
                  <p className="text-xs text-gray-500">Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Projects</span>
                <span className="font-bold text-xl">{analytics.projects.total}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">Active</span>
                <span className="font-bold text-green-600">{analytics.projects.active}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-600">Draft</span>
                <span className="font-bold text-yellow-600">{analytics.projects.draft}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {analytics.monthlyTrends.map((month, i) => {
              const maxViews = Math.max(...analytics.monthlyTrends.map(m => m.views));
              const heightPercent = (month.views / maxViews) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1 mb-2">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${heightPercent * 2}px` }}
                      title={`Views: ${month.views}`}
                    />
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(month.inquiries / maxViews) * 200}px` }}
                      title={`Inquiries: ${month.inquiries}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{month.month}</p>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Inquiries</span>
            </div>
          </div>
        </div>

        {/* Top Projects */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Projects</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Inquiries</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProjects.map((project, i) => (
                  <tr key={project._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">{project.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{project.inquiries}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-600 font-medium">
                        {((project.inquiries / project.views) * 100).toFixed(1)}%
                      </span>
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
