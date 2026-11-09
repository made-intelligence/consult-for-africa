import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { ARABELLA_DAILY, seesDailyView } from "@/lib/arabella-daily";
import {
  addDays,
  findSection,
  isoDay,
  ownersFor,
  parseIsoDay,
  practiceDay,
  sectionStatus,
  type DailySection,
  type SectionStatus,
} from "@/lib/dailyReturn";
import StaffShell, { card, Section, INK, SECOND, MUTED, LINE } from "@/components/staff/StaffShell";
import DailyReturnForm from "@/components/arabella/DailyReturnForm";

export const dynamic = "force-dynamic";

const STATUS: Record<SectionStatus, { t: string; c: string }> = {
  IN: { t: "In", c: "#166534" },
  DUE: { t: "Due tonight", c: "#92400E" },
  MISSING: { t: "Missing", c: "#B0392B" },
  NOT_STARTED: { t: "Not started", c: "#94a3b8" },
};

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export default async function DailyEntryPage({ searchParams }: { searchParams: Promise<{ section?: string; day?: string }> }) {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  const sp = await searchParams;
  const config = ARABELLA_DAILY;
  const today = practiceDay(config);
  const yesterday = addDays(today, -1);
  const asked = parseIsoDay(sp.day);
  const day = asked && isoDay(asked) === isoDay(yesterday) ? yesterday : today;

  const [me, returns] = await Promise.all([
    prisma.staffMember.findUnique({ where: { id: session.sub }, select: { position: true, department: true } }),
    prisma.dailyReturn.findMany({
      where: { clientId: session.clientId, day },
      select: { section: true, values: true, note: true, enteredById: true, submittedAt: true, enteredBy: { select: { name: true } } },
    }),
  ]);
  const byCode = new Map(returns.map((r) => [r.section, r]));
  const seesMoney = seesDailyView(session.tiers);
  const isMine = (s: DailySection) => !!me && ownersFor(s, [me]).length > 0;

  const section = sp.section ? findSection(config, sp.section) : undefined;

  if (section) {
    const r = byCode.get(section.code);
    // Money already entered is shown back only to leadership or to whoever entered it.
    const showBack = !r || section.restricted !== "FINANCIAL" || seesMoney || r.enteredById === session.sub;
    const other = isoDay(day) === isoDay(today) ? yesterday : today;
    return (
      <StaffShell site={site} title={section.title} lead={section.asks} back>
        <Link href={`${site.pathPrefix}/daily?day=${isoDay(day)}`} style={{ color: SECOND, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>&lsaquo; All areas</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          <div style={{ color: INK, fontWeight: 700, fontSize: 17 }}>{fmtDay(day)}</div>
          <Link href={`${site.pathPrefix}/daily?section=${section.code}&day=${isoDay(other)}`} style={{ color: SECOND, fontSize: 14, textDecoration: "none" }}>
            {isoDay(other) === isoDay(yesterday) ? "Yesterday instead" : "Today instead"}
          </Link>
        </div>
        {r && (
          <p style={{ color: MUTED, fontSize: 14, margin: "6px 0 0" }}>
            Already in{r.enteredBy ? `, from ${r.enteredBy.name}` : ""}, at{" "}
            {r.submittedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })}. Saving again replaces it.
          </p>
        )}
        <div style={{ ...card, marginTop: 16 }}>
          <DailyReturnForm
            endpoint={`${site.apiPrefix}/daily`}
            section={section.code}
            day={isoDay(day)}
            metrics={section.metrics}
            values={showBack && r ? (r.values as Record<string, unknown>) : {}}
            note={showBack ? r?.note ?? null : null}
          />
        </div>
      </StaffShell>
    );
  }

  const sections = config.sections;
  const ordered = [...sections.filter(isMine), ...sections.filter((s) => !isMine(s))];
  return (
    <StaffShell site={site} title="Daily numbers" lead="Each area once a day, at the end of the day, by whoever runs it. About two minutes. A blank box means nobody counted, so leave it blank rather than guess." back>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[today, yesterday].map((d) => {
          const active = isoDay(d) === isoDay(day);
          return (
            <Link
              key={isoDay(d)}
              href={`${site.pathPrefix}/daily?day=${isoDay(d)}`}
              style={{ padding: "8px 14px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none", border: `1px solid ${active ? INK : LINE}`, background: active ? INK : "#fff", color: active ? "#fff" : INK }}
            >
              {d === today ? "Today" : "Yesterday"}
            </Link>
          );
        })}
      </div>
      <Section title={fmtDay(day)}>
        <div style={{ display: "grid", gap: 10 }}>
          {ordered.map((s) => {
            const st = STATUS[sectionStatus(config, s, day, byCode.has(s.code))];
            return (
              <Link
                key={s.code}
                href={`${site.pathPrefix}/daily?section=${s.code}&day=${isoDay(day)}`}
                style={{ ...card, padding: 16, textDecoration: "none", display: "flex", gap: 12, alignItems: "center", borderLeft: `4px solid ${isMine(s) ? SECOND : LINE}` }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: INK, fontWeight: 650, fontSize: 15.5 }}>
                    {s.number}. {s.title}
                    {isMine(s) && <span style={{ color: SECOND, fontWeight: 600, fontSize: 13 }}> · yours</span>}
                  </div>
                  <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2 }}>{s.ownerRoles.join(" or ")}</div>
                </div>
                <span style={{ color: st.c, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{st.t}</span>
              </Link>
            );
          })}
        </div>
      </Section>
    </StaffShell>
  );
}
