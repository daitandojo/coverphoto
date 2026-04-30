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
import { usePortraitStore } from "@/lib/store";

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
  } = usePortraitStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("coverphoto_splash");
    if (seen) {
      setSplashDone(true);
    }
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

    if (credits < 4) {
      setShowBuyCredits(true);
      return;
    }

    if (!session) {
      signIn("google");
      return;
    }

    setGenerating(true);
    usePortraitStore.getState().startGeneration();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: uploadedImages.map((img) => img.preview),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 402) {
          setShowBuyCredits(true);
          return;
        }
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();

      data.portraits.forEach((p: any) => {
        updatePortrait(p.id, {
          url: p.url,
          status: p.status,
          error: p.error,
        });
      });

      setCredits(data.creditsRemaining);
      setSessionId(data.sessionId);

      if (isFirstRun) {
        setShowConfetti(true);
        completeFirstRun();
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setShowShareCard(true);
    } catch (err: any) {
      toast(err.message || "Generation failed. Please try again.", {
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

      {/* Splash screen */}
      <AnimatePresence>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Main content — animated in after splash */}
      <AnimatePresence>
        {splashDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <StudioHeader
              onCreditsClick={() => setShowBuyCredits(true)}
              credits={credits}
              user={session?.user ?? null}
              isGenerating={generating}
            />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10 lg:space-y-14">
              {/* ===== LANDING PAGE: unauthenticated ===== */}
              {status === "unauthenticated" && (
                <>
                  {/* Hero */}
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="text-center space-y-6 pt-6 lg:pt-12"
                  >
                    <p
                      className="text-[10px] tracking-[0.35em] text-[#C8B99A] uppercase"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      Premium AI Portrait Studio
                    </p>

                    <h2
                      className="text-5xl md:text-7xl lg:text-8xl text-[#F0EDE8] leading-none tracking-tight"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                    >
                      Four perspectives.
                      <br />
                      <span className="text-[#C8B99A]">One you.</span>
                    </h2>

                    <p
                      className="text-sm md:text-base text-[rgba(240,237,232,0.4)] max-w-lg mx-auto leading-relaxed"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      Composed by master photographer briefs. Realised by AI.
                      Indistinguishable from a studio session.
                    </p>

                    <div className="pt-2">
                      <motion.button
                        onClick={() => signIn("google")}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="cta-corners relative px-10 py-4 rounded-lg border border-[#C8B99A]/40 text-sm text-[#C8B99A] pulse-glow bg-[rgba(200,185,154,0.04)]"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        <span className="gold-corner top-left" />
                        <span className="gold-corner top-right" />
                        <span className="gold-corner bottom-left" />
                        <span className="gold-corner bottom-right" />
                        Begin Your Portrait
                      </motion.button>
                    </div>

                    <p
                      className="text-[11px] text-[rgba(240,237,232,0.2)] tracking-widest uppercase"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      100 free credits to start · No credit card required
                    </p>
                  </motion.section>

                  {/* Sample gallery */}
                  <section>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="text-center text-[10px] tracking-[0.25em] text-[rgba(240,237,232,0.15)] uppercase mb-4"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      The collection
                    </motion.p>
                    <SampleGallery />
                  </section>
                </>
              )}

              {/* ===== APP: authenticated ===== */}
              {status === "authenticated" && (
                <>
                  <UploadZone />
                  <GenerateCTA onGenerate={handleGenerate} />
                  <PortraitGallery />
                  {showShareCard && <ShareCard />}
                </>
              )}

              {/* Loading */}
              {status === "loading" && (
                <div className="flex items-center justify-center py-20">
                  <div className="shimmer w-8 h-8 rounded-full" />
                </div>
              )}
            </main>

            <footer className="py-6 text-center">
              <p
                className="text-xs text-[rgba(240,237,232,0.12)] tracking-widest uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                CoverPhoto
              </p>
            </footer>

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
