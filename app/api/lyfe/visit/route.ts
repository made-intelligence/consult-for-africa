import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { LYFE_CONSENT_TEXT, clientIpFrom, hashIp, normalisePhone } from "@/lib/lyfe";
import { emailLyfeInternal } from "@/lib/lyfeEmail";

/**
 * A clinician asking for a Facility Round.
 *
 * Separate from the patient enquiry because the questions are different and
 * the follow up is different: this one ends in a visit in somebody's diary,
 * not a consultation in hers.
 */
const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  facilityName: z.string().trim().min(2).max(160),
  clinicianRole: z.string().trim().min(2).max(80),
  facilityArea: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().min(7).max(40),
  notes: z.string().trim().max(2000).optional().nullable(),
  company: z.string().max(200).optional(),
});

function coordinators(): string[] {
  const raw = process.env.LYFE_COORDINATORS || "hello@consultforafrica.com";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export const POST = handler(async (req: NextRequest) => {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(ip, "lyfe-visit", { windowMs: 60 * 60 * 1000, max: 10 })) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form." },
      { status: 400 },
    );
  }
  const d = parsed.data;
  // Honeypot. A bot fills every field it is given.
  if (d.company) return NextResponse.json({ ok: true });

  const entry = await prisma.lyfeEnquiry.create({
    data: {
      fullName: d.fullName,
      email: d.email,
      phone: normalisePhone(d.phone),
      intent: "FACILITY_VISIT",
      facilityName: d.facilityName,
      facilityArea: d.facilityArea,
      clinicianRole: d.clinicianRole,
      isClinician: true,
      pathway: "UNSURE",
      based: "LAGOS",
      format: "IN_PERSON",
      notes: d.notes || null,
      source: "A_DOCTOR",
      sourcePath: req.headers.get("referer") ?? null,
      consentedAt: new Date(),
      consentText: LYFE_CONSENT_TEXT,
      ipHash: hashIp(ip),
    },
  });

  try {
    await emailLyfeInternal({
      to: coordinators(),
      id: entry.id,
      fullName: entry.fullName,
      email: entry.email,
      phone: entry.phone,
      intent: entry.intent,
      slotAt: null,
      guestCount: null,
      isClinician: true,
      pathway: entry.pathway,
      concerns: [],
      timing: null,
      based: entry.based,
      travelFrom: `${d.clinicianRole} at ${d.facilityName}, ${d.facilityArea}`,
      format: entry.format,
      heightReported: null,
      weightReported: null,
      nicotine: null,
      weightTrend: null,
      priorSurgery: null,
      goal: null,
      notes: entry.notes,
      source: entry.source,
      sourceDetail: "Facility Rounds",
      utmCampaign: null,
    });
  } catch (err) {
    console.error("[lyfe/visit] coordinator notification failed:", err);
  }

  return NextResponse.json({ ok: true, id: entry.id });
});
