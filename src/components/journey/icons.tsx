import type { EngineKind } from "../../lib/journey/types";

/**
 * One glyph set for the whole stage. Every icon is a stroked path so it inherits
 * `currentColor` and stays crisp at 12–18px. No brand logos are used anywhere:
 * channels are labelled with text ("WhatsApp", "Email"), never with a logo we
 * have no right to imply.
 */
type UiName =
  | "play"
  | "pause"
  | "next"
  | "prev"
  | "reset"
  | "check"
  | "shield"
  | "bolt";

export type IconName = EngineKind | UiName;

const PATHS: Record<IconName, string[]> = {
  session: ["M3 5.5h18v13H3z", "M3 9.5h18", "M6.5 7.5h.01"],
  trigger: ["M13 2.5 5 13.5h5.2L10 21.5 18 10.5h-5.2z"],
  extract: ["M12 3.5v9", "M8.4 9.1 12 12.7l3.6-3.6", "M4.5 17v3.5h15V17"],
  crm: ["M3 5.5h18v13H3z", "M3 10h18", "M7 13.6h5", "M7 16h3"],
  score: ["M4 18.5a8 8 0 1 1 16 0", "M12 18.5 16 12", "M12 18.5h.01"],
  timer: ["M12 7v5l3.2 2", "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z"],
  timer_fired: ["M12 7.5v4.5l3 1.8", "M12 3.5a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M19.5 4.5 21 6"],
  action: ["M4 12 20 4.5l-6 15.5-3.2-6.2z", "M10.8 13.8 20 4.5"],
  delivery: ["M4.5 12.8 9 17.3 19.5 6.8"],
  detect: ["M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12z", "M12 9.6a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z"],
  stop: ["M7.5 7.5h9v9h-9z", "M5 12h14"],
  calendar: ["M3.5 6h17v14.5h-17z", "M3.5 10.2h17", "M8 3.5v4.5", "M16 3.5v4.5"],
  play: ["M8 5.2 19 12 8 18.8z"],
  pause: ["M9 5.5v13", "M15 5.5v13"],
  next: ["M6 5.5 15 12l-9 6.5z", "M18 5.5v13"],
  prev: ["M18 5.5 9 12l9 6.5z", "M6 5.5v13"],
  reset: ["M3.5 12a8.5 8.5 0 1 0 2.9-6.4", "M3.5 4.5v5h5"],
  check: ["M4.5 12.4 9.4 17.3 19.5 6.9"],
  shield: ["M12 3.5 19 6v6c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6z"],
  bolt: ["M13.5 3 6 13.5h4.6L10.5 21 18 10.5h-4.6z"],
};

export function Icon({
  name,
  size = 14,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flex: "none" }}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
