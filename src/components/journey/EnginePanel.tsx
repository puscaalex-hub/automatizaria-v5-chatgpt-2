import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { EngineEvent, FollowUpItem, FollowUpStatus } from "../../lib/journey/types";
import { CHANNEL_META, KIND_META } from "../../lib/journey/types";
import { EASE } from "../../lib/motion";
import { Icon } from "./icons";

/**
 * SURFACE B — the automation engine.
 *
 * This is the part the audience has never seen: the event stream of triggers,
 * extractions, CRM writes, timers, actions and the one STOP that matters. Reading
 * it should feel like reading the real workflow run, because that is what it is
 * designed to become.
 */
export function EnginePanel({
  events,
  active,
  dimmed = false,
  timer,
  followUps,
  followUpPlan,
  stopped,
  idle,
  playing,
  speed,
}: {
  events: EngineEvent[];
  active: boolean;
  dimmed?: boolean;
  timer: { label: string; target: string } | null;
  followUps: Record<string, FollowUpStatus>;
  followUpPlan: FollowUpItem[];
  stopped: boolean;
  idle: boolean;
  playing: boolean;
  speed: number;
}) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length]);

  return (
    <section
      className={`panel${active ? " is-focused" : ""}${dimmed ? " is-dim" : ""}`}
      aria-label="Motorul de automatizare"
      data-testid="surface-engine"
    >
      <header className="panel__head">
        <span className="panel__title">
          <span
            className={`dot ${stopped ? "dot--stop" : idle ? "" : "dot--live"}`}
            aria-hidden="true"
          />
          B · Automation engine
        </span>
        <span className="panel__step">{events.length} evenimente</span>
      </header>

      <div className="eng__scroll" ref={scrollRef} data-testid="engine-log">
        {events.length === 0 ? (
          <p className="eng__empty">
            Regulile, timerele și acțiunile apar aici pe măsură ce se execută.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((e, i) => {
              const kind = KIND_META[e.kind];
              const tone = e.tone ?? kind.tone;
              const channel = e.channel ? CHANNEL_META[e.channel] : null;
              return (
                <motion.div
                  key={`${i}-${e.label}`}
                  className="eng__row"
                  data-tone={tone}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color:
                        tone === "stop"
                          ? "var(--stage-stop)"
                          : tone === "solar"
                            ? "var(--stage-solar)"
                            : tone === "energy"
                              ? "var(--stage-energy)"
                              : "var(--stage-muted)",
                      paddingTop: 2,
                    }}
                  >
                    <Icon name={e.kind} size={15} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <span className="eng__kind">{kind.label}</span>
                    <div className="eng__label">{e.label}</div>
                    {e.detail ? <div className="eng__detail">{e.detail}</div> : null}
                    {(channel || e.status) && (
                      <div className="eng__tags">
                        {channel ? <span className="eng__tag">{channel.label}</span> : null}
                        {e.status ? <span className="eng__tag">status: {e.status}</span> : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {timer ? (
        <motion.div
          key={`${timer.label}-${timer.target}`}
          className={`timer${stopped ? " timer--stopped" : ""}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          data-testid="engine-timer"
        >
          <div className="timer__head">
            <span className="timer__label">
              {stopped ? "Timer oprit" : "Timer armat"} · {timer.label}
            </span>
            <span className="timer__target">{timer.target}</span>
          </div>
          <div className="timer__track">
            <motion.div
              className="timer__fill"
              initial={{ width: playing && !reduce ? "0%" : "100%" }}
              animate={{ width: "100%" }}
              transition={
                playing && !reduce
                  ? { duration: 1.6 / speed, ease: "linear" }
                  : { duration: 0 }
              }
            />
          </div>
          <div className="timer__note">
            Timp accelerat · intervalul se configurează în automatizare
          </div>
        </motion.div>
      ) : null}

      {followUpPlan.length > 0 && (
        <FollowUpPlan plan={followUpPlan} statuses={followUps} />
      )}
    </section>
  );
}

/**
 * The follow-up sequence, visibly planned BEFORE it runs — so that when the
 * client answers, the audience can see the remaining messages being cancelled.
 * That cancellation is the single most valuable thing on this page.
 */
function FollowUpPlan({
  plan,
  statuses,
}: {
  plan: FollowUpItem[];
  statuses: Record<string, FollowUpStatus>;
}) {
  const statusLabel: Record<FollowUpStatus, string> = {
    planned: "programat",
    armed: "armat",
    sent: "trimis",
    waiting: "așteaptă",
    answered: "răspuns",
    cancelled: "OPRIT",
  };

  return (
    <div className="fu" data-testid="followup-plan">
      <div className="fu__title">Secvență de follow-up</div>
      {plan.map((f) => {
        const st = statuses[f.id] ?? "planned";
        return (
          <div key={f.id} className="fu__row" data-status={st} data-testid={`fu-${f.id}`}>
            <span className="fu__n" aria-hidden="true">
              {f.n}
            </span>
            <span className="fu__label">
              <span className="fu__name">{f.label}</span>
              <span className="fu__when">
                {" "}
                · {CHANNEL_META[f.channel].label} · {f.at}
              </span>
            </span>
            <span className="fu__status">{statusLabel[st]}</span>
          </div>
        );
      })}
    </div>
  );
}
