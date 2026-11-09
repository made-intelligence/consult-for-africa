import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { ARABELLA_DAILY, PRINCIPAL, canDecide, seesDailyView } from "@/lib/arabella-daily";
import {
  formatValue,
  headlineLabel,
  headlineType,
  headlineValue,
  isLive,
  isoDay,
  summarise,
  type SectionStatus,
} from "@/lib/dailyReturn";
import { ageLabel, loadDailyView, type DayCell, type SectionRow } from "@/lib/dailyView";
import StaffShell, { card, Section, INK, SECOND, MUTED, LINE } from "@/components/staff/StaffShell";
import { DecisionList } from "@/components/arabella/Decisions";

/**
 * What is happening at the practice, every day, on one page.
 *
 * Twelve areas, each entered once by the person who runs it. Today and
 * yesterday at the top, then what is waiting on her, then the last seven and
 * thirty days. A missing return is shown as a gap, not filled in. An area
 * whose phase has not started says so, so a gap always means something.
 */

export const metadata: Metadata = { title: "Arabella Women's Health: today", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS: Record<SectionStatus, { t: string; bg: string; fg: string }> = {
  IN: { t: "In", bg: "#DCFCE7", fg: "#166534" },
  DUE: { t: "Due tonight", bg: "#FEF3C7", fg: "#92400E" },
  MISSING: { t: "Missing", bg: "#FEE2E2", fg: "#B0392B" },
  NOT_STARTED: { t: "Not started", bg: "#F1F5F9", fg: "#94a3b8" },
};

const fmtDay = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const wd = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });

function Badge({ status }: { status: SectionStatus }) {
  const s = STATUS[status];
  return <span style={{ background: s.bg, color: s.fg, fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{s.t}</span>;
}

function Headlines({ row, cell }: { row: SectionRow; cell: DayCell }) {
  if (cell.status !== "IN") return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 6 }}>
      {row.section.headline.map((code) => (
        <span key={code} style={{ fontSize: 14, color: MUTED }}>
          {headlineLabel(row.section, code)}:{" "}
          <strong style={{ color: INK }}>{formatValue(headlineType(row.section, code), headlineValue(row.section, code, cell.values))}</strong>
        </span>
      ))}
    </div>
  );
}

