import { motion, useReducedMotion } from "motion/react";

import { BRAND } from "../../lib/site";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { Icon } from "../journey/icons";

/**
 * HERO SCENE — the product explained as a SPATIAL DIAGRAM, not as a dashboard.
 *
 *   Website · Facebook · Instagram · WhatsApp
 *            ↓        (they converge)
 *        AUTOMATIZARIA · AI
 *            ↓
 *        CRM → Follow-up → Calendar
 *
 * One lead chip travels the route on a loop; small dots show that several channels
 * keep feeding the same funnel. The motion is the explanation: nothing moves that
 * does not carry information. Depth is real CSS 3D (perspective + translateZ on
 * separate layers), not a stack of shadows.
 *
 * The whole route is a single deterministic constant, so the picture can never
 * disagree with the words next to it.
 */
const SOURCES = [
  { id: "site", label: "Website", x: 12.5 },
  { id: "facebook", label: "Facebook", x: 37.5 },
  { id: "instagram", label: "Instagram", x: 62.5 },
  { id: "whatsapp", label: "WhatsApp", x: 87.5 },
] as const;

/** Row anchors, in % of the scene box. Shared by the wires, the packets and the CSS. */
const Y = { sources: 9, core: 36, crm: 60, fu: 76, cal: 92 };

const CHAIN = [
  { id: "crm", label: "CRM", value: "contact + istoric", top: Y.crm, at: 1.55 },
  { id: "fu", label: "Follow-up", value: "până la răspuns", top: Y.fu, at: 3.15 },
  { id: "cal", label: "Calendar", value: "vizită programată", top: Y.cal, at: 4.75 },
] as const;

export function SystemScene() {
  const reduce = useReducedMotion();
  const narrow = useMediaQuery("(max-width: 720px)");

  if (reduce || narrow) {
    // Reduced motion / small screens: the same diagram as a static, readable list.
    // No packets, no perspective — the explanation survives without motion.
    return (
      <div className="sys sys--flat" data-testid="hero-scene" data-mode={reduce ? "reduced" : "compact"}>
        <div className="sys__flathead">
          <span className="chip">{BRAND.audience}</span>
        </div>
        <ul className="sys__flatlist">
          <li className="sys__flatrow sys__flatrow--sources">
            <span className="sys__k">Surse</span>
            <span className="sys__v">Website · Facebook · Instagram · WhatsApp</span>
          </li>
          <li className="sys__flatrow is-core">
            <span className="sys__k">{BRAND.name} · AI</span>
            <span className="sys__v">răspunde, califică, scrie în CRM</span>
          </li>
          <li className="sys__flatrow">
            <span className="sys__k">CRM</span>
            <span className="sys__v">contact + istoric</span>
          </li>
          <li className="sys__flatrow">
            <span className="sys__k">Follow-up</span>
            <span className="sys__v">până la răspuns</span>
          </li>
          <li className="sys__flatrow is-end">
            <span className="sys__k">Calendar</span>
            <span className="sys__v">vizită programată</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="sys" data-testid="hero-scene" data-mode="spatial">
      <div className="sys__floor" aria-hidden="true" />

      <div className="sys__inner">
        <div className="sys__board">
          <svg
            className="sys__wires"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {SOURCES.map((s) => (
              <path
                key={s.id}
                className="sys__wire"
                d={`M ${s.x} ${Y.sources + 6} L 50 ${Y.core - 4}`}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path className="sys__wire" d={`M 50 ${Y.core + 5} L 50 ${Y.crm - 4}`} vectorEffect="non-scaling-stroke" />
            <path className="sys__wire" d={`M 50 ${Y.crm + 4} L 50 ${Y.fu - 4}`} vectorEffect="non-scaling-stroke" />
            <path className="sys__wire" d={`M 50 ${Y.fu + 4} L 50 ${Y.cal - 4}`} vectorEffect="non-scaling-stroke" />
          </svg>

          {/* the channels that keep feeding the same funnel */}
          <ul className="sys__sources">
            {SOURCES.map((s, i) => (
              <li key={s.id} className="sys__source" style={{ left: `${s.x}%` }} data-source={s.id}>
                <span className="sys__source-dot" style={{ animationDelay: `${i * 0.9}s` }} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>

          {/* entry packets — several channels, one funnel */}
          {SOURCES.map((s, i) => (
            <motion.span
              key={`in-${s.id}`}
              className="sys__entry"
              aria-hidden="true"
              initial={{ left: `${s.x}%`, top: `${Y.sources + 5}%`, opacity: 0 }}
              animate={{
                left: [`${s.x}%`, "50%"],
                top: [`${Y.sources + 5}%`, `${Y.core - 3}%`],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 1.7, delay: i * 0.85, repeat: Infinity, repeatDelay: 2.8, ease: "easeIn" }}
            />
          ))}

          <div className="sys__core" data-testid="hero-core">
            <span className="sys__core-k">{BRAND.name}</span>
            <span className="sys__core-v">AI</span>
            <span className="sys__core-sub">răspunde · califică · scrie în CRM</span>
          </div>

          <ul className="sys__chain">
            {CHAIN.map((row) => (
              <li
                key={row.id}
                className="sys__row"
                style={{ top: `${row.top}%`, animationDelay: `${row.at}s` }}
                data-row={row.id}
                data-testid={`hero-row-${row.id}`}
              >
                <span className="sys__row-k">{row.label}</span>
                <span className="sys__row-v">{row.value}</span>
              </li>
            ))}
          </ul>

          {/* THE LEAD — one chip, the whole route, on a loop */}
          <motion.span
            className="sys__lead"
            data-testid="hero-lead"
            initial={{ left: "37.5%", top: `${Y.sources + 6}%` }}
            animate={{
              left: ["37.5%", "50%", "50%", "50%", "50%"],
              top: [`${Y.sources + 6}%`, `${Y.core + 4}%`, `${Y.crm + 2}%`, `${Y.fu + 2}%`, `${Y.cal + 1}%`],
            }}
            transition={{ duration: 7, times: [0, 0.22, 0.45, 0.7, 1], repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
          >
            <span className="sys__lead-a" aria-hidden="true">
              A
            </span>
            <span className="sys__lead-t">lead</span>
          </motion.span>
        </div>
      </div>

      <p className="sys__caption">
        <Icon name="bolt" size={13} />
        Același lead, de la primul mesaj până în calendar — fără să-l atingă nimeni.
      </p>
    </div>
  );
}
