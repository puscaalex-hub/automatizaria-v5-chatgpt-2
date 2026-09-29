import type { Lead } from "../../lib/journey/types";

/**
 * The lead card itself — the object the whole demo is about.
 *
 * It is rendered INSIDE the pipeline column that matches the current stage, with
 * a shared `layoutId`, so Motion animates it travelling between columns rather
 * than fading one copy out and another in. The card is light on the dark stage:
 * it is the one thing the audience must be able to follow from across a room.
 */
export function LeadCard({ lead, compact = false, badge }: { lead: Lead; compact?: boolean; badge?: string }) {
  const initials = (lead.name ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="leadcard" data-testid="lead-card">
      <div className="leadcard__top">
        <span className="leadcard__avatar" aria-hidden="true">
          {initials}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="leadcard__name">{lead.name ?? "Lead nou"}</div>
          <div className="leadcard__meta">
            {[lead.city, lead.building].filter(Boolean).join(" · ") || "fără date încă"}
          </div>
        </div>
      </div>

      {badge ? <div className="leadcard__badge">{badge}</div> : null}

      {!compact && (
        <div className="leadcard__rows">
          <div className="leadcard__row">
            <span>Factură</span>
            <span data-testid="card-bill">{lead.bill ?? "—"}</span>
          </div>
          <div className="leadcard__row">
            <span>Acoperiș</span>
            <span>{lead.roof ?? "—"}</span>
          </div>
        </div>
      )}

      {typeof lead.score === "number" ? (
        <div className="leadcard__score">
          <div className="leadcard__row" style={{ marginBottom: 4 }}>
            <span>Scor</span>
            <span data-testid="card-score">{lead.score}/100</span>
          </div>
          <div className="leadcard__score-bar">
            <div className="leadcard__score-fill" style={{ width: `${lead.score}%` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
