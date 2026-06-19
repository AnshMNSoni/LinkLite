import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getUserUrls, deleteUrl, updateUrl } from "../api/urls";
import { loginWithGoogle } from "../api/auth";
import { fetchAnalytics } from "../api/analytics";
import StatsChart from "./StatsChart";
import { useToast } from "./Toast";
import CopyButton from "./CopyButton";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const DonutTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/95 backdrop-blur-sm border border-gray-150 rounded-lg shadow-md z-30">
        <p className="text-[11px] font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-[11px] font-bold text-brand-600 mt-0.5">
          {payload[0].value} click{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const getCleanReferrerName = (name) => {
  if (!name) return "Direct / Organic";
  const cleanName = name.toLowerCase();
  if (cleanName.includes("android.gm") || cleanName.includes("mail.google")) return "Google Mail";
  if (cleanName.includes("google")) return "Google";
  if (cleanName.includes("linkedin")) return "LinkedIn";
  if (cleanName.includes("twitter") || cleanName.includes("x.com") || cleanName.includes("t.co")) return "X (Twitter)";
  if (cleanName.includes("facebook") || cleanName.includes("fb.me")) return "Facebook";
  if (cleanName.includes("instagram")) return "Instagram";
  if (cleanName.includes("github")) return "GitHub";
  if (cleanName.includes("youtube") || cleanName.includes("youtu.be")) return "YouTube";
  if (cleanName.includes("reddit")) return "Reddit";
  if (cleanName.includes("whatsapp")) return "WhatsApp";
  if (cleanName.includes("peerlist")) return "Peerlist";
  
  try {
    const url = new URL(name);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return name;
  }
};

const getReferrerIcon = (name) => {
  const cleanName = name.toLowerCase();
  if (cleanName.includes("google") || cleanName.includes("android.gm")) {
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
  if (cleanName.includes("twitter") || cleanName.includes("x.com") || cleanName.includes("t.co")) {
    return (
      <svg className="w-3.5 h-3.5 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (cleanName.includes("facebook") || cleanName.includes("fb.me")) {
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
  if (cleanName.includes("youtube") || cleanName.includes("youtu.be")) {
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

export default function MyLinks({ user, onLogin }) {
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

  const [expandedLinkId, setExpandedLinkId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    if (!user) {
      const initGoogleMyLinks = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });
          const btnEl = document.getElementById("google-signin-btn-mylinks");
          if (btnEl) {
            window.google.accounts.id.renderButton(
              btnEl,
              { theme: "filled_blue", size: "large", shape: "pill" }
            );
          }
        }
      };

      if (window.google) {
        initGoogleMyLinks();
      } else {
        const timer = setInterval(() => {
          if (window.google) {
            initGoogleMyLinks();
            clearInterval(timer);
          }
        }, 500);
        return () => clearInterval(timer);
      }
    }
  }, [user]);

  const handleCredentialResponse = async (response) => {
    try {
      const data = await loginWithGoogle(response.credential);
      onLogin(data.access_token, data.user);
      addToast(`Welcome back, ${data.user.name || "User"}!`, "success");
    } catch (err) {
      const msg = err.response?.data?.detail || "Google login failed";
      addToast(msg, "error");
    }
  };

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

  const handleShareQr = async () => {
    if (!qrLink || !qrCodeUrl) return;
    const shortUrl = formatShortLink(qrLink.short_code);
    
    if (navigator.share) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `qr_${qrLink.short_code}.png`, { type: "image/png" });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `QR Code for ${qrLink.short_code}`,
            text: `Scan this QR Code to visit: ${shortUrl}`,
            files: [file],
          });
          addToast("QR Code shared successfully!", "success");
        } else {
          await navigator.share({
            title: `QR Code for ${qrLink.short_code}`,
            text: `Scan this QR Code to visit: ${shortUrl}`,
            url: shortUrl,
          });
          addToast("Link shared successfully!", "success");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing QR code", err);
          addToast("Failed to share QR code.", "error");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shortUrl);
        addToast("Short URL copied to clipboard (sharing not supported)!", "success");
      } catch (err) {
        addToast("Sharing not supported on this browser.", "error");
      }
    }
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
    if (user) {
      fetchLinks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleToggleAnalytics = async (shortCode) => {
    if (expandedLinkId === shortCode) {
      setExpandedLinkId(null);
      return;
    }

    setExpandedLinkId(shortCode);

    if (analyticsData[shortCode]) {
      return;
    }

    setAnalyticsLoading(true);
    try {
      const data = await fetchAnalytics(shortCode);
      setAnalyticsData(prev => ({ ...prev, [shortCode]: data }));
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch analytics data.", "error");
      setExpandedLinkId(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

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

  if (!user) {
    return (
      <div className="glass-card relative w-full max-w-lg mx-auto overflow-hidden p-5 sm:p-7 shadow-xl min-h-[450px] flex items-center justify-center animate-slide-up">
        {/* The Blurred Preview Dashboard (Strictly brand colors: green, black, white, gray) */}
        <div className="w-full space-y-6 filter blur-[3.5px] opacity-65 select-none pointer-events-none">
          {/* Mock Link Header Card */}
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-brand-600 font-bold text-sm">linklite.co/mock</span>
                <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"></span>
              </div>
              <p className="text-[10px] text-gray-400">
                Destination: <span className="font-mono text-gray-500">https://example.com/very/long/url/...</span>
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-brand-500"></span>
              <span>142 clicks</span>
            </div>
          </div>

          {/* Mock Stat Boxes Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white text-center shadow-sm">
              <div className="text-xl font-black text-gray-900">142</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Clicks</div>
            </div>
            <div className="p-3.5 rounded-xl border border-gray-100 bg-white text-center shadow-sm">
              <div className="text-xl font-black text-brand-600">18</div>
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Latest Day</div>
            </div>
          </div>

          {/* Mock Click History Chart */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-gray-400 uppercase tracking-wider">Click History</span>
              <span className="text-gray-500 font-medium">7 days</span>
            </div>
            <div className="h-28 bg-white rounded-xl border border-gray-100 flex items-end justify-between p-4 gap-2.5 shadow-sm">
              <div className="h-[35%] bg-brand-200/60 rounded-t w-full"></div>
              <div className="h-[55%] bg-brand-300/70 rounded-t w-full"></div>
              <div className="h-[25%] bg-brand-200/60 rounded-t w-full"></div>
              <div className="h-[80%] bg-brand-400/80 rounded-t w-full"></div>
              <div className="h-[45%] bg-brand-300/70 rounded-t w-full"></div>
              <div className="h-[95%] bg-brand-500 rounded-t w-full"></div>
              <div className="h-[70%] bg-brand-400/80 rounded-t w-full"></div>
            </div>
          </div>

          {/* Mock Referrer Sources progress list */}
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-3">
            <div className="font-bold text-[10px] text-gray-900 uppercase tracking-wider">Referrer Sources</div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-medium text-gray-700">
                  <span>Direct / Email</span>
                  <span>92 Clicks</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full w-[65%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-medium text-gray-700">
                  <span>Twitter / X</span>
                  <span>34 Clicks</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-300 rounded-full w-[24%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glassy Sign-in Modal Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white/20 backdrop-blur-[5px] z-10">
          <div className="w-full max-w-sm text-center space-y-6 animate-scale-up">
            {/* Colored Google Logo */}
            <div className="w-14 h-14 mx-auto flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                Unlock Link Analytics
              </h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                Sign in to view real-time click history, monitor traffic sources, and manage your shortened URLs.
              </p>
            </div>

            {/* Features Glassy Stats Panel */}
            <div className="p-4 rounded-2xl bg-white/70 border border-gray-200/50 shadow-sm grid grid-cols-3 gap-2 w-full">
              {/* Column 1: 100% Free */}
              <div className="flex flex-col items-center text-center space-y-1">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">100% Free</span>
              </div>
              
              {/* Column 2: Platform Click */}
              <div className="flex flex-col items-center text-center space-y-1 border-x border-gray-200/60 px-1">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tracking</span>
              </div>

              {/* Column 3: Secure Your Link */}
              <div className="flex flex-col items-center text-center space-y-1">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secure Link</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-2">
              <div id="google-signin-btn-mylinks" className="min-h-[50px] transition-transform hover:scale-[1.02]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLinkLoading = analyticsLoading && !analyticsData[expandedLinkId];

  return (
    <div className="glass-card p-5 sm:p-8 animate-slide-up">
      {links.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 sm:py-12 rounded-xl"
          style={{ background: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.1)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 sm:w-12 sm:h-12 mb-3" style={{ color: "var(--text-muted)" }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <p className="text-xs text-gray-500 max-w-sm mx-auto text-center px-4">
            Get started by pasting your first long URL
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {links.map((link) => {
            const shortLink = formatShortLink(link.short_code);
            const expired = isExpired(link.expires_at);
            const activeAnalytics = analyticsData[link.short_code];
            const isCurrentLinkLoading = analyticsLoading && expandedLinkId === link.short_code && !activeAnalytics;
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
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <a
                        href={shortLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-brand-600 font-semibold hover:underline text-sm sm:text-base truncate"
                      >
                        <span className="text-gray-400 font-normal hidden sm:inline">
                          {apiBaseUrl.replace(/^https?:\/\//, "")}
                        </span>
                        /{link.short_code}
                      </a>
                      <CopyButton text={shortLink} />
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                      <p className="truncate" title={link.original_url}>
                        Destination: <span className="font-mono text-gray-700">{link.original_url}</span>
                      </p>
                    </div>
                  </div>

                  {/* Click Badge / Analytics Toggle */}
                  <button
                    onClick={() => handleToggleAnalytics(link.short_code)}
                    className={`group flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                      expandedLinkId === link.short_code
                        ? "bg-brand-500 border-brand-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                        : "bg-brand-50 border-brand-100 text-brand-700 hover:bg-brand-100/60"
                    }`}
                    title={expandedLinkId === link.short_code ? "Hide analytics" : "Click to view detailed analytics"}
                  >
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>
                      <span className="inline sm:group-hover:hidden">
                        {link.click_count || 0} {link.click_count === 1 ? "click" : "clicks"}
                      </span>
                      <span className="hidden sm:group-hover:inline">
                        {expandedLinkId === link.short_code ? "Close Stats" : "View Stats"}
                      </span>
                    </span>
                  </button>
                </div>

                <div className="pt-2.5 border-t border-gray-150/40 text-[11px] text-gray-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span>Created: {new Date(link.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {link.expires_at && (
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${expired ? "bg-red-500" : "bg-orange-400 animate-pulse"}`} />
                        <span className={expired ? "text-red-500 font-semibold" : "text-gray-500"}>
                          {expired ? "Expired" : `Expires: ${new Date(link.expires_at).toLocaleDateString()}`}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Actions for Desktop */}
                  <div className="hidden sm:flex items-center gap-4 ml-auto">
                    <a
                      href={shortLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-600 hover:text-brand-500 transition-all cursor-pointer"
                      title="Open link"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      <span>Open</span>
                    </a>
                    <button
                      onClick={() => setQrLink(link)}
                      className="flex items-center gap-1 text-gray-600 hover:text-brand-500 transition-all cursor-pointer"
                      title="Generate QR code"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="2" y="15" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="15" y="2" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="15" y="15" width="3" height="3" rx="0.5" strokeWidth="2" />
                        <rect x="19" y="19" width="3" height="3" rx="0.5" strokeWidth="2" />
                        <path d="M15 19h.01M19 15h.01" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <span>QR Code</span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(link)}
                      className="flex items-center gap-1 text-gray-600 hover:text-brand-500 transition-all cursor-pointer"
                      title="Edit link destination"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingCode(link.short_code)}
                      className="flex items-center gap-1 text-gray-455 hover:text-red-600 transition-all cursor-pointer"
                      title="Delete link"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="grid grid-cols-4 gap-2.5 w-full sm:hidden">
                    <a
                      href={shortLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white border border-gray-150/40 rounded-xl text-gray-600 hover:text-brand-500 transition-all hover:bg-gray-50 active:scale-95 aspect-square cursor-pointer shadow-sm"
                      title="Open link"
                    >
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      <span className="text-[10px] font-bold text-gray-500">Open</span>
                    </a>
                    <button
                      onClick={() => setQrLink(link)}
                      className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white border border-gray-150/40 rounded-xl text-gray-600 hover:text-brand-500 transition-all hover:bg-gray-50 active:scale-95 aspect-square cursor-pointer shadow-sm"
                      title="Generate QR code"
                    >
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="2" y="15" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="15" y="2" width="7" height="7" rx="1.5" strokeWidth="2" />
                        <rect x="15" y="15" width="3" height="3" rx="0.5" strokeWidth="2" />
                        <rect x="19" y="19" width="3" height="3" rx="0.5" strokeWidth="2" />
                        <path d="M15 19h.01M19 15h.01" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <span className="text-[10px] font-bold text-gray-500">QR</span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(link)}
                      className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white border border-gray-150/40 rounded-xl text-gray-600 hover:text-brand-500 transition-all hover:bg-gray-50 active:scale-95 aspect-square cursor-pointer shadow-sm"
                      title="Edit link destination"
                    >
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-[10px] font-bold text-gray-500">Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingCode(link.short_code)}
                      className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white border border-red-100 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50/50 transition-all active:scale-95 aspect-square cursor-pointer shadow-sm"
                      title="Delete link"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-[10px] font-bold text-red-500">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Inline analytics accordion panel */}
                {expandedLinkId === link.short_code && (
                  <div className="mt-4 p-4 sm:p-5 rounded-xl border border-brand-100 bg-white shadow-sm space-y-5 animate-scale-up text-left">
                    {isCurrentLinkLoading ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-5 bg-gray-200/70 rounded w-1/3"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-28 bg-gray-200/70 rounded-xl"></div>
                          <div className="h-28 bg-gray-200/70 rounded-xl"></div>
                        </div>
                        <div className="h-44 bg-gray-200/70 rounded-xl"></div>
                      </div>
                    ) : activeAnalytics ? (
                      <div className="space-y-5 animate-fade-in">
                        {/* Top metrics summary grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-3 sm:p-4 rounded-xl bg-gray-50/50 border border-gray-100 text-center">
                            <div className="text-xl sm:text-2xl font-black text-gray-900">
                              {activeAnalytics.total_clicks.toLocaleString()}
                            </div>
                            <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                              Total Clicks
                            </div>
                          </div>
                          <div className="p-3 sm:p-4 rounded-xl bg-gray-50/50 border border-gray-100 text-center">
                            <div className="text-xl sm:text-2xl font-black text-brand-600">
                              {activeAnalytics.daily_clicks.length > 0
                                ? activeAnalytics.daily_clicks[activeAnalytics.daily_clicks.length - 1].clicks
                                : 0}
                            </div>
                            <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
                              Latest Day
                            </div>
                          </div>
                        </div>

                        {/* Daily clicks chart */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Daily Click History
                            </h4>
                            <span className="text-xs text-gray-500 font-medium">
                              {activeAnalytics.daily_clicks.length} active day{activeAnalytics.daily_clicks.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <StatsChart data={activeAnalytics.daily_clicks} />
                        </div>

                        {/* Audience and referrers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                          {/* Audience donut charts */}
                          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Audience Insights
                              </h4>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {/* Browsers */}
                                <div className="flex flex-col items-center space-y-2">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 self-start">
                                    Browsers
                                  </span>
                                  {activeAnalytics.browsers && activeAnalytics.browsers.length > 0 ? (
                                    <div className="w-full flex flex-col items-center space-y-2">
                                      <div className="w-16 h-16 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                            <Pie
                                              data={activeAnalytics.browsers}
                                              dataKey="clicks"
                                              nameKey="name"
                                              innerRadius={14}
                                              outerRadius={24}
                                              paddingAngle={2}
                                            >
                                              {activeAnalytics.browsers.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                              ))}
                                            </Pie>
                                            <Tooltip content={<DonutTooltip />} />
                                          </PieChart>
                                        </ResponsiveContainer>
                                      </div>
                                      <div className="w-full space-y-0.5">
                                        {activeAnalytics.browsers.slice(0, 3).map((b, idx) => (
                                          <div key={b.name} className="flex items-center justify-between text-[9px] w-full px-0.5">
                                            <div className="flex items-center gap-1 min-w-0">
                                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                              <span className="font-semibold text-gray-600 truncate" title={b.name}>{b.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 ml-1">{b.clicks}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-gray-400 py-4 text-center w-full">No data</div>
                                  )}
                                </div>

                                {/* OS/Platform */}
                                <div className="flex flex-col items-center space-y-2">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 self-start">
                                    Platforms / OS
                                  </span>
                                  {activeAnalytics.os && activeAnalytics.os.length > 0 ? (
                                    <div className="w-full flex flex-col items-center space-y-2">
                                      <div className="w-16 h-16 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                            <Pie
                                              data={activeAnalytics.os}
                                              dataKey="clicks"
                                              nameKey="name"
                                              innerRadius={14}
                                              outerRadius={24}
                                              paddingAngle={2}
                                            >
                                              {activeAnalytics.os.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                              ))}
                                            </Pie>
                                            <Tooltip content={<DonutTooltip />} />
                                          </PieChart>
                                        </ResponsiveContainer>
                                      </div>
                                      <div className="w-full space-y-0.5">
                                        {activeAnalytics.os.slice(0, 3).map((o, idx) => (
                                          <div key={o.name} className="flex items-center justify-between text-[9px] w-full px-0.5">
                                            <div className="flex items-center gap-1 min-w-0">
                                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(idx + 2) % COLORS.length] }} />
                                              <span className="font-semibold text-gray-600 truncate" title={o.name}>{o.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 ml-1">{o.clicks}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-gray-400 py-4 text-center w-full">No data</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Referrer sources */}
                          <div className="p-4 rounded-xl border border-gray-150 bg-gray-50/20 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Referrer Sources
                              </h4>
                              {activeAnalytics.referrers && activeAnalytics.referrers.length > 0 ? (
                                <div className="space-y-2.5">
                                  {[...activeAnalytics.referrers]
                                    .sort((a, b) => b.clicks - a.clicks)
                                    .slice(0, 4)
                                    .map((r) => {
                                      const totalClicksCount = activeAnalytics.total_clicks || 1;
                                      const percentage = Math.round((r.clicks / totalClicksCount) * 100);
                                      const cleanedName = getCleanReferrerName(r.name);
                                      return (
                                        <div key={r.name} className="space-y-0.5">
                                          <div className="flex items-center justify-between text-[10px] gap-1.5">
                                            <div className="flex items-center gap-1 font-semibold text-gray-700 min-w-0">
                                              {getReferrerIcon(r.name)}
                                              <span className="truncate" title={r.name}>{cleanedName}</span>
                                            </div>
                                            <span className="text-gray-500 font-medium flex-shrink-0">
                                              {r.clicks} ({percentage}%)
                                            </span>
                                          </div>
                                          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
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
                                <div className="text-[10px] text-gray-400 text-center py-6">
                                  No referrer data captured yet
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown table */}
                        {activeAnalytics.daily_clicks.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Daily Breakdown
                            </h4>
                            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                              {[...activeAnalytics.daily_clicks].reverse().map((d, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px]"
                                  style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.03)" }}
                                >
                                  <span className="text-gray-500">
                                    {new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                  </span>
                                  <span className="font-bold text-gray-900">{d.clicks}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-4">
                        No analytics data available.
                      </div>
                    )}
                  </div>
                )}
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 pt-3 border-t border-gray-50">
              <button
                onClick={handleShareQr}
                className="px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-brand-500 text-brand-600 hover:bg-brand-50 rounded-lg transition-all order-1 sm:order-2"
              >
                <span>Share</span>
              </button>
              <button
                onClick={handleDownloadQr}
                className="btn-brand px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md order-2 sm:order-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => setQrLink(null)}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer order-3 sm:order-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
