const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return ars.format(value);
}

/** Aclara u oscurece un color hex. amount entre -1 (negro) y 1 (blanco). */
export function shade(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const num = parseInt(full, 16);
  const channels = [(num >> 16) & 255, (num >> 8) & 255, num & 255].map((c) => {
    const target = amount < 0 ? 0 : 255;
    return Math.round(c + (target - c) * Math.abs(amount));
  });
  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** true si el color es claro (para elegir texto/estampa que contraste). */
export function isLight(hex: string): boolean {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}
