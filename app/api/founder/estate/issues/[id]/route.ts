import { z } from "zod";
import { handler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/apiAuth";
import { ELEVATED_ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { slaTargets, canResolve } from "@/lib/estate/issues";

/**
 * The office working a job.
 *
 * Acknowledging is the act that starts both clocks, because a target nobody has
 * seen is not a target anybody can be held to. The photograph rule on resolving
 * applies here exactly as it does to the ground team: the office marking its own
 * work complete without evidence is precisely the habit the rule exists to stop.
 */

const schema = z.object({
  status: z
    .enum([
      "ACKNOWLEDGED", "SCHEDULED", "IN_PROGRESS", "AWAITING_PARTS",
      "RESOLVED", "CLOSED", "REOPENED",
    ])
    .optional(),
  priority: z.enum(["EMERGENCY", "HIGH", "NORMAL", "LOW"]).optional(),
  assignedStaffId: z.string().max(40).nullable().optional(),
  body: z.string().max(2000).nullable().optional(),
  visibleToTenant: z.boolean().default(true),
  costNaira: z.number().nonnegative().max(1_000_000_000).nullable().optional(),
});

export const PATCH = handler(async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAuth(ELEVATED_ROLES);
  if (error) return error;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
  const d = parsed.data;

  const issue = await prisma.estateIssue.findUnique({
    where: { id },
    select: {
      id: true, status: true, priority: true, acknowledgedAt: true,
      photoKeys: true, buildingId: true,
    },
  });
  if (!issue) return Response.json({ error: "Not found." }, { status: 404 });

  if (d.status === "RESOLVED") {
    // Photographs the TENANT attached are pictures of the problem. They are not
    // evidence that anything was done about it, so they do not count here —
    // only a photograph added by the team or the office after the fact does.
    const evidence = await prisma.estateIssueUpdate.count({
      where: {
        issueId: id,
        authorType: { in: ["STAFF", "OFFICE"] },
        photoKeys: { isEmpty: false },
      },
    });
    const check = canResolve({ photoCount: evidence, note: d.body ?? null });
    if (!check.ok) return Response.json({ error: check.why }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, name: true },
  });

  const now = new Date();
  const acknowledging = !issue.acknowledgedAt;
  // Re-priced against the new priority when it changes, because a job bumped to
  // emergency after somebody looked at it should be on the emergency clock from
  // that moment, not on the clock it was given when it looked routine.
  const targets =
    acknowledging || (d.priority && d.priority !== issue.priority)
      ? slaTargets(d.priority ?? issue.priority, now)
      : null;

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.estateIssue.update({
      where: { id },
      data: {
        ...(d.status ? { status: d.status } : {}),
        ...(d.priority ? { priority: d.priority } : {}),
        ...(d.assignedStaffId !== undefined ? { assignedStaffId: d.assignedStaffId || null } : {}),
        ...(d.costNaira !== undefined ? { costNaira: d.costNaira } : {}),
        ...(acknowledging ? { acknowledgedAt: now } : {}),
        ...(targets ? { respondBy: targets.respondBy, resolveBy: targets.resolveBy } : {}),
        ...(d.status === "RESOLVED" ? { resolvedAt: now, resolutionNote: d.body?.trim() ?? null } : {}),
        ...(d.status === "CLOSED" ? { closedAt: now } : {}),
        ...(d.status === "REOPENED" ? { resolvedAt: null, closedAt: null } : {}),
      },
      select: { id: true, reference: true, status: true, buildingId: true },
    });

    if (d.body?.trim() || d.status) {
      await tx.estateIssueUpdate.create({
        data: {
          issueId: id,
          authorType: "OFFICE",
          authorName: user?.name ?? "Estate office",
          userId: user?.id ?? null,
          body: d.body?.trim() || null,
          statusTo: d.status ?? null,
          visibleToTenant: d.visibleToTenant,
        },
      });
    }

    // A repair that cost money is an expense against the service charge, and
    // typing it twice is how the two stop agreeing.
    if (d.costNaira && d.costNaira > 0) {
      const already = await tx.estateExpense.findFirst({ where: { issueId: id }, select: { id: true } });
      if (!already) {
        await tx.estateExpense.create({
          data: {
            buildingId: row.buildingId,
            category: "REPAIRS",
            amount: d.costNaira,
            paidAt: now,
            payee: "Repair",
            description: `Job ${row.reference}`,
            issueId: id,
            recordedById: user?.id ?? null,
          },
        });
      }
    }

    return row;
  });

  return Response.json({ ok: true, ...updated });
});
