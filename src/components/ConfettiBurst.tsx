"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function ConfettiBurst() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#C8B99A", "#F0EDE8", "#C8B99A"],
        ticks: 60,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#C8B99A", "#F0EDE8", "#C8B99A"],
        ticks: 60,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return null;
}
