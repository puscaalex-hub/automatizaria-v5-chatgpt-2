import type { Variants, Transition } from "motion/react";

/**
 * Shared motion language for the Master Solar demo.
 *
 * Rules encoded here:
 *  - one easing curve everywhere (premium feel comes from consistency)
 *  - reveal distances stay small (8–24px) so it reads as fade, not slide
 *  - reduced motion is handled by the consumer via `useReducedMotion()`;
 *    these variants describe the FULL-motion case only.
 */

export const EASE = [0.22, 1, 0.36, 1] as const;

export const springSoft: Transition = { type: "spring", stiffness: 180, damping: 24, mass: 0.9 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export const stagger = (delayChildren = 0.06, staggerChildren = 0.07): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Viewport config used by every scroll reveal so thresholds never drift. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

/** Non-motion fallbacks: when reduced motion is on, elements start visible. */
export const safe = (variants: Variants, reduce: boolean | null): Variants =>
  reduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : variants;
