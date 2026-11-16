"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function adminClient() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase no está configurado");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Tenés que iniciar sesión");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("No tenés permisos de administrador");
  return supabase;
}

function refresh() {
  revalidatePath("/", "layout");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function updateStock(variantId: string, stock: number) {
  if (!UUID.test(variantId) || !Number.isFinite(stock)) throw new Error("Datos inválidos");
  const supabase = await adminClient();
  const value = Math.min(100000, Math.max(0, Math.floor(stock)));
  const { error } = await supabase.from("product_variants").update({ stock: value }).eq("id", variantId);
  if (error) throw new Error(error.message);
  refresh();
}

export async function updateProduct(productId: string, fields: { price?: number; active?: boolean; featured?: boolean }) {
  if (!UUID.test(productId)) throw new Error("Datos inválidos");
  // solo se aceptan estos tres campos, con su tipo correcto
  const safe: { price?: number; active?: boolean; featured?: boolean } = {};
  if (fields.price !== undefined) {
    if (!Number.isFinite(fields.price) || fields.price < 0 || fields.price > 100_000_000) throw new Error("Precio inválido");
    safe.price = Math.round(fields.price);
  }
  if (typeof fields.active === "boolean") safe.active = fields.active;
  if (typeof fields.featured === "boolean") safe.featured = fields.featured;
  const supabase = await adminClient();
  const { error } = await supabase.from("products").update(safe).eq("id", productId);
  if (error) throw new Error(error.message);
  refresh();
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface CreateState {
  ok: boolean;
  message: string;
}

/**
 * Crea un producto con todas sus variantes (colores × talles) y sube sus fotos.
 * Colores en formato "Negro:#1a1a1a, Crema:#e9e1d4". Talles: "S, M, L, XL".
 */
export async function createProduct(_prev: CreateState, form: FormData): Promise<CreateState> {
  try {
    const supabase = await adminClient();
    const name = String(form.get("name") ?? "").trim().slice(0, 80);
    const categorySlug = String(form.get("category"));
    const kind = String(form.get("kind"));
    const price = Math.round(Number(form.get("price")));
    const stock = Math.min(100000, Math.max(0, Math.floor(Number(form.get("stock") ?? 0)) || 0));
    if (!["tee", "hoodie", "jacket", "pants", "shorts"].includes(kind)) return { ok: false, message: "Tipo de prenda inválido." };
    if (!Number.isFinite(price) || price <= 0 || price > 100_000_000) return { ok: false, message: "Precio inválido." };
    const colors = String(form.get("colors") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((c) => {
        const [colorName, hex] = c.split(":").map((x) => x.trim());
        return { name: colorName.slice(0, 40), hex: /^#[0-9a-f]{6}$/i.test(hex ?? "") ? hex : "#888888" };
      });
    const sizes = String(form.get("sizes") ?? "")
      .split(",")
      .map((s) => s.trim().toUpperCase().slice(0, 6))
      .filter(Boolean)
      .slice(0, 12);

    // las fotos se revisan antes de crear nada
    for (const key of ["image_front", "image_model"]) {
      const f = form.get(key);
      if (f instanceof File && f.size > 0) {
        if (!IMAGE_TYPES[f.type]) return { ok: false, message: "Las fotos tienen que ser JPG, PNG o WEBP." };
        if (f.size > MAX_IMAGE_BYTES) return { ok: false, message: "Cada foto puede pesar hasta 5 MB." };
      }
    }

    if (!name || !price || colors.length === 0 || sizes.length === 0) {
      return { ok: false, message: "Completá nombre, precio, al menos un color y un talle." };
    }

    const { data: category } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}`,
        name,
        category_id: category?.id ?? null,
        kind,
        gender: ["hombre", "mujer"].includes(String(form.get("gender"))) ? String(form.get("gender")) : "unisex",
        price,
        description: String(form.get("description") ?? "").slice(0, 2000),
        details: String(form.get("details") ?? "")
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean)
          .slice(0, 12)
          .map((d) => d.slice(0, 200)),
        fabric: String(form.get("fabric") ?? "").slice(0, 300),
        fit: String(form.get("fit") ?? "").slice(0, 300),
        featured: form.get("featured") === "on",
      })
      .select("id, slug")
      .single();
    if (error || !product) return { ok: false, message: error?.message ?? "No se pudo crear el producto." };

    const variants = colors.flatMap((c) =>
      sizes.map((size) => ({ product_id: product.id, color: c.name, color_hex: c.hex, size, stock })),
    );
    const { error: vErr } = await supabase.from("product_variants").insert(variants);
    if (vErr) return { ok: false, message: vErr.message };

    // Fotos (opcionales): prenda sola (perchero) y con modelo, para todos los colores
    const uploads: { file: File; view: "front" | "model" }[] = [];
    const front = form.get("image_front");
    const model = form.get("image_model");
    if (front instanceof File && front.size > 0) uploads.push({ file: front, view: "front" });
    if (model instanceof File && model.size > 0) uploads.push({ file: model, view: "model" });

    for (const [i, u] of uploads.entries()) {
      // la extensión sale del tipo real del archivo, no del nombre que puso el usuario
      const ext = IMAGE_TYPES[u.file.type];
      const path = `${product.slug}/${u.view}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("products").upload(path, u.file, { contentType: u.file.type });
      if (upErr) return { ok: false, message: `Producto creado, pero falló la foto: ${upErr.message}` };
      const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
      await supabase.from("product_images").insert({ product_id: product.id, url: pub.publicUrl, view: u.view, position: i });
    }

    refresh();
    return { ok: true, message: `"${name}" creado con ${variants.length} variantes.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error inesperado" };
  }
}
