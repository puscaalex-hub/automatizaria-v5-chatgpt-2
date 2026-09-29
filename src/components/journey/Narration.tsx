import { motion, useReducedMotion } from "motion/react";

import type { JourneyState, Scenario } from "../../lib/journey/types";
import { EASE } from "../../lib/motion";

/**
 * The presenter's script: what just happened, and why it matters commercially.
 * Kept short on purpose — the audience should read the title in one glance and
 * listen to Alex, not read a paragraph.
 *
 * Deliberately NOT wrapped in AnimatePresence: with `mode="wait"` a deferred exit
 * can leave the incoming beat mounted at opacity 0, and an invisible narration is
 * exactly the failure a live pitch cannot afford. A keyed remount is enough.
 */
export function Narration({
  state,
  scenario,
}: {
  state: JourneyState;
  scenario: Scenario;
}) {
  const reduce = useReducedMotion();
  const beat = state.beat;

  return (
    <div className="narr" aria-live="polite">
      {beat ? (
        <motion.div
          key={beat.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: EASE }}
        >
          <div className="narr__meta">
            <span className="chip chip--onstage" style={{ color: "var(--stage-energy)" }}>
              Pasul {state.step + 1} / {scenario.beats.length}
            </span>
            <span className="chip chip--onstage">{beat.scene}</span>
            <span className="chip chip--onstage" style={{ fontVariantNumeric: "tabular-nums" }}>
              {beat.at} · {beat.clock}
            </span>
            {beat.timeNote ? (
              <span className="chip chip--onstage" style={{ color: "var(--stage-solar)", borderColor: "rgba(239,180,76,.4)" }}>
                {beat.timeNote}
              </span>
            ) : null}
          </div>
          <h3 className="narr__title">{beat.title}</h3>
          <p className="narr__detail">{beat.detail}</p>
        </motion.div>
      ) : (
        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="narr__title">Lead Journey — ce se întâmplă cu un lead, pas cu pas</h3>
          <p className="narr__why" style={{ borderTop: 0, paddingTop: 0, marginTop: 8 }}>
            Alege un scenariu și apasă „Pornește demo”. Poți opri oricând la un pas și explica.
          </p>
        </motion.div>
      )}
    </div>
  );
}
