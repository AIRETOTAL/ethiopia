"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Emblem } from "@/components/Emblem";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string } | null>(null);
  const [supabase] = useState(() => createClient());

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setMessage({ type: "error", text: "Email o contraseña incorrectos." });
      router.push("/cuenta");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: String(form.get("full_name") ?? "") } },
      });
      setLoading(false);
      if (error) return setMessage({ type: "error", text: error.message });
      if (data.session) {
        router.push("/cuenta");
        router.refresh();
      } else {
        setMessage({ type: "ok", text: "¡Listo! Revisá tu email para confirmar la cuenta y después ingresá." });
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <Emblem className="h-20 w-16 text-cream" spearColor="#9a8a76" />
      <div className="relative mt-8 grid w-full grid-cols-2 rounded-full border border-line p-1">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setMessage(null);
            }}
            className={`relative h-10 rounded-full text-xs font-semibold tracking-[0.12em] uppercase ${mode === m ? "text-ink" : ""}`}
          >
            {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-cream" />}
            <span className="relative">{m === "login" ? "Ingresar" : "Crear cuenta"}</span>
          </button>
        ))}
      </div>

      {!supabase ? (
        <p className="mt-8 text-center text-sm text-muted">
          Las cuentas funcionan cuando conectás Supabase (ver README). En modo demo podés comprar como invitado.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 flex w-full flex-col gap-4">
          <AnimatePresence initial={false}>
            {mode === "signup" && (
              <motion.label
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-1.5 overflow-hidden"
              >
                <span className="label">Nombre</span>
                <input name="full_name" autoComplete="name" className="h-12 rounded-md border border-line bg-coal px-3 text-sm outline-none focus:border-cream" />
              </motion.label>
            )}
          </AnimatePresence>
          <label className="flex flex-col gap-1.5">
            <span className="label">Email</span>
            <input name="email" type="email" required autoComplete="email" className="h-12 rounded-md border border-line bg-coal px-3 text-sm outline-none focus:border-cream" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="h-12 rounded-md border border-line bg-coal px-3 text-sm outline-none focus:border-cream"
            />
          </label>
          {message && (
            <p role="alert" className={`text-sm ${message.type === "error" ? "text-ember-soft" : "text-cream"}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-full bg-ember text-sm font-semibold tracking-[0.12em] text-ink uppercase hover:bg-ember-soft disabled:opacity-60"
          >
            {loading ? "Un momento…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
      )}
    </div>
  );
}
