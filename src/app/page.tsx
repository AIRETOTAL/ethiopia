import { Rail } from "@/components/Rail";
import { CategoryStrip } from "@/components/CategoryStrip";
import { Looks } from "@/components/Looks";
import { BrandStatement } from "@/components/BrandStatement";
import { getCategories, getLooks, getProducts } from "@/lib/data";

export default async function HomePage() {
  const [products, looks] = await Promise.all([getProducts(), getLooks()]);
  const railProducts = [...products].sort((a, b) => Number(b.featured) - Number(a.featured));

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="display text-4xl">Todavía no hay productos</h1>
        <p className="mt-4 text-muted">Cargá productos desde el panel de admin o corré supabase/seed.sql.</p>
      </div>
    );
  }

  return (
    <>
      <Rail products={railProducts} />
      <BrandStatement />
      <CategoryStrip categories={getCategories()} products={products} />
      <Looks looks={looks} products={products} />
    </>
  );
}
