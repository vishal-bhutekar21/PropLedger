import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface OccupancyChartProps {
  occupied: number;
  vacant: number;
  reserved?: number;
  maintenance?: number;
}

const COLORS = {
  Occupied: '#10b981',   // Emerald 500
  Vacant: '#ef4444',     // Red 500
  Reserved: '#3b82f6',   // Blue 500
  Maintenance: '#f59e0b',// Amber 500
};

export function OccupancyChart({ occupied, vacant, reserved = 0, maintenance = 0 }: OccupancyChartProps) {
  const data = [
    { name: 'Occupied', value: occupied, color: COLORS.Occupied },
    { name: 'Vacant', value: vacant, color: COLORS.Vacant },
    ...(reserved > 0 ? [{ name: 'Reserved', value: reserved, color: COLORS.Reserved }] : []),
    ...(maintenance > 0 ? [{ name: 'Maintenance', value: maintenance, color: COLORS.Maintenance }] : []),
  ].filter(d => d.value > 0);

  const total = occupied + vacant + reserved + maintenance;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p>No unit data available</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: unknown) => {
                const count = typeof val === 'number' ? val : Number(val || 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return [`${count} units (${pct}%)`, ''];
              }}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Central occupancy percentage label */}
      <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">{occupancyRate}%</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Occupancy</div>
      </div>
    </div>
  );
}
