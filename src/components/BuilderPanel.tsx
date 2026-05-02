"use client";

import { motion } from "framer-motion";
import { BRIEFS } from "@/lib/prompts";
import { SPECIALTIES } from "@/lib/specialties";
import { usePortraitStore } from "@/lib/store";

interface BuilderPanelProps {
  onGenerate: () => void;
  canGenerate: boolean;
  reason: string;
}

export default function BuilderPanel({ onGenerate, canGenerate, reason }: BuilderPanelProps) {
  const {
    typeCounters, incrementType, decrementType,
    specialCounters, incrementSpecial, decrementSpecial, specialFields, setSpecialField,
    totalSelected, promptEditEnabled, setPromptEditEnabled, customPrompts, setCustomPrompts, credits,
    constraints, toggleConstraint,
  } = usePortraitStore();
  const total = totalSelected();
  const hasTypes = Object.values(typeCounters).some((v) => v > 0);
  const creditCost = total + (promptEditEnabled ? 2 : 0);

  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex-shrink-0">
        <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Portrait Builder</span>
        <p className="text-xs text-[#C8B99A] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{total} portrait{total !== 1 ? "s" : ""} to generate</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* Standard types */}
        <div>
          <p className="text-[9px] tracking-[0.25em] text-[rgba(240,237,232,0.2)] uppercase mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Standards</p>
          <div className="grid grid-cols-2 gap-1">
            {BRIEFS.map((brief, i) => {
              const count = typeCounters[brief.id] || 0;
              const active = count > 0;
              return (
                <motion.div key={brief.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.008 }}
                  whileHover={{ scale: 1.012 }}
                  className={`relative rounded-lg border transition-all cursor-pointer ${active ? "border-[#C8B99A] bg-[rgba(200,185,154,0.06)]" : "border-white/10 hover:border-white/25"}`}
                  onClick={() => (active ? decrementType(brief.id) : incrementType(brief.id))}
                >
                  {active && <><span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" /></>}
                  <div className="flex items-center justify-between p-1.5">
                    <div className="flex-1 min-w-0 mr-1.5">
                      <p className="text-xs text-[#C8B99A] leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.name}</p>
                      <p className="text-[9px] text-[rgba(240,237,232,0.25)] leading-tight mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{brief.tagline}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <motion.button onClick={(e) => { e.stopPropagation(); decrementType(brief.id); }} whileTap={{ scale: 0.85 }}
                        className={`w-6 h-6 rounded-md border text-xs transition-all ${active ? "border-white/15 text-[rgba(240,237,232,0.5)] hover:border-[#C8B99A]/40" : "border-white/5 text-[rgba(240,237,232,0.15)]"}`} style={{ fontFamily: "'DM Mono', monospace" }}>−</motion.button>
                      <span className={`w-5 text-center text-sm tabular-nums ${active ? "text-[#F0EDE8]" : "text-[rgba(240,237,232,0.15)]"}`} style={{ fontFamily: "'DM Mono', monospace" }}>{count}</span>
                      <motion.button onClick={(e) => { e.stopPropagation(); incrementType(brief.id); }} whileTap={{ scale: 0.85 }}
                        className="w-6 h-6 rounded-md border border-white/15 text-xs text-[rgba(240,237,232,0.6)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all" style={{ fontFamily: "'DM Mono', monospace" }}>+</motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Specialties */}
        <div>
          <p className="text-[9px] tracking-[0.25em] text-[#C8B99A]/60 uppercase mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Specialties</p>
          <div className="grid grid-cols-2 gap-1">
            {SPECIALTIES.map((spec, i) => {
              const count = specialCounters[spec.id] || 0;
              const active = count > 0;
              const config = specialFields[spec.id] || {};
              return (
                <motion.div key={spec.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.008 }}
                  whileHover={{ scale: 1.012 }}
                  className={`relative rounded-lg border transition-all ${active ? "border-[#C8B99A] bg-[rgba(200,185,154,0.06)]" : "border-white/10 hover:border-white/25"}`}
                >
                  <div className="flex items-center justify-between p-1.5 cursor-pointer" onClick={() => (active ? decrementSpecial(spec.id) : incrementSpecial(spec.id))}>
                    {active && <><span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" /></>}
                    <div className="flex-1 min-w-0 mr-1.5">
                      <p className="text-xs text-[#C8B99A] leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{spec.name}</p>
                      <p className="text-[9px] text-[rgba(240,237,232,0.25)] leading-tight mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{spec.tagline} · {spec.cost}cr</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <motion.button onClick={(e) => { e.stopPropagation(); decrementSpecial(spec.id); }} whileTap={{ scale: 0.85 }}
                        className={`w-6 h-6 rounded-md border text-xs transition-all ${active ? "border-white/15 text-[rgba(240,237,232,0.5)] hover:border-[#C8B99A]/40" : "border-white/5 text-[rgba(240,237,232,0.15)]"}`} style={{ fontFamily: "'DM Mono', monospace" }}>−</motion.button>
                      <span className={`w-5 text-center text-sm tabular-nums ${active ? "text-[#F0EDE8]" : "text-[rgba(240,237,232,0.15)]"}`} style={{ fontFamily: "'DM Mono', monospace" }}>{count}</span>
                      <motion.button onClick={(e) => { e.stopPropagation(); incrementSpecial(spec.id); }} whileTap={{ scale: 0.85 }}
                        className="w-6 h-6 rounded-md border border-white/15 text-xs text-[rgba(240,237,232,0.6)] hover:border-[#C8B99A]/40 hover:text-[#C8B99A] transition-all" style={{ fontFamily: "'DM Mono', monospace" }}>+</motion.button>
                    </div>
                  </div>
                  {active && spec.fields.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-2 pb-2 space-y-2 border-t border-white/5 pt-2">
                      {spec.fields.map((f) => {
                        if (f.type === "text") return (
                          <div key={f.key}>
                            <p className="text-[9px] text-[rgba(240,237,232,0.3)] mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{f.label}</p>
                            <input value={config[f.key] || ""} onChange={(e) => setSpecialField(spec.id, f.key, e.target.value)} placeholder={f.placeholder || ""}
                              className="w-full text-[10px] bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-1.5 text-[rgba(240,237,232,0.6)] focus:outline-none focus:border-[#C8B99A]/40" style={{ fontFamily: "'DM Mono', monospace" }} />
                          </div>
                        );
                        if (f.type === "select" || f.type === "radio") return (
                          <div key={f.key}>
                            <p className="text-[9px] text-[rgba(240,237,232,0.3)] mb-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{f.label}</p>
                            <div className="flex flex-wrap gap-1">
                              {(f.options || []).map((opt) => (
                                <button key={opt.value} onClick={() => setSpecialField(spec.id, f.key, opt.value)}
                                  className={`text-[9px] px-2 py-1 rounded border transition-all ${config[f.key] === opt.value ? "border-[#C8B99A] text-[#C8B99A] bg-[rgba(200,185,154,0.06)]" : "border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/60"}`}
                                  style={{ fontFamily: "'DM Mono', monospace" }}>{opt.label}</button>
                              ))}
                            </div>
                          </div>
                        );
                        return null;
                      })}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with GENERATE */}
      <div className="flex-shrink-0 space-y-2 pt-2 border-t border-white/5">
        {/* Prompt constraints */}
        <div>
          <p className="text-[9px] tracking-[0.25em] text-[rgba(240,237,232,0.15)] uppercase mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Prompt Constraints</p>
          <div className="flex flex-wrap gap-1.5">
            {[{ key: "lookAtCamera", label: "👁 Looking into camera" }, { key: "bright", label: "☀️ Bright" }, { key: "winking", label: "😉 Winking" }, { key: "naked", label: "🫣 Naked" }].map((c) => {
              const on = constraints[c.key];
              return (
                <button key={c.key} onClick={() => toggleConstraint(c.key)}
                  className={`px-2 py-1 rounded border text-[9px] transition-all min-h-[28px] touch-safe ${
                    on ? "border-[#C8B99A] text-[#C8B99A] bg-[rgba(200,185,154,0.06)]" : "border-white/10 text-[rgba(240,237,232,0.25)] hover:text-white/50"
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}>{c.label}</button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={onGenerate}
          disabled={!canGenerate}
          whileHover={canGenerate ? { y: -1 } : {}}
          whileTap={canGenerate ? { scale: 0.98 } : {}}
          className={`relative w-full py-3 rounded-xl text-center transition-all duration-200 ${
            canGenerate
              ? "border border-[#C8B99A] cursor-pointer text-[#C8B99A] bg-[rgba(200,185,154,0.06)] gas-glow"
              : "border border-white/5 opacity-40 cursor-not-allowed text-[rgba(240,237,232,0.3)]"
          }`}
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          <span className="gold-corner top-left" /><span className="gold-corner top-right" />
          <span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
          <span className="text-sm tracking-widest uppercase">
            Generate {total} Portrait{total !== 1 ? "s" : ""}
          </span>
        </motion.button>

        {/* Reason / credit info */}
        <p className="text-[10px] text-center text-[rgba(240,237,232,0.25)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          {reason || <>{creditCost} credit{creditCost !== 1 ? "s" : ""} · {credits} remaining{promptEditEnabled && " · ✦ Custom edits"}</>}
        </p>

        {/* One of Each */}
        <div className="flex items-center justify-between pt-1">
          {!hasTypes && (
            <button onClick={() => usePortraitStore.getState().selectOneOfEach()}
              className="text-[9px] px-2 py-0.5 rounded border border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/60 transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}>One of Each ✦ (9cr)</button>
          )}
          <div className="flex-1" />
          <button onClick={() => setPromptEditEnabled(!promptEditEnabled)}
            className={`text-[9px] px-2 py-0.5 rounded border transition-all uppercase tracking-wider ${promptEditEnabled ? "border-[#C8B99A] text-[#C8B99A]" : "border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/70"}`}
            style={{ fontFamily: "'DM Mono', monospace" }}>{promptEditEnabled ? "✦ On" : "✦ Prompts"}</button>
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
