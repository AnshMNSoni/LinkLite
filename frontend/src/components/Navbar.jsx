export default function Navbar({ activeTab, onTabChange }) {
  return (
    <nav className="sticky top-0 z-50 w-full" style={{ background: "rgba(8, 8, 18, 0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99, 102, 241, 0.1)" }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
              <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">
            Link<span className="gradient-text-brand">Lite</span>
          </span>
        </div>

        {/* Tab buttons */}
        <div
          className="flex items-center gap-0.5 p-0.5 sm:gap-1 sm:p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.12)" }}
        >
          <button
            className={`tab-btn text-xs sm:text-sm px-3 sm:px-5 ${activeTab === "shorten" ? "active" : ""}`}
            onClick={() => onTabChange("shorten")}
          >
            Shorten
          </button>
          <button
            className={`tab-btn text-xs sm:text-sm px-3 sm:px-5 ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => onTabChange("analytics")}
          >
            Analytics
          </button>
        </div>

        {/* Badge */}
        <div className="badge hidden sm:inline-flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle"></span>
          Live
        </div>
      </div>
    </nav>
  );
}
