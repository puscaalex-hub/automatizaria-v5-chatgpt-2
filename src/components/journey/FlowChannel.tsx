/**
 * Animated connector between two surfaces.
 *
 * Pure CSS (a dashed track plus a travelling highlight), so it never depends on
 * measured geometry and can flip from vertical to horizontal without recalculating
 * an SVG path. It is active only on the beats that actually move data across that
 * boundary — the motion is evidence, not decoration.
 */
export function FlowChannel({
  direction,
  active,
  label,
}: {
  direction: "v" | "h";
  active: boolean;
  label: string;
}) {
  return (
    <div
      className={`flow flow--${direction}${active ? " is-active" : ""}`}
      aria-hidden="true"
      data-testid={`flow-${direction}-${label}`}
    >
      <span className="flow__track" />
      <span className="flow__pulse" />
      <span className="flow__label">{label}</span>
    </div>
  );
}
