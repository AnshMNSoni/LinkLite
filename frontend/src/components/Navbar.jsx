import { useEffect, useState } from "react";
import { loginWithGoogle } from "../api/auth";
import { useToast } from "./Toast";

export default function Navbar({ activeTab, onTabChange, user, onLogin, onLogout }) {
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "medium", shape: "pill" }
        );
      }
    };

    if (!user) {
      if (window.google) {
        initGoogle();
      } else {
        const timer = setInterval(() => {
          if (window.google) {
            initGoogle();
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
            className={`tab-btn text-sm px-5 py-1.5 ${activeTab === "shorten" ? "active" : ""}`}
            onClick={() => onTabChange("shorten")}
            aria-pressed={activeTab === "shorten"}
          >
            Shorten
          </button>
          
          <button
            className={`tab-btn text-sm px-5 py-1.5 ${activeTab === "my-links" ? "active" : ""}`}
            onClick={() => onTabChange("my-links")}
            aria-pressed={activeTab === "my-links"}
          >
            My Links
          </button>
        </div>

        {/* Auth / Profile Area */}
        <div className="flex items-center gap-4">
          <div
            id="google-signin-btn"
            style={{ display: !user ? "block" : "none" }}
          ></div>

          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-0 sm:px-2.5 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded-full border-0 sm:border border-gray-100 hover:bg-transparent sm:hover:bg-gray-50/50 transition-colors"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <img
                  src={user.picture || "https://www.gravatar.com/avatar?d=mp"}
                  alt={user.name || "Profile"}
                  className="w-7 h-7 rounded-full border border-gray-200 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-semibold text-gray-700 hidden sm:inline-block">
                  {user.name}
                </span>
                <svg className="w-3 h-3 text-gray-400 hidden sm:inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border border-gray-100 bg-white py-1 z-20">
                    <div className="px-4 py-2 text-xs border-b border-gray-50 text-gray-500">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
