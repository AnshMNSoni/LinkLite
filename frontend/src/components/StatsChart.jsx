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
      <div
        className="px-3 py-2 rounded-lg text-sm"
        style={{
          background: "rgba(15,15,26,0.95)",
          border: "1px solid rgba(99,102,241,0.3)",
          backdropFilter: "blur(10px)",
        }}
      >
        <p className="font-semibold text-indigo-300">{label}</p>
        <p className="text-white mt-0.5">
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
      <div className="flex items-center justify-center h-48 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(99,102,241,0.2)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No click data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.clicks));

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
          <Bar dataKey="clicks" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.clicks === maxVal
                    ? "#818cf8"
                    : `rgba(99, 102, 241, ${0.3 + (entry.clicks / maxVal) * 0.5})`
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
