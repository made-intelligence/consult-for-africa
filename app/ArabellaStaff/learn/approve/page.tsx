import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { awaitingApproval, weekOfStart } from "@/lib/arabellaLearn";
import { ARABELLA_MODULES } from "@/lib/arabella-modules";
import StaffShell, { card, INK, MUTED, SECOND, Section } from "@/components/staff/StaffShell";

// Dr Chito's queue. Every module waiting on her, in the order staff will get
// them, so the earliest weeks are checked first. Tap one, read it with its
// answers, approve or send back, and it moves on to the next.

export const metadata: Metadata = { title: "Arabella Women's Health: to approve", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const CLINICAL = new Set(ARABELLA_MODULES.filter((m) => m.clinical).map((m) => m.code));

export default async function ArabellaApprove({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { canApproveClinical: true } });
  if (!me?.canApproveClinical) redirect(`${site.pathPrefix}/learn`);
  const base = `${site.pathPrefix}/learn`;

  const [waiting, approvedCount] = await Promise.all([
    awaitingApproval(session.clientId),
    prisma.protocol.count({ where: { clientId: session.clientId, isActive: true, NOT: { approvedAt: null } } }),
  ]);
  const open = waiting.filter((w) => !w.sentBackAt);
  const sentBack = waiting.filter((w) => w.sentBackAt);
  const total = approvedCount + waiting.length;
  const done = (await searchParams).done === "1";

  return (
    <StaffShell
      site={site}
      title="To approve"
      lead="Staff see a module only once you approve it, and not before its week. Each one is the text staff will read and the questions with their answers. A few minutes each."
      backTo={{ href: base, label: "Training" }}
    >
      <p style={{ color: INK, fontWeight: 700, margin: 0 }}>{approvedCount} of {total} approved</p>
      {done && open.length === 0 && (
        <div style={{ ...card, marginTop: 14, background: "var(--staff-highlight)", borderColor: "transparent" }}>
          <div style={{ color: INK, fontWeight: 700 }}>All done. Thank you.</div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>Each module will reach staff on its week&apos;s Monday.</div>
        </div>
      )}

      {open.length > 0 && (
        <Section title={`Waiting for you (${open.length})`} lead="In the order staff will get them. The first few weeks matter most.">
          <div style={{ display: "grid", gap: 10 }}>
            {open.map((p) => {
              const wk = weekOfStart(p.startsOn);
              return (
                <Link key={p.id} href={`${base}/${encodeURIComponent(p.code)}`} style={{ ...card, padding: 16, textDecoration: "none", display: "block", borderLeft: `4px solid ${SECOND}` }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: ".04em" }}>
                    <span>{wk ? `WEEK ${wk}` : "LIVE ON APPROVAL"}</span>
                    <span>· {p._count.questions} QUESTIONS</span>
                    {CLINICAL.has(p.code) && <span style={{ color: "#B0392B" }}>· CLINICAL</span>}
                  </div>
                  <div style={{ color: INK, fontWeight: 650, fontSize: 15.5, marginTop: 4 }}>{p.title}</div>
                  <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2, lineHeight: 1.45 }}>{p.summary}</div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {sentBack.length > 0 && (
        <Section title={`Sent back (${sentBack.length})`} lead="With your notes. CFA revises each one and it comes back here for you.">
          <div style={{ display: "grid", gap: 10 }}>
            {sentBack.map((p) => (
              <Link key={p.id} href={`${base}/${encodeURIComponent(p.code)}`} style={{ ...card, padding: 16, textDecoration: "none", display: "block" }}>
                <div style={{ color: INK, fontWeight: 650, fontSize: 15 }}>{p.title}</div>
                {p.approvalNote && <div style={{ color: MUTED, fontSize: 13.5, marginTop: 4, lineHeight: 1.45 }}>Your note: {p.approvalNote}</div>}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {waiting.length === 0 && !done && (
        <p style={{ color: MUTED, fontSize: 15, marginTop: 20 }}>Nothing is waiting for you.</p>
      )}
    </StaffShell>
  );
}
