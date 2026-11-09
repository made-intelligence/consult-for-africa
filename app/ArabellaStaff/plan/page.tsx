import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { ARABELLA_PLAN, weekStart } from "@/lib/arabella-plan";
import { ARABELLA_DAILY, seesDailyView } from "@/lib/arabella-daily";
import { appliesTo } from "@/lib/havenLearn";
import StaffShell, { card, Section, INK, MUTED, SECOND } from "@/components/staff/StaffShell";

export const metadata: Metadata = { title: "Arabella Women's Health: the plan", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const THEMES: Record<number, string> = {
  1: "The day has a shape",
  2: "The day closes properly",
  3: "The services report themselves",
  4: "Safety is checked, not assumed",
  5: "Every visit ends with a next step",
  6: "The money cycle",
};

const CADENCE: Record<string, string> = { EVERY_SHIFT: "Every shift", DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly" };

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

// Leadership only. What reaches the team and when, so Dr Chito can see the
// whole plan without the team seeing it all at once.
export default async function ArabellaPlan() {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  if (!seesDailyView(session.tiers)) redirect(site.pathPrefix);

  const staff = await prisma.staffMember.findMany({
    where: { clientId: session.clientId, isActive: true, kind: { not: "TEST" } },
    select: { name: true, position: true, department: true },
  });

  const now = new Date();
  const weeks = Array.from(new Set(ARABELLA_PLAN.map((t) => t.week))).sort((a, b) => a - b);
  const areasFrom = (phaseDate: string | null) => (phaseDate ? new Date(`${phaseDate}T05:00:00Z`) : null);

  return (
    <StaffShell
      site={site}
      title="The plan, week by week"
      lead="A few things reach the team each week, so nobody gets the whole plan at once. Only leadership sees this page."
      back
    >
      <div style={{ display: "grid", gap: 14 }}>
        {weeks.map((w) => {
          const start = weekStart(w);
          const live = start <= now;
          const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
          const tasks = ARABELLA_PLAN.filter((t) => t.week === w);
          const areas = ARABELLA_DAILY.sections.filter((s) => {
            const d = areasFrom(ARABELLA_DAILY.phaseStarts[s.phase] ?? null);
            return d && Math.abs(d.getTime() - start.getTime()) < 86400000;
          });
          return (
            <section key={w} style={{ ...card, padding: 0, overflow: "hidden", borderLeft: `4px solid ${live ? SECOND : "#E2E8F0"}` }}>
              <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: SECOND, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>Week {w} · {fmt(start)}</div>
                  <div style={{ color: INK, fontWeight: 700, fontSize: 17, marginTop: 2 }}>{THEMES[w] ?? ""}</div>
                </div>
                <div style={{ fontSize: 12.5, color: live ? "#166534" : MUTED }}>{live ? "With the team now" : `Reaches the team in ${days} ${days === 1 ? "day" : "days"}`}</div>
              </div>
              {areas.length > 0 && (
                <div style={{ padding: "0 18px 10px", color: MUTED, fontSize: 13.5 }}>
                  Daily view areas switching on: {areas.map((a) => a.title).join(", ")}
                </div>
              )}
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {tasks.map((t) => {
                  const who = staff.filter((p) => appliesTo(t.roles, [], p.position, p.department));
                  return (
                    <li key={t.code} style={{ padding: "12px 18px", borderTop: "1px solid #E2E8F0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ color: INK, fontWeight: 650, fontSize: 15 }}>{t.title}</div>
                        <div style={{ color: MUTED, fontSize: 12.5 }}>{CADENCE[t.cadence]}</div>
                      </div>
                      <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.55, marginTop: 2 }}>{t.why}</div>
                      <div style={{ fontSize: 12.5, marginTop: 4, color: who.length ? "#334155" : "#B0392B" }}>
                        {who.length
                          ? `Reaches: ${who.map((p) => p.name).join(", ")}`
                          : `No one yet with the role: ${t.roles.join(" or ")}. Set a job title on The people page.`}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <Section title="After week six" lead="The rest of the toolkit follows the same way, a few things at a time, once the first six weeks are running. Training modules arrive alongside, each after you have approved it." />
    </StaffShell>
  );
}
