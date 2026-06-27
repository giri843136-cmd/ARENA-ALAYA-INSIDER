"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/**
 * PWA install prompt component.
 * Captures the `beforeinstallprompt` event and shows a custom install button.
 * Hides after install or dismissal.
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (installed || !showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#26221E] border border-[#E4DDD5] dark:border-[#3D3530] rounded-2xl shadow-xl p-4 max-w-xs animate-in slide-in-from-bottom">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-[#EFE7DE] dark:hover:bg-[#3D3530] transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C5AA8A]/10 flex items-center justify-center flex-shrink-0">
          <Download size={18} className="text-[#C5AA8A]" />
        </div>
        <div>
          <div className="text-sm font-medium text-[#26221E] dark:text-[#EDE6DC]">
            Install Alaya Insider
          </div>
          <div className="text-xs text-[#6D655F] dark:text-[#B8AFA3] mt-0.5">
            Add to your homescreen for the best experience.
          </div>
          <button
            onClick={handleInstall}
            className="mt-3 px-4 py-1.5 bg-[#C5AA8A] text-white text-xs rounded-full hover:bg-[#B89A7A] transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
