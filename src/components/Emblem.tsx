import { useId } from "react";

interface Props {
  className?: string;
  /** color de la lanza central (por defecto el mismo color del texto) */
  spearColor?: string;
  title?: string;
}

/**
 * Emblema "Lanza TH" de Ethiopia. Los cortes entre la lanza y las columnas
 * son transparentes de verdad (máscara), así funciona sobre cualquier fondo.
 */
export function Emblem({ className, spearColor, title }: Props) {
  const id = useId().replace(/:/g, "");
  const spear = "M100 4 L124 34 L110 42 L110 208 L100 236 L90 208 L90 42 L76 34 Z";
  const bar = "M64 70 L100 61 L136 70 L100 80 Z";
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <mask id={`cut-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240">
          <rect width="200" height="240" fill="white" />
          <g fill="black" stroke="black" strokeWidth="7" strokeLinejoin="miter">
            <path d={bar} />
            <path d={spear} />
          </g>
        </mask>
      </defs>
      <g mask={`url(#cut-${id})`}>
        <path d="M16 24 L60 50 L58 190 L44 234 Q26 130 16 24 Z" />
        <path d="M184 24 L140 50 L142 190 L156 234 Q174 130 184 24 Z" />
        <path d="M58 116 L142 116 L142 136 L58 136 Z" />
      </g>
      <g fill={spearColor ?? "currentColor"}>
        <path d={bar} />
        <path d={spear} />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={`display ${className ?? ""}`}>Ethiopia</span>;
}
