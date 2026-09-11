import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface TopPropertiesChartProps {
  data: Record<string, unknown>[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export function TopPropertiesChart({ data }: TopPropertiesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
        No property revenue data available
      </div>
    );
  }

  const chartData = data.map((item, i) => ({
    name: (item.property_name || item.propertyName || `Property #${i + 1}`) as string,
    revenue: Number(item.total_revenue || item.totalCollected || item.revenue || 0),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis
            type="number"
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <Tooltip
            formatter={(value: unknown) => [
              `₹${Number(value || 0).toLocaleString()}`,
              'Total Revenue'
            ]}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
