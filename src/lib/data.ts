import { cache } from "react";
import { readdirSync } from "node:fs";
import path from "node:path";
import { CATEGORIES, MOCK_LOOKS, MOCK_PRODUCTS } from "./mock-data";
import { createClient } from "./supabase/server";
import type { CategorySlug, ColorOption, GarmentKind, Gender, Look, Product, ProductImage } from "./types";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46", "48"];

interface Row {
  id: string;
  slug: string;
  name: string;
  kind: GarmentKind;
  gender: Gender | null;
  price: number;
  description: string | null;
  details: string[] | null;
  fabric: string | null;
  fit: string | null;
  featured: boolean;
  categories: { slug: CategorySlug } | null;
  product_variants: { id: string; color: string; color_hex: string; size: string; stock: number }[];
  product_images: { url: string; color: string | null; view: ProductImage["view"]; position: number }[];
}

function mapRow(r: Row): Product {
  const colors: ColorOption[] = [];
  for (const v of r.product_variants) {
    if (!colors.some((c) => c.name === v.color)) colors.push({ name: v.color, hex: v.color_hex });
  }
  const sizes = Array.from(new Set(r.product_variants.map((v) => v.size))).sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  );
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.categories?.slug ?? "tops",
    gender: r.gender ?? "unisex",
    kind: r.kind,
    price: r.price,
    description: r.description ?? "",
    details: r.details ?? [],
    fabric: r.fabric ?? "",
    fit: r.fit ?? "",
    featured: r.featured,
    images: [...r.product_images]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ url: i.url, color: i.color, view: i.view })),
    colors,
    sizes,
    variants: r.product_variants.map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.color_hex,
      size: v.size,
      stock: v.stock,
    })),
  };
}

const SELECT =
  "id, slug, name, kind, gender, price, description, details, fabric, fit, featured, categories(slug), product_variants(id, color, color_hex, size, stock), product_images(url, color, view, position)";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Modo demo: busca fotos en public/products/ con estos nombres
 *   buzo-arco-front.webp            → para todos los colores
 *   buzo-arco-negro-model.jpg       → solo para el color Negro
 *   buzo-arco-model-2.jpg           → segunda foto de la misma vista
 * Vistas: front (prenda sola, va al perchero), model, back, detail.
 */
function withLocalImages(products: Product[]): Product[] {
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), "public", "products"));
  } catch {
    return products;
  }
  const order = ["front", "model", "back", "detail", "hang"] as const;
  return products.map((p) => {
    const found: (ProductImage & { n: number })[] = [];
    for (const file of files) {
      const m = file.toLowerCase().match(/^(.+)-(front|back|model|detail|hang)(?:-(\d+))?\.(jpe?g|png|webp)$/);
      if (!m) continue;
      const [, base, view, num] = m;
      const v = view as ProductImage["view"];
      const n = num ? Number(num) : 1;
      if (base === p.slug) {
        found.push({ url: `/products/${file}`, color: null, view: v, n });
      } else {
        const color = p.colors.find((c) => `${p.slug}-${slugify(c.name)}` === base);
        if (color) found.push({ url: `/products/${file}`, color: color.name, view: v, n });
      }
    }
    found.sort((a, b) => order.indexOf(a.view) - order.indexOf(b.view) || a.n - b.n);
    const images = found.map(({ n: _n, ...img }) => img);
    return images.length ? { ...p, images } : p;
  });
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  if (!supabase) return withLocalImages(MOCK_PRODUCTS);
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("active", true)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[data] getProducts", error.message);
    return [];
  }
  return (data as unknown as Row[]).map(mapRow);
});

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getLooks(): Promise<Look[]> {
  // Los looks se arman con productos existentes; si falta alguno, se descarta el look.
  const products = await getProducts();
  return MOCK_LOOKS.filter((l) =>
    l.items.every((it) => products.some((p) => p.slug === it.slug && p.colors.some((c) => c.name === it.color))),
  );
}

export function getCategories() {
  return CATEGORIES;
}
