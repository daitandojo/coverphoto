"use client";

import { useRef, useCallback, useState } from "react";
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
      <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
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

  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-h-0">
      <p className="text-[9px] tracking-[0.3em] text-[rgba(200,185,154,0.25)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</p>

      <div className="relative w-full max-w-[260px] flex-1 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="w-full">
            <div className="relative rounded-xl overflow-hidden aspect-[3/4] min-h-[240px] bg-[rgba(255,255,255,0.02)] border border-white/5">
              {item.status === "generating" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center shimmer-fast">
                  <p className="text-xs text-[rgba(200,185,154,0.5)]" style={{ fontFamily: "'DM Mono', monospace" }}>{getName(item.style)}</p>
                  <p className="text-[10px] text-[rgba(240,237,232,0.2)] mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>Generating…</p>
                </div>
              ) : item.url ? (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-[rgba(200,185,154,0.3)]" style={{ fontFamily: "'DM Mono', monospace" }}>{getName(item.style)}</p>
                  <p className="text-[10px] text-[rgba(240,237,232,0.15)] mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>To be generated</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-3">
        <button onClick={() => setIdx((idx - 1 + items.length) % items.length)}
          className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
          style={{ fontFamily: "'DM Mono', monospace" }}>‹</button>
        <span className="text-[10px] text-[rgba(240,237,232,0.25)] tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>{idx + 1}/{items.length}</span>
        <button onClick={() => setIdx((idx + 1) % items.length)}
          className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
          style={{ fontFamily: "'DM Mono', monospace" }}>›</button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">{renderActions(item)}</div>
    </div>
  );
}

export default function PortraitCarousel({ onRetry }: { onRetry?: (id: string, style: string) => void }) {
  const { libraryPortraits, workbenchPortraits, libIdx, wbIdx, setLibIdx, setWbIdx, moveToLibrary, dismissFromWorkbench, deleteFromLibrary, updateWorkbenchPortrait } = usePortraitStore();

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
    <div className="flex gap-4 h-full w-full min-h-0 overflow-hidden">
      {/* LIBRARY CAROUSEL */}
      <div className="flex-1 flex flex-col min-w-0">
        <Carousel
          items={libraryPortraits}
          idx={libIdx}
          setIdx={setLibIdx}
          label="Library"
          emptyLabel="No saved portraits yet"
          renderActions={(item) => (
            <>
              <button onClick={() => handleDownload(item.url, item.style)}
                className="px-2.5 py-1 rounded border border-white/10 text-[9px] text-[rgba(240,237,232,0.4)] hover:text-white/70 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>↓ Save</button>
              <button onClick={() => deleteFromLibrary(item.id)}
                className="px-2.5 py-1 rounded border border-red-500/15 text-[9px] text-red-400/50 hover:text-red-400/80 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>🗑 Delete</button>
              {onRetry && (
                <button onClick={() => onRetry(item.id, item.style)}
                  className="px-2.5 py-1 rounded border border-white/10 text-[9px] text-[rgba(240,237,232,0.4)] hover:text-white/70 transition-all uppercase tracking-wider"
                  style={{ fontFamily: "'DM Mono', monospace" }}>↻ Redo</button>
              )}
            </>
          )}
        />
      </div>

      {/* DIVIDER */}
      <div className="w-px bg-white/5 flex-shrink-0" />

      {/* WORKBENCH CAROUSEL */}
      <div className="flex-1 flex flex-col min-w-0">
        <Carousel
          items={workbenchPortraits}
          idx={wbIdx}
          setIdx={setWbIdx}
          label="Workbench"
          emptyLabel="Generate new portraits in the builder"
          renderActions={(item) => (
            <>
              {item.url && (
                <button onClick={() => moveToLibrary(item.id)}
                  className="px-2.5 py-1 rounded border border-[#C8B99A]/30 text-[9px] text-[#C8B99A] hover:bg-[rgba(200,185,154,0.08)] transition-all uppercase tracking-wider"
                  style={{ fontFamily: "'DM Mono', monospace" }}>📚 Move to Library</button>
              )}
              <button onClick={() => dismissFromWorkbench(item.id)}
                className="px-2.5 py-1 rounded border border-red-500/15 text-[9px] text-red-400/50 hover:text-red-400/80 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>✕ Dismiss</button>
              {onRetry && item.url && (
                <button onClick={() => onRetry(item.id, item.style)}
                  className="px-2.5 py-1 rounded border border-white/10 text-[9px] text-[rgba(240,237,232,0.4)] hover:text-white/70 transition-all uppercase tracking-wider"
                  style={{ fontFamily: "'DM Mono', monospace" }}>↻ Redo</button>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}
