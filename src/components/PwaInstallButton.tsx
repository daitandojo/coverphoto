"use client";

import { useEffect, useState } from "react";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // Hide if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShow(false);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <button
      onClick={install}
      className="text-[9px] px-2 py-1 rounded border border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/60 transition-all uppercase tracking-wider touch-safe min-w-[44px]"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      📲 Install
    </button>
  );
}
