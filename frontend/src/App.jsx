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
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="orb orb-pink" />

      {/* Main layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pb-16">
          {/* Hero — only on shorten tab */}
          {activeTab === "shorten" && <HeroSection />}

          {/* Analytics tab has its own header */}
          {activeTab === "analytics" && (
            <div className="pt-8 sm:pt-12 pb-4 sm:pb-6 text-center animate-fade-in">
              <h1 className="text-2xl sm:text-3xl sm:text-4xl font-black tracking-tight mb-2">
                Track your <span className="gradient-text">links</span>
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Real-time click analytics for every short URL
              </p>
            </div>
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
            <span>Built with ❤️ · </span>
            <span className="gradient-text-brand font-semibold">LinkLite</span>
            <span> · Fast URL Shortener</span>
          </footer>
        </main>
      </div>

      {/* Toast notifications */}
      <Toast />
    </>
  );
}
