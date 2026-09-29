import type { Beat, Channel } from "./types";

/**
 * CINEMATIC CUE LAYER — V4.
 *
 * Presentation only. The deterministic engine (beat list + fold) stays exactly as
 * V3 validated it; this module answers four questions per beat: what is the ONE
 * thing the audience must read, where should the eye be, which edge of the data
 * pipeline is carrying information, and has the lead just gone quiet.
 *
 * Why a separate layer instead of rewriting `scenarios.ts`: the business copy
 * there is the validated part (it maps 1:1 onto the future GHL/n8n triggers), and a
 * live pitch needs shorter words than a dashboard needs. Cues are keyed by
 * `beat.id` with a keyword fallback, so adding a beat later degrades to a sensible
 * default instead of crashing the demo.
 */

export type CineFocus = "conversation" | "record" | "queue" | "wide";

export type CineTone = "calm" | "move" | "wait" | "stop" | "book";

export type CineTravel = {
  /** "out" = the system sends; "in" = the client's answer enters the system. */
  dir: "out" | "in";
  /** `null` = internal transfer (conversation -> lead record), not a message. */
  channel: Channel | null;
  label: string;
};

/** The nodes of the explanatory data-flow rail. Presentation only. */
export type CineFlowNode = "conversation" | "ai" | "crm" | "engine" | "channel" | "calendar";

/**
 * One active edge of the pipeline, so the motion says cause -> effect even for a
 * viewer who reads nothing. `from`/`to` are always adjacent nodes on the rail, and
 * the direction of the packet comes from `travel.dir`.
 */
export type CineFlow = { from: CineFlowNode; to: CineFlowNode };

export const FLOW_NODES: { id: CineFlowNode; label: string }[] = [
  { id: "conversation", label: "Conversație" },
  { id: "ai", label: "AI" },
  { id: "crm", label: "CRM" },
  { id: "engine", label: "Automatizare" },
  { id: "channel", label: "WhatsApp" },
  { id: "calendar", label: "Programare" },
];

export type CineCue = {
  headline: string;
  sub?: string;
  focus: CineFocus;
  travel: CineTravel | null;
  /** Simulated-time jump, e.g. "+1 oră". Never a real clock. */
  time: string | null;
  /** The pipeline edge that is carrying information on this beat. */
  flow: CineFlow | null;
  tone: CineTone;
  /**
   * V4 · the lead has gone quiet. The rest of the interface is pushed back hard so
   * the silence is felt, not described — this is the beat the visitor remembers.
   */
  gone?: boolean;
  /** V4 · the fields leaving the conversation on this beat (visual hand-off). */
  flying?: string[];
};

const BASE: CineCue = {
  headline: "",
  focus: "wide",
  travel: null,
  time: null,
  flow: null,
  tone: "calm",
};

