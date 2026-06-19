import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { fetchAnalytics } from "../api/analytics";
import StatsChart from "./StatsChart";
import CopyButton from "./CopyButton";
import { useToast } from "./Toast";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const DonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/95 backdrop-blur-sm border border-gray-150 rounded-lg shadow-md">
        <p className="text-[11px] font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-[11px] font-bold text-brand-600 mt-0.5">
          {payload[0].value} click{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage({ user, setRoute }) {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleFetch = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setData(null);
    try {
      const result = await fetchAnalytics(code.trim());
      setData(result);
    } catch (err) {
      if (err.response?.status === 403) {
        window.history.pushState({}, "", "/unauthorized");
        setRoute("unauthorized");
        return;
      }
      const msg = err.response?.status === 404
        ? "Short code not found"
        : "Failed to fetch analytics";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const shortUrl = code ? `${apiBaseUrl}/${code}` : null;

  return (
    <div className="glass-card p-5 sm:p-8 animate-slide-up">
      {/* Search form — stacks vertically on mobile */}
      <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="flex flex-1 items-center gap-0">
          <span
            className="px-3 py-3 rounded-l-[10px] text-sm font-mono flex-shrink-0"
            style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--border-subtle)", borderRight: "none", color: "var(--text-muted)" }}
          >
            /
          </span>
          <label htmlFor="short-code-input" className="sr-only">Short code</label>
          <input
            id="short-code-input"
            type="text"
            className="input-field rounded-l-none text-sm"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            placeholder="short-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn-brand w-full sm:w-auto flex items-center justify-center gap-2"
          disabled={loading || !code.trim()}
          style={{ opacity: !code.trim() ? 0.5 : 1, cursor: !code.trim() ? "not-allowed" : "pointer" }}
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          )}
          <span>Analyze</span>
        </button>
      </form>

      {/* Results */}
      {data && (
        <div className="space-y-4 sm:space-y-5 animate-slide-up">
          {/* Top stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="stat-card">
              <div className="text-2xl sm:text-3xl font-black gradient-text">{data.total_clicks.toLocaleString()}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>Total Clicks</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl sm:text-3xl font-black gradient-text-brand">
                {data.daily_clicks.length > 0
                  ? data.daily_clicks[data.daily_clicks.length - 1].clicks
                  : 0}
              </div>
              <div className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>Latest Day</div>
            </div>
          </div>

          {/* Short URL info */}
          {shortUrl && (
            <div
              className="hidden sm:flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/20"
            >
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm font-semibold text-brand-400 hover:text-brand-300 break-all"
              >
                {shortUrl}
              </a>
              <div className="flex-shrink-0">
                <CopyButton text={shortUrl} label="Copy analytics URL" />
              </div>
            </div>
          )}

          {/* Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Daily clicks</h3>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {data.daily_clicks.length} day{data.daily_clicks.length !== 1 ? "s" : ""}
              </span>
            </div>
            <StatsChart data={data.daily_clicks} />
          </div>
          {/* Detailed Stats Grid */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Device & Platform Insights */}
              <div className="glass-card p-5 sm:p-6 border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold mb-5 text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Audience Insights
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Browsers */}
                    <div className="flex flex-col items-center space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 self-start">Browsers</h4>
                      {data.browsers && data.browsers.length > 0 ? (
                        <div className="w-full flex flex-col items-center space-y-4">
                          <div className="w-24 h-24 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={data.browsers}
                                  dataKey="clicks"
                                  nameKey="name"
                                  innerRadius={22}
                                  outerRadius={38}
                                  paddingAngle={2}
                                >
                                  {data.browsers.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<DonutTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full space-y-1.5">
                            {data.browsers.slice(0, 4).map((b, idx) => (
                              <div key={b.name} className="flex items-center justify-between text-[11px] w-full px-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                  <span className="font-semibold text-gray-600 truncate" title={b.name}>{b.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 ml-2">{b.clicks}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 py-6 text-center">No browser data</div>
                      )}
                    </div>

                    {/* OS Systems */}
                    <div className="flex flex-col items-center space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 self-start">Platforms / OS</h4>
                      {data.os && data.os.length > 0 ? (
                        <div className="w-full flex flex-col items-center space-y-4">
                          <div className="w-24 h-24 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={data.os}
                                  dataKey="clicks"
                                  nameKey="name"
                                  innerRadius={22}
                                  outerRadius={38}
                                  paddingAngle={2}
                                >
                                  {data.os.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<DonutTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full space-y-1.5">
                            {data.os.slice(0, 4).map((o, idx) => (
                              <div key={o.name} className="flex items-center justify-between text-[11px] w-full px-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} />
                                  <span className="font-semibold text-gray-600 truncate" title={o.name}>{o.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 ml-2">{o.clicks}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 py-6 text-center">No platform data</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-[10px] text-gray-400 text-center pt-5 border-t border-gray-50 mt-4">
                  Device insights summarize visitor browsers and operating systems.
                </div>
              </div>

              {/* Referrer Sources list & stats */}
              <div className="glass-card p-5 sm:p-6 border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold mb-5 text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Referrer Sources
                  </h3>
                  {data.referrers && data.referrers.length > 0 ? (
                    <div className="space-y-3.5">
                      {[...data.referrers].sort((a,b) => b.clicks - a.clicks).slice(0, 4).map((r) => {
                        const totalClicksCount = data.total_clicks || 1;
                        const percentage = Math.round((r.clicks / totalClicksCount) * 100);
                        return (
                          <div key={r.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-700">{r.name}</span>
                              <span className="text-gray-500 font-medium">
                                {r.clicks} click{r.clicks !== 1 ? "s" : ""} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-12">No referrer data captured yet</div>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 text-center pt-5 border-t border-gray-50 mt-4">
                  Referral metrics show where users found your link before redirecting.
                </div>
              </div>
            </div>
          )}

          {/* Daily breakdown table */}
          {data.daily_clicks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Breakdown</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {[...data.daily_clicks].reverse().map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm"
                    style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 w-6 sm:w-8 text-right">{d.clicks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && (
        <div
          className="flex flex-col items-center justify-center py-10 sm:py-12 rounded-xl"
          style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.1)" }}
        >
          <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 sm:w-12 sm:h-12 mb-3" style={{ color: "var(--text-muted)" }}>
            <rect x="4" y="28" width="8" height="16" rx="2" fill="currentColor" opacity="0.3" />
            <rect x="20" y="18" width="8" height="26" rx="2" fill="currentColor" opacity="0.5" />
            <rect x="36" y="8" width="8" height="36" rx="2" fill="currentColor" opacity="0.7" />
          </svg>
          <p className="text-xs sm:text-sm font-medium text-center px-4" style={{ color: "var(--text-muted)" }}>Enter a short code above to see analytics</p>
        </div>
      )}
    </div>
  );
}