"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ open, message, onClose }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }} className="glass rounded-2xl p-6 w-full max-w-md text-center"
          >
            <div className="text-4xl mb-4">⚠</div>
            <h3 className="text-lg text-[#F0EDE8] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>
              Generation Failed
            </h3>
            <p className="text-xs text-[rgba(240,237,232,0.5)] mb-5 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
              {message.slice(0, 200)}
            </p>
            <motion.button onClick={onClose} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl border border-[#C8B99A]/40 text-xs text-[#C8B99A]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >Dismiss</motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
