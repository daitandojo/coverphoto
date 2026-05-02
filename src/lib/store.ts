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
  libIdx: number;
  wbIdx: number;

  leftPanelOpen: boolean;
  rightPanelOpen: boolean;

  typeCounters: TypeCounter;
  promptEditEnabled: boolean;
  customPrompts: Record<string, string>;
  specialCounters: TypeCounter;
  specialFields: Record<string, Record<string, string>>;

  constraints: Record<string, boolean>;

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
  saveState: () => Promise<void>;
  setShowShareCard: (s: boolean) => void;
  setSessionId: (s: string | null) => void;
  resetWorkbench: () => void;
  setShowBuyCredits: (s: boolean) => void;
  setLibIdx: (i: number) => void;
  setWbIdx: (i: number) => void;

  toggleConstraint: (key: string) => void;
  setLeftPanelOpen: (o: boolean) => void;
  setRightPanelOpen: (o: boolean) => void;

  incrementType: (id: string) => void;
  decrementType: (id: string) => void;
  resetCounters: () => void;
  selectOneOfEach: () => void;
  totalSelected: () => number;
  selectedTypesList: () => string[];
  setPromptEditEnabled: (e: boolean) => void;
  setCustomPrompts: (p: Record<string, string>) => void;

  incrementSpecial: (id: string) => void;
  decrementSpecial: (id: string) => void;
  setSpecialField: (id: string, key: string, value: string) => void;
  loadSession: (data: { portraits: any[]; uploadedImages?: any[]; credits: number }) => void;
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

  typeCounters: makeTC(),
  promptEditEnabled: false,
  customPrompts: {},
  specialCounters: makeTC(),
  specialFields: {},

  constraints: { lookAtCamera: false, bright: false, winking: false, naked: false, smiling: false, flirty: false, serious: false, lookingAway: false, dramatic: false, vintage: false, friendly: false, tanned: false, makeUp: false, onHoliday: false, blackWhite: false, withOthers: false, active: false, passionate: false, mugShot: false },

  setCredits: (c) => set({ credits: c }),
  completeFirstRun: () => set({ isFirstRun: false }),
  addUploadedImage: (img) => { set((s) => ({ uploadedImages: s.uploadedImages.length < 3 ? [...s.uploadedImages, img] : s.uploadedImages })); get().saveState(); },
  removeUploadedImage: (id) => { set((s) => ({ uploadedImages: s.uploadedImages.filter((i) => i.id !== id) })); get().saveState(); },
  clearUploadedImages: () => { set({ uploadedImages: [] }); get().saveState(); },

  saveState: async () => {
    const s = get();
    // Convert blob URLs to data URLs so they survive reload
    const uploadedImages = await Promise.all(s.uploadedImages.map(async (img) => {
      let preview = img.preview;
      if (preview && preview.startsWith("blob:")) {
        try {
          const resp = await fetch(preview);
          const blob = await resp.blob();
          preview = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
        } catch {}
      }
      return { id: img.id, preview };
    }));
    try { await fetch("/api/state/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uploadedImages, libraryPortraits: s.libraryPortraits, workbenchPortraits: s.workbenchPortraits }) }); } catch {}
  },

  addToWorkbench: (types) => {
    const placeholders: PortraitImage[] = types.map((t) => ({ id: `portrait-${idGen++}`, url: "", status: "generating", style: t as any }));
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
    get().saveState();
  },

  dismissFromWorkbench: async (id) => {
    const s = get();
    const idx = s.workbenchPortraits.findIndex((p) => p.id === id);
    set({ workbenchPortraits: s.workbenchPortraits.filter((p) => p.id !== id), wbIdx: Math.max(0, Math.min(idx, s.wbIdx - 1)) });
    try { await fetch("/api/library/dismiss", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); } catch {}
    get().saveState();
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

  toggleConstraint: (key) => set((s) => ({ constraints: { ...s.constraints, [key]: !s.constraints[key] } })),

  setLeftPanelOpen: (o) => set({ leftPanelOpen: o }),
  setRightPanelOpen: (o) => set({ rightPanelOpen: o }),

  incrementType: (id) => set((s) => ({ typeCounters: { ...s.typeCounters, [id]: (s.typeCounters[id] || 0) + 1 } })),
  decrementType: (id) => set((s) => ({ typeCounters: { ...s.typeCounters, [id]: Math.max(0, (s.typeCounters[id] || 0) - 1) } })),
  resetCounters: () => set({ typeCounters: makeTC(), specialCounters: makeTC(), specialFields: {} }),
  selectOneOfEach: () => { const tc = makeTC(); BRIEFS.forEach((b) => (tc[b.id] = 1)); set({ typeCounters: tc }); },
  totalSelected: () => Object.values(get().typeCounters).reduce((a, b) => a + b, 0) + Object.values(get().specialCounters).reduce((a, b) => a + b, 0),
  selectedTypesList: () => Object.entries(get().typeCounters).flatMap(([k, v]) => Array(v).fill(k)),
  setPromptEditEnabled: (e) => set({ promptEditEnabled: e }),
  setCustomPrompts: (p) => set({ customPrompts: p }),
  incrementSpecial: (id) => set((s) => ({ specialCounters: { ...s.specialCounters, [id]: (s.specialCounters[id] || 0) + 1 } })),
  decrementSpecial: (id) => set((s) => ({ specialCounters: { ...s.specialCounters, [id]: Math.max(0, (s.specialCounters[id] || 0) - 1) } })),
  setSpecialField: (id, key, value) => set((s) => ({ specialFields: { ...s.specialFields, [id]: { ...(s.specialFields[id] || {}), [key]: value } } })),

  loadSession: (data) => {
    const portraits: PortraitImage[] = (data.portraits || []).map((p: any, i: number) => ({
      id: p.id || `restored-${i}`, url: p.url || "", style: p.style || "executive", status: "completed", error: p.error,
    }));
    // Only restore uploaded images that have valid data URLs (blob URLs don't survive reload)
    const uploadedImages: UploadedImage[] = (data.uploadedImages || []).filter((img: any) => img.preview && img.preview.startsWith("data:")).map((img: any) => ({
      id: img.id || `restored-img-${Math.random()}`, file: new File([], "restored"), preview: img.preview,
    }));
    set({ libraryPortraits: portraits, uploadedImages, credits: data.credits });
  },
}));
