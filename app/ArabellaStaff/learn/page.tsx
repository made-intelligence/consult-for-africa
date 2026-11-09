import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { appliesTo } from "@/lib/havenLearn";
import StaffShell, { card, INK, MUTED, SECOND } from "@/components/staff/StaffShell";

// The training catalogue. Empty until Arabella's own procedures are written up
// as modules; it lists whatever approved modules exist for this person.

export const metadata: Metadata = { title: "Arabella Women's Health: training", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ArabellaLearn() {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);

  const [me, modules] = await Promise.all([
    prisma.staffMember.findUnique({ where: { id: session.sub }, select: { position: true, department: true } }),
    prisma.protocol.findMany({
      where: { clientId: session.clientId, isActive: true, NOT: { approvedAt: null } },
      select: { id: true, code: true, title: true, roles: true, departments: true },
      orderBy: [{ domain: "asc" }, { code: "asc" }],
    }),
  ]);
  const mine = modules.filter((m) => appliesTo(m.roles, m.departments, me?.position ?? "", me?.department ?? ""));

  return (
    <StaffShell site={site} title="Training" lead="Arabella's own procedures, one short module at a time." back>
      {mine.length === 0 ? (
        <div style={card}>
          <div style={{ color: INK, fontWeight: 700, fontSize: 16 }}>Nothing here yet</div>
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "6px 0 0" }}>
            The practice&apos;s procedures will appear here as each one is written and approved. You will be told when the first is ready.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {mine.map((m) => (
            <div key={m.id} style={{ ...card, padding: 16, borderLeft: `4px solid ${SECOND}` }}>
              <div style={{ color: INK, fontWeight: 650, fontSize: 15.5 }}>{m.title}</div>
              <div style={{ color: MUTED, fontSize: 13 }}>{m.code}</div>
            </div>
          ))}
        </div>
      )}
    </StaffShell>
  );
}
