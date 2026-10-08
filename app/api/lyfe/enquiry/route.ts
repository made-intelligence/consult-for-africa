import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import {
  LYFE_CONSENT_TEXT,
  MEDLYFE_EVENT_CONSENT_TEXT,
  LYFE_CONSULT,
  LYFE_CONTACT_EMAIL,
  clientIpFrom,
  hashIp,
  isConsultSlot,
  normalisePhone,
} from "@/lib/lyfe";
import { startConsultPayment } from "@/lib/lyfePayment";
import { emailLyfeConfirmation, emailLyfeInternal } from "@/lib/lyfeEmail";

/**
 * The enquiry endpoint behind /lyfe.
 *
 * It saves the row first and emails afterwards, on purpose. A person who filled
 * in a long form and was told it failed is lost for good; a person who is on
 * the list but whose confirmation bounced is a phone call away. So nothing
 * after the write is allowed to fail the request.
 */

/** For the coordinator's note. The page's own labels are longer than useful here. */
const SERVICE_LABEL = {
  LONGEVITY: "Longevity and preventive health",
  METABOLIC: "Metabolism, weight and hormones",
  SKIN: "Skin and aesthetic medicine",
  SURGERY: "Plastic surgery, with Dr Kpaduwa",
} as const;

const schema = z.object({
  fullName: z.string().trim().min(2, "Please give your name").max(120),
  email: z.string().trim().toLowerCase().email("That email does not look right").max(200),
  phone: z.string().trim().min(7, "We need a number we can call").max(40),
  intent: z.enum(["EVENT_RSVP", "CONSULTATION", "DISCOVERY_CALL"]),
  /** The half hour they picked, as an ISO instant. Consultations only. */
  slotAt: z.string().trim().max(40).optional().nullable(),
  /// Which of the four they asked for. Kept on the row as the first line of
  /// notes rather than its own column, because adding one would mean a
  /// migration run by hand on a shared database for a field the coordinator
  /// reads and nothing queries.
  requestedService: z
    .enum(["LONGEVITY", "METABOLIC", "SKIN", "SURGERY"])
    .optional()
    .nullable(),
  guestCount: z.number().int().min(0).max(4).optional().nullable(),
  isClinician: z.boolean().optional().nullable(),
  pathway: z.enum(["AESTHETIC", "SURGICAL", "UNSURE"]),
  concerns: z
    .array(
      z.enum([
        "BODY_AFTER_CHILDREN",
        "BREAST",
        "FACE_AND_AGEING",
        "SKIN_AND_TONE",
        "SCARS_AND_KELOIDS",
        "BODY_CONTOUR",
        "HAIR",
        "WELLNESS_AND_WEIGHT",
        "NOT_SURE_YET",
      ]),
    )
    .max(9)
    .default([]),
  // Not asked of event guests.
  timing: z
    .enum(["AS_SOON_AS_POSSIBLE", "WITHIN_3_MONTHS", "WITHIN_12_MONTHS", "RESEARCHING"])
    .optional()
    .nullable(),
  based: z.enum(["LAGOS", "ABUJA", "ELSEWHERE_NIGERIA", "OUTSIDE_NIGERIA"]),
  travelFrom: z.string().trim().max(120).optional().nullable(),
  format: z.enum(["IN_PERSON", "VIRTUAL", "EITHER"]),

  // Surgical pathway only. Recorded verbatim, never interpreted here.
  heightReported: z.string().trim().max(40).optional().nullable(),
  weightReported: z.string().trim().max(40).optional().nullable(),
  nicotine: z
    .enum(["NEVER", "STOPPED_OVER_A_YEAR_AGO", "STOPPED_RECENTLY", "CURRENT", "PREFER_NOT_TO_SAY"])
    .optional()
    .nullable(),
  weightTrend: z
    .enum(["STABLE", "LOSING_NOW", "PLANNING_TO_LOSE", "PREFER_NOT_TO_SAY"])
    .optional()
    .nullable(),
  priorSurgery: z.boolean().optional().nullable(),

  goal: z.string().trim().max(2000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),

  source: z.enum([
    "INSTAGRAM",
    "TIKTOK",
    "GOOGLE",
    "WHATSAPP_FORWARD",
    "FRIEND_OR_FAMILY",
    "A_DOCTOR",
    "AN_EVENT",
    "PRESS_OR_PODCAST",
    "FLYER_OR_QR",
    "REACTIVATION",
      "MEZO",
    "OTHER",
  ]),
  sourceDetail: z.string().trim().max(200).optional().nullable(),
  utmSource: z.string().trim().max(100).optional().nullable(),
  utmMedium: z.string().trim().max(100).optional().nullable(),
  utmCampaign: z.string().trim().max(100).optional().nullable(),

  consent: z.literal(true, {
    message: "We need your agreement before we can hold your details",
  }),
  // Honeypot. Parsed rather than rejected, so a bot learns nothing from the
  // error and a browser that autofilled it does not block a real person.
  company: z.string().max(200).optional(),
});

/**
 * Who gets told. The coordinator is the person who actually rings, so the
 * address is configurable per deployment and falls back to the CFA inbox
 * rather than silently going nowhere.
 */
function coordinators(): string[] {
  const configured = process.env.LYFE_COORDINATOR_EMAILS;
  if (!configured) return [LYFE_CONTACT_EMAIL];
  const list = configured
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  return list.length ? list : [LYFE_CONTACT_EMAIL];
}

