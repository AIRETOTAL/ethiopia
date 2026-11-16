import { GarmentArt } from "./GarmentArt";
import type { Product } from "@/lib/types";

export type View = "front" | "back" | "model" | "detail" | "hang";

/** Lista de vistas disponibles para un producto y color (fotos reales o ilustración). */
export function viewsFor(product: Product, color: string): { view: View; url: string | null }[] {
  const order: View[] = ["front", "model", "back", "detail"];
  const photos = product.images
    .filter((i) => i.view !== "hang" && (i.color === null || i.color === color))
    .sort((a, b) => order.indexOf(a.view) - order.indexOf(b.view));
  if (photos.length > 0) return photos.map((p) => ({ view: p.view, url: p.url }));
  return [
    { view: "front", url: null },
    { view: "back", url: null },
  ];
}

interface Props {
  product: Product;
  color: string;
  view?: View;
  url?: string | null;
  className?: string;
}

export function ProductVisual({ product, color, view = "front", url, className }: Props) {
  const hex = product.colors.find((c) => c.name === color)?.hex ?? product.colors[0]?.hex ?? "#888888";
  const src = url !== undefined ? url : viewsFor(product, color).find((v) => v.view === view)?.url ?? null;
  const isPhoto = src && (view === "model" || view === "detail");
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={`${product.name} ${color}`} className={`${className?.includes("object-") ? "" : "object-contain"} ${isPhoto ? "" : "drop-shadow-[0_22px_22px_rgba(60,48,36,0.2)]"} ${className ?? ""}`} draggable={false} />;
  }
  return (
    <GarmentArt
      kind={product.kind}
      color={hex}
      view={view === "back" ? "back" : "front"}
      className={`drop-shadow-[0_22px_22px_rgba(60,48,36,0.2)] ${className ?? ""}`}
    />
  );
}
