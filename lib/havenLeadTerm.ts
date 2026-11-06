import { prisma } from "@/lib/prisma";

/**
 * Rotating team leads. The Nursing Lead serves one quarter: while the term
 * runs they lead the Nursing team, line-manage the registered nurses and hold
 * the SUPERVISOR tier (rotas, leave decisions, skill sign-off). Appointing the
 * next lead ends the current term and moves all three to the new person in one
 * transaction, so nurses never have two managers or none.
 */

export const NURSING_TEAM_KEY = "nursing";
export const TERM_MONTHS = 3;

export async function currentTerm(teamId: string, at = new Date()) {
  return prisma.leadTerm.findFirst({
    where: { teamId, endedAt: null, startsOn: { lte: at } },
    orderBy: { startsOn: "desc" },
    include: { staff: { select: { id: true, name: true } } },
  });
}

export async function appointLead(opts: { clientId: string; teamId: string; staffId: string; startsOn: Date }) {
  const { clientId, teamId, staffId, startsOn } = opts;
  const team = await prisma.staffTeam.findFirst({ where: { id: teamId, clientId }, select: { id: true } });
  if (!team) throw new Error("Team not found");
  const lead = await prisma.staffMember.findFirst({ where: { id: staffId, clientId, teamId, isActive: true }, select: { id: true, tiers: true, roleCode: true } });
  if (!lead) throw new Error("The new lead must be a member of the team");

  const prev = await currentTerm(teamId);
  const endsOn = new Date(startsOn);
  endsOn.setUTCMonth(endsOn.getUTCMonth() + TERM_MONTHS);

  // Who the team's members report to while the term runs, and who the lead reports to.
  const hcs = await prisma.staffMember.findFirst({ where: { clientId, roleCode: "HCS", isActive: true }, select: { id: true } });
  const nurses = await prisma.staffMember.findMany({ where: { clientId, isActive: true, roleCode: "RN" }, select: { id: true } });
  const grants = !lead.tiers.includes("SUPERVISOR") && !lead.tiers.includes("LEADERSHIP");

  const ops = [];
  if (prev) {
    ops.push(prisma.leadTerm.update({ where: { id: prev.id }, data: { endedAt: new Date() } }));
    if (prev.grantedSupervisor && prev.staffId !== staffId) {
      const p = await prisma.staffMember.findUnique({ where: { id: prev.staffId }, select: { tiers: true } });
      if (p) ops.push(prisma.staffMember.update({ where: { id: prev.staffId }, data: { tiers: p.tiers.filter((t) => t !== "SUPERVISOR") } }));
    }
  }
  ops.push(prisma.leadTerm.create({ data: { teamId, staffId, startsOn, endsOn, grantedSupervisor: grants } }));
  ops.push(prisma.staffTeam.update({ where: { id: teamId }, data: { leadId: staffId } }));
  if (grants) ops.push(prisma.staffMember.update({ where: { id: staffId }, data: { tiers: [...lead.tiers, "SUPERVISOR"] } }));
  ops.push(prisma.staffMember.updateMany({ where: { id: { in: nurses.map((n) => n.id).filter((id) => id !== staffId) } }, data: { lineManagerId: staffId } }));
  ops.push(prisma.staffMember.update({ where: { id: staffId }, data: { lineManagerId: hcs?.id ?? null } }));
  await prisma.$transaction(ops);
  return { endsOn };
}
