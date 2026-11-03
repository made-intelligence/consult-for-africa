import { prisma } from "@/lib/prisma";

/**
 * Who a module is for. Same loose match as tasks: nineteen people do not need
 * a role taxonomy, and an empty list means everybody.
 */
export function appliesTo(roles: string[], departments: string[], position: string, department: string) {
  if (roles.length === 0 && departments.length === 0) return true;
  if (departments.some((d) => d.toLowerCase() === department.toLowerCase())) return true;
  if (roles.length === 0) return false;
  const hay = `${position} ${department}`.toLowerCase();
  return roles.some((r) => {
    const needle = r.toLowerCase().replace(/^every /, "").replace(/s$/, "");
    return hay.includes(needle) || needle.includes("everybody") || needle.includes("all ");
  });
}

/** A pass is four in five. One slip on a six-question module still passes. */
export const PASS_MARK = 0.8;

export type LearnStatus = "NEW" | "READ" | "PASSED" | "RETAKE";

export interface LearnRow {
  id: string;
  code: string;
  domain: string;
  title: string;
  summary: string;
  approved: boolean;
  status: LearnStatus;
}

/** Every module that applies to one person, with where they are on it. */
export async function myModules(clientId: string, staffId: string): Promise<LearnRow[]> {
  const me = await prisma.staffMember.findUnique({ where: { id: staffId }, select: { position: true, department: true } });
  if (!me) return [];
  const [protocols, progress] = await Promise.all([
    prisma.protocol.findMany({
      where: { clientId, isActive: true },
      select: { id: true, code: true, domain: true, title: true, summary: true, roles: true, departments: true, approvedAt: true, version: true },
      orderBy: [{ domain: "asc" }, { code: "asc" }],
    }),
    prisma.protocolProgress.findMany({
      where: { staffId },
      select: { protocolId: true, studiedAt: true, passed: true, againstVersion: true },
    }),
  ]);
  const by = new Map(progress.map((p) => [p.protocolId, p]));
  return protocols
    .filter((p) => appliesTo(p.roles, p.departments, me.position, me.department))
    .map((p) => {
      const pr = by.get(p.id);
      const current = pr && pr.againstVersion === p.version;
      const status: LearnStatus = !pr || !current ? "NEW" : pr.passed ? "PASSED" : pr.passed === false ? "RETAKE" : pr.studiedAt ? "READ" : "NEW";
      return { id: p.id, code: p.code, domain: p.domain, title: p.title, summary: p.summary, approved: !!p.approvedAt, status };
    });
}
