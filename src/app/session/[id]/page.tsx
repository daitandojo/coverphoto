"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";
import PortraitCard from "@/components/PortraitCard";
import type { PortraitImage } from "@/types";

export default function SessionPage() {
  const params = useParams();
  const id = params.id as string;
  const [sessionData, setSessionData] = useState<{
    portraits: PortraitImage[];
  } | null>(null);

  useEffect(() => {
    if (id) {
      // In a real app, fetch session data from API
      setSessionData({
        portraits: [
          { id: "0", style: "executive", url: "", status: "pending" },
          { id: "1", style: "founder", url: "", status: "pending" },
          { id: "2", style: "statesperson", url: "", status: "pending" },
          { id: "3", style: "outdoors", url: "", status: "pending" },
        ],
      });
    }
  }, [id]);

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="shimmer w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <h1
          className="text-3xl text-[#F0EDE8]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Portrait Session
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sessionData.portraits.map((p, i) => (
            <PortraitCard key={p.id} portrait={p} index={i} />
          ))}
        </div>
      </motion.div>
    </main>
  );
}
