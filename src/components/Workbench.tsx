"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import RefPanel from "./RefPanel";
import BuilderPanel from "./BuilderPanel";
import PortraitCarousel from "./PortraitCarousel";
import WebcamModal from "./WebcamModal";
import TermsModal from "./TermsModal";
import OrderMailModal from "./OrderMailModal";

const LEFT_PANEL_W = 310;
const RIGHT_PANEL_W = 500;

interface WorkbenchProps {
  onGenerate: () => void;
  canGenerate: boolean;
  genReason: string;
}

export default function Workbench({ onGenerate, canGenerate, genReason }: WorkbenchProps) {
  const { leftPanelOpen, rightPanelOpen, setLeftPanelOpen, setRightPanelOpen, toggleLeftPanel, toggleRightPanel, workbenchPortraits, resetWorkbench, clearUploadedImages } = usePortraitStore();
  const [showCam, setShowCam] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showOrder, setShowOrder] = useState(false);

  const leftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLeft = useCallback(() => { if (leftTimer.current) { clearTimeout(leftTimer.current); leftTimer.current = null; } }, []);
  const cancelRight = useCallback(() => { if (rightTimer.current) { clearTimeout(rightTimer.current); rightTimer.current = null; } }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nearLeft = e.clientX <= 59;
      const nearRight = e.clientX >= window.innerWidth - 59;
      if (nearLeft && !leftPanelOpen) { setLeftPanelOpen(true); cancelLeft(); leftTimer.current = setTimeout(() => usePortraitStore.getState().setLeftPanelOpen(false), 8000); }
      else if (!nearLeft) cancelLeft();
      if (nearRight && !rightPanelOpen) { setRightPanelOpen(true); cancelRight(); rightTimer.current = setTimeout(() => usePortraitStore.getState().setRightPanelOpen(false), 8000); }
      else if (!nearRight) cancelRight();
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [leftPanelOpen, rightPanelOpen, setLeftPanelOpen, setRightPanelOpen, cancelLeft, cancelRight]);

  const wbEmpty = workbenchPortraits.length === 0;

  return (
    <div className="flex-1 flex overflow-hidden relative min-h-0">
      {/* LEFT */}
      <div className="relative z-20 flex-shrink-0">
        {!leftPanelOpen && (
          <motion.button onClick={(e) => { e.stopPropagation(); toggleLeftPanel(); cancelLeft(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[22px] h-24 rounded-r-lg border border-l-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors">
            <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>📷 REF</span>
          </motion.button>
        )}
        <AnimatePresence>{leftPanelOpen && (
          <motion.div initial={{ x: -LEFT_PANEL_W }} animate={{ x: 0 }} exit={{ x: -LEFT_PANEL_W }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full border-r border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-y-auto p-4" style={{ width: LEFT_PANEL_W, minWidth: LEFT_PANEL_W }}>
            <RefPanel onCameraClick={() => setShowCam(true)} />
          </motion.div>
        )}</AnimatePresence>
      </div>

      {/* CENTER — dual carousel */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] tracking-[0.4em] text-[rgba(200,185,154,0.2)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Workbench</p>
          <div className="flex gap-2">
            <button onClick={() => setShowOrder(true)}
              className="text-[8px] px-2 py-1 rounded border border-white/10 text-[rgba(240,237,232,0.25)] hover:text-white/60 transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}>📬 Order</button>
            <button onClick={() => { resetWorkbench(); clearUploadedImages(); }}
              className="text-[8px] px-2 py-1 rounded border border-red-500/15 text-red-400/40 hover:text-red-400/70 transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}>🗑 Clear all</button>
            <button onClick={() => setShowTerms(true)}
              className="text-[8px] px-2 py-1 rounded border border-white/10 text-[rgba(240,237,232,0.25)] hover:text-white/60 transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}>Terms</button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <PortraitCarousel />
        </div>
      </main>

      {/* RIGHT */}
      <div className="relative z-20 flex-shrink-0">
        {!rightPanelOpen && (
          <motion.button onClick={(e) => { e.stopPropagation(); toggleRightPanel(); cancelRight(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-[22px] h-24 rounded-l-lg border border-r-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors">
            <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}>✦ BUILD</span>
          </motion.button>
        )}
        <AnimatePresence>{rightPanelOpen && (
          <motion.div initial={{ x: RIGHT_PANEL_W }} animate={{ x: 0 }} exit={{ x: RIGHT_PANEL_W }} transition={{ duration: 0.25, ease: "easeOut" }}
            className="h-full border-l border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-hidden p-4" style={{ width: RIGHT_PANEL_W, minWidth: RIGHT_PANEL_W }}>
            <BuilderPanel onGenerate={onGenerate} canGenerate={canGenerate && wbEmpty} reason={wbEmpty ? genReason : "Dispatch workbench items first"} />
          </motion.div>
        )}</AnimatePresence>
      </div>

      {showCam && <WebcamModal onClose={() => setShowCam(false)} />}
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <OrderMailModal open={showOrder} onClose={() => setShowOrder(false)} />
    </div>
  );
}
