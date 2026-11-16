import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Mi cuenta" };

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}

interface OrderRow {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { product_name: string; color: string; size: string; qty: number }[];
}

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, is_admin").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("id, total, status, created_at, order_items(product_name, color, size, qty)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const list = (orders ?? []) as OrderRow[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Mi cuenta</span>
          <h1 className="display mt-2 text-5xl md:text-6xl">Hola{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {profile?.is_admin && (
            <Link href="/admin" className="rounded-full bg-ember px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-ink uppercase">
              Panel admin
            </Link>
          )}
          <form action={signOut}>
            <button type="submit" className="rounded-full border border-line px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase hover:border-cream">
              Salir
            </button>
          </form>
        </div>
      </div>

      <h2 className="display mt-14 text-3xl">Mis pedidos</h2>
      {list.length === 0 ? (
        <p className="mt-4 text-muted">
          Todavía no hiciste pedidos. <Link href="/tienda" className="text-ember hover:underline">Ir a la tienda</Link>
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {list.map((o) => (
            <li key={o.id} className="rounded-xl border border-line bg-coal p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">Pedido #{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {new Date(o.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                <span className="text-ember capitalize">{o.status}</span>
              </p>
              <p className="mt-3 text-sm text-muted">
                {o.order_items.map((i) => `${i.qty}× ${i.product_name} (${i.color}, ${i.size})`).join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
