"use client";

import { create } from "zustand";
import type { PortraitImage, PortraitStyle, UploadedImage } from "@/types";

const STYLES: PortraitStyle[] = ["executive", "founder", "statesperson", "outdoors"];

interface PortraitStore {
  credits: number;
  uploadedImages: UploadedImage[];
  portraits: PortraitImage[];
  isGenerating: boolean;
  showBuyCredits: boolean;
  showShareCard: boolean;
  isFirstRun: boolean;
  sessionId: string | null;

  setCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
  addUploadedImage: (image: UploadedImage) => void;
  removeUploadedImage: (id: string) => void;
  clearUploadedImages: () => void;
  startGeneration: () => void;
  updatePortrait: (id: string, updates: Partial<PortraitImage>) => void;
  setShowBuyCredits: (show: boolean) => void;
  setShowShareCard: (show: boolean) => void;
  setSessionId: (id: string | null) => void;
  resetPortraits: () => void;
  redoPortrait: (id: string) => void;
  completeFirstRun: () => void;
}

export const usePortraitStore = create<PortraitStore>((set, get) => ({
  credits: 0,
  uploadedImages: [],
  portraits: STYLES.map((style, i) => ({
    id: `portrait-${i}`,
    url: "",
    style,
    status: "pending" as const,
  })),
  isGenerating: false,
  showBuyCredits: false,
  showShareCard: false,
  isFirstRun: true,
  sessionId: null,

  setCredits: (credits) => set({ credits }),

  deductCredits: (amount) =>
    set((state) => ({ credits: Math.max(0, state.credits - amount) })),

  addUploadedImage: (image) =>
    set((state) => ({
      uploadedImages:
        state.uploadedImages.length < 4
          ? [...state.uploadedImages, image]
          : state.uploadedImages,
    })),

  removeUploadedImage: (id) =>
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((img) => img.id !== id),
    })),

  clearUploadedImages: () => set({ uploadedImages: [] }),

  startGeneration: () =>
    set({
      isGenerating: true,
      portraits: STYLES.map((style, i) => ({
        id: `portrait-${i}`,
        url: "",
        style,
        status: "generating" as const,
      })),
    }),

  updatePortrait: (id, updates) =>
    set((state) => ({
      portraits: state.portraits.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  setShowBuyCredits: (show) => set({ showBuyCredits: show }),

  setShowShareCard: (show) => set({ showShareCard: show }),

  setSessionId: (id) => set({ sessionId: id }),

  resetPortraits: () =>
    set({
      portraits: STYLES.map((style, i) => ({
        id: `portrait-${i}`,
        url: "",
        style,
        status: "pending" as const,
      })),
      isGenerating: false,
    }),

  redoPortrait: (id) =>
    set((state) => ({
      credits: state.credits - 1,
      portraits: state.portraits.map((p) =>
        p.id === id ? { ...p, status: "generating" as const, url: "" } : p
      ),
    })),

  completeFirstRun: () => set({ isFirstRun: false }),
}));
