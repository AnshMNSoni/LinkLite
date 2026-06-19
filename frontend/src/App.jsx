import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ShortenForm from "./components/ShortenForm";
import ResultCard from "./components/ResultCard";
import MyLinks from "./components/MyLinks";
import Toast from "./components/Toast";

export default function App() {
  const [activeTab, setActiveTab] = useState("shorten");
  const [route, setRoute] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam === "expired") return "expired";
    if (errorParam === "not-found") return "not-found";
    if (errorParam === "unauthorized") return "unauthorized";

    const path = window.location.pathname.replace(/\/$/, "");
    if (path === "/expired") return "expired";
    if (path === "/not-found") return "not-found";
    if (path === "/unauthorized") return "unauthorized";
    return "app";
  });
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("linklite_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResult(null);
  };

  const handleLogin = (token, userObj) => {
    localStorage.setItem("linklite_token", token);
    localStorage.setItem("linklite_user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const handleLogout = () => {
    localStorage.removeItem("linklite_token");
    localStorage.removeItem("linklite_user");
    setUser(null);
    setActiveTab("shorten");
  };

  return (
    <>
      {/* Background orbs */}
      <div className="orb orb-green-top" />
      <div className="orb orb-green-bottom" />

      {/* Main layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {route === "app" && (
          <Navbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        )}

        {route !== "app" ? (
          <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-16 flex items-center justify-center">
            {/* Custom Error Page */}
            <div className="glass-card w-full max-w-md p-6 sm:p-8 text-center space-y-6 animate-scale-up border-brand-500/10 shadow-2xl bg-white/95 backdrop-blur-md my-auto">
              {/* Squirrel Mascot */}
              <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 bg-brand-50/50 rounded-full border border-brand-100/50 flex items-center justify-center overflow-hidden">
                <img src="/squirrel.png" alt="LinkLite Squirrel Mascot" className="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {route === "expired" 
                    ? "This Link Has Expired" 
                    : route === "unauthorized" 
                    ? "Access Denied" 
                    : "Link Not Found"}
                </h1>
                <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  {route === "expired" 
                    ? "The creator of this link configured an expiration date, and it is no longer active." 
                    : route === "unauthorized"
                    ? "You do not have permission to view analytics for this link."
                    : "The short URL you are trying to visit does not exist, has been deleted, or is invalid."
                  }
                </p>
              </div>

              <div className="divider" style={{ margin: "20px 0" }} />

              {/* Call to action */}
              <div className="space-y-4">
                <button
                  onClick={() => {
                    window.history.pushState({}, "", "/");
                    setRoute("app");
                    setActiveTab("shorten");
                  }}
                  className="btn-brand w-full py-3 flex items-center justify-center gap-2 font-semibold shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Go to LinkLite Home</span>
                </button>
                
                <p className="text-[11px] text-gray-400">
                  Want to share links? Create your own custom short URLs in seconds for free with <span className="font-semibold text-brand-600">LinkLite</span>.
                </p>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pb-24 sm:pb-16">
            {/* Hero — only on shorten tab */}
            {activeTab === "shorten" && <HeroSection />}

            {/* My Links tab has its own header */}
            {activeTab === "my-links" && (
              <header className="pt-8 sm:pt-12 pb-4 sm:pb-6 text-center animate-fade-in">
                <h1
                  className="text-3xl sm:text-4xl sm:text-5xl font-bold tracking-tight mb-2"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  My <span className="gradient-text-brand">Links</span>
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Manage, edit, and track your shortened URLs
                </p>
              </header>
            )}

            {/* Tab content */}
            <div className="space-y-4">
              {activeTab === "shorten" && (
                <>
                  <ShortenForm setResult={setResult} user={user} />
                  {result && <ResultCard result={result} />}
                </>
              )}
              {activeTab === "my-links" && <MyLinks user={user} onLogin={handleLogin} />}
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
        )}
      </div>

      {/* Mobile Bottom Floating Action Buttons */}
      {route === "app" && (
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "shorten"
                  ? "bg-brand-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-gray-500 hover:text-gray-900"
                }`}
              onClick={() => handleTabChange("shorten")}
              aria-pressed={activeTab === "shorten"}
            >
              Shorten
            </button>

            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "my-links"
                  ? "bg-brand-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-gray-500 hover:text-gray-900"
                }`}
              onClick={() => handleTabChange("my-links")}
              aria-pressed={activeTab === "my-links"}
            >
              Links
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast />
    </>
  );
}
