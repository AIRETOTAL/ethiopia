"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductVisual } from "./ProductVisual";
import { Hanger, hangerFor } from "./Hanger";
import { ProductDetail } from "./ProductDetail";
import { formatPrice } from "@/lib/format";
import { useIntro } from "@/lib/intro-store";
import type { Product } from "@/lib/types";

export function Rail({ products: all }: { products: Product[] }) {
  // al perchero van las prendas con foto "front" (sin fondo) o sin fotos (ilustración)
  const products = all.filter((p) => p.images.length === 0 || p.images.some((i) => i.view === "front" || i.view === "hang"));
  const [active, setActive] = useState(Math.min(2, products.length - 1));
  const [open, setOpen] = useState(false);
  const [swing, setSwing] = useState({ key: 0, dir: 1 });
  const [slot, setSlot] = useState(230);
  const [width, setWidth] = useState(1200);
  const stageRef = useRef<HTMLDivElement>(null);
  const introDone = useIntro((s) => s.done);
  // la caída al perchero se ve una sola vez (no cada vez que se cierra el detalle)
  const dropped = useRef(false);
  useEffect(() => {
    if (!introDone) return;
    const t = setTimeout(() => (dropped.current = true), 2500);
    return () => clearTimeout(t);
  }, [introDone]);
  const panned = useRef(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setWidth(w);
      setSlot(w < 640 ? 150 : w < 1024 ? 190 : 230);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = useCallback(
    (next: number) => {
      const clamped = (next + products.length) % products.length;
      setSwing((s) => ({ key: s.key + 1, dir: clamped > active ? 1 : -1 }));
      setActive(clamped);
    },
    [active, products.length],
  );

  useEffect(() => {
    if (open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go, open]);

  const product = products[active];
  const offset = width / 2 - slot / 2 - active * slot;

  return (
    <section className="grain relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#f7f3ed_0%,#e8e1d7_75%)]">
      <div ref={stageRef} className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col px-4 md:min-h-[min(80vh,760px)] md:px-10">
        <div className="flex items-center justify-between pt-6">
          <span className="label">Colección · {products.length} prendas</span>
          <span className="label hidden sm:block">{open ? "Detalle" : "Deslizá el perchero"}</span>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {!open ? (
            <motion.div
              key="rail"
              className="relative flex flex-1 flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {/* barra del perchero */}
              <div className="absolute inset-x-[-40px] top-[44px] h-[10px] rounded-full bg-gradient-to-b from-[#f4f4f4] via-[#9c9c9c] to-[#3a3a3a] shadow-[0_8px_18px_rgba(60,48,36,0.25)]" />

              <motion.div
                className="relative mt-[34px] flex cursor-grab touch-pan-y active:cursor-grabbing"
                animate={{ x: offset }}
                transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
                onPanStart={() => {
                  panned.current = true;
                }}
                onPanEnd={(_, info) => {
                  setTimeout(() => (panned.current = false), 60);
                  const steps = Math.round(-info.offset.x / (slot * 0.6));
                  if (steps !== 0) go(active + Math.max(-3, Math.min(3, steps)));
                }}
              >
                {products.map((p, i) => {
                  const dist = Math.abs(i - active);
                  const isActive = i === active;
                  return (
                    <motion.div
                      key={p.id}
                      className="shrink-0"
                      style={{ width: slot, originY: 0 }}
                      animate={{
                        scale: isActive ? 1.18 : dist === 1 ? 0.86 : 0.74,
                        opacity: dist > 3 ? 0 : isActive ? 1 : dist === 1 ? 0.75 : 0.45,
                        filter: isActive ? "blur(0px)" : `blur(${Math.min(dist, 3)}px)`,
                      }}
                      transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    >
                      {/* entrada: las prendas caen al perchero cuando termina la intro */}
                      <motion.div
                        initial={dropped.current ? false : { y: -260, opacity: 0, rotate: i % 2 ? 6 : -6 }}
                        animate={introDone ? { y: 0, opacity: 1, rotate: 0 } : undefined}
                        transition={{ type: "spring", stiffness: 90, damping: 11, mass: 0.8, delay: 0.15 + dist * 0.09 }}
                        style={{ originY: 0 }}
                      >
                      <motion.button
                        key={`${swing.key}-${p.id}`}
                        type="button"
                        aria-label={isActive ? `Ver ${p.name}` : `Ir a ${p.name}`}
                        onClick={() => {
                          if (panned.current) return;
                          if (isActive) setOpen(true);
                          else go(i);
                        }}
                        className="block w-full"
                        style={{ originY: 0 }}
                        initial={{ rotate: swing.key === 0 ? 0 : swing.dir * (10 - Math.min(dist, 3) * 2) }}
                        animate={{ rotate: 0 }}
                        transition={{ type: "spring", stiffness: 60, damping: 4, mass: 0.6, delay: Math.min(dist, 4) * 0.03 }}
                        whileHover={isActive ? { y: 6 } : { rotate: swing.dir * -3 }}
                      >
                        {(() => {
                          // foto de la prenda ya colgada de su percha (armada a medida para cada prenda)
                          const hang = p.images.find((im) => im.view === "hang" && (im.color === null || im.color === p.colors[0]?.name));
                          if (!hang) return null;
                          return (
                            <div className="animate-sway" style={{ transformOrigin: "50% 0", animationDelay: `${-i * 0.9}s` }}>
                              <motion.div layoutId={isActive ? `garment-${p.slug}` : undefined} className="aspect-[1000/1560] w-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={hang.url}
                                  alt={p.name}
                                  draggable={false}
                                  className="h-full w-full object-contain drop-shadow-[0_24px_22px_rgba(60,48,36,0.22)]"
                                />
                              </motion.div>
                            </div>
                          );
                        })()}
                        {!p.images.some((im) => im.view === "hang") && (
                        <div
                          className={`animate-sway relative ${hangerFor(p.kind) === "clip" ? "pt-[21%]" : "pt-[13%]"}`}
                          style={{ transformOrigin: "50% 0", animationDelay: `${-i * 0.9}s` }}
                        >
                          {/* la percha va detrás: los hombros de la prenda la tapan */}
                          <Hanger variant={hangerFor(p.kind)} className="absolute top-0 left-[8%] z-0 w-[84%]" />
                          <motion.div layoutId={isActive ? `garment-${p.slug}` : undefined} className="relative z-10 aspect-[5/6] w-full">
                            <ProductVisual product={p} color={p.colors[0]?.name ?? ""} className="h-full w-full" />
                          </motion.div>
                        </div>
                        )}
                      </motion.button>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="relative z-10 mt-auto flex flex-col items-center gap-3 pt-10 pb-10 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={product.id}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <h1 className="display text-3xl md:text-5xl">{product.name}</h1>
                    <p className="text-sm text-muted">
                      {product.colors.map((c) => c.name).join(" · ")} — {formatPrice(product.price)}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => go(active - 1)} aria-label="Prenda anterior" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-cream">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                  </button>
                  <motion.button
                    type="button"
                    onClick={() => setOpen(true)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="h-11 rounded-full bg-cream px-7 text-xs font-semibold tracking-[0.16em] text-ink uppercase hover:bg-ember-soft"
                  >
                    Explorar
                  </motion.button>
                  <button type="button" onClick={() => go(active + 1)} aria-label="Prenda siguiente" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-cream">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                  </button>
                </div>
                <span className="label tabular-nums">
                  {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              className="flex flex-1 items-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProductDetail product={product} onClose={() => setOpen(false)} layoutId={`garment-${product.slug}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
