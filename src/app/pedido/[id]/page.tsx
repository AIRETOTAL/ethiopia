import type { Metadata } from "next";
import { OrderConfirmation, type OrderSummary } from "@/components/OrderConfirmation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedido confirmado" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let order: OrderSummary | null = null;

  const supabase = await createClient();
  if (supabase && !id.startsWith("demo-")) {
    const { data } = await supabase.rpc("get_order", { p_id: id });
    order = (data as OrderSummary | null) ?? null;
  }

  return <OrderConfirmation id={id} initial={order} />;
}
