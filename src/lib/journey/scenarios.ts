import type { Beat, FollowUpItem, LeadSeed, Scenario, ScenarioKind } from "./types";

/**
 * The scenario Alex presents live (V4).
 *
 * Everything here is scripted, deterministic data — no LLM, no network, no CRM.
 * The ticks below are DEMO-ONLY pacing: they exist so an accelerated timeline can
 * be shown in ~40 seconds. They are not a product decision and are deliberately
 * isolated in one constant so the real intervals can be swapped later.
 *
 * V4 changes DATA ONLY — the fold in `engine.ts` is untouched:
 *   · the sequence is five messages + an internal reminder, so the STOP moment can
 *     cancel several future actions at once (the point of the whole demo);
 *   · the assistant is named as „asistentul firmei”, not as a fictional brand, so
 *     the page never reads like a testimonial from a company that does not exist;
 *   · the booking example is fixed at „marți · 14:30”, clearly an example.
 */
export const FOLLOWUP_TIMELINE = {
  f1: "+1h",
  f2: "+24h",
  f3: "+2 zile",
  f4: "+5 zile",
  f5: "+7 zile",
  rem: "+7 zile",
} as const;

export const DEFAULT_SEED: LeadSeed = {
  name: "Andrei",
  city: "București",
  building: "Casă",
  bill: 650,
};

/** Deterministic qualification score. Same input -> same number, always. */
export function scoreOf(seed: LeadSeed): number {
  let s = 45;
  if (seed.bill >= 900) s += 25;
  else if (seed.bill >= 600) s += 18;
  else if (seed.bill >= 350) s += 10;
  if (/firm|hal[aă]|depozit|comercial/i.test(seed.building)) s += 12;
  if (/cluj|bucure|timi|bra[sș]|constan/i.test(seed.city)) s += 6;
  s += 8; // acoperiș potrivit (în două ape) — condiția verificată în conversație
  return Math.min(96, s);
}

const lei = (n: number) => n.toLocaleString("ro-RO");

function plan(): FollowUpItem[] {
  return [
    { id: "f1", n: 1, channel: "whatsapp", at: FOLLOWUP_TIMELINE.f1, label: "Mesaj WhatsApp de continuare" },
    { id: "f2", n: 2, channel: "email", at: FOLLOWUP_TIMELINE.f2, label: "Email cu estimarea pregătită" },
    { id: "f3", n: 3, channel: "whatsapp", at: FOLLOWUP_TIMELINE.f3, label: "A doua încercare pe WhatsApp" },
    { id: "f4", n: 4, channel: "whatsapp", at: FOLLOWUP_TIMELINE.f4, label: "Mesaj WhatsApp cu oferta scurtă" },
    { id: "f5", n: 5, channel: "email", at: FOLLOWUP_TIMELINE.f5, label: "Email de închidere a secvenței" },
    {
      id: "rem",
      n: 6,
      channel: "crm",
      at: FOLLOWUP_TIMELINE.rem,
      label: "Reminder intern pentru echipă",
      kind: "reminder",
    },
  ];
}

/* ── shared opening beats ──────────────────────────────────────────────────── */

function opening(): Beat[] {
  return [
    {
      id: "open-1",
      at: "ACUM",
      clock: "09:12",
      scene: "Site-ul firmei · sesiune nouă",
      title: "Un vizitator intră pe site și cere o ofertă",
      detail:
        "Nu completează niciun formular. Conversația este formularul — nu se pierde nimeni la primul pas.",
      chat: [{ who: "visitor", text: "Bună, mă interesează un sistem fotovoltaic pentru casă." }],
      engine: [
        { kind: "session", label: "Sesiune nouă pe site", detail: "sursă: pagina principală", tone: "neutral" },
        { kind: "trigger", label: "Regulă: mesaj nou în chat", tone: "energy" },
      ],
      stage: "new",
      focused: ["conversation", "engine"],
    },
    {
      id: "open-2",
      at: "ACUM",
      clock: "09:12",
      scene: "Conversație client ↔ AI",
      title: "Răspuns în câteva secunde, cu o întrebare de calificare",
      detail:
        "Prima întrebare nu este politicoasă, este utilă: tipul clădirii decide tot restul ofertei.",
      chat: [
        {
          who: "ai",
          text: "Bună! Sunt asistentul firmei. Îți dau o estimare în câteva întrebări scurte, apoi, dacă vrei, programăm o vizită. Este pentru casă sau pentru firmă?",
        },
      ],
      engine: [
        { kind: "action", label: "Răspuns automat trimis", channel: "site", status: "livrat", tone: "energy" },
      ],
      focused: ["conversation"],
    },
  ];
}

