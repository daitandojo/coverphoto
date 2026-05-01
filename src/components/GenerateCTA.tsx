"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import { randomizePrompt } from "@/lib/prompts";

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
  const box = useRef<HTMLDivElement>(null);
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

  const rect = (el: HTMLSpanElement | null, parent: HTMLElement): PhraseRect => {
    if (!el) return { left: 0, top: 0, w: 200, h: 40 };
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return { left: r.left - p.left, top: r.top - p.top, w: r.width, h: r.height };
  };

  useEffect(() => {
    const parent = box.current;
    if (!parent || phrase < 0) { glow.start({ opacity: 0, scale: 0.3, transition: { duration: 1.2 } }); return; }
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

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="flex flex-col items-center gap-3 w-full">
      {/* Compact center instruction */}
      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center">
          <div ref={box} className="relative text-2xl md:text-3xl leading-snug max-w-lg mx-auto text-[rgba(240,237,232,0.45)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            <motion.div animate={glow} className="absolute pointer-events-none z-0"
              style={{ background: `radial-gradient(ellipse at center, rgba(200,185,154,0.25) 0%, transparent 60%)`, filter: "blur(70px)", willChange: "transform, opacity" }} />
            <span className="relative z-10">
              <span ref={p1}>Upload or shoot your reference images</span>
              <span>, </span>
              <span ref={p2}>select portrait styles from the panel</span>
              <span>, and bring your vision to life.</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* CTA Button with progress inside */}
      <motion.button onClick={onGenerate} disabled={disabled || isGenerating}
        className={`relative w-full max-w-sm py-4 rounded-xl text-center transition-all duration-200 ${
          disabled || isGenerating
            ? "border border-white/5 opacity-40 cursor-not-allowed text-[rgba(240,237,232,0.3)]"
            : !hasRefs || !hasTypes
              ? "border border-[#C8B99A]/20 text-[rgba(200,185,154,0.5)] bg-[rgba(200,185,154,0.02)]"
              : `border border-[#C8B99A] cursor-pointer text-[#C8B99A] bg-[rgba(200,185,154,0.05)] ${hasRefs && hasTypes ? "gas-glow" : "pulse-glow"}`
        }`} style={{ fontFamily: "'DM Mono', monospace" }}>
        <span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
        <span className="text-sm tracking-widest uppercase">
          {isGenerating ? PROGRESS_STEPS[progressIdx] : !hasRefs ? "Craft Your Portrait Series" : !hasTypes ? "Choose Portrait Types" : `Generate ${total} Portrait${total !== 1 ? "s" : ""}`}
        </span>
      </motion.button>

      <p className="text-[10px] text-[rgba(240,237,232,0.2)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        {reason || <>{creditCost} credit{creditCost !== 1 ? "s" : ""} · {credits} remaining{promptEditEnabled && " · ✦ Custom edits"}</>}
      </p>
    </motion.div>
  );
}
