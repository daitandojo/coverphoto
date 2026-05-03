"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function ReferPage() {
  const params = useParams();
  const code = params.code as string;
  const [status, setStatus] = useState("validating");

  useEffect(() => {
    if (!code) { setStatus("invalid"); return; }
    fetch("/api/referral", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).then((r) => r.json()).then((d) => {
      setStatus(d.valid ? "valid" : "invalid");
    }).catch(() => setStatus("invalid"));
  }, [code]);

  return (
    <main className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm">
        <div className="text-4xl">🎁</div>
        <h1 className="text-2xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
          {status === "valid" ? "You've been invited!" : status === "invalid" ? "Invalid link" : "Checking…"}
        </h1>
        {status === "valid" && (
          <>
            <p className="text-xs text-[rgba(240,237,232,0.4)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Sign up and you'll both get <span className="text-[#C8B99A]">5 bonus credits</span>.
            </p>
            <motion.button onClick={() => signIn("google")} whileHover={{ scale: 1.03 }}
              className="cta-corners relative px-8 py-3 rounded-lg border border-[#C8B99A]/40 text-sm text-[#C8B99A] pulse-glow bg-[rgba(200,185,154,0.04)]"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              <span className="gold-corner top-left" /><span className="gold-corner top-right" />
              <span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" />
              Continue with Google
            </motion.button>
          </>
        )}
      </motion.div>
    </main>
  );
}
