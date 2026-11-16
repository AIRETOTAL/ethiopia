export type CategorySlug = "tops" | "sweaters" | "camperas" | "jeans" | "shorts";
export type Gender = "hombre" | "mujer" | "unisex";
export type GarmentKind = "tee" | "hoodie" | "jacket" | "pants" | "shorts";

export interface Category {
  slug: CategorySlug;
  name: string;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Variant {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
}

export interface ProductImage {
  url: string;
  color: string | null;
  /** hang = la prenda colgada de su percha (solo para el perchero) */
  view: "front" | "back" | "model" | "detail" | "hang";
}

export interface Product {
  id: string;
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
  featured: boolean;
  images: ProductImage[];
  colors: ColorOption[];
  sizes: string[];
  variants: Variant[];
}

export interface Look {
  id: string;
  name: string;
  /** foto del look completo (opcional) */
  image?: string;
  items: { slug: string; color: string }[];
}

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  kind: GarmentKind;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  qty: number;
  maxStock: number;
  image: string | null;
}
