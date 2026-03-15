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
        <div>
          <h2 className="font-bold text-lg text-gray-900">Create Short Link</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Paste your long URL to shorten</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="long-url" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Destination URL <span className="text-brand-500" aria-hidden="true">*</span>
          </label>
          <input
            id="long-url"
            type="url"
            placeholder="https://example.com/very/long/path"
            className="input-field text-base py-3"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="custom-code" className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Custom Alias{" "}
            <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(Optional)</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
            <span
              className="px-4 py-3 rounded-xl sm:rounded-r-none text-sm font-mono flex items-center sm:flex-shrink-0"
              style={{ background: "rgba(0,0,0,0.02)", border: "1px solid var(--border-subtle)", smBorderRight: "none", color: "var(--text-muted)" }}
            >
              {displayDomain}
            </span>
            <input
              id="custom-code"
              type="text"
              placeholder="my-cool-link"
              className="input-field text-sm sm:rounded-l-none"
              style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              aria-label="Custom alias for your short URL"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-brand w-full mt-4 flex items-center justify-center gap-2 py-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#000" strokeWidth="4" />
                <path className="opacity-75" fill="#000" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Shortening...</span>
            </>
          ) : (
            <>
              <span>Shorten URL</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}