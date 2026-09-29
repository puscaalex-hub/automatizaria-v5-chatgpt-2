import { motion, useReducedMotion } from "motion/react";

import { EASE } from "../lib/motion";
import { BRAND } from "../lib/site";
import { BookingCTA } from "./BookingCTA";
import { SystemScene } from "./hero/SystemScene";

/**
 * HERO — one promise, one picture, two buttons.
 *
 * The promise is the business outcome (leads become appointments) plus the
 * objection every installer has (I am on a roof all day). The picture next to it
 * is the product itself; a visitor who reads nothing else still sees sources →
 * AI → CRM → follow-up → calendar.
 */
const POINTS: [string, string][] = [
  ["Răspuns în câteva secunde", "nu „revin eu în 24h”"],
  ["Calificare automată", "datele intră singure în CRM"],
  ["Follow-up până la răspuns", "apoi se oprește singur"],
];

export function Hero({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="section hero" aria-labelledby="hero-title">
      <div className="bg-sunlight" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <div className="wrap">
        <div className="grid hero__grid">
          <div className="hero__copy">
            <motion.span
              className="chip"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="chip__dot" aria-hidden="true" />
              {BRAND.name} · pentru {BRAND.audience}
            </motion.span>

            <motion.h1
              id="hero-title"
              className="hero__title"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              Transformă leadurile în programări.{" "}
              <span className="h1-accent">Chiar și când tu ești pe șantier.</span>
            </motion.h1>

            <motion.p
              className="lede hero__lede"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
            >
              {BRAND.name} răspunde leadurilor, le califică, le organizează în CRM și continuă follow-up-ul
              automat — până când clientul răspunde sau se programează.
            </motion.p>

            <motion.div
              className="row gap-12 hero__cta"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
            >
              <button type="button" className="btn btn--primary" onClick={onStart} data-testid="hero-start">
                Vezi cum funcționează
              </button>
              <BookingCTA className="btn btn--ghost" testId="hero-booking" />
            </motion.div>

            <motion.ul
              className="hero__points"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.32 }}
            >
              {POINTS.map(([t, d]) => (
                <li key={t}>
                  <span className="hero__point-k">{t}</span>
                  <span className="hero__point-d">{d}</span>
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            className="hero__scene"
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            <SystemScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
