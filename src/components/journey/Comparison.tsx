import { motion, useReducedMotion } from "motion/react";

/**
 * The discreet comparison, shown only in the "nu răspunde" scenario.
 *
 * It states what each side does, not what the lead would have been worth: no
 * invented recovery percentages, no claim that the lead was certainly lost.
 */
export function Comparison({
  highlight,
}: {
  highlight: "no_automation" | "with_automation" | null;
}) {
  const reduce = useReducedMotion();

  const columns = [
    {
      side: "no_automation" as const,
      k: "Fără automatizare",
      v: "Leadul rămâne în inbox și are nevoie de urmărire manuală.",
      note: "Cineva trebuie să-și amintească, într-o zi aglomerată, să revină la el.",
    },
    {
      side: "with_automation" as const,
      k: "Cu Automatizaria",
      v: "Sistemul continuă procesul conform regulilor, până la răspuns sau oprire.",
      note: "Când clientul răspunde, secvența se oprește singură: nimeni nu e bombardat cu mesaje.",
    },
  ];

  return (
    <div className="cmp" data-testid="comparison">
      {columns.map((c) => (
        <motion.div
          key={c.side}
          className={`cmp__col${highlight === c.side ? " is-on" : ""}`}
          data-side={c.side}
          data-on={highlight === c.side ? "true" : "false"}
          animate={reduce ? {} : { opacity: highlight && highlight !== c.side ? 0.55 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="cmp__k">
            {c.side === "with_automation" ? "◆ " : "◇ "}
            {c.k}
          </div>
          <div className="cmp__v">{c.v}</div>
          <div className="cmp__note">{c.note}</div>
        </motion.div>
      ))}
    </div>
  );
}
