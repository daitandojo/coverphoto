"use client";

import { motion } from "framer-motion";

interface ContextMenuProps {
  x: number;
  y: number;
  onSave: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onSave, onRedo, onCopy, onClose }: ContextMenuProps) {
  const items = [
    { label: "Save Image", action: onSave },
    { label: "Redo this portrait", action: onRedo },
    { label: "Copy to clipboard", action: onCopy },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 100,
      }}
      className="glass rounded-xl py-1.5 min-w-[200px] shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.action();
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-[rgba(240,237,232,0.7)] hover:text-[#C8B99A] hover:bg-[rgba(200,185,154,0.05)] transition-colors"
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}
