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

const getReferrerIcon = (name) => {
  const cleanName = name.toLowerCase();
  if (cleanName.includes("google")) {
    return (
      <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.483 0-6.312-2.829-6.312-6.312S10.51 5.89 13.99 5.89c1.672 0 3.12.57 4.254 1.637l3.123-3.123C19.467 2.656 16.924 1.5 13.99 1.5 8.196 1.5 3.5 6.196 3.5 12s4.696 10.5 10.49 10.5c5.795 0 10.01-4.074 10.01-10.2 0-.686-.062-1.354-.187-2.015H12.24z" />
      </svg>
    );
  }
  if (cleanName.includes("linkedin")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#0077b5] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  if (cleanName.includes("twitter") || cleanName.includes("x.com")) {
    return (
      <svg className="w-3.5 h-3.5 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (cleanName.includes("facebook")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#1877f2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    );
  }
  if (cleanName.includes("instagram")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#e1306c] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (cleanName.includes("github")) {
    return (
      <svg className="w-3.5 h-3.5 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    );
  }
  if (cleanName.includes("youtube")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#ff0000] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (cleanName.includes("reddit")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#ff4500] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.3-4.14 4.23.9c.04.97.84 1.75 1.82 1.75 1.01 0 1.83-.82 1.83-1.83 0-1.01-.82-1.83-1.83-1.83-.75 0-1.4.45-1.69 1.1l-4.79-1.02c-.22-.05-.44.08-.51.3l-1.5 4.77C7.07 7.86 4.88 8.5 3.24 9.49 2.68 8.73 1.78 8.25.8 8.25c-1.65 0-3 1.35-3 3 0 1.2.7 2.23 1.72 2.72-.03.18-.05.36-.05.54 0 3.86 4.43 7 9.9 7s9.9-3.14 9.9-7c0-.18-.02-.36-.05-.54 1.02-.49 1.72-1.52 1.72-2.72zM6 13.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5S6 14.33 6 13.5zm10.75 4.5c-1.5 1.5-4.25 1.5-5.75 0-.15-.15-.15-.39 0-.54.15-.15.39-.15.54 0 1.2 1.2 3.47 1.2 4.67 0 .15-.15.39-.15.54 0 .15.15.15.39 0 .54zm-.25-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    );
  }
  if (cleanName.includes("whatsapp")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#25d366] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.51 1.45 5.4 1.45 5.55 0 10.06-4.51 10.06-10.06C22.1 5.03 17.59.5 12.04.5 6.48.5 1.98 5.02 1.97 10.58c0 1.9.49 3.75 1.43 5.36l-.99 3.61 3.7-.97.47.27zM17.486 14.4c-.3-.15-1.782-.88-2.062-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.36.2-.66.05-1.05-.53-1.83-.93-2.54-1.63-.37-.3-.72-.73-1.03-1.12-.24-.3-.02-.47.13-.62.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.68-.5-.18 0-.39-.02-.6-.02-.2 0-.53.07-.8.38-.28.3-1.08 1.05-1.08 2.57s1.1 3 1.26 3.21c.15.22 2.18 3.33 5.28 4.67.74.32 1.31.5 1.76.64.74.24 1.4.2 1.94.12.6-.08 1.782-.73 2.032-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.21-.58-.36z" />
      </svg>
    );
  }
  if (cleanName.includes("direct") || cleanName.includes("email")) {
    return (
      <svg className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    );
  }
  if (cleanName.includes("peerlist")) {
    return (
      <svg className="w-3.5 h-3.5 text-[#00e676] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="#00e676" opacity="0.1" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
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
                            <div className="flex items-center justify-between text-xs gap-2">
                              <div className="flex items-center gap-1.5 font-semibold text-gray-700 min-w-0">
                                {getReferrerIcon(r.name)}
                                <span className="truncate" title={r.name}>{r.name}</span>
                              </div>
                              <span className="text-gray-500 font-medium flex-shrink-0">
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