import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Where the AGELESS invitation email stands, person by person.
 *
 * One read for two pages: the admin view, and the token link that lets the
 * host see it without a platform login. Status is derived, never stored, so
 * a bounce or a registration shows up the moment it lands.
 */

export type InvitationStatus = "registered" | "bounced" | "optedout" | "sent" | "queued";

export interface InvitationRow {
  name: string;
  email: string;
  onBehalfOf: string | null;
  source: string;
  sentAt: Date | null;
  status: InvitationStatus;
}

export interface RegistrantRow {
  name: string;
  stage: string;
  guests: number;
  clinician: boolean;
  via: string | null;
  at: Date;
}

export async function loadAgelessInvitations() {
  const [invites, enquiries] = await Promise.all([
    prisma.lyfeInvitation.findMany({ orderBy: [{ sentAt: "desc" }, { name: "asc" }] }),
    prisma.lyfeEnquiry.findMany({
      where: { intent: "EVENT_RSVP" },
      orderBy: { createdAt: "desc" },
      select: {
        fullName: true,
        email: true,
        eventStage: true,
        guestCount: true,
        isClinician: true,
        utmSource: true,
        createdAt: true,
      },
    }),
  ]);

  const suppressed = new Map(
    (
      await prisma.communicationSuppression.findMany({
        where: { email: { in: invites.map((i) => i.email) } },
        select: { email: true, reason: true },
      })
    ).map((s) => [(s.email ?? "").toLowerCase(), s.reason]),
  );
  const registered = new Set(enquiries.map((e) => e.email.toLowerCase()));

  const rows: InvitationRow[] = invites.map((i) => {
    const reason = suppressed.get(i.email);
    const status: InvitationStatus = registered.has(i.email)
      ? "registered"
      : reason === "BOUNCED"
        ? "bounced"
        : reason === "OPTED_OUT"
          ? "optedout"
          : i.sentAt
            ? "sent"
            : "queued";
    return {
      name: i.name,
      email: i.email,
      onBehalfOf: i.onBehalfOf,
      source: i.source,
      sentAt: i.sentAt,
      status,
    };
  });

  const registrants: RegistrantRow[] = enquiries.map((e) => ({
    name: e.fullName,
    stage: e.eventStage ?? "INTERESTED",
    guests: e.guestCount ?? 0,
    clinician: !!e.isClinician,
    via: e.utmSource,
    at: e.createdAt,
  }));

  const count = (s: InvitationStatus) => rows.filter((r) => r.status === s).length;
  const emailed = rows.filter((r) => r.sentAt).length;
  const bounced = count("bounced");
  const summary = {
    onList: rows.length,
    emailed,
    delivered: emailed - bounced,
    bounced,
    optedOut: count("optedout"),
    queued: count("queued"),
    registered: registrants.length,
    confirmed: registrants.filter((r) => r.stage === "CONFIRMED").length,
    heads: registrants.reduce((n, r) => n + 1 + r.guests, 0),
  };

  return { rows, registrants, summary };
}

/** "pearl.uzokwe@icloud.com" shows as "pe•••@icloud.com" off the platform. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${(user ?? "").slice(0, 2)}•••@${domain ?? ""}`;
}

/**
 * The host's link carries a token derived from the auth secret, so there is
 * nothing to store and nothing new to configure. Rotating the secret retires
 * the link.
 */
export function agelessStatusToken(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return createHmac("sha256", secret).update("ageless-status-v1").digest("base64url").slice(0, 24);
}

export function isAgelessStatusToken(candidate: string): boolean {
  const expected = Buffer.from(agelessStatusToken());
  const given = Buffer.from(candidate);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
