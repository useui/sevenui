"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const WORDS = ["Copy", "Own", "Ship"] as const;
const HOLD_MS = 2200;

/**
 * The slogan as one line: the verb rolls up and the next one rises from below,
 * while "it." stays put. Screen readers get the full slogan once; with reduced
 * motion the full slogan is shown as static text instead.
 */
export function Slogan() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    // Hidden tabs don't paint, so exits would pile up; only advance while visible.
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % WORDS.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <>
        {WORDS.map((word, i) => (
          <span className="inline-block whitespace-nowrap" key={word}>
            {word} it.{i < WORDS.length - 1 ? " " : null}
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      <span className="sr-only">Copy it. Own it. Ship it.</span>
      <span aria-hidden="true" className="inline-flex items-baseline whitespace-nowrap">
        {/* Every word sits in the same grid cell, so the slot is as wide as the
            widest one and "it." never moves. */}
        <span className="relative inline-grid overflow-hidden pb-[0.12em] -mb-[0.12em] text-right">
          {WORDS.map((word) => (
            <span className="invisible col-start-1 row-start-1" key={word}>
              {word}
            </span>
          ))}
          <AnimatePresence initial={false}>
            <motion.span
              animate={{ y: "0%", opacity: 1 }}
              className="col-start-1 row-start-1"
              exit={{ y: "-100%", opacity: 0 }}
              initial={{ y: "100%", opacity: 0 }}
              key={WORDS[index]}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {WORDS[index]}
            </motion.span>
          </AnimatePresence>
        </span>
        &nbsp;it.
      </span>
    </>
  );
}
