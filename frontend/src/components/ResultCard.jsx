import CopyButton from "./CopyButton";

export default function ResultCard({ result }) {
  if (!result) return null;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const shortUrl = `${apiBaseUrl}/${result.short_code}`;
  const created = new Date(result.created_at).toLocaleString();

  return (
    <div className="glass-card p-5 sm:p-6 mt-4 animate-slide-up" style={{ borderColor: "rgba(99,102,241,0.3)" }}>
      {/* Success header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-emerald-400">URL shortened successfully!</span>
      </div>

      {/* Short URL display */}
      <div
        className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-xl mb-4"
        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
      >
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm sm:text-base font-semibold text-indigo-300 hover:text-indigo-200 truncate transition-colors min-w-0"
        >
          {shortUrl}
        </a>
        <div className="flex-shrink-0">
          <CopyButton text={shortUrl} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Original URL</span>
          <span className="text-sm break-all" style={{ color: "var(--text-secondary)" }}>
            {String(result.original_url)}
          </span>
        </div>

        <div className="divider" style={{ margin: "12px 0" }} />

        {/* Footer — stacks on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Short code: <span className="font-mono text-indigo-400">#{result.short_code}</span></span>
          <span className="text-left sm:text-right">{created}</span>
        </div>
      </div>
    </div>
  );
}