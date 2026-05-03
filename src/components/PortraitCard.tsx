"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import ContextMenu from "./ContextMenu";
import type { PortraitImage } from "@/types";

const STYLE_LABELS: Record<string, string> = {
  executive: "Executive · Three-quarter · Formal",
  founder: "Founder · Smart-casual · Warm",
  statesperson: "Statesperson · Formal · Architectural",
  outdoors: "Outdoors · Casual · Natural light",
  artist: "Artist · Creative · Bold",
  athlete: "Athlete · Dynamic · Dramatic",
  scholar: "Scholar · Intellectual · Warm",
  minimalist: "Minimalist · Clean · Bauhaus",
  romantic: "Romantic · Soft · Intimate",
  maverick: "Maverick · Edgy · High contrast",
};

const GRID = 7;

function generateFragments() {
  const items = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 200;
      items.push({
        key: `${r}-${c}`,
        left: `${(c / GRID) * 100}%`,
        top: `${(r / GRID) * 100}%`,
        w: `${100 / GRID}%`,
        h: `${100 / GRID}%`,
        bx: `${c * (100 / (GRID - 1))}%`,
        by: `${r * (100 / (GRID - 1))}%`,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 400,
        delay: Math.random() * 0.25,
      });
    }
  }
  return items;
}

function MaterializeImage({ src, onDone }: { src: string; onDone: () => void }) {
  const fragments = useMemo(() => generateFragments(), []);

  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0">
      {fragments.map((f) => (
        <motion.div
          key={f.key}
          initial={{ opacity: 0, x: f.dx, y: f.dy, rotate: f.rot, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: f.delay, ease: "easeOut" }}
          className="absolute"
          style={{
            left: f.left,
            top: f.top,
            width: f.w,
            height: f.h,
            backgroundImage: `url(${src})`,
            backgroundSize: `${GRID * 100}%`,
            backgroundPosition: `${f.bx} ${f.by}`,
          }}
        />
      ))}
    </div>
  );
}

interface PortraitCardProps {
  portrait: PortraitImage;
  index: number;
  large?: boolean;
  onRetry?: (id: string, style: string) => void;
}

export default function PortraitCard({ portrait, index, large, onRetry }: PortraitCardProps) {
  const { credits } = usePortraitStore();
  const [showOverlay, setShowOverlay] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [materializing, setMaterializing] = useState(true);

  const handleRetry = useCallback(() => {
    if (onRetry) onRetry(portrait.id, portrait.style);
  }, [onRetry, portrait.id, portrait.style]);

  useEffect(() => {
    if (portrait.status === "completed" && portrait.url) {
      setMaterializing(true);
    } else {
      setMaterializing(false);
    }
  }, [portrait.status, portrait.url]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleSave = useCallback(async () => {
    if (!portrait.url) return;
    try {
      const res = await fetch(portrait.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `coverphoto-${portrait.style}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(portrait.url, "_blank");
    }
  }, [portrait.url, portrait.style]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCopy = async () => {
    if (!portrait.url) return;
    try {
      const res = await fetch(portrait.url);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = portrait.url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setContextMenu(null);
  };

  const sizeClass = large
    ? "w-full max-w-[400px] h-[500px]"
    : "w-full aspect-[3/4] min-h-[200px]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.08 }}
      layout
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      onContextMenu={handleContextMenu}
      className={`relative rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)] border border-white/5 group ${sizeClass}`}
    >
      {/* Pending / Generating state */}
      {(portrait.status === "pending" || portrait.status === "generating") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`absolute inset-0 ${portrait.status === "generating" ? "shimmer-fast" : "shimmer"}`} />
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,185,154,0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="aperture-pulse relative z-10">
            <circle cx="12" cy="12" r="10" />
            <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
            <line x1="9.69" y1="8" x2="21.17" y2="8" />
            <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
            <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
            <line x1="14.31" y1="16" x2="2.83" y2="16" />
            <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
          </svg>
          {portrait.status === "generating" && (
            <span className="relative z-10 mt-3 text-xs text-[rgba(200,185,154,0.6)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Composing portrait {index + 1}…
            </span>
          )}
        </div>
      )}

      {/* Error state */}
      {portrait.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-red-500/30 rounded-xl">
          <span className="text-red-400 text-xs mb-2">Generation failed</span>
          <motion.button
            onClick={handleRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1 rounded-md border border-red-500/30 text-red-400 text-xs"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            ↻ Retry
          </motion.button>
        </div>
      )}

      {/* Completed image */}
      {portrait.status === "completed" && portrait.url && (
        <>
          {materializing ? (
            <MaterializeImage
              src={portrait.url}
              onDone={() => setMaterializing(false)}
            />
          ) : (
            <img src={portrait.url} alt={`Portrait ${index + 1}`} className="w-full h-full object-cover" />
          )}

          {/* Hover overlay */}
          <AnimatePresence>
            {showOverlay && !materializing && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-x-0 bottom-0 p-4 pt-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              >
                <p className="text-xs text-[#C8B99A] mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {STYLE_LABELS[portrait.style] || portrait.style}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-1.5 rounded-lg border border-white/10 text-xs text-white/70 hover:border-white/30 hover:text-white transition-all"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    ↓ Save
                  </button>
                  <button
                    onClick={handleRetry}
                    disabled={credits < 1}
                    className="flex-1 py-1.5 rounded-lg border border-white/10 text-xs text-white/70 hover:border-white/30 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    ↻ Redo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onSave={handleSave}
            onRedo={() => { handleRetry(); setContextMenu(null); }}
            onCopy={handleCopy}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
