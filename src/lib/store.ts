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
  libraryPortraits: PortraitImage[];
  workbenchPortraits: PortraitImage[];
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

  libIdx: number;
  wbIdx: number;

  setCredits: (c: number) => void;
  completeFirstRun: () => void;
  addUploadedImage: (img: UploadedImage) => void;
  removeUploadedImage: (id: string) => void;
  clearUploadedImages: () => void;
  addToWorkbench: (types: string[]) => void;
  updateWorkbenchPortrait: (id: string, u: Partial<PortraitImage>) => void;
  moveToLibrary: (id: string) => Promise<void>;
  dismissFromWorkbench: (id: string) => Promise<void>;
  deleteFromLibrary: (id: string) => Promise<void>;
  setShowShareCard: (s: boolean) => void;
  setSessionId: (s: string | null) => void;
  resetWorkbench: () => void;
  setShowBuyCredits: (s: boolean) => void;
  setLibIdx: (i: number) => void;
  setWbIdx: (i: number) => void;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelOpen: (o: boolean) => void;
  setRightPanelOpen: (o: boolean) => void;
  pinLeftPanel: (p: boolean) => void;
  pinRightPanel: (p: boolean) => void;

  incrementType: (id: string) => void;
  decrementType: (id: string) => void;
  resetCounters: () => void;
  selectOneOfEach: () => void;
  totalSelected: () => number;
  setPromptEditEnabled: (e: boolean) => void;
  setCustomPrompts: (p: Record<string, string>) => void;

  incrementSpecial: (id: string) => void;
  decrementSpecial: (id: string) => void;
  setSpecialField: (id: string, key: string, value: string) => void;
  loadSession: (data: { portraits: any[]; sessionId: string | null; credits: number }) => void;
}

function makeTC(): TypeCounter {
  const c: TypeCounter = {};
  BRIEFS.forEach((b) => (c[b.id] = 0));
  SPECIALTIES.forEach((s) => (c[s.id] = 0));
  return c;
}

let idGen = Date.now();

export const usePortraitStore = create<PortraitStore>((set, get) => ({
  credits: 0,
  isFirstRun: true,
  uploadedImages: [],
  libraryPortraits: [],
  workbenchPortraits: [],
  isGenerating: false,
  showShareCard: false,
  sessionId: null,
  showBuyCredits: false,
  libIdx: 0,
  wbIdx: 0,

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
  addUploadedImage: (img) => set((s) => ({ uploadedImages: s.uploadedImages.length < 3 ? [...s.uploadedImages, img] : s.uploadedImages })),
  removeUploadedImage: (id) => set((s) => ({ uploadedImages: s.uploadedImages.filter((i) => i.id !== id) })),
  clearUploadedImages: () => set({ uploadedImages: [] }),

  addToWorkbench: (types) => {
    const placeholders: PortraitImage[] = types.map((t) => ({
      id: `portrait-${idGen++}`,
      url: "",
      status: "generating",
      style: t as any,
    }));
    set((s) => ({ isGenerating: true, workbenchPortraits: [...s.workbenchPortraits, ...placeholders] }));
  },

  updateWorkbenchPortrait: (id, u) => set((s) => ({ workbenchPortraits: s.workbenchPortraits.map((p) => (p.id === id ? { ...p, ...u } : p)) })),

  moveToLibrary: async (id) => {
    const s = get();
    const found = s.workbenchPortraits.find((p) => p.id === id);
    if (!found) return;
    const newItem: PortraitImage = { id: found.id, url: found.url, style: found.style, status: "completed" };
    if (found.error) newItem.error = found.error;
    const updatedLibrary = [...s.libraryPortraits, newItem];
    set({ workbenchPortraits: s.workbenchPortraits.filter((p) => p.id !== id), libraryPortraits: updatedLibrary, wbIdx: Math.max(0, s.wbIdx - 1) });
    try { await fetch("/api/library/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ portraits: updatedLibrary }) }); } catch {}
  },

  dismissFromWorkbench: async (id) => {
    const s = get();
    const idx = s.workbenchPortraits.findIndex((p) => p.id === id);
    set({ workbenchPortraits: s.workbenchPortraits.filter((p) => p.id !== id), wbIdx: Math.max(0, Math.min(idx, s.wbIdx - 1)) });
    try { await fetch("/api/library/dismiss", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch {}
  },

  deleteFromLibrary: async (id) => {
    const s = get();
    const updatedLibrary = s.libraryPortraits.filter((p) => p.id !== id);
    set({ libraryPortraits: updatedLibrary, libIdx: Math.max(0, Math.min(s.libraryPortraits.findIndex((p) => p.id === id), s.libIdx - 1)) });
    try { await fetch("/api/library/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch {}
  },

  setShowShareCard: (s) => set({ showShareCard: s }),
  setSessionId: (s) => set({ sessionId: s }),
  resetWorkbench: () => set({ workbenchPortraits: [], isGenerating: false, wbIdx: 0 }),
  setShowBuyCredits: (s) => set({ showBuyCredits: s }),
  setLibIdx: (i) => set({ libIdx: i }),
  setWbIdx: (i) => set({ wbIdx: i }),

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen, leftPanelPinned: !s.leftPanelOpen ? true : s.leftPanelPinned })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen, rightPanelPinned: !s.rightPanelOpen ? true : s.rightPanelPinned })),
  setLeftPanelOpen: (o) => set({ leftPanelOpen: o }),
  setRightPanelOpen: (o) => set({ rightPanelOpen: o }),
  pinLeftPanel: (p) => set({ leftPanelPinned: p }),
  pinRightPanel: (p) => set({ rightPanelPinned: p }),

  incrementType: (id) => set((s) => ({ typeCounters: { ...s.typeCounters, [id]: (s.typeCounters[id] || 0) + 1 } })),
  decrementType: (id) => set((s) => ({ typeCounters: { ...s.typeCounters, [id]: Math.max(0, (s.typeCounters[id] || 0) - 1) } })),
  resetCounters: () => set({ typeCounters: makeTC(), specialCounters: makeTC(), specialFields: {} }),
  selectOneOfEach: () => {
    const tc = makeTC();
    BRIEFS.forEach((b) => (tc[b.id] = 1));
    set({ typeCounters: tc });
  },
  totalSelected: () => Object.values(get().typeCounters).reduce((a, b) => a + b, 0) + Object.values(get().specialCounters).reduce((a, b) => a + b, 0),
  setPromptEditEnabled: (e) => set({ promptEditEnabled: e }),
  setCustomPrompts: (p) => set({ customPrompts: p }),
  incrementSpecial: (id) => set((s) => ({ specialCounters: { ...s.specialCounters, [id]: (s.specialCounters[id] || 0) + 1 } })),
  decrementSpecial: (id) => set((s) => ({ specialCounters: { ...s.specialCounters, [id]: Math.max(0, (s.specialCounters[id] || 0) - 1) } })),
  setSpecialField: (id, key, value) => set((s) => ({ specialFields: { ...s.specialFields, [id]: { ...(s.specialFields[id] || {}), [key]: value } } })),

  loadSession: (data) => {
    const portraits: PortraitImage[] = (data.portraits || []).map((p: any, i: number) => ({
      id: p.id || `restored-${i}`,
      url: p.url || "",
      style: p.style || "executive",
      status: "completed",
      error: p.error,
    }));
    set({ libraryPortraits: portraits, sessionId: data.sessionId, credits: data.credits });
  },
}));
