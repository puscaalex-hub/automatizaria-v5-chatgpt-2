import { motion, useReducedMotion } from "motion/react";

import type { JourneyState, Scenario } from "../../lib/journey/types";
import { EASE } from "../../lib/motion";

/**
 * The simulated clock.
 *
 * The rail is driven by the step index, never by wall-clock time, so the label
 * "timp SIMULAT" is literally true: nothing here is a real timer. Ticks are the
 * distinct time labels of the scenario, which keeps the rail honest for both
 * scenarios (minutes in one, days in the other).
 */
export function Timeline({
  state,
  scenario,
}: {
  state: JourneyState;
  scenario: Scenario;
}) {
  const reduce = useReducedMotion();
  const total = scenario.beats.length;

  const groups: { at: string; atIndex: number }[] = [];
  scenario.beats.forEach((b, i) => {
    if (groups.length === 0 || groups[groups.length - 1].at !== b.at) {
      groups.push({ at: b.at, atIndex: i });
    }
  });

  const progress = state.step < 0 ? 0 : ((state.step + 1) / total) * 100;
  const currentGroup = groups.reduce(
    (acc, g) => (g.atIndex <= state.step ? g.at : acc),
    groups[0]?.at ?? "",
  );

  const span =
    scenario.kind === "no_reply"
      ? "2 zile reale, arătate în ~30 de secunde"
      : "toată conversația: ~5 minute";

  return (
    <div className="tl">
      <div className="tl__head">
        <span className="tl__sim">
          <span className="dot dot--solar" aria-hidden="true" />
          Timp accelerat pentru demonstrație
        </span>
        <span className="ctl__hint">{span}</span>
      </div>

      <div className="tl__rail">
        <motion.div
          className="tl__fill"
          animate={{ width: `${progress}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
        />
        {state.step >= 0 && (
          <motion.span
            className="tl__head-dot"
            animate={{ left: `${progress}%` }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
          />
        )}
      </div>

      <div className="tl__ticks">
        {groups.map((g, gi) => {
          const left = ((g.atIndex + 0.5) / total) * 100;
          const isCurrent = g.at === currentGroup && state.step >= 0;
          const isDone = g.atIndex <= state.step;
          const isFirst = gi === 0;
          const isLast = gi === groups.length - 1;
          return (
            <span
              key={g.at}
              className={[
                "tl__tick",
                isCurrent ? "is-current" : isDone ? "is-done" : "",
                isFirst ? "tl__tick--first" : "",
                isLast ? "tl__tick--last" : "",
              ].filter(Boolean).join(" ")}
              style={{
                position: "absolute",
                left: `${left}%`,
                transform: "translateX(-50%)",
              }}
            >
              {g.at}
            </span>
          );
        })}
      </div>
    </div>
  );
}
