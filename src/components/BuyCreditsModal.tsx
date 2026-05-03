"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

const TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    credits: "5/mo",
    desc: "For occasional portraits",
    features: ["5 free credits monthly", "12 standard portrait types", "8 specialties", "19 creative constraints", "Watermarked downloads"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    credits: "50/mo",
    desc: "For regular creation",
    popular: true,
    features: ["50 credits monthly", "All portrait types + specialties", "Unused credits roll over", "Priority generation queue", "No watermarks", "Unlimited saves & exports", "Email support"],
    lemonSqueezyPriceId: "pro_monthly",
  },
  {
    id: "studio",
    name: "Studio",
    price: "$29.99",
    credits: "∞",
    desc: "For professionals & teams",
    features: ["Unlimited credits", "All portrait types + specialties", "Priority generation queue", "No watermarks", "API access for automation", "White-label exports", "Team management (3 seats)", "Priority support"],
    lemonSqueezyPriceId: "studio_monthly",
  },
];

const TOPUPS = [
  { credits: 10, price: 10, label: "10 credits" },
  { credits: 50, price: 30, label: "50 credits" },
  { credits: 100, price: 50, label: "100 credits" },
];

export default function BuyCreditsModal({ open, onClose }: BuyCreditsModalProps) {
  const { credits } = usePortraitStore();
  const [tab, setTab] = useState<"subscribe" | "topup">("subscribe");

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass rounded-2xl p-6 w-full max-w-lg mx-auto my-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Credits & Plans</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 text-sm">×</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5">
              <button onClick={() => setTab("subscribe")} className={`flex-1 py-2 rounded-lg text-xs transition-all uppercase tracking-wider ${tab === "subscribe" ? "bg-[rgba(200,185,154,0.1)] border border-[#C8B99A]/30 text-[#C8B99A]" : "border border-white/10 text-[rgba(240,237,232,0.3)]"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>Subscribe</button>
              <button onClick={() => setTab("topup")} className={`flex-1 py-2 rounded-lg text-xs transition-all uppercase tracking-wider ${tab === "topup" ? "bg-[rgba(200,185,154,0.1)] border border-[#C8B99A]/30 text-[#C8B99A]" : "border border-white/10 text-[rgba(240,237,232,0.3)]"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>Top-up</button>
            </div>

            <p className="text-[10px] text-[rgba(240,237,232,0.2)] mb-4 text-center" style={{ fontFamily: "'DM Mono', monospace" }}>Balance: {credits.toLocaleString()} credits</p>

            {tab === "subscribe" && (
              <div className="space-y-3">
                {TIERS.map((tier) => (
                  <motion.button key={tier.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className={`relative w-full p-4 rounded-xl border text-left transition-all ${tier.popular ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]" : "border-white/10 hover:border-white/20"}`}
                    onClick={() => {
                      if (tier.lemonSqueezyPriceId) {
                        const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
                        // Fallback: redirect to Lemon Squeezy checkout
                        window.open(`https://coverphoto.lemonsqueezy.com/checkout?store=${storeId}&price=${tier.lemonSqueezyPriceId}`, "_blank");
                      }
                    }}
                  >
                    {tier.popular && <><span className="gold-corner top-left" /><span className="gold-corner top-right" /><span className="gold-corner bottom-left" /><span className="gold-corner bottom-right" /></>}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#F0EDE8]" style={{ fontFamily: "'DM Mono', monospace" }}>{tier.name}</span>
                      <span className="text-sm text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>{tier.price}</span>
                    </div>
                    <p className="text-[10px] text-[rgba(240,237,232,0.3)] mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {tier.credits} · {tier.desc}
                      {tier.popular && <span className="ml-2 text-[9px] text-[#C8B99A] uppercase tracking-wider">Best value</span>}
                    </p>
                    <ul className="space-y-0.5">
                      {tier.features.map((f) => (
                        <li key={f} className="text-[9px] text-[rgba(240,237,232,0.3)] flex items-center gap-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                          <span className="text-[#C8B99A]/60">✦</span> {f}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                ))}
              </div>
            )}

            {tab === "topup" && (
              <div className="space-y-2">
                {TOPUPS.map((pkg) => (
                  <motion.button key={pkg.label} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                    onClick={() => {
                      const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
                      window.open(`https://coverphoto.lemonsqueezy.com/checkout?store=${storeId}`, "_blank");
                    }}
                  >
                    <span className="text-sm text-[#F0EDE8]" style={{ fontFamily: "'DM Mono', monospace" }}>{pkg.label}</span>
                    <span className="text-sm text-[#C8B99A]" style={{ fontFamily: "'DM Mono', monospace" }}>${pkg.price}</span>
                  </motion.button>
                ))}
              </div>
            )}

            <p className="mt-4 text-[10px] text-center text-[rgba(240,237,232,0.15)]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Secure payments via Lemon Squeezy · Cancel anytime
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
