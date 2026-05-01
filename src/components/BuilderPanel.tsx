"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BRIEFS } from "@/lib/prompts";
import { usePortraitStore } from "@/lib/store";

export default function BuilderPanel() {
  const {
    typeCounters,
    incrementType,
    decrementType,
    totalSelected,
    promptEditEnabled,
    setPromptEditEnabled,
    customPrompts,
    setCustomPrompts,
  } = usePortraitStore();

  const total = totalSelected();

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
          Portrait Builder
        </span>
        <span className="text-xs text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>
          {total} selected
        </span>
      </div>

      {/* Scrollable counter rows */}
      <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0 pr-1">
        {BRIEFS.map((brief, i) => {
          const count = typeCounters[brief.id] || 0;
          const active = count > 0;
          return (
            <motion.div
              key={brief.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex items-center justify-between py-2 px-2 rounded-lg transition-all ${
                active ? "bg-[rgba(200,185,154,0.04)] border-l border-[#C8B99A]" : ""
              }`}
            >
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-xs text-[#C8B99A] truncate" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {brief.name}
                </p>
                <p className="text-[9px] text-[rgba(240,237,232,0.25)] truncate" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {brief.tagline}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <motion.button
                  onClick={() => decrementType(brief.id)}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 rounded-md border border-white/10 text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/30 hover:text-[#C8B99A] transition-all"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >−</motion.button>

                <span
                  className={`w-6 text-center text-sm font-medium tabular-nums ${
                    active ? "text-[#F0EDE8]" : "text-[rgba(240,237,232,0.2)]"
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {count}
                </span>

                <motion.button
                  onClick={() => incrementType(brief.id)}
                  whileTap={{ scale: 0.9 }}
                  className="w-6 h-6 rounded-md border border-white/10 text-xs text-[rgba(240,237,232,0.4)] hover:border-[#C8B99A]/30 hover:text-[#C8B99A] transition-all"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >+</motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total + prompt toggle */}
      <div className="flex-shrink-0 space-y-3 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[rgba(240,237,232,0.4)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            {total} portrait{total !== 1 ? "s" : ""} · {total} credit{total !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          onClick={() => setPromptEditEnabled(!promptEditEnabled)}
          className={`w-full py-2 rounded-lg border text-xs transition-all tracking-wider uppercase ${
            promptEditEnabled
              ? "border-[#C8B99A] text-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
              : "border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/70"
          }`}
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {promptEditEnabled ? "✦ Prompts editable (+2cr)" : "Customize prompts ✦"}
        </button>

        {/* Prompt textareas */}
        {promptEditEnabled && (
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {BRIEFS.filter((b) => (typeCounters[b.id] || 0) > 0).map((brief) => (
              <div key={brief.id}>
                <p className="text-[10px] text-[#C8B99A] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {brief.name}
                </p>
                <textarea
                  value={customPrompts[brief.id] || brief.prompt}
                  onChange={(e) => setCustomPrompts({ ...customPrompts, [brief.id]: e.target.value })}
                  rows={2}
                  className="w-full text-[10px] bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-2 text-[rgba(240,237,232,0.6)] focus:outline-none focus:border-[#C8B99A]/40 resize-none"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
