"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import { BRIEFS } from "@/lib/prompts";
import { SPECIALTIES } from "@/lib/specialties";
import { useSession } from "next-auth/react";

interface CarouselProps {
  items: any[];
  idx: number;
  setIdx: (i: number) => void;
  label: string;
  emptyLabel: string;
  renderActions: (item: any, idx: number) => React.ReactNode;
  hasOrder: boolean;
  onOrder?: (item: any) => void;
}

function Carousel({ items, idx, setIdx, label, emptyLabel, renderActions, hasOrder, onOrder }: CarouselProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-xl min-h-[360px]">
        <p className="text-xs text-[rgba(240,237,232,0.15)] italic" style={{ fontFamily: "'DM Mono', monospace" }}>{emptyLabel}</p>
      </div>
    );
  }

  const item = items[idx];
  const showArrows = items.length > 1;

  const getName = (style: string) => {
    const b = BRIEFS.find((s) => s.id === style);
    if (b) return b.name;
    const s = SPECIALTIES.find((sp) => sp.id === style);
    return s?.name || style;
  };

  const isReady = item.url && (item.status === "completed" || item.status === "error");

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <p className="text-[9px] tracking-[0.3em] text-[rgba(200,185,154,0.2)] uppercase mb-2 pt-1 text-center" style={{ fontFamily: "'DM Mono', monospace" }}>{label} <span className="text-[rgba(240,237,232,0.15)]">({items.length})</span></p>

      <div className="relative flex-1 flex items-center min-h-0">
        <div className="relative w-full h-full max-h-full flex items-center">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="w-full h-full">
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] min-h-[360px] w-full bg-[rgba(255,255,255,0.02)] border border-white/5">
                {item.status === "generating" || !item.url ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center shimmer-fast">
                    <p className="text-xs text-[rgba(200,185,154,0.5)]" style={{ fontFamily: "'DM Mono', monospace" }}>{getName(item.style)}</p>
                    <p className="text-[10px] text-[rgba(240,237,232,0.2)] mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>Generating…</p>
                  </div>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}

                {showArrows && (
                  <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + items.length) % items.length); }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all z-10">‹</button>
                )}
                {showArrows && (
                  <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % items.length); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all z-10">›</button>
                )}
                {showArrows && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-[9px] text-white/50 tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {idx + 1}/{items.length}
                  </div>
                )}

                {isReady && (
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-center justify-center gap-2">
                    {renderActions(item, idx)}
                    {hasOrder && onOrder && (
                      <button onClick={() => onOrder(item)}
                        className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-white/15 text-[10px] text-white/80 hover:bg-white/10 transition-all uppercase tracking-wider"
                        style={{ fontFamily: "'DM Mono', monospace" }}>📬 Order</button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function PortraitCarousel({ onOrder }: { onOrder?: (item: any) => void }) {
  const { libraryPortraits, workbenchPortraits, libIdx, wbIdx, setLibIdx, setWbIdx, moveToLibrary, dismissFromWorkbench, deleteFromLibrary } = usePortraitStore();
  const { data: session } = useSession();
  const userName = session?.user?.name?.replace(/[^a-zA-Z0-9\-_ ]/g, "").trim() || "CoverPhoto";

  const handleDownload = useCallback(async (url: string, style: string, idx: number) => {
    if (!url) return;
    const styleName = (BRIEFS.find((b) => b.id === style)?.name || SPECIALTIES.find((s) => s.id === style)?.name || style).replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${userName}_${styleName}_${idx + 1}.jpg`;
    try {
      const r = await fetch(url);
      const b = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = filename;
      a.click();
    } catch { window.open(url, "_blank"); }
  }, [userName]);

  return (
    <div className="flex gap-5 h-full w-full min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <Carousel
          items={libraryPortraits}
          idx={libIdx}
          setIdx={setLibIdx}
          label="Library"
          emptyLabel="No saved portraits yet"
          hasOrder={true}
          onOrder={onOrder}
          renderActions={(item, idx) => (
            <div className="flex gap-2">
              <button onClick={() => handleDownload(item.url, item.style, idx)}
                className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-white/15 text-[10px] text-white/80 hover:bg-white/10 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>↓ Save</button>
              <button onClick={() => deleteFromLibrary(item.id)}
                className="px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm border border-red-400/30 text-[10px] text-red-300/80 hover:bg-red-900/20 transition-all uppercase tracking-wider"
                style={{ fontFamily: "'DM Mono', monospace" }}>🗑 Delete</button>
            </div>
          )}
        />
      </div>

      <div className="w-px bg-white/5 flex-shrink-0" />

      <div className="flex-1 flex flex-col min-w-0">
        <Carousel
          items={workbenchPortraits}
          idx={wbIdx}
          setIdx={setWbIdx}
          label="Workbench"
          emptyLabel="Generate portraits in the builder"
          hasOrder={false}
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
