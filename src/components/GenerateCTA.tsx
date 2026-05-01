"use client";

import { useRef, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

const DRIFT_A = { duration: 7, repeat: Infinity, ease: "easeInOut" } as const;
const DRIFT_B = { duration: 9, repeat: Infinity, ease: "easeInOut" } as const;

interface PhraseRect { left: number; top: number; w: number; h: number }

interface GenerateCTAProps {
  onGenerate: () => void;
}

export default function GenerateCTA({ onGenerate }: GenerateCTAProps) {
  const { credits, isGenerating, totalSelected, promptEditEnabled, uploadedImages } = usePortraitStore();
  const p1 = useRef<HTMLSpanElement>(null);
  const p2 = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLParagraphElement>(null);
  const glow = useAnimationControls();

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

  // Measure a phrase rect relative to the container
  const rect = (el: HTMLSpanElement | null, parent: HTMLElement): PhraseRect => {
    if (!el) return { left: 0, top: 0, w: 200, h: 40 };
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    return { left: r.left - p.left, top: r.top - p.top, w: r.width, h: r.height };
  };

  // Animate glow position + start drift when phrase changes
  useEffect(() => {
    const parent = box.current;
    if (!parent || phrase < 0) {
      glow.start({ opacity: 0, scale: 0.4, transition: { duration: 1 } });
      return;
    }
    const pos = phrase === 0 ? rect(p1.current, parent) : rect(p2.current, parent);

    // Step 1: move glow to the phrase
    glow.start({
      left: pos.left - 50, top: pos.top - 40,
      width: pos.w + 100, height: pos.h + 80,
      opacity: 0.95, scale: 1,
      transition: { duration: 0.9, ease: "easeInOut" },
    });

    // Step 2: begin irregular smoke drift
    const drift = async () => {
      await glow.start({
        x: [0, 18, -12, 24, -16, 6, -8, 0],
        y: [0, -14, 10, -8, 18, -6, 12, 0],
        scale: [1, 1.1, 0.94, 1.07, 0.96, 1.05, 0.98, 1],
        opacity: [0.95, 1, 0.85, 0.95, 0.8, 0.9, 0.85, 0.95],
        transition: { ...DRIFT_A },
      });
    };
    drift();
  }, [phrase, glow]);

  // Re-measure on resize
  useEffect(() => {
    const onResize = () => {
      const parent = box.current;
      if (!parent || phrase < 0) return;
      const pos = phrase === 0 ? rect(p1.current, parent) : rect(p2.current, parent);
      glow.set({
        left: pos.left - 50, top: pos.top - 40,
        width: pos.w + 100, height: pos.h + 80,
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phrase, glow]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 w-full"
    >
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <p className="text-[10px] tracking-[0.35em] text-[rgba(200,185,154,0.3)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Your Series Awaits ✦</p>

          <p ref={box} className="relative text-2xl md:text-3xl leading-snug max-w-lg mx-auto text-[rgba(240,237,232,0.45)]" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400 }}>
            {/* Main smoke orb */}
            <motion.div
              animate={glow}
              className="absolute pointer-events-none z-0"
              style={{
                background: `radial-gradient(ellipse at center, rgba(200,185,154,0.55) 0%, rgba(200,185,154,0.2) 35%, transparent 70%)`,
                filter: "blur(70px) saturate(1.5)",
                willChange: "transform, opacity",
              }}
            />
            {/* Secondary warm orb */}
            <motion.div
              animate={
                phrase >= 0
                  ? {
                      x: [0, -20, 14, -18, 10, -8, 0],
                      y: [0, 16, -12, 10, -8, 14, 0],
                      opacity: [0.45, 0.65, 0.4, 0.6, 0.35, 0.5, 0.45],
                    }
                  : { opacity: 0 }
              }
              transition={{ ...DRIFT_B }}
              className="absolute pointer-events-none z-0"
              style={{
                background: `radial-gradient(ellipse at center, rgba(255,210,160,0.25) 0%, transparent 65%)`,
                filter: "blur(80px)",
                top: -30, left: -30, width: "120%", height: "140%",
              }}
            />

            {/* Text — all uniform */}
            <span className="relative z-10">
              <span ref={p1}>Upload or shoot your reference images</span>
              <span>, </span>
              <span ref={p2}>select portrait styles from the panel</span>
              <span>, and bring your vision to life.</span>
            </span>
          </p>
        </motion.div>
      )}

      {/* CTA Button */}
      <motion.button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        whileHover={!disabled && !isGenerating && hasRefs && hasTypes ? { y: -2 } : {}}
        whileTap={!disabled && !isGenerating && hasRefs && hasTypes ? { scale: 0.98 } : {}}
        className={`relative w-full py-5 rounded-xl text-center transition-all duration-200 ${
          disabled || isGenerating
            ? "border border-white/5 opacity-40 cursor-not-allowed text-[rgba(240,237,232,0.3)]"
            : !hasRefs || !hasTypes
              ? "border border-[#C8B99A]/20 text-[rgba(200,185,154,0.5)] bg-[rgba(200,185,154,0.02)]"
              : `border border-[#C8B99A] cursor-pointer text-[#C8B99A] bg-[rgba(200,185,154,0.05)] ${hasRefs && hasTypes ? "gas-glow" : "pulse-glow"}`
        }`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <span className="gold-corner top-left" /><span className="gold-corner top-right" />
        <span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
        <span className="text-base tracking-widest uppercase">
          {isGenerating ? "Generating..." : !hasRefs ? "Craft Your Portrait Series" : !hasTypes ? "Choose Portrait Types" : `Generate ${total} Portrait${total !== 1 ? "s" : ""}`}
        </span>
      </motion.button>

      <p className="text-xs text-[rgba(240,237,232,0.2)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        {reason || <>{creditCost} credit{creditCost !== 1 ? "s" : ""} · {credits} remaining{promptEditEnabled && " · ✦ Custom prompts"}</>}
      </p>
    </motion.div>
  );
}
