import type { ScenarioKind } from "../../lib/journey/types";
import { SHORTCUTS } from "../../hooks/useJourneyPlayer";

/**
 * Presenter controls. Every button maps to one integer (`step`) or one boolean
 * (`playing`) — nothing here can leave the demo in a half-state during a pitch.
 */
export function Controls({
  scenarioKind,
  onScenario,
  playing,
  atStart,
  atEnd,
  speed,
  onSpeed,
  onToggle,
  onNext,
  onPrev,
  onReset,
}: {
  scenarioKind: ScenarioKind;
  onScenario: (k: ScenarioKind) => void;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  speed: number;
  onSpeed: (s: number) => void;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}) {
  const goLabel = playing ? "PAUZĂ" : atEnd ? "RULEAZĂ DIN NOU" : "PORNEȘTE DEMO";

  return (
    <div className="ctl" data-testid="journey-controls">
      <button
        type="button"
        className="ctl__scene"
        aria-pressed={scenarioKind === "interested"}
        onClick={() => onScenario("interested")}
        data-testid="scenario-interested"
      >
        <span aria-hidden="true">🔥</span> LEAD INTERESAT
      </button>
      <button
        type="button"
        className="ctl__scene"
        aria-pressed={scenarioKind === "no_reply"}
        onClick={() => onScenario("no_reply")}
        data-testid="scenario-no-reply"
      >
        <span aria-hidden="true">🧊</span> NU RĂSPUNDE
        <span className="ctl__key">scenariul cheie</span>
      </button>

      <span className="ctl__divider" aria-hidden="true" />

      <button
        type="button"
        className={`ctl__btn${playing ? "" : " ctl__btn--go"}`}
        onClick={onToggle}
        data-testid="journey-toggle"
      >
        {playing ? "⏸" : "▶"} {goLabel}
      </button>
      <button
        type="button"
        className="ctl__btn"
        onClick={onPrev}
        disabled={atStart}
        aria-label="Pasul anterior"
        data-testid="journey-prev"
      >
        ← PAS ANTERIOR
      </button>
      <button
        type="button"
        className="ctl__btn"
        onClick={onNext}
        disabled={atEnd}
        data-testid="journey-next"
      >
        PAS URMĂTOR →
      </button>
      <button type="button" className="ctl__btn" onClick={onReset} data-testid="journey-reset">
        ↻ RESET
      </button>

      <span className="ctl__seg" role="group" aria-label="Viteza demonstrației">
        {[0.5, 1, 2].map((v) => (
          <button
            key={v}
            type="button"
            className="ctl__seg-btn"
            aria-pressed={speed === v}
            onClick={() => onSpeed(v)}
            data-testid={`journey-speed-${v}`}
          >
            {v}×
          </button>
        ))}
      </span>

      <span className="ctl__hint">
        {SHORTCUTS.map((s) => `${s.keys} = ${s.action}`).join(" · ")}
      </span>
    </div>
  );
}
