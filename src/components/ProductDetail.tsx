"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { AccordionItem } from "./Accordion";
import { ProductVisual, viewsFor } from "./ProductVisual";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const CATEGORY_LABEL: Record<Product["category"], string> = {
  tops: "Remeras y tops",
  sweaters: "Sweaters",
  camperas: "Camperas",
  jeans: "Jeans",
  shorts: "Shorts",
};

const VIEW_LABEL = { front: "Prenda", back: "Espalda", model: "Puesto", detail: "Detalle", hang: "Prenda" } as const;

interface Props {
  product: Product;
  initialColor?: string;
  /** si viene, muestra la X para cerrar (modo panel del perchero) */
  onClose?: () => void;
  /** id compartido para la animación desde el perchero */
  layoutId?: string;
}

export function ProductDetail({ product, initialColor, onClose, layoutId }: Props) {
  const [color, setColor] = useState(initialColor ?? product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [viewIndex, setViewIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const shake = useAnimationControls();
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);

  const views = useMemo(() => viewsFor(product, color), [product, color]);
  const current = views[Math.min(viewIndex, views.length - 1)];
  const variantsForColor = product.variants.filter((v) => v.color === color);
  const selected = variantsForColor.find((v) => v.size === size) ?? null;
  const colorHex = product.colors.find((c) => c.name === color)?.hex ?? "#888";
  const soldOut = variantsForColor.every((v) => v.stock === 0);

  function pickColor(name: string) {
    setColor(name);
    const stillAvailable = product.variants.find((v) => v.color === name && v.size === size && v.stock > 0);
    if (!stillAvailable) setSize(null);
    setQty(1);
    setViewIndex(0);
  }

  function handleAdd() {
    if (!selected) {
      shake.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
      return;
    }
    add(
      {
        variantId: selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        kind: product.kind,
        color,
        colorHex,
        size: selected.size,
        price: product.price,
        maxStock: selected.stock,
        image: views.find((v) => v.view === "front")?.url ?? views[0]?.url ?? null,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setTimeout(() => openCart(), 450);
  }

  return (
    <div className="grid w-full items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10">
      {/* Galería */}
      <div className="relative flex flex-col items-center">
        <motion.div layoutId={layoutId} className="relative aspect-[5/6] w-full max-w-[460px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={`${color}-${current.view}-${viewIndex}`}
              className="absolute inset-0"
              initial={{ opacity: 0, rotateY: -35, scale: 0.94 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 35, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 900 }}
            >
              <ProductVisual
                product={product}
                color={color}
                view={current.view}
                url={current.url}
                className={current.url && current.view !== "front" ? "h-full w-full rounded-xl object-cover" : "h-full w-full"}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {views.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Vista anterior"
              onClick={() => setViewIndex((i) => (i - 1 + views.length) % views.length)}
              className="absolute top-1/2 left-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/60 backdrop-blur hover:border-cream"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button
              type="button"
              aria-label="Vista siguiente"
              onClick={() => setViewIndex((i) => (i + 1) % views.length)}
              className="absolute top-1/2 right-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-ink/60 backdrop-blur hover:border-cream"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
            <div className="mt-3 flex items-center gap-2">
              {views.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ver ${VIEW_LABEL[v.view]}`}
                  onClick={() => setViewIndex(i)}
                  className="flex h-6 items-center"
                >
                  <motion.span
                    className="block h-1 rounded-full bg-cream"
                    animate={{ width: i === viewIndex ? 22 : 6, opacity: i === viewIndex ? 1 : 0.35 }}
                  />
                </button>
              ))}
            </div>
            <span className="label mt-1">{VIEW_LABEL[current.view]}</span>
          </>
        )}
      </div>

      {/* Panel de compra */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-xl border border-line bg-coal/90 p-5 backdrop-blur md:p-6"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        )}
        <span className="label">Ethiopia · {CATEGORY_LABEL[product.category]}</span>
        <h2 className="display mt-2 pr-10 text-3xl md:text-4xl">{product.name}</h2>
        <p className="mt-2 text-lg font-semibold">{formatPrice(product.price)}</p>

        <div className="mt-5">
          <span className="label">
            Color · <span className="text-cream">{color}</span>
          </span>
          <div className="mt-2 flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={c.name === color}
                onClick={() => pickColor(c.name)}
                className="relative flex h-11 w-11 items-center justify-center"
              >
                {c.name === color && (
                  <motion.span layoutId={`ring-${product.id}`} className="absolute inset-0.5 rounded-full border-2 border-cream" />
                )}
                <span className="h-7 w-7 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </div>

        <motion.div className="mt-4" animate={shake}>
          <div className="flex justify-between">
            <span className="label">Talle</span>
            {selected && selected.stock <= 3 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-ember">
                ¡Últimas {selected.stock}!
              </motion.span>
            )}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {product.sizes.map((s) => {
              const v = variantsForColor.find((x) => x.size === s);
              const out = !v || v.stock === 0;
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  aria-pressed={active}
                  onClick={() => {
                    setSize(s);
                    setQty(1);
                    // al elegir talle, mostrar cómo queda puesto
                    const modelIndex = views.findIndex((v) => v.view === "model");
                    if (modelIndex >= 0 && views[viewIndex]?.view !== "model") setViewIndex(modelIndex);
                  }}
                  className={`relative h-11 rounded-md text-sm transition-colors ${
                    out ? "cursor-not-allowed text-muted/50 line-through" : active ? "text-ink" : "hover:bg-surface"
                  } border ${active ? "border-cream" : "border-line"}`}
                >
                  {active && (
                    <motion.span
                      layoutId={`size-${product.id}`}
                      className="absolute inset-0 rounded-[5px] bg-cream"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative">{s}</span>
                </button>
              );
            })}
          </div>
          {!size && !soldOut && <p className="mt-2 text-xs text-muted">Elegí un talle para agregar al carrito.</p>}
          {soldOut && <p className="mt-2 text-xs text-ember">Este color está agotado.</p>}
        </motion.div>

        <div className="mt-5 flex gap-2">
          <div className="flex items-center rounded-full border border-line">
            <button type="button" aria-label="Restar uno" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-10 text-lg">−</button>
            <span className="w-6 text-center text-sm" aria-live="polite">{qty}</span>
            <button
              type="button"
              aria-label="Sumar uno"
              onClick={() => setQty((q) => Math.min(selected?.stock ?? 1, q + 1))}
              disabled={!selected || qty >= selected.stock}
              className="h-12 w-10 text-lg disabled:opacity-30"
            >
              +
            </button>
          </div>
          <motion.button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            whileTap={{ scale: 0.97 }}
            className="relative flex h-12 flex-1 items-center justify-between overflow-hidden rounded-full bg-ember px-5 text-sm font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:bg-ember-soft disabled:opacity-40"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "ok" : "add"}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {added ? "Agregado ✓" : "Agregar al carrito"}
              </motion.span>
            </AnimatePresence>
            <span>{formatPrice(product.price * qty)}</span>
          </motion.button>
        </div>

        <div className="mt-5">
          <AccordionItem title="Detalles">
            <p>{product.description}</p>
            <ul className="mt-2 list-disc pl-5">
              {product.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </AccordionItem>
          <AccordionItem title="Tela y cuidado">
            <p>{product.fabric}</p>
            <p className="mt-2">Lavar del revés con agua fría. No usar secarropas.</p>
          </AccordionItem>
          <AccordionItem title="Calce y talles">{product.fit}</AccordionItem>
          <AccordionItem title="Envíos y cambios">
            Enviamos a todo el país. Tenés 30 días para cambiar talle o color, con la prenda sin uso y con etiqueta.
          </AccordionItem>
        </div>

        {onClose && (
          <Link href={`/producto/${product.slug}`} className="mt-4 inline-block text-xs text-muted underline-offset-4 hover:text-cream hover:underline">
            Ver página completa del producto
          </Link>
        )}
      </motion.div>
    </div>
  );
}
