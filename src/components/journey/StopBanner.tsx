import { motion, useReducedMotion } from "motion/react";

import type { FollowUpItem, FollowUpStatus } from "../../lib/journey/types";
import { CHANNEL_META } from "../../lib/journey/types";
import { Icon } from "./icons";

/**
 * The single most valuable frame of the demo.
 *
 * When the client answers, the engine does not just "continue" — it cancels the
 * messages that were already scheduled. V3 shows the cancellation as an object:
 * every remaining message in the sequence is struck through, one after the other,
 * next to the moment that caused it. That is the proof that the automation is a
 * real process and not a chain of blasts.
 */
export function StopBanner({
  text,
  sub,
  plan,
  followUps,
  settled = false,
  collapseWhenSettled = false,
}: {
  text: string;
  sub: string;
  plan: FollowUpItem[];
  followUps: Record<string, FollowUpStatus>;
  settled?: boolean;
  /**
   * V4 · the cinematic mode keeps the full strike list only while the STOP is the
   * thing being looked at; afterwards it collapses to a one-line summary so the
   * payoff and the booking are not competing with a list that already did its job.
   */
  collapseWhenSettled?: boolean;
}) {
  const reduce = useReducedMotion();
  const killed = plan.filter((f) => (followUps[f.id] ?? "planned") === "cancelled");
  const collapsed = collapseWhenSettled && settled;

  return (
    <motion.div
      className={`stopbanner${settled ? " is-settled" : ""}`}
      role="status"
      data-testid="stop-banner"
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <motion.span
        className="stopbanner__icon"
        aria-hidden="true"
        initial={reduce ? false : { rotate: -8, scale: 0.85 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <Icon name="stop" size={18} />
      </motion.span>
      <div className="stopbanner__body">
        <div className="stopbanner__text">{text}</div>
        <div className="stopbanner__sub">{sub}</div>

        {killed.length > 0 && !collapsed ? (
          <ul className="stopbanner__kills" data-testid="stop-kills">
            {killed.map((f, i) => (
              <li key={f.id} className="stopkill" data-testid={`stop-kill-${f.id}`}>
                <span className="stopkill__n" aria-hidden="true">
                  {f.n}
                </span>
                <span className="stopkill__label">
                  {f.label}
                  <em>
                    {CHANNEL_META[f.channel].label} · {f.at}
                  </em>
                </span>
                <motion.span
                  className="stopkill__strike"
                  aria-hidden="true"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 0.18 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="stopkill__tag">anulat</span>
              </li>
            ))}
          </ul>
        ) : null}

        {killed.length > 0 && collapsed ? (
          <p className="stopbanner__collapsed" data-testid="stop-summary">
            {killed.length} acțiuni viitoare anulate automat în secvență.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
