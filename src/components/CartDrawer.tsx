"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GarmentArt } from "./GarmentArt";
import { cartTotal, useCart, useCartHydration } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";

export function CartThumb({ item, className }: { item: CartItem; className?: string }) {
  if (item.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.image} alt="" className={`object-contain ${className ?? ""}`} />;
  }
  return <GarmentArt kind={item.kind} color={item.colorHex} className={className} />;
}

export function CartDrawer() {
  useCartHydration();
  const { items, isOpen, close, setQty, remove } = useCart();
  const total = cartTotal(items);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            className="fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col bg-coal shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="display text-2xl">Tu carrito</h2>
              <button type="button" onClick={close} aria-label="Cerrar carrito" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-muted">Todavía no agregaste nada.</p>
                  <Link href="/tienda" onClick={close} className="rounded-full border border-cream px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase hover:bg-cream hover:text-ink">
                    Ir a la tienda
                  </Link>
                </motion.div>
              ) : (
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0 }}
                        className="flex gap-4 py-5"
                      >
                        <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-md bg-surface p-2">
                          <CartThumb item={item} className="h-full w-full" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <Link href={`/producto/${item.slug}`} onClick={close} className="font-medium hover:text-ember">
                              {item.name}
                            </Link>
                            <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
                          </div>
                          <span className="mt-1 text-sm text-muted">
                            {item.color} · Talle {item.size}
                          </span>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-line">
                              <button type="button" aria-label="Restar uno" onClick={() => setQty(item.variantId, item.qty - 1)} className="h-9 w-9 text-lg">−</button>
                              <span className="w-6 text-center text-sm" aria-live="polite">{item.qty}</span>
                              <button
                                type="button"
                                aria-label="Sumar uno"
                                disabled={item.qty >= item.maxStock}
                                onClick={() => setQty(item.variantId, item.qty + 1)}
                                className="h-9 w-9 text-lg disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                            <button type="button" onClick={() => remove(item.variantId)} className="text-xs text-muted underline-offset-4 hover:text-cream hover:underline">
                              Quitar
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="label">Subtotal</span>
                  <motion.span key={total} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xl font-semibold">
                    {formatPrice(total)}
                  </motion.span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="flex h-13 items-center justify-center rounded-full bg-ember text-sm font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-ember-soft"
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
