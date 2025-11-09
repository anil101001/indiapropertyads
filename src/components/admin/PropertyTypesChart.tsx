import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PropertyTypeData {
  type: string;
  count: number;
  percentage: string;
}

interface Props {
  data: PropertyTypeData[];
  loading: boolean;
  onSliceClick?: (type: string) => void;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

export default function PropertyTypesChart({ data, loading, onSliceClick }: Props) {
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
        <h3 className="text-lg font-bold text-gray-900 mb-6">Property Types Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No property data available
        </div>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map(item => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count,
    percentage: item.percentage
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
          <p className="text-sm text-gray-600">Percentage: {payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (data: any, index: number) => {
    console.log('Pie chart clicked - data:', data, 'index:', index);
    if (onSliceClick && data) {
      // Get the type from the clicked data
      const type = data.name ? data.name.toLowerCase() : chartData[index]?.name.toLowerCase();
      console.log('Calling onSliceClick with type:', type);
      if (type) {
        onSliceClick(type);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Property Types Distribution</h3>
        {onSliceClick && (
          <p className="text-xs text-gray-500">✨ Click on a slice to see details</p>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            onClick={handleClick}
            cursor={onSliceClick ? 'pointer' : 'default'}
          >
            {chartData.map((_entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
