import { useEffect, useState } from "react";
import QRCode from "qrcode";
import CopyButton from "./CopyButton";

export default function ResultCard({ result }) {
  if (!result) return null;

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const shortUrl = `${apiBaseUrl}/${result.short_code}`;
  const created = new Date(result.created_at).toLocaleString();

  useEffect(() => {
    if (result?.short_code) {
      QRCode.toDataURL(shortUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code", err));
    }
  }, [shortUrl, result?.short_code]);

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr_${result.short_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card p-5 sm:p-6 mt-4 animate-slide-up border-brand-500/20">
      {/* Success header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-500/10 border border-brand-500/30">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-brand-400">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-brand-400">URL created successfully</span>
      </div>

      {/* Short URL display */}
      <div
        className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl mb-5 bg-brand-500/10 border border-brand-500/20"
      >
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-base sm:text-lg font-bold text-brand-400 hover:text-brand-300 truncate transition-colors min-w-0"
        >
          {shortUrl}
        </a>
        <div className="flex-shrink-0">
          <CopyButton text={shortUrl} />
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-gray-50/40 border border-gray-100 mb-5">
        <div className="flex-shrink-0 bg-white p-2 rounded-xl border border-gray-200/60 shadow-sm flex items-center justify-center">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 sm:w-28 sm:h-28" />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gray-150/50 animate-pulse" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h4 className="font-bold text-sm text-gray-900">QR Code Generated</h4>
          <p className="text-xs text-gray-500 max-w-sm">
            Scan this QR code with any device to access the shortened URL, or download a PNG file for offline use.
          </p>
          {qrCodeUrl && (
            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm cursor-pointer hover:border-gray-300"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Destination</span>
          <a 
            href={result.original_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm break-all hover:text-gray-900 transition-colors" 
            style={{ color: "var(--text-secondary)" }}
          >
            {String(result.original_url)}
          </a>
        </div>

        <div className="divider" style={{ margin: "16px 0" }} />

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="bg-surface-800 px-2 py-1 rounded inline-flex w-max border border-black/5">
            ID: <span className="font-mono text-brand-500 ml-1">#{result.short_code}</span>
          </span>
          <span className="text-left sm:text-right">{created}</span>
        </div>
      </div>
    </div>
  );
}