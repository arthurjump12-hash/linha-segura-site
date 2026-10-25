"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** A "linha" que acompanha a leitura da página. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-electric via-cyan to-cyan shadow-[0_0_12px_rgb(0_212_255/.8)]"
    />
  );
}