function qualification(seed: LeadSeed): Beat[] {
  return [
    {
      id: "q1",
      at: "+1 min",
      clock: "09:13",
      scene: "Calificare 1 / 2",
      title: "Extrage datele care contează, direct din conversație",
      detail:
        "Fiecare răspuns devine un câmp structurat. Nimic nu rămâne „text într-o discuție” pe care nimeni nu îl citește.",
      chat: [
        { who: "visitor", text: `Pentru ${seed.building.toLowerCase()}, în ${seed.city}.` },
        { who: "ai", text: "Perfect. Cum te cheamă, ca să pregătesc dosarul?" },
        { who: "visitor", text: seed.name },
      ],
      engine: [
        { kind: "extract", label: `Tip clădire: ${seed.building}` },
        { kind: "extract", label: `Zonă: ${seed.city}` },
        { kind: "extract", label: `Nume: ${seed.name}` },
      ],
      lead: { building: seed.building, city: seed.city, name: seed.name },
      focused: ["conversation", "crm"],
    },
    {
      id: "q2",
      at: "+2 min",
      clock: "09:14",
      scene: "Calificare 2 / 2",
      title: "Ultimele două câmpuri — cele care decid dimensiunea sistemului",
      detail:
        "Consumul lunar și tipul acoperișului sunt exact ce îi trebuie unui instalator ca să nu vină în necunoștință de cauză.",
      chat: [
        { who: "ai", text: `Mulțumesc, ${seed.name}. Cât plătești, în medie, pe energie electrică pe lună?` },
        { who: "visitor", text: `Cam ${lei(seed.bill)} de lei pe lună.` },
        { who: "ai", text: "Notat. Și acoperișul — în două ape, plat sau țiglă metalică?" },
        { who: "visitor", text: "În două ape." },
      ],
      engine: [
        { kind: "extract", label: `Factură: ~${lei(seed.bill)} lei/lună` },
        { kind: "extract", label: "Acoperiș: două ape" },
      ],
      lead: {
        bill: `~${lei(seed.bill)} lei/lună`,
        roof: "Două ape",
        interest: `Sistem fotovoltaic · ${seed.building.toLowerCase()}`,
      },
      focused: ["conversation", "crm"],
    },
  ];
}

function leadCreated(seed: LeadSeed): Beat {
  return {
    id: "lead",
    at: "+2 min",
    clock: "09:15",
    scene: "CRM · contact + oportunitate",
    title: "Leadul se creează singur, cu tot istoricul pe el",
    detail:
      "Contact + oportunitate, cu conversația atașată și un scor de prioritate pentru echipă. Nimeni nu tastează nimic.",
    engine: [
      { kind: "crm", label: `Contact creat: ${seed.name} · ${seed.city}`, tone: "energy" },
      { kind: "crm", label: "Oportunitate creată", detail: `Sistem fotovoltaic · ${seed.building.toLowerCase()}`, tone: "energy" },
      {
        kind: "score",
        label: `Scor de calificare: ${scoreOf(seed)}/100`,
        detail: "consum ridicat + acoperiș potrivit + zonă bună",
        tone: "solar",
      },
    ],
    lead: { score: scoreOf(seed) },
    stage: "qualified",
    focused: ["engine", "crm"],
  };
}

