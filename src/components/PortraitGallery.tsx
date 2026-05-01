"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import { BRIEFS } from "@/lib/prompts";
import { SPECIALTIES } from "@/lib/specialties";
import PortraitCard from "./PortraitCard";

interface PortraitGalleryProps {
  onRetry?: (style: string) => void;
  onGeneratePending?: (style: string) => void;
}

export default function PortraitGallery({ onRetry, onGeneratePending }: PortraitGalleryProps) {
  const { portraits, totalSelected } = usePortraitStore();
  const show = portraits.some((p) => p.status !== "pending");
  const [idx, setIdx] = useState(0);

  if (!show) return null;

  const completed = portraits.filter((p) => p.status === "completed");
  const pending = portraits.filter((p) => p.status === "pending");
  const errors = portraits.filter((p) => p.status === "error");

  const getName = (style: string) => {
    const b = BRIEFS.find((s) => s.id === style);
    if (b) return b.name;
    const s = SPECIALTIES.find((sp) => sp.id === style);
    return s?.name || style;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full">
      {portraits.length > 0 && (
        <div className="flex flex-col items-center gap-3">
          {/* Current card */}
          <div className="relative w-full max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }} transition={{ duration: 0.35, ease: "easeOut" }}>
                {portraits[idx]?.status === "pending" ? (
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4] min-h-[280px] bg-[rgba(255,255,255,0.02)] border border-white/10 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <p className="text-xs text-[rgba(200,185,154,0.5)] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {getName(portraits[idx]?.style || "")}
                    </p>
                    <p className="text-[10px] text-[rgba(240,237,232,0.2)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      To be generated
                    </p>
                    <motion.button
                      onClick={() => onGeneratePending?.(portraits[idx].style)}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 rounded-lg border border-[#C8B99A]/30 text-[10px] text-[#C8B99A]"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      Generate
                    </motion.button>
                  </div>
                ) : (
                  <PortraitCard portrait={portraits[idx]} index={idx} large onRetry={onRetry} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIdx((i) => (i - 1 + portraits.length) % portraits.length)}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}>‹</button>
            <span className="text-xs text-[rgba(240,237,232,0.3)] tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
              {idx + 1} / {portraits.length}
            </span>
            <button onClick={() => setIdx((i) => (i + 1) % portraits.length)}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}>›</button>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {portraits.map((p, i) => (
              <button key={p.id} onClick={() => setIdx(i)}
                className={`w-8 h-8 rounded-md overflow-hidden border transition-all ${i === idx ? "border-[#C8B99A] ring-1 ring-[#C8B99A]/30" : "border-white/10 opacity-60 hover:opacity-100"}`}>
                {p.url && p.status === "completed" ? (
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-[7px] ${p.status === "pending" ? "bg-[rgba(200,185,154,0.08)]" : "bg-[rgba(255,255,255,0.03)]"}`}>
                    <span className="text-[rgba(240,237,232,0.15)]">{p.status === "error" ? "✗" : "…"}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {completed.length > 0 && (
            <p className="text-[10px] text-[rgba(240,237,232,0.15)] tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
              {completed.length} of {portraits.length} complete{errors.length > 0 && ` · ${errors.length} failed`}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
