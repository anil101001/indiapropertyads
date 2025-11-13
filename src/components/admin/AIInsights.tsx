import { useState } from 'react';
import { Sparkles, TrendingUp, Target, AlertCircle, DollarSign, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface AIInsightsData {
  summary: string;
  topActions: string[];
  metrics: {
    conversations: number;
    hotLeads: number;
    conversionRate: number;
  };
  revenueOpportunity: string;
  redFlags: string[];
  insights: {
    topIntent: string;
    topLocation: string;
    budgetSweet: string;
    conversionTrigger: string;
  };
  generatedAt: string;
}

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('7days');
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/analytics/ai-insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period })
      });

      const data = await response.json();
      
      if (data.success) {
        setInsights(data.data);
      } else {
        setError(data.message || 'Failed to generate insights');
      }
    } catch (err: any) {
      console.error('AI insights error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold">🤖 AI Customer Intelligence</h2>
            <p className="text-purple-100 text-sm">Get instant insights about what your customers want</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg border-0 font-medium focus:ring-2 focus:ring-purple-300"
            disabled={loading}
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          
          <button
            onClick={generateInsights}
            disabled={loading}
            className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate AI Insights
              </>
            )}
          </button>
        </div>
        
        {loading && (
          <p className="text-sm text-purple-100 mt-3">⏱️ This takes 10-15 seconds...</p>
        )}
        
        {insights && !loading && (
          <p className="text-sm text-purple-100 mt-3">
            Last generated: {new Date(insights.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights && !loading && (
        <>
          {/* Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              💬 What's Happening Right Now
            </h3>
            <p className="text-gray-800 leading-relaxed text-lg">{insights.summary}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{insights.metrics.conversations}</div>
              <div className="text-sm text-gray-600">Conversations Analyzed</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{insights.metrics.hotLeads}</div>
              <div className="text-sm text-gray-600">Hot Leads Identified</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{insights.metrics.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>

          {/* Revenue Opportunity */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6" />
              <h3 className="text-lg font-bold">Revenue Opportunity</h3>
            </div>
            <p className="text-4xl font-bold mb-2">{insights.revenueOpportunity}</p>
            <p className="text-sm text-green-100">Based on hot leads currently in your pipeline</p>
          </div>

          {/* Top Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold">🎯 Top 3 Actions to Take Today</h3>
            </div>
            <div className="space-y-3">
              {insights.topActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
                  <span className="font-bold text-xl text-green-600">#{idx + 1}</span>
                  <span className="text-gray-800 flex-1">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-2">🎯 Top Customer Intent</h4>
              <p className="text-gray-900">{insights.insights.topIntent}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-2">📍 Most Requested Location</h4>
              <p className="text-gray-900">{insights.insights.topLocation}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-2">💰 Budget Sweet Spot</h4>
              <p className="text-gray-900">{insights.insights.budgetSweet}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-2">✨ Conversion Trigger</h4>
              <p className="text-gray-900">{insights.insights.conversionTrigger}</p>
            </div>
          </div>

          {/* Red Flags */}
          {insights.redFlags && insights.redFlags.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-bold text-red-800">🔴 Issues to Address Immediately</h3>
              </div>
              <ul className="space-y-2">
                {insights.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-red-700">
                    <span className="font-bold">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trend Indicator */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold">💡 Pro Tip</h3>
            </div>
            <p className="text-gray-700 text-sm">
              Generate insights daily to track trends over time. The AI learns from patterns 
              and will help you spot emerging opportunities and potential issues before they become problems.
            </p>
          </div>
        </>
      )}

      {/* Empty State */}
      {!insights && !loading && !error && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Generate Insights</h3>
          <p className="text-gray-600 mb-6">
            Select a time period and click "Generate AI Insights" to see what your customers want
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span>Takes 10-15 seconds • Uses GPT-4 for analysis</span>
          </div>
        </div>
      )}
    </div>
  );
}
