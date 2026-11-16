"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CartThumb } from "@/components/CartDrawer";
import { Emblem } from "@/components/Emblem";
import { cartTotal, useCart, useCartReady } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

const STEPS = ["Verificando stock", "Procesando pago", "Confirmando pedido"];

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label">{label}</span>
      <input
        name={name}
        required
        {...props}
        className="h-12 rounded-md border border-line bg-coal px-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-cream"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const ready = useCartReady();
  const { items, clear } = useCart();
  const total = cartTotal(items);
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [flipped, setFlipped] = useState(false);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const formattedNumber = card.number.padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    if (card.number.length !== 16) {
      setError("El número de tarjeta tiene que tener 16 dígitos.");
      return;
    }
    setStep(0);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    try {
      await wait(700);
      setStep(1);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
          customer: {
            email: form.get("email"),
            full_name: form.get("full_name"),
            address: form.get("address"),
            city: form.get("city"),
            zip: form.get("zip"),
          },
          payment: { method: "tarjeta_simulada", cardLast4: card.number.slice(-4) },
        }),
      });
      const data = await res.json();
      await wait(600);
      if (!res.ok) throw new Error(data.error ?? "No pudimos procesar el pedido.");
      setStep(2);
      if (data.demoOrder) sessionStorage.setItem(`order-${data.orderId}`, JSON.stringify(data.demoOrder));
      await wait(600);
      clear();
      router.push(`/pedido/${data.orderId}`);
    } catch (err) {
      setStep(-1);
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    }
  }

  if (!ready) return <div className="min-h-[60vh]" />;

  if (items.length === 0 && step === -1) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="display text-5xl">Tu carrito está vacío</h1>
        <Link href="/tienda" className="mt-8 inline-block rounded-full border border-cream px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase hover:bg-cream hover:text-ink">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-10">
      <h1 className="display text-5xl md:text-7xl">Finalizar compra</h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-10">
          <fieldset className="flex flex-col gap-4">
            <legend className="display mb-4 text-2xl">1. Contacto</legend>
            <Field label="Nombre y apellido" name="full_name" autoComplete="name" />
            <Field label="Email" name="email" type="email" autoComplete="email" />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="display mb-4 text-2xl">2. Envío</legend>
            <Field label="Dirección" name="address" autoComplete="street-address" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ciudad" name="city" autoComplete="address-level2" />
              <Field label="Código postal" name="zip" autoComplete="postal-code" inputMode="numeric" />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="display mb-1 text-2xl">3. Pago</legend>
            <p className="text-xs text-muted">
              Pago simulado: no se cobra nada. Cualquier número de 16 dígitos funciona; terminada en 0002 se rechaza.
            </p>

            {/* Tarjeta animada que se da vuelta al escribir el código */}
            <div className="mx-auto w-full max-w-sm [perspective:1200px]">
              <motion.div
                className="relative aspect-[1.6] w-full [transform-style:preserve-3d]"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
              >
                <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#5a5248,#1e1c1a_60%,#6e6152)] p-5 text-[#eee9e2] shadow-2xl [backface-visibility:hidden]">
                  <div className="flex items-start justify-between">
                    <div className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#d9b27a,#8a6a3f)]" />
                    <Emblem className="h-10 w-9 text-[#eee9e2]" spearColor="#c9b9a4" />
                  </div>
                  <span className="font-mono text-lg tracking-[0.12em] md:text-xl">{formattedNumber}</span>
                  <div className="flex justify-between text-xs uppercase">
                    <span className="truncate">{card.name || "Nombre en la tarjeta"}</span>
                    <span>{card.exp || "MM/AA"}</span>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,#3b3732,#1e1c1a)] shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="mt-6 h-10 bg-black" />
                  <div className="mx-5 mt-5 flex h-9 items-center justify-end rounded bg-[#eee9e2] px-3 font-mono text-[#1e1c1a]">{card.cvc || "•••"}</div>
                </div>
              </motion.div>
            </div>

            <Field
              label="Número de tarjeta"
              name="card"
              inputMode="numeric"
              autoComplete="cc-number"
              value={card.number.replace(/(.{4})/g, "$1 ").trim()}
              onChange={(e) => setCard((c) => ({ ...c, number: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
              placeholder="4242 4242 4242 4242"
            />
            <Field
              label="Nombre en la tarjeta"
              name="card_name"
              autoComplete="cc-name"
              value={card.name}
              onChange={(e) => setCard((c) => ({ ...c, name: e.target.value.slice(0, 26) }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Vencimiento"
                name="exp"
                placeholder="MM/AA"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={card.exp}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCard((c) => ({ ...c, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }));
                }}
              />
              <Field
                label="Código de seguridad"
                name="cvc"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={card.cvc}
                onFocus={() => setFlipped(true)}
                onBlur={() => setFlipped(false)}
                onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              />
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-xl border border-line bg-coal p-6 lg:sticky lg:top-24">
          <h2 className="display text-2xl">Tu pedido</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 py-3">
                <div className="relative h-20 w-16 shrink-0 rounded bg-surface p-1">
                  <CartThumb item={item} className="h-full w-full" />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ember text-[11px] font-semibold text-ink">
                    {item.qty}
                  </span>
                </div>
                <div className="flex flex-1 justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted">{item.color} · {item.size}</p>
                  </div>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm text-muted">
            <span>Envío</span>
            <span>A calcular</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="label">Total</span>
            <span className="text-2xl font-semibold">{formatPrice(total)}</span>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-md border border-ember/50 bg-ember/10 p-3 text-sm text-ember-soft"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={step >= 0}
            className="mt-6 flex h-13 w-full items-center justify-center rounded-full bg-ember text-sm font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-ember-soft disabled:opacity-60"
          >
            {step >= 0 ? "Procesando…" : `Pagar ${formatPrice(total)}`}
          </button>
        </aside>
      </form>

      {/* Overlay de procesamiento */}
      <AnimatePresence>
        {step >= 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-8">
              <motion.div animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }} style={{ transformPerspective: 600 }}>
                <Emblem className="h-24 w-20 text-cream" spearColor="#9a8a76" />
              </motion.div>
              <ul className="flex flex-col gap-3">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${i < step ? "border-ember bg-ember text-ink" : "border-line"}`}>
                      {i < step ? "✓" : ""}
                    </span>
                    {s}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
