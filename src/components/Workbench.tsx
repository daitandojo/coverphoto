"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import RefPanel from "./RefPanel";
import BuilderPanel from "./BuilderPanel";
import GenerateCTA from "./GenerateCTA";
import PortraitGallery from "./PortraitGallery";
import ShareCard from "./ShareCard";

const PANEL_W = 310;
const EDGE_HOVER_MARGIN = 59;
const AUTO_CLOSE_MS = 8000;

export default function Workbench({ onGenerate }: { onGenerate: () => void }) {
  const {
    leftPanelOpen, rightPanelOpen, leftPanelPinned, rightPanelPinned,
    setLeftPanelOpen, setRightPanelOpen, toggleLeftPanel, toggleRightPanel,
    showShareCard,
  } = usePortraitStore();

  const leftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLeftTimer = useCallback(() => { if (leftTimer.current) { clearTimeout(leftTimer.current); leftTimer.current = null; } }, []);
  const cancelRightTimer = useCallback(() => { if (rightTimer.current) { clearTimeout(rightTimer.current); rightTimer.current = null; } }, []);

  // Edge hover: open when mouse within 59px of border
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const nearLeft = e.clientX <= EDGE_HOVER_MARGIN;
      const nearRight = e.clientX >= window.innerWidth - EDGE_HOVER_MARGIN;

      // Open left
      if (nearLeft && !leftPanelOpen) {
        setLeftPanelOpen(true);
        cancelLeftTimer();
        leftTimer.current = setTimeout(() => {
          usePortraitStore.getState().setLeftPanelOpen(false);
        }, AUTO_CLOSE_MS);
      } else if (!nearLeft) {
        cancelLeftTimer();
      }

      // Open right
      if (nearRight && !rightPanelOpen) {
        setRightPanelOpen(true);
        cancelRightTimer();
        rightTimer.current = setTimeout(() => {
          usePortraitStore.getState().setRightPanelOpen(false);
        }, AUTO_CLOSE_MS);
      } else if (!nearRight) {
        cancelRightTimer();
      }
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [leftPanelOpen, rightPanelOpen, setLeftPanelOpen, setRightPanelOpen, cancelLeftTimer, cancelRightTimer]);

  // Reset auto-close timer on mouse enter panel
  const onLeftEnter = useCallback(() => {
    cancelLeftTimer();
  }, [cancelLeftTimer]);

  const onLeftLeave = useCallback(() => {
    if (!leftPanelPinned) {
      leftTimer.current = setTimeout(() => {
        usePortraitStore.getState().setLeftPanelOpen(false);
      }, AUTO_CLOSE_MS);
    }
  }, [leftPanelPinned]);

  const onRightEnter = useCallback(() => {
    cancelRightTimer();
  }, [cancelRightTimer]);

  const onRightLeave = useCallback(() => {
    if (!rightPanelPinned) {
      rightTimer.current = setTimeout(() => {
        usePortraitStore.getState().setRightPanelOpen(false);
      }, AUTO_CLOSE_MS);
    }
  }, [rightPanelPinned]);

  return (
    <div className="flex-1 flex overflow-hidden relative min-h-0">
      {/* LEFT PANEL */}
      <div className="relative z-20 flex-shrink-0" onMouseEnter={onLeftEnter} onMouseLeave={onLeftLeave}>
        {!leftPanelOpen && (
          <motion.button
            onClick={(e) => { e.stopPropagation(); toggleLeftPanel(); cancelLeftTimer(); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[22px] h-24 rounded-r-lg border border-l-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors"
          >
            <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>📷 REF</span>
          </motion.button>
        )}
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center justify-center gap-5 w-full max-w-lg">
          <GenerateCTA onGenerate={onGenerate} />
          <PortraitGallery />
          {showShareCard && <ShareCard />}
        </div>
      </main>

      {/* RIGHT PANEL */}
      <div className="relative z-20 flex-shrink-0" onMouseEnter={onRightEnter} onMouseLeave={onRightLeave}>
        {!rightPanelOpen && (
          <motion.button
            onClick={(e) => { e.stopPropagation(); toggleRightPanel(); cancelRightTimer(); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-[22px] h-24 rounded-l-lg border border-r-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors"
          >
            <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}>✦ BUILD</span>
          </motion.button>
        )}
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
  );
}
