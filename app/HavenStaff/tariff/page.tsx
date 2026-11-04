import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession, can } from "@/lib/staffAuth";
import { TARIFF_LINES, NICU_DAY, allLines, ownsTariffFixes } from "@/lib/haven-tariff";
import TariffFixes from "@/components/haven/TariffFixes";

export const metadata: Metadata = { title: "Haven Paediatric Centre: tariff", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const LINE = "#E2E8F0";
const MUTED = "#64748b";
const RED = "#B0392B";
const C_HAVEN = "#2B6CB0";
const C_EV = "#D4882A";

const k = (v: number) => (v >= 1_000_000 ? `N${(v / 1_000_000).toFixed(2)}M` : `N${Math.round(v / 1000)}k`);

function Bars({ title, rows }: { title: string; rows: [string, number, number | null][] }) {
  const max = Math.max(...rows.flatMap(([, a, b]) => [a, b ?? 0]));
  const bar = (v: number, c: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ height: 9, width: `${(v / max) * 100}%`, minWidth: 2, background: c, borderRadius: 3 }} />
      <span style={{ fontSize: 12, color: "#1F2937", whiteSpace: "nowrap" }}>{k(v)}</span>
    </div>
  );
  return (
    <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, minWidth: 0 }}>
      <div style={{ color: NAVY, fontWeight: 700, fontSize: 15.5 }}>{title}</div>
      <div style={{ display: "flex", gap: 14, fontSize: 12, color: MUTED, margin: "8px 0 12px" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: C_HAVEN, borderRadius: 2, marginRight: 5 }} />Haven</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: C_EV, borderRadius: 2, marginRight: 5 }} />Evercare Lekki</span>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map(([name, h, e]) => (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "minmax(90px, 32%) 1fr", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#1F2937" }}>{name}</div>
            <div style={{ display: "grid", gap: 3, minWidth: 0 }}>
              {bar(h, C_HAVEN)}
              {e ? bar(e, C_EV) : <span style={{ fontSize: 11.5, color: MUTED }}>no Evercare line</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function TariffPage() {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  if (!can(session, "VIEW_FINANCIALS")) redirect("/HavenStaff");
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { position: true } });

  const fixes = await prisma.tariffFix.findMany({
    where: { clientId: session.clientId },
    include: { doneBy: { select: { name: true } } },
    orderBy: { code: "asc" },
  });
  const open = fixes.filter((f) => !f.doneAt).length;

  const all = allLines();
  const same = all.filter((l) => l[2] && l[1] === l[2]).length;
  const labs = TARIFF_LINES["Laboratory"].filter((l) => l[3]);
  const labsBelow = labs.filter((l) => l[3] && l[1] < l[3]).length;
  const fmt = (v: number | null) => (v === null ? "-" : v === 0 ? "0" : v.toLocaleString("en-GB"));

  const tiles: [string, string, string][] = [
    [`${same} of ${all.length}`, "lines on Ben's list are the current tariff, unchanged", NAVY],
    [`${all.length} of 2,413`, "tariff lines covered. 1,952 are still priced at zero", RED],
    [k(NICU_DAY.haven), `a NICU day on CPAP, against ${k(NICU_DAY.evercare)} at Evercare Lekki`, RED],
    [`${labsBelow} of ${labs.length}`, "laboratory tests priced below Evercare", "#1F7A8C"],
  ];

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          <h1 style={{ color: "#fff", fontSize: 30, margin: "10px 0 0" }}>The tariff against the market</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 700 }}>
            The service list Ben collated, against Haven&apos;s own tariff and Evercare Lekki&apos;s cash tariff (October 2026).
            {open > 0 ? ` ${open} fix${open === 1 ? "" : "es"} still open.` : " Every fix is done."}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px 72px", display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
          {tiles.map(([big, small, c]) => (
            <div key={small} style={{ background: "#EEF4F8", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: c, fontSize: 26, fontWeight: 700 }}>{big}</div>
              <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{small}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Bars
            title="NICU: about 2.4 times Evercare for a day on CPAP"
            rows={[["Accommodation", 300000, 168000], ["Nursing care", 150000, null], ["CPAP", 120000, 66000], ["Ventilator", 150000, 77000], ["Incubator", 75000, 51000], ["Phototherapy", 25000, 14000]]}
          />
          <Bars
            title="Procedures, rooms and labs: mostly below Evercare"
            rows={[["Circumcision", 50000, 158000], ["Private room", 50000, 135000], ["Ear syringing", 30000, 44000], ["Culture (MCS)", 22000, 38000], ["Malaria parasite", 5500, 14000], ["Skin prick test", 250000, 112000]]}
          />
        </div>

        <section>
          <h2 style={{ color: NAVY, fontSize: 21, margin: "0 0 10px" }}>Fixes before the list is used</h2>
          <TariffFixes
            canMark={ownsTariffFixes(session.tiers, me?.position ?? "")}
            fixes={fixes.map((f) => ({ id: f.id, code: f.code, title: f.title, detail: f.detail, doneAt: f.doneAt?.toISOString() ?? null, doneBy: f.doneBy?.name ?? null, doneNote: f.doneNote }))}
          />
          {fixes.length === 0 && <p style={{ color: MUTED }}>The fix list has not been loaded yet.</p>}
        </section>

        <details>
          <summary style={{ color: NAVY, fontWeight: 650, cursor: "pointer" }}>Every line, against every benchmark</summary>
          <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, marginTop: 10 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
              <thead>
                <tr style={{ color: MUTED, textAlign: "right" }}>
                  {["Service", "List", "Tariff", "Evercare", "Lagos median", "Abuja peer", "HMO A"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: i === 0 ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(TARIFF_LINES).flatMap(([group, rows]) => [
                  <tr key={group}><td colSpan={7} style={{ padding: "10px 10px 4px", color: NAVY, fontWeight: 700, borderTop: `1px solid ${LINE}` }}>{group}</td></tr>,
                  ...rows.map((r) => (
                    <tr key={group + r[0]} style={{ borderTop: `1px solid ${LINE}` }}>
                      <td style={{ padding: "6px 10px" }}>{r[0]} <span style={{ color: MUTED }}>{r[7]}</span></td>
                      {[r[1], r[2], r[3], r[4], r[5], r[6]].map((v, i) => (
                        <td key={i} style={{ padding: "6px 10px", textAlign: "right", fontWeight: i === 0 ? 650 : 400, color: i === 0 && r[3] && r[1] > r[3] * 1.5 ? RED : "#1F2937" }}>{fmt(v)}</td>
                      ))}
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
          <p style={{ color: MUTED, fontSize: 12.5 }}>
            Evercare: counter cash tariff, October 2026. Lagos median: 28 Lagos providers&apos; 2026 HMO tariffs. Abuja peer: a tertiary hospital&apos;s 2025
            private tariff. HMO A: a major HMO&apos;s 2025 tariff. Red: more than one and a half times Evercare.
          </p>
        </details>
      </div>
    </main>
  );
}
