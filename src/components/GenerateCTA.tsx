"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

const PROGRESS_STEPS = [
  "Analysing image…", "Analysing likeness…", "Implementing type…",
  "Adding artifacts…", "Refining details…", "Finalising portrait…",
];

const DRIFT_A = { duration: 7, repeat: Infinity, ease: "easeInOut" } as const;
const DRIFT_B = { duration: 9, repeat: Infinity, ease: "easeInOut" } as const;

interface PhraseRect { left: number; top: number; w: number; h: number }
interface GenerateCTAProps { onGenerate: () => void }

export default function GenerateCTA({ onGenerate }: GenerateCTAProps) {
  const { credits, isGenerating, totalSelected, promptEditEnabled, uploadedImages } = usePortraitStore();
  const p1 = useRef<HTMLSpanElement>(null);
  const p2 = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLParagraphElement>(null);
  const glow = useAnimationControls();
  const [progressIdx, setProgressIdx] = useState(0);

  const total = totalSelected();
  const creditCost = total + (promptEditEnabled ? 2 : 0);
  const hasRefs = uploadedImages.length >= 2;
  const hasTypes = total >= 1;
  const missingRefs = 2 - uploadedImages.length;

  let disabled = false, reason = "";
  if (!hasRefs) { disabled = true; reason = `${missingRefs} more reference image${missingRefs !== 1 ? "s" : ""} needed`; }
  else if (!hasTypes) { disabled = true; reason = "Choose portrait types from the panel"; }
  else if (credits < creditCost) { disabled = true; reason = "Insufficient credits"; }

  const busy = isGenerating || usePortraitStore.getState().portraits.some((p) => p.status !== "pending");
  const active = !busy && !isGenerating;
  const phrase = !hasRefs ? 0 : !hasTypes ? 1 : -1;

  // Progress flow
  useEffect(() => {
    if (!isGenerating) return;
    const t = setInterval(() => setProgressIdx((p) => (p + 1) % PROGRESS_STEPS.length), 1800);
    return () => clearInterval(t);
  }, [isGenerating]);

  // Measure phrase for glow
  const rect = (el: HTMLSpanElement | null, parent: HTMLElement): PhraseRect => {
    if (!el) return { left: 0, top: 0, w: 200, h: 40 };
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return { left: r.left - p.left, top: r.top - p.top, w: r.width, h: r.height };
  };

  useEffect(() => {
    const parent = box.current;
    if (!parent || phrase < 0) {
      glow.start({ opacity: 0, scale: 0.3, transition: { duration: 1.2 } });
      return;
    }
    const pos = phrase === 0 ? rect(p1.current, parent) : rect(p2.current, parent);
    glow.set({ left: pos.left - 40, top: pos.top - 30, width: pos.w + 80, height: pos.h + 60 });
    const drift = async () => {
      await glow.start({
        x: [0, 15, -10, 20, -14, 8, -6, 0], y: [0, -12, 8, -6, 14, -4, 10, 0],
        scale: [1, 1.06, 0.96, 1.04, 0.97, 1.03, 0.98, 1],
        opacity: [0.65, 0.8, 0.6, 0.75, 0.55, 0.7, 0.6, 0.65],
        transition: { ...DRIFT_A },
      });
    };
    drift();
  }, [phrase, glow]);

  // Re-measure on resize
  useEffect(() => {
    const fn = () => {
      const parent = box.current;
      if (!parent || phrase < 0) return;
      const pos = phrase === 0 ? rect(p1.current, parent) : rect(p2.current, parent);
      glow.set({ left: pos.left - 40, top: pos.top - 30, width: pos.w + 80, height: pos.h + 60 });
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [phrase, glow]);

  // Progress color
  const progressText = useRef<HTMLSpanElement>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex flex-col items-center gap-6 w-full">
      {/* Center text / progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center space-y-3">
        <p className="text-[10px] tracking-[0.35em] text-[rgba(200,185,154,0.3)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
          {isGenerating ? "✦ Generating ✦" : "✦ Your Series Awaits ✦"}
        </p>

        <p ref={box} className="relative text-3xl md:text-4xl leading-snug max-w-xl mx-auto text-[rgba(240,237,232,0.45)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontStyle: "italic" }}>
          {/* Mist cloud */}
          <motion.div animate={glow} className="absolute pointer-events-none z-0"
            style={{ background: `radial-gradient(ellipse at center, rgba(200,185,154,0.3) 0%, rgba(200,185,154,0.1) 35%, transparent 65%)`, filter: "blur(80px) saturate(1.3)", willChange: "transform, opacity" }} />
          <motion.div animate={phrase >= 0 ? { x: [0, -16, 10, -14, 8, -6, 0], y: [0, 12, -8, 6, -10, 14, 0], opacity: [0.35, 0.5, 0.3, 0.45, 0.3, 0.4, 0.35] } : { opacity: 0 }}
            transition={{ ...DRIFT_B }} className="absolute pointer-events-none z-0" style={{ background: `radial-gradient(ellipse at center, rgba(255,210,160,0.15) 0%, transparent 60%)`, filter: "blur(90px)", top: -30, left: -30, width: "120%", height: "140%" }} />

          {isGenerating ? (
            <span className="relative z-10 text-2xl md:text-3xl text-[rgba(200,185,154,0.7)]">
              <motion.span key={progressIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {PROGRESS_STEPS[progressIdx]}
              </motion.span>
            </span>
          ) : (
            <span className="relative z-10">
              <span ref={p1}>Upload or shoot your reference images</span>
              <span>, </span>
              <span ref={p2}>select portrait styles from the panel</span>
              <span>, and bring your vision to life.</span>
            </span>
          )}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.button onClick={onGenerate} disabled={disabled || isGenerating}
        whileHover={!disabled && !isGenerating && hasRefs && hasTypes ? { y: -2 } : {}}
        whileTap={!disabled && !isGenerating && hasRefs && hasTypes ? { scale: 0.98 } : {}}
        className={`relative w-full py-5 rounded-xl text-center transition-all duration-200 ${
          disabled || isGenerating ? "border border-white/5 opacity-40 cursor-not-allowed text-[rgba(240,237,232,0.3)]"
          : !hasRefs || !hasTypes ? "border border-[#C8B99A]/20 text-[rgba(200,185,154,0.5)] bg-[rgba(200,185,154,0.02)]"
          : `border border-[#C8B99A] cursor-pointer text-[#C8B99A] bg-[rgba(200,185,154,0.05)] ${hasRefs && hasTypes ? "gas-glow" : "pulse-glow"}`
        }`} style={{ fontFamily: "'DM Mono', monospace" }}>
        <span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
        <span className="text-base tracking-widest uppercase">
          {isGenerating ? "Generating..." : !hasRefs ? "Craft Your Portrait Series" : !hasTypes ? "Choose Portrait Types" : `Generate ${total} Portrait${total !== 1 ? "s" : ""}`}
        </span>
      </motion.button>

      <p className="text-xs text-[rgba(240,237,232,0.2)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        {reason || <>{creditCost} credit{creditCost !== 1 ? "s" : ""} · {credits} remaining{promptEditEnabled && " · ✦ Custom prompts"}</>}
      </p>
      {isGenerating && <p className="text-[9px] text-[rgba(240,237,232,0.12)] uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>This may take a minute or two</p>}
    </motion.div>
  );
}
