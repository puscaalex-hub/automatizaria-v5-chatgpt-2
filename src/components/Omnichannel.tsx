import { motion, useReducedMotion } from "motion/react";

import { EASE, viewportOnce } from "../lib/motion";
import { BRAND } from "../lib/site";
import { useMediaQuery } from "../lib/useMediaQuery";

/**
 * OMNICHANNEL — where the leads come from, shown as a SPATIAL funnel.
 *
 * Six channels sit on a ring in perspective and every wire points at the same
 * contact card. That is the whole argument: it does not matter which channel the
 * installer bought, the lead lands in one place with one history. Motion is one
 * dot per wire travelling inward; nothing else moves.
 */
const CHANNELS = [
  { id: "website", label: "Website", x: 12, y: 16 },
  { id: "facebook", label: "Facebook", x: 88, y: 16 },
  { id: "instagram", label: "Instagram", x: 4, y: 50 },
  { id: "messenger", label: "Messenger", x: 96, y: 50 },
  { id: "whatsapp", label: "WhatsApp", x: 17, y: 86 },
  { id: "email", label: "Email", x: 83, y: 86 },
] as const;

export function Omnichannel() {
  const reduce = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 860px)");

  return (
    <section id="canale" className="section section--tight" aria-labelledby="omni-title">
      <div className="wrap">
        <header className="omni__head">
          <span className="eyebrow">Omnichannel</span>
          <h2 id="omni-title">
            Toate canalele intră în <span className="gradient-text">același loc</span>.
          </h2>
          <p className="lede">
            Site, social, Messenger, WhatsApp sau email: fiecare lead ajunge pe același card, cu aceeași
            conversație atașată. Nimeni nu mai copiază date dintr-o aplicație în alta.
          </p>
        </header>

        <div className={`omni${narrow ? " omni--flat" : ""}`} data-testid="omni-stage">
          <div className="omni__inner">
            {!narrow ? (
              <svg
                className="omni__wires"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                {CHANNELS.map((c) => (
                  <line
                    key={c.id}
                    className="omni__wire"
                    x1={c.x}
                    y1={c.y}
                    x2="50"
                    y2="50"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            ) : null}

            <ul className="omni__chips">
              {CHANNELS.map((c, i) => (
                <li
                  key={c.id}
                  className="omni__chip"
                  style={narrow ? undefined : { left: `${c.x}%`, top: `${c.y}%` }}
                  data-channel={c.id}
                  data-testid={`omni-chip-${c.id}`}
                >
                  {c.label}
                  {!narrow && !reduce ? (
                    <motion.span
                      className="omni__dot"
                      aria-hidden="true"
                      initial={{ left: "100%", top: "50%", opacity: 0 }}
                      animate={{ left: ["100%", "0%"], opacity: [0, 1, 0] }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.4,
                        repeat: Infinity,
                        repeatDelay: 2.6,
                        ease: "easeIn",
                      }}
                    />
                  ) : null}
                </li>
              ))}
            </ul>

            <motion.div
              className="omni__card"
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.5, ease: EASE }}
              data-testid="omni-card"
            >
              <div className="omni__card-head">
                <span className="omni__avatar" aria-hidden="true">
                  A
                </span>
                <span className="omni__who">
                  <span className="omni__name">Andrei · lead nou</span>
                  <span className="omni__meta">București · sistem fotovoltaic pentru casă</span>
                </span>
              </div>
              <ul className="omni__facts">
                <li>
                  <span className="omni__fact-k">Surse</span>
                  <span className="omni__fact-v">site · social · mesagerie</span>
                </li>
                <li>
                  <span className="omni__fact-k">Contact</span>
                  <span className="omni__fact-v">unul singur</span>
                </li>
                <li>
                  <span className="omni__fact-k">Istoric</span>
                  <span className="omni__fact-v">atașat automat</span>
                </li>
              </ul>
              <p className="omni__note">
                Un singur contact, indiferent pe ce canal a scris prima dată.
              </p>
            </motion.div>
          </div>

          <p className="omni__caption dim">
            {BRAND.name} recunoaște același om pe orice canal și nu-l întreabă a doua oară aceleași lucruri.
          </p>
        </div>
      </div>
    </section>
  );
}
