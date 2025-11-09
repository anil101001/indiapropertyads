import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LocationData {
  city: string;
  state: string;
  count: number;
}

interface Props {
  data: LocationData[];
  loading: boolean;
  onBarClick?: (city: string, state: string) => void;
}

export default function TopLocationsChart({ data, loading, onBarClick }: Props) {
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
        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Locations</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No location data available
        </div>
      </div>
    );
  }

  // Format data for chart, including original city and state
  const chartData = data.map(item => ({
    location: `${item.city}, ${item.state}`,
    properties: item.count,
    city: item.city,
    state: item.state
  }));

  const handleClick = (data: any) => {
    if (onBarClick && data && data.city && data.state) {
      onBarClick(data.city, data.state);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Top Locations</h3>
        {onBarClick && (
          <p className="text-xs text-gray-500">Click on a bar to see details</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="location"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={150}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="properties" 
            fill="#667eea"
            radius={[0, 8, 8, 0]}
            name="Properties"
            onClick={handleClick}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
