"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Emblem } from "./Emblem";
import { cartCount, useCart } from "@/lib/cart-store";
import { CATEGORIES } from "@/lib/mock-data";

export function Header() {
  const items = useCart((s) => s.items);
  const bump = useCart((s) => s.bump);
  const openCart = useCart((s) => s.open);
  const [menu, setMenu] = useState(false);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-10">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Ethiopia, inicio">
          <motion.span
            className="block h-9 w-8 text-cream"
            whileHover={{ y: -2, rotate: [0, -6, 6, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Emblem className="h-full w-full" />
          </motion.span>
          <span className="display text-xl">Ethiopia</span>
        </Link>

        <nav aria-label="Categorías" className="hidden items-center gap-8 md:flex">
          {[
            { href: "/tienda?g=hombre", label: "Hombre" },
            { href: "/tienda?g=mujer", label: "Mujer" },
            { href: "/tienda", label: "Ver todo" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative text-[13px] font-medium tracking-[0.14em] uppercase"
            >
              {c.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ember transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/cuenta"
            aria-label="Mi cuenta"
            className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface sm:flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </svg>
          </Link>
          <motion.button
            key={bump}
            type="button"
            onClick={openCart}
            initial={bump > 0 ? { scale: 1.18 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[13px] font-medium hover:border-cream"
          >
            Carrito
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[11px] font-semibold text-ink">
              {count}
            </span>
          </motion.button>
          <button
            type="button"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
            className="flex h-11 w-11 items-center justify-center md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            aria-label="Menú"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <ul className="flex flex-col px-4 py-4">
              {[{ href: "/tienda?g=hombre", label: "Hombre" }, { href: "/tienda?g=mujer", label: "Mujer" }, ...CATEGORIES.map((c) => ({ href: `/tienda?cat=${c.slug}`, label: c.name })), { href: "/cuenta", label: "Mi cuenta" }].map(
                (l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link href={l.href} onClick={() => setMenu(false)} className="display block py-3 text-3xl">
                      {l.label}
                    </Link>
                  </motion.li>
                ),
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
