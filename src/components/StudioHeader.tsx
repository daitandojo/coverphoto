"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface StudioHeaderProps {
  onCreditsClick: () => void;
  credits: number;
  user: { name?: string | null; image?: string | null } | null;
  isGenerating: boolean;
}

export default function StudioHeader({ onCreditsClick, credits, user, isGenerating }: StudioHeaderProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="gradient-border-bottom"
    >
      <div className="flex items-center justify-between px-6 lg:px-12 h-16">
        <div className="flex items-center gap-8">
          <h1
            className="text-xl lg:text-2xl tracking-[0.3em] text-[#F0EDE8] select-none"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            PORTRAIT STUDIO
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-7 h-7 rounded-full ring-1 ring-white/10"
                />
              )}
              <motion.button
                onClick={onCreditsClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm ${
                  credits < 10
                    ? "amber-pulse border-amber-600/40 text-amber-300"
                    : "border-white/10 text-[#C8B99A]"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <span>◈</span>
                <span>{credits} credits</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => router.push("/api/auth/signin")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-1.5 rounded-full border border-white/10 text-sm text-[#C8B99A] hover:border-[#C8B99A]/30 transition-colors"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Sign in
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
