import { motion, useReducedMotion } from "motion/react";

import type { Channel, FollowUpItem, FollowUpStatus } from "../../lib/journey/types";
import { CHANNEL_META } from "../../lib/journey/types";

/**
 * V3 · THE OUTBOX, MADE VISIBLE.
 *
 * The „nu răspunde” story is about messages LEAVING without a human. The engine
 * log says it in text; this bus shows it: the automation hub is on the left, the
 * channels on the right, and on every beat that actually sends something a packet
 * travels down that channel's lane and the channel lights up. When the client
 * answers, the lanes are cut — visibly, on the same widget that was pulsing.
 *
 * Everything shown is derived from the deterministic beat list (channel + status),
 * so the bus can never disagree with the engine log or with the follow-up plan.
 * A channel outside the three lanes (the site chat) deliberately lights no lane:
 * inventing a fourth lane would suggest a message left the platform when it did not.
 */
const NODES: { id: Channel; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
  { id: "calendar", label: "Calendar" },
];

export function ChannelBus({
  channel,
  channelStatus,
  stopped,
  booked,
  plan,
  followUps,
  live,
  incoming = false,
  lastOutbound = null,
}: {
  channel: Channel | null;
  channelStatus: string | null;
  stopped: boolean;
  booked: boolean;
  plan: FollowUpItem[];
  followUps: Record<string, FollowUpStatus>;
  live: boolean;
  /**
   * V3.1 · THE ANSWER COMING BACK.
   *
   * On the beat where the client finally replies there is no outbound `action`
   * event to read a channel from — the message arrives, it is not sent. Rather
   * than inventing a channel, the caller passes `incoming` and the lane that was
   * last actually used, so the packet visibly travels the OTHER way on the wire
   * the sequence was already using. Default `false` keeps V3 untouched.
   */
  incoming?: boolean;
  lastOutbound?: Channel | null;
}) {
  const reduce = useReducedMotion();

  const next = plan.find((f) => {
    const st = followUps[f.id] ?? "planned";
    return st === "planned" || st === "armed" || st === "waiting";
  });
  const cancelled = plan.filter((f) => (followUps[f.id] ?? "planned") === "cancelled");
  const activeNode = NODES.find((n) => n.id === (incoming ? lastOutbound : channel)) ?? null;

  const note = (() => {
    if (incoming) {
      return "Răspunsul clientului a intrat în sistem — secvența se oprește.";
    }
    if (stopped && booked) {
      return "Secvența de follow-up rămâne oprită — leadul este programat.";
    }
    if (stopped) {
      return `${cancelled.length} mesaje rămase în secvență nu mai pleacă.`;
    }
    if (channel && !activeNode && channel === "site") {
      return "Răspunsul a plecat în chatul de pe site — nu pe un canal extern.";
    }
    if (next) {
      return `Următorul mesaj programat: #${next.n} ${next.label} · ${CHANNEL_META[next.channel].label} · ${next.at}`;
    }
    return "Nicio secvență de mesaje programată în acest scenariu.";
  })();

  return (
    <div
      className={`bus${live && (!stopped || incoming) ? " is-live" : ""}${stopped && !incoming ? " is-cut" : ""}`}
      data-testid="channel-bus"
      data-channel={channel ?? "none"}
      data-stopped={stopped ? "true" : "false"}
      data-incoming={incoming ? "true" : "false"}
      aria-label="Canalele prin care pleacă mesajele"
    >
      <div className="bus__hub">
        <span className="bus__hub-k">Automatizare</span>
        <span className="bus__hub-v">
          {incoming ? "primește răspuns" : stopped ? "secvență oprită" : live ? "rulează" : "în așteptare"}
        </span>
      </div>

      <div className="bus__lanes">
        {NODES.map((n) => {
          const on = activeNode?.id === n.id && (!stopped || incoming) && live;
          const calm = activeNode?.id === n.id && stopped && !incoming;
          return (
            <div
              key={n.id}
              className={`bus__lane${on ? " is-on" : ""}${calm ? " is-calmed" : ""}`}
              data-lane={n.id}
              data-testid={`bus-lane-${n.id}`}
            >
              <span className="bus__wire" aria-hidden="true">
                {on ? (
                  <motion.span
                    className={`bus__packet${incoming ? " bus__packet--in" : ""}`}
                    initial={false}
                    animate={reduce ? {} : { x: incoming ? ["108%", "-8%"] : ["-8%", "108%"] }}
                    transition={{ duration: incoming ? 1.5 : 1.1, ease: "linear", repeat: Infinity }}
                  />
                ) : null}
              </span>
              <span className="bus__node">
                <span className={`dot ${on ? "dot--live" : calm ? "dot--stop" : ""}`} aria-hidden="true" />
                {n.label}
                {on && channelStatus ? <em className="bus__status">{channelStatus}</em> : null}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bus__foot">
        <span className={`bus__note${stopped ? " bus__note--stop" : ""}`}>{note}</span>
      </div>
    </div>
  );
}
