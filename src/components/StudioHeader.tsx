"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut, signIn } from "next-auth/react";
import { usePortraitStore } from "@/lib/store";
import TermsModal from "./TermsModal";
import PwaInstallButton from "./PwaInstallButton";
import toast from "react-hot-toast";

interface StudioHeaderProps {
  onCreditsClick: () => void;
  credits: number;
  user: { name?: string | null; image?: string | null; email?: string | null } | null;
  isGenerating: boolean;
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function StudioHeader({ onCreditsClick, credits, user, isGenerating }: StudioHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.image || null);
  const [profileName, setProfileName] = useState<string>(user?.name || "");
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.email === "reconozco@gmail.com";
  const { adminMode, setAdminMode, setAdminPortraits } = usePortraitStore();
  const portraitCount = usePortraitStore((s) => s.libraryPortraits.length + s.workbenchPortraits.length);
  const [showTerms, setShowTerms] = useState(false);

  // Cap credits display at 999
  const displayCredits = credits > 999 ? 999 : credits;
  const creditsLabel = credits > 999 ? "999+" : String(credits);

  // Fetch profile from DB to get the real image URL
  useEffect(() => {
    if (!user?.email) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.image) setProfileImage(d.image);
        if (d.name) setProfileName(d.name);
      })
      .catch(() => {});
  }, [user?.email]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="gradient-border-bottom"
    >
      <div className="flex items-center justify-between px-3 md:px-6 lg:px-12 h-14 md:h-16">
        {/* Logo — compact on mobile, full on desktop */}
        <h1
          className="text-base md:text-2xl tracking-[0.15em] md:tracking-[0.3em] text-[#F0EDE8] select-none cursor-pointer"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          onClick={() => router.push("/")}
        >
          <span className="md:hidden">CP</span>
          <span className="hidden md:inline">COVERPHOTO</span>
        </h1>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {/* Credits — icon only */}
              <motion.button
                onClick={onCreditsClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1 px-2 md:px-4 py-1.5 rounded-full border text-xs md:text-sm ${
                  credits < 10
                    ? "amber-pulse border-amber-600/40 text-amber-300"
                    : "border-white/10 text-[#C8B99A]"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                <span>◈</span>
                <span>{creditsLabel}</span>
              </motion.button>

              {/* Admin toggle */}
              {isAdmin && (
                <button
                  onClick={() => {
                    const newMode = !adminMode;
                    setAdminMode(newMode);
                    if (newMode) {
                      fetch("/api/admin/portraits").then((r) => r.json()).then((d) => {
                        if (d.portraits) setAdminPortraits(d.portraits);
                      }).catch(() => {});
                    } else {
                      setAdminPortraits([]);
                    }
                  }}
                  className={`hidden md:inline-flex px-2 py-1 rounded border text-[9px] uppercase tracking-wider transition-all touch-safe min-w-[44px] ${
                    adminMode ? "border-yellow-500/60 text-yellow-400 bg-yellow-900/20" : "border-white/10 text-[rgba(240,237,232,0.3)]"
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {adminMode ? "⚡ Admin" : "🔧 Admin"}
                </button>
              )}

              <button onClick={() => setShowTerms(true)}
                className="hidden md:inline-flex text-[9px] px-2 py-1 rounded border border-white/10 text-[rgba(240,237,232,0.3)] hover:text-white/60 transition-all uppercase tracking-wider touch-safe min-w-[44px]"
                style={{ fontFamily: "'DM Mono', monospace" }}>Terms</button>

              <PwaInstallButton />

              {/* Avatar — far right */}
              <div className="relative" ref={menuRef}>
                  <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  title={`${user?.email || "No email"} · ${portraitCount} portrait${portraitCount !== 1 ? "s" : ""}`}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full ring-2 ring-white/10 hover:ring-[#C8B99A]/40 transition-all overflow-hidden flex-shrink-0"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-[rgba(200,185,154,0.15)] flex items-center justify-center text-[10px] md:text-xs text-[#C8B99A] font-medium"
                      style={{ fontFamily: "'DM Mono', monospace" }}>
                      {getInitials(profileName || user?.name)}
                    </div>
                  )}
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 min-w-[160px] bg-[rgba(8,8,8,0.96)] border border-white/10 rounded-xl py-1.5 shadow-xl z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(profileName || user?.name) && (
                      <div className="px-4 py-2 text-xs text-[rgba(240,237,232,0.4)] border-b border-white/5 truncate"
                        style={{ fontFamily: "'DM Mono', monospace" }}>
                        {profileName || user?.name}
                      </div>
                    )}
                    <button onClick={() => {
                      const link = `${window.location.origin}/ref/${encodeURIComponent(user?.email || "")}`;
                      navigator.clipboard.writeText(link);
                      toast("Referral link copied! Give 5, get 5.", { className: "toast-custom", icon: "🎁", duration: 3000 });
                    }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[rgba(240,237,232,0.6)] hover:text-[#C8B99A] hover:bg-[rgba(200,185,154,0.05)] transition-colors"
                      style={{ fontFamily: "'DM Mono', monospace" }}>🎁 Invite friends (5 credits)</button>
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[rgba(240,237,232,0.6)] hover:text-[#C8B99A] hover:bg-[rgba(200,185,154,0.05)] transition-colors"
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </>
          ) : (
            <motion.button
              onClick={() => signIn("google")}
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
      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} />
    </motion.header>
  );
}
