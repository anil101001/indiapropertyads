import { useState } from 'react';
import { TrendingUp, Sparkles, Download, Calendar, Brain, Zap, Eye, AlertTriangle, CheckCircle, ArrowUp } from 'lucide-react';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'predictive' | 'insights'>('overview');

  const predictions = {
    nextMonth: { revenue: 13800000, growth: 10.4, properties: 9850, users: 13900, confidence: 94 },
    nextQuarter: { revenue: 42500000, growth: 12.8, properties: 11200, users: 16500, confidence: 89 },
  };

  const insights = [
    { type: 'opportunity', icon: <Sparkles className="h-5 w-5" />, title: 'High Demand in Pune', description: 'AI detected 45% increase in searches for 2BHK apartments in Pune. Recommend targeting agents in this region.', impact: 'High', confidence: 92, action: 'Launch targeted campaign' },
    { type: 'warning', icon: <AlertTriangle className="h-5 w-5" />, title: 'Agent Churn Risk', description: '8 agents showing low engagement (< 2 logins/week). Risk of leaving platform within 30 days.', impact: 'Medium', confidence: 87, action: 'Send retention offers' },
    { type: 'success', icon: <CheckCircle className="h-5 w-5" />, title: 'AI Pricing Working', description: 'Properties with AI-suggested pricing converting 23% faster than manual pricing.', impact: 'High', confidence: 95, action: 'Promote AI pricing' },
  ];

  const revenueBreakdown = [
    { category: 'Agent Commissions', amount: 7750000, percentage: 62, growth: 15.2 },
    { category: 'Featured Listings', amount: 2125000, percentage: 17, growth: 22.8 },
    { category: 'Premium Subscriptions', amount: 1500000, percentage: 12, growth: 18.5 },
    { category: 'Lead Generation', amount: 875000, percentage: 7, growth: 12.3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              AI-Powered Admin Reports
            </h1>
            <p className="text-gray-600">Predictive analytics and intelligent insights</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
                { id: 'predictive', label: 'AI Predictions', icon: <Sparkles className="h-4 w-4" /> },
                { id: 'insights', label: 'AI Insights', icon: <Brain className="h-4 w-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 whitespace-nowrap ${
                    selectedReport === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {selectedReport === 'overview' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  {revenueBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{item.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">₹{(item.amount / 100000).toFixed(1)}L ({item.percentage}%)</span>
                            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {item.growth}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'predictive' && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Next Month Prediction</h3>
                  <span className="ml-auto px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">{predictions.nextMonth.confidence}% Confidence</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-purple-600">₹{(predictions.nextMonth.revenue / 10000000).toFixed(1)} Cr</p>
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" />{predictions.nextMonth.growth}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Properties</p>
                    <p className="text-2xl font-bold text-purple-600">{predictions.nextMonth.properties.toLocaleString()}</p>
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" />10.4%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Users</p>
                    <p className="text-2xl font-bold text-purple-600">{predictions.nextMonth.users.toLocaleString()}</p>
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1"><ArrowUp className="h-3 w-3" />11.6%</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-purple-600">{predictions.nextMonth.confidence}%</p>
                    <p className="text-xs text-gray-600 mt-1">AI Model</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'insights' && (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Generated Insights</h3>
              {insights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${
                  insight.type === 'opportunity' ? 'bg-green-50 border-green-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                      insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-600">{insight.confidence}% confidence</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            insight.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{insight.impact} Impact</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      <button className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition">
                        {insight.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
