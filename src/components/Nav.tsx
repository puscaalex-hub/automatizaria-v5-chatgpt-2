import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

import { BRAND } from "../lib/site";
import { BookingCTA } from "./BookingCTA";

const LINKS = [
  { href: "#cum-functioneaza", label: "Cum funcționează" },
  { href: "#canale", label: "Canale" },
  { href: "#ce-face", label: "Ce face" },
];

export function Nav({ onStart }: { onStart: () => void }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="nav__progress"
        style={reduce ? { scaleX: 0 } : { scaleX: progress }}
      />
      <header
        className="nav"
        style={{
          background: solid ? "rgba(250,247,241,.86)" : "transparent",
          backdropFilter: solid ? "blur(14px) saturate(140%)" : "none",
          borderBottomColor: solid ? "var(--border-soft)" : "transparent",
        }}
      >
        <nav className="wrap row between nav__bar" aria-label="Navigație principală">
          <a href="#top" className="row gap-12 nav__brand">
            <span aria-hidden="true" className="nav__mark">
              A
            </span>
            <span className="nav__name">{BRAND.name}</span>
            <span className="chip nav__badge">demo</span>
          </a>

          <ul className="row gap-24 nav__links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="nav__link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="row gap-12">
            <button
              type="button"
              className="btn btn--ghost nav__see"
              onClick={onStart}
              data-testid="nav-see"
            >
              Vezi demonstrația
            </button>
            <BookingCTA className="btn btn--primary nav__cta" testId="nav-booking" />
            <button
              type="button"
              className="nav__burger"
              aria-label={open ? "Închide meniul" : "Deschide meniul"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        {open ? (
          <motion.div
            className="nav__sheet"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
          >
            <ul className="wrap nav__sheet-list">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="nav__sheet-cta">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setOpen(false);
                    onStart();
                  }}
                  data-testid="nav-see-mobile"
                >
                  ▶ Vezi cum funcționează
                </button>
              </li>
              <li className="nav__sheet-cta">
                <BookingCTA className="btn btn--ghost" testId="nav-booking-mobile" />
              </li>
            </ul>
          </motion.div>
        ) : null}
      </header>
    </>
  );
}
