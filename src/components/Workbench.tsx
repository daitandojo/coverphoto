"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import RefPanel from "./RefPanel";
import BuilderPanel from "./BuilderPanel";
import PortraitCarousel from "./PortraitCarousel";
import WebcamModal from "./WebcamModal";
import TermsModal from "./TermsModal";
import OrderMailModal from "./OrderMailModal";

interface WorkbenchProps {
  onGenerate: () => void;
  canGenerate: boolean;
  genReason: string;
}

export default function Workbench({ onGenerate, canGenerate, genReason }: WorkbenchProps) {
  const { leftPanelOpen, rightPanelOpen, setLeftPanelOpen, setRightPanelOpen, libraryPortraits, workbenchPortraits, resetWorkbench } = usePortraitStore();
  const [showCam, setShowCam] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderItem, setOrderItem] = useState<any>(null);
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);

  const wbEmpty = workbenchPortraits.length === 0;

  // Touch-friendly panel toggles
  const toggleMobile = useCallback((side: "left" | "right") => {
    setMobilePanel((prev) => (prev === side ? null : side));
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
      {/* Mobile panel toggle bar */}
      <div className="md:hidden flex items-center justify-center gap-4 py-2 px-4 border-b border-white/5">
        <button onClick={() => toggleMobile("left")}
          className={`px-4 py-2 rounded-lg border text-[10px] uppercase tracking-wider transition-all min-h-[44px] touch-safe ${mobilePanel === "left" ? "border-[#C8B99A] text-[#C8B99A]" : "border-white/10 text-[rgba(240,237,232,0.4)]"}`}
          style={{ fontFamily: "'DM Mono', monospace" }}>📷 Ref</button>
        <button onClick={() => toggleMobile("right")}
          className={`px-4 py-2 rounded-lg border text-[10px] uppercase tracking-wider transition-all min-h-[44px] touch-safe ${mobilePanel === "right" ? "border-[#C8B99A] text-[#C8B99A]" : "border-white/10 text-[rgba(240,237,232,0.4)]"}`}
          style={{ fontFamily: "'DM Mono', monospace" }}>✦ Build</button>
      </div>

      {/* Mobile overlays */}
      <AnimatePresence>
        {mobilePanel === "left" && (
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed inset-0 z-40 bg-[rgba(8,8,8,0.97)] overflow-y-auto p-4 pt-12">
            <button onClick={() => setMobilePanel(null)} className="absolute top-3 right-3 text-white/50 hover:text-white/90 text-lg w-11 h-11 flex items-center justify-center">✕</button>
            <RefPanel onCameraClick={() => setShowCam(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobilePanel === "right" && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed inset-0 z-40 bg-[rgba(8,8,8,0.97)] overflow-hidden p-4 pt-12 flex flex-col">
            <button onClick={() => setMobilePanel(null)} className="absolute top-3 right-3 text-white/50 hover:text-white/90 text-lg w-11 h-11 flex items-center justify-center">✕</button>
            <BuilderPanel onGenerate={onGenerate} canGenerate={canGenerate && wbEmpty} reason={wbEmpty ? genReason : "Dispatch workbench items first"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: LEFT panel */}
      <div className="hidden md:block relative z-20 flex-shrink-0">
        {!leftPanelOpen && (
          <button onClick={() => setLeftPanelOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-24 rounded-r-lg border border-l-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors touch-safe min-w-[44px]">
            <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>📷 REF</span>
          </button>
        )}
        <AnimatePresence>{leftPanelOpen && (
          <motion.div initial={{ x: -310 }} animate={{ x: 0 }} exit={{ x: -310 }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full border-r border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-y-auto p-4" style={{ width: 310, minWidth: 310 }}>
            <RefPanel onCameraClick={() => setShowCam(true)} />
          </motion.div>
        )}</AnimatePresence>
      </div>

      {/* CENTER */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden px-2 md:px-4 py-2 md:py-3">
        {libraryPortraits.length === 0 && workbenchPortraits.length === 0 ? (
          /* Empty state: guidance with subtle premium animations */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6 relative overflow-hidden">
            {/* Animated particles */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-[#C8B99A]"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    top: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    y: [0, -30 - Math.random() * 40, 0],
                    x: [0, (Math.random() - 0.5) * 20, 0],
                    opacity: [0, 0.6, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                    ease: "easeInOut",
                  }}
                />
              ))}
              {/* Larger slow-drifting orbs */}
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 60 + Math.random() * 100,
                    height: 60 + Math.random() * 100,
                    left: `${5 + Math.random() * 90}%`,
                    top: `${10 + Math.random() * 80}%`,
                    background: `radial-gradient(circle at center, rgba(200,185,154,0.06) 0%, transparent 70%)`,
                  }}
                  animate={{
                    y: [0, -20 - Math.random() * 30, 0],
                    x: [0, (Math.random() - 0.5) * 30, 0],
                    scale: [1, 1.15, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 8 + Math.random() * 6,
                    repeat: Infinity,
                    delay: Math.random() * 6,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Content (above particles) */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xs tracking-[0.4em] text-[rgba(200,185,154,0.15)] uppercase"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Welcome
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl leading-relaxed max-w-[65%] text-[rgba(240,237,232,0.4)] italic"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                Upload reference images from the left panel, then choose your portrait styles in the builder on the right. Your generated portraits will appear here.
              </motion.p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] tracking-[0.4em] text-[rgba(200,185,154,0.2)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Workbench</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowTerms(true)}
                  className="text-[8px] px-2 py-1.5 min-h-[32px] rounded border border-white/10 text-[rgba(240,237,232,0.25)] hover:text-white/60 transition-all touch-safe"
                  style={{ fontFamily: "'DM Mono', monospace" }}>Terms</button>
                {!wbEmpty && (
                  <button onClick={resetWorkbench}
                    className="text-[8px] px-2 py-1.5 min-h-[32px] rounded border border-red-500/15 text-red-400/40 hover:text-red-400/70 transition-all touch-safe"
                    style={{ fontFamily: "'DM Mono', monospace" }}>✕ Clear</button>
                )}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <PortraitCarousel onOrder={(item) => { setOrderItem(item); setShowOrder(true); }} />
            </div>
          </>
        )}
      </main>

      {/* Desktop: RIGHT panel */}
      <div className="hidden md:block relative z-20 flex-shrink-0">
        {!rightPanelOpen && (
          <button onClick={() => setRightPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-24 rounded-l-lg border border-r-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors touch-safe min-w-[44px]">
            <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}>✦ BUILD</span>
          </button>
        )}
        <AnimatePresence>{rightPanelOpen && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full border-l border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-hidden p-4" style={{ width: 500, minWidth: 500 }}>
            <BuilderPanel onGenerate={onGenerate} canGenerate={canGenerate && wbEmpty} reason={wbEmpty ? genReason : "Dispatch workbench items first"} />
          </motion.div>
        )}</AnimatePresence>
      </div>

      {showCam && <WebcamModal onClose={() => setShowCam(false)} />}
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      {showOrder && orderItem && <OrderMailModal open={showOrder} onClose={() => { setShowOrder(false); setOrderItem(null); }} />}
    </div>
  );
}
