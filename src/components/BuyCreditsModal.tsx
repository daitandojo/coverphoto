"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BuyCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

const PACKAGES = [
  { credits: 10, price: 10, label: "10 credits", priceId: "price_10" },
  { credits: 50, price: 30, label: "50 credits", popular: true, priceId: "price_50" },
  { credits: 100, price: 50, label: "100 credits", priceId: "price_100" },
];

export default function BuyCreditsModal({ open, onClose }: BuyCreditsModalProps) {
  const handlePurchase = (pkg: (typeof PACKAGES)[0]) => {
    const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
    if (!storeId) {
      // Fallback: direct Lemon Squeezy checkout link
      const baseUrl = "https://portraitstudio.lemonsqueezy.com/checkout/buy";
      const url = `${baseUrl}?store=${storeId}&embed=1&price=${pkg.priceId}`;
      window.open(url, "LS_CHECKOUT", "width=600,height=800");
      return;
    }

    if (typeof window !== "undefined" && (window as any).createLemonSqueezy) {
      (window as any).createLemonSqueezy();
      (window as any).LemonSqueezy.Setup({
        store: storeId,
        price: pkg.priceId,
        checkout: { embed: true, media: false },
        events: { onClose: () => onClose() },
      });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="glass rounded-2xl p-8 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-2xl text-[#F0EDE8]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
              >
                Buy Credits
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors text-sm"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {PACKAGES.map((pkg) => (
                <motion.button
                  key={pkg.label}
                  onClick={() => handlePurchase(pkg)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    pkg.popular
                      ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="text-left flex items-center gap-3">
                    <span
                      className="text-sm text-[#F0EDE8]"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {pkg.label}
                    </span>
                    {pkg.popular && (
                      <span className="text-[10px] text-[#C8B99A] uppercase tracking-wider border border-[#C8B99A]/30 px-1.5 py-0.5 rounded">
                        Best value
                      </span>
                    )}
                  </div>
                  <span
                    className="text-sm text-[#C8B99A]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    ${pkg.price}
                  </span>
                </motion.button>
              ))}
            </div>

            <p
              className="mt-4 text-xs text-center text-[rgba(240,237,232,0.3)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Secure payment via Lemon Squeezy
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
