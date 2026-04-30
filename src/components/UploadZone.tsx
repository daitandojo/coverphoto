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
      const filesToAdd = acceptedFiles.slice(0, remaining);

      filesToAdd.forEach((file) => {
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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2
          className="text-3xl lg:text-4xl text-[#F0EDE8]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Begin with your reference
        </h2>
        <p
          className="text-sm text-[rgba(240,237,232,0.5)]"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Upload 2–4 images. The more angles, the more faithful the portraits.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`relative cursor-pointer transition-all duration-300`}
      >
        <input {...getInputProps()} />
        <div
          className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragActive
              ? "border-[#C8B99A] bg-[rgba(200,185,154,0.05)]"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <svg
            className="ants-border absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect
              x="1"
              y="1"
              width="98"
              height="98"
              rx="11"
              ry="11"
              fill="none"
              stroke={isDragActive ? "#C8B99A" : "rgba(200,185,154,0.3)"}
              strokeWidth="1"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(200,185,154,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p
              className="text-sm text-[rgba(240,237,232,0.6)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {isDragActive
                ? "Drop your images here"
                : "Drag & drop or click to browse"}
            </p>
            <span
              className="text-xs text-[rgba(240,237,232,0.3)]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {uploadedImages.length}/4 images
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <motion.button
          onClick={() => setShowWebcam(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 text-sm text-[rgba(240,237,232,0.6)] hover:border-white/20 hover:text-[#C8B99A] transition-all"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          <span>◎</span> Use Camera
        </motion.button>
      </div>

      {/* Filmstrip */}
      <AnimatePresence mode="popLayout">
        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center gap-3 flex-wrap"
          >
            {uploadedImages.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative group"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden ring-1 ring-white/10">
                  <img
                    src={img.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeUploadedImage(img.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#080808] border border-white/20 flex items-center justify-center text-xs text-white/50 hover:text-white/90 hover:border-white/40 transition-all opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showWebcam && <WebcamModal onClose={() => setShowWebcam(false)} />}
    </motion.section>
  );
}
