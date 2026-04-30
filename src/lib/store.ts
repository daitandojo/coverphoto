"use client";

import { create } from "zustand";
import type { PortraitImage, PortraitStyle, UploadedImage } from "@/types";

interface PortraitStore {
  credits: number;
  uploadedImages: UploadedImage[];
  portraits: PortraitImage[];
  isGenerating: boolean;
  showBuyCredits: boolean;
  showShareCard: boolean;
  isFirstRun: boolean;
  sessionId: string | null;

  // New: tier & type selection
  portraitCount: number;
  selectedTypes: string[];
  showTypePicker: boolean;
  promptEditEnabled: boolean;
  customPrompts: Record<string, string>;

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

  // New actions
  setPortraitCount: (count: number) => void;
  setSelectedTypes: (types: string[]) => void;
  toggleType: (typeId: string) => void;
  setShowTypePicker: (show: boolean) => void;
  setPromptEditEnabled: (enabled: boolean) => void;
  setCustomPrompts: (prompts: Record<string, string>) => void;
  selectAll: () => void;
  selectNone: () => void;
}

export const usePortraitStore = create<PortraitStore>((set, get) => ({
  credits: 0,
  uploadedImages: [],
  portraits: [],
  isGenerating: false,
  showBuyCredits: false,
  showShareCard: false,
  isFirstRun: true,
  sessionId: null,

  portraitCount: 4,
  selectedTypes: ["executive", "founder", "statesperson", "outdoors"],
  showTypePicker: false,
  promptEditEnabled: false,
  customPrompts: {},

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
    set((state) => ({
      isGenerating: true,
      portraits: state.selectedTypes.map((t, i) => ({
        id: `portrait-${i}`,
        url: "",
        status: "generating" as const,
        style: t as PortraitStyle,
      })),
    })),

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
    set({ portraits: [], isGenerating: false }),

  redoPortrait: (id) =>
    set((state) => ({
      credits: state.credits - 1,
      portraits: state.portraits.map((p) =>
        p.id === id ? { ...p, status: "generating" as const, url: "" } : p
      ),
    })),

  completeFirstRun: () => set({ isFirstRun: false }),

  setPortraitCount: (count) => set({ portraitCount: count }),
  setSelectedTypes: (types) => set({ selectedTypes: types }),
  toggleType: (typeId) =>
    set((state) => {
      const isSelected = state.selectedTypes.includes(typeId);
      if (isSelected) {
        if (state.selectedTypes.length <= state.portraitCount && state.selectedTypes.length <= 1) return state;
        return { selectedTypes: state.selectedTypes.filter((t) => t !== typeId) };
      }
      const max = state.portraitCount;
      if (state.selectedTypes.length >= max) return state;
      return { selectedTypes: [...state.selectedTypes, typeId] };
    }),
  setShowTypePicker: (show) => set({ showTypePicker: show }),
  setPromptEditEnabled: (enabled) => set({ promptEditEnabled: enabled }),
  setCustomPrompts: (prompts) => set({ customPrompts: prompts }),
  selectAll: () => set((state) => ({ selectedTypes: state.selectedTypes.length >= 12 ? [] : ["executive","founder","statesperson","outdoors","passport","linkedin","artist","athlete","scholar","minimalist","romantic","maverick"] })),
  selectNone: () => set({ selectedTypes: [] }),
}));
