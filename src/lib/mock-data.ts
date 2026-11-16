import type { Category, ColorOption, GarmentKind, Gender, Look, Product, CategorySlug } from "./types";

/**
 * Datos de ejemplo. Se usan cuando Supabase todavía no está configurado
 * (modo demo). Los precios son de ejemplo: cambialos en Supabase.
 */

export const CATEGORIES: Category[] = [
  { slug: "tops", name: "Remeras y tops" },
  { slug: "sweaters", name: "Sweaters" },
  { slug: "camperas", name: "Camperas" },
  { slug: "jeans", name: "Jeans" },
  { slug: "shorts", name: "Shorts" },
];

const TOP_SIZES = ["S", "M", "L", "XL"];
const PANT_SIZES = ["38", "40", "42", "44"];

// Stock determinístico (siempre igual) para que el demo sea estable.
function pseudoStock(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const n = h % 14;
  return n < 2 ? 0 : n - 1; // algunas combinaciones agotadas, para mostrar el estado
}

interface Seed {
  slug: string;
  name: string;
  category: CategorySlug;
  gender: Gender;
  kind: GarmentKind;
  price: number;
  description: string;
  details: string[];
  fabric: string;
  fit: string;
  featured?: boolean;
  colors: ColorOption[];
}

const SEEDS: Seed[] = [
  {
    slug: "sweater-cuadros",
    name: "Sweater Cuadros",
    category: "sweaters",
    gender: "unisex",
    kind: "hoodie",
    price: 85000,
    description: "Sweater tejido con damero grande y logo bordado en el pecho.",
    details: ["Tejido en punto grueso", "Damero de cuadros grandes", "Logo bordado al tono"],
    fabric: "Tejido de algodón y acrílico.",
    fit: "Oversize, hombro caído.",
    featured: true,
    colors: [
      { name: "Verde", hex: "#2F5D46" },
      { name: "Beige", hex: "#D8C3A5" },
    ],
  },
  {
    slug: "jean-vintage",
    name: "Jean Vintage",
    category: "jeans",
    gender: "unisex",
    kind: "pants",
    price: 78000,
    description: "Jean baggy de pierna curva con lavado vintage y desgaste en muslos.",
    details: ["Pierna curva (barrel)", "Lavado vintage con bigotes", "Etiqueta tejida en el bolsillo trasero"],
    fabric: "Denim rígido 100% algodón.",
    fit: "Baggy, tiro medio.",
    featured: true,
    colors: [
      { name: "Azul vintage", hex: "#3E5068" },
    ],
  },
  {
    slug: "camisa-dsgn",
    name: "Camisa DSGN",
    category: "tops",
    gender: "hombre",
    kind: "tee",
    price: 52000,
    description: "Camisa boxy de manga corta a rayas finas con estampa gastada al frente.",
    details: ["Rayas finas", "Estampa con efecto gastado", "Corte boxy y corto"],
    fabric: "Popelín de algodón.",
    fit: "Boxy, manga corta amplia.",
    colors: [
      { name: "Rosa", hex: "#E7C9D6" },
    ],
  },
  {
    slug: "short-tierra",
    name: "Short Tierra",
    category: "shorts",
    gender: "hombre",
    kind: "shorts",
    price: 48000,
    description: "Bermuda de jean color tierra con ruedo deshilachado y parches en los bolsillos.",
    details: ["Ruedo deshilachado", "Bolsillos traseros con parche", "Cinco bolsillos"],
    fabric: "Denim 100% algodón teñido en prenda.",
    fit: "Ancho, largo a la rodilla.",
    colors: [
      { name: "Tierra", hex: "#9C8468" },
    ],
  },
  {
    slug: "polo-dept",
    name: "Polo Dept",
    category: "tops",
    gender: "hombre",
    kind: "tee",
    price: 58000,
    description: "Polo tejido a rayas con cierre al cuello y logo grande al frente.",
    details: ["Cuello con medio cierre", "Rayas verticales", "Logo bordado en relieve"],
    fabric: "Punto de algodón.",
    fit: "Regular, un poco corto.",
    featured: true,
    colors: [
      { name: "Bordó", hex: "#4A1A1E" },
    ],
  },
  {
    slug: "buzo-rayado",
    name: "Buzo Rayado",
    category: "sweaters",
    gender: "hombre",
    kind: "hoodie",
    price: 82000,
    description: "Buzo tejido mitad y mitad con rayas en dos tonos y logo grande.",
    details: ["Diseño en dos mitades", "Rayas finas", "Puños y ruedo en contraste"],
    fabric: "Tejido de algodón.",
    fit: "Oversize.",
    colors: [
      { name: "Rosa rayado", hex: "#E8B9BE" },
    ],
  },
  {
    slug: "musculosa-rib",
    name: "Musculosa Rib",
    category: "tops",
    gender: "mujer",
    kind: "tee",
    price: 28000,
    description: "Musculosa corta de morley acanalado con logo en relieve.",
    details: ["Morley acanalado", "Logo en relieve al tono", "Corte corto"],
    fabric: "Morley de algodón con elastano.",
    fit: "Al cuerpo, corta.",
    featured: true,
    colors: [
      { name: "Blanco", hex: "#F2F1EE" },
      { name: "Negro", hex: "#161616" },
    ],
  },
  {
    slug: "sweater-rosa",
    name: "Sweater Rosa",
    category: "sweaters",
    gender: "mujer",
    kind: "hoodie",
    price: 80000,
    description: "Sweater de punto inglés con pin metálico dorado en el pecho.",
    details: ["Punto inglés grueso", "Pin metálico dorado", "Cuello redondo alto"],
    fabric: "Tejido de algodón.",
    fit: "Oversize, largo regular.",
    featured: true,
    colors: [
      { name: "Rosa", hex: "#EFC4C4" },
    ],
  },
  {
    slug: "campera-work",
    name: "Campera Work",
    category: "camperas",
    gender: "unisex",
    kind: "jacket",
    price: 125000,
    description: "Campera de trabajo en denim negro lavado con cierre de dos vías y broches en el cuello.",
    details: ["Cierre de dos vías", "Broches en el cuello", "Bolsillos de parche", "Logo bordado al tono"],
    fabric: "Denim pesado 100% algodón.",
    fit: "Oversize, hombros marcados.",
    featured: true,
    colors: [
      { name: "Negro lavado", hex: "#2B2D33" },
    ],
  },
  {
    slug: "musculosa-cold",
    name: "Musculosa Cold",
    category: "tops",
    gender: "mujer",
    kind: "tee",
    price: 36000,
    description: "Musculosa oversize con lavado ácido, costuras expuestas y frase estampada.",
    details: ["Lavado ácido", "Costuras expuestas", "Estampa tipográfica"],
    fabric: "Jersey pesado de algodón.",
    fit: "Oversize, sin mangas.",
    colors: [
      { name: "Gris lavado", hex: "#55565A" },
    ],
  },
  {
    slug: "bermuda-cargo",
    name: "Bermuda Cargo",
    category: "shorts",
    gender: "mujer",
    kind: "shorts",
    price: 54000,
    description: "Bermuda cargo de cuadrillé con cintura elástica y cordones en el ruedo.",
    details: ["Cintura elástica", "Bolsillos cargo", "Cordones ajustables en el ruedo"],
    fabric: "Algodón con trama cuadrillé.",
    fit: "Ancha, largo bajo la rodilla.",
    colors: [
      { name: "Cuadrillé", hex: "#3A3F4A" },
    ],
  },
];