/* ── scenario 1 — lead interesat ───────────────────────────────────────────── */

function interested(seed: LeadSeed): Beat[] {
  return [
    ...opening(),
    ...qualification(seed),
    leadCreated(seed),
    {
      id: "book",
      at: "+4 min",
      clock: "09:17",
      scene: "Conversație → Calendar",
      title: "Programarea se face în conversație, nu pe un alt formular",
      detail:
        "Clientul alege ora acolo unde este deja. Echipa primește notificare, clientul primește confirmare.",
      chat: [
        {
          who: "ai",
          text: `${seed.name}, am tot ce îmi trebuie. Pot trimite un coleg marți la 14:30 sau miercuri la 09:00 — care îți este mai comod?`,
        },
        { who: "visitor", text: "Marți la 14:30 e bine." },
        {
          who: "ai",
          text: `Confirmat: marți, 14:30, adresa din ${seed.city}. Primești și un reminder automat cu o zi înainte.`,
        },
      ],
      engine: [
        {
          kind: "calendar",
          label: "Vizită creată în calendar",
          detail: "marți, 14:30 · echipa de montaj",
          channel: "calendar",
          status: "confirmat",
          tone: "energy",
        },
        { kind: "action", label: "Notificare trimisă echipei", channel: "whatsapp", status: "livrat" },
        { kind: "action", label: "Confirmare trimisă clientului", channel: "site", status: "livrat" },
        { kind: "timer", label: "Reminder programat", detail: "T-24h înainte de vizită", tone: "solar" },
      ],
      stage: "booked",
      timer: { label: "Reminder vizită", target: "T-24h" },
      focused: ["conversation", "engine", "crm"],
    },
    {
      id: "final",
      at: "+5 min",
      clock: "09:17",
      scene: "Pipeline actualizat",
      title: "Status final: programat, cu datele complete pe card",
      detail:
        "De aici înainte ofertă → contract, pe același lead. Nimeni nu reintroduce date și nimic nu se pierde între tool-uri.",
      engine: [
        { kind: "crm", label: "Pipeline actualizat: Programat", tone: "energy" },
        { kind: "delivery", label: "Istoricul conversației atașat leadului", status: "complet", tone: "neutral" },
      ],
      stage: "booked",
      comparison: "with_automation",
      focused: ["crm"],
    },
  ];
}

/* ── scenario 2 — nu răspunde ──────────────────────────────────────────────── */

