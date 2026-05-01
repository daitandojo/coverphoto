"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import StudioHeader from "@/components/StudioHeader";
import GenerateCTA from "@/components/GenerateCTA";
import PortraitGallery from "@/components/PortraitGallery";
import ShareCard from "@/components/ShareCard";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import ConfettiBurst from "@/components/ConfettiBurst";
import SplashScreen from "@/components/SplashScreen";
import SampleGallery from "@/components/SampleGallery";
import RefPanel from "@/components/RefPanel";
import BuilderPanel from "@/components/BuilderPanel";
import { usePortraitStore } from "@/lib/store";
import { log, error as logError, apiLog } from "@/lib/logger";

function fileToBase64(file: File, timeout = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("File read timeout")), timeout);
    const r = new FileReader();
    r.onload = () => { clearTimeout(t); resolve(r.result as string); };
    r.onerror = () => { clearTimeout(t); reject(r.error); };
    r.readAsDataURL(file);
  });
}

export default function Home() {
  const { data: session, status } = useSession();
  const {
    credits, setCredits, setShowBuyCredits, showBuyCredits,
    isGenerating, showShareCard, isFirstRun, completeFirstRun,
    uploadedImages, updatePortrait, setSessionId, setShowShareCard,
    totalSelected, selectedTypesList, promptEditEnabled, customPrompts,
    leftPanelOpen, rightPanelOpen, leftPanelPinned, rightPanelPinned,
    toggleLeftPanel, toggleRightPanel, setLeftPanelOpen, setRightPanelOpen,
  } = usePortraitStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("coverphoto_splash");
    if (seen) setSplashDone(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/credits")
        .then((r) => r.json())
        .then((d) => { if (d.credits !== undefined) setCredits(d.credits); })
        .catch(() => {});
    }
  }, [status, setCredits]);

  const handleSplashComplete = () => {
    sessionStorage.setItem("coverphoto_splash", "1");
    setSplashDone(true);
  };

  const handleGenerate = useCallback(async () => {
    const total = totalSelected();
    if (total < 1) { toast("Select at least 1 portrait type", { className: "toast-custom", icon: "◎" }); return; }
    if (uploadedImages.length < 2) { toast("Upload at least 2 reference images", { className: "toast-custom", icon: "◎" }); return; }

    const creditCost = total + (promptEditEnabled ? 2 : 0);
    if (credits < creditCost) { setShowBuyCredits(true); return; }
    if (!session) { signIn("google"); return; }

    setGenerating(true);
    usePortraitStore.getState().startGeneration();

    try {
      const imagesBase64 = await Promise.all(uploadedImages.map((img) => fileToBase64(img.file)));
      const typesList = selectedTypesList();

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesBase64,
          typeCounters: usePortraitStore.getState().typeCounters,
          customPrompts: promptEditEnabled ? customPrompts : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        if (res.status === 402) { setShowBuyCredits(true); return; }
        throw new Error(err.error || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      data.portraits?.forEach((p: any) => updatePortrait(p.id, { url: p.url, status: p.status, error: p.error }));
      if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
      setSessionId(data.sessionId || null);

      if (isFirstRun) { setShowConfetti(true); completeFirstRun(); setTimeout(() => setShowConfetti(false), 3000); }

      const errors = data.portraits?.filter((p: any) => p.status === "error") || [];
      if (errors.length > 0) {
        logError("PORTRAIT ERRORS", { count: errors.length });
        toast(`${errors.length} portrait${errors.length > 1 ? "s" : ""} failed`, { className: "toast-custom", icon: "⚠", duration: 6000 });
      } else {
        setShowShareCard(true);
      }
    } catch (err: any) {
      logError("GENERATE FAILED", { message: err.message });
      toast(err.message || "Generation failed.", { className: "toast-custom", icon: "⚠" });
      usePortraitStore.getState().resetPortraits();
    } finally {
      setGenerating(false);
    }
  }, [uploadedImages, credits, session, isFirstRun, promptEditEnabled, customPrompts, totalSelected, selectedTypesList, updatePortrait, setCredits, setSessionId, setShowBuyCredits, setShowShareCard, completeFirstRun]);

  // Close panels on outside click
  useEffect(() => {
    const handler = () => {
      if (!leftPanelPinned) setLeftPanelOpen(false);
      if (!rightPanelPinned) setRightPanelOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [leftPanelPinned, rightPanelPinned, setLeftPanelOpen, setRightPanelOpen]);

  const PANEL_W = 300;
  const TAB_W = 20;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(200,185,154,0.2)", color: "#F0EDE8", borderRadius: "8px", fontFamily: "'DM Mono', monospace", fontSize: "13px" },
        }}
      />
      <AnimatePresence>{!splashDone && <SplashScreen onComplete={handleSplashComplete} />}</AnimatePresence>

      <AnimatePresence>
        {splashDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="h-screen flex flex-col overflow-hidden">
            <StudioHeader onCreditsClick={() => setShowBuyCredits(true)} credits={credits} user={session?.user ?? null} isGenerating={generating} />

            {/* ===== LANDING ===== */}
            {status === "unauthenticated" && (
              <main className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 px-4 min-h-0">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center space-y-2 pt-1">
                  <p className="text-[9px] tracking-[0.35em] text-[#C8B99A] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Premium AI Portrait Studio</p>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F0EDE8] leading-none tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                    Multiple perspectives.<br /><span className="text-[#C8B99A]">One you.</span>
                  </h2>
                </motion.div>
                <div className="flex-shrink w-full max-w-6xl"><SampleGallery /></div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-center space-y-3">
                  <motion.button onClick={() => signIn("google")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                    className="cta-corners relative px-8 py-3 rounded-lg border border-[#C8B99A]/40 text-sm text-[#C8B99A] pulse-glow bg-[rgba(200,185,154,0.04)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
                    Craft Your Own Series
                  </motion.button>
                  <p className="text-[10px] text-[rgba(240,237,232,0.15)] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>100 free credits to start — No credit card required</p>
                </motion.div>
              </main>
            )}

            {/* ===== WORKBENCH ===== */}
            {status === "authenticated" && (
              <div className="flex-1 flex overflow-hidden relative min-h-0">
                {/* LEFT PANEL */}
                <div className="relative z-20 flex-shrink-0">
                  {/* Tab */}
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); toggleLeftPanel(); }}
                    whileHover={{ borderColor: "rgba(200,185,154,0.3)" }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[20px] h-24 rounded-r-lg border border-l-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer"
                    style={{ pointerEvents: "auto" }}
                  >
                    <span className="text-xs" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", transform: "rotate(180deg)" }}>📷 Ref</span>
                  </motion.button>

                  {/* Drawer */}
                  <AnimatePresence>
                    {leftPanelOpen && (
                      <motion.div
                        initial={{ x: -PANEL_W }}
                        animate={{ x: 0 }}
                        exit={{ x: -PANEL_W }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="h-full border-r border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-y-auto p-4"
                        style={{ width: PANEL_W, minWidth: PANEL_W }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RefPanel />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CENTER */}
                <main className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 overflow-y-auto" onClick={() => { if (!leftPanelPinned) setLeftPanelOpen(false); if (!rightPanelPinned) setRightPanelOpen(false); }}>
                  <div className="flex flex-col items-center justify-center gap-6 py-6 w-full max-w-lg">
                    <GenerateCTA onGenerate={handleGenerate} />
                    <PortraitGallery />
                    {showShareCard && <ShareCard />}
                  </div>
                </main>

                {/* RIGHT PANEL */}
                <div className="relative z-20 flex-shrink-0">
                  {/* Tab */}
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); toggleRightPanel(); }}
                    whileHover={{ borderColor: "rgba(200,185,154,0.3)" }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-[20px] h-24 rounded-l-lg border border-r-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer"
                  >
                    <span className="text-xs" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace" }}>✦ Build</span>
                  </motion.button>

                  {/* Drawer */}
                  <AnimatePresence>
                    {rightPanelOpen && (
                      <motion.div
                        initial={{ x: PANEL_W }}
                        animate={{ x: 0 }}
                        exit={{ x: PANEL_W }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="h-full border-l border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-hidden p-4"
                        style={{ width: PANEL_W, minWidth: PANEL_W }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BuilderPanel />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Loading */}
            {status === "loading" && (
              <main className="flex-1 flex items-center justify-center">
                <div className="shimmer w-8 h-8 rounded-full" />
              </main>
            )}

            <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} />
            {showConfetti && <ConfettiBurst />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
