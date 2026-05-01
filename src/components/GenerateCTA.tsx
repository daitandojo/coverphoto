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

  let disabled = false;
  let reason = "";
  if (total < 1) { disabled = true; reason = "Select portrait types"; }
  else if (uploadedImages.length < 2) { disabled = true; reason = `${2 - uploadedImages.length} more image${2 - uploadedImages.length !== 1 ? "s" : ""} needed`; }
  else if (credits < creditCost) { disabled = true; reason = "Insufficient credits"; }

  const hasRunning = isGenerating || usePortraitStore.getState().portraits.some((p) => p.status !== "pending");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 w-full"
    >
      {/* Elegant center text when idle */}
      {!hasRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-3 mb-2"
        >
          <p className="text-[9px] tracking-[0.4em] text-[rgba(200,185,154,0.3)] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
            ✦ Build your series ✦
          </p>
          <p
            className="text-2xl md:text-3xl text-[rgba(240,237,232,0.12)] leading-tight max-w-sm"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400 }}
          >
            Select portraits from the panel, upload your references, and bring your vision to life.
          </p>
        </motion.div>
      )}

      {/* CTA Button */}
      <motion.button
        onClick={onGenerate}
        disabled={disabled || isGenerating}
        whileHover={!disabled && !isGenerating ? { y: -2 } : {}}
        whileTap={!disabled && !isGenerating ? { scale: 0.98 } : {}}
        className={`relative w-full py-5 rounded-xl text-center transition-all duration-200 ${
          disabled || isGenerating
            ? "border border-white/5 opacity-40 cursor-not-allowed text-[rgba(240,237,232,0.3)]"
            : "border border-[#C8B99A] pulse-glow cursor-pointer text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
        }`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <span className="gold-corner top-left" /><span className="gold-corner top-right" />
        <span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
        <span className="text-base tracking-widest uppercase">
          {isGenerating ? "Generating..." : total < 1 ? "Build Your Portrait Series" : `Generate ${total} Portrait${total !== 1 ? "s" : ""}`}
        </span>
      </motion.button>

      <p className="text-xs text-[rgba(240,237,232,0.25)] text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
        {reason || <>{creditCost} credit{creditCost !== 1 ? "s" : ""} · {credits} remaining{promptEditEnabled && " · ✦ Custom prompts"}</>}
      </p>
    </motion.div>
  );
}
