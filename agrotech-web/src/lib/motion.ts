// src/lib/motion.ts
import type { Variants } from "framer-motion";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.90, ease: EASE },
  },
};

export const fadeDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.90, ease: EASE } },
};

export const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
