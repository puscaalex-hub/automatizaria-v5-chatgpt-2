import { motion, useReducedMotion } from "motion/react";

import { EASE, viewportOnce } from "../lib/motion";
import { Icon, type IconName } from "./journey/icons";

/**
 * WHAT IT DOES — four verbs, four micro-visuals, no walls of text.
 *
 * Each card is one sentence plus a small animated figure that shows the verb:
 * a fast reply, fields filling in, a sequence advancing, a day lighting up in a
 * calendar. The figures are CSS-only and derived from fixed constants, so they
 * cost nothing and stop entirely under `prefers-reduced-motion`.
 */
const ITEMS: { icon: IconName; title: string; text: string; viz: "reply" | "qualify" | "nurture" | "book" }[] = [
  { icon: "action", title: "Răspunde", text: "Leadul nu așteaptă până dimineață.", viz: "reply" },
  { icon: "extract", title: "Califică", text: "Colectează informațiile necesare, din conversație.", viz: "qualify" },
  { icon: "timer", title: "Urmărește", text: "Continuă follow-up-ul dacă omul dispare.", viz: "nurture" },
  { icon: "calendar", title: "Programează", text: "Leadul poate ajunge direct în calendar.", viz: "book" },
];

function Viz({ kind }: { kind: (typeof ITEMS)[number]["viz"] }) {
  if (kind === "reply") {
    return (
      <div className="viz viz--reply" aria-hidden="true">
        <span className="viz__clock" />
        <span className="viz__arrow" />
        <span className="viz__check">✓</span>
      </div>
    );
  }
  if (kind === "qualify") {
    return (
      <div className="viz viz--qualify" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="viz__field" style={{ width: `${58 + i * 14}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>
    );
  }
  if (kind === "nurture") {
    return (
      <div className="viz viz--nurture" aria-hidden="true">
        <span className="viz__line" />
        {["WA", "EM", "WA"].map((t, i) => (
          <span key={t + i} className="viz__node" style={{ animationDelay: `${i * 0.9}s` }}>
            {t}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="viz viz--book" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className={`viz__day${i === 9 ? " is-on" : ""}`} />
      ))}
    </div>
  );
}

export function Capabilities() {
  const reduce = useReducedMotion();

  return (
    <section id="ce-face" className="section section--tight" aria-labelledby="what-title">
      <div className="wrap">
        <header className="what__head">
          <span className="eyebrow">Ce face Automatizaria</span>
          <h2 id="what-title">Patru lucruri. Toate fără intervenția nimănui.</h2>
        </header>

        <div className="grid what__grid">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              className="card what__card"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
            >
              <div className="what__top">
                <span className="what__icon" aria-hidden="true">
                  <Icon name={it.icon} size={17} />
                </span>
                <h3 className="what__title">{it.title}</h3>
              </div>
              <p className="what__text">{it.text}</p>
              <Viz kind={it.viz} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
