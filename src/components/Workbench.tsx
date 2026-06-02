"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import RefPanel from "./RefPanel";
import BuilderPanel from "./BuilderPanel";
import PortraitCarousel from "./PortraitCarousel";
import WorkflowWizard from "./WorkflowWizard";
import MobileTabBar from "./MobileTabBar";
import type { TabDef } from "./MobileTabBar";
import WebcamModal from "./WebcamModal";
import OrderMailModal from "./OrderMailModal";

interface WorkbenchProps {
  onGenerate: () => void;
  canGenerate: boolean;
  genReason: string;
}

export default function Workbench({ onGenerate, canGenerate, genReason }: WorkbenchProps) {
  const {
    uploadedImages,
    totalSelected,
    workbenchPortraits,
    libraryPortraits,
    leftPanelOpen,
    rightPanelOpen,
    setLeftPanelOpen,
    setRightPanelOpen,
    resetWorkbench,
  } = usePortraitStore();

  const [showCam, setShowCam] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderItem, setOrderItem] = useState<any>(null);
  const [mobileTab, setMobileTab] = useState<string>("photos");

  const wbEmpty = workbenchPortraits.length === 0;
  const selectedCount = totalSelected();
  const hasResults = workbenchPortraits.length > 0 || libraryPortraits.length > 0;

  // Auto-switch to results tab when generation completes
  useEffect(() => {
    if (hasResults && mobileTab !== "results") {
      // Only auto-switch if user is on photos or styles and results appear
      if (mobileTab === "photos" || mobileTab === "styles") {
        setMobileTab("results");
      }
    }
  }, [hasResults, workbenchPortraits.length]);

  // Desktop: swipe gesture state (kept for backward compat)
  const swipeStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Define tab data
  const tabs: TabDef[] = [
    { id: "photos", label: "Photos", icon: "📷", badge: uploadedImages.length },
    { id: "styles", label: "Styles", icon: "✦", badge: selectedCount || undefined },
    { id: "results", label: "Results", icon: hasResults ? "✨" : "🖼", badge: libraryPortraits.length + workbenchPortraits.length || undefined },
  ];

  return (
    <>
      {/* Workflow Wizard — always visible */}
      <WorkflowWizard />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
        onTouchStart={handleTouchStart}
      >
        {/* ==================================================== */}
        {/* MOBILE: Bottom tab layout */}
        {/* ==================================================== */}
        <div className="md:hidden flex-1 flex flex-col min-h-0 overflow-hidden pb-16">
          {/* Photos tab */}
          <div className={`flex-1 min-h-0 overflow-y-auto ${mobileTab === "photos" ? "block" : "hidden"}`}>
            <div className="p-4">
              <RefPanel onCameraClick={() => setShowCam(true)} />
            </div>
          </div>

          {/* Styles tab */}
          <div className={`flex-1 min-h-0 overflow-y-auto ${mobileTab === "styles" ? "block" : "hidden"}`}>
            <div className="p-4">
              <BuilderPanel onGenerate={onGenerate} canGenerate={canGenerate} reason={genReason} />
            </div>
          </div>

          {/* Results tab */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${mobileTab === "results" ? "block" : "hidden"}`}>
            {hasResults ? (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-2 md:p-4">
                  <PortraitCarousel onOrder={(item) => { setOrderItem(item); setShowOrder(true); }} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <MobileEmptyState
                  onSwitchTab={(tab) => setMobileTab(tab)}
                  hasPhotos={uploadedImages.length > 0}
                  hasStyles={selectedCount > 0}
                  photoCount={uploadedImages.length}
                  styleCount={selectedCount}
                />
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* DESKTOP: Three-panel layout */}
        {/* ==================================================== */}
        <div className="hidden md:flex flex-1 flex-row min-h-0 overflow-hidden">
          {/* LEFT PANEL (RefPanel) */}
          <div className="relative z-20 flex-shrink-0">
            {!leftPanelOpen && (
              <button onClick={() => setLeftPanelOpen(true)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-24 rounded-r-lg border border-l-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors touch-safe min-w-[44px]">
                <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>
                  📷 PHOTOS
                </span>
              </button>
            )}
            <AnimatePresence>
              {leftPanelOpen && (
                <motion.div
                  initial={{ x: -310 }}
                  animate={{ x: 0 }}
                  exit={{ x: -310 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="h-full border-r border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-y-auto p-4"
                  style={{ width: 310, minWidth: 310 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                      Photos
                    </span>
                    <button onClick={() => setLeftPanelOpen(false)} className="text-white/30 hover:text-white/70 text-sm w-6 h-6 flex items-center justify-center">
                      ✕
                    </button>
                  </div>
                  <RefPanel onCameraClick={() => setShowCam(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CENTER — Empty state or Carousel */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 py-3">
            {!hasResults ? (
              <DesktopEmptyState
                hasPhotos={uploadedImages.length > 0}
                hasStyles={selectedCount > 0}
                canGenerate={canGenerate}
                photoCount={uploadedImages.length}
                styleCount={selectedCount}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] tracking-[0.4em] text-[rgba(200,185,154,0.2)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {workbenchPortraits.length > 0 ? "Workbench" : "Library"}
                  </p>
                  <div className="flex items-center gap-2">
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

          {/* RIGHT PANEL (BuilderPanel) */}
          <div className="relative z-20 flex-shrink-0">
            {!rightPanelOpen && (
              <button onClick={() => setRightPanelOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-24 rounded-l-lg border border-r-0 border-white/10 bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center cursor-pointer hover:border-[#C8B99A]/30 transition-colors touch-safe min-w-[44px]">
                <span className="text-[10px]" style={{ writingMode: "vertical-rl", fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em" }}>
                  ✦ STYLES
                </span>
              </button>
            )}
            <AnimatePresence>
              {rightPanelOpen && (
                <motion.div
                  initial={{ x: 500 }}
                  animate={{ x: 0 }}
                  exit={{ x: 500 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="h-full border-l border-white/5 bg-[rgba(8,8,8,0.92)] backdrop-blur-md overflow-hidden p-4"
                  style={{ width: 500, minWidth: 500 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                      Styles
                    </span>
                    <button onClick={() => setRightPanelOpen(false)} className="text-white/30 hover:text-white/70 text-sm w-6 h-6 flex items-center justify-center">
                      ✕
                    </button>
                  </div>
                  <BuilderPanel onGenerate={onGenerate} canGenerate={canGenerate} reason={genReason} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <MobileTabBar tabs={tabs} activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>

      {showCam && <WebcamModal onClose={() => setShowCam(false)} />}
      {showOrder && orderItem && (
        <OrderMailModal
          open={showOrder}
          onClose={() => { setShowOrder(false); setOrderItem(null); }}
        />
      )}
    </>
  );
}

/* ── Empty States ── */

function DesktopEmptyState({
  hasPhotos,
  hasStyles,
  canGenerate,
  photoCount,
  styleCount,
}: {
  hasPhotos: boolean;
  hasStyles: boolean;
  canGenerate: boolean;
  photoCount: number;
  styleCount: number;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
      {/* Visual workflow flow diagram */}
      <div className="flex items-center gap-6 lg:gap-10">
        {/* Step 1: Upload */}
        <div className={`flex flex-col items-center gap-2 ${hasPhotos ? "opacity-100" : "opacity-40"}`}>
          <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
            hasPhotos ? "border-[#C8B99A] bg-[rgba(200,185,154,0.08)]" : "border-white/10"
          }`}>
            📷
          </div>
          <span className={`text-[9px] uppercase tracking-wider ${hasPhotos ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>
            {hasPhotos ? `${photoCount}/3` : "Upload photos"}
          </span>
        </div>

        {/* Arrow */}
        <motion.div className="text-white/10 text-2xl" animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          →
        </motion.div>

        {/* Step 2: Styles */}
        <div className={`flex flex-col items-center gap-2 ${hasStyles ? "opacity-100" : "opacity-40"}`}>
          <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
            hasStyles ? "border-[#C8B99A] bg-[rgba(200,185,154,0.08)]" : "border-white/10"
          }`}>
            ✦
          </div>
          <span className={`text-[9px] uppercase tracking-wider ${hasStyles ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>
            {hasStyles ? `${styleCount} selected` : "Pick styles"}
          </span>
        </div>

        {/* Arrow */}
        <motion.div className="text-white/10 text-2xl" animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>
          →
        </motion.div>

        {/* Step 3: Generate */}
        <div className={`flex flex-col items-center gap-2 ${canGenerate ? "opacity-100" : "opacity-40"}`}>
          <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
            canGenerate ? "border-[#C8B99A] bg-[rgba(200,185,154,0.08)] gas-glow" : "border-white/10"
          }`}>
            ⚡
          </div>
          <span className={`text-[9px] uppercase tracking-wider ${canGenerate ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>
            Generate
          </span>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-[10px] text-[rgba(240,237,232,0.2)] text-center max-w-xs leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
        Upload your best 2-3 photos from the left panel, then pick
        your favourite portrait styles on the right to get started.
      </p>
    </div>
  );
}

function MobileEmptyState({
  onSwitchTab,
  hasPhotos,
  hasStyles,
  photoCount,
  styleCount,
}: {
  onSwitchTab: (tab: string) => void;
  hasPhotos: boolean;
  hasStyles: boolean;
  photoCount: number;
  styleCount: number;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Step indicators */}
      <div className="flex items-center gap-4">
        <button onClick={() => onSwitchTab("photos")} className="flex flex-col items-center gap-1.5">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
            hasPhotos ? "border-[#C8B99A] bg-[rgba(200,185,154,0.08)]" : "border-white/10"
          }`}>
            📷
          </div>
          <span className={`text-[8px] uppercase tracking-wider ${hasPhotos ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>
            {hasPhotos ? `${photoCount}/3` : "Upload"}
          </span>
        </button>

        <motion.span className="text-white/10 text-lg" animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          →
        </motion.span>

        <button onClick={() => onSwitchTab("styles")} className="flex flex-col items-center gap-1.5">
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
            hasStyles ? "border-[#C8B99A] bg-[rgba(200,185,154,0.08)]" : "border-white/10"
          }`}>
            ✦
          </div>
          <span className={`text-[8px] uppercase tracking-wider ${hasStyles ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>
            Styles
          </span>
        </button>

        <motion.span className="text-white/10 text-lg" animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}>
          →
        </motion.span>

        <div className="flex flex-col items-center gap-1.5 opacity-30">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-lg">
            ✨
          </div>
          <span className="text-[8px] text-[rgba(240,237,232,0.3)] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
            Results
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-2">
        {!hasPhotos && (
          <button onClick={() => onSwitchTab("photos")}
            className="px-4 py-2 rounded-lg border border-[#C8B99A]/30 text-[10px] text-[#C8B99A] bg-[rgba(200,185,154,0.06)] transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            1. 📷 Upload photos first
          </button>
        )}
        {hasPhotos && !hasStyles && (
          <button onClick={() => onSwitchTab("styles")}
            className="px-4 py-2 rounded-lg border border-[#C8B99A]/30 text-[10px] text-[#C8B99A] bg-[rgba(200,185,154,0.06)] transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            2. ✦ Pick your styles
          </button>
        )}
        {hasPhotos && hasStyles && (
          <button onClick={() => onSwitchTab("styles")}
            className="px-4 py-2 rounded-lg border border-[#C8B99A]/40 text-[10px] text-[#C8B99A] bg-[rgba(200,185,154,0.1)] golden-glow transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            3. ⚡ Tap Generate!
          </button>
        )}
      </div>

      <p className="text-[9px] text-[rgba(240,237,232,0.15)] text-center leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
        Tap the tabs below to switch between uploads, styles, and results.
      </p>
    </div>
  );
}
