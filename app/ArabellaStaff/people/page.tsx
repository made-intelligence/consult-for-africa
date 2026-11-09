import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import StaffShell from "@/components/staff/StaffShell";
import PeopleManager, { type PersonRow } from "@/components/arabella/PeopleManager";

export const metadata: Metadata = { title: "Arabella Women's Health: the people", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Leadership only. Onboarding the team: who is on the list, who can sign in,
// and what each person can see.
export default async function ArabellaPeople() {
  const session = await getSiteSession(ARABELLA);
  if (!session) redirect(`${ARABELLA.pathPrefix}/login`);
  const leader = session.tiers.includes("LEADERSHIP") || session.tiers.includes("BOARD");
  if (!leader) redirect(ARABELLA.pathPrefix);

  const rows = await prisma.staffMember.findMany({
    where: { clientId: session.clientId, kind: { not: "TEST" } },
    select: { id: true, name: true, position: true, department: true, phone: true, email: true, tiers: true, isActive: true, lastLoginAt: true },
    orderBy: [{ isActive: "desc" }, { department: "asc" }, { name: "asc" }],
  });

  const people: PersonRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    position: r.position,
    department: r.department,
    phone: r.phone,
    email: r.email,
    tier: r.tiers.includes("LEADERSHIP") ? "LEADERSHIP" : r.tiers.includes("SUPERVISOR") ? "SUPERVISOR" : "ALL_STAFF",
    isPrincipal: r.tiers.includes("BOARD"),
    isActive: r.isActive,
    signedIn: !!r.lastLoginAt,
    isMe: r.id === session.sub,
  }));

  return (
    <StaffShell site={ARABELLA} title="The people" lead="Add the team, give each person a mobile number to sign in with, and set what they can see." back>
      <PeopleManager people={people} isPrincipal={session.tiers.includes("BOARD")} />
    </StaffShell>
  );
}
