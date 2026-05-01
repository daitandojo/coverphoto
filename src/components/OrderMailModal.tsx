"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { usePortraitStore } from "@/lib/store";

interface OrderMailModalProps {
  open: boolean;
  onClose: () => void;
}

const SIZES = [
  { id: "small", label: "Small (6×4&Prime;)", cost: 3 },
  { id: "medium", label: "Medium (8×6&Prime;)", cost: 5 },
  { id: "large", label: "Large (10×8&Prime;)", cost: 7 },
];

const OPTIONS = [
  { id: "none", label: "Print only", cost: 0 },
  { id: "frame", label: "Framed", cost: 5 },
  { id: "canvas", label: "Canvas wrap", cost: 8 },
];

export default function OrderMailModal({ open, onClose }: OrderMailModalProps) {
  const { credits, setCredits } = usePortraitStore();
  const [size, setSize] = useState("medium");
  const [option, setOption] = useState("none");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);

  const sizeCost = SIZES.find((s) => s.id === size)?.cost || 5;
  const optCost = OPTIONS.find((o) => o.id === option)?.cost || 0;
  const totalCost = 8 + sizeCost + optCost;

  const handleOrder = async () => {
    if (!name.trim() || !address.trim()) {
      toast("Please provide your name and address", { className: "toast-custom", icon: "◎" });
      return;
    }
    if (credits < totalCost) {
      toast("Insufficient credits", { className: "toast-custom", icon: "⚠" });
      return;
    }

    setSending(true);
    try {
      // Send email to coverphoto@gmail.com
      const res = await fetch("/api/order-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, size, option, totalCost }),
      });
      if (!res.ok) throw new Error("Order failed");
      setCredits(credits - totalCost);
      toast("Order placed! We will be in touch.", { className: "toast-custom", icon: "✓" });
      onClose();
    } catch {
      toast("Order failed. Please try again.", { className: "toast-custom", icon: "⚠" });
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Order by Mail</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 text-sm">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1 uppercase tracking-wider" style={{ fontFamily: "'DM Mono', monospace" }}>Base cost: 8 credits</p>
              </div>

              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Size + cost</p>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((s) => (
                    <button key={s.id} onClick={() => setSize(s.id)}
                      className={`p-2 rounded-lg border text-xs transition-all ${size === s.id ? "border-[#C8B99A] text-[#C8B99A]" : "border-white/10 text-[rgba(240,237,232,0.4)]"}`}
                      style={{ fontFamily: "'DM Mono', monospace" }}>{s.label}<br />+{s.cost}cr</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Finish</p>
                <div className="grid grid-cols-3 gap-2">
                  {OPTIONS.map((o) => (
                    <button key={o.id} onClick={() => setOption(o.id)}
                      className={`p-2 rounded-lg border text-[10px] transition-all ${option === o.id ? "border-[#C8B99A] text-[#C8B99A]" : "border-white/10 text-[rgba(240,237,232,0.4)]"}`}
                      style={{ fontFamily: "'DM Mono', monospace" }}>{o.label}{o.cost > 0 ? ` +${o.cost}cr` : ""}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Your name</p>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-2 text-[rgba(240,237,232,0.7)] focus:outline-none focus:border-[#C8B99A]/40"
                  style={{ fontFamily: "'DM Mono', monospace" }} placeholder="John Doe" />
              </div>

              <div>
                <p className="text-[10px] text-[rgba(240,237,232,0.4)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>Shipping address</p>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3}
                  className="w-full text-xs bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-lg p-2 text-[rgba(240,237,232,0.7)] focus:outline-none focus:border-[#C8B99A]/40 resize-none"
                  style={{ fontFamily: "'DM Mono', monospace" }} placeholder="Street, city, postcode, country" />
              </div>

              <p className="text-xs text-[rgba(240,237,232,0.3)] text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
                Total: {totalCost} credits · {credits} available
              </p>

              <motion.button onClick={handleOrder} disabled={sending}
                whileHover={!sending ? { scale: 1.02 } : {}}
                className="w-full py-3 rounded-xl border border-[#C8B99A]/40 text-xs text-[#C8B99A] disabled:opacity-40"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {sending ? "Sending..." : "Place Order"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
