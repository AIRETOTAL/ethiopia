"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductVisual } from "./ProductVisual";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Look, Product } from "@/lib/types";

interface ResolvedItem {
  product: Product;
  color: string;
}

function resolve(look: Look, products: Product[]): ResolvedItem[] {
  return look.items
    .map((it) => ({ product: products.find((p) => p.slug === it.slug)!, color: it.color }))
    .filter((x) => x.product);
}

/** Foto del look o, si no hay, la prenda de arriba + la de abajo apiladas. */
function Figure({ items, image }: { items: ResolvedItem[]; image?: string }) {
  if (image) {
    return (
      <div className="relative mx-auto h-[340px] w-[240px] overflow-hidden rounded-xl md:h-[420px] md:w-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    );
  }
  const isBottom = (k: string) => k === "pants" || k === "shorts";
  const top = items.find((i) => !isBottom(i.product.kind));
  const bottom = items.find((i) => isBottom(i.product.kind));
  return (
    <div className="relative mx-auto h-[340px] w-[150px] md:h-[400px] md:w-[180px]">
      {bottom && (
        <div className="absolute top-[40%] left-1/2 w-[74%] -translate-x-1/2">
          <ProductVisual product={bottom.product} color={bottom.color} className="w-full" />
        </div>
      )}
      {top && (
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2">
          <ProductVisual product={top.product} color={top.color} className="w-full" />
        </div>
      )}
      <div className="absolute bottom-0 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-md" />
    </div>
  );
}

export function Looks({ looks, products }: { looks: Look[]; products: Product[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const openLook = looks.find((l) => l.id === openId) ?? null;

  if (looks.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-bone py-20 text-cream">
      <div className="mx-auto max-w-[1440px] px-4 md:px-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-[0.72rem] tracking-[0.18em] text-muted uppercase">Armado por nosotros</span>
            <h2 className="display mt-2 text-5xl md:text-7xl">Probá el look</h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Pasá el mouse por cada outfit y tocá el que te guste para comprarlo completo o por partes.
          </p>
        </div>

        <div className="mt-12 flex snap-x gap-5 overflow-x-auto pb-6">
          {looks.map((look, i) => {
            const items = resolve(look, products);
            const dim = hover !== null && hover !== look.id;
            return (
              <motion.div
                key={look.id}
                className="shrink-0 snap-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.button
                  type="button"
                  onMouseEnter={() => setHover(look.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(look.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setOpenId(look.id)}
                  aria-label={`Ver look ${look.name}`}
                  className="flex flex-col items-center"
                  animate={{
                    filter: dim ? "blur(4px) grayscale(0.6)" : "blur(0px) grayscale(0)",
                    opacity: dim ? 0.45 : 1,
                    scale: hover === look.id ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <Figure items={items} image={look.image} />
                  <span className="display mt-4 text-lg">{look.name}</span>
                  <span className="text-xs text-muted">
                    {formatPrice(items.reduce((a, x) => a + x.product.price, 0))}
                  </span>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {openLook && <LookModal look={openLook} items={resolve(openLook, products)} onClose={() => setOpenId(null)} />}
      </AnimatePresence>
    </section>
  );
}

function LookModal({ look, items, onClose }: { look: Look; items: ResolvedItem[]; onClose: () => void }) {
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);

  function variantFor(it: ResolvedItem) {
    const size = sizes[it.product.id];
    return it.product.variants.find((v) => v.color === it.color && v.size === size && v.stock > 0) ?? null;
  }

  function addItem(it: ResolvedItem) {
    const v = variantFor(it);
    if (!v) return;
    add({
      variantId: v.id,
      productId: it.product.id,
      slug: it.product.slug,
      name: it.product.name,
      kind: it.product.kind,
      color: it.color,
      colorHex: v.colorHex,
      size: v.size,
      price: it.product.price,
      maxStock: v.stock,
      image: null,
    });
  }

  const allChosen = items.every((it) => variantFor(it));
  const total = items.reduce((a, x) => a + x.product.price, 0);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Look ${look.name}`}
        className="relative grid max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-coal text-cream md:grid-cols-[1fr_1.3fr]"
        initial={{ y: 60, scale: 0.94, rotateX: 12 }}
        animate={{ y: 0, scale: 1, rotateX: 0 }}
        exit={{ y: 40, scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ transformPerspective: 1000 }}
      >
        <div className="flex items-center justify-center bg-surface p-8">
          <Figure items={items} image={look.image} />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="label">Look</span>
              <h3 className="display text-3xl">{look.name}</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          {items.map((it, i) => (
            <motion.div
              key={it.product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex gap-3 rounded-lg border border-line p-3"
            >
              <div className="h-20 w-18 shrink-0">
                <ProductVisual product={it.product} color={it.color} view={it.product.images.some((i) => i.view === "front") ? "front" : "model"} className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{it.product.name}</span>
                  <span>{formatPrice(it.product.price)}</span>
                </div>
                <span className="text-xs text-muted">{it.color}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {it.product.sizes.map((s) => {
                    const v = it.product.variants.find((x) => x.color === it.color && x.size === s);
                    const out = !v || v.stock === 0;
                    const active = sizes[it.product.id] === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={out}
                        aria-pressed={active}
                        onClick={() => setSizes((m) => ({ ...m, [it.product.id]: s }))}
                        className={`h-9 min-w-9 rounded-md border px-2 text-xs ${active ? "border-cream bg-cream text-ink" : "border-line"} ${out ? "text-muted/40 line-through" : ""}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={!variantFor(it)}
                    onClick={() => {
                      addItem(it);
                      openCart();
                    }}
                    className="ml-auto text-xs text-ember disabled:text-muted/50"
                  >
                    Agregar solo esto
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          <button
            type="button"
            disabled={!allChosen}
            onClick={() => {
              items.forEach(addItem);
              onClose();
              setTimeout(openCart, 250);
            }}
            className="mt-auto flex h-12 items-center justify-between rounded-full bg-ember px-5 text-sm font-semibold tracking-[0.1em] text-ink uppercase hover:bg-ember-soft disabled:opacity-40"
          >
            <span>{allChosen ? "Agregar look completo" : "Elegí los talles"}</span>
            <span>{formatPrice(total)}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
