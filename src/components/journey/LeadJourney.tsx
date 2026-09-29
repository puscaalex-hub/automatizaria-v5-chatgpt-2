import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react";

import type { Beat, Channel, LeadSeed, ScenarioKind } from "../../lib/journey/types";
import { buildScenario } from "../../lib/journey/scenarios";
import { deriveState } from "../../lib/journey/engine";
import { shortcutAction, useJourneyPlayer, BEAT_MS } from "../../hooks/useJourneyPlayer";
import { ChannelBus } from "./ChannelBus";
import { Comparison } from "./Comparison";
import { Controls } from "./Controls";
import { Conversation } from "./Conversation";
import { EnginePanel } from "./EnginePanel";
import { FlowChannel } from "./FlowChannel";
import { Narration } from "./Narration";
import { PipelinePanel } from "./PipelinePanel";
import { StageRail } from "./StageRail";
import { StopBanner } from "./StopBanner";
import { TimeJump } from "./TimeJump";
import { Timeline } from "./Timeline";
import "./journey.css";
import "./journey-v3.css";

/**
 * LEAD JOURNEY — the centrepiece (V3).
 *
 * V3 keeps the V2 deterministic core intact: one list of beats, one fold, one
 * integer (`step`) that every control writes. What changed is the PRESENTATION:
 *
 *   1. the lead is the protagonist — the rail above the pipeline shows the card
 *      travelling Lead nou → Calificat → Follow-up → Programat, and the pipeline
 *      below says where it is;
 *   2. waiting is dramatised — every simulated time jump raises an elapsed-time
 *      moment over the pipeline (+1h, +24h, +2 zile) instead of a small chip;
 *   3. leaving is dramatised — the outbox bus shows a packet travelling to the
 *      channel that actually sends on this beat (WhatsApp / Email / Calendar);
 *   4. the answer is the payoff — the STOP moment lights the whole stage and
 *      strikes through every remaining message in the sequence;
 *   5. focus hierarchy — whatever is not the current event is dimmed and blurred,
 *      and a small in-page camera pans to the zone the beat is about.
 *
 * Time is still simulated: the rail is driven by the step index, never by a real
 * clock, and the accelerated simulation is labelled on screen.
 */
type CamZone = "top" | "crm" | "grid" | "banner";

/** Deterministic camera target per beat — derived from the beat, never random. */
function camZone(beat: Beat | null, stageChanged: boolean): CamZone {
  if (!beat) return "top";
  if (beat.stopBanner) return "banner";
  if (beat.timeNote) return "crm";
  if (stageChanged) return "crm";
  return "grid";
}

