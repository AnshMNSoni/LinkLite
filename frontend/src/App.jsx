import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ShortenForm from "./components/ShortenForm";
import ResultCard from "./components/ResultCard";
import AnalyticsPage from "./components/AnalyticsPage";
import Toast from "./components/Toast";

export default function App() {
  const [activeTab, setActiveTab] = useState("shorten");
  const [result, setResult] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResult(null);
  };

  return (
    <>
      {/* Background orbs */}
      <div className="orb orb-green-top" />
      <div className="orb orb-green-bottom" />

      {/* Main layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-16">
          {/* Hero — only on shorten tab */}
          {activeTab === "shorten" && <HeroSection />}

          {/* Analytics tab has its own header */}
          {activeTab === "analytics" && (
            <header className="pt-8 sm:pt-12 pb-4 sm:pb-6 text-center animate-fade-in">
              <h1
                className="text-3xl sm:text-4xl sm:text-5xl font-bold tracking-tight mb-2"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Click <span className="gradient-text-brand">Analytics</span>
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Real-time performance tracking for your links
              </p>
            </header>
          )}

          {/* Tab content */}
          <div className="space-y-4">
            {activeTab === "shorten" && (
              <>
                <ShortenForm setResult={setResult} />
                {result && <ResultCard result={result} />}
              </>
            )}
            {activeTab === "analytics" && <AnalyticsPage />}
          </div>

          {/* Footer */}
          <footer className="text-center mt-14 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>&copy; {new Date().getFullYear()} </span>
            <a
              href="https://github.com/AnshMNSoni"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-text-brand font-semibold hover:opacity-80 transition-opacity"
            >
              ansh.mn.soni
            </a>
            <span> · Shorten · Track · Share</span>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Floating Action Buttons */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50 sm:hidden flex justify-center pointer-events-none">
        <div
          className="flex items-center p-1.5 rounded-2xl pointer-events-auto shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)"
          }}
        >
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "shorten"
                ? "bg-brand-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-gray-500 hover:text-gray-900"
              }`}
            onClick={() => handleTabChange("shorten")}
            aria-pressed={activeTab === "shorten"}
          >
            Shorten
          </button>

          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "analytics"
                ? "bg-brand-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-gray-500 hover:text-gray-900"
              }`}
            onClick={() => handleTabChange("analytics")}
            aria-pressed={activeTab === "analytics"}
          >
            Analysis
          </button>
        </div>
      </div>

      {/* Toast notifications */}
      <Toast />
    </>
  );
}
