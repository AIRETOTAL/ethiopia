"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export function AccordionItem({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3.5 text-left text-sm"
      >
        {title}
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-lg leading-none text-muted" aria-hidden="true">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm leading-relaxed text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
