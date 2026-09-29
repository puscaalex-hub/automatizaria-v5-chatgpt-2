import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";

import type {
  Channel,
  FieldId,
  FollowUpItem,
  FollowUpStatus,
  LeadSeed,
  ScenarioKind,
} from "../../lib/journey/types";
import { CHANNEL_META, STAGES } from "../../lib/journey/types";
import { buildScenario } from "../../lib/journey/scenarios";
import { deriveState } from "../../lib/journey/engine";
import { BEAT_MS, shortcutAction, useJourneyPlayer } from "../../hooks/useJourneyPlayer";
import { REVEAL, cueFor, FLOW_NODES, type CineFlow } from "../../lib/journey/cinematic";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { BookingCTA } from "../BookingCTA";
import { ChannelBus } from "../journey/ChannelBus";
import { Controls } from "../journey/Controls";
import { Conversation } from "../journey/Conversation";
import { Icon } from "../journey/icons";
import { LeadCard } from "../journey/LeadCard";
import { StageRail } from "../journey/StageRail";
import { StopBanner } from "../journey/StopBanner";
import "../journey/journey.css";
import "../journey/journey-v3.css";
import "./cinematic.css";

/**
 * CINEMATIC DEMO — V4, the section the whole page exists for.
 *
 * Same deterministic core as V3 (`scenarios.ts` + `engine.ts` + one integer
 * `step`), re-staged so the no-reply story reads with the sound off. V4 is a
 * presentation pass, not a rebuild:
 *
 *   · ONE focal surface per beat — everything else is pushed back, never removed;
 *   · the extracted fields physically leave the conversation and land on the lead
 *     card, which then moves to CRM and reads CALIFICAT;
 *   · the silence beat dims the rest of the interface so the lead is FELT to be gone;
 *   · three time jumps (+1h, +24h, +2 zile) each send a message along one visible edge;
 *   · the answer travels BACK into the automation, which then cancels the two future
 *     messages and the internal reminder in one state update;
 *   · the booking lands in a calendar card, and the payoff is one line.
 *
 * Technical detail (event log, pipeline columns, follow-up queue internals) is NOT
 * here on purpose — it lives in SYSTEM VIEW, one click away.
 */
const FIELD_LABELS: { id: FieldId; label: string }[] = [
  { id: "name", label: "Nume" },
  { id: "city", label: "Zonă" },
  { id: "building", label: "Clădire" },
  { id: "bill", label: "Factură" },
  { id: "roof", label: "Acoperiș" },
  { id: "interest", label: "Interes" },
];

const FU_LABEL: Record<FollowUpStatus, string> = {
  planned: "programat",
  armed: "ARMAT",
  sent: "trimis",
  waiting: "în așteptare",
  answered: "a răspuns",
  cancelled: "ANULAT",
};

/**
 * V4 · THE FIELDS LEAVING THE CONVERSATION.
 *
 * On the qualification beats the audience must see information come OUT of the
 * chat and land on the lead — that is the difference between "AI answers" and "AI
 * qualifies". The chips travel on the axis the layout actually has: horizontally
 * on desktop (conversation is left of the record), downward on mobile (the record
 * sits below the conversation).
 */
function FieldFlight({ items, vertical }: { items: string[]; vertical: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div className="cine-fly" aria-hidden="true" data-testid="cine-fly" data-axis={vertical ? "v" : "h"}>
      {items.map((t, i) => (
        <motion.span
          key={`${t}-${i}`}
          className="cine-fly__chip"
          style={vertical ? { left: `${8 + i * 12}%` } : { top: `${30 + i * 11}%` }}
          initial={reduce ? { opacity: 1 } : vertical ? { opacity: 0, top: "26%" } : { opacity: 0, left: "20%" }}
          animate={
            reduce
              ? { opacity: 1 }
              : vertical
                ? { opacity: [0, 1, 1, 0], top: ["26%", "40%", "56%", "68%"] }
                : { opacity: [0, 1, 1, 0], left: ["20%", "34%", "62%", "76%"] }
          }
          transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : i * 0.14, ease: "easeInOut" }}
        >
          {t}
        </motion.span>
      ))}
    </div>
  );
}

