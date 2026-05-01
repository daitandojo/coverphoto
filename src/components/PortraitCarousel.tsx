"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import { BRIEFS } from "@/lib/prompts";
import { SPECIALTIES } from "@/lib/specialties";

interface CarouselProps {
  items: any[];
  idx: number;
  setIdx: (i: number) => void;
  label: string;
  emptyLabel: string;
  renderActions: (item: any) => React.ReactNode;
}

function Carousel({ items, idx, setIdx, label, emptyLabel, renderActions }: CarouselProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-xl min-h-[300px]">
        <p className="text-xs text-[rgba(240,237,232,0.15)] italic" style={{ fontFamily: "'DM Mono', monospace" }}>{emptyLabel}</p>
      </div>
    );
  }

  const item = items[idx];
  const getName = (style: string) => {
    const b = BRIEFS.find((s) => s.id === style);
    if (b) return b.name;
    const s = SPECIALTIES.find((sp) => sp.id === style);
    return s?.name || style;
  };

  const isReady = item.url && (item.status === "completed" || item.status === "error");

  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-h-0">
      <p className="text-[9px] tracking-[0.3em] text-[rgba(200,185,154,0.2)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</p>

      {/* Main card */}
      <div className="relative w-full max-w-[300px] flex-1 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="w-full h-full">
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] min-h-[320px] bg-[rgba(255,255,255,0.02)] border border-white/5">
              {item.status === "generating" || !item.url ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center shimmer-fast">
                  <p className="text-xs text-[rgba(200,185,154,0.5)]" style={{ fontFamily: "'DM Mono', monospace" }}>{getName(item.style)}</p>
                  <p className="text-[10px] text-[rgba(240,237,232,0.2)] mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>Generating…</p>
                </div>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}

              {/* Bottom action bar overlay */}
              {isReady && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-center justify-center gap-2">
                  {renderActions(item)}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => setIdx((idx - 1 + items.length) % items.length)}
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
          style={{ fontFamily: "'DM Mono', monospace" }}>‹</button>
        <span className="text-[10px] text-[rgba(240,237,232,0.2)] tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>{idx + 1}/{items.length}</span>
        <button onClick={() => setIdx((idx + 1) % items.length)}
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
          style={{ fontFamily: "'DM Mono', monospace" }}>›</button>
      </div>
    </div>
  );
}

export default function PortraitCarousel() {
  const { libraryPortraits, workbenchPortraits, libIdx, wbIdx, setLibIdx, setWbIdx, moveToLibrary, dismissFromWorkbench, deleteFromLibrary } = usePortraitStore();

  const handleDownload = useCallback(async (url: string, style: string) => {
    if (!url) return;
    try {
      const r = await fetch(url);
      const b = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `coverphoto-${style}.jpg`;
      a.click();
    } catch { window.open(url, "_blank"); }
  }, []);

  return (
    <div className="flex gap-5 h-full w-full min-h-0 overflow-hidden">
      {/* LIBRARY */}
      <div className="flex-1 flex flex-col min-w-0">
        <Carousel
          items={libraryPortraits}
          idx={libIdx}
          setIdx={setLibIdx}
          label="Library"
          emptyLabel="No saved portraits yet"
          renderActions={(item) => (
            <div className="flex gap-2">
              <button onClick={() => handleDownload(item.url, item.style)}
                className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-white/15 text-[10px] text-white/80 hover:bg-white/10 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>↓ Save</button>
              <button onClick={() => deleteFromLibrary(item.id)}
                className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-red-400/30 text-[10px] text-red-300/80 hover:bg-red-900/20 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>🗑 Delete</button>
            </div>
          )}
        />
      </div>

      {/* DIVIDER */}
      <div className="w-px bg-white/5 flex-shrink-0" />

      {/* WORKBENCH */}
      <div className="flex-1 flex flex-col min-w-0">
        <Carousel
          items={workbenchPortraits}
          idx={wbIdx}
          setIdx={setWbIdx}
          label="Workbench"
          emptyLabel="Generate portraits in the builder"
          renderActions={(item) => (
            <div className="flex gap-2">
              <button onClick={() => moveToLibrary(item.id)}
                className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-[#C8B99A]/30 text-[10px] text-[#C8B99A]/90 hover:bg-[#C8B99A]/10 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>📚 Library</button>
              <button onClick={() => dismissFromWorkbench(item.id)}
                className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-red-400/30 text-[10px] text-red-300/80 hover:bg-red-900/20 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>✕ Dismiss</button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