function noReply(seed: LeadSeed): Beat[] {
  return [
    ...opening(),
    ...qualification(seed),
    leadCreated(seed),
    {
      id: "vanish",
      at: "+2 min",
      clock: "09:16",
      scene: "Conversație client ↔ AI",
      title: "Clientul spune că revine… și dispare",
      detail:
        "Ăsta este momentul în care, fără automatizare, leadul rămâne în inbox și așteaptă ca cineva să-și amintească de el.",
      chat: [
        {
          who: "ai",
          text: `${seed.name}, am tot ce îmi trebuie. Pot trimite un coleg marți la 14:30 sau miercuri la 09:00?`,
        },
        { who: "visitor", text: "Da, mă interesează. Revin eu." },
      ],
      engine: [
        { kind: "detect", label: "Interes confirmat, dar ora nu a fost aleasă", tone: "solar" },
        {
          kind: "trigger",
          label: "Regulă: dacă nu răspunde, continuă secvența",
          detail: "secvență de follow-up armată",
          tone: "energy",
        },
        { kind: "timer", label: "Timer armat", detail: `${FOLLOWUP_TIMELINE.f1} — dacă nu răspunde`, tone: "solar" },
      ],
      stage: "nurture",
      timer: { label: "Follow-up #1", target: FOLLOWUP_TIMELINE.f1 },
      followUp: { id: "f1", status: "armed" },
      focused: ["conversation", "engine", "crm"],
    },
    {
      id: "fu1",
      at: "+1h",
      clock: "10:16",
      timeNote: "timp accelerat: +1h",
      scene: "Automation engine · timer expirat",
      title: "Conversația a devenit inactivă. Sistemul nu uită leadul.",
      detail:
        "Timerul expiră, regula se activează singură și pleacă Follow-up #1. Nimeni nu a apăsat nimic.",
      chat: [{ who: "system", text: "Fără răspuns de 1h — conversația a intrat în așteptare." }],
      engine: [
        { kind: "timer_fired", label: "Timer expirat: +1h", detail: "niciun răspuns", tone: "solar" },
        { kind: "trigger", label: "Regulă activată: Follow-up #1", tone: "energy" },
        {
          kind: "action",
          label: "Mesaj WhatsApp trimis",
          channel: "whatsapp",
          status: "livrat",
          tone: "energy",
        },
        { kind: "delivery", label: "WhatsApp · livrat, necitit", detail: "canal demonstrativ", status: "livrat" },
        { kind: "timer", label: "Timer nou armat", detail: `${FOLLOWUP_TIMELINE.f2}`, tone: "solar" },
      ],
      timer: { label: "Follow-up #2", target: FOLLOWUP_TIMELINE.f2 },
      followUp: { id: "f1", status: "sent" },
      focused: ["engine", "crm"],
    },
    {
      id: "fu2",
      at: "+24h",
      clock: "09:16",
      timeNote: "timp accelerat: +24h",
      scene: "Automation engine · a doua zi",
      title: "Tot fără răspuns. Regula următoare intră singură, pe alt canal.",
      detail:
        "Mesajele nu se repetă pe același canal. Secvența avansează, leadul rămâne exact acolo unde era.",
      chat: [{ who: "system", text: "Follow-up #1: fără răspuns după 24h." }],
      engine: [
        { kind: "timer_fired", label: "Timer expirat: +24h", detail: "fără răspuns la Follow-up #1", tone: "solar" },
        { kind: "trigger", label: "Regulă activată: Follow-up #2", tone: "energy" },
        { kind: "action", label: "Email trimis", channel: "email", status: "livrat", tone: "energy" },
        { kind: "delivery", label: "Email · livrat, deschis", detail: "canal demonstrativ", status: "deschis" },
        { kind: "timer", label: "Timer nou armat", detail: `${FOLLOWUP_TIMELINE.f3}`, tone: "solar" },
      ],
      timer: { label: "Follow-up #3", target: FOLLOWUP_TIMELINE.f3 },
      followUp: { id: "f2", status: "sent" },
      focused: ["engine", "crm"],
    },
    {
      id: "fu3",
      at: "+2 zile",
      clock: "09:16",
      timeNote: "timp accelerat: +2 zile",
      scene: "Automation engine · a doua încercare pe WhatsApp",
      title: "A doua încercare pe WhatsApp — leadul e încă în joc",
      detail:
        "După două zile, leadul nu este înmormântat într-un inbox: are un card activ, un istoric și un pas următor programat.",
      engine: [
        { kind: "timer_fired", label: "Timer expirat: +2 zile", detail: "fără răspuns la Follow-up #2", tone: "solar" },
        { kind: "trigger", label: "Regulă activată: Follow-up #3", tone: "energy" },
        { kind: "action", label: "Mesaj WhatsApp trimis", channel: "whatsapp", status: "livrat", tone: "energy" },
        { kind: "delivery", label: "WhatsApp · livrat, citit", status: "citit" },
        { kind: "timer", label: "Timer nou armat", detail: `${FOLLOWUP_TIMELINE.f4}`, tone: "solar" },
      ],
      timer: { label: "Follow-up #4", target: FOLLOWUP_TIMELINE.f4 },
      followUp: { id: "f3", status: "sent" },
      focused: ["engine", "crm"],
    },
    {
      id: "reply",
      at: "+2 zile",
      clock: "09:46",
      scene: "Detecție răspuns",
      title: "Clientul răspunde. Secvența se oprește imediat.",
      detail:
        "Sistemul recunoaște răspunsul și anulează restul mesajelor programate, plus reminderul intern. Nimeni nu primește un follow-up după ce a răspuns.",
      chat: [
        { who: "visitor", text: "Bună, scuze — am fost plecat. Da, mă interesează în continuare." },
      ],
      engine: [
        { kind: "detect", label: "Răspuns detectat în conversație", tone: "energy" },
        {
          kind: "stop",
          label: "Secvență de follow-up OPRITĂ",
          detail: "mesajele rămase nu mai pleacă",
          tone: "stop",
        },
        { kind: "crm", label: "Acțiuni viitoare anulate în secvență", detail: "2 mesaje + 1 reminder", tone: "stop" },
      ],
      automation: "stopped",
      followUp: [
        { id: "f4", status: "cancelled" },
        { id: "f5", status: "cancelled" },
        { id: "rem", status: "cancelled" },
      ],
      stopBanner: "CLIENTUL A RĂSPUNS → FOLLOW-UP-URILE VIITOARE AU FOST OPRITE",
      focused: ["conversation", "engine"],
    },
    {
      id: "requalify",
      at: "+2 zile",
      clock: "10:16",
      scene: "Conversație client ↔ AI",
      title: "AI-ul continuă exact de unde a rămas",
      detail:
        "Nu reia calificarea de la zero: are deja datele, deci întreabă doar ce lipsește.",
      chat: [
        {
          who: "ai",
          text: `Mă bucur, ${seed.name}! Am păstrat tot ce mi-ai spus. Pot trimite un coleg marți la 14:30 sau miercuri la 09:00?`,
        },
        { who: "visitor", text: "Marți la 14:30 e bine." },
      ],
      engine: [
        { kind: "crm", label: "Lead recalificat: interes reconfirmat", tone: "energy" },
        { kind: "detect", label: "Răspuns → lead readus în lucru", tone: "energy" },
      ],
      stage: "nurture",
      followUp: { id: "f3", status: "answered" },
      focused: ["conversation", "crm"],
    },
    {
      id: "booked",
      at: "+2 zile",
      clock: "10:17",
      scene: "Calendar + Pipeline",
      title: "Programare confirmată, fără nicio intervenție manuală",
      detail:
        "Leadul a fost ținut în joc de sistem și a ajuns programat. Exact asta se cumpără: procesul nu depinde de memoria nimănui.",
      chat: [
        {
          who: "ai",
          text: `Confirmat: marți, 14:30, adresa din ${seed.city}. Primești un reminder automat cu o zi înainte.`,
        },
      ],
      engine: [
        {
          kind: "calendar",
          label: "Vizită creată în calendar",
          detail: "marți, 14:30 · echipa de montaj",
          channel: "calendar",
          status: "confirmat",
          tone: "energy",
        },
        { kind: "action", label: "Notificare trimisă echipei", channel: "whatsapp", status: "livrat" },
        { kind: "crm", label: "Pipeline actualizat: Programat", tone: "energy" },
        { kind: "delivery", label: "Istoricul complet atașat leadului", status: "complet" },
      ],
      stage: "booked",
      comparison: "with_automation",
      focused: ["crm", "engine"],
    },
  ];
}

export function buildScenario(kind: ScenarioKind, seed: LeadSeed): Scenario {
  if (kind === "no_reply") {
    return {
      kind,
      label: "Nu răspunde",
      hint: "Clientul spune „revin eu” și dispare",
      seed,
      followUpPlan: plan(),
      beats: noReply(seed),
    };
  }
  return {
    kind: "interested",
    label: "Lead interesat",
    hint: "Conversație → calificare → programare",
    seed,
    followUpPlan: [],
    beats: interested(seed),
  };
}

/** V4 · the two future actions the STOP moment cancels, named for the queue UI. */
export const STOP_CANCELLED_IDS = ["f4", "f5", "rem"] as const;
