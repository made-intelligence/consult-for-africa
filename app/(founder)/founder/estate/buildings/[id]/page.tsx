export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Fuel, Gauge, Users, Wrench } from "lucide-react";
import { balancesForUnits, naira, nairaShort, duration } from "@/lib/estate/ledger";
import { checkConsumption, checkDelivery, weightedAverageCost } from "@/lib/estate/diesel";
import { serviceState } from "@/lib/estate/service";
import RateCard from "./RateCard";
import ServiceCard from "./ServiceCard";

const ALLOWED = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

/**
 * One building: what it charges, what it actually burned, and whether the two
 * agree.
 *
 * The reconciliation window is not a calendar month. It runs between the two
 * tank dips that bracket the most recent stretch of history, because a month
 * boundary that falls in the middle of a tank tells you nothing — the numbers
 * only tie when both ends of the window are a measurement.
 */
export default async function BuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED.includes(session.user.role)) redirect("/dashboard");

  const { id } = await params;
  const building = await prisma.estateBuilding.findUnique({
    where: { id },
    select: {
      id: true, name: true, slug: true, area: true, address: true,
      litresPerHour: true, dieselPricePerLitre: true, dieselPricingMode: true,
      dieselLowBalanceNaira: true, dieselLowCoverDays: true, allocationNote: true,
      generatorLabel: true, generatorKva: true, tankCapacityL: true,
      units: {
        orderBy: { label: "asc" },
        select: { id: true, label: true, status: true, dieselShare: true, bedrooms: true },
      },
    },
  });
  if (!building) notFound();

  const now = new Date();
  const since = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [dips, rateChanges, service, serviceHistory, engineers] = await Promise.all([
    prisma.estateTankReading.findMany({
      where: { buildingId: id, readAt: { gte: since } },
      orderBy: { readAt: "asc" },
      select: { id: true, readAt: true, litres: true },
    }),
    prisma.estateRateChange.findMany({
      where: { buildingId: id },
      orderBy: { effectiveAt: "desc" },
      take: 8,
      select: {
        id: true, field: true, oldValue: true, newValue: true,
        reason: true, effectiveAt: true,
        changedBy: { select: { name: true } },
      },
    }),
    serviceState(id),
    prisma.estateGeneratorService.findMany({
      where: { buildingId: id },
      orderBy: { servicedAt: "desc" },
      take: 6,
      select: {
        id: true, servicedAt: true, hoursAtService: true,
        performedBy: true, costNaira: true, workDone: true,
      },
    }),
    prisma.estateStaff.findMany({
      where: { active: true, role: "SERVICE_ENGINEER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const opening = dips[0] ?? null;
  const closing = dips.length > 1 ? dips[dips.length - 1] : null;

  const windowStart = opening?.readAt ?? since;
  const windowEnd = closing?.readAt ?? now;

  const [runAgg, deliveries, balances] = await Promise.all([
    prisma.estateGeneratorRun.aggregate({
      where: {
        buildingId: id,
        status: { in: ["STOPPED", "ALLOCATED"] },
        startedAt: { gte: windowStart, lte: windowEnd },
      },
      _sum: { runMinutes: true, litresUsed: true, costNaira: true },
      _count: true,
    }),
    prisma.estateDieselDelivery.findMany({
      where: { buildingId: id, deliveredAt: { gte: since } },
      orderBy: { deliveredAt: "desc" },
      take: 10,
      select: {
        id: true, deliveredAt: true, litres: true, pricePerLitre: true, totalNaira: true,
        supplier: true, waybillRef: true, tankBeforeL: true, tankAfterL: true,
      },
    }),
    balancesForUnits(building.units.map((u) => u.id)),
  ]);

  const inWindow = deliveries.filter(
    (d) => d.deliveredAt >= windowStart && d.deliveredAt <= windowEnd,
  );
  const deliveredLitres = inWindow.reduce((s, d) => s + Number(d.litres), 0);

  const consumption =
    opening && closing
      ? checkConsumption({
          loggedMinutes: runAgg._sum.runMinutes ?? 0,
          litresPerHour: Number(building.litresPerHour),
          openingDipL: Number(opening.litres),
          closingDipL: Number(closing.litres),
          deliveredLitres,
          pricePerLitre: Number(building.dieselPricePerLitre),
        })
      : null;

  const wac = weightedAverageCost(
    deliveries.map((d) => ({ litres: Number(d.litres), pricePerLitre: Number(d.pricePerLitre) })),
  );

  const totalShare = building.units
    .filter((u) => u.status !== "OUT_OF_SERVICE")
    .reduce((s, u) => s + Number(u.dieselShare), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
      <div>
        <Link
          href="/founder/estate"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Estate
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F2744" }}>
          {building.name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{building.address}</p>
      </div>

      {/* ── Reconciliation, first because it is the thing that decides whether
           the rate below is honest ── */}
      <Section title="Does the tank agree with the log?" icon={<Gauge className="h-4 w-4" />}>
        {!consumption ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm" style={{ border: "1px solid #E8EBF0" }}>
            <p className="text-sm text-gray-500">Not enough tank dips yet.</p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto">
              Two dips are needed to bracket a window. Ask the ground team to dip the tank at the start
              and end of each week — it is the only number here that nobody has an interest in.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl bg-white p-5 shadow-sm"
            style={{
              border: "1px solid #E8EBF0",
              borderLeft: `3px solid ${verdictColour(consumption.verdict)}`,
            }}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <Mini label="Billed for" value={`${consumption.theoreticalLitres} L`} />
              <Mini label="Left the tank" value={`${consumption.physicalDrawLitres} L`} />
              <Mini
                label="Gap"
                value={`${consumption.varianceLitres! > 0 ? "+" : ""}${consumption.varianceLitres} L`}
                accent={verdictColour(consumption.verdict)}
              />
              <Mini
                label="Worth"
                value={nairaShort(Math.abs(consumption.varianceNaira ?? 0))}
                accent={verdictColour(consumption.verdict)}
              />
            </div>
            <p className="mt-4 text-xs text-gray-600 leading-relaxed">{consumption.reading}</p>
            <p className="mt-2 text-[10px] text-gray-400">
              {runAgg._count} runs, {duration(runAgg._sum.runMinutes ?? 0)} between{" "}
              {windowStart.toLocaleDateString("en-NG", { day: "numeric", month: "short" })} and{" "}
              {windowEnd.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}, with{" "}
              {deliveredLitres.toLocaleString()} L delivered in between.
            </p>
          </div>
        )}
      </Section>

      {/* ── Service clock ── */}
      <Section title="Generator service" icon={<Wrench className="h-4 w-4" />}>
        <ServiceCard
          buildingId={building.id}
          state={{
            intervalHours: service.intervalHours,
            hoursSinceService: service.hoursSinceService,
            hoursRemaining: service.hoursRemaining,
            status: service.status,
            lastServicedAt: service.lastServicedAt?.toISOString() ?? null,
            lastServicedBy: service.lastServicedBy,
            everServiced: service.everServiced,
            reading: service.reading,
          }}
          engineers={engineers.map((e) => ({ id: e.id, name: e.name, hasEmail: !!e.email }))}
          history={serviceHistory.map((h) => ({
            id: h.id,
            servicedAt: h.servicedAt.toISOString(),
            hoursAtService: Number(h.hoursAtService),
            performedBy: h.performedBy,
            costNaira: h.costNaira === null ? null : Number(h.costNaira),
            workDone: h.workDone,
          }))}
        />
      </Section>

      {/* ── Rate card ── */}
      <Section title="Rate card" icon={<Fuel className="h-4 w-4" />}>
        <RateCard
          building={{
            id: building.id,
            litresPerHour: Number(building.litresPerHour),
            dieselPricePerLitre: Number(building.dieselPricePerLitre),
            dieselPricingMode: building.dieselPricingMode,
            dieselLowBalanceNaira: Number(building.dieselLowBalanceNaira),
            dieselLowCoverDays: building.dieselLowCoverDays,
            allocationNote: building.allocationNote,
          }}
          weightedAverage={wac}
          impliedLitresPerHour={consumption?.impliedLitresPerHour ?? null}
        />
        {rateChanges.length > 0 && (
          <div className="mt-3 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Rate history</p>
            {rateChanges.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 py-1.5 text-[11px]">
                <div className="min-w-0">
                  <span className="text-gray-700">
                    {c.field === "dieselPricePerLitre" ? "Price per litre" : "Litres per hour"}{" "}
                    {Number(c.oldValue).toLocaleString()} → {Number(c.newValue).toLocaleString()}
                  </span>
                  {c.reason && <span className="block text-gray-400">{c.reason}</span>}
                </div>
                <span className="text-gray-400 shrink-0">
                  {c.changedBy?.name?.split(" ")[0] ?? "—"},{" "}
                  {c.effectiveAt.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Units ── */}
      <Section title="Units" icon={<Users className="h-4 w-4" />}>
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #E8EBF0" }}>
          {building.units.map((u, idx) => {
            const bal = balances.get(u.id);
            const pct =
              u.status === "OUT_OF_SERVICE" || totalShare === 0
                ? null
                : (Number(u.dieselShare) / totalShare) * 100;
            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={{ borderTop: idx === 0 ? "none" : "1px solid #E8EBF0" }}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "#0F2744" }}>
                    {u.label}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {u.status.replace(/_/g, " ").toLowerCase()}
                    {pct !== null ? ` · ${pct.toFixed(1)}% of each run` : " · not in the split"}
                    {u.status !== "OCCUPIED" && pct !== null ? " (carried by the landlord)" : ""}
                  </p>
                </div>
                <p
                  className="text-xs font-bold shrink-0"
                  style={{ color: (bal?.diesel ?? 0) <= 0 ? "#DC2626" : "#0F2744" }}
                >
                  {naira(bal?.diesel ?? 0)}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Deliveries ── */}
      {deliveries.length > 0 && (
        <Section title="Deliveries" icon={<Fuel className="h-4 w-4" />}>
          <div className="space-y-2">
            {deliveries.map((d) => {
              const check = checkDelivery({
                waybillLitres: Number(d.litres),
                tankBeforeL: d.tankBeforeL === null ? null : Number(d.tankBeforeL),
                tankAfterL: d.tankAfterL === null ? null : Number(d.tankAfterL),
                pricePerLitre: Number(d.pricePerLitre),
              });
              return (
                <div
                  key={d.id}
                  className="rounded-xl bg-white p-3.5 flex items-center justify-between gap-3"
                  style={{
                    border: "1px solid #E8EBF0",
                    borderLeft:
                      check.verdict === "INVESTIGATE" ? "3px solid #DC2626" : "1px solid #E8EBF0",
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "#0F2744" }}>
                      {Number(d.litres).toLocaleString()} L at ₦
                      {Number(d.pricePerLitre).toLocaleString()}/L
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {d.deliveredAt.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                      {d.supplier ? ` · ${d.supplier}` : ""}
                      {d.waybillRef ? ` · ${d.waybillRef}` : ""}
                      {check.verdict === "NO_DATA"
                        ? " · not dipped"
                        : ` · tank rose ${check.dipRiseLitres} L`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{ color: "#0F2744" }}>
                      {nairaShort(Number(d.totalNaira))}
                    </p>
                    {check.verdict === "INVESTIGATE" && (
                      <p className="text-[9px] font-semibold" style={{ color: "#DC2626" }}>
                        {check.shortfallLitres} L short
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function verdictColour(v: string): string {
  return v === "OK" ? "#059669" : v === "WATCH" ? "#D4AF37" : v === "NO_DATA" ? "#9CA3AF" : "#DC2626";
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

function Mini({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-base font-bold tracking-tight" style={{ color: accent ?? "#0F2744" }}>
        {value}
      </p>
    </div>
  );
}
