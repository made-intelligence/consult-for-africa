export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { balancesForUnits } from "@/lib/estate/ledger";
import { areaLabel } from "@/lib/estate/gate";
import PeopleClient from "./PeopleClient";

const ALLOWED = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

/**
 * Who lives here, who works here, and the links that let them in.
 *
 * The links are the whole access-control surface for this section, so they are
 * shown together on one page rather than buried in each person's record. Being
 * able to see at a glance which links are live is the thing that makes rotating
 * one a habit rather than a project.
 */
export default async function EstatePeople() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED.includes(session.user.role)) redirect("/dashboard");

  const [buildings, staff] = await Promise.all([
    prisma.estateBuilding.findMany({
      where: { active: true },
      orderBy: [{ area: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        area: true,
        units: {
          orderBy: { label: "asc" },
          select: {
            id: true,
            label: true,
            status: true,
            dieselShare: true,
            bedrooms: true,
            tenants: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                active: true,
                accessToken: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.estateStaff.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        role: true,
        phone: true,
        active: true,
        accessToken: true,
        pinHash: true,
        lastSeenAt: true,
        area: true,
        building: { select: { id: true, name: true } },
      },
    }),
  ]);

  const unitIds = buildings.flatMap((b) => b.units.map((u) => u.id));
  const balances = await balancesForUnits(unitIds);

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
          Tenants &amp; team
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Each person gets one link. The link is the credential — rotate it to lock somebody out.
        </p>
      </div>

      <PeopleClient
        buildings={buildings.map((b) => ({
          id: b.id,
          name: b.name,
          area: b.area,
          units: b.units.map((u) => ({
            id: u.id,
            label: u.label,
            status: u.status,
            bedrooms: u.bedrooms,
            dieselShare: Number(u.dieselShare),
            dieselBalance: balances.get(u.id)?.diesel ?? 0,
            serviceBalance: balances.get(u.id)?.serviceCharge ?? 0,
            tenants: u.tenants.map((t) => ({
              id: t.id,
              name: t.name,
              email: t.email,
              phone: t.phone,
              active: t.active,
              accessToken: t.accessToken,
              lastSeenAt: t.lastSeenAt ? t.lastSeenAt.toISOString() : null,
            })),
          })),
        }))}
        staff={staff.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          phone: s.phone,
          active: s.active,
          accessToken: s.accessToken,
          hasPin: !!s.pinHash,
          scope: s.building?.name ?? (s.area ? areaLabel(s.area) : "All buildings"),
          lastSeenAt: s.lastSeenAt ? s.lastSeenAt.toISOString() : null,
        }))}
      />
    </div>
  );
}
