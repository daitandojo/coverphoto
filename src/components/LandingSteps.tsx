"use client";

import { motion } from "framer-motion";

const STEPS = [
  { num: "1", label: "Upload your photos" },
  { num: "2", label: "Choose portrait styles" },
  { num: "3", label: "Receive your portraits" },
];

export default function LandingSteps() {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 * i }}
            className="flex items-center gap-1.5 md:gap-2"
          >
            <span className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-[#C8B99A]/40 flex items-center justify-center text-[9px] md:text-[10px] text-[#C8B99A] font-medium"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {step.num}
            </span>
            <span className="text-[8px] md:text-[9px] text-[rgba(240,237,232,0.25)] uppercase tracking-wider"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {step.label}
            </span>
          </motion.div>
          {i < STEPS.length - 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 * i }}
              className="w-6 md:w-8 h-px bg-[rgba(200,185,154,0.15)]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
