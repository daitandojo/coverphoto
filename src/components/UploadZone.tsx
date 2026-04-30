"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import WebcamModal from "./WebcamModal";
import type { UploadedImage } from "@/types";

export default function UploadZone() {
  const { uploadedImages, addUploadedImage, removeUploadedImage } = usePortraitStore();
  const [showWebcam, setShowWebcam] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = 4 - uploadedImages.length;
      acceptedFiles.slice(0, remaining).forEach((file) => {
        const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const preview = URL.createObjectURL(file);
        addUploadedImage({ id, file, preview });
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-3"
    >
      {/* Compact dropzone + camera inline */}
      <div
        {...getRootProps()}
        className={`relative rounded-lg border border-dashed px-4 py-3 cursor-pointer transition-all ${
          isDragActive
            ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <input {...getInputProps()} />
        <div className="relative z-10 flex items-center gap-3 text-sm text-[rgba(240,237,232,0.5)]" style={{ fontFamily: "'DM Mono', monospace" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,185,154,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>
            {isDragActive
              ? "Drop images here"
              : `Drop or click to upload (${uploadedImages.length}/4)`}
          </span>

          <span className="mx-1 text-[rgba(240,237,232,0.15)]">·</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWebcam(true);
            }}
            className="flex items-center gap-1 text-[rgba(240,237,232,0.4)] hover:text-[#C8B99A] transition-colors"
          >
            <span>◎</span> Camera
          </button>
        </div>
      </div>

      {/* Filmstrip */}
      <AnimatePresence mode="popLayout">
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex gap-2"
          >
            {uploadedImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-white/10">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeUploadedImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#080808] border border-white/20 flex items-center justify-center text-[10px] text-white/50 hover:text-white/90 transition-all opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showWebcam && <WebcamModal onClose={() => setShowWebcam(false)} />}
    </motion.div>
  );
}
