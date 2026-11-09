import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can, getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import type { LearnRow } from "@/lib/havenLearn";
import { arabellaLearn, awaitingApproval, dayLabel, planWeek } from "@/lib/arabellaLearn";
import StaffShell, { card, INK, LINE, MUTED, SECOND, ACCENT, Section } from "@/components/staff/StaffShell";

// The training catalogue. A module or two a week, so it never arrives as a
// wall: each opens on its week's Monday once Dr Chito has approved it.

export const metadata: Metadata = { title: "Arabella Women's Health: training", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const RED = "#B0392B";

const LABEL: Record<LearnRow["status"], [string, string]> = {
  NEW: ["New", SECOND],
  READ: ["Read, quiz waiting", INK],
  RETAKE: ["Try the quiz again", RED],
  PASSED: ["Passed", MUTED],
};

function Row({ r, base, highlight }: { r: LearnRow; base: string; highlight?: boolean }) {
  const [text, colour] = LABEL[r.status];
  return (
    <Link
      href={`${base}/${encodeURIComponent(r.code)}`}
      style={{
        ...card, padding: 16, textDecoration: "none", display: "flex", gap: 12, alignItems: "center",
        borderLeft: `4px solid ${r.status === "PASSED" ? LINE : highlight ? ACCENT : SECOND}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: INK, fontWeight: 650, fontSize: 15.5 }}>{r.title}</div>
        <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2, lineHeight: 1.45 }}>{r.summary}</div>
      </div>
      <span style={{ color: colour, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{r.status === "PASSED" ? "Passed ✓" : text}</span>
    </Link>
  );
}

export default async function ArabellaLearn() {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  const base = `${site.pathPrefix}/learn`;

  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { canApproveClinical: true } });
  const [learn, waiting] = await Promise.all([
    arabellaLearn(session.clientId, session.sub),
    me?.canApproveClinical ? awaitingApproval(session.clientId) : Promise.resolve([]),
  ]);
  const toApprove = waiting.filter((w) => !w.sentBackAt).length;
  const leader = can(session, "VIEW_TEAM_NAMED");

  const thisWeekIds = new Set(learn.thisWeek.map((r) => r.id));
  // This week's first; if nothing opened this week, the oldest one not yet passed.
  const first = learn.thisWeek.length ? learn.thisWeek : learn.open.filter((r) => r.status !== "PASSED").slice(0, 1);
  const firstIds = new Set(first.map((r) => r.id));
  const rest = learn.open.filter((r) => !firstIds.has(r.id));
  const passed = learn.open.filter((r) => r.status === "PASSED").length;
  const week = planWeek();

  return (
    <StaffShell
      site={site}
      title="Training"
      lead="Arabella's own way of working, a short module at a time. Each takes about ten minutes on a phone: read it, then answer five or six questions. Four in five is a pass."
      back
    >
      {me?.canApproveClinical && toApprove > 0 && (
        <Link href={`${base}/approve`} style={{ ...card, display: "block", textDecoration: "none", background: "var(--staff-highlight)", borderColor: "transparent", marginBottom: 16 }}>
          <div style={{ color: INK, fontWeight: 700, fontSize: 16 }}>{toApprove} {toApprove === 1 ? "module waits" : "modules wait"} for your approval</div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>Staff see a module only after you approve it. Each takes a few minutes to check. Start &rsaquo;</div>
        </Link>
      )}

      {learn.open.length > 0 && (
        <p style={{ color: INK, fontWeight: 700, margin: "0 0 4px" }}>{passed} of {learn.open.length} passed</p>
      )}

      {first.length > 0 && (
        <Section eyebrow={thisWeekIds.size ? `Week ${week}` : "Next up"} title={thisWeekIds.size ? "This week's training" : "Your next module"}>
          <div style={{ display: "grid", gap: 10 }}>
            {first.map((r) => <Row key={r.id} r={r} base={base} highlight />)}
          </div>
        </Section>
      )}

      {rest.length > 0 && (
        <Section title="Your modules">
          <div style={{ display: "grid", gap: 10 }}>
            {rest.map((r) => <Row key={r.id} r={r} base={base} />)}
          </div>
        </Section>
      )}

      {learn.open.length === 0 && (
        <div style={{ ...card, marginTop: 8 }}>
          <div style={{ color: INK, fontWeight: 700, fontSize: 16 }}>Nothing to do yet</div>
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "6px 0 0" }}>
            {learn.nextOpens
              ? `Your first module opens on ${dayLabel(learn.nextOpens)}. It will be here when it does.`
              : "Your training will appear here once it is ready. You will be told when the first module opens."}
          </p>
        </div>
      )}

      {learn.later.length > 0 && learn.open.length > 0 && (
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, marginTop: 24 }}>
          {learn.later.length} more {learn.later.length === 1 ? "module" : "modules"} to come, a week or so apart.
          {learn.nextOpens ? ` The next opens on ${dayLabel(learn.nextOpens)}.` : ""}
        </p>
      )}

      {leader && (
        <p style={{ marginTop: 28 }}>
          <Link href={`${base}/team`} style={{ color: SECOND, fontWeight: 650, textDecoration: "none" }}>Who has passed what &rsaquo;</Link>
        </p>
      )}
    </StaffShell>
  );
}
