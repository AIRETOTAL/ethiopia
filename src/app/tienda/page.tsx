import { Suspense } from "react";
import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Tienda" };

export default async function TiendaPage() {
  const products = await getProducts();
  return (
    <Suspense>
      <Catalog products={products} categories={getCategories()} />
    </Suspense>
  );
}
