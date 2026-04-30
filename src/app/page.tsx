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

  // Fetch credits on auth
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

  // Override store's startGeneration to call the API
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

    // Initialize portraits to generating state
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

      // Update each portrait as it arrives
      data.portraits.forEach((p: any) => {
        updatePortrait(p.id, {
          url: p.url,
          status: p.status,
          error: p.error,
        });
      });

      setCredits(data.creditsRemaining);
      setSessionId(data.sessionId);

      // Confetti for first run
      if (isFirstRun) {
        setShowConfetti(true);
        completeFirstRun();
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Show share card after all complete
      setShowShareCard(true);
    } catch (err: any) {
      toast(err.message || "Generation failed. Please try again.", {
        className: "toast-custom",
        icon: "⚠",
      });
      // Reset portraits
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

      <StudioHeader
        onCreditsClick={() => setShowBuyCredits(true)}
        credits={credits}
        user={session?.user ?? null}
        isGenerating={generating}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10 lg:space-y-14">
        {/* Hero section for unauthenticated users */}
        {status === "unauthenticated" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-12"
          >
            <h2
              className="text-4xl lg:text-5xl text-[#F0EDE8] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
            >
              Your portrait studio,
              <br />
              reimagined for AI
            </h2>
            <p
              className="text-sm text-[rgba(240,237,232,0.5)] max-w-md mx-auto"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Upload 2–4 reference images and receive four professionally composed
              portraits. 100 free credits to begin.
            </p>
            <motion.button
              onClick={() => signIn("google")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl border border-[#C8B99A] text-sm text-[#C8B99A] bg-[rgba(200,185,154,0.05)] pulse-glow"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Sign in with Google to start
            </motion.button>
          </motion.section>
        )}

        {/* Main app */}
        {status === "authenticated" && (
          <>
            <UploadZone />
            <GenerateCTA onGenerate={handleGenerate} />
            <PortraitGallery />
            {showShareCard && <ShareCard />}
          </>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex items-center justify-center py-20">
            <div className="shimmer w-8 h-8 rounded-full" />
          </div>
        )}
      </main>

      <BuyCreditsModal
        open={showBuyCredits}
        onClose={() => setShowBuyCredits(false)}
      />

      {showConfetti && <ConfettiBurst />}

      {/* Footer */}
      <footer className="py-6 text-center">
        <p
          className="text-xs text-[rgba(240,237,232,0.15)] tracking-widest uppercase"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          CoverPhoto
        </p>
      </footer>
    </>
  );
}
