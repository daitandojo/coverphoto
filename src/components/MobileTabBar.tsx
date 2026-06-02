"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface TabDef {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface MobileTabBarProps {
  tabs: TabDef[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function MobileTabBar({ tabs, activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(8,8,8,0.97)] border-t border-white/[0.06] safe-area-bottom backdrop-blur-xl">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all touch-safe ${
                isActive ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"
              }`}
            >
              {/* Badge dot */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-1/4 w-1.5 h-1.5 rounded-full bg-[#C8B99A]" />
              )}
              <span className="text-sm leading-none">{tab.icon}</span>
              <span
                className={`text-[8px] uppercase tracking-wider leading-none ${
                  isActive ? "text-[#C8B99A]" : "text-[rgba(240,237,232,0.3)]"
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-full bg-[#C8B99A]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileTabPanel({
  id,
  activeTab,
  children,
}: {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {activeTab === id && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
