"use client";

import { create } from "zustand";
import type { PortraitImage, UploadedImage } from "@/types";
import { BRIEFS } from "@/lib/prompts";

type TypeCounter = Record<string, number>;

interface PortraitStore {
  // Credits
  credits: number;
  isFirstRun: boolean;

  // Upload
  uploadedImages: UploadedImage[];

  // Generation
  portraits: PortraitImage[];
  isGenerating: boolean;
  showShareCard: boolean;
  sessionId: string | null;

  // Panels
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelPinned: boolean;
  rightPanelPinned: boolean;

  // Builder
  typeCounters: TypeCounter;
  promptEditEnabled: boolean;
  customPrompts: Record<string, string>;

  // Credit modal
  showBuyCredits: boolean;

  // Actions
  setCredits: (c: number) => void;
  completeFirstRun: () => void;
  addUploadedImage: (img: UploadedImage) => void;
  removeUploadedImage: (id: string) => void;
  clearUploadedImages: () => void;
  startGeneration: () => void;
  updatePortrait: (id: string, u: Partial<PortraitImage>) => void;
  setShowShareCard: (s: boolean) => void;
  setSessionId: (s: string | null) => void;
  resetPortraits: () => void;
  redoPortrait: (id: string) => void;
  setShowBuyCredits: (s: boolean) => void;

  // Panel actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (o: boolean) => void;
  setRightPanelOpen: (o: boolean) => void;
  pinLeftPanel: (p: boolean) => void;
  pinRightPanel: (p: boolean) => void;

  // Builder actions
  incrementType: (id: string) => void;
  decrementType: (id: string) => void;
  resetCounters: () => void;
  totalSelected: () => number;
  selectedTypesList: () => string[];
  setPromptEditEnabled: (e: boolean) => void;
  setCustomPrompts: (p: Record<string, string>) => void;
}

function makeCounters(): TypeCounter {
  const c: TypeCounter = {};
  BRIEFS.forEach((b) => (c[b.id] = 0));
  return c;
}

export const usePortraitStore = create<PortraitStore>((set, get) => ({
  credits: 0,
  isFirstRun: true,
  uploadedImages: [],
  portraits: [],
  isGenerating: false,
  showShareCard: false,
  sessionId: null,
  showBuyCredits: false,

  leftPanelOpen: false,
  rightPanelOpen: false,
  leftPanelPinned: false,
  rightPanelPinned: false,

  typeCounters: makeCounters(),
  promptEditEnabled: false,
  customPrompts: {},

  setCredits: (c) => set({ credits: c }),
  completeFirstRun: () => set({ isFirstRun: false }),

  addUploadedImage: (img) =>
    set((s) => ({
      uploadedImages: s.uploadedImages.length < 4 ? [...s.uploadedImages, img] : s.uploadedImages,
    })),
  removeUploadedImage: (id) =>
    set((s) => ({ uploadedImages: s.uploadedImages.filter((i) => i.id !== id) })),
  clearUploadedImages: () => set({ uploadedImages: [] }),

  startGeneration: () => {
    const typesList = get().selectedTypesList();
    set({
      isGenerating: true,
      portraits: typesList.map((t, i) => ({
        id: `portrait-${i}`,
        url: "",
        status: "generating" as const,
        style: t as any,
      })),
    });
  },

  updatePortrait: (id, u) =>
    set((s) => ({ portraits: s.portraits.map((p) => (p.id === id ? { ...p, ...u } : p)) })),
  setShowShareCard: (s) => set({ showShareCard: s }),
  setSessionId: (s) => set({ sessionId: s }),
  resetPortraits: () => set({ portraits: [], isGenerating: false }),
  redoPortrait: (id) =>
    set((s) => ({
      credits: s.credits - 1,
      portraits: s.portraits.map((p) =>
        p.id === id ? { ...p, status: "generating" as const, url: "" } : p
      ),
    })),
  setShowBuyCredits: (s) => set({ showBuyCredits: s }),

  // Panels
  toggleLeftPanel: () =>
    set((s) => ({ leftPanelOpen: !s.leftPanelOpen, leftPanelPinned: !s.leftPanelOpen ? true : s.leftPanelPinned })),
  toggleRightPanel: () =>
    set((s) => ({ rightPanelOpen: !s.rightPanelOpen, rightPanelPinned: !s.rightPanelOpen ? true : s.rightPanelPinned })),
  setLeftPanelOpen: (o) => set({ leftPanelOpen: o }),
  setRightPanelOpen: (o) => set({ rightPanelOpen: o }),
  pinLeftPanel: (p) => set({ leftPanelPinned: p }),
  pinRightPanel: (p) => set({ rightPanelPinned: p }),

  // Builder
  incrementType: (id) =>
    set((s) => ({ typeCounters: { ...s.typeCounters, [id]: (s.typeCounters[id] || 0) + 1 } })),
  decrementType: (id) =>
    set((s) => ({
      typeCounters: {
        ...s.typeCounters,
        [id]: Math.max(0, (s.typeCounters[id] || 0) - 1),
      },
    })),
  resetCounters: () => set({ typeCounters: makeCounters() }),
  totalSelected: () => Object.values(get().typeCounters).reduce((a, b) => a + b, 0),
  selectedTypesList: () => {
    const s = get().typeCounters;
    return Object.entries(s).flatMap(([k, v]) => Array(v).fill(k));
  },
  setPromptEditEnabled: (e) => set({ promptEditEnabled: e }),
  setCustomPrompts: (p) => set({ customPrompts: p }),
}));
