"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import type { UploadedImage } from "@/types";

interface WebcamModalProps {
  onClose: () => void;
}

export default function WebcamModal({ onClose }: WebcamModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { uploadedImages, addUploadedImage } = usePortraitStore();
  const [capturedCount, setCapturedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const remaining = 4 - uploadedImages.length;

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError("Camera access denied. Please allow camera permissions.");
      }
    }
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || remaining <= 0) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const id = `cam-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const file = new File([blob], `capture-${capturedCount + 1}.jpg`, {
        type: "image/jpeg",
      });
      const preview = URL.createObjectURL(file);
      addUploadedImage({ id, file, preview });
      setCapturedCount((c) => c + 1);
    }, "image/jpeg", 0.92);
  }, [capturedCount, remaining, addUploadedImage]);

  return (
    <AnimatePresence>
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
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass rounded-2xl p-6 w-full max-w-lg mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg text-[#F0EDE8]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Capture from Camera
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors text-sm"
            >
              ×
            </button>
          </div>

          {error ? (
            <p className="text-red-400 text-sm text-center py-8">{error}</p>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden bg-black mb-4 aspect-square max-h-[400px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="text-xs text-[rgba(240,237,232,0.4)]"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {capturedCount} captured · {remaining} remaining
                </span>

                <motion.button
                  onClick={capture}
                  disabled={remaining <= 0}
                  whileHover={remaining > 0 ? { scale: 1.05 } : {}}
                  whileTap={remaining > 0 ? { scale: 0.95 } : {}}
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    remaining > 0
                      ? "border-[#C8B99A] hover:bg-[#C8B99A]/10"
                      : "border-white/10 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#C8B99A]" />
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
