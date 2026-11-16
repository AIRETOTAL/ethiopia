"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useIntro } from "@/lib/intro-store";

const PILLARS = [
  "M16 24 L60 50 L58 190 L44 234 Q26 130 16 24 Z",
  "M184 24 L140 50 L142 190 L156 234 Q174 130 184 24 Z",
  "M58 116 L142 116 L142 136 L58 136 Z",
];
const SPEAR = ["M64 70 L100 61 L136 70 L100 80 Z", "M100 4 L124 34 L110 42 L110 208 L100 236 L90 208 L90 42 L76 34 Z"];
const WORD = "ETHIOPIA".split("");
const DURATION = 3.4; // segundos hasta que se abre la página
const SEEN_KEY = "ethiopia-intro-seen";

/**
 * Intro de entrada: el emblema se dibuja trazo a trazo, gira en 3D,
 * cuenta de 0 a 100, aparece el nombre y la cortina sube mostrando la tienda.
 * Se muestra una vez por sesión; tocando la pantalla se saltea.
 */
export function Intro() {
  const [show, setShow] = useState(true);
  const finish = useIntro((s) => s.finish);
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => String(Math.round(v)).padStart(3, "0"));
  const bar = useTransform(progress, (v) => `${v}%`);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen || reduce) {
      setShow(false);
      finish();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const controls = animate(progress, 100, { duration: DURATION - 0.4, ease: [0.65, 0, 0.35, 1] });
    const t = setTimeout(close, DURATION * 1000);
    return () => {
      controls.stop();
      clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    document.documentElement.style.overflow = "";
    setShow(false);
    // las prendas entran mientras sube la cortina
    setTimeout(finish, 350);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          role="presentation"
          onClick={close}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-ink"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* emblema: se dibuja, se rellena y gira */}
          <motion.div
            style={{ transformPerspective: 900 }}
            initial={{ rotateY: -70, scale: 0.85, opacity: 0 }}
            animate={{ rotateY: [-70, 0, 360], scale: [0.85, 1, 1], opacity: 1 }}
            exit={{ scale: 0.6, y: -40, opacity: 0 }}
            transition={{ duration: DURATION - 0.5, times: [0, 0.35, 1], ease: [0.45, 0, 0.2, 1] }}
          >
            <svg viewBox="-6 -6 212 252" className="h-40 w-34 md:h-52 md:w-44" aria-hidden="true">
              {PILLARS.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  fill="#1e1c1a"
                  stroke="#1e1c1a"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, fillOpacity: 0 }}
                  animate={{ pathLength: 1, fillOpacity: 1 }}
                  transition={{
                    pathLength: { duration: 1.1, delay: 0.1 + i * 0.15, ease: "easeInOut" },
                    fillOpacity: { duration: 0.5, delay: 1.1 + i * 0.1 },
                  }}
                />
              ))}
              {SPEAR.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  fill="#9a8a76"
                  stroke="#eee9e2"
                  strokeWidth="7"
                  paintOrder="stroke"
                  initial={{ pathLength: 0, fillOpacity: 0, y: -30 }}
                  animate={{ pathLength: 1, fillOpacity: 1, y: 0 }}
                  transition={{
                    pathLength: { duration: 0.9, delay: 0.5 + i * 0.1 },
                    fillOpacity: { duration: 0.4, delay: 1.3 },
                    y: { type: "spring", stiffness: 120, damping: 12, delay: 1.2 },
                  }}
                />
              ))}
            </svg>
          </motion.div>

          {/* nombre letra por letra */}
          <div className="mt-8 flex overflow-hidden" aria-label="Ethiopia">
            {WORD.map((ch, i) => (
              <motion.span
                key={i}
                className="display text-4xl md:text-6xl"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-110%" }}
                transition={{ duration: 0.7, delay: 1.5 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                {ch}
              </motion.span>
            ))}
          </div>

          {/* contador y barra de carga */}
          <div className="absolute inset-x-6 bottom-8 flex items-end justify-between md:inset-x-10">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="label">
              Nueva colección
            </motion.span>
            <motion.span className="display text-5xl tabular-nums md:text-7xl">{count}</motion.span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-line">
            <motion.div className="h-full bg-cream" style={{ width: bar }} />
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="label absolute top-6 right-6 md:right-10"
          >
            Tocá para entrar
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
