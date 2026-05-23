"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORD = "COVERPHOTO";

function Letter({ letter, index, phase }: { letter: string; index: number; phase: string }) {
  return (
    <motion.span
      custom={index}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={
        phase === "exit"
          ? { opacity: 0, scale: 0.6, x: 300, y: -200 }
          : { opacity: 1, scale: 1 }
      }
      transition={
        phase === "exit"
          ? { duration: 0.6, ease: "easeIn", delay: index * 0.03 }
          : { duration: 0.7, ease: "easeOut", delay: index * 0.06 + 0.2 }
      }
      className="block text-[12vw] md:text-[10vw] text-[#F0EDE8] leading-none select-none"
      style={{
        textShadow:
          phase === "exit" ? "none" : "0 0 60px rgba(200,185,154,0.12)",
      }}
    >
      {letter}
    </motion.span>
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 1500);
    const exitTimer = setTimeout(() => setPhase("exit"), 2300);
    const doneTimer = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] bg-[#080808] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            className="flex flex-wrap justify-center items-center gap-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            {WORD.split("").map((letter, i) => (
              <Letter key={i} letter={letter} index={i} phase={phase} />
            ))}
          </motion.div>

          {/* Subtle gold line under the word */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: phase === "exit" ? 0 : "min(60vw, 300px)",
              opacity: phase === "exit" ? 0 : 0.4,
            }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute bottom-[35%] h-px bg-[#C8B99A]"
        />
      </motion.div>
    </AnimatePresence>
  );
}
