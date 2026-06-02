"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    title: "Upload Your Photos",
    body: "Tap Photos below to upload 2-3 reference photos of yourself. The more variety, the better the portraits.",
    icon: "📷",
  },
  {
    title: "Pick Your Styles",
    body: "Choose from 10 professional portrait styles and specialties. Select 1 or more — each generates a unique portrait.",
    icon: "✦",
  },
  {
    title: "Review & Save",
    body: "Your portraits appear instantly. Tap ✓ Keep to save your favourites to your library, or ✕ Skip to try different styles.",
    icon: "✨",
  },
];

interface FirstRunTourProps {
  open: boolean;
  onComplete: () => void;
}

export default function FirstRunTour({ open, onComplete }: FirstRunTourProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-[rgba(8,8,8,0.85)] backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-sm w-full"
          >
            <div className="bg-[rgba(16,16,16,0.98)] border border-[rgba(200,185,154,0.15)] rounded-2xl p-6 md:p-8 space-y-5">
              {/* Step counter */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px] tracking-[0.3em] text-[rgba(240,237,232,0.2)] uppercase"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Step {step + 1} of {STEPS.length}
                </span>
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === step
                          ? "bg-[#C8B99A] w-4"
                          : i < step
                          ? "bg-[rgba(200,185,154,0.3)]"
                          : "bg-[rgba(255,255,255,0.08)]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl border border-[rgba(200,185,154,0.2)] bg-[rgba(200,185,154,0.06)] flex items-center justify-center text-2xl mx-auto">
                {current.icon}
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <h2
                  className="text-lg text-[#F0EDE8] tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                >
                  {current.title}
                </h2>
                <p
                  className="text-xs text-[rgba(240,237,232,0.5)] leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {current.body}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-[rgba(240,237,232,0.4)] hover:text-white/70 transition-all"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    ← Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="flex-1 py-2 rounded-xl border border-[#C8B99A]/40 text-xs text-[#C8B99A] bg-[rgba(200,185,154,0.06)] hover:bg-[rgba(200,185,154,0.1)] transition-all"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={onComplete}
                    className="flex-1 py-2 rounded-xl border border-[#C8B99A]/40 text-xs text-[#C8B99A] bg-[rgba(200,185,154,0.06)] hover:bg-[rgba(200,185,154,0.1)] transition-all golden-glow"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    ✦ Get Started
                  </button>
                )}
              </div>

              {/* Skip link */}
              <div className="text-center">
                <button
                  onClick={onComplete}
                  className="text-[9px] text-[rgba(240,237,232,0.15)] hover:text-white/40 transition-all underline underline-offset-2"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Skip tutorial
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
