import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { gateCrew, crewMayTouch, clientIp } from "@/lib/estate/gate";
import { isEstateKey } from "@/lib/estate/photos";
import { canResolve } from "@/lib/estate/issues";

/**
 * The ground team working a job. NO PLATFORM AUTH — link plus PIN.
 *
 * Marking something fixed requires a photograph and a sentence. That rule lives
 * in lib/estate/issues.ts and is enforced here rather than in the form, because
 * it is precisely the rule that gets quietly skipped at eight in the evening
 * when the work is done and the technician wants to go home — and the photograph
 * is the entire reason a tenant believes their service charge bought anything.
 */

const schema = z.object({
  status: z
    .enum(["ACKNOWLEDGED", "SCHEDULED", "IN_PROGRESS", "AWAITING_PARTS", "RESOLVED"])
    .optional(),
  body: z.string().max(2000).nullable().optional(),
  photoKeys: z.array(z.string().max(400)).max(6).default([]),
  claim: z.boolean().optional(),
});

export const PATCH = handler(async function PATCH(
  req: Request,
  { params }: { params: Promise<{ token: string; id: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-issue-update", { windowMs: 60_000, max: 30 })) {
    return Response.json({ error: "Too many updates. Wait a moment." }, { status: 429 });
  }

  const { token, id } = await params;
  const gate = await gateCrew(token);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });
  if (gate.ctx.locked) return Response.json({ error: "Enter your PIN first." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  const issue = await prisma.estateIssue.findUnique({
    where: { id },
    select: { id: true, buildingId: true, status: true, acknowledgedAt: true },
  });
  if (!issue) return Response.json({ error: "That job no longer exists." }, { status: 404 });
  if (!crewMayTouch(gate.ctx, issue.buildingId)) {
    return Response.json({ error: "That is not one of your buildings." }, { status: 403 });
  }

  const photoKeys = d.photoKeys.filter((k) => isEstateKey(k, "issue"));

  if (d.status === "RESOLVED") {
    const check = canResolve({ photoCount: photoKeys.length, note: d.body ?? null });
    if (!check.ok) return Response.json({ error: check.why }, { status: 400 });
  }

  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.estateIssue.update({
      where: { id },
      data: {
        ...(d.status ? { status: d.status } : {}),
        // First touch stamps the acknowledgement, whatever the status move was.
        // A job somebody has picked up has been seen, and the response clock
        // should stop at the moment that became true.
        ...(issue.acknowledgedAt ? {} : { acknowledgedAt: now }),
        ...(d.claim ? { assignedStaffId: gate.ctx.staffId } : {}),
        ...(d.status === "RESOLVED"
          ? { resolvedAt: now, resolutionNote: d.body?.trim() ?? null }
          : {}),
        ...(photoKeys.length ? { photoKeys: { push: photoKeys } } : {}),
      },
      select: { id: true, reference: true, status: true },
    });

    await tx.estateIssueUpdate.create({
      data: {
        issueId: id,
        authorType: "STAFF",
        authorName: gate.ctx.name,
        staffId: gate.ctx.staffId,
        body: d.body?.trim() || null,
        photoKeys,
        statusTo: d.status ?? null,
      },
    });

    return row;
  });

  return Response.json({ ok: true, ...updated });
});
