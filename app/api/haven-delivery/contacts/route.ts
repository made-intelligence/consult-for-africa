import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyInternal } from "@/lib/email";
import { HAVEN_ENGAGEMENT_ID, WORKSTREAMS, workstreamLabel } from "@/lib/haven-delivery";

// Public, unauthenticated: the Haven team registering themselves for the
// delivery phase from /HavenProject. The six-month plan names a dozen owning
// seats and we hold addresses for five founders, so without this the daily
// push has nowhere to land.
//
// Registrations become real ClientContact rows, not a parallel list, so the
// Communications CRM logs what we send them. scripts/add-haven-contacts.ts
// seeded the first three by hand and this is the self-service version of it.
//
// PORTAL ACCESS IS NEVER GRANTED HERE. The client-portal session carries only
// clientId, so any Haven contact with access sees every Haven invoice,
// including the agreed fee, the N7.7m concession and the balance. A ward sister
// filling in a contact form must not be able to open the fee note. Rows are
// created with isPortalEnabled false and update never touches that column, so a
// resubmission cannot revoke or grant access either.
//
// Unlike the audit surveys this is deliberately NOT anonymous: the point is
// knowing who holds which seat. It takes the minimum that makes a working day
// contactable and nothing more. No address, no date of birth, no next of kin.

const CLIENT_NAME = "Haven Paediatric Centre";
const SURVEY = "haven-contact-register";
const NOTIFY_TO = "debo.odulana@consultforafrica.com";
const ADMIN_URL = "https://www.consultforafrica.com/admin/haven-delivery";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(160).optional().default(""),
  workstream: z.enum(WORKSTREAMS.map((w) => w.key) as [string, ...string[]]),
  email: z.string().trim().email().max(160),
  mobile: z.string().trim().min(7).max(40),
  whatsappSame: z.boolean().optional().default(true),
  whatsapp: z.string().trim().max(40).optional().default(""),
  reportsTo: z.string().trim().max(120).optional().default(""),
  bestTime: z.string().trim().max(80).optional().default(""),
  note: z.string().trim().max(600).optional().default(""),
});

// Modest per-IP limiter. This writes to the CRM, so it is worth more than the
// survey endpoints have.
const hits = new Map<string, { n: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 10_000) for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  const e = hits.get(ip);
  if (!e || now > e.resetAt) {
    hits.set(ip, { n: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  e.n++;
  return e.n > MAX_PER_WINDOW;
}

const clientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      return NextResponse.json({ error: "Too many submissions. Try again in a minute." }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });

    const d = parsed.data;
    const email = d.email.toLowerCase();
    const seat = workstreamLabel(d.workstream);

    const client = await prisma.client.findFirst({ where: { name: CLIENT_NAME }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Could not save" }, { status: 500 });

    // An email already held against a different client is somebody else's
    // contact. Never move it.
    const existing = await prisma.clientContact.findUnique({
      where: { email },
      select: { id: true, clientId: true },
    });
    if (existing && existing.clientId !== client.id) {
      return NextResponse.json({ error: "Could not save" }, { status: 409 });
    }

    await prisma.clientContact.upsert({
      where: { email },
      update: {
        name: d.name,
        title: d.role ? `${seat} (${d.role})` : seat,
        phone: d.mobile,
        clientId: client.id,
      },
      create: {
        clientId: client.id,
        name: d.name,
        email,
        title: d.role ? `${seat} (${d.role})` : seat,
        phone: d.mobile,
        isPrimary: false,
        isPortalEnabled: false,
      },
    });

    // The delivery-specific fields have no column on ClientContact and are not
    // worth a migration the night before the start, so they ride alongside,
    // keyed by the same email.
    const payload = {
      ...d,
      email,
      whatsapp: d.whatsappSame ? d.mobile : d.whatsapp,
      workstreamLabel: seat,
      ipHash: createHash("sha256").update(ip).digest("hex").slice(0, 32),
      submittedAt: new Date().toISOString(),
    };
    const prior = await prisma.auditSurveyResponse.findFirst({
      where: { survey: SURVEY, engagementId: HAVEN_ENGAGEMENT_ID, payload: { path: ["email"], equals: email } },
      select: { id: true },
    });
    if (prior) {
      await prisma.auditSurveyResponse.update({ where: { id: prior.id }, data: { payload } });
    } else {
      await prisma.auditSurveyResponse.create({
        data: {
          survey: SURVEY,
          engagementId: HAVEN_ENGAGEMENT_ID,
          payload,
          userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
        },
      });
    }

    try {
      const rows = await prisma.auditSurveyResponse.findMany({
        where: { survey: SURVEY, engagementId: HAVEN_ENGAGEMENT_ID },
        select: { payload: true },
      });
      const seats = new Set(rows.map((r) => String((r.payload as Record<string, unknown>)?.workstream ?? "")));
      const missing = WORKSTREAMS.filter((w) => w.key !== "other" && !seats.has(w.key)).map((w) => w.role);

      await notifyInternal(
        NOTIFY_TO,
        `Haven register: ${d.name}, ${seat} (${rows.length} in)`,
        `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">
<p><b>${d.name}</b>${d.role ? `, ${d.role}` : ""} has registered for <b>${seat}</b>.</p>
<p>${email} &middot; ${d.mobile}${d.reportsTo ? ` &middot; reports to ${d.reportsTo}` : ""}</p>
${d.note ? `<p style="color:#475569">Their note: ${d.note}</p>` : ""}
<p><b>${rows.length} registered.</b>${missing.length ? ` Seats still empty: ${missing.join(", ")}.` : " Every named seat is covered."}</p>
<p><a href="${ADMIN_URL}" style="color:#0B3C5D">See the register</a></p>
</div>`,
      );
    } catch {
      // A failed notification must never fail the person who just registered.
    }

    return NextResponse.json({ ok: true, updated: Boolean(prior) });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
