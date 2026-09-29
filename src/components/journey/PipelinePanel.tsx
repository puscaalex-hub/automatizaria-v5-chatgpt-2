import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { JourneyState, Lead, Scenario } from "../../lib/journey/types";
import { STAGES } from "../../lib/journey/types";
import { EASE, springSoft } from "../../lib/motion";
import { LeadCard } from "./LeadCard";
import { stageIndex } from "../../lib/journey/engine";

/**
 * SURFACE C — the CRM.
 *
 * The pipeline is the physical proof that the lead is a real record and not a
 * chat message: the same card object moves between the columns as the automation
 * progresses, and the profile underneath fills in with the fields the engine
 * extracted from the conversation.
 */
export function PipelinePanel({
  state,
  scenario,
  active,
  stopped,
  dimmed = false,
}: {
  state: JourneyState;
  scenario: Scenario;
  active: boolean;
  stopped: boolean;
  dimmed?: boolean;
}) {
  const reduce = useReducedMotion();
  const current = stageIndex(state.stage);
  const hasLead = state.step >= 0 && current >= 0;

  const FIELDS: { k: string; v?: string; testId?: string }[] = [
    { k: "Nume", v: state.lead.name },
    { k: "Zonă", v: state.lead.city },
    { k: "Clădire", v: state.lead.building },
    { k: "Factură", v: state.lead.bill, testId: "profile-bill" },
    { k: "Acoperiș", v: state.lead.roof },
    { k: "Interes", v: state.lead.interest },
  ];
  const filled = FIELDS.filter((f) => f.v).length;

  return (
    <section
      className={`panel${active ? " is-focused" : ""}${dimmed ? " is-dim" : ""}`}
      aria-label="CRM și pipeline comercial"
      data-testid="surface-crm"
      style={{ marginTop: 0 }}
    >
      <header className="panel__head">
        <span className="panel__title">
          <span className={`dot ${hasLead ? "dot--live" : ""}`} aria-hidden="true" />
          C · CRM & pipeline comercial
        </span>
        <span className="panel__step" aria-live="polite">
          {hasLead
            ? `stadiu: ${STAGES[current]?.label ?? "—"}`
            : "niciun lead încă"}
        </span>
      </header>

      <ol className="pipe" data-testid="pipeline">
        {STAGES.map((s, i) => {
          const isActive = hasLead && i === current;
          const isDone = hasLead && i < current;
          const isStoppedNurture = stopped && s.id === "nurture";
          return (
            <li
              key={s.id}
              className={`pipe__col${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}${isStoppedNurture ? " is-stopped" : ""}`}
              data-stage={s.id}
              data-active={isActive ? "true" : "false"}
            >
              <div className="pipe__head">
                <span
                  className={`dot${isStoppedNurture ? " dot--stop" : isActive ? " dot--live" : isDone ? " dot--solar" : ""}`}
                  aria-hidden="true"
                />
                <span className="pipe__label">{s.label}</span>
                {isStoppedNurture ? <span className="pipe__stop">oprit</span> : null}
              </div>
              <p className="pipe__hint">{s.hint}</p>
              <div className="pipe__slot">
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="lead-card"
                      layoutId="lead-journey-card"
                      layout
                      transition={reduce ? { duration: 0 } : springSoft}
                      style={{ width: "100%" }}
                      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <LeadCard lead={state.lead as Lead} compact badge={stopped ? "secvență oprită" : undefined} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isActive && !hasLead && i === 0 && (
                  <span className="leadcard__ghost">cardul leadului apare aici</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="profile" data-testid="lead-profile">
        <div className="row between" style={{ marginBottom: 10 }}>
          <span className="fu__title" style={{ margin: 0 }}>
            Fișa leadului · completată automat
          </span>
          <span className="panel__step">{filled}/6 câmpuri</span>
        </div>
        <div className="profile__grid">
          {FIELDS.map((f) => (
            <div className="profile__cell" key={f.k}>
              <div className="profile__k">{f.k}</div>
              <motion.div
                key={`${f.k}-${f.v ?? "empty"}`}
                className="profile__v"
                data-empty={f.v ? "false" : "true"}
                data-testid={f.testId}
                initial={reduce || !f.v ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                {f.v ?? "—"}
                {f.v ? (
                  <motion.span
                    className="profile__flash"
                    initial={reduce ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    aria-hidden="true"
                  />
                ) : null}
              </motion.div>
            </div>
          ))}
        </div>
        <p className="timer__note" style={{ marginTop: 10 }}>
          Andrei din {scenario.seed.city} · nimic nu este trimis către un CRM real
        </p>
      </div>
    </section>
  );
}
