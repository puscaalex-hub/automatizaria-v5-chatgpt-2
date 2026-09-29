import { motion, useReducedMotion } from "motion/react";

import { EASE, viewportOnce } from "../lib/motion";
import { BRAND } from "../lib/site";
import { BookingCTA } from "./BookingCTA";

/**
 * THE PROBLEM — one sentence and two chains.
 *
 * The heading is a question with a timestamp, because that is the moment every
 * installer recognises: 21:43, a lead arrives, nobody is at a desk. The two
 * columns say the same events in order, and the reader finishes the comparison
 * before reading a paragraph. No percentages, no "leads are lost" claims — only
 * the two sequences.
 */
const WITHOUT = ["Lead nou", "Inbox", "⏱ Trec orele", "Nimeni nu răspunde", "Lead rece"];
const WITH = ["Lead nou", "Răspuns rapid", "AI califică", "CRM actualizat", "Follow-up", "Programare"];

function Chain({ steps, side }: { steps: string[]; side: "without" | "with" }) {
  const reduce = useReducedMotion();

  return (
    <ol className={`chain chain--${side}`} data-testid={`problem-chain-${side}`}>
      {steps.map((s, i) => (
        <li key={s} className={`chain__step${i === steps.length - 1 ? " is-last" : ""}`}>
          <span className="chain__dot" aria-hidden="true" />
          <motion.span
            className="chain__label"
            initial={reduce ? false : { opacity: 0, x: side === "without" ? -10 : 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE }}
          >
            {s}
          </motion.span>
          {i < steps.length - 1 ? <span className="chain__link" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

export function Problem() {
  return (
    <section id="problema" className="section section--tight" aria-labelledby="problem-title">
      <div className="wrap">
        <header className="problem__head">
          <span className="eyebrow">Problema</span>
          <h2 id="problem-title">
            Un lead intră la <span className="problem__clock">21:43</span>. Tu ce faci?
          </h2>
        </header>

        <div className="problem__grid">
          <div className="problem__col" data-side="without">
            <h3 className="problem__k">
              <span aria-hidden="true">◇</span> Fără <span className="problem__brand">{BRAND.name}</span>
            </h3>
            <Chain steps={WITHOUT} side="without" />
          </div>

          <div className="problem__col is-on" data-side="with">
            <h3 className="problem__k">
              <span aria-hidden="true">◆</span> Cu <span className="problem__brand">{BRAND.name}</span>
            </h3>
            <Chain steps={WITH} side="with" />
          </div>
        </div>

        <div className="problem__foot">
          <p className="dim">
            Aceleași mesaje, aceeași ofertă. Diferă doar cine își amintește să răspundă la 21:43.
          </p>
          <BookingCTA className="btn btn--ghost" testId="problem-booking" />
        </div>
      </div>
    </section>
  );
}
