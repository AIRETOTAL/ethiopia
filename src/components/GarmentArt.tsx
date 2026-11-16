import { useId, type ReactNode } from "react";
import { isLight, shade } from "@/lib/format";
import type { GarmentKind } from "@/lib/types";

interface Props {
  kind: GarmentKind;
  color: string;
  view?: "front" | "back";
  className?: string;
}

/**
 * Ilustración vectorial de la prenda, en el color elegido.
 * Se usa mientras no haya fotos cargadas: cuando subas fotos en Supabase,
 * se muestran las fotos en su lugar.
 */
export function GarmentArt({ kind, color, view = "front", className }: Props) {
  const id = useId().replace(/:/g, "");
  const dark = shade(color, -0.28);
  const darker = shade(color, -0.45);
  const light = shade(color, 0.12);
  const ink = isLight(color) ? "#1a1714" : "#efe8dd";

  const shapes: Record<GarmentKind, ReactNode> = {
    hoodie: (
      <>
        <path
          d="M60 46 Q100 30 140 46 L176 64 Q186 70 189 82 L198 156 L174 162 L160 104 L160 222 Q100 232 40 222 L40 104 L26 162 L2 156 L11 82 Q14 70 24 64 Z"
          fill={`url(#g-${id})`}
        />
        {view === "front" ? (
          <>
            <path d="M68 46 Q100 6 132 46 Q118 66 100 68 Q82 66 68 46 Z" fill={dark} />
            <path d="M78 48 Q100 22 122 48 Q112 58 100 60 Q88 58 78 48 Z" fill={darker} />
            <line x1="92" y1="62" x2="90" y2="96" stroke={light} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="108" y1="62" x2="110" y2="96" stroke={light} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M66 158 L134 158 L142 196 L58 196 Z" fill="none" stroke={dark} strokeWidth="2.5" />
          </>
        ) : (
          <path d="M68 46 Q100 0 132 46 Q118 92 100 96 Q82 92 68 46 Z" fill={dark} />
        )}
        <rect x="40" y="208" width="120" height="14" fill={dark} opacity="0.8" />
        <rect x="160" y="146" width="20" height="14" transform="rotate(-14 170 153)" fill={dark} opacity="0.8" />
        <rect x="20" y="146" width="20" height="14" transform="rotate(14 30 153)" fill={dark} opacity="0.8" />
      </>
    ),
    tee: (
      <>
        <path
          d="M64 34 Q100 50 136 34 L182 56 L170 100 L150 92 L152 222 Q100 230 48 222 L50 92 L30 100 L18 56 Z"
          fill={`url(#g-${id})`}
        />
        {view === "front" ? (
          <path d="M70 36 Q100 62 130 36" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" />
        ) : (
          <path d="M70 36 Q100 46 130 36" fill="none" stroke={dark} strokeWidth="5" strokeLinecap="round" />
        )}
      </>
    ),
    jacket: (
      <>
        <path
          d="M66 34 L100 44 L134 34 L172 56 Q184 64 186 78 L198 170 L174 174 L158 108 L158 222 L42 222 L42 108 L26 174 L2 170 L14 78 Q16 64 28 56 Z"
          fill={`url(#g-${id})`}
        />
        {view === "front" ? (
          <>
            <path d="M66 34 L100 66 L134 34 L122 24 L100 46 L78 24 Z" fill={dark} />
            <line x1="100" y1="66" x2="100" y2="222" stroke={darker} strokeWidth="3" />
            <rect x="54" y="150" width="34" height="30" rx="2" fill="none" stroke={dark} strokeWidth="2.5" />
            <rect x="112" y="150" width="34" height="30" rx="2" fill="none" stroke={dark} strokeWidth="2.5" />
          </>
        ) : (
          <path d="M78 24 L100 36 L122 24 L134 34 L100 46 L66 34 Z" fill={dark} />
        )}
        <rect x="42" y="208" width="116" height="14" fill={dark} opacity="0.7" />
      </>
    ),
    pants: (
      <>
        <path d="M54 14 L146 14 L156 228 L110 228 L100 92 L90 228 L44 228 Z" fill={`url(#g-${id})`} />
        <rect x="54" y="14" width="92" height="14" fill={dark} />
        {view === "front" ? (
          <>
            <path d="M100 28 L100 84" stroke={darker} strokeWidth="2.5" />
            <path d="M58 30 Q72 46 84 30" fill="none" stroke={dark} strokeWidth="2.5" />
            <path d="M142 30 Q128 46 116 30" fill="none" stroke={dark} strokeWidth="2.5" />
          </>
        ) : (
          <>
            <rect x="62" y="44" width="26" height="26" rx="2" fill="none" stroke={dark} strokeWidth="2.5" />
            <rect x="112" y="44" width="26" height="26" rx="2" fill="none" stroke={dark} strokeWidth="2.5" />
          </>
        )}
      </>
    ),
    shorts: (
      <>
        <path d="M50 40 L150 40 L162 176 L110 182 L100 104 L90 182 L38 176 Z" fill={`url(#g-${id})`} />
        <rect x="50" y="40" width="100" height="14" fill={dark} />
        <path d="M40 162 L92 168 M160 162 L108 168" stroke={dark} strokeWidth="3" />
        {view === "front" ? (
          <path d="M100 54 L100 96" stroke={darker} strokeWidth="2.5" />
        ) : (
          <>
            <rect x="62" y="66" width="24" height="22" rx="2" fill="none" stroke={dark} strokeWidth="2.5" />
            <rect x="114" y="66" width="24" height="22" rx="2" fill="none" stroke={dark} strokeWidth="2.5" />
          </>
        )}
      </>
    ),
  };

  const showPrint = kind !== "pants" && kind !== "shorts";
  const printBack = view === "back";

  return (
    <svg viewBox="0 0 200 240" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      {shapes[kind]}
      {showPrint &&
        (printBack ? (
          <g transform="translate(70 92) scale(0.3)" fill={ink} opacity="0.92">
            <MiniEmblem />
          </g>
        ) : (
          <g transform={`translate(${kind === "jacket" ? 120 : 116} 76) scale(0.09)`} fill={ink} opacity="0.85">
            <MiniEmblem />
          </g>
        ))}
    </svg>
  );
}

function MiniEmblem() {
  return (
    <>
      <path d="M16 24 L60 50 L58 190 L44 234 Q26 130 16 24 Z" />
      <path d="M184 24 L140 50 L142 190 L156 234 Q174 130 184 24 Z" />
      <path d="M58 116 L142 116 L142 136 L58 136 Z" />
      <path d="M100 4 L124 34 L110 42 L110 208 L100 236 L90 208 L90 42 L76 34 Z" />
    </>
  );
}
