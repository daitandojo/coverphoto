"use client";

import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import PortraitCard from "./PortraitCard";

interface PortraitGalleryProps {
  onRetry?: (style: string) => void;
}

export default function PortraitGallery({ onRetry }: PortraitGalleryProps) {
  const { portraits, totalSelected } = usePortraitStore();
  const count = totalSelected();
  const show = portraits.some((p) => p.status !== "pending");

  if (!show) return null;

  let gridClass = "grid grid-cols-2 lg:grid-cols-4 gap-4";
  if (count === 1) {
    gridClass = "flex justify-center";
  } else if (count === 2) {
    gridClass = "grid grid-cols-2 gap-4 max-w-lg mx-auto";
  } else if (count <= 4) {
    gridClass = "grid grid-cols-2 lg:grid-cols-4 gap-4";
  } else {
    gridClass = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      className={gridClass}
    >
      {portraits.map((portrait, i) => (
        <div key={portrait.id} className={count === 1 ? "w-[400px]" : ""}>
          <PortraitCard portrait={portrait} index={i} large={count === 1} onRetry={onRetry} />
        </div>
      ))}
    </motion.section>
  );
}
