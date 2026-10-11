import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { handler } from "@/lib/api-handler";
import { logAudit } from "@/lib/audit";
import { notifyInternal } from "@/lib/email";

/**
 * Put a name on a deliverable.
 *
 * Assigning used to mean picking from the engagement's ACTIVE assignments. There
 * was one active assignment on the entire platform, so that control was empty
 * almost everywhere and 180 of 199 deliverables had nobody attached while 68
 * consultants sat marked available.
 *
 * The reason nobody created the assignments is that an Assignment is a pay
 * contract: role, responsibilities, start date, rate, currency and rate type are
 * all required. A director wanting to put one name against one document had to
 * settle someone's commercial terms first, so they did not bother.
 *
 * This picks a consultant instead and deals with the contract underneath. If
 * they already have an assignment on the engagement, whatever its status, the
 * deliverable joins it and no new terms are invented. If they do not, one is
 * opened from their own profile rates and sent to them to accept, which is the
 * existing PENDING_ACCEPTANCE flow rather than a new concept.
 */

const CAN_MANAGE = [
  "ENGAGEMENT_MANAGER",
  "ASSOCIATE_DIRECTOR",
  "DIRECTOR",
  "PARTNER",
  "ADMIN",
];

/** Assignments a deliverable can sensibly hang off: anything not finished or refused. */
const REUSABLE: ("PENDING_ACCEPTANCE" | "PENDING" | "ACTIVE" | "PAUSED")[] = [
  "ACTIVE",
  "PENDING",
  "PENDING_ACCEPTANCE",
  "PAUSED",
];

async function authorise(deliverableId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 as const };
  if (!CAN_MANAGE.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 as const };
  }

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    select: {
      id: true,
      name: true,
      engagementId: true,
      assignmentId: true,
      engagement: {
        select: { id: true, name: true, engagementManagerId: true, startDate: true },
      },
    },
  });
  if (!deliverable) return { error: "Deliverable not found", status: 404 as const };

  // An engagement manager only runs their own engagements.
  if (
    session.user.role === "ENGAGEMENT_MANAGER" &&
    deliverable.engagement.engagementManagerId !== session.user.id
  ) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { session, deliverable };
}

/** Who this deliverable could go to, and whether they are already on the engagement. */
export const GET = handler(async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth_ = await authorise(id);
  if ("error" in auth_) {
    return Response.json({ error: auth_.error }, { status: auth_.status });
  }
  const { deliverable } = auth_;

  const [consultants, assignments] = await Promise.all([
    prisma.consultantProfile.findMany({
      select: {
        yearsExperience: true,
        title: true,
        tier: true,
        availabilityStatus: true,
        specialties: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { yearsExperience: "desc" },
    }),
    prisma.assignment.findMany({
      where: { engagementId: deliverable.engagementId, status: { in: REUSABLE } },
      select: { id: true, consultantId: true, role: true, status: true },
    }),
  ]);

  const onEngagement = new Map(assignments.map((a) => [a.consultantId, a]));

  return Response.json({
    deliverable: { id: deliverable.id, name: deliverable.name },
    consultants: consultants.map((c) => ({
      id: c.user.id,
      name: c.user.name,
      title: c.title,
      tier: c.tier,
      yearsExperience: c.yearsExperience,
      availability: c.availabilityStatus,
      specialties: c.specialties.slice(0, 3),
      // Already on this engagement: assigning costs nothing new.
      existingAssignment: onEngagement.get(c.user.id) ?? null,
    })),
  });
});

/** Body: { consultantId } */
export const POST = handler(async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth_ = await authorise(id);
  if ("error" in auth_) {
    return Response.json({ error: auth_.error }, { status: auth_.status });
  }
  const { session, deliverable } = auth_;

  const body = await req.json().catch(() => ({}));
  const consultantId = typeof body.consultantId === "string" ? body.consultantId : "";
  if (!consultantId) {
    return Response.json({ error: "consultantId is required" }, { status: 400 });
  }

  const consultant = await prisma.user.findUnique({
    where: { id: consultantId },
    select: {
      id: true,
      name: true,
      email: true,
      consultantProfile: {
        select: {
          title: true,
          hourlyRateUSD: true,
          monthlyRateNGN: true,
          availabilityStatus: true,
        },
      },
    },
  });
  if (!consultant) {
    return Response.json({ error: "Consultant not found" }, { status: 404 });
  }

  const existing = await prisma.assignment.findFirst({
    where: {
      engagementId: deliverable.engagementId,
      consultantId,
      status: { in: REUSABLE },
    },
    select: { id: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  let assignmentId = existing?.id;
  let createdAssignment = false;

  if (!assignmentId) {
    const profile = consultant.consultantProfile;
    // Their own published rate, so no new commercial decision is taken here.
    // NGN monthly is the house default; the USD hourly is used when that is all
    // they have recorded.
    const useNgnMonthly = profile?.monthlyRateNGN != null;
    const rateAmount = useNgnMonthly ? profile!.monthlyRateNGN! : (profile?.hourlyRateUSD ?? 0);

    const created = await prisma.assignment.create({
      data: {
        engagementId: deliverable.engagementId,
        consultantId,
        role: profile?.title?.trim() || "Consultant",
        responsibilities: `Deliverables on ${deliverable.engagement.name}, starting with ${deliverable.name}.`,
        startDate: new Date(),
        // Theirs to accept or decline, not something done to them.
        status: "PENDING_ACCEPTANCE",
        rateAmount,
        rateCurrency: useNgnMonthly ? "NGN" : "USD",
        rateType: useNgnMonthly ? "MONTHLY" : "HOURLY",
      },
      select: { id: true },
    });
    assignmentId = created.id;
    createdAssignment = true;
  }

  await prisma.deliverable.update({
    where: { id: deliverable.id },
    data: { assignmentId },
  });

  await logAudit({
    userId: session.user.id,
    action: "ASSIGN",
    entityType: "Deliverable",
    entityId: deliverable.id,
    entityName: deliverable.name,
    engagementId: deliverable.engagementId,
    details: { consultantId, consultantName: consultant.name, createdAssignment },
  });

  if (createdAssignment && consultant.email) {
    try {
      await notifyInternal(
        consultant.email,
        `You have been put forward for ${deliverable.engagement.name}`,
        `<p style="margin:0 0 16px;color:#111827;font-size:15px;">Hello ${consultant.name ?? "there"},</p>
         <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.7;">
           You have been put forward for work on <strong>${deliverable.engagement.name}</strong>,
           starting with <strong>${deliverable.name}</strong>. It is waiting for you to accept
           or decline, and the terms are on the assignment itself.
         </p>
         <p style="margin:0;color:#6B7280;font-size:13px;">
           If the rate or the scope is not right, decline it and say why. That is more useful
           to us than a reluctant yes.
         </p>`,
      );
    } catch (err) {
      // The assignment stands whether or not the email got out.
      console.error("[deliverable assign] notify failed:", err);
    }
  }

  return Response.json({
    ok: true,
    assignmentId,
    createdAssignment,
    consultant: { id: consultant.id, name: consultant.name },
  });
});
