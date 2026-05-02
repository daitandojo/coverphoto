"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

interface EmailAuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmailAuthModal({ open, onClose }: EmailAuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { toast("Fill in both fields", { className: "toast-custom", icon: "◎" }); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Signup failed"); }
        toast("Account created! Signing in…", { className: "toast-custom", icon: "✓" });
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Invalid email or password");
      onClose();
    } catch (err: any) {
      toast(err.message || "Authentication failed", { className: "toast-custom", icon: "⚠" });
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }} className="glass rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
                {mode === "signin" ? "Sign in" : "Sign up"}
              </h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 text-sm">×</button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Email</p>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email"
                  className="w-full text-xs bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-2.5 text-[rgba(240,237,232,0.7)] focus:outline-none focus:border-[#C8B99A]/40"
                  style={{ fontFamily: "'DM Mono', monospace" }} />
              </div>
              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Password</p>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full text-xs bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-2.5 text-[rgba(240,237,232,0.7)] focus:outline-none focus:border-[#C8B99A]/40"
                  style={{ fontFamily: "'DM Mono', monospace" }} />
              </div>

              <motion.button onClick={handleSubmit} disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                className="w-full py-2.5 rounded-xl border border-[#C8B99A]/40 text-xs text-[#C8B99A] disabled:opacity-40"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </motion.button>

              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="w-full text-[10px] text-[rgba(240,237,232,0.25)] hover:text-white/50 transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
