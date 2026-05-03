"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonViewProps {
  open: boolean;
  onClose: () => void;
  portraitUrl: string;
  referenceUrls: string[];
}

export default function ComparisonView({ open, onClose, portraitUrl, referenceUrls }: ComparisonViewProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  const refUrl = referenceUrls[0] || portraitUrl;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#080808] rounded-2xl p-4 w-full max-w-lg mx-auto"
          >
            <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 z-10 text-sm">×</button>

            <p className="text-[10px] tracking-[0.3em] text-[rgba(200,185,154,0.3)] uppercase mb-3 text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
              Drag to compare · Reference vs Result
            </p>

            {/* Comparison slider */}
            <div ref={containerRef} className="relative w-full aspect-[3/4] max-h-[65vh] rounded-lg overflow-hidden select-none cursor-ew-resize"
              onMouseMove={(e) => handleMove(e.clientX)}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            >
              {/* Reference (left side = visible, right side = clipped) */}
              <div className="absolute inset-0">
                <img src={refUrl} alt="Reference" className="w-full h-full object-cover" />
              </div>

              {/* Result (right side = visible, left side = clipped) */}
              <div className="absolute inset-0" style={{ width: `${sliderPos}%`, overflow: "hidden" }}>
                <img src={portraitUrl} alt="Result" className="w-full h-full object-cover" />
              </div>

              {/* Slider line */}
              <div className="absolute top-0 bottom-0" style={{ left: `${sliderPos}%`, width: "3px" }}>
                <div className="w-full h-full bg-white/80 shadow-lg" />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-black text-sm font-bold left-0">⋮</div>
              </div>

              {/* Labels */}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-[9px] text-white/70" style={{ fontFamily: "'DM Mono', monospace" }}>Reference</div>
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-[#C8B99A]/20 backdrop-blur-sm text-[9px] text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>Generated</div>
            </div>

            {/* Screenshot hint */}
            <p className="text-[9px] text-[rgba(240,237,232,0.15)] mt-3 text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
              Drag the slider to compare · Screenshot this to share
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
