"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import StudioHeader from "@/components/StudioHeader";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import ConfettiBurst from "@/components/ConfettiBurst";
import SplashScreen from "@/components/SplashScreen";
import SampleGallery from "@/components/SampleGallery";
import Workbench from "@/components/Workbench";
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

// Basic image quality check — warns if photos may be too dark
async function checkImageQuality(file: File): Promise<{ ok: boolean; warning?: string }> {
  try {
    const bmp = await createImageBitmap(file);
    const w = Math.min(bmp.width, 200);
    const h = Math.min(bmp.height, 200);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const data = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const avg = sum / (data.length / 4);
    if (avg < 40) return { ok: true, warning: "One of your photos appears very dark. For best results, use well-lit, sharp reference images." };
    if (avg < 70) return { ok: true, warning: "One of your photos seems a bit dark. Brighter lighting may improve likeness." };
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export default function Home() {
  const { data: session, status } = useSession();
  const {
    credits, setCredits, setShowBuyCredits, showBuyCredits,
    showShareCard, isFirstRun, completeFirstRun,
    uploadedImages, updatePortrait, setSessionId, setShowShareCard,
    selectedTypesList, promptEditEnabled, customPrompts, totalSelected,
  } = usePortraitStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => { const seen = sessionStorage.getItem("coverphoto_splash"); if (seen) setSplashDone(true); }, []);
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/credits")
        .then((r) => r.json())
        .then((d) => { if (d.credits !== undefined) setCredits(d.credits); })
        .catch(() => {});
    }
  }, [status, setCredits]);

  const handleSplashComplete = () => { sessionStorage.setItem("coverphoto_splash", "1"); setSplashDone(true); };

  const handleGenerate = useCallback(async () => {
    const total = totalSelected();
    if (total < 1) { toast("Select at least 1 portrait type", { className: "toast-custom", icon: "◎" }); return; }
    if (uploadedImages.length < 2) { toast("Upload at least 2 reference images", { className: "toast-custom", icon: "◎" }); return; }
    const creditCost = total + (promptEditEnabled ? 2 : 0);
    if (credits < creditCost) { setShowBuyCredits(true); return; }
    if (!session) { signIn("google"); return; }

    // Quality check
    for (const img of uploadedImages) {
      const q = await checkImageQuality(img.file);
      if (q.warning) { toast(q.warning, { className: "toast-custom", icon: "◎", duration: 5000 }); break; }
    }

    setGenerating(true);
    usePortraitStore.getState().startGeneration();

    try {
      const imagesBase64 = await Promise.all(uploadedImages.map((img) => fileToBase64(img.file)));
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesBase64,
          typeCounters: usePortraitStore.getState().typeCounters,
          specialConfigs: usePortraitStore.getState().specialCounters,
          specialFields: usePortraitStore.getState().specialFields,
          customPrompts: promptEditEnabled ? customPrompts : undefined,
        }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Unknown" })); if (res.status === 402) { setShowBuyCredits(true); return; } throw new Error(err.error || `Generation failed (${res.status})`); }
      const data = await res.json();
      data.portraits?.forEach((p: any) => updatePortrait(p.id, { url: p.url, status: p.status, error: p.error }));
      if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
      setSessionId(data.sessionId || null);
      if (isFirstRun) { setShowConfetti(true); completeFirstRun(); setTimeout(() => setShowConfetti(false), 3000); }
      const errors = data.portraits?.filter((p: any) => p.status === "error") || [];
      if (errors.length > 0) { toast(`${errors.length} portrait${errors.length > 1 ? "s" : ""} failed`, { className: "toast-custom", icon: "⚠", duration: 6000 }); }
      else { setShowShareCard(true); }
    } catch (err: any) {
      toast(err.message || "Generation failed.", { className: "toast-custom", icon: "⚠" });
      usePortraitStore.getState().resetPortraits();
    } finally { setGenerating(false); }
  }, [uploadedImages, credits, session, isFirstRun, promptEditEnabled, customPrompts, totalSelected, selectedTypesList, updatePortrait, setCredits, setSessionId, setShowBuyCredits, setShowShareCard, completeFirstRun]);

  // Generate a single pending portrait
  const handleGeneratePending = useCallback(async (style: string) => {
    if (uploadedImages.length < 2) { toast("Upload at least 2 reference images", { className: "toast-custom", icon: "◎" }); return; }
    if (credits < 1) { setShowBuyCredits(true); return; }
    if (!session) { signIn("google"); return; }
    setGenerating(true);
    usePortraitStore.getState().startGeneration();
    try {
      const imagesBase64 = await Promise.all(uploadedImages.map((img) => fileToBase64(img.file)));
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesBase64, typeCounters: { [style]: 1 }, specialConfigs: {}, specialFields: {} }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      data.portraits?.forEach((p: any) => updatePortrait(p.id, { url: p.url, status: p.status, error: p.error }));
      if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
    } catch {
      toast("Generation failed.", { className: "toast-custom", icon: "⚠" });
    } finally { setGenerating(false); }
  }, [uploadedImages, credits, session, updatePortrait, setCredits, setShowBuyCredits]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(200,185,154,0.2)", color: "#F0EDE8", borderRadius: "8px", fontFamily: "'DM Mono', monospace", fontSize: "13px" } }} />
      <AnimatePresence>{!splashDone && <SplashScreen onComplete={handleSplashComplete} />}</AnimatePresence>
      <AnimatePresence>
        {splashDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="h-screen flex flex-col overflow-hidden">
            <StudioHeader onCreditsClick={() => setShowBuyCredits(true)} credits={credits} user={session?.user ?? null} isGenerating={generating} />

            {/* LANDING */}
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

            {/* WORKBENCH */}
            {status === "authenticated" && <Workbench onGenerate={handleGenerate} onGeneratePending={handleGeneratePending} />}

            {/* Loading */}
            {status === "loading" && <main className="flex-1 flex items-center justify-center"><div className="shimmer w-8 h-8 rounded-full" /></main>}

            <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} />
            {showConfetti && <ConfettiBurst />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
