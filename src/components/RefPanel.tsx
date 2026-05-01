"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import WebcamModal from "./WebcamModal";

export default function RefPanel() {
  const { uploadedImages, addUploadedImage, removeUploadedImage, leftPanelOpen, leftPanelPinned } = usePortraitStore();
  const [showCam, setShowCam] = useState(false);

  const onDrop = useCallback(
    (files: File[]) => {
      const remaining = 4 - uploadedImages.length;
      files.slice(0, remaining).forEach((f) => {
        const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        addUploadedImage({ id, file: f, preview: URL.createObjectURL(f) });
      });
    },
    [uploadedImages.length, addUploadedImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 4,
    disabled: uploadedImages.length >= 4,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#F0EDE8] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Reference Images</span>
        <span className="text-xs text-[rgba(240,237,232,0.3)]" style={{ fontFamily: "'DM Mono', monospace" }}>{uploadedImages.length}/4</span>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          isDragActive ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]" : "border-white/10 hover:border-white/20"
        }`}
      >
        <input {...getInputProps()} />
        <svg className="mx-auto mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(200,185,154,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-xs text-[rgba(240,237,232,0.5)] mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
          {isDragActive ? "Drop images here" : "Drop up to 4 reference images"}
        </p>
        <div className="flex justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-[rgba(240,237,232,0.5)]" style={{ fontFamily: "'DM Mono', monospace" }}>
            📁 Browse
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); setShowCam(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-[rgba(240,237,232,0.5)] hover:border-[#C8B99A]/30 hover:text-[#C8B99A] cursor-pointer transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            📷 Camera
          </span>
        </div>
      </div>

      {/* Filmstrip */}
      <AnimatePresence mode="popLayout">
        <div className="flex gap-2 flex-wrap">
          {uploadedImages.map((img) => (
            <motion.div
              key={img.id} layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden ring-1 ring-white/10">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => removeUploadedImage(img.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#080808] border border-white/20 flex items-center justify-center text-[10px] text-white/50 hover:text-white/90 transition-all opacity-0 group-hover:opacity-100"
              >×</button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {showCam && <WebcamModal onClose={() => setShowCam(false)} />}
    </div>
  );
}
