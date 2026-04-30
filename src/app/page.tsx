"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import StudioHeader from "@/components/StudioHeader";
import UploadZone from "@/components/UploadZone";
import GenerateCTA from "@/components/GenerateCTA";
import PortraitGallery from "@/components/PortraitGallery";
import ShareCard from "@/components/ShareCard";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import PortraitConfigModal from "@/components/PortraitConfigModal";
import ConfettiBurst from "@/components/ConfettiBurst";
import SplashScreen from "@/components/SplashScreen";
import SampleGallery from "@/components/SampleGallery";
import { usePortraitStore } from "@/lib/store";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
  });
}

export default function Home() {
  const { data: session, status } = useSession();
  const {
    credits,
    setCredits,
    setShowBuyCredits,
    showBuyCredits,
    isGenerating,
    showShareCard,
    isFirstRun,
    completeFirstRun,
    uploadedImages,
    updatePortrait,
    setSessionId,
    setShowShareCard,
    portraitCount,
    selectedTypes,
    showTypePicker,
    setShowTypePicker,
    promptEditEnabled,
    customPrompts,
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
    if (uploadedImages.length < 2) {
      toast("Please upload at least 2 reference images", { className: "toast-custom", icon: "◎" });
      return;
    }
    const creditCost = portraitCount + (promptEditEnabled ? 2 : 0);
    if (credits < creditCost) { setShowBuyCredits(true); return; }
    if (!session) { signIn("google"); return; }

    setGenerating(true);
    usePortraitStore.getState().startGeneration();

    try {
      // Convert files to base64 so the server can read them
      const imagesBase64 = await Promise.all(uploadedImages.map((img) => fileToBase64(img.file)));

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: imagesBase64,
          count: portraitCount,
          selectedTypes,
          customPrompts: promptEditEnabled ? customPrompts : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        if (res.status === 402) { setShowBuyCredits(true); return; }
        throw new Error(err.error || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      data.portraits.forEach((p: any) =>
        updatePortrait(p.id, { url: p.url, status: p.status, error: p.error })
      );
      setCredits(data.creditsRemaining);
      setSessionId(data.sessionId);

      if (isFirstRun) {
        setShowConfetti(true);
        completeFirstRun();
        setTimeout(() => setShowConfetti(false), 3000);
      }
      setShowShareCard(true);

      // Show errors per portrait
      const errors = data.portraits.filter((p: any) => p.status === "error");
      if (errors.length > 0) {
        toast(`${errors.length} portrait${errors.length > 1 ? "s" : ""} failed — tap to retry`, {
          className: "toast-custom",
          icon: "⚠",
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast(err.message || "Generation failed.", { className: "toast-custom", icon: "⚠" });
      usePortraitStore.getState().resetPortraits();
    } finally {
      setGenerating(false);
    }
  }, [uploadedImages, portraitCount, selectedTypes, promptEditEnabled, customPrompts, credits, session, isFirstRun, updatePortrait, setCredits, setSessionId, setShowBuyCredits, setShowShareCard, completeFirstRun]);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(8,8,8,0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(200,185,154,0.2)",
            color: "#F0EDE8",
            borderRadius: "8px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
          },
        }}
      />

      <AnimatePresence>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {splashDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-screen flex flex-col overflow-hidden"
          >
            <StudioHeader
              onCreditsClick={() => setShowBuyCredits(true)}
              credits={credits}
              user={session?.user ?? null}
              isGenerating={generating}
            />

            {/* ===== LANDING PAGE ===== */}
            {status === "unauthenticated" && (
              <main className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 px-4 sm:px-6 lg:px-8 min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center space-y-2 pt-1"
                >
                  <p className="text-[9px] tracking-[0.35em] text-[#C8B99A] uppercase"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    Premium AI Portrait Studio
                  </p>
                  <h2
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F0EDE8] leading-none tracking-tight"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                  >
                    Multiple perspectives.
                    <br />
                    <span className="text-[#C8B99A]">One you.</span>
                  </h2>
                </motion.div>

                <div className="flex-shrink w-full max-w-6xl">
                  <SampleGallery />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center space-y-3"
                >
                  <motion.button
                    onClick={() => signIn("google")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="cta-corners relative px-8 py-3 rounded-lg border border-[#C8B99A]/40 text-sm text-[#C8B99A] pulse-glow bg-[rgba(200,185,154,0.04)]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    <span className="gold-corner top-left" />
                    <span className="gold-corner top-right" />
                    <span className="gold-corner bottom-left" />
                    <span className="gold-corner bottom-right" />
                    Craft Your Own Series
                  </motion.button>
                  <p className="text-[10px] text-[rgba(240,237,232,0.15)] tracking-widest uppercase"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    100 free credits to start — No credit card required
                  </p>
                </motion.div>
              </main>
            )}

            {/* ===== APP: authenticated – viewport-fit ===== */}
            {status === "authenticated" && (
              <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full min-h-0">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
                  <UploadZone />

                  {/* Configure + generate row */}
                  <div className="flex items-center justify-center gap-3">
                    <motion.button
                      onClick={() => setShowTypePicker(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:text-white/70 transition-all tracking-wider uppercase"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      ✦ Configure ({selectedTypes.length}/{portraitCount} types)
                    </motion.button>

                    <GenerateCTA onGenerate={handleGenerate} />
                  </div>

                  <PortraitGallery />
                  {showShareCard && <ShareCard />}
                </div>

                <footer className="py-3 text-center flex-shrink-0">
                  <p className="text-xs text-[rgba(240,237,232,0.12)] tracking-widest uppercase"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    CoverPhoto
                  </p>
                </footer>
              </main>
            )}

            {/* Loading */}
            {status === "loading" && (
              <main className="flex-1 flex items-center justify-center">
                <div className="shimmer w-8 h-8 rounded-full" />
              </main>
            )}

            <BuyCreditsModal open={showBuyCredits} onClose={() => setShowBuyCredits(false)} />
            <PortraitConfigModal open={showTypePicker} onClose={() => setShowTypePicker(false)} />
            {showConfetti && <ConfettiBurst />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
