"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsModal({ open, onClose }: TermsModalProps) {
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Terms & Privacy</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors text-sm">×</button>
            </div>

            <div className="space-y-4 text-xs text-[rgba(240,237,232,0.6)] leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
              <section>
                <p className="text-[#C8B99A] mb-1 uppercase tracking-wider text-[10px]">Provider</p>
                <p>Portraits are generated using OpenAI&apos;s gpt-image-2 model via Replicate. CoverPhoto does not train AI models on your photos or portraits.</p>
              </section>

              <section>
                <p className="text-[#C8B99A] mb-1 uppercase tracking-wider text-[10px]">Data & Privacy</p>
                <p>CoverPhoto does not store your reference images or generated portraits on its servers. Images are uploaded temporarily for processing and removed after your session ends. The reference images are stored temporarily on Vercel Blob only for the duration of generation and are not retained.</p>
              </section>

              <section>
                <p className="text-[#C8B99A] mb-1 uppercase tracking-wider text-[10px]">Your Rights</p>
                <p>You may download, save, or delete your portraits at any time. After generation, click &quot;Delete all my images&quot; below to permanently remove all uploaded references and generated portraits from our systems.</p>
              </section>

              <section>
                <p className="text-[#C8B99A] mb-1 uppercase tracking-wider text-[10px]">Acceptable Use</p>
                <p>This tool may not be used to create misleading or fraudulent representations of individuals. Do not upload images of people without their consent. Do not use generated portraits for impersonation, identity fraud, or any unlawful purpose. CoverPhoto reserves the right to refuse service for violations of these terms.</p>
              </section>

              <section>
                <p className="text-[#C8B99A] mb-1 uppercase tracking-wider text-[10px]">Credit System</p>
                <p>Credits are non-refundable and non-transferable. Unused credits remain on your account. Prices are subject to change. Your current balance is always displayed in the header.</p>
              </section>
            </div>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-5 w-full py-3 rounded-xl border border-[#C8B99A]/40 text-xs text-[#C8B99A]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              I understand
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
