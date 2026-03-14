import { useState } from "react";
import { shortenUrl } from "../api/urls";
import { useToast } from "./Toast";

export default function ShortenForm({ setResult }) {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const displayDomain = apiBaseUrl.replace(/^https?:\/\//, "") + "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await shortenUrl(url, customCode || null);
      setResult(data);
      setUrl("");
      setCustomCode("");
      addToast("Short URL created successfully!", "success");
    } catch (err) {
      const msg = err.response?.data?.detail || "Error creating short URL";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5 sm:p-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400">
            <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
            <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-base sm:text-lg text-white">Shorten a URL</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Paste your long link and get a shareable short URL</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Long URL <span className="text-indigo-400">*</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/your-long-url"
            className="input-field text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Custom code{" "}
            <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          {/* On mobile: stack prefix above; on sm+: inline prefix */}
          <div className="flex items-stretch gap-0">
            <span
              className="hidden sm:flex px-3 py-3 rounded-l-[10px] text-xs font-mono items-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRight: "none", color: "var(--text-muted)", whiteSpace: "nowrap" }}
            >
              {displayDomain}
            </span>
            <input
              type="text"
              placeholder="my-custom-code"
              className="input-field text-sm sm:rounded-l-none"
              style={{ borderTopLeftRadius: undefined, borderBottomLeftRadius: undefined }}
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>
          <p className="mt-1.5 text-xs sm:hidden" style={{ color: "var(--text-muted)" }}>
            Will be available at <span className="font-mono text-indigo-400">{displayDomain}{"<code>"}</span>
          </p>
        </div>

        <button
          type="submit"
          className="btn-brand w-full mt-2 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Shortening...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12.207 2.232a.75.75 0 00.025 1.06l4.5 4.25a.75.75 0 010 1.06l-4.5 4.25a.75.75 0 11-1.06-1.06L15.193 8.5H3.75a.75.75 0 010-1.5h11.443l-3.522-3.232a.75.75 0 011.036-1.036z" clipRule="evenodd" />
              </svg>
              <span>Generate Short URL</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}