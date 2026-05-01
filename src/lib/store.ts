"use client";

import { create } from "zustand";
import type { PortraitImage, UploadedImage } from "@/types";
import { BRIEFS } from "@/lib/prompts";
import { SPECIALTIES } from "@/lib/specialties";

type TypeCounter = Record<string, number>;

interface PortraitStore {
  credits: number;
  isFirstRun: boolean;
  uploadedImages: UploadedImage[];
  portraits: PortraitImage[];
  isGenerating: boolean;
  showShareCard: boolean;
  sessionId: string | null;
  showBuyCredits: boolean;

  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelPinned: boolean;
  rightPanelPinned: boolean;

  typeCounters: TypeCounter;
  promptEditEnabled: boolean;
  customPrompts: Record<string, string>;
  specialCounters: TypeCounter;
  specialFields: Record<string, Record<string, string>>;

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

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (o: boolean) => void;
  setRightPanelOpen: (o: boolean) => void;
  pinLeftPanel: (p: boolean) => void;
  pinRightPanel: (p: boolean) => void;

  incrementType: (id: string) => void;
  decrementType: (id: string) => void;
  resetCounters: () => void;
  totalSelected: () => number;
  selectedTypesList: () => string[];
  setPromptEditEnabled: (e: boolean) => void;
  setCustomPrompts: (p: Record<string, string>) => void;

  incrementSpecial: (id: string) => void;
  decrementSpecial: (id: string) => void;
  setSpecialField: (id: string, key: string, value: string) => void;
}

function makeTC(): TypeCounter {
  const c: TypeCounter = {};
  BRIEFS.forEach((b) => (c[b.id] = 0));
  SPECIALTIES.forEach((s) => (c[s.id] = 0));
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

  leftPanelOpen: true,
  rightPanelOpen: true,
  leftPanelPinned: true,
  rightPanelPinned: true,

  typeCounters: makeTC(),
  promptEditEnabled: false,
  customPrompts: {},
  specialCounters: makeTC(),
  specialFields: {},

  setCredits: (c) => set({ credits: c }),
  completeFirstRun: () => set({ isFirstRun: false }),

  addUploadedImage: (img) =>
    set((s) => ({ uploadedImages: s.uploadedImages.length < 3 ? [...s.uploadedImages, img] : s.uploadedImages })),
  removeUploadedImage: (id) => set((s) => ({ uploadedImages: s.uploadedImages.filter((i) => i.id !== id) })),
  clearUploadedImages: () => set({ uploadedImages: [] }),

  startGeneration: () => {
    const types = get().selectedTypesList();
    const specs = Object.entries(get().specialCounters).flatMap(([k, v]) => Array(v).fill(k));
    const all = [...types, ...specs];
    set({
      isGenerating: true,
      portraits: all.map((t, i) => ({ id: `portrait-${i}`, url: "", status: "generating" as const, style: t as any })),
    });
  },

  updatePortrait: (id, u) => set((s) => ({ portraits: s.portraits.map((p) => (p.id === id ? { ...p, ...u } : p)) })),
  setShowShareCard: (s) => set({ showShareCard: s }),
  setSessionId: (s) => set({ sessionId: s }),
  resetPortraits: () => set({ portraits: [], isGenerating: false }),
  redoPortrait: (id) => set((s) => ({ credits: s.credits - 1, portraits: s.portraits.map((p) => (p.id === id ? { ...p, status: "generating" as const, url: "" } : p)) })),
  setShowBuyCredits: (s) => set({ showBuyCredits: s }),

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen, leftPanelPinned: !s.leftPanelOpen ? true : s.leftPanelPinned })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen, rightPanelPinned: !s.rightPanelOpen ? true : s.rightPanelPinned })),
  setLeftPanelOpen: (o) => set({ leftPanelOpen: o }),
  setRightPanelOpen: (o) => set({ rightPanelOpen: o }),
  pinLeftPanel: (p) => set({ leftPanelPinned: p }),
  pinRightPanel: (p) => set({ rightPanelPinned: p }),

  incrementType: (id) => set((s) => ({ typeCounters: { ...s.typeCounters, [id]: (s.typeCounters[id] || 0) + 1 } })),
  decrementType: (id) => set((s) => ({ typeCounters: { ...s.typeCounters, [id]: Math.max(0, (s.typeCounters[id] || 0) - 1) } })),
  resetCounters: () => set({ typeCounters: makeTC(), specialCounters: makeTC(), specialFields: {} }),
  totalSelected: () => Object.values(get().typeCounters).reduce((a, b) => a + b, 0) + Object.values(get().specialCounters).reduce((a, b) => a + b, 0),
  selectedTypesList: () => Object.entries(get().typeCounters).flatMap(([k, v]) => Array(v).fill(k)),
  setPromptEditEnabled: (e) => set({ promptEditEnabled: e }),
  setCustomPrompts: (p) => set({ customPrompts: p }),

  incrementSpecial: (id) => set((s) => ({ specialCounters: { ...s.specialCounters, [id]: (s.specialCounters[id] || 0) + 1 } })),
  decrementSpecial: (id) => set((s) => ({ specialCounters: { ...s.specialCounters, [id]: Math.max(0, (s.specialCounters[id] || 0) - 1) } })),
  setSpecialField: (id, key, value) => set((s) => ({ specialFields: { ...s.specialFields, [id]: { ...(s.specialFields[id] || {}), [key]: value } } })),
}));
