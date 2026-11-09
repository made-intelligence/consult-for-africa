import Link from "next/link";
import type { Onboarding } from "@/lib/arabellaOnboarding";

const LINE = "#E2E8F0";
const MUTED = "#64748b";

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" });
}

/**
 * The welcome and setup list on Dr Chito's (and Tolu's) front page. Server
 * rendered, no state of its own: each step reads as done once it is true.
 */
export default function GettingStarted({ data, firstName, prefix, principal }: { data: Onboarding; firstName: string; prefix: string; principal: boolean }) {
  const next = data.steps.find((s) => !s.done);
  const when =
    data.daysToGoLive === 0
      ? "The team's first week has started."
      : `The team starts on ${fmt(data.goLive)}, in ${data.daysToGoLive} ${data.daysToGoLive === 1 ? "day" : "days"}.`;

  return (
    <section style={{ marginTop: 16, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${LINE}`, background: "var(--staff-highlight, #FBF7FB)" }}>
        <div style={{ color: "var(--staff-second)", fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
          {principal ? `Welcome, ${firstName}` : "Getting the practice ready"}
        </div>
        <h2 style={{ color: "var(--staff-ink)", fontSize: 21, lineHeight: 1.25, margin: "6px 0 0" }}>
          {principal ? "Your practice, every day, without having to ask" : "Six things before the team starts"}
        </h2>
        <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: "8px 0 0" }}>
          {principal
            ? "This page shows you what is happening at Arabella each day, what is waiting on you, and how the team is getting on. Six things get it ready. Each one ticks itself once it is done."
            : "Each one ticks itself once it is done."}{" "}
          {when}
        </p>
        <div style={{ marginTop: 12, height: 6, background: "#EEF2F6", borderRadius: 99 }}>
          <div style={{ width: `${(data.doneCount / data.steps.length) * 100}%`, height: 6, background: "var(--staff-second)", borderRadius: 99 }} />
        </div>
        <div style={{ color: MUTED, fontSize: 12.5, marginTop: 6 }}>{data.doneCount} of {data.steps.length} done</div>
      </div>

      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {data.steps.map((s, i) => {
          const isNext = next?.code === s.code;
          return (
            <li key={s.code} style={{ display: "flex", gap: 14, padding: "14px 20px", borderTop: i ? `1px solid ${LINE}` : "none", background: isNext ? "#FFFDF6" : "transparent" }}>
              <div
                aria-hidden
                style={{
                  flex: "0 0 26px", height: 26, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700,
                  background: s.done ? "var(--staff-second)" : "#fff", color: s.done ? "#fff" : "var(--staff-ink)",
                  border: s.done ? "none" : `1.5px solid ${isNext ? "var(--staff-accent)" : LINE}`,
                }}
              >
                {s.done ? "✓" : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <div style={{ color: "var(--staff-ink)", fontWeight: 650, fontSize: 15.5, textDecoration: s.done ? "line-through" : "none", textDecorationColor: "#CBD5E1" }}>
                    {s.title}
                  </div>
                  {!s.done && (
                    <Link href={s.href} style={{ color: "var(--staff-ink)", fontWeight: 650, fontSize: 13.5, textDecoration: "none", border: `1px solid ${LINE}`, borderRadius: 99, padding: "5px 12px", whiteSpace: "nowrap" }}>
                      {s.action} &rsaquo;
                    </Link>
                  )}
                </div>
                {!s.done && <div style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.55, marginTop: 2 }}>{s.why}</div>}
                <div style={{ color: s.done ? "#166534" : "#92400E", fontSize: 12.5, marginTop: 4 }}>{s.status}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div style={{ padding: "12px 20px", borderTop: `1px solid ${LINE}`, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13.5 }}>
        <Link href={`${prefix}/plan`} style={{ color: "var(--staff-ink)", fontWeight: 650, textDecoration: "none" }}>What reaches the team, week by week &rsaquo;</Link>
        <Link href={`${prefix}/today`} style={{ color: "var(--staff-ink)", fontWeight: 650, textDecoration: "none" }}>Preview your daily view &rsaquo;</Link>
      </div>
    </section>
  );
}
