import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

interface Body {
  items: { variantId: string; qty: number }[];
  customer: { email: string; full_name: string; address: string; city: string; zip: string };
  payment: { method: "tarjeta_simulada"; cardLast4: string };
}

// Tarjeta de prueba que siempre se rechaza, para mostrar el caso de error.
const DECLINED_LAST4 = "0002";

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const { items, customer, payment } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (!customer?.email || !customer.full_name || !customer.address) {
    return NextResponse.json({ error: "Faltan datos de envío" }, { status: 400 });
  }

  // Pago simulado: el procesador "rechaza" la tarjeta de prueba terminada en 0002.
  if (payment?.cardLast4 === DECLINED_LAST4) {
    return NextResponse.json({ error: "El pago fue rechazado. Probá con otra tarjeta." }, { status: 402 });
  }

  const supabase = await createClient();

  if (supabase) {
    const { data, error } = await supabase.rpc("place_order", {
      p_items: items.map((i) => ({ variant_id: i.variantId, qty: i.qty })),
      p_customer: { ...customer, payment_method: "tarjeta_simulada" },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ orderId: data as string });
  }

  // Modo demo (sin Supabase): valida contra el stock de ejemplo, sin guardar nada.
  const summary: { product_name: string; color: string; size: string; unit_price: number; qty: number }[] = [];
  let total = 0;
  for (const it of items) {
    const product = MOCK_PRODUCTS.find((p) => p.variants.some((v) => v.id === it.variantId));
    const variant = product?.variants.find((v) => v.id === it.variantId);
    if (!product || !variant) return NextResponse.json({ error: "Uno de los productos ya no está disponible" }, { status: 409 });
    if (variant.stock < it.qty) {
      return NextResponse.json(
        { error: `Sin stock suficiente: ${product.name} ${variant.color} talle ${variant.size} (quedan ${variant.stock})` },
        { status: 409 },
      );
    }
    total += product.price * it.qty;
    summary.push({ product_name: product.name, color: variant.color, size: variant.size, unit_price: product.price, qty: it.qty });
  }
  const orderId = `demo-${Date.now().toString(36)}`;
  return NextResponse.json({
    orderId,
    demoOrder: { id: orderId, full_name: customer.full_name, email: customer.email, total, status: "pagado", created_at: new Date().toISOString(), items: summary },
  });
}
