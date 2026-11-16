"use client";

import { useState, useTransition } from "react";
import { updateProduct, updateStock } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  active: boolean;
  featured: boolean;
  variants: { id: string; color: string; color_hex: string; size: string; stock: number }[];
}

function StockInput({ id, initial }: { id: string; initial: number }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [, start] = useTransition();

  function save(next: number) {
    if (next === initial && saved === "idle") return;
    setSaved("saving");
    start(async () => {
      try {
        await updateStock(id, next);
        setSaved("ok");
        setTimeout(() => setSaved("idle"), 1200);
      } catch {
        setSaved("error");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={value}
        aria-label="Stock"
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={() => save(value)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className={`h-9 w-16 rounded border bg-ink px-2 text-sm ${value === 0 ? "border-ember/60 text-ember" : "border-line"}`}
      />
      <span className="w-3 text-xs" aria-live="polite">
        {saved === "saving" ? "…" : saved === "ok" ? "✓" : saved === "error" ? "!" : ""}
      </span>
    </div>
  );
}

function ProductRow({ p }: { p: AdminProduct }) {
  const [price, setPrice] = useState(p.price);
  const [pending, start] = useTransition();
  const colors = Array.from(new Set(p.variants.map((v) => v.color)));
  const sizes = Array.from(new Set(p.variants.map((v) => v.size)));

  return (
    <div className={`rounded-xl border border-line bg-coal p-5 ${p.active ? "" : "opacity-60"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{p.name}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="label">Precio</span>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              onBlur={() => price !== p.price && start(() => updateProduct(p.id, { price }))}
              className="h-9 w-28 rounded border border-line bg-ink px-2"
            />
          </label>
          <span className="text-muted">{formatPrice(price)}</span>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" defaultChecked={p.featured} onChange={(e) => start(() => updateProduct(p.id, { featured: e.target.checked }))} className="accent-[#1e1c1a]" />
            Destacado
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" defaultChecked={p.active} onChange={(e) => start(() => updateProduct(p.id, { active: e.target.checked }))} className="accent-[#1e1c1a]" />
            Visible
          </label>
          {pending && <span className="text-xs text-muted">Guardando…</span>}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="label pr-4 text-left font-normal">Color</th>
              {sizes.map((s) => (
                <th key={s} className="label px-2 text-left font-normal">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((c) => {
              const hex = p.variants.find((v) => v.color === c)?.color_hex;
              return (
                <tr key={c}>
                  <td className="py-1.5 pr-4">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className="h-4 w-4 rounded-full" style={{ background: hex }} />
                      {c}
                    </span>
                  </td>
                  {sizes.map((s) => {
                    const v = p.variants.find((x) => x.color === c && x.size === s);
                    return <td key={s} className="px-2 py-1.5">{v ? <StockInput id={v.id} initial={v.stock} /> : "—"}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StockTable({ products }: { products: AdminProduct[] }) {
  return (
    <div className="flex flex-col gap-4">
      {products.map((p) => (
        <ProductRow key={p.id} p={p} />
      ))}
    </div>
  );
}
