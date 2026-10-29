import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/admin-notify";
import {
  MEZO_LEAD_SOURCE,
  MEZO_PROJECT_TYPE,
  OpportunitySchema,
  hooksFor,
  messageFor,
  painPointsFor,
  scoreFor,
  sizeFor,
  verifyMezoSignature,
} from "@/lib/mezo/improvement-lead";

/**
 * POST /api/partners/mezo/improvement
 *
 * Mezo sends a facility it has assessed, as a consulting opportunity. Signed
 * with MEZO_PARTNER_SECRET (x-mezo-signature: hex HMAC-SHA256 of the raw
 * body). One lead per facility: a resend updates it rather than duplicating.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.MEZO_PARTNER_SECRET;
  if (!secret) return Response.json({ error: "Not configured" }, { status: 503 });

  const raw = await req.text();
  if (!verifyMezoSignature(raw, req.headers.get("x-mezo-signature"), secret)) {
    return Response.json({ error: "Bad signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Not JSON" }, { status: 400 });
  }
  const parsed = OpportunitySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid opportunity", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  const o = parsed.data;

  const hooks = hooksFor(o);
  const data = {
    organizationName: o.organizationName ?? "Facility from Mezo",
    contactName: o.contact.name ?? "Unknown",
    contactEmail: o.contact.email,
    contactPhone: o.contact.phone,
    contactRole: o.contact.role,
    organizationType: o.organizationType,
    country: "Nigeria",
    city: o.city,
    inboundMessage: messageFor(o),
    inboundProjectType: MEZO_PROJECT_TYPE,
    serviceLineHook: hooks[0] ?? null,
    serviceLineHooks: hooks,
    knownPainPoints: painPointsFor(o),
    estimatedSize: sizeFor(o),
    qualificationScore: scoreFor(o),
  };

  const existing = await prisma.lead.findFirst({
    where: { source: MEZO_LEAD_SOURCE, inboundMessage: { startsWith: `Mezo ref ${o.externalRef}\n` } },
    select: { id: true, qualificationScore: true },
  });

  const lead = existing
    ? await prisma.lead.update({ where: { id: existing.id }, data, select: { id: true } })
    : await prisma.lead.create({ data: { ...data, source: MEZO_LEAD_SOURCE, status: "NEW" }, select: { id: true } });

  // Tell the partners when a facility asks for help, or one first arrives as a managed prospect.
  const hot = data.qualificationScore === "HOT";
  if (!existing || (hot && existing.qualificationScore !== "HOT")) {
    await notifyAdmins({
      type: "SYSTEM",
      severity: hot ? "SUCCESS" : "INFO",
      title: hot
        ? `${data.organizationName} asked for help through the Mezo Readiness Programme`
        : `${data.organizationName} assessed by Mezo: ${o.workstreams.length} areas of work`,
      body: data.inboundMessage.split("\n").slice(1, 6).join(" "),
      href: `/leads/${lead.id}`,
      metadata: { mezoRef: o.externalRef, totalDays: o.totalDays, managed: o.managed },
      emailAdmins: hot,
    });
  }

  return Response.json({ leadId: lead.id });
}
