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

export async function updateStock(variantId: string, stock: number) {
  const supabase = await adminClient();
  const value = Math.max(0, Math.floor(stock));
  const { error } = await supabase.from("product_variants").update({ stock: value }).eq("id", variantId);
  if (error) throw new Error(error.message);
  refresh();
}

export async function updateProduct(productId: string, fields: { price?: number; active?: boolean; featured?: boolean }) {
  const supabase = await adminClient();
  const { error } = await supabase.from("products").update(fields).eq("id", productId);
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
    const name = String(form.get("name") ?? "").trim();
    const categorySlug = String(form.get("category"));
    const kind = String(form.get("kind"));
    const price = Number(form.get("price"));
    const stock = Math.max(0, Number(form.get("stock") ?? 0));
    const colors = String(form.get("colors") ?? "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [colorName, hex] = c.split(":").map((x) => x.trim());
        return { name: colorName, hex: /^#[0-9a-f]{6}$/i.test(hex ?? "") ? hex : "#888888" };
      });
    const sizes = String(form.get("sizes") ?? "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

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
        description: String(form.get("description") ?? ""),
        details: String(form.get("details") ?? "")
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean),
        fabric: String(form.get("fabric") ?? ""),
        fit: String(form.get("fit") ?? ""),
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
      const ext = u.file.name.split(".").pop() ?? "png";
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
