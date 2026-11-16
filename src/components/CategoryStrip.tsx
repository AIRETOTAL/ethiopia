"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ProductVisual } from "./ProductVisual";
import type { Category, Product } from "@/lib/types";

export function CategoryStrip({ categories, products }: { categories: Category[]; products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-10">
      <div className="flex items-end justify-between">
        <h2 className="display text-5xl md:text-7xl">Categorías</h2>
        <Link href="/tienda" className="text-xs font-semibold tracking-[0.16em] uppercase hover:text-ember">
          Ver todo →
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {categories.map((c, i) => {
          const sample =
            products.find((p) => p.category === c.slug && p.images.some((i) => i.view === "front")) ??
            products.find((p) => p.category === c.slug);
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/tienda?cat=${c.slug}`}
                className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-lg border border-line bg-coal p-4 md:p-5"
              >
                <span className="label">{String(count).padStart(2, "0")} productos</span>
                {sample && (
                  <div className="absolute inset-x-[14%] top-[16%] bottom-[22%] transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:rotate-[-4deg] group-hover:scale-105">
                    <ProductVisual product={sample} color={sample.colors[0]?.name ?? ""} className="h-full w-full" />
                  </div>
                )}
                <div className="relative flex items-end justify-between">
                  <span className="display text-2xl md:text-3xl">{c.name}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-all duration-300 group-hover:rotate-[-45deg] group-hover:border-ember group-hover:bg-ember group-hover:text-ink">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