/** The scripted line for each beat of the two scenarios. */
const CUES: Record<string, Partial<CineCue>> = {
  "open-1": {
    headline: "Andrei cere o ofertă.",
    sub: "Scrie pe site, fără formular.",
    focus: "conversation",
    flow: { from: "conversation", to: "ai" },
    tone: "calm",
  },
  "open-2": {
    headline: "AI-ul răspunde în câteva secunde.",
    sub: "Prima întrebare nu e politicoasă, e utilă.",
    focus: "conversation",
    travel: { dir: "out", channel: "site", label: "răspuns automat" },
    flow: { from: "ai", to: "conversation" },
    tone: "move",
  },
  q1: {
    headline: "AI îl califică.",
    sub: "Fiecare răspuns devine un câmp în lead.",
    focus: "record",
    travel: { dir: "out", channel: null, label: "date extrase → lead" },
    flow: { from: "conversation", to: "crm" },
    tone: "move",
    flying: ["Casă", "București", "Andrei"],
  },
  q2: {
    headline: "Factura și acoperișul.",
    sub: "Ultimele date care decid dimensiunea sistemului.",
    focus: "record",
    travel: { dir: "out", channel: null, label: "date extrase → lead" },
    flow: { from: "conversation", to: "crm" },
    tone: "move",
    flying: ["~650 lei/lună", "Acoperiș două ape", "Fotovoltaice"],
  },
  lead: {
    headline: "Leadul e calificat. Singur.",
    sub: "Nimeni nu tastează nimic — cardul intră în CRM cu tot istoricul.",
    focus: "record",
    flow: { from: "ai", to: "crm" },
    tone: "move",
  },
  book: {
    headline: "Programare creată.",
    sub: "În conversație, nu pe încă un formular.",
    focus: "record",
    travel: { dir: "out", channel: "calendar", label: "vizită în calendar" },
    flow: { from: "engine", to: "calendar" },
    tone: "book",
  },
  vanish: {
    headline: "Andrei nu mai răspunde.",
    sub: "„Da, mă interesează. Revin eu.” — apoi tăcere.",
    focus: "conversation",
    flow: { from: "crm", to: "engine" },
    tone: "wait",
    gone: true,
  },
  fu1: {
    headline: "WhatsApp",
    sub: "Mesajul pleacă din sistem, nu din mâna nimănui.",
    focus: "queue",
    travel: { dir: "out", channel: "whatsapp", label: "Follow-up #1 · trimis" },
    time: "+1 ORĂ",
    flow: { from: "engine", to: "channel" },
    tone: "wait",
  },
  fu2: {
    headline: "Email",
    sub: "Alt canal, ca mesajele să nu se repete.",
    focus: "queue",
    travel: { dir: "out", channel: "email", label: "Follow-up #2 · trimis" },
    time: "+24 ORE",
    flow: { from: "engine", to: "channel" },
    tone: "wait",
  },
  fu3: {
    headline: "Al doilea WhatsApp",
    sub: "Leadul e încă în joc.",
    focus: "queue",
    travel: { dir: "out", channel: "whatsapp", label: "Follow-up #3 · trimis" },
    time: "+2 ZILE",
    flow: { from: "engine", to: "channel" },
    tone: "wait",
  },
  reply: {
    headline: "Andrei a răspuns.",
    sub: "Răspunsul intră în sistem și oprește secvența.",
    focus: "conversation",
    travel: { dir: "in", channel: "whatsapp", label: "răspuns primit" },
    flow: { from: "channel", to: "engine" },
    tone: "stop",
  },
  requalify: {
    headline: "Conversația continuă de unde a rămas.",
    sub: "Datele sunt deja pe lead.",
    focus: "conversation",
    travel: { dir: "out", channel: "site", label: "răspuns automat" },
    flow: { from: "ai", to: "conversation" },
    tone: "move",
  },
  booked: {
    headline: "Programare creată · marți, 14:30",
    sub: "Sistemul a ținut leadul în joc până a răspuns.",
    focus: "record",
    travel: { dir: "out", channel: "calendar", label: "vizită în calendar" },
    flow: { from: "engine", to: "calendar" },
    tone: "book",
  },
  final: {
    headline: "Status final: Programat.",
    sub: "Ofertă → contract, pe același lead.",
    focus: "record",
    flow: { from: "engine", to: "calendar" },
    tone: "book",
  },
};

/** Cue for a beat. Unknown ids fall back to a keyword read of the engine events. */
export function cueFor(beat: Beat | null): CineCue {
  if (!beat) return { ...BASE, headline: "Pornește demonstrația.", sub: "Un lead. 40 de secunde." };

  const scripted = CUES[beat.id];
  if (scripted) return { ...BASE, ...scripted };

  const kinds = (beat.engine ?? []).map((e) => e.kind);
  if (kinds.includes("stop")) {
    return {
      ...BASE,
      headline: "Follow-up oprit automat.",
      sub: beat.title,
      focus: "queue",
      flow: { from: "channel", to: "engine" },
      tone: "stop",
    };
  }
  if (kinds.includes("calendar")) {
    return { ...BASE, headline: "Programare creată.", sub: beat.title, focus: "record", tone: "book" };
  }
  if (kinds.includes("timer_fired") || kinds.includes("timer")) {
    return {
      ...BASE,
      headline: beat.at,
      sub: beat.title,
      focus: "queue",
      time: beat.timeNote ?? null,
      flow: { from: "engine", to: "channel" },
      tone: "wait",
    };
  }
  if (kinds.includes("extract") || kinds.includes("crm")) {
    return {
      ...BASE,
      headline: "Datele intră în lead.",
      sub: beat.title,
      focus: "record",
      flow: { from: "conversation", to: "crm" },
      tone: "move",
    };
  }
  return { ...BASE, headline: beat.title, sub: beat.detail, focus: "conversation", tone: "calm" };
}

/** The line shown once the whole sequence has been played. */
export const REVEAL = {
  headline: "Tot ce ai văzut s-a întâmplat automat.",
  sub: "Răspuns, calificare și follow-up până când clientul răspunde — apoi oprire.",
  cta: "Vezi sistemul din spate",
} as const;
