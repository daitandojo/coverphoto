"use client";

import { motion } from "framer-motion";
import type { PortraitImage } from "@/types";
import PortraitCard from "@/components/PortraitCard";

interface SessionViewerProps {
  id: string;
  portraits: PortraitImage[];
}

export default function SessionViewer({ id, portraits }: SessionViewerProps) {
  const items: PortraitImage[] =
    portraits.length === 4
      ? portraits
      : Array.from({ length: 4 }, (_, i) => ({
          id: `portrait-${i}`,
          style: ["executive", "founder", "statesperson", "outdoors"][i] as PortraitImage["style"],
          url: "",
          status: "pending" as const,
        }));

  return (
    <main className="min-h-screen bg-[#080808]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <h1
            className="text-3xl lg:text-4xl text-[#F0EDE8] tracking-[0.15em]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            Portrait Session
          </h1>
          <p
            className="text-xs text-[rgba(240,237,232,0.3)] tracking-[0.2em] uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Made with CoverPhoto
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((p, i) => (
            <PortraitCard key={p.id} portrait={p} index={i} />
          ))}
        </div>

        <div className="text-center pt-4">
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl border border-white/10 text-sm text-[rgba(240,237,232,0.5)] hover:text-[#C8B99A] hover:border-[#C8B99A]/30 transition-all"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Create your own at CoverPhoto
          </a>
        </div>
      </div>
    </main>
  );
}
