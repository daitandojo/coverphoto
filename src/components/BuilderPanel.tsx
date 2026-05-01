"use client";

import { motion } from "framer-motion";
import { BRIEFS } from "@/lib/prompts";
import { usePortraitStore } from "@/lib/store";

export default function BuilderPanel() {
  const { typeCounters, incrementType, decrementType, totalSelected, promptEditEnabled, setPromptEditEnabled, customPrompts, setCustomPrompts } = usePortraitStore();
  const total = totalSelected();

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex-shrink-0">
        <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Portrait Builder</span>
        <p className="text-xs text-[#C8B99A] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{total} portrait{total !== 1 ? "s" : ""} chosen</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 gap-1">
          {BRIEFS.map((brief, i) => {
            const count = typeCounters[brief.id] || 0;
            const active = count > 0;
            return (
              <motion.div
                key={brief.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.015 }}
                whileHover={{ scale: 1.015 }}
                className={`relative rounded-lg border transition-all cursor-pointer ${
                  active
                    ? "border-[#C8B99A] bg-[rgba(200,185,154,0.06)]"
                    : "border-white/10 hover:border-white/25 bg-transparent"
                }`}
                onClick={() => (active ? decrementType(brief.id) : incrementType(brief.id))}
              >
                {active && <><span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" /></>}
                <div className="flex items-center justify-between p-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm text-[#C8B99A] leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.name}</p>
                    <p className="text-[10px] text-[rgba(240,237,232,0.25)] leading-tight mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); decrementType(brief.id); }}
                      whileTap={{ scale: 0.85 }}
                      className={`w-7 h-7 rounded-md border text-xs transition-all ${
                        active
                          ? "border-white/15 text-[rgba(240,237,232,0.5)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A]"
                          : "border-white/5 text-[rgba(240,237,232,0.15)] cursor-default"
                      }`}
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >−</motion.button>
                    <span className={`w-5 text-center text-sm tabular-nums ${active ? "text-[#F0EDE8]" : "text-[rgba(240,237,232,0.15)]"}`} style={{ fontFamily: "'DM Mono', monospace" }}>{count}</span>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); incrementType(brief.id); }}
                      whileTap={{ scale: 0.85 }}
                      className="w-7 h-7 rounded-md border border-white/15 text-xs text-[rgba(240,237,232,0.6)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >+</motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[rgba(240,237,232,0.4)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            {total} portrait{total !== 1 ? "s" : ""} · {total} credit{total !== 1 ? "s" : ""}
          </span>
          <button onClick={() => setPromptEditEnabled(!promptEditEnabled)}
            className={`text-[10px] px-2 py-1 rounded border transition-all uppercase tracking-wider ${promptEditEnabled ? "border-[#C8B99A] text-[#C8B99A]" : "border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/70"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>{promptEditEnabled ? "✦ On" : "✦ Prompts"}
          </button>
        </div>
        {promptEditEnabled && (
          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {BRIEFS.filter((b) => (typeCounters[b.id] || 0) > 0).map((brief) => (
              <div key={brief.id}>
                <p className="text-[9px] text-[rgba(200,185,154,0.6)] mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.name}</p>
                <textarea value={customPrompts[brief.id] || brief.prompt} onChange={(e) => setCustomPrompts({ ...customPrompts, [brief.id]: e.target.value })} rows={2}
                  className="w-full text-[9px] bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-1.5 text-[rgba(240,237,232,0.5)] focus:outline-none focus:border-[#C8B99A]/40 resize-none"
                  style={{ fontFamily: "'DM Mono', monospace" }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
