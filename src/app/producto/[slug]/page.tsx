import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getProducts } from "@/lib/data";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Producto", description: product?.description };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts()).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-10">
      <nav aria-label="Migas" className="label mb-8 flex gap-2">
        <Link href="/tienda" className="hover:text-cream">Tienda</Link>
        <span>/</span>
        <Link href={`/tienda?cat=${product.category}`} className="capitalize hover:text-cream">{product.category}</Link>
        <span>/</span>
        <span className="text-cream">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display text-4xl md:text-5xl">También te puede gustar</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
