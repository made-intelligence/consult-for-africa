export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { OPEN_STATUSES } from "@/lib/estate/issues";
import IssueBoard from "./IssueBoard";

const ALLOWED = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

export default async function EstateIssues({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED.includes(session.user.role)) redirect("/dashboard");

  const { show } = await searchParams;
  const closed = show === "all";

  const [issues, staff] = await Promise.all([
    prisma.estateIssue.findMany({
      where: closed ? {} : { status: { in: OPEN_STATUSES } },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      take: closed ? 100 : 60,
      select: {
        id: true, reference: true, title: true, description: true,
        category: true, priority: true, status: true, photoKeys: true,
        createdAt: true, acknowledgedAt: true, respondBy: true, resolveBy: true,
        resolvedAt: true, resolutionNote: true, costNaira: true,
        building: { select: { name: true } },
        unit: { select: { label: true } },
        tenant: { select: { name: true, phone: true } },
        assignedStaff: { select: { id: true, name: true } },
        updates: {
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true, authorType: true, authorName: true, body: true,
            photoKeys: true, statusTo: true, visibleToTenant: true, createdAt: true,
          },
        },
      },
    }),
    prisma.estateStaff.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/founder/estate"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Estate
          </Link>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F2744" }}>
            Jobs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {closed ? "Everything, including closed" : `${issues.length} outstanding`}
          </p>
        </div>
        <Link
          href={closed ? "/founder/estate/issues" : "/founder/estate/issues?show=all"}
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ border: "1px solid #E8EBF0", color: "#0F2744" }}
        >
          {closed ? "Open only" : "Show all"}
        </Link>
      </div>

      <IssueBoard
        issues={issues.map((i) => ({
          id: i.id,
          reference: i.reference,
          title: i.title,
          description: i.description,
          category: i.category,
          priority: i.priority,
          status: i.status,
          photoKeys: i.photoKeys,
          createdAt: i.createdAt.toISOString(),
          acknowledgedAt: i.acknowledgedAt?.toISOString() ?? null,
          respondBy: i.respondBy?.toISOString() ?? null,
          resolveBy: i.resolveBy?.toISOString() ?? null,
          resolvedAt: i.resolvedAt?.toISOString() ?? null,
          resolutionNote: i.resolutionNote,
          costNaira: i.costNaira === null ? null : Number(i.costNaira),
          building: i.building.name,
          unit: i.unit?.label ?? null,
          tenant: i.tenant?.name ?? null,
          tenantPhone: i.tenant?.phone ?? null,
          assignedStaffId: i.assignedStaff?.id ?? null,
          assignedStaffName: i.assignedStaff?.name ?? null,
          updates: i.updates.map((u) => ({
            id: u.id,
            authorType: u.authorType,
            authorName: u.authorName,
            body: u.body,
            photoKeys: u.photoKeys,
            statusTo: u.statusTo,
            visibleToTenant: u.visibleToTenant,
            createdAt: u.createdAt.toISOString(),
          })),
        }))}
        staff={staff}
      />
    </div>
  );
}
