"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  portraitUrl: string;
  style: string;
  sessionId?: string | null;
}

export default function ShareModal({ open, onClose, portraitUrl, style, sessionId }: ShareModalProps) {
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sessionUrl = sessionId ? `${window.location.origin}/session/${sessionId}` : null;

  const downloadForPlatform = (width: number, height: number, label: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, width, height);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.min(width * 0.85 / img.width, height * 0.75 / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2 - 20;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.fillStyle = "rgba(200, 185, 154, 0.3)";
      ctx.font = "14px DM Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("Made with CoverPhoto", width / 2, height - 30);
      const link = document.createElement("a");
      link.download = `coverphoto-${label}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();
    };
    img.src = portraitUrl;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>Share Portrait</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 text-sm">×</button>
            </div>
            <div className="space-y-3">
              {sessionUrl && (
                <button onClick={() => { navigator.clipboard.writeText(sessionUrl); }}
                  className="w-full py-2.5 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:text-white/70 transition-all"
                  style={{ fontFamily: "'DM Mono', monospace" }}>📋 Copy share link</button>
              )}
              <button onClick={() => downloadForPlatform(1080, 1920, "instagram")}
                className="w-full py-2.5 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:text-white/70 transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}>📱 Instagram Story (1080×1920)</button>
              <button onClick={() => downloadForPlatform(1200, 627, "linkedin")}
                className="w-full py-2.5 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:text-white/70 transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}>💼 LinkedIn (1200×627)</button>
              <button onClick={() => downloadForPlatform(1200, 1200, "square")}
                className="w-full py-2.5 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:text-white/70 transition-all"
                style={{ fontFamily: "'DM Mono', monospace" }}>🔲 Square (1200×1200)</button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
