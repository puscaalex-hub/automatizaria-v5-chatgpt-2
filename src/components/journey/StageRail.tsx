import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { JourneyState } from "../../lib/journey/types";

/**
 * V3 · THE LEAD AS PROTAGONIST.
 *
 * The pipeline columns below say WHERE the lead is; this rail shows it MOVING.
 * It is the same deterministic stage value the engine already produces — no new
 * state, no new timers — but rendered as one continuous journey so a nontechnical
 * owner can follow the card from „Lead nou” to „Programat” without reading a
 * dashboard. The token travels by animating the fill width it is pinned to, which
 * is robust to layout changes and to `prefers-reduced-motion`.
 */
const RAIL = [
  { id: "new", label: "Lead nou", short: "Lead nou" },
  { id: "qualified", label: "Calificat", short: "Calificat" },
  { id: "nurture", label: "Follow-up automat", short: "Follow-up" },
  { id: "booked", label: "Programat", short: "Programat" },
  { id: "client", label: "Client", short: "Client" },
] as const;

export function StageRail({ state, stopped }: { state: JourneyState; stopped: boolean }) {
  const reduce = useReducedMotion();
  const idx = state.stage ? RAIL.findIndex((r) => r.id === state.stage) : -1;
  const live = state.step >= 0 && idx >= 0;
  const pct = idx <= 0 ? 0 : (idx / (RAIL.length - 1)) * 100;
  const current = idx >= 0 ? RAIL[idx] : null;

  return (
    <div
      className={`rail${live ? " is-live" : ""}${stopped ? " is-stopped" : ""}`}
      data-testid="stage-rail"
      data-step={live ? idx : -1}
      role="group"
      aria-label="Traseul leadului prin pipeline"
    >
      <div className="rail__head">
        <span className="rail__title">
          <span className={`dot ${stopped ? "dot--stop" : live ? "dot--live" : ""}`} aria-hidden="true" />
          Traseul leadului
        </span>
        <span className="rail__now" aria-live="polite">
          {live && current ? `acum: ${current.label}` : "leadul nu există încă"}
        </span>
      </div>

      <div className="rail__track">
        <span className="rail__line" aria-hidden="true" />
        <motion.span
          className="rail__fill"
          aria-hidden="true"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {live ? (
            <motion.span
              className="rail__token"
              data-testid="rail-token"
              initial={false}
              animate={{ scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 20 }}
            >
              {(state.lead.name ?? "L").slice(0, 1).toUpperCase()}
            </motion.span>
          ) : null}
        </motion.span>

        {RAIL.map((r, i) => (
          <span
            key={r.id}
            className={`rail__node${i === idx && live ? " is-current" : ""}${live && i < idx ? " is-done" : ""}`}
            style={{ left: `${(i / (RAIL.length - 1)) * 100}%` }}
          >
            <span className="rail__dot" aria-hidden="true" />
            <span className="rail__label">{r.short}</span>
          </span>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {live && current ? (
          <motion.div
            key={current.id}
            className="rail__flash"
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            data-testid="rail-flash"
          >
            <span className="rail__flash-label">{current.label}</span>
            <span className="rail__flash-sub">
              {stopped ? "secvență oprită automat" : "stadiu actual în CRM"}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
