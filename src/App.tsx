import { useCallback, useState } from "react";

import { Capabilities } from "./components/Capabilities";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Omnichannel } from "./components/Omnichannel";
import { Problem } from "./components/Problem";
import { CinematicDemo } from "./components/cinematic/CinematicDemo";
import { LeadJourney } from "./components/journey/LeadJourney";
import { DEFAULT_SEED } from "./lib/journey/scenarios";
import type { LeadSeed } from "./lib/journey/types";
import { scrollToId } from "./lib/scroll";

/**
 * AUTOMATIZARIA V4 — Solar Installer Landing Experience.
 *
 * Page order is the sales order, and nothing else is on the page:
 *
 *   HERO          the product in five seconds (sources → AI → CRM → follow-up → calendar)
 *   PROBLEMĂ      21:43, two chains side by side
 *   DEMO          the cinematic story, + SYSTEM VIEW one click behind it
 *   CANALE        the channels converge on one contact
 *   CE FACE       four verbs
 *   CTA           the commercial close
 *
 * Two presentation modes read the SAME deterministic engine and the same single
 * piece of state (`seed`). DEMO sells the idea in ~40 seconds; SYSTEM VIEW proves
 * the mechanism with the pipeline, the event log and the follow-up queue. Switching
 * modes never changes the data, only how much of the system is shown — which is
 * exactly what keeps the two from drifting apart.
 */
type Mode = "demo" | "system";

export default function App() {
  const [seed] = useState<LeadSeed>(DEFAULT_SEED);
  const [seedVersion] = useState(0);
  const [startSignal, setStartSignal] = useState(0);
  const [mode, setMode] = useState<Mode>("demo");

  const start = useCallback(() => {
    setMode("demo");
    setStartSignal((s) => s + 1);
    scrollToId("cum-functioneaza");
  }, []);

  const openSystem = useCallback(() => {
    setMode("system");
    window.setTimeout(() => scrollToId("cum-functioneaza"), 80);
  }, []);

  return (
    <>
      <a
        href="#cum-functioneaza"
        className="sr-only"
        onFocus={(e) => {
          e.currentTarget.style.position = "static";
          e.currentTarget.style.width = "auto";
          e.currentTarget.style.height = "auto";
          e.currentTarget.style.clip = "auto";
        }}
      >
        Sari la demonstrație
      </a>

      <Nav onStart={start} />
      <main>
        <Hero onStart={start} />
        <Problem />

        <div id="cum-functioneaza">
          {/* The presenter's only structural control. DEMO is primary; SYSTEM VIEW is
              the drill-down that proves the story is backed by real state. */}
          <div className="wrap">
            <div className="mode" data-testid="mode-switch" role="group" aria-label="Mod de prezentare">
              <span className="mode__k">Mod</span>
              <button
                type="button"
                className="mode__btn"
                aria-pressed={mode === "demo"}
                onClick={() => setMode("demo")}
                data-testid="mode-demo"
              >
                DEMO · povestea
              </button>
              <button
                type="button"
                className="mode__btn"
                aria-pressed={mode === "system"}
                onClick={() => setMode("system")}
                data-testid="mode-system"
              >
                SYSTEM VIEW · sistemul din spate
              </button>
            </div>
          </div>

          {mode === "demo" ? (
            <CinematicDemo
              seed={seed}
              seedVersion={seedVersion}
              startSignal={startSignal}
              onOpenSystem={openSystem}
            />
          ) : (
            <LeadJourney seed={seed} seedVersion={seedVersion} startSignal={startSignal} />
          )}
        </div>

        <Omnichannel />
        <Capabilities />
        <FinalCTA onStart={start} onSystem={openSystem} />
      </main>
      <Footer />
    </>
  );
}
