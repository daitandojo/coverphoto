"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

export default function RefPanel() {
  const { uploadedImages, addUploadedImage, removeUploadedImage } = usePortraitStore();
  const [showCam, setShowCam] = useState(false);

  const onDrop = useCallback(
    (files: File[]) => {
      const remaining = 3 - uploadedImages.length;
      files.slice(0, remaining).forEach((f) => {
        addUploadedImage({ id: `up-${Date.now()}-${Math.random().toString(36).slice(2)}`, file: f, preview: URL.createObjectURL(f) });
      });
    },
    [uploadedImages.length, addUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] }, maxFiles: 3, disabled: uploadedImages.length >= 3,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Reference</span>
        <span className="text-xs text-[rgba(240,237,232,0.3)]" style={{ fontFamily: "'DM Mono', monospace" }}>{uploadedImages.length}/3</span>
      </div>

      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          isDragActive ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]" : "border-white/10 hover:border-white/20"
        }`}
      >
        <input {...getInputProps()} />
        <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(200,185,154,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-[11px] text-[rgba(240,237,232,0.4)] mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Drop images here</p>

        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:border-white/20 cursor-default" style={{ fontFamily: "'DM Mono', monospace" }}>📁 Browse</span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowCam(true); }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#C8B99A]/30 text-xs text-[#C8B99A] hover:bg-[rgba(200,185,154,0.08)] transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            <span className="text-sm">📷</span> Use Camera
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {uploadedImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {uploadedImages.map((img) => (
              <motion.div key={img.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group w-full">
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden ring-1 ring-white/10">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => removeUploadedImage(img.id)}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[10px] text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100">×</button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showCam && <WebcamModalInline onClose={() => setShowCam(false)} />}
    </div>
  );
}

function WebcamModalInline({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { addUploadedImage } = usePortraitStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } } });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch { setError("Camera access denied"); }
    })();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      addUploadedImage({ id: `cam-${Date.now()}`, file: new File([blob], "capture.jpg", { type: "image/jpeg" }), preview: URL.createObjectURL(blob) });
    }, "image/jpeg", 0.92);
  }, [addUploadedImage]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-5 w-full max-w-lg mx-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#F0EDE8]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Capture</span>
            <button onClick={onClose} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors text-xs">×</button>
          </div>
          {error ? (
            <p className="text-red-400 text-xs text-center py-8">{error}</p>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden bg-black mb-4 aspect-square max-h-[380px]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={capture}
                  className="w-16 h-16 rounded-full border-2 border-[#C8B99A] flex items-center justify-center hover:bg-[rgba(200,185,154,0.1)] transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-[#C8B99A]" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
