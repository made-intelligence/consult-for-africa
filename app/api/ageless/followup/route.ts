import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { notifyInternal } from "@/lib/email";
import { clientIpFrom, hashIp, LYFE_CONTACT_EMAIL } from "@/lib/lyfe";
import {
  AGELESS_CARE_AREAS,
  AGELESS_CONSENT_TEXT,
  AGELESS_CONTACT_PREF,
  AGELESS_SURVEYS,
} from "@/lib/ageless-followup";

/**
 * The feedback form and The Lyfe Place waiting list, after AGELESS.
 *
 * Public and unauthenticated, like every guest form here. The guest's own
 * invitation token, when the link carried one, ties the response to their row
 * so nobody is asked their name twice; without it the response still lands,
 * it just is not attributed.
 *
 * A request to book is the part that matters commercially, so it is written
 * onto the guest's LyfeEnquiry as the next action and the coordinators are
 * told at once. A failed notification never fails the guest's submission.
 */

const AREA_KEYS = AGELESS_CARE_AREAS.map((a) => a.key) as [string, ...string[]];

const schema = z.object({
  survey: z.enum(AGELESS_SURVEYS),
  token: z.string().trim().min(8).max(200).optional().nullable(),
  /** Name and contact, needed only when there is no token or they want a call. */
  fullName: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email().max(200).optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(40).optional().nullable(),
  /** The answers themselves, free shape, capped below. */
  answers: z.record(z.string(), z.unknown()),
  /** Booking prompt. Empty means "not now". */
  bookAreas: z.array(z.enum(AREA_KEYS)).max(AREA_KEYS.length).default([]),
  contactBy: z.enum(AGELESS_CONTACT_PREF).optional().nullable(),
  consent: z.literal(true),
  company: z.string().max(0).optional(), // honeypot
});

function coordinators(): string[] {
  const list = (process.env.LYFE_COORDINATOR_EMAILS ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  return list.length ? list : [LYFE_CONTACT_EMAIL];
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const POST = handler(async (req: NextRequest) => {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(ip, "ageless-followup", { windowMs: 60 * 60 * 1000, max: 20 })) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > 20_000) {
    return NextResponse.json({ error: "That was more than we can take in one go." }, { status: 413 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const d = parsed.data;

  const guest = d.token
    ? await prisma.lyfeEnquiry.findUnique({
        where: { inviteToken: d.token },
        select: { id: true, fullName: true, email: true, phone: true, coordinatorNotes: true },
      })
    : null;

  const fullName = guest?.fullName ?? d.fullName?.trim() ?? "";
  const email = guest?.email ?? d.email?.trim() ?? "";
  const phone = d.phone?.trim() || guest?.phone || "";
  const wantsCall = d.bookAreas.length > 0;
  // Joining a waiting list is itself a request to be contacted.
  const needsContact = wantsCall || d.survey === "lyfeplace-waitlist";
  if (needsContact && (!fullName || (!phone && !email))) {
    return NextResponse.json(
      { error: "Please give us your name and a number or email so we can reach you." },
      { status: 400 },
    );
  }

  const areaLabels = d.bookAreas.map((k) => AGELESS_CARE_AREAS.find((a) => a.key === k)!.label);

  const row = await prisma.auditSurveyResponse.create({
    data: {
      survey: d.survey,
      engagementId: "ageless-2026",
      payload: {
        guestId: guest?.id ?? null,
        fullName: fullName || null,
        email: email || null,
        phone: phone || null,
        answers: d.answers as object,
        bookAreas: d.bookAreas,
        contactBy: d.contactBy ?? null,
        consentText: AGELESS_CONSENT_TEXT,
        consentedAt: new Date().toISOString(),
        ipHash: hashIp(ip),
      },
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
    select: { id: true },
  });

  // Into the coordinator's queue, on the guest's own row where we have it.
  if (wantsCall || d.survey === "lyfeplace-waitlist") {
    const action =
      d.survey === "lyfeplace-waitlist"
        ? "The Lyfe Place waiting list"
        : `Book: ${areaLabels.join(", ")}`;
    const note = `${new Date().toISOString().slice(0, 10)} AGELESS follow-up: ${action}${d.contactBy ? ` (prefers ${d.contactBy})` : ""}.`;
    try {
      if (guest) {
        await prisma.lyfeEnquiry.update({
          where: { id: guest.id },
          data: {
            ...(wantsCall ? { nextAction: action, nextActionAt: new Date(), status: "NEW" } : {}),
            ...(phone && phone !== guest.phone ? { phone } : {}),
            coordinatorNotes: guest.coordinatorNotes ? `${note}\n${guest.coordinatorNotes}` : note,
          },
        });
      } else if (wantsCall) {
        await prisma.lyfeEnquiry.create({
          data: {
            fullName,
            email: email || "",
            phone: phone || "",
            intent: "CONSULTATION",
            source: "AN_EVENT",
            sourceDetail: "AGELESS follow-up",
            utmCampaign: "ageless",
            notes: `Asked about: ${areaLabels.join(", ")}`,
            nextAction: action,
            nextActionAt: new Date(),
            coordinatorNotes: note,
            consentedAt: new Date(),
            consentText: AGELESS_CONSENT_TEXT,
            ipHash: hashIp(ip),
          },
        });
      }
    } catch (err) {
      console.error("[ageless-followup] queue write failed", err);
    }

    try {
      const lines = [
        ["Name", fullName],
        ["Phone", phone],
        ["Email", email],
        ["Wants", action],
        ["Contact by", d.contactBy ?? ""],
        ["Guest on the list", guest ? "Yes" : "No, a new name"],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#777;font-size:12px">${k}</td><td style="font-size:13px">${esc(String(v))}</td></tr>`)
        .join("");
      await notifyInternal(
        coordinators(),
        `${d.survey === "lyfeplace-waitlist" ? "Lyfe Place waiting list" : "AGELESS guest wants to book"}: ${fullName}`,
        `<div style="font-family:Arial,sans-serif"><p style="font-size:14px">From the AGELESS follow-up. Please contact within one working day.</p><table>${lines}</table><p style="font-size:12px;color:#777">Response ${row.id}</p></div>`,
      );
    } catch (err) {
      console.error("[ageless-followup] notify failed", err);
    }
  }

  return NextResponse.json({ ok: true });
});
