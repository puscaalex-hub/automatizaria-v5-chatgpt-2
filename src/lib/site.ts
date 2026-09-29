/**
 * AUTOMATIZARIA V4 — the single place where commercial/contact configuration lives.
 *
 * Nothing else on the page may invent a URL, a phone number, an address or a
 * customer result. The product has to convince through what it DEMONSTRATES, so
 * every outbound link is read from here and nothing here is a claim.
 *
 * `bookingUrl` is deliberately `null` in the sandbox: we have no real booking link
 * yet, so the CTA stays honest instead of pointing at a made-up calendar. Set it
 * (a Calendly/GHL link) and every "Programează demo" turns into a real link with
 * no other code change.
 */
export const BOOKING_URL: string | null = null;

/** The one and only disclosure on the whole page. */
export const DEMO_DISCLOSURE = "Demo cu date simulate. Nu trimite mesaje reale.";

/** Shown only while BOOKING_URL is null — never dressed up as a broken button. */
export const BOOKING_PENDING_NOTE =
  "Versiune de prezentare: linkul de programare se conectează la lansare.";

export const BRAND = {
  name: "Automatizaria",
  audience: "firme de instalații fotovoltaice",
} as const;
