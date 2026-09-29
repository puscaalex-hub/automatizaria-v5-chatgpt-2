import { motion, useReducedMotion } from "motion/react";

/**
 * V3 · THE ELAPSED-TIME MOMENT.
 *
 * „Nu răspunde” is only convincing if the audience FEELS the waiting. Instead of
 * a small chip in the narration, every beat that advances simulated time raises a
 * full-width moment over the pipeline: +1h, +24h, +2 zile. The label is the same
 * string the timeline and the narration use, so the three can never disagree —
 * and it is explicitly labelled as simulated time, never as a real clock.
 */
export function TimeJump({ at, note, clock }: { at: string; note?: string; clock?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="timejump"
      data-testid="time-jump"
      role="status"
      aria-label={`Timp accelerat: ${at}`}
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="timejump__glow" aria-hidden="true" />
      <span className="timejump__k">{note ?? "timp accelerat"}</span>
      <span className="timejump__at">{at}</span>
      <span className="timejump__sub">
        {clock ? `ora ${clock} · ` : ""}sistemul așteaptă singur
      </span>
    </motion.div>
  );
}