export const POST = handler(async function POST(req: NextRequest) {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(ip, "lyfe-enquiry", { windowMs: 60 * 60 * 1000, max: 10 })) {
    return NextResponse.json(
      { error: "That is a lot of enquiries from one place. Please try again a little later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "We could not read that. Please try again." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  if (data.company) {
    return NextResponse.json({ ok: true, intent: data.intent });
  }

  const rsvp = data.intent === "EVENT_RSVP";
  const consultation = data.intent === "CONSULTATION";
  const surgical = !rsvp && data.pathway === "SURGICAL";
  const phone = normalisePhone(data.phone);

  // A consultation is a half hour of a surgeon's week, so the slot is checked
  // against the diary rather than trusted from the browser, and checked again
  // for being sold before the person is sent to pay. The authority on whether
  // it is really sold is the unique index, which runs at the moment the money
  // lands; this is the courteous version of the same answer.
  // The page takes a request, not a booking. It used to make a visitor pick a
  // half hour and pay before anybody had spoken to her, which only ever
  // worked for the one consultation that had a published fee and a diary, and
  // Medlyfe has four. The coordinator sets the time and, where there is a
  // fee, takes it on the call. A slot sent anyway is still honoured, so the
  // payment path stays usable for a link the coordinator sends.
  let slotAt: Date | null = null;
  if (consultation && data.slotAt) {
    if (!isConsultSlot(data.slotAt)) {
      return NextResponse.json(
        { error: "Please choose one of the times in Dr Kpaduwa's diary." },
        { status: 400 },
      );
    }
    slotAt = new Date(data.slotAt);
    if (slotAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "That time has passed. Please pick another." }, { status: 400 });
    }
    const gone = await prisma.lyfeEnquiry.findFirst({
      where: { slotAt, paidAt: { not: null } },
      select: { id: true },
    });
    if (gone) {
      return NextResponse.json(
        { error: "Somebody took that half hour while you were filling this in. Please pick another." },
        { status: 409 },
      );
    }
  }

  const entry = await prisma.lyfeEnquiry.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone,
      intent: data.intent,
      // Interest, not a place. The team decides who is invited from here.
      eventStage: rsvp ? "INTERESTED" : null,
      guestCount: rsvp ? (data.guestCount ?? 0) : null,
      isClinician: rsvp ? (data.isClinician ?? null) : null,
      pathway: rsvp ? "UNSURE" : data.pathway,
      concerns: rsvp ? [] : data.concerns,
      timing: data.timing ?? null,
      based: data.based,
      travelFrom: data.travelFrom || null,
      format: data.format,
      // The screening questions belong to the surgical pathway. Someone who
      // switched pathway mid-form should not leave stray answers on the row.
      heightReported: surgical ? data.heightReported || null : null,
      weightReported: surgical ? data.weightReported || null : null,
      nicotine: surgical ? data.nicotine || null : null,
      weightTrend: surgical ? data.weightTrend || null : null,
      priorSurgery: surgical ? (data.priorSurgery ?? null) : null,
      goal: data.goal || null,
      notes: [
        data.requestedService
          ? `Asked about: ${SERVICE_LABEL[data.requestedService]}`
          : null,
        data.notes || null,
      ]
        .filter(Boolean)
        .join("\n") || null,
      slotAt,
      amountKobo: consultation ? LYFE_CONSULT.fee * 100 : null,
      source: data.source,
      sourceDetail: data.sourceDetail || null,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      sourcePath: req.headers.get("referer") ?? null,
      consentedAt: new Date(),
      consentText: rsvp ? MEDLYFE_EVENT_CONSENT_TEXT : LYFE_CONSENT_TEXT,
      ipHash: hashIp(ip),
    },
  });

  const firstName = entry.fullName.trim().split(/\s+/)[0] ?? entry.fullName;

  // Send them to Paystack before anything else happens on this request. They
  // are sitting on a spinner waiting for the redirect, and an email provider
  // having a slow morning must not be what stands between a booking and the
  // money.
  let payUrl: string | null = null;
  if (consultation && slotAt) {
    payUrl = await startConsultPayment({
      enquiryId: entry.id,
      email: entry.email,
      name: entry.fullName,
      slotAt: slotAt!,
    });
    if (!payUrl) {
      // The row is saved and the coordinator is told, so this is recoverable by
      // a telephone call rather than a lost enquiry.
      console.error(`[lyfe/enquiry] could not start payment for ${entry.id}`);
    }
  }

  try {
    await emailLyfeConfirmation({
      to: entry.email,
      firstName,
      intent: entry.intent,
      surgical,
      guestCount: entry.guestCount,
      slotAt: entry.slotAt,
    });
  } catch (err) {
    console.error("[lyfe/enquiry] confirmation email failed:", err);
  }

  try {
    await emailLyfeInternal({
      to: coordinators(),
      id: entry.id,
      fullName: entry.fullName,
      email: entry.email,
      phone: entry.phone,
      intent: entry.intent,
      slotAt: entry.slotAt,
      guestCount: entry.guestCount,
      isClinician: entry.isClinician,
      pathway: entry.pathway,
      concerns: entry.concerns,
      timing: entry.timing,
      based: entry.based,
      travelFrom: entry.travelFrom,
      format: entry.format,
      heightReported: entry.heightReported,
      weightReported: entry.weightReported,
      nicotine: entry.nicotine,
      weightTrend: entry.weightTrend,
      priorSurgery: entry.priorSurgery,
      goal: entry.goal,
      notes: entry.notes,
      source: entry.source,
      sourceDetail: entry.sourceDetail,
      utmCampaign: entry.utmCampaign,
    });
  } catch (err) {
    console.error("[lyfe/enquiry] coordinator notification failed:", err);
  }

  return NextResponse.json({ ok: true, intent: entry.intent, payUrl, id: entry.id });
});
