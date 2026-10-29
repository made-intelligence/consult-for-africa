import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { gateTenant } from "@/lib/estate/gate";
import { balanceForUnit, dieselSpendOverWindow, naira, duration } from "@/lib/estate/ledger";
import { daysOfCoverRemaining, needsTopUp } from "@/lib/estate/diesel";
import { STATUS_LABELS, STATUS_TONE, CATEGORY_LABELS } from "@/lib/estate/issues";
import { INK, MOSS, BRASS, SAND, LINE, MUTED, DANGER, GOOD, card } from "@/lib/estate/theme";
import TenantActions from "./TenantActions";

export const dynamic = "force-dynamic";

/**
 * Noindex, and no referrer.
 *
 * The token is in the path, so a referrer header leaking to any third-party
 * asset would hand somebody's account to a stranger's access log. There are no
 * third-party assets on this page, and the header is turned off anyway.
 */
export const metadata: Metadata = {
  title: "Your residence",
  robots: { index: false, follow: false },
  other: { referrer: "no-referrer" },
};

export default async function TenantHome({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const gate = await gateTenant(token);
  if (!gate.ok) {
    if (gate.status === 404) notFound();
    return <Closed message={gate.error} />;
  }
  const ctx = gate.ctx;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [building, dieselBalance, serviceBalance, spend30, monthUsage, recent, issues, notices] =
    await Promise.all([
      prisma.estateBuilding.findUniqueOrThrow({
        where: { id: ctx.buildingId },
        select: {
          name: true,
          litresPerHour: true,
          dieselPricePerLitre: true,
          dieselLowBalanceNaira: true,
          dieselLowCoverDays: true,
          allocationNote: true,
          hasPool: true,
        },
      }),
      balanceForUnit(ctx.unitId, "DIESEL"),
      balanceForUnit(ctx.unitId, "SERVICE_CHARGE"),
      dieselSpendOverWindow(ctx.unitId, 30),
      prisma.estateLedgerEntry.aggregate({
        where: {
          unitId: ctx.unitId,
          account: "DIESEL",
          kind: "DIESEL_USAGE",
          occurredAt: { gte: monthStart },
        },
        _sum: { amount: true, litres: true },
      }),
      prisma.estateLedgerEntry.findMany({
        where: { unitId: ctx.unitId, account: "DIESEL" },
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
        take: 12,
        select: {
          id: true,
          occurredAt: true,
          kind: true,
          description: true,
          amount: true,
          litres: true,
          generatorRun: { select: { runMinutes: true } },
        },
      }),
      prisma.estateIssue.findMany({
        where: { tenantId: ctx.tenantId },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          reference: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          updates: {
            where: { visibleToTenant: true },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { body: true, authorName: true, createdAt: true, authorType: true },
          },
        },
      }),
      prisma.estateNotice.findMany({
        where: {
          OR: [{ buildingId: ctx.buildingId }, { buildingId: null }],
          AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] }],
        },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { id: true, title: true, body: true, urgent: true, publishedAt: true },
      }),
    ]);

  const cover = daysOfCoverRemaining({
    balanceNaira: dieselBalance,
    spentNaira: spend30,
    overDays: 30,
  });
  const topUp = needsTopUp({
    balanceNaira: dieselBalance,
    floorNaira: Number(building.dieselLowBalanceNaira),
    daysOfCover: cover,
    minDays: building.dieselLowCoverDays,
  });

  const monthCost = Math.abs(Number(monthUsage._sum.amount ?? 0));
  const monthLitres = Math.abs(Number(monthUsage._sum.litres ?? 0));

  return (
    <main style={{ background: SAND, minHeight: "100dvh", color: INK }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 72px" }}>
        <header style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: BRASS, margin: 0, fontWeight: 700 }}>
            {building.name}
          </p>
          <h1 style={{ fontSize: 26, margin: "6px 0 2px", letterSpacing: -0.4 }}>{ctx.unitLabel}</h1>
          <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Good to see you, {ctx.tenantName.split(" ")[0]}.</p>
        </header>

        {notices.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            {notices.map((n) => (
              <div
                key={n.id}
                style={{
                  ...card,
                  marginBottom: 8,
                  borderLeft: `3px solid ${n.urgent ? DANGER : BRASS}`,
                  background: n.urgent ? "#FFF6F6" : "#fff",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{n.title}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: MUTED, whiteSpace: "pre-wrap" }}>{n.body}</p>
              </div>
            ))}
          </section>
        )}

        {/* ── Diesel deposit ── */}
        <section style={{ ...card, marginBottom: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>
            Diesel deposit
          </p>
          <p
            style={{
              margin: "8px 0 2px",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: -1,
              color: dieselBalance <= 0 ? DANGER : INK,
            }}
          >
            {naira(dieselBalance)}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
            {cover === null
              ? "Not enough history yet to estimate how long this lasts."
              : `About ${cover} ${cover === 1 ? "day" : "days"} of cover at your recent rate.`}
          </p>

          {topUp.due && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background: "#FFF6F6",
                border: `1px solid #F0D5D5`,
              }}
            >
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: DANGER }}>Time to top up</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#7A3A3A" }}>{topUp.reason}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Stat label="This month" value={naira(monthCost)} sub={`${monthLitres.toFixed(1)} litres`} />
            <Stat
              label="Rate"
              value={`₦${Number(building.dieselPricePerLitre).toLocaleString("en-NG")}/L`}
              sub={`${Number(building.litresPerHour)} litres an hour`}
            />
          </div>

          {building.allocationNote && (
            <p style={{ margin: "14px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
              {building.allocationNote}
            </p>
          )}
        </section>

        {serviceBalance !== 0 && (
          <section style={{ ...card, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>
              Service charge account
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 700, color: serviceBalance < 0 ? DANGER : INK }}>
              {naira(serviceBalance)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
              {serviceBalance < 0 ? "Outstanding" : "In credit"}
            </p>
          </section>
        )}

        {/* ── Report something, and everything already reported ── */}
        <TenantActions token={token} issuesOpen={issues.length} hasPool={building.hasPool} />

        {issues.length > 0 && (
          <section style={{ marginTop: 12 }}>
            <SectionTitle>Your reports</SectionTitle>
            {issues.map((i) => {
              const tone = STATUS_TONE[i.status];
              const last = i.updates[0];
              return (
                <div key={i.id} style={{ ...card, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{i.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>
                        {CATEGORY_LABELS[i.category]} · {i.reference} ·{" "}
                        {new Date(i.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        borderRadius: 999,
                        padding: "3px 9px",
                        fontSize: 10,
                        fontWeight: 700,
                        background: tone.bg,
                        color: tone.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {STATUS_LABELS[i.status]}
                    </span>
                  </div>
                  {last?.body && last.authorType !== "TENANT" && (
                    <p style={{ margin: "8px 0 0", fontSize: 13, color: MOSS, borderLeft: `2px solid ${LINE}`, paddingLeft: 10 }}>
                      {last.authorName}: {last.body}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ── The arithmetic, shown rather than asserted ── */}
        {recent.length > 0 && (
          <section style={{ marginTop: 20 }}>
            <SectionTitle>Diesel account</SectionTitle>
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              {recent.map((r, idx) => {
                const amount = Number(r.amount);
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "11px 16px",
                      borderTop: idx === 0 ? "none" : `1px solid ${LINE}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13 }}>{r.description}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED }}>
                        {new Date(r.occurredAt).toLocaleString("en-NG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {r.generatorRun?.runMinutes ? ` · ran ${duration(r.generatorRun.runMinutes)}` : ""}
                        {r.litres !== null ? ` · your share ${Math.abs(Number(r.litres)).toFixed(2)} L` : ""}
                      </p>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        color: amount >= 0 ? GOOD : INK,
                      }}
                    >
                      {amount >= 0 ? "+" : "−"}
                      {naira(Math.abs(amount)).replace("₦", "₦")}
                    </p>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: MUTED, margin: "10px 2px 0", lineHeight: 1.6 }}>
              Every line is one generator run: the hours it ran, the litres that came to your flat, and what
              they cost at the rate in force that day. If a figure looks wrong, quote the date to the estate
              office.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 11,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: MUTED,
        fontWeight: 700,
        margin: "0 2px 8px",
      }}
    >
      {children}
    </h2>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ flex: 1, background: SAND, borderRadius: 10, padding: "10px 12px" }}>
      <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: MUTED, fontWeight: 700 }}>
        {label}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700 }}>{value}</p>
      <p style={{ margin: "1px 0 0", fontSize: 11, color: MUTED }}>{sub}</p>
    </div>
  );
}

function Closed({ message }: { message: string }) {
  return (
    <main
      style={{
        background: SAND,
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        color: INK,
      }}
    >
      <div style={{ ...card, maxWidth: 380, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 15 }}>{message}</p>
      </div>
    </main>
  );
}
