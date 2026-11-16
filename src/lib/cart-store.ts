"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** se incrementa al agregar algo: dispara la animación del ícono del carrito */
  bump: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      bump: 0,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? s.items.map((i) =>
                i.variantId === item.variantId ? { ...i, qty: Math.min(i.qty + qty, i.maxStock) } : i,
              )
            : [...s.items, { ...item, qty: Math.min(qty, item.maxStock) }];
          return { items, bump: s.bump + 1 };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(0, Math.min(qty, i.maxStock)) } : i))
            .filter((i) => i.qty > 0),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "ethiopia-cart",
      partialize: (s) => ({ items: s.items }),
      skipHydration: true,
    },
  ),
);

export function cartTotal(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.qty, 0);
}

/** Carga el carrito guardado una vez montado (evita diferencias entre servidor y navegador). */
export function useCartHydration() {
  useEffect(() => {
    if (!useCart.persist.hasHydrated()) void useCart.persist.rehydrate();
  }, []);
}

/** true cuando el carrito guardado ya se cargó. */
export function useCartReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useCart.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}
