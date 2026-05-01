"use client";

import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

interface GenerateCTAProps {
  onGenerate: () => void;
}

export default function GenerateCTA({ onGenerate }: GenerateCTAProps) {
  const { credits, isGenerating, totalSelected, promptEditEnabled, uploadedImages } = usePortraitStore();

  const total = totalSelected();
  const creditCost = total + (promptEditEnabled ? 2 : 0);
  const hasRefs = uploadedImages.length >= 2;
  const hasTypes = total >= 1;
  const missingRefs = 2 - uploadedImages.length;

  let disabled = false;
  let reason = "";
  if (!hasRefs) { disabled = true; reason = `${missingRefs} more reference image${missingRefs !== 1 ? "s" : ""} needed`; }
  else if (!hasTypes) { disabled = true; reason = "Select portrait types from the panel"; }
  else if (credits < creditCost) { disabled = true; reason = "Insufficient credits"; }

  const hasRunning = isGenerating || usePortraitStore.getState().portraits.some((p) => p.status !== "pending");
  const idle = !hasRunning && !isGenerating;

  // Which phrase hosts the golden glow — animated via motion + layout
  const glowIdx = !hasRefs ? 0 : !hasTypes ? 1 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 w-full"
    >
      {/* Center text */}
      {idle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <p className="text-[10px] tracking-[0.35em] text-[rgba(200,185,154,0.3)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Your Series Awaits ✦</p>

          <p className="text-2xl md:text-3xl leading-snug max-w-lg relative" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400 }}>
            {/* Phrase 1 */}
            <motion.span
              layout
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className={`relative inline ${glowIdx === 0 ? "golden-glow text-[#C8B99A]" : glowIdx === -1 ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.35)]"}`}
            >
              Upload or shoot your reference images
            </motion.span>
            <span className="text-[rgba(240,237,232,0.2)]">, </span>

            {/* Phrase 2 */}
            <motion.span
              layout
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className={`relative inline ${glowIdx === 1 ? "golden-glow text-[#C8B99A]" : "text-[rgba(240,237,232,0.35)]"}`}
            >
              select portrait styles from the panel
            </motion.span>
            <span className="text-[rgba(240,237,232,0.2)]">, and bring your vision to life.</span>
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
