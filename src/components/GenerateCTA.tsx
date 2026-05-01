"use client";

import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

interface GenerateCTAProps {
  onGenerate: () => void;
}

export default function GenerateCTA({ onGenerate }: GenerateCTAProps) {
  const { uploadedImages, credits, isGenerating, portraitCount, selectedTypes, promptEditEnabled } =
    usePortraitStore();

  const creditCost = portraitCount + (promptEditEnabled ? 2 : 0);
  const missingImages = 2 - uploadedImages.length;
  const canGenerate = uploadedImages.length >= 2 && credits >= creditCost && !isGenerating && selectedTypes.length > 0;

  let disabledReason = "";
  if (uploadedImages.length < 2) {
    disabledReason = `${missingImages} more image${missingImages > 1 ? "s" : ""} needed`;
  } else if (credits < creditCost) {
    disabledReason = "Insufficient credits";
  } else if (selectedTypes.length === 0) {
    disabledReason = "Select a portrait type";
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.button
        onClick={onGenerate}
        disabled={!canGenerate}
        whileHover={canGenerate ? { y: -2 } : {}}
        whileTap={canGenerate ? { scale: 0.98 } : {}}
        className={`relative w-full max-w-md py-4 rounded-xl text-center transition-all duration-200 ${
          canGenerate
            ? "border border-[#C8B99A] pulse-glow cursor-pointer text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
            : "border border-white/5 opacity-40 cursor-not-allowed text-[rgba(240,237,232,0.3)]"
        }`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <span className="gold-corner top-left" />
        <span className="gold-corner top-right" />
        <span className="gold-corner bottom-left" />
        <span className="gold-corner bottom-right" />

        <span className="text-sm tracking-widest uppercase">
          {isGenerating
            ? "Generating..."
            : `Generate ${portraitCount} Portrait${portraitCount > 1 ? "s" : ""}`}
        </span>
      </motion.button>

      <p className="text-xs text-[rgba(240,237,232,0.3)]" style={{ fontFamily: "'DM Mono', monospace" }}>
        {disabledReason || (
          <>{creditCost} credit{creditCost > 1 ? "s" : ""} · {credits} remaining{promptEditEnabled && " · ✦ Custom prompts"}</>
        )}
      </p>
    </motion.section>
  );
}
