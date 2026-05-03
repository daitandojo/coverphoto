"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

interface RefPanelProps {
  onCameraClick: () => void;
}

export default function RefPanel({ onCameraClick }: RefPanelProps) {
  const { uploadedImages, addUploadedImage, removeUploadedImage } = usePortraitStore();

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
        className={`relative rounded-xl border-2 border-dashed p-3 md:p-6 text-center cursor-pointer transition-all ${isDragActive ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]" : "border-white/10 hover:border-white/20"}`}
      >
        <input {...getInputProps()} />
        <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(200,185,154,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-[11px] text-[rgba(240,237,232,0.4)] mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Drop images here</p>
        <div className="flex gap-2 justify-center">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-xs text-[rgba(240,237,232,0.5)] hover:border-white/20 cursor-default transition-all gold-corner-effect" style={{ fontFamily: "'DM Mono', monospace" }}>📁 Browse</span>
          <button onClick={(e) => { e.stopPropagation(); onCameraClick(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#C8B99A]/30 text-xs text-[#C8B99A] hover:bg-[rgba(200,185,154,0.08)] transition-all font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
            <span className="text-sm">📷</span> Use Camera
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {uploadedImages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 md:space-y-3">
            {uploadedImages.map((img) => (
              <motion.div key={img.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group w-full">
                <div className="w-full h-28 md:h-52 md:aspect-[3/2] rounded-lg overflow-hidden ring-1 ring-white/10 bg-black/20">
                  <img src={img.preview} alt="" className="w-full h-full object-contain" />
                </div>
                <button onClick={() => removeUploadedImage(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 min-h-[20px] min-w-[20px] rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[9px] text-white/70 hover:text-white transition-all touch-always-show">×</button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
