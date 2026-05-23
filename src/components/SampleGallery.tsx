"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

const SETS = [
  { label: "The Professional", images: ["s1_executive", "s1_founder", "s1_statesperson", "s1_outdoors"] },
  { label: "The Creative", images: ["s2_executive", "s2_founder", "s2_statesperson", "s2_outdoors"] },
  { label: "The Muse", images: ["s3_executive", "s3_founder", "s3_statesperson", "s3_outdoors"] },
] as const;

const STYLE_TAGS = ["Editorial", "Portrait", "Artistic", "Lifestyle"];

const ROTATIONS = [-2.5, 3.0, -1.5, 2.0];
const GRID = 7;

function generateFragments(grid: number) {
  const items = [];
  const cellW = 100 / grid;
  const cellH = 100 / grid;
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 200;
      items.push({
        key: `${r}-${c}`,
        left: `${c * cellW}%`,
        top: `${r * cellH}%`,
        width: `${cellW}%`,
        height: `${cellH}%`,
        bgPosX: `${c * (100 / (grid - 1))}%`,
        bgPosY: `${r * (100 / (grid - 1))}%`,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        rot: (Math.random() - 0.5) * 400,
        delay: Math.random() * 0.3,
      });
    }
  }
  return items;
}

/* ==================== SCATTER FRAGMENT ==================== */

function ScatterImage({
  src,
  index,
  rotation,
}: {
  src: string;
  index: number;
  rotation: number;
}) {
  const fragments = useMemo(() => generateFragments(GRID), []);
  const baseDelay = index * 0.5;

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {fragments.map((f) => (
        <motion.div
          key={f.key}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{ opacity: 0, x: f.dx, y: f.dy, rotate: f.rot, scale: 0.3 }}
          transition={{
            duration: 0.8,
            delay: baseDelay + f.delay,
            ease: "easeIn",
          }}
          className="absolute"
          style={{
            left: f.left,
            top: f.top,
            width: f.width,
            height: f.height,
            backgroundImage: `url(${src})`,
            backgroundSize: `${GRID * 100}%`,
            backgroundPosition: `${f.bgPosX} ${f.bgPosY}`,
            borderRadius: "1px",
          }}
        />
      ))}
    </div>
  );
}

/* ==================== SAMPLE CARD ==================== */

function SampleCard({ img, i, setIdx, phase }: { img: string; i: number; setIdx: number; phase: string }) {
  return (
    <motion.div
      key={`${setIdx}-${i}`}
      initial={phase === "enter" ? { opacity: 0, scale: 0.7 } : { opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: phase === "enter" ? i * 0.5 : 0, ease: "easeOut" }}
      className="group relative"
    >
      <span className="gold-corner top-left" />
      <span className="gold-corner top-right" />
      <span className="gold-corner bottom-left" />
      <span className="gold-corner bottom-right" />

      <div className="relative w-[120px] h-[155px] sm:w-[170px] sm:h-[220px] md:w-[200px] md:h-[260px] lg:w-[220px] lg:h-[290px] rounded-lg ring-1 ring-white/[0.06] bg-[rgba(255,255,255,0.02)]">
        {phase === "scatter" ? (
          <ScatterImage src={`/samples/${img}.png`} index={i} rotation={ROTATIONS[i]} />
        ) : (
          <motion.div
            initial={phase === "enter" ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: phase === "enter" ? i * 0.5 : 0 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{ transform: `rotate(${ROTATIONS[i]}deg)` }}
          >
            <img src={`/samples/${img}.png`} alt=""
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:saturate-110" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] uppercase tracking-[0.2em] text-[rgba(240,237,232,0.25)] group-hover:text-[#C8B99A] transition-colors">
              <span className="px-2 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace", background: "rgba(0,0,0,0.4)" }}>
                {STYLE_TAGS[i]}
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ==================== GALLERY ==================== */

export default function SampleGallery() {
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<"show" | "scatter" | "enter">("show");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const startScatter = useCallback(() => {
    setPhase("scatter");
    // After all 4 scatter animations finish: ~2000ms
    timerRef.current = setTimeout(() => {
      setSetIdx((prev) => (prev + 1) % SETS.length);
      setPhase("enter");
      // After enter animations finish, go back to show
      timerRef.current = setTimeout(() => {
        setPhase("show");
      }, 2500);
    }, 2500);
  }, []);

  // Auto-cycle: show for 4s, then scatter
  useEffect(() => {
    if (phase !== "show") return;
    const t = setTimeout(() => startScatter(), 4000);
    return () => clearTimeout(t);
  }, [phase, startScatter, setIdx]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!mounted) return null;

  const set = SETS[setIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col items-center gap-6"
    >
      {/* Mobile: 2 rows of 2, overlapped. Desktop: single row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3 md:gap-4 lg:gap-6 min-h-0">
        {/* Row 1 (indices 0, 1) — slight overlap */}
        <div className="flex flex-row items-center justify-center -space-x-6 sm:hidden">
          {set.images.slice(0, 2).map((img, i) => (
            <SampleCard key={`${setIdx}-${i}`} img={img} i={i} setIdx={setIdx} phase={phase} />
          ))}
        </div>
        {/* Row 2 (indices 2, 3) — shifted 30% right */}
        <div className="flex flex-row items-center justify-center -space-x-6 sm:hidden ml-[30%]">
          {set.images.slice(2, 4).map((img, i) => (
            <SampleCard key={`${setIdx}-${i + 2}`} img={img} i={i + 2} setIdx={setIdx} phase={phase} />
          ))}
        </div>
        {/* Desktop: all 4 in one row */}
        <div className="hidden sm:flex flex-row items-center justify-center gap-3 md:gap-4 lg:gap-6">
          {set.images.map((img, i) => (
            <SampleCard key={`${setIdx}-${i}`} img={img} i={i} setIdx={setIdx} phase={phase} />
          ))}
        </div>
      </div>


    </motion.div>
  );
}
