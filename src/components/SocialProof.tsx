"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function SocialProof() {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || done.current) return;
    done.current = true;
    const target = 514;
    const duration = 2000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <p className="text-[10px] text-[rgba(240,237,232,0.12)] tracking-widest uppercase"
        style={{ fontFamily: "'DM Mono', monospace" }}>
        <motion.span key={count} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
          {count.toLocaleString()}
        </motion.span>
        + portraits created · Join the community
      </p>
    </motion.div>
  );
}
