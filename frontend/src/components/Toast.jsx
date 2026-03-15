import { useState, useEffect, useCallback } from "react";

let toastId = 0;
let externalAddToast = null;

export function useToast() {
  const addToast = useCallback((message, type = "success") => {
    if (externalAddToast) externalAddToast(message, type);
  }, []);
  return { addToast };
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    externalAddToast = addToast;
    return () => {
      externalAddToast = null;
    };
  }, [addToast]);

  const icons = {
    success: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-emerald-400 flex-shrink-0">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400 flex-shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-400 flex-shrink-0">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  const colors = {
    success: "border-brand-500/30 bg-[#072412]/90",
    error: "border-red-500/30 bg-[#2b0c0c]/90",
    info: "border-blue-500/30 bg-[#09172e]/90",
  };
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 pointer-events-auto shadow-black/5"
          style={{ 
            background: "rgba(236,253,245,0.95)", // brand-50 with opacity
            border: "1px solid rgba(16,185,129,0.2)",
            backdropFilter: "blur(10px)",
            minWidth: 240, 
            maxWidth: 360 
          }}>
          {icons[t.type] || icons.info}
          <span className="text-sm text-gray-900 font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
