export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Fuel, Zap, AlertTriangle, Wallet, Building2, ArrowRight, Wrench } from "lucide-react";
import { balancesForUnits, dieselSpendOverWindow, nairaShort, naira, duration } from "@/lib/estate/ledger";
import { daysOfCoverRemaining, needsTopUp, weightedAverageCost } from "@/lib/estate/diesel";
import { OPEN_STATUSES, isBreached, STATUS_TONE, PRIORITY_TONE, STATUS_LABELS } from "@/lib/estate/issues";
import { serviceStates } from "@/lib/estate/service";

const ALLOWED = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

/**
 * The estate, on one screen.
 *
 * Ordered by what can actually go wrong and how fast. A generator running right
 * now is spending money this second, so it is at the top. A deposit about to run
 * dry is tomorrow's angry phone call, so it is next. The totals come last,
 * because a total has never once needed acting on within the hour.
 */
export default async function EstateOverview() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED.includes(session.user.role)) redirect("/dashboard");

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const buildings = await prisma.estateBuilding.findMany({
    where: { active: true },
    orderBy: [{ area: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      area: true,
      litresPerHour: true,
      dieselPricePerLitre: true,
      dieselPricingMode: true,
      dieselLowBalanceNaira: true,
      dieselLowCoverDays: true,
      generatorLabel: true,
      units: { select: { id: true, label: true, status: true } },
      runs: {
        where: { status: "RUNNING" },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true, startedAt: true },
      },
    },
  });

  if (buildings.length === 0) return <Empty />;

  const unitIds = buildings.flatMap((b) => b.units.map((u) => u.id));
  const services = await serviceStates(buildings.map((b) => b.id));

  const [balances, monthFuel, openIssues, recentRuns, deliveries30] = await Promise.all([
    balancesForUnits(unitIds),
    prisma.estateGeneratorRun.groupBy({
      by: ["buildingId"],
      where: { status: "ALLOCATED", startedAt: { gte: monthStart } },
      _sum: { costNaira: true, litresUsed: true, runMinutes: true },
    }),
    prisma.estateIssue.findMany({
      where: { status: { in: OPEN_STATUSES } },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        reference: true,
        title: true,
        priority: true,
        status: true,
        createdAt: true,
        respondBy: true,
        resolveBy: true,
        acknowledgedAt: true,
        resolvedAt: true,
        unit: { select: { label: true } },
        building: { select: { name: true } },
      },
    }),
    prisma.estateGeneratorRun.findMany({
      where: { status: { in: ["STOPPED", "ALLOCATED"] } },
      orderBy: { startedAt: "desc" },
      take: 6,
      select: {
        id: true,
        startedAt: true,
        runMinutes: true,
        litresUsed: true,
        costNaira: true,
        building: { select: { name: true } },
      },
    }),
    prisma.estateDieselDelivery.findMany({
      where: { deliveredAt: { gte: since30 } },
      select: { buildingId: true, litres: true, pricePerLitre: true },
    }),
  ]);

  // Per-unit cover, so a heavy user about to run dry is visible even while the
  // naira balance still looks comfortable.
  const spend = new Map<string, number>();
  await Promise.all(
    unitIds.map(async (id) => spend.set(id, await dieselSpendOverWindow(id, 30))),
  );

  const lowUnits: Array<{ label: string; building: string; balance: number; reason: string }> = [];
  let dieselHeld = 0;
  let serviceOwed = 0;

  for (const b of buildings) {
    for (const u of b.units) {
      const bal = balances.get(u.id);
      if (!bal) continue;
      dieselHeld += bal.diesel;
      if (bal.serviceCharge < 0) serviceOwed += Math.abs(bal.serviceCharge);
      if (u.status !== "OCCUPIED") continue;

      const cover = daysOfCoverRemaining({
        balanceNaira: bal.diesel,
        spentNaira: spend.get(u.id) ?? 0,
        overDays: 30,
      });
      const t = needsTopUp({
        balanceNaira: bal.diesel,
        floorNaira: Number(b.dieselLowBalanceNaira),
        daysOfCover: cover,
        minDays: b.dieselLowCoverDays,
      });
      if (t.due) {
        lowUnits.push({ label: u.label, building: b.name, balance: bal.diesel, reason: t.reason ?? "" });
      }
    }
  }

  const fuelByBuilding = new Map(monthFuel.map((f) => [f.buildingId, f]));
  const deliveriesByBuilding = new Map<string, Array<{ litres: number; pricePerLitre: number }>>();
  for (const d of deliveries30) {
    const list = deliveriesByBuilding.get(d.buildingId) ?? [];
    list.push({ litres: Number(d.litres), pricePerLitre: Number(d.pricePerLitre) });
    deliveriesByBuilding.set(d.buildingId, list);
  }

  const running = buildings.filter((b) => b.runs.length > 0);
  const servicesDue = buildings
    .map((b) => services.get(b.id)!)
    .filter((s) => s.status !== "OK")
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  const breaches = openIssues.filter((i) => {
    const b = isBreached(i);
    return b.response || b.resolution;
  });
  const emergencies = openIssues.filter((i) => i.priority === "EMERGENCY");
  const monthTotal = monthFuel.reduce((s, f) => s + Number(f._sum.costNaira ?? 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F2744" }}>
            Estate
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {buildings.length} buildings · {unitIds.length} units
          </p>
        </div>
        <Link
          href="/founder/estate/people"
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-white"
          style={{ background: "#0F2744" }}
        >
          Tenants &amp; team
        </Link>
      </div>

      {/* ── Anything happening right now ── */}
      {(running.length > 0 || emergencies.length > 0 || servicesDue.length > 0) && (
        <div className="space-y-2">
          {running.map((b) => {
            const mins = Math.round((now.getTime() - b.runs[0].startedAt.getTime()) / 60000);
            const litres = (mins / 60) * Number(b.litresPerHour);
            return (
              <div
                key={b.id}
                className="rounded-xl p-3.5 flex items-center justify-between gap-3"
                style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Zap className="h-4 w-4 shrink-0" style={{ color: "#92400E" }} />
                  <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: "#92400E" }}>
                    {b.name} generator is running — {duration(mins)}, about {litres.toFixed(1)} litres so far
                  </p>
                </div>
                <span className="text-[10px] font-semibold shrink-0" style={{ color: "#92400E" }}>
                  {nairaShort(litres * Number(b.dieselPricePerLitre))}
                </span>
              </div>
            );
          })}
          {servicesDue.map((sv) => {
            const overdue = sv.status === "DUE" || sv.status === "OVERDUE";
            return (
              <Link
                key={sv.buildingId}
                href={`/founder/estate/buildings/${sv.buildingId}`}
                className="rounded-xl p-3.5 flex items-center gap-2.5 block"
                style={{
                  background: overdue ? "#FEE2E2" : "#FEF3C7",
                  border: `1px solid ${overdue ? "#FECACA" : "#FDE68A"}`,
                }}
              >
                <Wrench className="h-4 w-4 shrink-0" style={{ color: overdue ? "#991B1B" : "#92400E" }} />
                <p
                  className="text-xs sm:text-sm font-semibold"
                  style={{ color: overdue ? "#991B1B" : "#92400E" }}
                >
                  {sv.reading}
                </p>
              </Link>
            );
          })}
          {emergencies.map((i) => (
            <Link
              key={i.id}
              href="/founder/estate/issues"
              className="rounded-xl p-3.5 flex items-center gap-2.5 block"
              style={{ background: "#FEE2E2", border: "1px solid #FECACA" }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "#991B1B" }} />
              <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: "#991B1B" }}>
                Emergency · {i.building.name} {i.unit?.label ?? ""} — {i.title}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* ── Position ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card label="Diesel deposits held" value={nairaShort(dieselHeld)} accent="#0F2744" sub="Across all units" />
        <Card label="Fuel this month" value={nairaShort(monthTotal)} accent="#DC2626" sub="Allocated to units" />
        <Card
          label="Service charge owed"
          value={nairaShort(serviceOwed)}
          accent={serviceOwed > 0 ? "#D4AF37" : "#059669"}
          sub={serviceOwed > 0 ? "Arrears" : "All clear"}
        />
        <Card
          label="Open jobs"
          value={openIssues.length}
          accent={breaches.length > 0 ? "#DC2626" : "#0F2744"}
          sub={breaches.length > 0 ? `${breaches.length} past target` : "All within target"}
        />
      </div>

      {/* ── Deposits about to run out ── */}
      {lowUnits.length > 0 && (
        <Section title="Deposits running low" icon={<Wallet className="h-4 w-4" />}>
          <div className="rounded-xl bg-gray-50 p-4">
            {lowUnits.map((u) => (
              <div key={`${u.building}-${u.label}`} className="flex items-start justify-between gap-3 py-1.5 text-xs">
                <div className="min-w-0">
                  <span className="text-gray-700 font-semibold">
                    {u.building} {u.label}
                  </span>
                  <span className="block text-[10px] text-gray-400">{u.reason}</span>
                </div>
                <span
                  className="font-semibold shrink-0"
                  style={{ color: u.balance <= 0 ? "#DC2626" : "#0F2744" }}
                >
                  {naira(u.balance)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── The buildings ── */}
      <Section title="Buildings" icon={<Building2 className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
          {buildings.map((b) => {
            const fuel = fuelByBuilding.get(b.id);
            const wac = weightedAverageCost(deliveriesByBuilding.get(b.id) ?? []);
            const rate = Number(b.dieselPricePerLitre);
            const gap = wac === null ? null : wac - rate;
            const occupied = b.units.filter((u) => u.status === "OCCUPIED").length;

            return (
              <Link
                key={b.id}
                href={`/founder/estate/buildings/${b.id}`}
                className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm block hover:shadow-md transition-shadow"
                style={{ border: "1px solid #E8EBF0" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "#0F2744" }}>
                      {b.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {b.area.replace(/_/g, " ").toLowerCase()} · {occupied}/{b.units.length} let
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />
                </div>

                <div className="mt-3 space-y-1.5">
                  <Row label="Rate" value={`₦${rate.toLocaleString("en-NG")}/L`} />
                  <Row label="Burn" value={`${Number(b.litresPerHour)} L/hr`} />
                  <Row
                    label="This month"
                    value={fuel ? nairaShort(Number(fuel._sum.costNaira ?? 0)) : "—"}
                  />
                  <Row
                    label="Hours run"
                    value={fuel?._sum.runMinutes ? duration(fuel._sum.runMinutes) : "—"}
                  />
                  <Row
                    label="To service"
                    value={
                      services.get(b.id)!.hoursRemaining > 0
                        ? `${services.get(b.id)!.hoursRemaining}h`
                        : `${Math.abs(services.get(b.id)!.hoursRemaining)}h over`
                    }
                  />
                </div>

                {gap !== null && Math.abs(gap) >= 10 && (
                  <p
                    className="mt-3 text-[10px] font-semibold leading-snug"
                    style={{ color: gap > 0 ? "#DC2626" : "#059669" }}
                  >
                    {gap > 0
                      ? `Billing ₦${Math.round(gap).toLocaleString()}/L below what the fuel cost.`
                      : `Billing ₦${Math.round(-gap).toLocaleString()}/L above what the fuel cost.`}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ── Jobs ── */}
      <Section title="Open jobs" icon={<AlertTriangle className="h-4 w-4" />}>
        {openIssues.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm" style={{ border: "1px solid #E8EBF0" }}>
            <p className="text-sm text-gray-400">Nothing outstanding.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openIssues.slice(0, 8).map((i) => {
              const br = isBreached(i);
              const tone = STATUS_TONE[i.status];
              const pt = PRIORITY_TONE[i.priority];
              return (
                <Link
                  key={i.id}
                  href="/founder/estate/issues"
                  className="rounded-xl bg-white p-3.5 flex items-center justify-between gap-3 block"
                  style={{ border: "1px solid #E8EBF0" }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#0F2744" }}>
                      {i.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {i.building.name} {i.unit?.label ?? ""} · {i.reference}
                      {br.response ? " · no reply yet, past target" : br.resolution ? " · past fix target" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {i.priority !== "NORMAL" && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                        style={{ background: pt.bg, color: pt.color }}
                      >
                        {i.priority}
                      </span>
                    )}
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{ background: tone.bg, color: tone.color }}
                    >
                      {STATUS_LABELS[i.status]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Runs ── */}
      {recentRuns.length > 0 && (
        <Section title="Recent generator runs" icon={<Fuel className="h-4 w-4" />}>
          <div className="rounded-xl bg-gray-50 p-4">
            {recentRuns.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-gray-700">
                  {r.building.name} ·{" "}
                  {r.startedAt.toLocaleString("en-NG", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-400">{r.runMinutes ? duration(r.runMinutes) : "—"}</span>
                  <span className="font-semibold" style={{ color: "#0F2744" }}>
                    {r.costNaira ? nairaShort(Number(r.costNaira)) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-sm font-bold tracking-tight" style={{ color: "#0F2744" }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Card({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-3.5 sm:p-5 shadow-sm" style={{ border: "1px solid #E8EBF0" }}>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight" style={{ color: accent }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[9px] sm:text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold" style={{ color: "#0F2744" }}>
        {value}
      </span>
    </div>
  );
}

function Empty() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F2744" }}>
        Estate
      </h1>
      <div
        className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm"
        style={{ border: "1px solid #E8EBF0" }}
      >
        <p className="text-sm text-gray-500">No buildings set up yet.</p>
        <p className="text-xs text-gray-400 mt-2">
          Run <code className="rounded bg-gray-100 px-1.5 py-0.5">npx tsx scripts/seed-estate.ts</code> to
          create the three buildings and their units, then come back.
        </p>
      </div>
    </div>
  );
}