export function LeadJourney({
  seed,
  seedVersion,
  startSignal = 0,
}: {
  seed: LeadSeed;
  seedVersion: number;
  startSignal?: number;
}) {
  const [kind, setKind] = useState<ScenarioKind>("no_reply");
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const scenario = useMemo(() => buildScenario(kind, seed), [kind, seed]);

  // Beats that advance simulated time, or stop the sequence, hold the screen longer.
  const durations = useMemo(
    () =>
      scenario.beats.map((b) => {
        if (b.stopBanner) return BEAT_MS.stop;
        if (b.timeNote) return BEAT_MS.timeJump;
        return BEAT_MS.normal;
      }),
    [scenario],
  );

  const player = useJourneyPlayer(durations);
  const { reset } = player;
  const state = useMemo(() => deriveState(scenario, player.step), [scenario, player.step]);
  const prevStage = useMemo(
    () => deriveState(scenario, player.step - 1).stage,
    [scenario, player.step],
  );
  const stageChanged = state.stage !== null && state.stage !== prevStage;

  // A new scenario — or new data injected from the simulator — starts clean.
  useEffect(() => {
    reset();
  }, [kind, seedVersion, reset]);

  // "Pornește demo-ul" in the nav/hero scrolls here AND starts playback.
  const playRef = useRef(player.play);
  playRef.current = player.play;
  useEffect(() => {
    if (startSignal > 0) playRef.current();
  }, [startSignal]);

  /**
   * In-page camera: pans the viewport to the zone the current beat is about, but
   * only when that zone is not already comfortably in view (so stepping through
   * with the keyboard never fights the presenter's own scrolling).
   */
  const zone = camZone(state.beat, stageChanged);
  useEffect(() => {
    if (state.step < 0) return;
    const root = stageRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-cam="${zone}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 900;
    if (r.top >= 96 && r.bottom <= vh - 32) return;
    const y = r.top + window.scrollY - Math.max(88, (vh - r.height) / 2);
    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: reduce ? "auto" : "smooth" });
  }, [state.step, zone, reduce]);

  const selectScenario = useCallback((k: ScenarioKind) => {
    setKind((prev) => (prev === k ? prev : k));
  }, []);

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

  const events = state.beat?.engine ?? [];
  const has = (k: string) => events.some((e) => e.kind === k);

  // ── focus hierarchy ────────────────────────────────────────────────────────
  const focused = state.focused;
  const dimming = state.step >= 0 && focused.length > 0 && !state.beat?.stopBanner;
  const isFocused = (s: string) => focused.includes(s as "conversation" | "engine" | "crm");
  const dimmed = (s: string) => dimming && !isFocused(s);

  // ── outbox: which channel actually sends on this beat ──────────────────────
  const sendEvent = events.find((e) => e.kind === "action" && e.channel);
  const busChannel: Channel | null = sendEvent?.channel ?? null;
  const busStatus = sendEvent?.status ?? null;

  const abLabel = has("stop")
    ? "oprire secvență"
    : has("detect")
      ? "răspuns detectat"
      : has("extract")
        ? "date extrase"
        : has("action")
          ? "mesaj trimis"
          : "conversație activă";

  const bcLabel = has("calendar")
    ? "vizită în calendar"
    : has("crm") || has("score")
      ? "lead scris în CRM"
      : "leadul rămâne în pipeline";

  return (
    <section id="lead-journey" className="section" aria-labelledby="journey-title">
      <div className="wrap">
        <header className="journey-head">
          <span className="eyebrow">SYSTEM VIEW · sistemul din spate</span>
          <h2 id="journey-title">
            Aceeași poveste, cu mecanismul la vedere:{" "}
            <span className="gradient-text">pipeline, motor de automatizare, coadă de follow-up</span>
          </h2>
          <p className="lede">
            Aici vezi ce a produs fiecare pas din poveste: cardul leadului în pipeline, evenimentele scrise de
            motor, mesajele programate și momentul exact în care au fost anulate. Canalul principal este{" "}
            <strong>„Nu răspunde”</strong>.
          </p>
        </header>

        <div
          className="stage"
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-label="Demonstrație interactivă a fluxului unui lead"
          onKeyDown={onKeyDown}
          data-testid="journey-stage"
          data-cam-zone={zone}
        >
          <div className="stage__top">
            <div className="stage__chips">
              <span className="chip chip--onstage" style={{ color: "var(--stage-solar)", borderColor: "rgba(239,180,76,.4)" }}>
                <span className="dot dot--solar" aria-hidden="true" />
                Timp accelerat · date de demo
              </span>
              <span className="chip chip--onstage">{scenario.label} · {scenario.hint}</span>
            </div>
            <Controls
              scenarioKind={kind}
              onScenario={selectScenario}
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
          </div>

          <div className="zone" data-cam="top">
            <Narration state={state} scenario={scenario} />
            <StageRail state={state} stopped={state.stopped} />
            <Timeline state={state} scenario={scenario} />
          </div>

          <LayoutGroup id="lead-journey-surfaces">
            {/* The CRM moves first: the travelling lead card is the protagonist,
                and the outbox bus below it shows what the system is sending while
                the card waits. The conversation and the engine (the machines that
                drive it) sit directly below, in their own camera zone. */}
            <div className="zone zone--crm" data-cam="crm">
              <PipelinePanel
                state={state}
                scenario={scenario}
                active={isFocused("crm")}
                stopped={state.stopped}
                dimmed={dimmed("crm")}
              />

              <FlowChannel
                direction="h"
                active={state.step >= 0 && (has("crm") || has("score") || has("calendar") || has("stop") || has("extract") || has("action"))}
                label={`lead în CRM · ${bcLabel}`}
              />

              <ChannelBus
                channel={busChannel}
                channelStatus={busStatus}
                stopped={state.stopped}
                booked={state.stage === "booked"}
                plan={scenario.followUpPlan}
                followUps={state.followUps}
                live={state.step >= 0}
              />

              <AnimatePresence>
                {state.beat?.timeNote ? (
                  <TimeJump
                    key={state.beat.id}
                    at={state.beat.at}
                    note={state.beat.timeNote}
                    clock={state.beat.clock}
                  />
                ) : null}
              </AnimatePresence>
            </div>

            <div className="zone" data-cam="grid">
              <div className="stage-grid">
                <Conversation
                  messages={state.chat}
                  active={isFocused("conversation")}
                  dimmed={dimmed("conversation")}
                  step={state.step}
                  total={scenario.beats.length}
                  idle={state.step < 0}
                />
                <FlowChannel direction="v" active={state.step >= 0 && events.length > 0} label={abLabel} />
                <EnginePanel
                  events={state.engine}
                  active={isFocused("engine")}
                  dimmed={dimmed("engine")}
                  timer={state.timer}
                  followUps={state.followUps}
                  followUpPlan={scenario.followUpPlan}
                  stopped={state.stopped}
                  idle={state.step < 0}
                  playing={player.playing}
                  speed={player.speed}
                />
              </div>
            </div>
          </LayoutGroup>

          <div className="zone" data-cam="banner">
            <AnimatePresence>
              {state.stopBanner ? (
                <StopBanner
                  key="stop"
                  text={state.stopBanner}
                  sub="Restul mesajelor programate au fost anulate automat. Nimeni nu mai primește follow-up după ce a răspuns."
                  plan={scenario.followUpPlan}
                  followUps={state.followUps}
                  settled={!state.beat?.stopBanner}
                />
              ) : null}
            </AnimatePresence>

            {scenario.kind === "no_reply" ? <Comparison highlight={state.comparison} /> : null}
          </div>
        </div>

        <p className="dim journey-note">
          Intervalele de timp (+1h, +24h, +2 zile) sunt accelerate pentru demonstrație. Demo cu date
          simulate. Nu trimite mesaje reale.
        </p>
      </div>
    </section>
  );
}
