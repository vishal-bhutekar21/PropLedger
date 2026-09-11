import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface RevenueChartProps {
  data: Record<string, unknown>[];
}

const formatCurrency = (v: number) => {
  if (v >= 1_00_000) return '₹' + (v / 1_00_000).toFixed(0) + 'L';
  return '₹' + v.toLocaleString('en-IN');
};

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data.length) {
    return <div className="h-48 flex items-center justify-center text-sm text-text-secondary">No revenue data available.</div>;
  }

  const formatted = data.map(d => ({
    month: String(d.month ?? ''),
    Invoiced: Number(d.invoiced_amount ?? 0),
    Collected: Number(d.collected_amount ?? 0),
    Outstanding: Number(d.outstanding ?? 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5a7af5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#5a7af5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip
          formatter={(v: any, name: any) => [formatCurrency(Number(v || 0)), String(name)]}
          contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="Invoiced" stroke="#16a34a" strokeWidth={2}
          fill="url(#colorInvoiced)" dot={false} />
        <Area type="monotone" dataKey="Collected" stroke="#5a7af5" strokeWidth={2}
          fill="url(#colorCollected)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
