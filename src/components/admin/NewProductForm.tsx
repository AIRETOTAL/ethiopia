"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct, type CreateState } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/mock-data";

const input = "h-11 rounded-md border border-line bg-ink px-3 text-sm outline-none focus:border-cream";
const area = "rounded-md border border-line bg-ink p-3 text-sm outline-none focus:border-cream";

export function NewProductForm() {
  const [state, action, pending] = useActionState<CreateState, FormData>(createProduct, { ok: false, message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-4 rounded-xl border border-line bg-coal p-5 md:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="label">Nombre</span>
        <input name="name" required className={input} placeholder="Buzo Lanza" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Precio (ARS)</span>
        <input name="price" type="number" min={0} required className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Categoría</span>
        <select name="category" className={input}>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Para</span>
        <select name="gender" className={input}>
          <option value="unisex">Unisex</option>
          <option value="hombre">Hombre</option>
          <option value="mujer">Mujer</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Tipo de prenda (para la ilustración)</span>
        <select name="kind" className={input}>
          <option value="tee">Remera</option>
          <option value="hoodie">Buzo</option>
          <option value="jacket">Campera</option>
          <option value="pants">Pantalón</option>
          <option value="shorts">Short</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Colores (nombre:#hex, separados por coma)</span>
        <input name="colors" required className={input} placeholder="Negro:#1f1c1a, Crema:#e9e1d4" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Talles (separados por coma)</span>
        <input name="sizes" required className={input} defaultValue="S, M, L, XL" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Stock inicial por variante</span>
        <input name="stock" type="number" min={0} defaultValue={5} className={input} />
      </label>
      <label className="flex items-center gap-2 self-end pb-3 text-sm">
        <input type="checkbox" name="featured" className="accent-[#1e1c1a]" /> Destacado (aparece primero en el perchero)
      </label>
      <label className="flex flex-col gap-1.5 md:col-span-2">
        <span className="label">Descripción</span>
        <textarea name="description" rows={2} className={area} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Detalles (uno por línea)</span>
        <textarea name="details" rows={3} className={area} />
      </label>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="label">Tela</span>
          <input name="fabric" className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label">Calce</span>
          <input name="fit" className={input} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="label">Foto frente (PNG sin fondo ideal)</span>
        <input name="image_front" type="file" accept="image/*" className="text-sm" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="label">Foto con modelo (cómo queda puesto)</span>
        <input name="image_model" type="file" accept="image/*" className="text-sm" />
      </label>
      <div className="flex items-center gap-4 md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-ember px-6 text-xs font-semibold tracking-[0.12em] text-ink uppercase hover:bg-ember-soft disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear producto"}
        </button>
        {state.message && (
          <p role="status" className={`text-sm ${state.ok ? "text-cream" : "text-ember-soft"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
