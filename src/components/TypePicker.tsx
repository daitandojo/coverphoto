"use client";

import { motion } from "framer-motion";
import { BRIEFS, TIERS } from "@/lib/prompts";
import { usePortraitStore } from "@/lib/store";

export default function TypePicker() {
  const {
    portraitCount,
    setPortraitCount,
    selectedTypes,
    toggleType,
    setSelectedTypes,
    showTypePicker,
  } = usePortraitStore();

  if (!showTypePicker) return null;

  const currentTier = TIERS.find((t) => t.count === portraitCount) || TIERS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* ===== TIER CARDS ===== */}
      <div className="grid grid-cols-4 gap-3">
        {TIERS.map((tier) => {
          const selected = tier.count === portraitCount;
          return (
            <motion.button
              key={tier.id}
              onClick={() => {
                setPortraitCount(tier.count);
                setSelectedTypes(selectedTypes.slice(0, tier.count));
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border text-center transition-all ${
                selected
                  ? "border-[#C8B99A] bg-[rgba(200,185,154,0.06)]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <span className="gold-corner top-left" />
              <span className="gold-corner top-right" />
              <span className="gold-corner bottom-left" />
              <span className="gold-corner bottom-right" />

              <p
                className="text-xs uppercase tracking-wider text-[#C8B99A]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {tier.label}
              </p>
              <p
                className="text-2xl text-[#F0EDE8] mt-1"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                {tier.count}
              </p>
              <p
                className="text-[10px] text-[rgba(240,237,232,0.3)] mt-1"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {tier.credits} credits · {tier.desc}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* ===== TYPE SELECTION GRID ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs text-[rgba(240,237,232,0.4)] uppercase tracking-widest"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Select {Math.min(portraitCount, 12)} of {BRIEFS.length} portrait types
          </p>
          <span
            className="text-xs text-[#C8B99A]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {selectedTypes.length} / {portraitCount > BRIEFS.length ? BRIEFS.length : portraitCount}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {BRIEFS.map((brief) => {
            const isSelected = selectedTypes.includes(brief.id);
            const atMax = selectedTypes.length >= portraitCount && !isSelected;
            return (
              <motion.button
                key={brief.id}
                onClick={() => toggleType(brief.id)}
                disabled={atMax}
                whileHover={!atMax ? { scale: 1.03 } : {}}
                whileTap={!atMax ? { scale: 0.97 } : {}}
                className={`relative p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-[#C8B99A] bg-[rgba(200,185,154,0.06)]"
                    : atMax
                      ? "border-white/5 opacity-30 cursor-not-allowed"
                      : "border-white/10 hover:border-white/20"
                }`}
              >
                {isSelected && (
                  <>
                    <span className="gold-corner top-left" />
                    <span className="gold-corner top-right" />
                    <span className="gold-corner bottom-left" />
                    <span className="gold-corner bottom-right" />
                  </>
                )}
                <p
                  className="text-xs text-[#C8B99A]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {brief.name}
                </p>
                <p
                  className="text-[10px] text-[rgba(240,237,232,0.3)] mt-0.5 leading-tight"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {brief.tagline}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
