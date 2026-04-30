"use client";

import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import PortraitCard from "./PortraitCard";

export default function PortraitGallery() {
  const { portraits, isGenerating } = usePortraitStore();
  const show = isGenerating || portraits.some((p) => p.status !== "pending");

  if (!show) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {portraits.map((portrait, i) => (
        <PortraitCard key={portrait.id} portrait={portrait} index={i} />
      ))}
    </motion.section>
  );
}
