export default function HeroSection() {
  return (
    <div className="text-center pt-8 sm:pt-16 pb-6 sm:pb-10 px-4 sm:px-6 animate-fade-in">
      <div className="badge mx-auto mb-6">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
          <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" clipRule="evenodd"/>
        </svg>
        Fast · Reliable · Smart
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-4 leading-tight">
        Shorten URLs{" "}
        <span className="gradient-text">Instantly</span>
      </h1>

      <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Transform long, cluttered links into clean, shareable URLs.
        Track every click with powerful real-time analytics.
      </p>

      {/* Stats strip */}
      <div className="flex justify-center gap-5 sm:gap-8 mt-6 sm:mt-10 flex-wrap">
        {[
          { value: "< 1ms", label: "Response time" },
          { value: "∞", label: "URLs shortened" },
          { value: "100%", label: "Free forever" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-black gradient-text-brand">{stat.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
