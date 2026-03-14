import { useState } from "react";
import { fetchAnalytics } from "../api/analytics";
import StatsChart from "./StatsChart";
import CopyButton from "./CopyButton";
import { useToast } from "./Toast";

export default function AnalyticsPage() {
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
      const msg = err.response?.status === 404
        ? "Short code not found"
        : "Failed to fetch analytics";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = code ? `http://localhost:8000/${code}` : null;

  return (
    <div className="glass-card p-5 sm:p-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(232,121,249,0.2))", border: "1px solid rgba(139,92,246,0.3)" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400">
            <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-base sm:text-lg text-white">Link Analytics</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Enter a short code to view click statistics</p>
        </div>
      </div>

      {/* Search form — stacks vertically on mobile */}
      <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-5 sm:mb-6">
        <div className="flex flex-1 items-center gap-0">
          <span
            className="px-3 py-3 rounded-l-[10px] text-sm font-mono flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRight: "none", color: "var(--text-muted)" }}
          >
            /
          </span>
          <input
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
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
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
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}
            >
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-indigo-300 hover:text-indigo-200 break-all"
              >
                {shortUrl}
              </a>
              <div className="flex-shrink-0">
                <CopyButton text={shortUrl} label="Copy URL" />
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

          {/* Daily breakdown table */}
          {data.daily_clicks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Breakdown</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {[...data.daily_clicks].reverse().map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white w-6 sm:w-8 text-right">{d.clicks}</span>
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
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(99,102,241,0.15)" }}
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