"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const SAMPLES = [
  {
    src: "/samples/executive.png",
    label: "Editorial",
    rotation: -2.5,
    offset: { x: 0, y: 0 },
  },
  {
    src: "/samples/founder.png",
    label: "Portrait",
    rotation: 3.0,
    offset: { x: 0, y: 8 },
  },
  {
    src: "/samples/statesperson.png",
    label: "Artistic",
    rotation: -1.5,
    offset: { x: 0, y: 4 },
  },
  {
    src: "/samples/outdoors.png",
    label: "Lifestyle",
    rotation: 2.0,
    offset: { x: 0, y: 12 },
  },
];

export default function SampleGallery() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10 py-6"
    >
      {SAMPLES.map((sample, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: sample.offset.y }}
          transition={{
            duration: 0.6,
            delay: 0.2 + i * 0.12,
            ease: "easeOut",
          }}
          whileHover={{
            scale: 1.06,
            y: sample.offset.y - 6,
            transition: { duration: 0.35, ease: "easeOut" },
          }}
          className="group relative"
          style={{ transform: `rotate(${sample.rotation}deg)` }}
        >
          {/* Gold corner accents */}
          <span className="gold-corner top-left" />
          <span className="gold-corner top-right" />
          <span className="gold-corner bottom-left" />
          <span className="gold-corner bottom-right" />

          {/* Card */}
          <div className="relative w-[160px] h-[200px] md:w-[200px] md:h-[260px] lg:w-[240px] lg:h-[310px] rounded-lg overflow-hidden ring-1 ring-white/[0.06] bg-[rgba(255,255,255,0.02)]">
            <Image
              src={sample.src}
              alt={sample.label}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:saturate-110"
              sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 240px"
              priority
            />

            {/* Hover glow overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Label */}
          <p
            className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-[rgba(240,237,232,0.35)] group-hover:text-[#C8B99A] transition-colors duration-400"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {sample.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
