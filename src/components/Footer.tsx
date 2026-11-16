import Link from "next/link";
import { Emblem } from "./Emblem";
import { CATEGORIES } from "@/lib/mock-data";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 md:grid-cols-[2fr_1fr_1fr] md:px-10">
        <div className="flex items-center gap-4">
          <Emblem className="h-16 w-14 text-cream" />
          <span className="display text-4xl md:text-5xl">Ethiopia</span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="label">Tienda</span>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/tienda?cat=${c.slug}`} className="text-sm hover:text-ember">
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <span className="label">Ayuda</span>
          <Link href="/cuenta" className="text-sm hover:text-ember">Mi cuenta</Link>
          <Link href="/checkout" className="text-sm hover:text-ember">Finalizar compra</Link>
          <span className="text-sm text-muted">© {new Date().getFullYear()} Ethiopia</span>
        </div>
      </div>
    </footer>
  );
}
