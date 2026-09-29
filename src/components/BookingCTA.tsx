import { useCallback, useState } from "react";

import { BOOKING_PENDING_NOTE, BOOKING_URL } from "../lib/site";

/**
 * „Programează demo" — the secondary CTA, in one place.
 *
 * A landing page must not ship a button that goes nowhere, and it must not ship a
 * booking link nobody owns. So: a real link when `BOOKING_URL` is configured, and
 * an honest inline note when it is not. No fabricated calendar, no mailto to an
 * address we cannot verify.
 */
export function BookingCTA({
  className = "btn btn--ghost",
  label = "Programează demo",
  testId = "cta-booking",
}: {
  className?: string;
  label?: string;
  testId?: string;
}) {
  const [note, setNote] = useState(false);

  const onPending = useCallback(() => setNote((v) => !v), []);

  if (BOOKING_URL) {
    return (
      <a
        href={BOOKING_URL}
        className={className}
        target="_blank"
        rel="noreferrer noopener"
        data-testid={testId}
      >
        {label}
      </a>
    );
  }

  return (
    <span className="booking">
      <button
        type="button"
        className={className}
        onClick={onPending}
        aria-expanded={note}
        data-testid={testId}
      >
        {label}
      </button>
      {note ? (
        <span className="booking__note" role="status" data-testid={`${testId}-note`}>
          {BOOKING_PENDING_NOTE}
        </span>
      ) : null}
    </span>
  );
}