/** The armed sequence, as one honest list (no engine log, no kinds, no ids). */
function Queue({
  plan,
  followUps,
  stopped,
  active,
  justCancelled,
}: {
  plan: FollowUpItem[];
  followUps: Record<string, FollowUpStatus>;
  stopped: boolean;
  active: boolean;
  /** True only on the beat where the stop happens, so the strike-out plays once. */
  justCancelled: boolean;
}) {
  if (plan.length === 0) {
    return <div className="cine-queue__empty">Nicio secvență programată în acest scenariu.</div>;
  }
  let cancelIndex = 0;
  return (
    <ul className="cine-queue__list" data-testid="cine-queue">
      {plan.map((f) => {
        const st = followUps[f.id] ?? "planned";
        const isCancelled = st === "cancelled";
        const isReminder = f.kind === "reminder";
        const i = isCancelled ? cancelIndex++ : 0;
        return (
          <li
            key={f.id}
            className={`cine-fu is-${st}${isReminder ? " is-reminder" : ""}${isCancelled && justCancelled ? " is-cancelling" : ""}`}
            style={isCancelled ? ({ "--i": i } as React.CSSProperties) : undefined}
            data-testid={`cine-queue-${f.id}`}
            data-status={st}
            data-kind={f.kind ?? "message"}
            data-active={active && (st === "armed" || st === "planned") ? "true" : "false"}
          >
            <span className="cine-fu__n" aria-hidden="true">
              {isReminder ? <Icon name="timer" size={11} /> : f.n}
            </span>
            <span className="cine-fu__body">
              <span className="cine-fu__label">{f.label}</span>
              <span className="cine-fu__meta">
                {isReminder ? "intern" : `#${f.n} · ${CHANNEL_META[f.channel].label}`} · {f.at}
              </span>
            </span>
            <span className={`cine-fu__tag${isCancelled ? " is-stop" : ""}`}>
              {isCancelled ? "ANULAT" : FU_LABEL[st]}
            </span>
            {isCancelled && stopped ? <span className="cine-fu__strike" aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * THE EXPLANATORY FLOW RAIL.
 *
 * One strip, one packet, always on the single edge that carries information for the
 * current beat. Direction comes from the deterministic cue, so an outbound follow-up
 * travels left→right and the client's answer travels right→left, back INTO the
 * automation that then stops the sequence.
 */
function FlowRail({
  flow,
  direction,
  channelLabel,
  live,
  stopped,
}: {
  flow: CineFlow | null;
  direction: "out" | "in";
  channelLabel: string;
  live: boolean;
  stopped: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <ol
      className={`cine-flow${live ? " is-live" : ""}${stopped ? " is-stopped" : ""}`}
      data-testid="cine-flow"
      data-edge={flow ? `${flow.from}>${flow.to}` : "none"}
      data-flow-dir={flow ? direction : "none"}
      aria-label="Fluxul informației: conversație, AI, CRM, automatizare, canal, programare"
    >
      {FLOW_NODES.map((n, i) => {
        const isSource = flow?.from === n.id;
        const isSink = flow?.to === n.id;
        const next = FLOW_NODES[i + 1];
        const edgeActive =
          Boolean(flow) && next
            ? (flow!.from === n.id && flow!.to === next.id) || (flow!.from === next.id && flow!.to === n.id)
            : false;
        const edgeForward = edgeActive ? flow!.from === n.id : true;
        return (
          <li key={n.id} className="cine-flow__cell">
            <span
              className={`cine-flow__node${isSource ? " is-source" : ""}${isSink ? " is-sink" : ""}`}
              data-node={n.id}
              data-testid={`cine-flow-node-${n.id}`}
            >
              {n.id === "channel" ? channelLabel : n.label}
              {n.id === "engine" && stopped ? <em className="cine-flow__stop">STOP</em> : null}
            </span>
            {next ? (
              <span
                className={`cine-flow__edge${edgeActive ? " is-active" : ""}`}
                data-active={edgeActive ? "true" : "false"}
                aria-hidden="true"
              >
                <span className="cine-flow__track" />
                {edgeActive && !reduce ? (
                  <motion.span
                    className={`cine-flow__packet${edgeForward ? "" : " is-in"}`}
                    initial={{ left: edgeForward ? "0%" : "100%" }}
                    animate={{ left: edgeForward ? "100%" : "0%" }}
                    transition={{ duration: 1.15, ease: "linear", repeat: Infinity }}
                  />
                ) : null}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function CinematicDemo({
  seed,
  seedVersion,
  startSignal = 0,
  onOpenSystem,
}: {
  seed: LeadSeed;
  seedVersion: number;
  startSignal?: number;
  onOpenSystem?: () => void;
}) {
  const [kind, setKind] = useState<ScenarioKind>("no_reply");
  const [focusMode, setFocusMode] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 900px)");

  const scenario = useMemo(() => buildScenario(kind, seed), [kind, seed]);
  const durations = useMemo(
    () => scenario.beats.map((b) => (b.stopBanner ? BEAT_MS.stop : b.timeNote ? BEAT_MS.timeJump : BEAT_MS.normal)),
    [scenario],
  );

  const player = useJourneyPlayer(durations);
  const { reset, play } = player;
  const state = useMemo(() => deriveState(scenario, player.step), [scenario, player.step]);
  const cue = cueFor(state.beat);
  const started = state.step >= 0;

  // Deterministic channel for the "answer coming back" beat: the last channel the
  // sequence actually used. Derived from the fold, never invented.
  const lastOutbound = useMemo<Channel | null>(() => {
    let ch: Channel | null = null;
    state.engine.forEach((e) => {
      if ((e.kind === "action" || e.kind === "delivery") && e.channel && e.channel !== "site") ch = e.channel;
    });
    return ch;
  }, [state.engine]);

  /** The booked slot, read from the calendar event the engine already wrote. */
  const bookedSlot = useMemo<string | null>(() => {
    const ev = [...state.engine].reverse().find((e) => e.kind === "calendar" && e.detail);
    if (!ev?.detail) return null;
    const day = ev.detail.split("·")[0].trim().replace(/,\s*/, " · ");
    return day.charAt(0).toUpperCase() + day.slice(1);
  }, [state.engine]);

  const busChannel: Channel | null = cue.travel?.channel ?? null;
  const incoming = cue.travel?.dir === "in";
  const internalTravel = cue.travel !== null && cue.travel.channel === null;
  const flowDir: "out" | "in" = cue.travel?.dir === "in" ? "in" : "out";

  const channelLabel = useMemo(() => {
    const ch = cue.travel?.channel ?? lastOutbound;
    if (ch === "email") return "Email";
    if (ch === "whatsapp") return "WhatsApp";
    if (ch === "calendar") return "Calendar";
    return "Canal";
  }, [cue.travel, lastOutbound]);

  useEffect(() => {
    reset();
  }, [kind, seedVersion, reset]);

  const playRef = useRef(play);
  playRef.current = play;
  useEffect(() => {
    if (startSignal > 0) {
      playRef.current();
      setFocusMode(true);
    }
  }, [startSignal]);

  const startDemo = useCallback(() => {
    play();
    setFocusMode(true);
  }, [play]);

  // FOCUS MODE — the demo becomes the surface instead of a card on a page.
  useEffect(() => {
    if (!focusMode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocusMode(false);
        return;
      }
      // The stage keeps its own shortcuts; only act when focus is outside it.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.(".cine")) return;
      const action = shortcutAction(e.key);
      if (!action) return;
      e.preventDefault();
      if (action === "toggle") player.toggle();
      if (action === "next") player.next();
      if (action === "prev") player.prev();
      if (action === "reset") player.reset();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [focusMode, player]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const action = shortcutAction(e.key);
      if (!action) return;
      e.preventDefault();
      if (action === "toggle") player.toggle();
      if (action === "next") player.next();
      if (action === "prev") player.prev();
      if (action === "reset") player.reset();
    },
    [player],
  );

  // Camera: keep the focused surface in view when the presenter steps through with
  // the keyboard. Never fights the presenter's own scrolling.
  useEffect(() => {
    if (state.step < 0) return;
    const root = stageRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-cine-cam="${cue.focus}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 900;
    const container = focusMode ? sectionRef.current : null;

    if (container) {
      const cRect = container.getBoundingClientRect();
      const visibleTop = rect.top - cRect.top;
      if (visibleTop >= 84 && rect.bottom <= cRect.bottom - 24) return;
      const y = container.scrollTop + visibleTop - Math.max(84, (cRect.height - rect.height) / 2);
      container.scrollTo({ top: Math.max(0, Math.round(y)), behavior: reduce ? "auto" : "smooth" });
      return;
    }

    if (rect.top >= 72 && rect.bottom <= vh - 24) return;
    const y = rect.top + window.scrollY - Math.max(72, (vh - rect.height) / 2);
    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: reduce ? "auto" : "smooth" });
  }, [state.step, cue.focus, reduce, focusMode]);

  // QA hook: the deterministic state must be readable from the DOM, so a reviewer
  // can prove the cancellation happened in STATE, not only on screen.
  useEffect(() => {
    (window as unknown as { __journeyQA?: unknown }).__journeyQA = {
      kind,
      step: state.step,
      beats: scenario.beats.length,
      atEnd: player.atEnd,
      playing: player.playing,
      automation: state.automation,
      stopped: state.stopped,
      stage: state.stage,
      followUps: state.followUps,
      headline: cue.headline,
      focusMode,
      bookedSlot,
    };
  }, [kind, state, player.atEnd, player.playing, cue.headline, focusMode, scenario.beats.length, bookedSlot]);

  const dim = (s: "conversation" | "record" | "queue") => started && cue.focus !== "wide" && cue.focus !== s;
  const stageLabel = state.stage ? STAGES.find((s) => s.id === state.stage)?.label ?? null : null;

  const fields = FIELD_LABELS.filter((f) => Boolean(state.lead[f.id]));
  const justCancelled = state.beat?.id === "reply";
  const gone = Boolean(cue.gone) && started;

  const exitFocus = useCallback(() => setFocusMode(false), []);

  return (
    <section
      id="lead-journey"
      ref={sectionRef}
      className={`section cine-section${focusMode ? " is-focus" : ""}`}
      aria-labelledby="cine-title"
      data-focus-mode={focusMode ? "true" : "false"}
    >
      <div className="wrap">
        {focusMode ? (
          <div className="cine-focusbar" data-testid="cine-focusbar">
            <span className="cine-focusbar__t">
              <span className="chip__dot" aria-hidden="true" /> Demonstrație live · Andrei
            </span>
            <button type="button" className="cine-btn" onClick={exitFocus} data-testid="cine-exit">
              ✕ Ieși din demo
            </button>
          </div>
        ) : (
          <header className="cine-head">
            <span className="eyebrow">Demonstrația Automatizaria · un lead, pas cu pas</span>
            <h2 id="cine-title">
              Vezi ce se întâmplă când clientul <span className="gradient-text">nu mai răspunde</span>.
            </h2>
            <p className="lede">
              Andrei cere o ofertă, AI-ul îl califică, apoi tace. Urmărește ce face sistemul în locul tău — și
              unde se oprește singur.
            </p>
            <div className="cine-start">
              <button type="button" className="btn btn--solar" onClick={startDemo} data-testid="cine-start">
                ▶ Pornește demonstrația
              </button>
              <span className="dim cine-start__hint">40 de secunde · fără explicații</span>
            </div>
          </header>
        )}

        <Controls
          scenarioKind={kind}
          onScenario={setKind}
          playing={player.playing}
          atStart={player.atStart}
          atEnd={player.atEnd}
          speed={player.speed}
          onSpeed={player.setSpeed}
          onToggle={player.toggle}
          onNext={player.next}
          onPrev={player.prev}
          onReset={player.reset}
        />

        <div
          className="cine"
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-label="Demonstrație: ce se întâmplă cu un lead care nu răspunde"
          onKeyDown={onKeyDown}
          data-testid="cine-stage"
          data-focus={started ? cue.focus : "wide"}
          data-tone={cue.tone}
          data-beat={state.beat?.id ?? "none"}
          data-gone={gone ? "true" : "false"}
          data-step={state.step}
          data-stopped={state.stopped ? "true" : "false"}
          data-stage={state.stage ?? "none"}
        >
          {/* ── the beat: one line, one idea ─────────────────────────────────── */}
          <div className="cine-cue" aria-live="polite">
            <span className="cine-cue__step">
              {started ? `${state.step + 1}/${scenario.beats.length}` : "0/" + scenario.beats.length}
            </span>
            {state.beat?.timeNote ? (
              <span className="cine-cue__clock">
                {state.beat.at} · {state.beat.clock}
              </span>
            ) : null}
            {stageLabel ? <span className="cine-cue__stage">stadiu: {stageLabel}</span> : null}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={`${scenario.kind}-${state.beat?.id ?? "idle"}`}
              className="cine-cue__headline"
              data-testid="cine-headline"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {cue.headline}
            </motion.h3>
          </AnimatePresence>
          <p className="cine-cue__sub" data-testid="cine-sub">
            {cue.sub ?? "\u00a0"}
          </p>

          {/* ── the accelerated-time beat: big, impossible to miss ───────────── */}
          <AnimatePresence>
            {cue.time ? (
              <motion.div
                className="cine-time"
                key={`time-${cue.time}`}
                data-testid="cine-time"
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="cine-time__k">timp accelerat</span>
                <span className="cine-time__v">{cue.time}</span>
                <span className="cine-time__line" aria-hidden="true" />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ── the travel indicator: what left the system, or what came back ── */}
          {cue.travel ? (
            <div
              className={`cine-travel is-${cue.travel.dir}${reduce ? " is-static" : ""}`}
              data-testid="cine-travel"
              data-dir={cue.travel.dir}
              data-label={cue.travel.label}
            >
              <span className="cine-travel__dot" aria-hidden="true" />
              <span className="cine-travel__text">
                {cue.travel.dir === "in" ? "← " : "→ "}
                {cue.travel.label}
              </span>
              {cue.travel.dir === "out" && cue.travel.channel ? (
                <span className="cine-travel__sent">TRIMIS</span>
              ) : null}
            </div>
          ) : (
            <div className="cine-travel is-idle" aria-hidden="true" />
          )}

          {/* ── the data pipeline, edge by edge ─────────────────────────────── */}
          <FlowRail
            flow={cue.flow}
            direction={flowDir}
            channelLabel={channelLabel}
            live={started}
            stopped={state.stopped}
          />

          <LayoutGroup id="cine-board">
            <div className="cine-board">
              {/* focal surface 1 — the conversation */}
              <div
                className={`cine-surface${dim("conversation") ? " is-dim" : ""}${cue.focus === "conversation" ? " is-hot" : ""}`}
                data-testid="cine-surface-conversation"
                data-cine-cam="conversation"
                data-dim={dim("conversation") ? "true" : "false"}
              >
                <div className="cine-surface__head">
                  <span className="cine-surface__k">Conversație</span>
                  <span className="cine-surface__v">site · chat</span>
                </div>
                <Conversation
                  messages={state.chat}
                  active={cue.focus === "conversation"}
                  dimmed={false}
                  step={state.step}
                  total={scenario.beats.length}
                  idle={!started}
                />
              </div>

              <div className="cine-link" aria-hidden="true" data-active={started ? "true" : "false"}>
                <span className="cine-link__track" />
                {internalTravel && !reduce ? (
                  <motion.span
                    className="cine-link__packet"
                    initial={false}
                    animate={{ x: ["0%", "100%"] }}
                    transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
                  />
                ) : null}
                <span className="cine-link__label">
                  {internalTravel ? cue.travel?.label : started ? "date → lead" : "în așteptare"}
                </span>
              </div>

              {/* focal surface 2 — the lead record (+ the card physically moving) */}
              <div
                className={`cine-surface${dim("record") ? " is-dim" : ""}${cue.focus === "record" ? " is-hot" : ""}`}
                data-testid="cine-surface-record"
                data-cine-cam="record"
                data-dim={dim("record") ? "true" : "false"}
              >
                <div className="cine-surface__head">
                  <span className="cine-surface__k">Lead · CRM</span>
                  <span className="cine-surface__v" data-testid="cine-stage-label">
                    {state.stage === "qualified" ? "CALIFICAT" : stageLabel ?? "—"}
                  </span>
                </div>

                <StageRail state={state} stopped={state.stopped} />

                <div className="cine-record">
                  <LeadCard lead={state.lead} badge={state.stage === "qualified" ? "CALIFICAT" : undefined} />
                  <ul className="cine-fields" data-testid="cine-fields">
                    {fields.length === 0 ? (
                      <li className="cine-field is-empty">niciun câmp încă</li>
                    ) : (
                      fields.map((f) => (
                        <motion.li
                          key={f.id}
                          className="cine-field"
                          data-testid={`cine-field-${f.id}`}
                          layout
                          initial={reduce ? false : { opacity: 0, x: 14, scale: 0.96 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        >
                          <span className="cine-field__k">{f.label}</span>
                          <span className="cine-field__v">{state.lead[f.id]}</span>
                        </motion.li>
                      ))
                    )}
                  </ul>

                  <AnimatePresence>
                    {bookedSlot ? (
                      <motion.div
                        className="cine-cal"
                        data-testid="cine-calendar"
                        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 22 }}
                      >
                        <Icon name="calendar" size={15} />
                        <span className="cine-cal__v" data-testid="cine-calendar-slot">
                          {bookedSlot}
                        </span>
                        <span className="cine-cal__b">PROGRAMAT</span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {cue.flying && started ? <FieldFlight items={cue.flying} vertical={narrow} /> : null}
            </div>
          </LayoutGroup>

          {/* focal surface 3 — the outbox + the armed sequence */}
          <div
            className={`cine-outbox${dim("queue") ? " is-dim" : ""}${cue.focus === "queue" ? " is-hot" : ""}`}
            data-testid="cine-surface-queue"
            data-cine-cam="queue"
            data-dim={dim("queue") ? "true" : "false"}
          >
            <div className="cine-surface__head">
              <span className="cine-surface__k">Mesaje & secvență</span>
              <span className="cine-surface__v">
                {state.stopped ? "OPRIT AUTOMAT" : started ? "rulează singur" : "în așteptare"}
              </span>
            </div>
            <ChannelBus
              channel={busChannel}
              channelStatus={cue.travel?.label ?? null}
              stopped={state.stopped}
              booked={state.stage === "booked"}
              plan={scenario.followUpPlan}
              followUps={state.followUps}
              live={started}
              incoming={incoming}
              lastOutbound={lastOutbound}
            />
            <Queue
              plan={scenario.followUpPlan}
              followUps={state.followUps}
              stopped={state.stopped}
              active={started}
              justCancelled={justCancelled}
            />
          </div>

          {/* ── the STOP moment ──────────────────────────────────────────────── */}
          <AnimatePresence>
            {state.stopBanner ? (
              <motion.div
                className="cine-stopwrap"
                key="cine-stop"
                data-testid="cine-stop"
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              >
                <motion.span
                  className="cine-reply"
                  initial={reduce ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                  data-testid="cine-reply"
                >
                  <span aria-hidden="true">💬</span> ANDREI A RĂSPUNS
                </motion.span>

                <motion.div
                  className="cine-stopbadge"
                  initial={reduce ? false : { scale: 0.9 }}
                  animate={reduce ? {} : { scale: [0.9, 1.06, 1] }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  REPLY DETECTED
                </motion.div>

                <motion.p
                  className="cine-stopbig"
                  initial={reduce ? false : { scale: 0.9, opacity: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
                  data-testid="cine-stopbig"
                >
                  <span aria-hidden="true">🛑</span> FOLLOW-UP OPRIT AUTOMAT
                </motion.p>

                <StopBanner
                  text="Răspuns detectat → secvența de follow-up a fost oprită"
                  sub="Restul mesajelor programate și reminderul intern au fost anulate automat în stare. Nimeni nu mai primește follow-up după ce a răspuns."
                  plan={scenario.followUpPlan}
                  followUps={state.followUps}
                  settled={!state.beat?.stopBanner}
                  collapseWhenSettled
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ── the reveal ───────────────────────────────────────────────────── */}
          <AnimatePresence>
            {player.atEnd ? (
              <motion.div
                className="cine-reveal"
                key="cine-reveal"
                data-testid="cine-reveal"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="cine-reveal__line" data-testid="cine-reveal-line">
                  {REVEAL.headline}
                </p>
                <p className="cine-reveal__sub" data-testid="cine-reveal-value">
                  {REVEAL.sub}
                </p>
                <div className="cine-reveal__row">
                  {onOpenSystem ? (
                    <button
                      type="button"
                      className="cine-btn cine-btn--go"
                      onClick={onOpenSystem}
                      data-testid="cine-open-system"
                    >
                      {REVEAL.cta} →
                    </button>
                  ) : null}
                  <button type="button" className="cine-btn" onClick={player.play} data-testid="cine-replay">
                    ↻ Rulează din nou
                  </button>
                  {focusMode ? (
                    <button type="button" className="cine-btn" onClick={exitFocus} data-testid="cine-exit-2">
                      ✕ Închide
                    </button>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="cine-below">
          <span className="dim cine-note">Demo cu date simulate. Nu trimite mesaje reale.</span>
          {onOpenSystem ? (
            <button type="button" className="cine-note__link" onClick={onOpenSystem} data-testid="cine-system-link">
              Vezi sistemul din spate →
            </button>
          ) : null}
          <BookingCTA className="btn btn--ghost cine-below__cta" testId="cine-booking" />
        </div>
      </div>
    </section>
  );
}
