/**
 * Lead Journey — data model.
 *
 * The whole demonstration is DATA + a deterministic fold over it. A scenario is
 * a list of beats; the visible state at step N is the fold of beats 0..N. That
 * is deliberate: the same beat list can later be mapped 1:1 onto a real
 * GHL/n8n workflow (trigger -> condition -> action -> timer) without touching
 * the UI layer.
 */

export type ChatWho = "visitor" | "ai" | "system";

export type ChatMsg = {
  who: ChatWho;
  text: string;
};

export type Channel = "site" | "whatsapp" | "email" | "sms" | "calendar" | "crm";

export type Tone = "neutral" | "energy" | "solar" | "alert" | "stop";

/**
 * Engine event kinds. These are intentionally the vocabulary of an automation
 * builder: a trigger fires, a rule matches, data is extracted, a record is
 * written, a timer is armed, an action is executed, a condition stops it.
 */
export type EngineKind =
  | "session"
  | "trigger"
  | "extract"
  | "crm"
  | "score"
  | "timer"
  | "timer_fired"
  | "action"
  | "delivery"
  | "detect"
  | "stop"
  | "calendar";

export type EngineEvent = {
  kind: EngineKind;
  label: string;
  detail?: string;
  channel?: Channel;
  status?: string;
  tone?: Tone;
};

/** The five pipeline columns the lead card physically travels through. */
export type StageId = "new" | "qualified" | "nurture" | "booked" | "client";

export type FieldId = "name" | "city" | "building" | "bill" | "roof" | "interest";

export type Lead = Partial<Record<FieldId, string>> & { score?: number };

/**
 * V4 · the sequence is five messages plus the internal reminder, because the demo
 * has to show TWO future messages and a reminder being cancelled at the same time
 * — one cancellation reads as an anecdote, a cascade reads as a rule.
 */
export type FollowUpId = "f1" | "f2" | "f3" | "f4" | "f5" | "rem";

export type FollowUpStatus =
  | "planned"
  | "armed"
  | "sent"
  | "waiting"
  | "answered"
  | "cancelled";

export type FollowUpItem = {
  id: FollowUpId;
  n: number;
  channel: Channel;
  at: string;
  label: string;
  /** V4 · a message that leaves, or an internal reminder that fires in the system. */
  kind?: "message" | "reminder";
};

export type FollowUpUpdate = { id: FollowUpId; status: FollowUpStatus };

export type Beat = {
  id: string;
  /** Simulated clock label shown to the audience, e.g. "ACUM" or "+24h". */
  at: string;
  /** Wall-clock inside the simulation, e.g. "09:12". */
  clock: string;
  /** Set when this beat advances simulated time — rendered as a "time jump". */
  timeNote?: string;
  scene: string;
  title: string;
  detail: string;
  chat?: ChatMsg[];
  engine?: EngineEvent[];
  lead?: Lead;
  stage?: StageId;
  timer?: { label: string; target: string } | null;
  /**
   * V4 · one update, or several at once. The STOP beat cancels every remaining
   * action in a single frame — that is what a real "condition matched → cancel
   * pending actions" step does, and it must be visible in state, not animated on
   * top of state.
   */
  followUp?: FollowUpUpdate | FollowUpUpdate[];
  automation?: "running" | "stopped";
  focused?: SurfaceId[];
  stopBanner?: string;
  comparison?: "no_automation" | "with_automation" | null;
};

export type SurfaceId = "conversation" | "engine" | "crm";

export type ScenarioKind = "interested" | "no_reply";

export type LeadSeed = {
  name: string;
  city: string;
  building: string;
  bill: number;
};

export type Scenario = {
  kind: ScenarioKind;
  label: string;
  hint: string;
  seed: LeadSeed;
  /** Only the no-reply scenario carries a follow-up sequence. */
  followUpPlan: FollowUpItem[];
  beats: Beat[];
};

export type JourneyState = {
  step: number;
  chat: ChatMsg[];
  engine: EngineEvent[];
  lead: Lead;
  stage: StageId | null;
  timer: { label: string; target: string } | null;
  followUps: Record<string, FollowUpStatus>;
  automation: "running" | "stopped";
  stopped: boolean;
  stopBanner: string | null;
  comparison: "no_automation" | "with_automation" | null;
  focused: SurfaceId[];
  beat: Beat | null;
};

/* ── presentation metadata ─────────────────────────────────────────────────── */

export const STAGES: { id: StageId; label: string; hint: string }[] = [
  { id: "new", label: "Nou", hint: "Intrare, fără date" },
  { id: "qualified", label: "Calificat", hint: "Date extrase + scor" },
  { id: "nurture", label: "Follow-up automat", hint: "Secvență activă până la răspuns" },
  { id: "booked", label: "Programat", hint: "Vizită în calendar" },
  { id: "client", label: "Client", hint: "Ofertă → contract" },
];

export const CHANNEL_META: Record<Channel, { label: string; tone: Tone }> = {
  site: { label: "Site / chat", tone: "neutral" },
  whatsapp: { label: "WhatsApp", tone: "energy" },
  email: { label: "Email", tone: "solar" },
  sms: { label: "SMS", tone: "neutral" },
  calendar: { label: "Calendar", tone: "energy" },
  crm: { label: "CRM", tone: "energy" },
};

export const KIND_META: Record<EngineKind, { label: string; tone: Tone }> = {
  session: { label: "Sesiune", tone: "neutral" },
  trigger: { label: "Regulă", tone: "energy" },
  extract: { label: "Extragere", tone: "neutral" },
  crm: { label: "CRM", tone: "energy" },
  score: { label: "Scor", tone: "solar" },
  timer: { label: "Timer", tone: "solar" },
  timer_fired: { label: "Timer expirat", tone: "solar" },
  action: { label: "Acțiune", tone: "energy" },
  delivery: { label: "Livrare", tone: "neutral" },
  detect: { label: "Detecție", tone: "energy" },
  stop: { label: "OPRIRE", tone: "stop" },
  calendar: { label: "Calendar", tone: "energy" },
};
