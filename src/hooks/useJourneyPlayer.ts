import { useCallback, useEffect, useState } from "react";

/**
 * Playback state machine for the Lead Journey demo.
 *
 * Deliberately minimal: one integer (`step`), a play flag and a speed. Because
 * the visible state is a pure function of `step`, every control (pause, next,
 * back, reset) is instant and exactly reproducible during a live pitch.
 */
export function useJourneyPlayer(durations: number[]) {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const count = durations.length;
  const last = count - 1;

  // playback engine — advances one beat per tick
  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const current = Math.max(step, 0);
    const ms = (durations[current] ?? 1800) / speed;
    const t = window.setTimeout(() => setStep((s) => Math.min(s + 1, last)), ms);
    return () => window.clearTimeout(t);
  }, [playing, step, speed, durations, last]);

  const play = useCallback(() => {
    setStep((s) => (s >= last ? -1 : s));
    setPlaying(true);
  }, [last]);

  const pause = useCallback(() => setPlaying(false), []);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p) setStep((s) => (s >= last ? -1 : s));
      return !p;
    });
  }, [last]);

  const next = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, last));
  }, [last]);

  const prev = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.max(s - 1, -1));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setStep(-1);
  }, []);

  const atStart = step < 0;
  const atEnd = step >= last;

  return { step, playing, speed, setSpeed, play, pause, toggle, next, prev, reset, atStart, atEnd, count, last };
}

/**
 * Percentage of wall-clock time each beat should hold the screen. Time jumps and
 * the STOP moment get longer so the audience reads them; everything else is a
 * steady pace. Divided by the speed multiplier at playback time.
 */
export const BEAT_MS = { normal: 2100, timeJump: 3000, stop: 3400 } as const;

/** Keyboard shortcut map shared by the stage and the help text, so they can't drift. */
export const SHORTCUTS = [
  { keys: "Space", action: "Play / pauză" },
  { keys: "→", action: "Pasul următor" },
  { keys: "←", action: "Pasul anterior" },
  { keys: "R", action: "Reset" },
] as const;

/** Keeps the shortcut list honest: one function decides what a key means. */
export function shortcutAction(key: string): "toggle" | "next" | "prev" | "reset" | null {
  switch (key) {
    case " ":
    case "Spacebar":
      return "toggle";
    case "ArrowRight":
      return "next";
    case "ArrowLeft":
      return "prev";
    case "r":
    case "R":
      return "reset";
    default:
      return null;
  }
}
