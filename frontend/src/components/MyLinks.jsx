import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { getUserUrls, deleteUrl, updateUrl } from "../api/urls";
import { useToast } from "./Toast";
import CopyButton from "./CopyButton";

export default function MyLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [editHasExpiry, setEditHasExpiry] = useState(false);
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [deletingCode, setDeletingCode] = useState(null);
  const [qrLink, setQrLink] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  
  const { addToast } = useToast();

  useEffect(() => {
    if (qrLink) {
      const shortUrl = formatShortLink(qrLink.short_code);
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
    } else {
      setQrCodeUrl("");
    }
  }, [qrLink]);

  const handleDownloadQr = () => {
    if (!qrLink || !qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr_${qrLink.short_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await getUserUrls();
      setLinks(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load your links.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const confirmDelete = async () => {
    if (!deletingCode) return;
    try {
      await deleteUrl(deletingCode);
      addToast("Link deleted successfully.", "success");
      setLinks(links.filter((l) => l.short_code !== deletingCode));
    } catch (err) {
      addToast("Failed to delete link.", "error");
    } finally {
      setDeletingCode(null);
    }
  };

  const handleStartEdit = (link) => {
    setEditingLink(link);
    setEditUrl(link.original_url);
    if (link.expires_at) {
      setEditHasExpiry(true);
      // format to local datetime-local format: YYYY-MM-DDTHH:MM
      const dateObj = new Date(link.expires_at);
      // Subtract timezone offset to get correct local date-time string
      const tzOffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditExpiryDate(localISOTime);
    } else {
      setEditHasExpiry(false);
      setEditExpiryDate("");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const expiresAt = editHasExpiry && editExpiryDate ? new Date(editExpiryDate).toISOString() : null;
      const updated = await updateUrl(editingLink.short_code, editUrl, expiresAt);
      
      // Update link in state
      setLinks(
        links.map((l) =>
          l.short_code === editingLink.short_code
            ? { ...l, original_url: updated.original_url, expires_at: updated.expires_at }
            : l
        )
      );
      
      addToast("Link updated successfully.", "success");
      setEditingLink(null);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update link";
      addToast(msg, "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const formatShortLink = (code) => {
    return `${apiBaseUrl}/${code}`;
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center animate-slide-up flex flex-col items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-brand-500 mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-gray-500 font-medium">Loading your links...</span>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-gray-900">Link Manager</h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>List of your active and expired short codes</p>
        </div>
      </div>

      {links.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 sm:py-12 rounded-xl"
          style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.1)" }}
        >
          <div className="inline-flex p-3 rounded-full bg-brand-50 text-brand-500 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1">No links shortened yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto text-center px-4">
            Get started by pasting your first long URL in the Shorten tab!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {links.map((link) => {
            const shortLink = formatShortLink(link.short_code);
            const expired = isExpired(link.expires_at);
            return (
              <div
                key={link.id}
                className={`p-4 sm:p-5 rounded-xl border flex flex-col justify-between gap-3.5 transition-all ${
                  expired
                    ? "bg-red-50/10 border-red-100"
                    : "bg-gray-50/30 border-gray-100 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={shortLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-brand-600 font-semibold hover:underline break-all text-sm sm:text-base"
                      >
                        {apiBaseUrl.replace(/^https?:\/\//, "")}/{link.short_code}
                      </a>
                      <CopyButton text={shortLink} />
                    </div>

                    <p className="text-xs text-gray-500 truncate" title={link.original_url}>
                      Destination: <span className="font-mono text-gray-700">{link.original_url}</span>
                    </p>
                  </div>

                  {/* Click Badge */}
                  <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-semibold text-brand-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{link.click_count || 0}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-gray-150/40 text-[11px] text-gray-400">
                  <div className="flex items-center gap-3">
                    <span>Created: {new Date(link.created_at).toLocaleDateString()}</span>
                    {link.expires_at && (
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-red-500" : "bg-orange-400 animate-pulse"}`} />
                        <span className={expired ? "text-red-500 font-semibold" : "text-gray-500"}>
                          {expired ? "Expired" : `Expires: ${new Date(link.expires_at).toLocaleDateString()}`}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => setQrLink(link)}
                      className="text-gray-600 hover:text-brand-500 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="2" y="15" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="15" y="2" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="15" y="15" width="3" height="3" rx="0.5" strokeWidth="2" />
                        <rect x="19" y="19" width="3" height="3" rx="0.5" strokeWidth="2" />
                        <path d="M15 19h.01M19 15h.01" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      QR Code
                    </button>
                    <button
                      onClick={() => handleStartEdit(link)}
                      className="text-gray-600 hover:text-brand-500 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingCode(link.short_code)}
                      className="text-gray-400 hover:text-red-600 font-semibold transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingLink && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setEditingLink(null)}></div>

          <div className="relative glass-card bg-white/95 backdrop-blur-md w-full max-w-md p-6 sm:p-8 shadow-2xl animate-scale-up z-10 border border-gray-150/40">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Link Destination</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Short Alias
                </label>
                <input
                  type="text"
                  disabled
                  value={editingLink.short_code}
                  className="input-field text-sm bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="edit-url" className="block text-sm font-medium mb-1 text-gray-600">
                  New Destination URL
                </label>
                <input
                  id="edit-url"
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <input
                    id="edit-enable-expiry"
                    type="checkbox"
                    checked={editHasExpiry}
                    onChange={(e) => {
                      setEditHasExpiry(e.target.checked);
                      if (e.target.checked && !editExpiryDate) {
                        const tomorrow = new Date();
                        tomorrow.setHours(tomorrow.getHours() + 24);
                        const formatted = tomorrow.toISOString().substring(0, 16);
                        setEditExpiryDate(formatted);
                      }
                    }}
                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="edit-enable-expiry" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Set Link Expiration
                  </label>
                </div>

                {editHasExpiry && (
                  <div className="mt-3">
                    <label htmlFor="edit-expiry-date" className="block text-xs font-semibold mb-1 text-gray-500">
                      Expires At
                    </label>
                    <input
                      id="edit-expiry-date"
                      type="datetime-local"
                      value={editExpiryDate}
                      min={new Date().toISOString().substring(0, 16)}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="input-field text-sm"
                      required={editHasExpiry}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="btn-brand px-5 py-2 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {saveLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" />
                      <path className="opacity-75" fill="#fff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  <span>{saveLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deletingCode && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setDeletingCode(null)}></div>

          <div className="relative glass-card bg-white/95 backdrop-blur-md w-full max-w-sm p-6 sm:p-8 shadow-2xl animate-scale-up z-10 border border-gray-150/40 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-red-50 border border-red-100 text-red-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Short Link</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Are you sure you want to delete <span className="font-mono font-semibold text-brand-600">/{deletingCode}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingCode(null)}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger px-5 py-2.5 text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
              >
                <span>Delete Link</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* QR Code Modal */}
      {qrLink && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setQrLink(null)}></div>
          
          <div className="relative glass-card bg-white/95 backdrop-blur-md w-full max-w-sm p-6 sm:p-8 shadow-2xl animate-scale-up z-10 border border-gray-150/40 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">QR Code for link</h3>
            <div className="font-mono text-xs text-brand-600 bg-brand-50/50 py-1.5 px-3 rounded-lg border border-brand-100 inline-block truncate max-w-full">
              {formatShortLink(qrLink.short_code)}
            </div>
            
            <div className="flex justify-center pt-2">
              {qrCodeUrl ? (
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-xl bg-gray-100 animate-pulse" />
              )}
            </div>

            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Scan this QR code with any device to instantly redirect to the destination URL.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setQrLink(null)}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleDownloadQr}
                className="btn-brand px-5 py-2.5 text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
