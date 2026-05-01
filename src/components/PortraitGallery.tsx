"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import PortraitCard from "./PortraitCard";

interface PortraitGalleryProps {
  onRetry?: (style: string) => void;
}

export default function PortraitGallery({ onRetry }: PortraitGalleryProps) {
  const { portraits, totalSelected } = usePortraitStore();
  const count = totalSelected();
  const show = portraits.some((p) => p.status !== "pending");
  const [idx, setIdx] = useState(0);

  if (!show) return null;

  const completed = portraits.filter((p) => p.status === "completed");
  const errors = portraits.filter((p) => p.status === "error");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {/* Carousel */}
      {portraits.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          {/* Main card */}
          <div className="relative w-full max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <PortraitCard portrait={portraits[idx]} index={idx} large onRetry={onRetry} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setIdx((i) => (i - 1 + portraits.length) % portraits.length)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >‹</motion.button>

            <span className="text-xs text-[rgba(240,237,232,0.3)] tabular-nums" style={{ fontFamily: "'DM Mono', monospace" }}>
              {idx + 1} / {portraits.length}
            </span>

            <motion.button
              onClick={() => setIdx((i) => (i + 1) % portraits.length)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >›</motion.button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 justify-center">
            {portraits.map((p, i) => (
              <button key={p.id} onClick={() => setIdx(i)}
                className={`w-10 h-10 rounded-md overflow-hidden border transition-all ${i === idx ? "border-[#C8B99A] ring-1 ring-[#C8B99A]/30" : "border-white/10 opacity-60 hover:opacity-100"}`}>
                {p.url && p.status === "completed" ? (
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-[8px] text-[rgba(240,237,232,0.15)]">{p.status === "error" ? "✗" : "…"}</div>
                )}
              </button>
            ))}
          </div>

          {/* Summary */}
          {completed.length > 0 && (
            <p className="text-[10px] text-[rgba(240,237,232,0.15)] tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>
              {completed.length} of {portraits.length} complete
              {errors.length > 0 && ` · ${errors.length} failed`}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
