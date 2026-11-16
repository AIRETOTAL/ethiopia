"use client";

import { create } from "zustand";

/** Avisa al resto de la página cuando terminó la intro (para que las prendas entren después). */
export const useIntro = create<{ done: boolean; finish: () => void }>()((set) => ({
  done: false,
  finish: () => set({ done: true }),
}));
