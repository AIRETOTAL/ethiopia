import Link from "next/link";
import { Emblem } from "@/components/Emblem";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <Emblem className="h-28 w-24 text-surface" />
      <h1 className="display mt-6 text-5xl">No encontramos esto</h1>
      <p className="mt-3 text-muted">La página o el producto que buscás no existe o ya no está disponible.</p>
      <Link href="/tienda" className="mt-8 rounded-full border border-cream px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase hover:bg-cream hover:text-ink">
        Ir a la tienda
      </Link>
    </div>
  );
}
