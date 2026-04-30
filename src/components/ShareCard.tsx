"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

export default function ShareCard() {
  const { portraits, setShowShareCard } = usePortraitStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const completed = portraits.filter((p) => p.status === "completed");
  const allDone = portraits.every((p) => p.status === "completed");

  const handleShare = useCallback(async () => {
    if (!canvasRef.current || completed.length !== 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1024;
    canvas.height = 1024;

    // Background
    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw 4 portraits in 2x2 grid
    const size = 480;
    const gap = 20;
    const startX = (1024 - size * 2 - gap) / 2;
    const startY = (1024 - size * 2 - gap) / 2 + 30;

    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (size + gap);
      const y = startY + row * (size + gap);

      // Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, x, y, size, size);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = portraits[i].url;
      });

      // Border
      ctx.strokeStyle = "rgba(200, 185, 154, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, size, size);
    }

    // Watermark
    ctx.fillStyle = "rgba(200, 185, 154, 0.3)";
    ctx.font = "14px 'DM Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("Made with CoverPhoto", 512, 970);

    // Download
    const link = document.createElement("a");
    link.download = "coverphoto-composite.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, [completed.length, portraits]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      <canvas ref={canvasRef} className="hidden" />

      {allDone && (
        <div className="flex gap-3">
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl border border-[#C8B99A] text-sm text-[#C8B99A] bg-[rgba(200,185,154,0.05)] hover:bg-[rgba(200,185,154,0.1)] transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Share your portraits
          </motion.button>
          <motion.button
            onClick={() => setShowShareCard(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl border border-white/10 text-sm text-[rgba(240,237,232,0.5)] hover:text-white/80 transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Dismiss
          </motion.button>
        </div>
      )}

      <p
        className="text-xs text-[rgba(240,237,232,0.3)]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        Share your portraits — the 2×2 composite will be ready to download
      </p>
    </motion.div>
  );
}