export default async function ArabellaToday() {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  if (!seesDailyView(session.tiers)) redirect(site.pathPrefix);

  const config = ARABELLA_DAILY;
  const view = await loadDailyView(session.clientId, config, { canSeeFinancials: true });
  const tKey = isoDay(view.today);
  const yKey = isoDay(view.yesterday);
  const last7 = view.days.slice(-7);

  const live = view.rows.filter((r) => r.days[tKey].status !== "NOT_STARTED");
  const inToday = live.filter((r) => r.days[tKey].status === "IN").length;
  const missingYesterday = view.rows.filter((r) => r.days[yKey].status === "MISSING");

  return (
    <StaffShell site={site} title="Today at the practice" lead={fmtDay(view.today)} back width={980}>
      {live.length === 0 && (
        <div style={{ ...card, marginBottom: 14, borderLeft: `4px solid ${SECOND}` }}>
          <div style={{ color: INK, fontWeight: 700, fontSize: 16 }}>This is a preview. The numbers start with the team.</div>
          <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: "6px 0 0" }}>
            From the team&apos;s first week, each area below is filled in once a day by the person who does that work, at the step where it happens.
            You will see today against yesterday, anything not in, and 7 and 30 day trends. Areas switch on a few at a time, on the dates in the plan.
            Every morning at 7:30 you also get yesterday in one email.
          </p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {[
          ["Areas in today", `${inToday} of ${live.length}`],
          ["Missing yesterday", String(missingYesterday.length)],
          [`Waiting on ${PRINCIPAL}`, String(view.decisions.length)],
          ["Open reports", String(view.issues.length)],
        ].map(([k, v]) => (
          <div key={k} style={{ ...card, padding: "12px 14px" }}>
            <div style={{ color: SECOND, fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{k}</div>
            <div style={{ color: INK, fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>{v}</div>
          </div>
        ))}
      </div>
      {missingYesterday.length > 0 && (
        <p style={{ color: "#B0392B", fontSize: 14.5, margin: "12px 0 0" }}>
          Not in for yesterday: {missingYesterday.map((r) => r.section.title).join(", ")}.
        </p>
      )}

      <Section id="decisions" eyebrow="Waiting on you" title="Decisions and approvals" lead="Oldest first. Anything waiting three days or more is marked.">
        <DecisionList
          canDecide={canDecide(session.tiers)}
          rows={view.decisions.map((d) => ({
            id: d.id,
            title: d.title,
            detail: d.detail,
            raisedBy: d.raisedBy,
            age: ageLabel(d.ageDays),
            ageDays: d.ageDays,
            neededBy: d.neededBy ? fmtShort(d.neededBy) : null,
          }))}
        />
      </Section>

      <Section eyebrow="Today and yesterday" title="Every area" lead="Tap an area for every number and any note.">
        <div style={{ display: "grid", gap: 10 }}>
          {view.rows.map((row) => {
            const t = row.days[tKey];
            const y = row.days[yKey];
            const s = row.section;
            return (
              <details key={s.code} style={{ ...card, padding: 16 }}>
                <summary style={{ cursor: "pointer", listStyle: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <div style={{ color: INK, fontWeight: 700, fontSize: 16 }}>{s.number}. {s.title}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: MUTED }}>
                      Today <Badge status={t.status} /> Yesterday <Badge status={y.status} />
                    </div>
                  </div>
                  <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>
                    {row.owners.length ? row.owners.join(", ") : `${s.ownerRoles.join(" or ")} (not yet matched to a person)`}
                  </div>
                  <Headlines row={row} cell={t.status === "IN" ? t : y} />
                  {t.status !== "IN" && y.status === "IN" && <div style={{ color: MUTED, fontSize: 12.5, marginTop: 2 }}>Showing yesterday.</div>}
                </summary>
                <div style={{ overflowX: "auto", marginTop: 12 }}>
                  <table style={{ borderCollapse: "collapse", fontSize: 14, width: "100%" }}>
                    <thead>
                      <tr style={{ color: MUTED, textAlign: "left" }}>
                        <th style={{ padding: "4px 8px 4px 0", fontWeight: 600 }}></th>
                        <th style={{ padding: "4px 8px", fontWeight: 600 }}>Today</th>
                        <th style={{ padding: "4px 8px", fontWeight: 600 }}>Yesterday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...s.metrics.map((m) => ({ code: m.code, label: m.label })), ...(s.derived ?? []).map((d) => ({ code: d.code, label: d.label }))].map((m) => (
                        <tr key={m.code} style={{ borderTop: `1px solid ${LINE}` }}>
                          <td style={{ padding: "6px 8px 6px 0", color: INK }}>{m.label}</td>
                          {[t, y].map((c, i) => (
                            <td key={i} style={{ padding: "6px 8px", color: INK, fontWeight: 600 }}>
                              {c.status === "IN" ? formatValue(headlineType(s, m.code), headlineValue(s, m.code, c.values)) : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {[t, y].map((c, i) =>
                    c.note ? (
                      <p key={i} style={{ color: "#1F2937", fontSize: 14, lineHeight: 1.6, margin: "10px 0 0" }}>
                        <strong style={{ color: INK }}>{i === 0 ? "Today" : "Yesterday"}:</strong> {c.note}
                      </p>
                    ) : null
                  )}
                  {[t, y].some((c) => c.enteredBy) && (
                    <p style={{ color: MUTED, fontSize: 12.5, margin: "8px 0 0" }}>
                      {[t.enteredBy && `Today from ${t.enteredBy}`, y.enteredBy && `yesterday from ${y.enteredBy}`].filter(Boolean).join(", ")}.
                    </p>
                  )}
                  {s.live?.includes("ROTA") && (
                    <p style={{ color: MUTED, fontSize: 13.5, margin: "10px 0 0" }}>
                      On the rota today:{" "}
                      {view.rotaToday.length ? view.rotaToday.map((p) => `${p.name} (${p.code})`).join(", ") : "nobody, or the rota is not in yet"}.
                    </p>
                  )}
                  {s.live?.includes("SAFETY") && (
                    <p style={{ color: MUTED, fontSize: 13.5, margin: "10px 0 0" }}>Open reports: {view.issues.length}.</p>
                  )}
                  {s.live?.includes("DECISIONS") && (
                    <p style={{ color: MUTED, fontSize: 13.5, margin: "10px 0 0" }}>Decisions waiting: {view.decisions.length}.</p>
                  )}
                  <Link href={`${site.pathPrefix}/daily?section=${s.code}`} style={{ display: "inline-block", marginTop: 10, color: SECOND, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    Put in or correct today&apos;s numbers
                  </Link>
                </div>
              </details>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="The week" title="Last seven days" lead="The main numbers for each area. A dash is a day with no return; grey is an area not started yet.">
        <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 13.5, width: "100%" }}>
            <thead>
              <tr style={{ color: MUTED }}>
                <th style={{ textAlign: "left", padding: "8px 12px", minWidth: 200, position: "sticky", left: 0, background: "#fff", color: INK }}>Area</th>
                {last7.map((d) => (
                  <th key={d.getTime()} style={{ padding: "6px 8px", fontWeight: 600, minWidth: 64 }}>
                    {wd(d)}
                    <div style={{ fontWeight: 400 }}>{d.getUTCDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.rows.flatMap((row) =>
                row.section.headline.map((code, i) => (
                  <tr key={`${row.section.code}-${code}`} style={{ borderTop: `1px solid ${LINE}` }}>
                    <td style={{ padding: "6px 12px", position: "sticky", left: 0, background: "#fff" }}>
                      {i === 0 && <div style={{ color: INK, fontWeight: 700, fontSize: 13 }}>{row.section.number}. {row.section.title}</div>}
                      <div style={{ color: MUTED, fontSize: 12.5 }}>{headlineLabel(row.section, code)}</div>
                    </td>
                    {last7.map((d) => {
                      const c = row.days[isoDay(d)];
                      const v = c.status === "IN" ? formatValue(headlineType(row.section, code), headlineValue(row.section, code, c.values)) : null;
                      return (
                        <td
                          key={d.getTime()}
                          style={{
                            textAlign: "center",
                            padding: "6px 8px",
                            fontWeight: 600,
                            color: c.status === "MISSING" ? "#B0392B" : c.status === "NOT_STARTED" ? "#cbd5e1" : INK,
                            background: c.status === "NOT_STARTED" ? "#F8FAFC" : undefined,
                          }}
                        >
                          {v ?? (c.status === "MISSING" ? "-" : c.status === "DUE" ? "due" : "")}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="The month" title="Last thirty days" lead="Totals and daily averages from the days that came in, and how many days did.">
        <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 13.5, width: "100%" }}>
            <thead>
              <tr style={{ color: MUTED, textAlign: "left" }}>
                <th style={{ padding: "8px 12px", color: INK }}>Area</th>
                <th style={{ padding: "8px 12px" }}>Measure</th>
                <th style={{ padding: "8px 12px" }}>Total</th>
                <th style={{ padding: "8px 12px" }}>Daily average</th>
                <th style={{ padding: "8px 12px" }}>Days in</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.flatMap((row) => {
                const liveDays = view.days.filter((d) => isLive(config, row.section, d));
                const inDays = liveDays.map((d) => row.days[isoDay(d)]).filter((c) => c.status === "IN").map((c) => c.values);
                return row.section.headline.map((code, i) => {
                  const sum = summarise(row.section, code, inDays);
                  const type = headlineType(row.section, code);
                  return (
                    <tr key={`${row.section.code}-${code}`} style={{ borderTop: `1px solid ${LINE}` }}>
                      <td style={{ padding: "6px 12px", color: INK, fontWeight: 700, fontSize: 13 }}>{i === 0 ? `${row.section.number}. ${row.section.title}` : ""}</td>
                      <td style={{ padding: "6px 12px", color: MUTED }}>{headlineLabel(row.section, code)}</td>
                      <td style={{ padding: "6px 12px", color: INK, fontWeight: 600 }}>{sum.total === null ? "-" : formatValue(type, sum.total)}</td>
                      <td style={{ padding: "6px 12px", color: INK, fontWeight: 600 }}>{sum.average === null ? "-" : formatValue(type, sum.average)}</td>
                      <td style={{ padding: "6px 12px", color: MUTED }}>{liveDays.length ? `${sum.daysIn} of ${liveDays.length}` : "Not started"}</td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Open" title="Reports and flags" lead="Every report not yet closed, oldest first. They are investigated from the staff page.">
        {view.issues.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>Nothing open.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {view.issues.map((i) => (
              <div key={i.id} style={{ ...card, padding: 14, borderLeft: `4px solid ${i.severity === "HIGH" || i.ageDays > 14 ? "#B0392B" : SECOND}` }}>
                <div style={{ color: MUTED, fontSize: 12.5, fontWeight: 600 }}>
                  {i.kind === "NEAR_MISS" ? "Near miss or incident" : "Something broken"} · open {ageLabel(i.ageDays)}
                  {i.severity ? ` · ${i.severity.toLowerCase()}` : ""}
                </div>
                <div style={{ color: INK, fontSize: 15, marginTop: 4, lineHeight: 1.5 }}>{i.what}</div>
              </div>
            ))}
          </div>
        )}
        <p style={{ color: MUTED, fontSize: 14, margin: "12px 0 0" }}>
          {view.openFlags === 0 ? "No task flags open." : `${view.openFlags} task ${view.openFlags === 1 ? "flag" : "flags"} open.`}{" "}
          <Link href={`${site.pathPrefix}#safety`} style={{ color: SECOND, fontWeight: 600, textDecoration: "none" }}>The register</Link>
        </p>
      </Section>
    </StaffShell>
  );
}
