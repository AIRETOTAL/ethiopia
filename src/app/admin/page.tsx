import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { StockTable, type AdminProduct } from "@/components/admin/StockTable";
import { NewProductForm } from "@/components/admin/NewProductForm";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="display text-4xl">Panel de admin</h1>
        <p className="mt-4 text-muted">Conectá Supabase (ver README) para cargar productos y manejar el stock.</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="display text-4xl">Sin permisos</h1>
        <p className="mt-4 text-muted">Tu usuario no es administrador. Seguí el paso “Hacerte admin” del README.</p>
        <Link href="/" className="mt-6 inline-block text-ember hover:underline">Volver a la tienda</Link>
      </div>
    );
  }

  const [{ data: products }, { data: orders }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, active, featured, product_variants(id, color, color_hex, size, stock)")
      .order("created_at", { ascending: true }),
    supabase.from("orders").select("id, full_name, email, total, status, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const list: AdminProduct[] = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    active: p.active,
    featured: p.featured,
    variants: p.product_variants ?? [],
  }));

  const totalStock = list.reduce((a, p) => a + p.variants.reduce((b, v) => b + v.stock, 0), 0);
  const soldOut = list.reduce((a, p) => a + p.variants.filter((v) => v.stock === 0).length, 0);
  const revenue = (orders ?? []).reduce((a, o) => a + o.total, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-10">
      <span className="label">Ethiopia</span>
      <h1 className="display mt-2 text-5xl md:text-6xl">Panel de admin</h1>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Productos", value: String(list.length) },
          { label: "Unidades en stock", value: String(totalStock) },
          { label: "Variantes agotadas", value: String(soldOut) },
          { label: "Ventas (últimos 10)", value: formatPrice(revenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-coal p-4">
            <span className="label">{s.label}</span>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="display mt-14 text-3xl">Stock y precios</h2>
      <p className="mt-1 text-sm text-muted">Cambiá un número y salí del campo: se guarda solo.</p>
      <div className="mt-6">
        <StockTable products={list} />
      </div>

      <h2 className="display mt-14 text-3xl">Nuevo producto</h2>
      <div className="mt-6">
        <NewProductForm />
      </div>

      <h2 className="display mt-14 text-3xl">Últimos pedidos</h2>
      {(orders ?? []).length === 0 ? (
        <p className="mt-4 text-muted">Todavía no hay pedidos.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-coal">
              <tr>
                {["Pedido", "Cliente", "Fecha", "Estado", "Total"].map((h) => (
                  <th key={h} className="label px-4 py-3 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(orders ?? []).map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    {o.full_name}
                    <span className="block text-xs text-muted">{o.email}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(o.created_at).toLocaleDateString("es-AR")}</td>
                  <td className="px-4 py-3 text-ember capitalize">{o.status}</td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
