"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Emblem } from "./Emblem";
import { formatPrice } from "@/lib/format";

export interface OrderSummary {
  id: string;
  full_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
  items: { product_name: string; color: string; size: string; unit_price: number; qty: number }[];
}

export function OrderConfirmation({ id, initial }: { id: string; initial: OrderSummary | null }) {
  const [order, setOrder] = useState<OrderSummary | null>(initial);

  useEffect(() => {
    if (initial) return;
    const saved = sessionStorage.getItem(`order-${id}`);
    if (saved) setOrder(JSON.parse(saved) as OrderSummary);
  }, [id, initial]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -120 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 12 }}
      >
        <Emblem className="h-32 w-28 text-cream" spearColor="#9a8a76" />
      </motion.div>
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="display mt-8 text-5xl md:text-7xl"
      >
        ¡Gracias{order ? `, ${order.full_name.split(" ")[0]}` : ""}!
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-muted">
        Tu pedido quedó confirmado{order ? `. Te enviamos el detalle a ${order.email}.` : "."}
      </motion.p>
      <p className="label mt-2">Pedido #{id.slice(0, 8).toUpperCase()}</p>

      {order && (
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 w-full divide-y divide-line rounded-xl border border-line bg-coal px-5 text-left"
        >
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between py-3 text-sm">
              <span>
                {it.qty} × {it.product_name} <span className="text-muted">· {it.color} · {it.size}</span>
              </span>
              <span>{formatPrice(it.unit_price * it.qty)}</span>
            </li>
          ))}
          <li className="flex justify-between py-4 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </li>
        </motion.ul>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/tienda" className="rounded-full bg-ember px-6 py-3 text-xs font-semibold tracking-[0.14em] text-ink uppercase hover:bg-ember-soft">
          Seguir comprando
        </Link>
        <Link href="/cuenta" className="rounded-full border border-line px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase hover:border-cream">
          Mis pedidos
        </Link>
      </div>
    </div>
  );
}
