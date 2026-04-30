"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRIEFS, TIERS } from "@/lib/prompts";
import { usePortraitStore } from "@/lib/store";

interface PortraitConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PortraitConfigModal({ open, onClose }: PortraitConfigModalProps) {
  const {
    portraitCount,
    setPortraitCount,
    selectedTypes,
    toggleType,
    setSelectedTypes,
    promptEditEnabled,
    setPromptEditEnabled,
    customPrompts,
    setCustomPrompts,
  } = usePortraitStore();

  const selectedBriefs = useMemo(
    () => selectedTypes.map((id) => BRIEFS.find((b) => b.id === id)).filter(Boolean),
    [selectedTypes]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl text-[#F0EDE8]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                Portrait Configuration
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors text-sm"
              >
                ×
              </button>
            </div>

            {/* Tier cards */}
            <div className="grid grid-cols-4 gap-2 mb-6">
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
                    className={`relative p-3 rounded-xl border text-center transition-all ${
                      selected
                        ? "border-[#C8B99A] bg-[rgba(200,185,154,0.06)]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {selected && <><span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" /></>}
                    <p className="text-xs uppercase tracking-wider text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>{tier.label}</p>
                    <p className="text-2xl text-[#F0EDE8] mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>{tier.count}</p>
                    <p className="text-[10px] text-[rgba(240,237,232,0.3)] mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>{tier.credits}cr · {tier.desc}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Type grid */}
            <p className="text-xs text-[rgba(240,237,232,0.4)] uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Select {Math.min(portraitCount, BRIEFS.length)} of {BRIEFS.length} types
              <span className="ml-2 text-[#C8B99A]">({selectedTypes.length})</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
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
                        : atMax ? "border-white/5 opacity-30 cursor-not-allowed" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {isSelected && <><span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" /></>}
                    <p className="text-xs text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.name}</p>
                    <p className="text-[10px] text-[rgba(240,237,232,0.3)] mt-0.5 leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.tagline}</p>
                  </motion.button>
                );
              })}
            </div>

            {/* Prompt editor toggle */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <button
                onClick={() => setPromptEditEnabled(!promptEditEnabled)}
                className={`px-4 py-2 rounded-lg border text-xs transition-all tracking-wider uppercase ${
                  promptEditEnabled
                    ? "border-[#C8B99A] text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
                    : "border-white/10 text-[rgba(240,237,232,0.4)] hover:text-white/70"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {promptEditEnabled ? "✦ Prompts editable (+2cr)" : "Customize prompts ✦ (+2cr)"}
              </button>
              <span className="text-[10px] text-[rgba(240,237,232,0.2)]" style={{ fontFamily: "'DM Mono', monospace" }}>
                {promptEditEnabled ? `${selectedTypes.length} prompts visible` : "Edit the photographer briefs"}
              </span>
            </div>

            {/* Prompt textareas */}
            {promptEditEnabled && selectedBriefs.map((brief) => (
              <motion.div
                key={brief!.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-3"
              >
                <p className="text-xs text-[#C8B99A] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {brief!.name} — {brief!.tagline}
                </p>
                <textarea
                  value={customPrompts[brief!.id] || brief!.prompt}
                  onChange={(e) => setCustomPrompts({ ...customPrompts, [brief!.id]: e.target.value })}
                  rows={3}
                  className="w-full text-xs bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-2.5 text-[rgba(240,237,232,0.7)] focus:outline-none focus:border-[#C8B99A]/40 resize-none"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </motion.div>
            ))}

            {/* Confirm button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full py-3 rounded-xl border border-[#C8B99A] text-sm text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Confirm · {portraitCount} portrait{portraitCount > 1 ? "s" : ""} ({portraitCount + (promptEditEnabled ? 2 : 0)} credits)
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
