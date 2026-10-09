import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import DashboardView from "@/components/client-dashboard/DashboardView";
import type { DashboardData } from "@/lib/client-dashboard/types";
import PublishButtons from "./PublishButtons";

export const dynamic = "force-dynamic";

// Exactly what the client will see, with the publish control above it.

export default async function ClientDashboardPreview({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"].includes(session.user.role)) redirect("/dashboard");

  const { id } = await params;
  const d = await prisma.engagementDashboard.findUnique({
    where: { id },
    include: { engagement: { select: { name: true, client: { select: { name: true } } } } },
  });
  if (!d) notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title={`${d.engagement.client.name}: ${d.title}`} subtitle={`${d.status.toLowerCase()} · ${d.engagement.name}`} backHref="/admin/client-dashboards" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-4" style={{ background: d.status === "PUBLISHED" ? "#DCFCE7" : "#FEF3C7" }}>
            <p className="text-sm" style={{ color: "#1F2937" }}>
              {d.status === "PUBLISHED"
                ? `Live in the client portal since ${d.publishedAt?.toLocaleDateString("en-GB")}${d.publishedBy ? `, published by ${d.publishedBy}` : ""}.`
                : "Draft. The client cannot see this until it is published."}
              {d.source && <span className="block text-xs mt-0.5" style={{ color: "#6B7280" }}>Built by {d.source}</span>}
            </p>
            <PublishButtons id={d.id} status={d.status} />
          </div>
          <DashboardView data={d.data as unknown as DashboardData} asOf={d.asOf} />
        </div>
      </div>
    </div>
  );
}
