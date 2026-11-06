import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";
import { HAVEN_ROLES, CONDUCT } from "@/lib/haven-roles";
import { canManage, currentCycle, isLeadership, monthKey, overallScore } from "@/lib/havenPerformance";

export const dynamic = "force-dynamic";

const t = (n: number) => z.string().trim().max(n);
const score = z.number().int().min(0).max(5);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("seedObjectives"), staffId: z.string() }),
  z.object({ action: z.literal("saveObjective"), staffId: z.string(), id: z.string().optional(), title: t(200).min(3), target: t(120).min(1), tags: z.array(z.enum(["H1", "H2", "H3", "H4", "H5"])).max(5), weight: z.number().min(0.05).max(0.6) }),
  z.object({ action: z.literal("deleteObjective"), id: z.string() }),
  z.object({ action: z.literal("propose"), staffId: z.string() }),
  z.object({ action: z.literal("agree"), staffId: z.string() }),
  z.object({ action: z.literal("update"), objectiveId: z.string(), actual: t(120).min(1), rag: z.enum(["GREEN", "AMBER", "RED"]), note: t(500).optional() }),
  z.object({ action: z.literal("oneToOne"), staffId: z.string(), wentWell: t(1500).optional(), inTheWay: t(1500).optional(), support: t(1500).optional(), actions: t(1500).optional() }),
  z.object({ action: z.literal("appraisalSelf"), scores: z.record(z.string(), score), conduct: z.record(z.string(), score), comment: t(2000).optional(), submit: z.boolean() }),
  z.object({ action: z.literal("appraisalManager"), staffId: z.string(), scores: z.record(z.string(), score), conduct: z.record(z.string(), score), comment: t(2000).optional(), submit: z.boolean() }),
  z.object({ action: z.literal("moderate"), staffId: z.string(), note: t(1000).optional() }),
  z.object({ action: z.literal("sign"), staffId: z.string() }),
  z.object({ action: z.literal("setRole"), staffId: z.string(), roleCode: z.string().nullable() }),
  z.object({ action: z.literal("setLineManager"), staffId: z.string(), managerId: z.string().nullable() }),
  z.object({ action: z.literal("openAppraisal") }),
]);

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the fields and try again." }, { status: 400 });
  const b = parsed.data;
  const deny = (m = "Not allowed") => NextResponse.json({ error: m }, { status: 403 });
  const fail = (m: string, code = 422) => NextResponse.json({ error: m }, { status: code });

  const cycle = await currentCycle(session.clientId);
  if (!cycle) return fail("No review cycle is open yet.", 409);

  const person = async (id: string) =>
    prisma.staffMember.findFirst({ where: { id, clientId: session.clientId }, select: { id: true, lineManagerId: true, roleCode: true } });

  switch (b.action) {
    case "seedObjectives": {
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      if (!canManage(session, p)) return deny();
      const have = await prisma.personalObjective.count({ where: { staffId: p.id, cycleId: cycle.id } });
      if (have) return fail("Objectives already exist for this cycle.", 409);
      const role = HAVEN_ROLES.find((r) => r.code === p.roleCode);
      if (!role) return fail("Set this person's role first.");
      await prisma.personalObjective.createMany({
        data: role.kpis.map((k, i) => ({ staffId: p.id, cycleId: cycle.id, kpiCode: k.code, title: k.title, target: k.target, tags: k.objective, weight: k.weight, sortOrder: i })),
      });
      break;
    }
    case "saveObjective": {
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      const self = p.id === session.sub;
      if (!self && !canManage(session, p)) return deny();
      if (b.id) {
        const o = await prisma.personalObjective.findFirst({ where: { id: b.id, staffId: p.id } });
        if (!o) return fail("Not found", 404);
        if (o.status === "AGREED" && !canManage(session, p)) return deny("Agreed objectives are changed with your line manager.");
        await prisma.personalObjective.update({ where: { id: o.id }, data: { title: b.title, target: b.target, tags: b.tags, weight: b.weight, ...(o.status === "AGREED" ? {} : { status: "DRAFT" }) } });
      } else {
        const n = await prisma.personalObjective.count({ where: { staffId: p.id, cycleId: cycle.id } });
        if (n >= 6) return fail("Six objectives at most. Five is better.");
        await prisma.personalObjective.create({ data: { staffId: p.id, cycleId: cycle.id, title: b.title, target: b.target, tags: b.tags, weight: b.weight, sortOrder: n } });
      }
      break;
    }
    case "deleteObjective": {
      const o = await prisma.personalObjective.findUnique({ where: { id: b.id }, include: { staff: { select: { id: true, lineManagerId: true, clientId: true } } } });
      if (!o || o.staff.clientId !== session.clientId) return fail("Not found", 404);
      if (!canManage(session, o.staff)) return deny();
      if (o.status === "AGREED") return fail("Agreed objectives stay for the cycle.", 409);
      await prisma.personalObjective.delete({ where: { id: o.id } });
      break;
    }
    case "propose": {
      if (b.staffId !== session.sub) return deny();
      await prisma.personalObjective.updateMany({ where: { staffId: session.sub, cycleId: cycle.id, status: "DRAFT" }, data: { status: "PROPOSED" } });
      break;
    }
    case "agree": {
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      if (!canManage(session, p) || p.id === session.sub) return deny("Objectives are agreed by the line manager, not by the person themselves.");
      const objs = await prisma.personalObjective.findMany({ where: { staffId: p.id, cycleId: cycle.id } });
      if (objs.length < 3) return fail("Three objectives at least.");
      const w = objs.reduce((a, o) => a + o.weight, 0);
      if (Math.abs(w - 1) > 0.02) return fail(`The weights add to ${Math.round(w * 100)}%. They need to add to 100%.`);
      await prisma.personalObjective.updateMany({ where: { staffId: p.id, cycleId: cycle.id }, data: { status: "AGREED", agreedById: session.sub, agreedAt: new Date() } });
      break;
    }
    case "update": {
      const o = await prisma.personalObjective.findUnique({ where: { id: b.objectiveId }, include: { staff: { select: { id: true, lineManagerId: true, clientId: true } } } });
      if (!o || o.staff.clientId !== session.clientId) return fail("Not found", 404);
      if (o.staff.id !== session.sub && !canManage(session, o.staff)) return deny();
      const month = monthKey();
      await prisma.objectiveUpdate.upsert({
        where: { objectiveId_month: { objectiveId: o.id, month } },
        create: { objectiveId: o.id, month, actual: b.actual, rag: b.rag, note: b.note || null, byId: session.sub },
        update: { actual: b.actual, rag: b.rag, note: b.note || null, byId: session.sub },
      });
      break;
    }
    case "oneToOne": {
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      if (!canManage(session, p) || p.id === session.sub) return deny();
      await prisma.oneToOne.create({ data: { staffId: p.id, managerId: session.sub, heldOn: new Date(), wentWell: b.wentWell || null, inTheWay: b.inTheWay || null, support: b.support || null, actions: b.actions || null } });
      break;
    }
    case "appraisalSelf": {
      if (!cycle.appraisalOpenedAt) return fail("Appraisal is not open yet.", 409);
      const a = await prisma.appraisal.upsert({
        where: { staffId_cycleId: { staffId: session.sub, cycleId: cycle.id } },
        create: { staffId: session.sub, cycleId: cycle.id },
        update: {},
      });
      if (a.stage !== "SELF") return fail("Your self-appraisal is already submitted.", 409);
      await prisma.appraisal.update({ where: { id: a.id }, data: { selfScores: b.scores, conductSelf: b.conduct, selfComment: b.comment || null, ...(b.submit ? { stage: "MANAGER" } : {}) } });
      break;
    }
    case "appraisalManager": {
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      if (!canManage(session, p) || p.id === session.sub) return deny();
      const a = await prisma.appraisal.findUnique({ where: { staffId_cycleId: { staffId: p.id, cycleId: cycle.id } } });
      if (!a || a.stage !== "MANAGER") return fail("Waiting for the self-appraisal first.", 409);
      const objs = await prisma.personalObjective.findMany({ where: { staffId: p.id, cycleId: cycle.id }, select: { id: true, weight: true } });
      await prisma.appraisal.update({
        where: { id: a.id },
        data: { managerScores: b.scores, conductManager: b.conduct, managerComment: b.comment || null, managerId: session.sub, overall: overallScore(objs, b.scores, b.conduct), ...(b.submit ? { stage: "MODERATION" } : {}) },
      });
      break;
    }
    case "moderate": {
      if (!isLeadership(session)) return deny();
      const a = await prisma.appraisal.findUnique({ where: { staffId_cycleId: { staffId: b.staffId, cycleId: cycle.id } } });
      if (!a || a.stage !== "MODERATION") return fail("Not ready for moderation.", 409);
      await prisma.appraisal.update({ where: { id: a.id }, data: { moderationNote: b.note || null, stage: "SIGN_OFF" } });
      break;
    }
    case "sign": {
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      const a = await prisma.appraisal.findUnique({ where: { staffId_cycleId: { staffId: p.id, cycleId: cycle.id } } });
      if (!a || a.stage !== "SIGN_OFF") return fail("Not ready to sign.", 409);
      const asStaff = p.id === session.sub;
      const asManager = a.managerId === session.sub;
      if (!asStaff && !asManager) return deny();
      const staffSignedAt = asStaff ? new Date() : a.staffSignedAt;
      const managerSignedAt = asManager ? new Date() : a.managerSignedAt;
      await prisma.appraisal.update({ where: { id: a.id }, data: { staffSignedAt, managerSignedAt, ...(staffSignedAt && managerSignedAt ? { stage: "DONE" } : {}) } });
      break;
    }
    case "setRole": {
      if (!isLeadership(session)) return deny();
      if (b.roleCode && !HAVEN_ROLES.some((r) => r.code === b.roleCode)) return fail("Unknown role");
      const p = await person(b.staffId);
      if (!p) return fail("Not found", 404);
      await prisma.staffMember.update({ where: { id: p.id }, data: { roleCode: b.roleCode } });
      break;
    }
    case "setLineManager": {
      if (!isLeadership(session)) return deny();
      if (b.managerId === b.staffId) return fail("Nobody manages themselves.");
      const p = await person(b.staffId);
      const m = b.managerId ? await person(b.managerId) : null;
      if (!p || (b.managerId && !m)) return fail("Not found", 404);
      await prisma.staffMember.update({ where: { id: p.id }, data: { lineManagerId: b.managerId } });
      break;
    }
    case "openAppraisal": {
      if (!isLeadership(session)) return deny();
      await prisma.reviewCycle.update({ where: { id: cycle.id }, data: { appraisalOpenedAt: new Date() } });
      break;
    }
  }
  return NextResponse.json({ ok: true, conduct: CONDUCT.length });
}
