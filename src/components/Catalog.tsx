"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "./ProductCard";
import type { Category, CategorySlug, Product } from "@/lib/types";

type Sort = "destacados" | "menor" | "mayor";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative h-10 rounded-full border px-4 text-xs font-medium tracking-[0.1em] uppercase transition-colors ${
        active ? "border-cream text-ink" : "border-line hover:border-muted"
      }`}
    >
      {active && <motion.span layoutId="chip-bg" className="absolute inset-0 rounded-full bg-cream" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
      <span className="relative">{children}</span>
    </button>
  );
}

export function Catalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const cat = (params.get("cat") as CategorySlug | null) ?? null;
  const gender = (params.get("g") as "hombre" | "mujer" | null) ?? null;
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("destacados");
  const [onlyStock, setOnlyStock] = useState(false);

  const scoped = products.filter(
    (p) => (!cat || p.category === cat) && (!gender || p.gender === gender || p.gender === "unisex"),
  );
  const allSizes = useMemo(() => Array.from(new Set(scoped.flatMap((p) => p.sizes))), [scoped]);
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    scoped.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [scoped]);

  const filtered = useMemo(() => {
    let list = scoped.filter((p) =>
      p.variants.some(
        (v) => (!size || v.size === size) && (!color || v.color === color) && (!onlyStock || v.stock > 0),
      ),
    );
    if (sort === "menor") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "mayor") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "destacados") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [scoped, size, color, sort, onlyStock]);

  function go(next: { cat?: CategorySlug | null; g?: "hombre" | "mujer" | null }) {
    setSize(null);
    setColor(null);
    const q = new URLSearchParams();
    const c = next.cat !== undefined ? next.cat : cat;
    const g = next.g !== undefined ? next.g : gender;
    if (g) q.set("g", g);
    if (c) q.set("cat", c);
    const qs = q.toString();
    router.replace(qs ? `/tienda?${qs}` : "/tienda", { scroll: false });
  }
  const setCat = (slug: CategorySlug | null) => go({ cat: slug });

  const catName = cat ? categories.find((c) => c.slug === cat)?.name : null;
  const genderName = gender === "hombre" ? "Hombre" : gender === "mujer" ? "Mujer" : null;
  const title = [genderName, catName].filter(Boolean).join(" · ") || "Tienda";

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-10">
      <AnimatePresence mode="wait">
        <motion.h1
          key={title}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="display text-6xl md:text-8xl"
        >
          {title}
        </motion.h1>
      </AnimatePresence>

      <div className="sticky top-16 z-30 -mx-4 mt-8 flex flex-col gap-3 border-b border-line bg-ink/90 px-4 py-4 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex flex-wrap gap-2">
          {([null, "hombre", "mujer"] as const).map((g) => (
            <button
              key={g ?? "todos"}
              type="button"
              aria-pressed={gender === g}
              onClick={() => go({ g })}
              className={`display h-10 px-2 text-lg transition-colors ${gender === g ? "text-cream" : "text-muted hover:text-cream"}`}
            >
              {g === null ? "Todos" : g === "hombre" ? "Hombre" : "Mujer"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!cat} onClick={() => setCat(null)}>Todo</Chip>
          {categories.map((c) => (
            <Chip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="label mr-1">Talle</span>
            {allSizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setSize(size === s ? null : s)}
                className={`h-9 min-w-9 rounded-md border px-2 text-xs ${size === s ? "border-cream bg-cream text-ink" : "border-line hover:border-muted"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="label mr-1">Color</span>
            {allColors.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={color === c.name}
                onClick={() => setColor(color === c.name ? null : c.name)}
                className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c.name ? "border-cream" : "border-transparent"}`}
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs">
            <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} className="h-4 w-4 accent-[#1e1c1a]" />
            Solo con stock
          </label>
          <label className="ml-auto flex items-center gap-2 text-xs">
            <span className="label">Ordenar</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-9 rounded-md border border-line bg-coal px-2 text-xs"
            >
              <option value="destacados">Destacados</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
      </p>

      <motion.div layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-muted">No hay productos con esos filtros.</p>
          <button
            type="button"
            onClick={() => {
              setSize(null);
              setColor(null);
              setOnlyStock(false);
            }}
            className="mt-4 text-sm text-ember underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
