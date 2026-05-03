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
import ErrorModal from "@/components/ErrorModal";
import EmailAuthModal from "@/components/EmailAuthModal";
import { usePortraitStore } from "@/lib/store";
import { apiLog } from "@/lib/logger";

function fileToBase64(file: File, timeout = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("File read timeout")), timeout);
    const r = new FileReader();
    r.onload = () => { clearTimeout(t); resolve(r.result as string); };
    r.onerror = () => { clearTimeout(t); reject(r.error); };
    r.readAsDataURL(file);
  });
}

async function checkImageQuality(file: File): Promise<{ ok: boolean; warning?: string }> {
  try {
    const bmp = await createImageBitmap(file);
    const w = Math.min(bmp.width, 200), h = Math.min(bmp.height, 200);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const data = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const avg = sum / (data.length / 4);
    if (avg < 40) return { ok: true, warning: "One of your photos appears very dark. For best results, use well-lit, sharp reference images." };
    if (avg < 70) return { ok: true, warning: "One of your photos seems a bit dark. Brighter lighting may improve likeness." };
    return { ok: true };
  } catch { return { ok: true }; }
}

export default function Home() {
  const { data: session, status } = useSession();
  const { credits, setCredits, setShowBuyCredits, showBuyCredits, isFirstRun, completeFirstRun, uploadedImages, updateWorkbenchPortrait, setSessionId, resetWorkbench, resetCounters, totalSelected, promptEditEnabled, customPrompts } = usePortraitStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  useEffect(() => { const seen = sessionStorage.getItem("coverphoto_splash"); if (seen) setSplashDone(true); }, []);
  useEffect(() => {
    if (status === "authenticated") {
      setSessionLoading(true);
      Promise.all([
        fetch("/api/credits").then((r) => r.json()).then((d) => { if (d.credits !== undefined) setCredits(d.credits); }).catch(() => {}),
        fetch("/api/session/current").then((r) => r.json()).then((d) => { if (d.portraits) usePortraitStore.getState().loadSession(d); }).catch(() => {}),
      ]).finally(() => setSessionLoading(false));
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
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
    for (const img of uploadedImages) {
      const q = await checkImageQuality(img.file);
      if (q.warning) { toast(q.warning, { className: "toast-custom", icon: "◎", duration: 5000 }); break; }
    }

    setGenerating(true);
    const allTypes = [
      ...Object.entries(usePortraitStore.getState().typeCounters).flatMap(([k, v]) => Array(v).fill(k)),
      ...Object.entries(usePortraitStore.getState().specialCounters).flatMap(([k, v]) => Array(v).fill(k)),
    ];
    usePortraitStore.getState().addToWorkbench(allTypes);

    try {
      const imagesBase64 = await Promise.all(uploadedImages.map(async (img) => {
        if (img.file && img.file.size > 0) return fileToBase64(img.file);
        if (img.preview && img.preview.startsWith("data:")) return img.preview;
        throw new Error("Reference image no longer available — please re-upload.");
      }));
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesBase64,
          typeCounters: usePortraitStore.getState().typeCounters,
          specialConfigs: usePortraitStore.getState().specialCounters,
          specialFields: usePortraitStore.getState().specialFields,
          customPrompts: promptEditEnabled ? customPrompts : undefined,
          constraints: usePortraitStore.getState().constraints,
        }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Unknown" })); if (res.status === 402) { setShowBuyCredits(true); return; } throw new Error(err.error || `Generation failed (${res.status})`); }
      const data = await res.json();
      data.portraits?.forEach((p: any, i: number) => {
        const wb = usePortraitStore.getState().workbenchPortraits;
        if (wb[i]) {
          if (p.status === "error") {
            // Remove error portraits immediately — don't leave broken placeholders
            usePortraitStore.getState().dismissFromWorkbench(wb[i].id);
          } else {
            updateWorkbenchPortrait(wb[i].id, { url: p.url, status: p.status, error: p.error });
          }
        }
      });
      if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
      setSessionId(data.sessionId || null);
      if (isFirstRun) { setShowConfetti(true); completeFirstRun(); setTimeout(() => setShowConfetti(false), 3000); }
      const okCount = data.portraits?.filter((p: any) => p.status === "completed").length || 0;
      if (okCount > 0 && "Notification" in window && Notification.permission === "granted") {
        new Notification("CoverPhoto", { body: `${okCount} portrait${okCount > 1 ? "s" : ""} ready!`, icon: "/logo.png" });
      }
      const errors = data.portraits?.filter((p: any) => p.status === "error") || [];
      if (errors.length > 0) {
        const msgs = errors.map((e: any) => e.error).filter(Boolean).join("; ");
        setErrorMsg(msgs.slice(0, 300));
      }
      // Reset counters after generation
      resetCounters();
    } catch (err: any) {
      toast(err.message || "Generation failed.", { className: "toast-custom", icon: "⚠" });
      resetWorkbench();
    } finally { setGenerating(false); }
  }, [uploadedImages, credits, session, isFirstRun, promptEditEnabled, customPrompts, totalSelected, updateWorkbenchPortrait, setCredits, setSessionId, setShowBuyCredits, resetCounters, resetWorkbench]);

  // Retry from library/workbench
  const handleRetryOne = useCallback(async (id: string, style: string) => {
    if (uploadedImages.length < 2) { toast("Upload at least 2 reference images", { className: "toast-custom", icon: "◎" }); return; }
    if (credits < 1) { setShowBuyCredits(true); return; }
    if (!session) { signIn("google"); return; }
    setGenerating(true);
    usePortraitStore.getState().addToWorkbench([style]);
    try {
      const imagesBase64 = await Promise.all(uploadedImages.map((img) => fileToBase64(img.file)));
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesBase64, typeCounters: { [style]: 1 }, specialConfigs: {}, specialFields: {} }),
      });
      if (!res.ok) throw new Error("Retry failed");
      const data = await res.json();
      const wb = usePortraitStore.getState().workbenchPortraits;
      const target = wb.find((p) => p.style === style && p.status === "generating");
      if (target && data.portraits?.[0]) updateWorkbenchPortrait(target.id, { url: data.portraits[0].url, status: data.portraits[0].status, error: data.portraits[0].error });
      if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
    } catch { toast("Retry failed.", { className: "toast-custom", icon: "⚠" }); resetWorkbench(); }
    finally { setGenerating(false); }
  }, [uploadedImages, credits, session, updateWorkbenchPortrait, setCredits, setShowBuyCredits]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", border: "1px solid rgba(200,185,154,0.2)", color: "#F0EDE8", borderRadius: "8px", fontFamily: "'DM Mono', monospace", fontSize: "13px" } }} />
      <AnimatePresence>{!splashDone && <SplashScreen onComplete={handleSplashComplete} />}</AnimatePresence>
      <AnimatePresence>
        {splashDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="h-dvh min-h-screen flex flex-col overflow-hidden">
            <StudioHeader onCreditsClick={() => setShowBuyCredits(true)} credits={credits} user={session?.user ?? null} isGenerating={generating} />
            {status === "unauthenticated" && (
              <main className="flex-1 flex flex-col items-center justify-center gap-10 md:gap-12 px-6 min-h-0">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center space-y-4 pt-2">
                  <p className="text-[10px] tracking-[0.35em] text-[#C8B99A] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Premium AI Portrait Studio</p>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F0EDE8] leading-none tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                    Multiple perspectives.<br /><span className="text-[#C8B99A]">One you.</span>
                  </h2>
                </motion.div>
                <div className="flex-shrink w-full max-w-6xl"><SampleGallery /></div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-center space-y-4">
                  <motion.button onClick={() => signIn("google")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                    className="cta-corners relative px-8 py-3 rounded-lg border border-[#C8B99A]/40 text-sm text-[#C8B99A] pulse-glow bg-[rgba(200,185,154,0.04)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
                    Continue with Google
                  </motion.button>
                  <motion.button onClick={() => setShowEmailAuth(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.4)] hover:text-white/70 transition-all"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    Sign in with email
                  </motion.button>
                  <p className="text-[10px] text-[rgba(240,237,232,0.15)] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>5 free credits to start — No credit card required</p>
                </motion.div>
              </main>
            )}
            {status === "authenticated" && sessionLoading && (
              <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
                <div className="relative w-12 h-12">
                  <motion.div className="absolute inset-0 rounded-full border-2 border-[rgba(200,185,154,0.1)]" />
                  <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C8B99A]"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                </div>
                <p className="text-xs text-[rgba(240,237,232,0.2)] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Loading your studio…
                </p>
              </main>
            )}
            {status === "authenticated" && !sessionLoading && <Workbench onGenerate={handleGenerate}
              canGenerate={(() => {
                const t = totalSelected();
                return t >= 1 && uploadedImages.length >= 2 && credits >= t + (promptEditEnabled ? 2 : 0) && !generating;
              })()}
              genReason={(() => {
                const t = totalSelected();
                const missing = 2 - uploadedImages.length;
                if (t < 1) return "Select portrait types";
                if (uploadedImages.length < 2) return `${missing} more reference image${missing !== 1 ? "s" : ""} needed`;
                if (credits < t + (promptEditEnabled ? 2 : 0)) return "Insufficient credits";
                return "";
              })()}
            />}
            {status === "loading" && <main className="flex-1 flex items-center justify-center"><div className="shimmer w-8 h-8 rounded-full" /></main>}
            <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} />
            {showConfetti && <ConfettiBurst />}
            <ErrorModal open={errorMsg !== null} message={errorMsg || ""} onClose={() => setErrorMsg(null)} />
            <EmailAuthModal open={showEmailAuth} onClose={() => setShowEmailAuth(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
