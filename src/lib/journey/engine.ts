import type { FollowUpStatus, JourneyState, Scenario, StageId } from "./types";
import { STAGES } from "./types";

/**
 * The deterministic fold.
 *
 * Visible state at step N == fold(beats[0..N]). There is no hidden state, no
 * timers of our own and no randomness, which is what makes the demo safe to run
 * live: pause, step forward, step back and reset all land on exactly the same
 * frame every time.
 */
export function deriveState(scenario: Scenario, step: number): JourneyState {
  const last = Math.min(step, scenario.beats.length - 1);

  const state: JourneyState = {
    step: last,
    chat: [],
    engine: [],
    lead: {},
    stage: null,
    timer: null,
    followUps: Object.fromEntries(
      scenario.followUpPlan.map((f) => [f.id, "planned" as FollowUpStatus]),
    ),
    automation: "running",
    stopped: false,
    stopBanner: null,
    comparison: null,
    focused: [],
    beat: last >= 0 ? scenario.beats[last] : null,
  };

  for (let i = 0; i <= last; i += 1) {
    const b = scenario.beats[i];
    if (b.chat) state.chat = [...state.chat, ...b.chat];
    if (b.engine) state.engine = [...state.engine, ...b.engine];
    if (b.lead) state.lead = { ...state.lead, ...b.lead };
    if (b.stage) state.stage = b.stage;
    if ("timer" in b) state.timer = b.timer ?? null;
    // V4 · a beat may update one pending action or cancel several in the same frame.
    const updates = Array.isArray(b.followUp) ? b.followUp : b.followUp ? [b.followUp] : [];
    for (const u of updates) state.followUps = { ...state.followUps, [u.id]: u.status };
    if (b.automation) state.automation = b.automation;
    if (b.stopBanner) state.stopBanner = b.stopBanner;
    if (b.comparison !== undefined) state.comparison = b.comparison;
  }

  state.stopped = state.automation === "stopped";
  state.focused = state.beat?.focused ?? [];
  return state;
}

/** Column index of a stage, or -1 when the lead does not exist yet. */
export function stageIndex(stage: StageId | null): number {
  if (!stage) return -1;
  return STAGES.findIndex((s) => s.id === stage);
}
