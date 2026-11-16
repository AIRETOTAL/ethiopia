import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Ticker } from "@/components/Ticker";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ethiopia — Streetwear", template: "%s · Ethiopia" },
  description: "Remeras, buzos, camperas y pantalones. Ropa pensada para durar.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Intro />
        {!isSupabaseConfigured && (
          <div className="bg-surface px-4 py-1.5 text-center text-[11px] tracking-wide text-muted">
            Modo demo: productos de ejemplo. Conectá Supabase en .env.local para usar la base real.
          </div>
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Ticker />
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
