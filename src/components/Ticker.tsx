const MESSAGES = [
  "Nueva colección",
  "Envíos a todo el país",
  "Hombre · Mujer",
  "Hecho para durar",
];

/** Cinta animada naranja con mensajes que se desplazan sin fin. */
export function Ticker() {
  const row = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden bg-ember text-ink" aria-label={MESSAGES.join(". ")}>
      <div className="flex w-max animate-marquee items-center py-2.5" aria-hidden="true">
        {[...row, ...row].map((m, i) => (
          <span key={i} className="flex items-center gap-6 px-6 text-[12px] font-semibold tracking-[0.18em] uppercase">
            {m}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M4 0L8 4L4 8L0 4Z" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}
