import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { clientIp, rateLimit } from "@/lib/rate-limit";

interface Body {
  items: { variantId: string; qty: number }[];
  customer: { email: string; full_name: string; address: string; city: string; zip: string };
  payment: { method: "tarjeta_simulada"; cardLast4: string };
}

// Tarjeta de prueba que siempre se rechaza, para mostrar el caso de error.
const DECLINED_LAST4 = "0002";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** Limpia un texto: sin espacios de más y con largo máximo. */
function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  // máximo 10 intentos de compra por minuto por IP
  if (!rateLimit(`checkout:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá un minuto y probá de nuevo." }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }
  if (rawItems.length > 30) {
    return NextResponse.json({ error: "Demasiados productos en un solo pedido" }, { status: 400 });
  }

  // juntar repetidos y validar cada ítem
  const merged = new Map<string, number>();
  for (const it of rawItems) {
    const qty = Number(it?.qty);
    if (typeof it?.variantId !== "string" || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return NextResponse.json({ error: "Cantidad o producto inválido" }, { status: 400 });
    }
    merged.set(it.variantId, Math.min(20, (merged.get(it.variantId) ?? 0) + qty));
  }
  const items = [...merged].map(([variantId, qty]) => ({ variantId, qty }));

  const customer = {
    email: clean(body?.customer?.email, 254).toLowerCase(),
    full_name: clean(body?.customer?.full_name, 120),
    address: clean(body?.customer?.address, 200),
    city: clean(body?.customer?.city, 80),
    zip: clean(body?.customer?.zip, 12),
  };
  if (!EMAIL.test(customer.email)) {
    return NextResponse.json({ error: "El email no es válido" }, { status: 400 });
  }
  if (customer.full_name.length < 2 || customer.address.length < 4) {
    return NextResponse.json({ error: "Faltan datos de envío" }, { status: 400 });
  }

  const cardLast4 = clean(body?.payment?.cardLast4, 4);
  if (!/^\d{4}$/.test(cardLast4)) {
    return NextResponse.json({ error: "Datos de pago inválidos" }, { status: 400 });
  }

  // Pago simulado: el procesador "rechaza" la tarjeta de prueba terminada en 0002.
  if (cardLast4 === DECLINED_LAST4) {
    return NextResponse.json({ error: "El pago fue rechazado. Probá con otra tarjeta." }, { status: 402 });
  }

  const supabase = await createClient();

  if (supabase) {
    if (items.some((i) => !UUID.test(i.variantId))) {
      return NextResponse.json({ error: "Uno de los productos ya no está disponible" }, { status: 409 });
    }
    const { data, error } = await supabase.rpc("place_order", {
      p_items: items.map((i) => ({ variant_id: i.variantId, qty: i.qty })),
      p_customer: { ...customer, payment_method: "tarjeta_simulada" },
    });
    if (error) {
      // solo mostramos los mensajes propios (stock, datos); el resto queda en el log del servidor
      const known = /stock|disponible|vacío|datos de envío|cantidad/i.test(error.message);
      if (!known) console.error("[checkout]", error.message);
      return NextResponse.json({ error: known ? error.message : "No pudimos procesar el pedido. Probá de nuevo." }, { status: 409 });
    }
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
