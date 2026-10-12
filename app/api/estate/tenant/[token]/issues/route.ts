import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { gateTenant, clientIp } from "@/lib/estate/gate";
import { nextIssueReference } from "@/lib/estate/issues";
import { isEstateKey } from "@/lib/estate/photos";
import { notifyInternal } from "@/lib/email";

/**
 * A tenant reporting something. NO PLATFORM AUTH — the link is the credential.
 *
 * An emergency emails the estate manager on the way out. Everything else waits
 * for the board, on purpose: a channel that pings for a dripping tap is a
 * channel nobody reads at 2am when the report is a burst riser. Deliberately not
 * the platform-wide admin feed — this is the family's estate, not firm business,
 * and a tenant's complaint has no business appearing on a consultant's screen.
 */

const schema = z.object({
  category: z.enum([
    "POWER", "WATER", "SECURITY", "PLUMBING", "ELECTRICAL", "AIR_CONDITIONING",
    "APPLIANCE", "STRUCTURAL", "CLEANING", "WASTE", "LIFT", "PEST", "POOL", "INTERNET", "OTHER",
  ]),
  priority: z.enum(["EMERGENCY", "HIGH", "NORMAL", "LOW"]).default("NORMAL"),
  title: z.string().min(3).max(140),
  description: z.string().min(3).max(4000),
  photoKeys: z.array(z.string().max(400)).max(6).default([]),
});

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-issue", { windowMs: 60_000, max: 10 })) {
    return Response.json({ error: "Too many reports at once. Wait a minute." }, { status: 429 });
  }

  const { token } = await params;
  const gate = await gateTenant(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  const ctx = gate.ctx;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please give the problem a short title and describe it." }, { status: 400 });
  }
  const d = parsed.data;

  // Keys are minted by our own presign route, so anything else is not ours.
  const photoKeys = d.photoKeys.filter((k) => isEstateKey(k, "issue"));

  const building = await prisma.estateBuilding.findUniqueOrThrow({
    where: { id: ctx.buildingId },
    select: { slug: true, name: true },
  });

  const reference = await nextIssueReference(ctx.buildingId, building.slug);

  const issue = await prisma.estateIssue.create({
    data: {
      reference,
      buildingId: ctx.buildingId,
      unitId: ctx.unitId,
      tenantId: ctx.tenantId,
      category: d.category,
      priority: d.priority,
      status: "SUBMITTED",
      title: d.title.trim(),
      description: d.description.trim(),
      photoKeys,
      // The clocks start when the office acknowledges, not now. Nobody can be
      // held to a response target for a message that arrived at 3am.
      updates: {
        create: {
          authorType: "TENANT",
          authorName: ctx.tenantName,
          tenantId: ctx.tenantId,
          body: d.description.trim(),
          photoKeys,
        },
      },
    },
    select: { id: true, reference: true, createdAt: true },
  });

  if (d.priority === "EMERGENCY") {
    const to = process.env.ESTATE_MANAGER_EMAIL;
    if (to) {
      notifyInternal(
        to,
        `EMERGENCY — ${building.name} ${ctx.unitLabel}: ${d.title.trim()}`,
        `<p><strong>${escapeHtml(ctx.tenantName)}</strong> at ${escapeHtml(building.name)} ${escapeHtml(ctx.unitLabel)} ` +
          `has reported an emergency.</p><p><strong>${escapeHtml(d.title.trim())}</strong></p>` +
          `<p>${escapeHtml(d.description.trim())}</p><p>Reference ${reference}.</p>`,
        // Never let a failed send cost the tenant their report.
      ).catch(() => {});
    }
  }

  return Response.json({ ok: true, reference: issue.reference, id: issue.id }, { status: 201 });
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
