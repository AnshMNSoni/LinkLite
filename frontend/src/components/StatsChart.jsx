import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-surface-elevated border border-black/10 rounded-lg shadow-xl shadow-black/5">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-gray-900 mt-0.5">
          {payload[0].value} click{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function StatsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.1)" }}>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>No data available</span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.clicks));

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#5a5a7a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => {
              const d = new Date(v);
              return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
          />
          <YAxis
            tick={{ fill: "#5a5a7a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="clicks" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.clicks === maxVal
                    ? "#10d068"
                    : `rgba(16, 208, 104, ${0.2 + (entry.clicks / maxVal) * 0.6})`
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
