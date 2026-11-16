import { useId } from "react";

/**
 * Percha realista: madera con veta y gancho cromado.
 * variant "shirt" = percha de hombros (remeras, buzos, camperas)
 * variant "clip"  = percha de barra con dos broches (pantalones, shorts)
 * Se dibuja DETRÁS de la prenda, así los hombros la tapan como en la vida real.
 */
export function Hanger({ variant = "shirt", className }: { variant?: "shirt" | "clip"; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 240 96" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`wood-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d2a273" />
          <stop offset="0.35" stopColor="#a8754a" />
          <stop offset="0.75" stopColor="#7d5131" />
          <stop offset="1" stopColor="#5a3820" />
        </linearGradient>
        <linearGradient id={`chrome-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6f6f6f" />
          <stop offset="0.35" stopColor="#f4f4f4" />
          <stop offset="0.6" stopColor="#a9a9a9" />
          <stop offset="1" stopColor="#4d4d4d" />
        </linearGradient>
        <linearGradient id={`clip-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5c5c5c" />
          <stop offset="0.45" stopColor="#e6e6e6" />
          <stop offset="1" stopColor="#3f3f3f" />
        </linearGradient>
        <filter id={`sh-${id}`} x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* gancho cromado */}
      <g filter={`url(#sh-${id})`}>
        <path
          d="M120 50 V24 C120 11 134 4 143 11 C150 17 147 28 139 30"
          fill="none"
          stroke="#2b2b2b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M120 50 V24 C120 11 134 4 143 11 C150 17 147 28 139 30"
          fill="none"
          stroke={`url(#chrome-${id})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="113" y="44" width="14" height="10" rx="3" fill={`url(#chrome-${id})`} stroke="#3a3a3a" strokeWidth="0.8" />
      </g>

      {variant === "shirt" ? (
        <g filter={`url(#sh-${id})`}>
          {/* cuerpo de madera con hombros curvos */}
          <path
            d="M8 82 Q58 58 110 50 L130 50 Q182 58 232 82 Q236 89 228 90 Q180 72 130 64 L110 64 Q60 72 12 90 Q4 89 8 82 Z"
            fill={`url(#wood-${id})`}
          />
          {/* brillo del borde superior */}
          <path d="M12 80 Q60 58 110 51 L130 51 Q180 58 228 80" fill="none" stroke="#f0c999" strokeWidth="1.4" opacity="0.7" />
          {/* veta */}
          <path d="M30 80 Q70 64 110 58" fill="none" stroke="#6b4428" strokeWidth="0.8" opacity="0.45" />
          <path d="M210 80 Q170 64 130 58" fill="none" stroke="#6b4428" strokeWidth="0.8" opacity="0.45" />
          <path d="M60 74 Q90 64 112 61" fill="none" stroke="#e2b689" strokeWidth="0.6" opacity="0.4" />
        </g>
      ) : (
        <g filter={`url(#sh-${id})`}>
          {/* barra de madera */}
          <rect x="22" y="50" width="196" height="13" rx="6.5" fill={`url(#wood-${id})`} />
          <path d="M28 52.5 H212" stroke="#f0c999" strokeWidth="1.3" opacity="0.7" strokeLinecap="round" />
          <path d="M40 58 H200" stroke="#6b4428" strokeWidth="0.7" opacity="0.45" />
          {/* broches metálicos */}
          {[64, 176].map((x) => (
            <g key={x}>
              <rect x={x - 8} y="58" width="16" height="22" rx="2.5" fill={`url(#clip-${id})`} stroke="#2e2e2e" strokeWidth="0.8" />
              <line x1={x - 5} y1="66" x2={x + 5} y2="66" stroke="#2e2e2e" strokeWidth="0.8" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** Qué percha usa cada tipo de prenda. */
export function hangerFor(kind: string): "shirt" | "clip" {
  return kind === "pants" || kind === "shorts" ? "clip" : "shirt";
}
