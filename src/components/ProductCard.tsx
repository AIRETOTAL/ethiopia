"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ProductVisual, viewsFor } from "./ProductVisual";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const totalStock = product.variants.reduce((a, v) => a + v.stock, 0);
  const lowStock = totalStock > 0 && totalStock <= 8;
  const views = viewsFor(product, color);
  const main = views.find((v) => v.view === "model") ?? views.find((v) => v.view === "front") ?? views[0];
  const hover = views.find((v) => v !== main && (v.view === "front" || v.view === "back")) ?? views.find((v) => v.view === "back");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
          <motion.div
            className={`absolute ${main.url && main.view === "model" ? "inset-0" : "inset-[10%]"} transition-all duration-500 ${hover ? "group-hover:scale-95 group-hover:opacity-0" : "group-hover:scale-105"}`}
          >
            <ProductVisual product={product} color={color} view={main.view} url={main.url} className={main.view === "model" ? "h-full w-full object-cover" : "h-full w-full"} />
          </motion.div>
          <div className="absolute inset-[10%] scale-105 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
            {hover && <ProductVisual product={product} color={color} view={hover.view} url={hover.url} className="h-full w-full" />}
          </div>
          {totalStock === 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-[11px] tracking-wider uppercase">Agotado</span>
          )}
          {lowStock && (
            <span className="absolute top-3 left-3 rounded-full bg-ember px-3 py-1 text-[11px] font-semibold tracking-wider text-ink uppercase">
              Últimas unidades
            </span>
          )}
          <span className="absolute right-3 bottom-3 translate-y-3 rounded-full bg-cream px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Ver
          </span>
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link href={`/producto/${product.slug}`} className="font-medium hover:text-ember">
            {product.name}
          </Link>
          <div className="mt-2 flex gap-1.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={`Ver en ${c.name}`}
                aria-pressed={c.name === color}
                onMouseEnter={() => setColor(c.name)}
                onClick={() => setColor(c.name)}
                className={`h-5 w-5 rounded-full border-2 ${c.name === color ? "border-cream" : "border-transparent"}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
        <span className="text-sm">{formatPrice(product.price)}</span>
      </div>
    </motion.article>
  );
}
