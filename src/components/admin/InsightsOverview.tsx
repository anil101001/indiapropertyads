import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewData {
  totalProperties: number;
  totalInquiries: number;
  totalUsers: number;
  totalViews: number;
  growthRates: {
    properties: number;
    inquiries: number;
    users: number;
    views: number;
  };
}

interface Props {
  data: OverviewData;
  loading: boolean;
}

export default function InsightsOverview({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Properties',
      value: data.totalProperties.toLocaleString(),
      growth: data.growthRates.properties,
      icon: '🏘️',
      color: 'blue'
    },
    {
      title: 'Total Inquiries',
      value: data.totalInquiries.toLocaleString(),
      growth: data.growthRates.inquiries,
      icon: '💬',
      color: 'green'
    },
    {
      title: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      growth: data.growthRates.users,
      icon: '👥',
      color: 'purple'
    },
    {
      title: 'Total Views',
      value: data.totalViews.toLocaleString(),
      growth: data.growthRates.views,
      icon: '👁️',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${getColorClasses(card.color)} flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
            {card.growth !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${card.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {card.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(card.growth).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
          <p className="text-sm text-gray-600">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
