"use client";

import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import PortraitCard from "./PortraitCard";

interface PortraitGalleryProps {
  onRetry?: (style: string) => void;
}

export default function PortraitGallery({ onRetry }: PortraitGalleryProps) {
  const { portraits, portraitCount } = usePortraitStore();
  const show = portraits.some((p) => p.status !== "pending");

  if (!show) return null;

  let gridClass = "grid grid-cols-2 lg:grid-cols-4 gap-4";
  if (portraitCount === 1) {
    gridClass = "flex justify-center";
  } else if (portraitCount === 8) {
    gridClass = "grid grid-cols-2 md:grid-cols-4 gap-4";
  } else if (portraitCount === 12) {
    gridClass = "grid grid-cols-3 md:grid-cols-4 gap-4";
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      className={gridClass}
    >
      {portraits.map((portrait, i) => (
        <div key={portrait.id} className={portraitCount === 1 ? "w-[400px]" : ""}>
          <PortraitCard portrait={portrait} index={i} large={portraitCount === 1} onRetry={onRetry} />
        </div>
      ))}
    </motion.section>
  );
}
