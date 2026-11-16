"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Emblem } from "./Emblem";

/** Sección de marca: el nombre se desliza con el scroll y el emblema aparece al centro. */
export function BrandStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const left = useTransform(scrollYProgress, [0, 1], ["10%", "-35%"]);
  const right = useTransform(scrollYProgress, [0, 1], ["-35%", "10%"]);
  const scale = useTransform(scrollYProgress, [0.15, 0.5], [0.4, 1]);
  const rotate = useTransform(scrollYProgress, [0.15, 0.5], [-25, 0]);
  const opacity = useTransform(scrollYProgress, [0.15, 0.4], [0, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-line py-24 md:py-32">
      <motion.div style={{ x: left }} className="display text-[18vw] leading-none whitespace-nowrap text-surface">
        Ethiopia Ethiopia Ethiopia
      </motion.div>
      <motion.div style={{ x: right }} className="display text-[18vw] leading-none whitespace-nowrap text-transparent [-webkit-text-stroke:1px_#c9bfb2]">
        Ethiopia Ethiopia Ethiopia
      </motion.div>
      <motion.div style={{ scale, rotate, opacity }} className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Emblem className="h-40 w-32 text-cream md:h-56 md:w-48" spearColor="#9a8a76" />
        <p className="max-w-md text-sm text-muted md:text-base">
          Prendas pesadas, cortes amplios y colores tierra. Pocas piezas, hechas para durar.
        </p>
      </motion.div>
    </section>
  );
}
