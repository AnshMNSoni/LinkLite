export default function Navbar({ activeTab, onTabChange }) {
  return (
    <nav className="sticky top-0 z-50 w-full" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-lg tracking-tight">
            Link<span className="gradient-text-brand">Lite</span>
          </span>
        </div>

        {/* Tab buttons - Segmented Control */}
        <div
          className="hidden sm:flex items-center p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            className={`tab-btn text-sm px-6 py-1.5 ${activeTab === "shorten" ? "active" : ""}`}
            onClick={() => onTabChange("shorten")}
            aria-pressed={activeTab === "shorten"}
          >
            Shorten
          </button>
          <button
            className={`tab-btn text-sm px-6 py-1.5 ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => onTabChange("analytics")}
            aria-pressed={activeTab === "analytics"}
          >
            Analytics
          </button>
        </div>

        {/* Badge */}
        <div className="badge inline-flex border border-brand-500/20" style={{ background: "rgba(var(--brand-rgb),0.08)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-subtle"></span>
          <span className="text-brand-500">Live</span>
        </div>
      </div>
    </nav>
  );
}
