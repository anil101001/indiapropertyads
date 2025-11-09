import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface PropertyData {
  propertyId: string;
  title: string;
  inquiryCount: number;
  price?: number;
  address?: {
    city?: string;
    state?: string;
  };
  propertyType?: string;
}

interface Props {
  data: PropertyData[];
  loading: boolean;
  onBarClick?: (propertyId: string, title: string) => void;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3'];

export default function TopPropertiesByInquiriesChart({ data, loading, onBarClick }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Properties by Inquiries</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No inquiry data available
        </div>
      </div>
    );
  }

  // Format data for chart - truncate long titles
  const chartData = data.map((item, index) => ({
    title: item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title,
    fullTitle: item.title,
    inquiries: item.inquiryCount,
    propertyId: item.propertyId,
    color: COLORS[index % COLORS.length]
  }));

  const handleClick = (data: any) => {
    console.log('Property bar clicked - data:', data);
    if (onBarClick && data) {
      const propertyId = data.propertyId;
      const title = data.fullTitle;
      console.log('Calling onBarClick with propertyId:', propertyId, 'title:', title);
      if (propertyId && title) {
        onBarClick(propertyId, title);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Top Properties by Inquiries</h3>
        {onBarClick && (
          <p className="text-xs text-gray-500">✨ Click on a bar to see inquiry details</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Number of Inquiries', position: 'insideBottom', offset: -5, style: { fontSize: '11px', fill: '#6b7280' } }}
          />
          <YAxis 
            type="category"
            dataKey="title"
            stroke="#6b7280"
            style={{ fontSize: '10px' }}
            width={200}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any, name: string, props: any) => {
              return [value, 'Inquiries'];
            }}
            labelFormatter={(label: any, payload: any) => {
              return payload[0]?.payload?.fullTitle || label;
            }}
          />
          <Legend />
          <Bar 
            dataKey="inquiries" 
            radius={[0, 8, 8, 0]}
            name="Inquiries"
            onClick={handleClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
