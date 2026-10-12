import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { HAVEN_ENGAGEMENT_ID, HAVEN_START, WORKSTREAMS, workstreamLabel, uploadSectionLabel } from "@/lib/haven-delivery";
import { PLAN } from "@/lib/haven-plan";

export const dynamic = "force-dynamic";

const SURVEY = "haven-contact-register";
const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const MUTED = "#64748b";
const LINE = "#E2E8F0";

type Reg = {
  name: string;
  email: string;
  mobile: string;
  whatsapp: string;
  role: string;
  workstream: string;
  reportsTo: string;
  bestTime: string;
  note: string;
};

const dayIndex = () =>
  Math.floor((Date.now() - new Date(`${HAVEN_START}T00:00:00.000Z`).getTime()) / 86_400_000);

export default async function HavenDeliveryPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const allowed = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"].includes(session.user.role);
  if (!allowed) redirect("/dashboard");

  const [rows, uploads] = await Promise.all([
    prisma.auditSurveyResponse.findMany({
      where: { survey: SURVEY, engagementId: HAVEN_ENGAGEMENT_ID },
      orderBy: { createdAt: "asc" },
      select: { payload: true, createdAt: true },
    }),
    prisma.auditUpload.findMany({
      where: { engagement: "haven" },
      orderBy: { createdAt: "desc" },
      select: { id: true, section: true, filename: true, uploadedBy: true, sizeBytes: true, createdAt: true },
    }),
  ]);

  const regs = rows.map((r) => r.payload as unknown as Reg).filter((r) => r?.email);
  const bySeat = new Map<string, Reg[]>();
  for (const r of regs) bySeat.set(r.workstream, [...(bySeat.get(r.workstream) ?? []), r]);

  const day = Math.max(1, dayIndex() + 1);
  const mi = Math.min(PLAN.length - 1, Math.max(0, Math.floor(dayIndex() / 30)));
  const month = PLAN[mi];

  const seats = WORKSTREAMS.filter((w) => w.key !== "other");
  const withWorkThisMonth = new Set(month.tasks.map((t) => t.seat));
  const empty = seats.filter((w) => !bySeat.has(w.key) && withWorkThisMonth.has(w.key));

  return (
    <>
      <TopBar title="Haven delivery" />
      <main style={{ padding: "26px 22px 70px", maxWidth: 1080, margin: "0 auto", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
        <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
          Haven Paediatric Centre
        </div>
        <h1 style={{ color: NAVY, fontSize: 28, margin: "6px 0 4px" }}>The delivery register</h1>
        <p style={{ color: MUTED, fontSize: 15, margin: "0 0 22px" }}>
          Day {day} of 180. {month.title}: {month.theme}. Target {month.target}.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { n: regs.length, label: "registered" },
            { n: bySeat.size, label: "seats covered" },
            { n: empty.length, label: "seats with work and nobody in them", bad: empty.length > 0 },
            { n: uploads.length, label: "pieces of evidence up" },
          ].map((s) => (
            <div key={s.label} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 18px", minWidth: 150, background: "#fff" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.bad ? "#B91C1C" : NAVY }}>{s.n}</div>
              <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {empty.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <strong style={{ color: "#B91C1C", fontSize: 14.5 }}>Nobody is holding: </strong>
            <span style={{ color: "#7F1D1D", fontSize: 14.5 }}>{empty.map((e) => e.role).join(", ")}.</span>
            <div style={{ color: "#9a3f3f", fontSize: 13, marginTop: 5 }}>
              These seats have work in {month.title.replace(/ .*/, "").toLowerCase()} {mi + 1} and no one to send it to.
            </div>
          </div>
        )}

        <h2 style={{ color: NAVY, fontSize: 19, margin: "0 0 12px" }}>Who holds what</h2>
        <div style={{ display: "grid", gap: 10, marginBottom: 32 }}>
          {seats.map((w) => {
            const held = bySeat.get(w.key) ?? [];
            const tasks = month.tasks.filter((t) => t.seat === w.key).length;
            return (
              <div key={w.key} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", background: held.length ? "#fff" : "#fcfcfd" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong style={{ color: NAVY, fontSize: 15.5 }}>{w.role}</strong>
                  <span style={{ fontSize: 12.5, color: MUTED }}>
                    {tasks} item{tasks === 1 ? "" : "s"} this month
                  </span>
                </div>
                {held.length === 0 ? (
                  <div style={{ color: tasks ? "#B91C1C" : MUTED, fontSize: 13.5, marginTop: 6 }}>
                    {tasks ? "Nobody registered." : "Nobody registered, and nothing due this month."}
                  </div>
                ) : (
                  held.map((h) => (
                    <div key={h.email} style={{ fontSize: 13.5, color: "#334155", marginTop: 7, lineHeight: 1.55 }}>
                      <b>{h.name}</b>
                      {h.role ? `, ${h.role}` : ""} &middot; {h.email} &middot; {h.mobile}
                      {h.whatsapp && h.whatsapp !== h.mobile ? ` (WhatsApp ${h.whatsapp})` : ""}
                      {h.reportsTo ? ` &middot; reports to ${h.reportsTo}` : ""}
                      {h.bestTime ? <div style={{ color: MUTED, fontSize: 12.5 }}>Best reached: {h.bestTime}</div> : null}
                      {h.note ? <div style={{ color: MUTED, fontSize: 12.5 }}>{h.note}</div> : null}
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>

        <h2 style={{ color: NAVY, fontSize: 19, margin: "0 0 12px" }}>Evidence in</h2>
        {uploads.length === 0 ? (
          <p style={{ color: MUTED, fontSize: 14.5 }}>Nothing uploaded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {uploads.map((u) => (
              <div key={u.id} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "11px 14px", background: "#fff", fontSize: 13.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <a href={`/api/haven-delivery/upload/${u.id}`} style={{ color: NAVY, fontWeight: 700, textDecoration: "none" }}>
                    {u.filename}
                  </a>
                  <span style={{ color: MUTED, fontSize: 12.5 }}>{u.createdAt.toISOString().slice(0, 10)}</span>
                </div>
                <div style={{ color: MUTED, marginTop: 3 }}>
                  {uploadSectionLabel(u.section)}
                  {u.uploadedBy ? ` &middot; ${u.uploadedBy}` : ""} &middot; {Math.max(1, Math.round(u.sizeBytes / 1024))} KB
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ color: MUTED, fontSize: 12.5, marginTop: 30, lineHeight: 1.7 }}>
          Registrations also become ClientContact rows, so what we send is logged against the client.
          Portal access is never granted here: the portal session carries only clientId, so a contact
          with access would see every Haven invoice.
          <br />
          Seat definitions: {seats.map((s) => workstreamLabel(s.key)).join(", ")}.
        </p>
      </main>
    </>
  );
}