export const MOCK_PRODUCTS: Product[] = SEEDS.map((s, i) => {
  const sizes = s.kind === "pants" ? PANT_SIZES : TOP_SIZES;
  return {
    id: `p${i + 1}`,
    slug: s.slug,
    name: s.name,
    category: s.category,
    gender: s.gender,
    kind: s.kind,
    price: s.price,
    description: s.description,
    details: s.details,
    fabric: s.fabric,
    fit: s.fit,
    featured: s.featured ?? false,
    images: [],
    colors: s.colors,
    sizes,
    variants: s.colors.flatMap((c) =>
      sizes.map((size) => ({
        id: `${s.slug}__${c.name}__${size}`,
        color: c.name,
        colorHex: c.hex,
        size,
        stock: pseudoStock(`${s.slug}${c.name}${size}`),
      })),
    ),
  };
});

export const MOCK_LOOKS: Look[] = [
  { id: "rayas", name: "Rayas", image: "/looks/rayas.jpg", items: [{ slug: "buzo-rayado", color: "Rosa rayado" }, { slug: "jean-vintage", color: "Azul vintage" }] },
  { id: "noche", name: "Noche", image: "/looks/noche.jpg", items: [{ slug: "musculosa-rib", color: "Negro" }, { slug: "bermuda-cargo", color: "Cuadrillé" }] },
  { id: "cuadros", name: "Cuadros", image: "/looks/cuadros.jpg", items: [{ slug: "sweater-cuadros", color: "Beige" }, { slug: "short-tierra", color: "Tierra" }] },
  { id: "work", name: "Work", image: "/looks/work.jpg", items: [{ slug: "campera-work", color: "Negro lavado" }] },
  { id: "polo", name: "Dept", image: "/looks/polo.jpg", items: [{ slug: "polo-dept", color: "Bordó" }, { slug: "jean-vintage", color: "Azul vintage" }] },
  { id: "rosa", name: "Rosa", image: "/looks/rosa.jpg", items: [{ slug: "sweater-rosa", color: "Rosa" }] },
  { id: "blanco", name: "Blanco", image: "/looks/blanco.jpg", items: [{ slug: "musculosa-rib", color: "Blanco" }] },
];
