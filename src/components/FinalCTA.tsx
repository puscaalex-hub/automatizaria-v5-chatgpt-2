import { motion, useReducedMotion } from "motion/react";

import { EASE, viewportOnce } from "../lib/motion";
import { BRAND, DEMO_DISCLOSURE } from "../lib/site";
import { BookingCTA } from "./BookingCTA";

/**
 * FINAL CTA — the page ends commercially, not technically.
 *
 * Headline is the offer, the primary button books the demo, and the small figure
 * on the right is the whole product in one glance: several leads go in, one comes
 * out as an appointment. No implementation, no process talk, no numbers we cannot
 * back up.
 */
const IN = ["casă", "firmă", "depozit"];

function Funnel() {
  const reduce = useReducedMotion();

  return (
    <div className={`funnel${reduce ? " is-static" : ""}`} aria-hidden="true" data-testid="final-funnel">
      <ul className="funnel__in">
        {IN.map((t, i) => (
          <li key={t} className="funnel__lead" style={{ animationDelay: `${i * 1.3}s` }}>
            <span className="funnel__lead-a">L</span>
            {t}
          </li>
        ))}
      </ul>

      <div className="funnel__rails">
        <span className="funnel__rail" />
        <span className="funnel__rail" />
        <span className="funnel__rail" />
      </div>

      <div className="funnel__core">
        <span className="funnel__core-k">{BRAND.name}</span>
        <span className="funnel__core-v">AI</span>
      </div>

      <div className="funnel__rails funnel__rails--out">
        <span className="funnel__rail" />
        <span className="funnel__rail is-book" />
      </div>

      <ul className="funnel__out">
        <li className="funnel__out-item">CRM</li>
        <li className="funnel__out-item is-book">
          <span className="funnel__out-badge">📅</span>
          Calendar
        </li>
      </ul>
    </div>
  );
}

export function FinalCTA({ onStart, onSystem }: { onStart: () => void; onSystem: () => void }) {
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="section finalcta" aria-labelledby="final-title">
      <div className="wrap">
        <motion.div
          className="card finalcta__card"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div className="finalcta__grid">
            <div>
              <span className="eyebrow">Demo</span>
              <h2 id="final-title">
                Vezi cum ar funcționa {BRAND.name} <span className="gradient-text">pe leadurile tale.</span>
              </h2>
              <p className="lede finalcta__lede">
                Aceleași etape, pe traficul și ofertele tale: răspuns imediat, calificare automată, follow-up
                până când clientul răspunde.
              </p>
              <div className="row gap-12 finalcta__row">
                <BookingCTA className="btn btn--primary" label="Programează demo" testId="final-booking" />
                <button type="button" className="btn btn--ghost" onClick={onStart} data-testid="final-replay">
                  ▶ Reia demonstrația
                </button>
                <button type="button" className="btn btn--ghost" onClick={onSystem} data-testid="final-system">
                  Vezi sistemul din spate
                </button>
              </div>
              <p className="dim finalcta__note">{DEMO_DISCLOSURE}</p>
            </div>

            <Funnel />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
