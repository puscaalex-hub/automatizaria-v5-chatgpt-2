import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { ChatMsg } from "../../lib/journey/types";
import { EASE } from "../../lib/motion";

/**
 * SURFACE A — the conversation between the visitor and the assistant.
 *
 * Every bubble is scripted data attached to a beat, so the conversation and the
 * other two surfaces can never disagree: they are folds of the same list.
 */
export function Conversation({
  messages,
  active,
  dimmed = false,
  step,
  total,
  idle,
}: {
  messages: ChatMsg[];
  active: boolean;
  dimmed?: boolean;
  step: number;
  total: number;
  idle: boolean;
}) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <section
      className={`panel${active ? " is-focused" : ""}${dimmed ? " is-dim" : ""}`}
      aria-label="Conversația dintre client și asistent"
      data-testid="surface-conversation"
    >
      <header className="panel__head">
        <span className="panel__title">
          <span className={`dot ${idle ? "" : "dot--live"}`} aria-hidden="true" />
          A · Conversație client ↔ AI
        </span>
        <span className="panel__step">
          {step < 0 ? "în așteptare" : `${messages.length} mesaje`}
        </span>
      </header>

      <div className="chat__scroll" ref={scrollRef} data-testid="chat-scroll">
        {messages.length === 0 ? (
          <p className="chat__idle">
            Pornește demo-ul: aici vezi exact ce vorbește clientul și ce răspunde asistentul.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={`${i}-${m.text.slice(0, 14)}`}
                className={`bubble bubble--${m.who}`}
                initial={reduce ? false : { opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="bubble__box">
                  {m.who !== "system" && (
                    <span className="bubble__who">{m.who === "visitor" ? "Client" : "Asistent"}</span>
                  )}
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="chat__foot">
        <span className={`dot ${idle ? "" : "dot--live"}`} aria-hidden="true" />
        canal: chat pe site · răspuns automat
        <span style={{ marginLeft: "auto" }}>
          pas {Math.max(step + 1, 0)} / {total}
        </span>
      </div>
    </section>
  );
}
