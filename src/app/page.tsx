"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

import StudioHeader from "@/components/StudioHeader";
import UploadZone from "@/components/UploadZone";
import GenerateCTA from "@/components/GenerateCTA";
import PortraitGallery from "@/components/PortraitGallery";
import ShareCard from "@/components/ShareCard";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import ConfettiBurst from "@/components/ConfettiBurst";
import SplashScreen from "@/components/SplashScreen";
import SampleGallery from "@/components/SampleGallery";
import TypePicker from "@/components/TypePicker";
import { usePortraitStore } from "@/lib/store";
import { BRIEFS } from "@/lib/prompts";

export default function Home() {
  const { data: session, status } = useSession();
  const {
    credits,
    setCredits,
    setShowBuyCredits,
    showBuyCredits,
    portraits,
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
    setPromptEditEnabled,
    customPrompts,
    setCustomPrompts,
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
        .then((data) => {
          if (data.credits !== undefined) setCredits(data.credits);
        })
        .catch(() => {});
    }
  }, [status, setCredits]);

  const handleSplashComplete = () => {
    sessionStorage.setItem("coverphoto_splash", "1");
    setSplashDone(true);
  };

  const handleGenerate = async () => {
    if (uploadedImages.length < 2) {
      toast("Please upload at least 2 reference images", {
        className: "toast-custom",
        icon: "◎",
      });
      return;
    }
    const creditCost = portraitCount + (promptEditEnabled ? 2 : 0);
    if (credits < creditCost) { setShowBuyCredits(true); return; }
    if (!session) { signIn("google"); return; }

    setGenerating(true);
    usePortraitStore.getState().startGeneration();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedImages.map((img) => img.preview),
          count: portraitCount,
          selectedTypes,
          customPrompts: promptEditEnabled ? customPrompts : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 402) { setShowBuyCredits(true); return; }
        throw new Error(err.error || "Generation failed");
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
    } catch (err: any) {
      toast(err.message || "Generation failed.", {
        className: "toast-custom",
        icon: "⚠",
      });
      usePortraitStore.getState().resetPortraits();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
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
                {/* Hero — compact */}
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

                {/* Gallery — centre stage */}
                <div className="flex-shrink w-full max-w-6xl">
                  <SampleGallery />
                </div>

                {/* CTA */}
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
                    Begin Your Series
                  </motion.button>
                  <p className="text-[10px] text-[rgba(240,237,232,0.15)] tracking-widest uppercase"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    100 free credits to start — No credit card required
                  </p>
                </motion.div>
              </main>
            )}

            {/* ===== APP: authenticated ===== */}
            {status === "authenticated" && (
              <main className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <UploadZone />

                {/* Toggle type picker */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    onClick={() => setShowTypePicker(!showTypePicker)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-2 rounded-lg border text-xs transition-all tracking-wider uppercase ${
                      showTypePicker
                        ? "border-[#C8B99A] text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
                        : "border-white/10 text-[rgba(240,237,232,0.4)] hover:text-white/70"
                    }`}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {showTypePicker ? "✓ Portrait types selected" : "Choose portrait types"}
                  </motion.button>

                  {/* Prompt editor toggle */}
                  <motion.button
                    onClick={() => setPromptEditEnabled(!promptEditEnabled)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-2 rounded-lg border text-xs transition-all tracking-wider uppercase ${
                      promptEditEnabled
                        ? "border-[#C8B99A] text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
                        : "border-white/10 text-[rgba(240,237,232,0.4)] hover:text-white/70"
                    }`}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {promptEditEnabled ? "✦ Prompts editable (+2cr)" : "Customize prompts ✦"}
                  </motion.button>
                </div>

                <TypePicker />

                {/* Prompt editor */}
                {promptEditEnabled && showTypePicker && selectedTypes.map((typeId) => {
                  const brief = BRIEFS.find((b) => b.id === typeId);
                  if (!brief) return null;
                  return (
                    <motion.div
                      key={typeId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1"
                    >
                      <p className="text-xs text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {brief.name} — {brief.tagline}
                      </p>
                      <textarea
                        value={customPrompts[typeId] || brief.prompt}
                        onChange={(e) => setCustomPrompts({ ...customPrompts, [typeId]: e.target.value })}
                        rows={4}
                        className="w-full text-xs bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-3 text-[rgba(240,237,232,0.7)] focus:outline-none focus:border-[#C8B99A]/40 resize-y"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      />
                    </motion.div>
                  );
                })}

                <GenerateCTA onGenerate={handleGenerate} />
                <PortraitGallery />
                {showShareCard && <ShareCard />}
                <footer className="py-6 text-center">
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

            <BuyCreditsModal
              open={showBuyCredits}
              onClose={() => setShowBuyCredits(false)}
            />
            {showConfetti && <ConfettiBurst />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
