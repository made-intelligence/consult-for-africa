import { prisma } from "@/lib/prisma";
import { getClientPortalSession } from "@/lib/clientPortalAuth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ClientPortalLogoutButton from "@/components/client-portal/LogoutButton";
import ClientProjectNav from "@/components/client-portal/ClientProjectNav";
import DashboardView from "@/components/client-dashboard/DashboardView";
import type { DashboardData } from "@/lib/client-dashboard/types";

// The client's own numbers, as CFA has read them. Only a PUBLISHED version is
// ever shown here: drafts stay on /admin/client-dashboards until a partner has
// read them, because the portal shows this to every enabled contact.

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getClientPortalSession();
  if (!session) redirect("/client/login");

  const { id } = await params;
  const project = await prisma.engagement.findUnique({
    where: { id },
    select: { id: true, name: true, clientId: true },
  });
  if (!project) notFound();
  if (project.clientId !== session.clientId) redirect("/client/dashboard");

  const dashboard = await prisma.engagementDashboard.findFirst({
    where: { engagementId: id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { title: true, asOf: true, data: true },
  });

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFB" }}>
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: "1px solid #e5eaf0" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cfa.png" alt="C4A" style={{ height: 28, width: "auto" }} />
            <span className="text-sm font-semibold hidden sm:inline" style={{ color: "#0F2744" }}>Client Portal</span>
            <span className="text-gray-300 text-sm">/</span>
            <Link href={`/client/projects/${id}`} className="text-sm text-gray-500 hover:text-gray-800 truncate max-w-[140px]">
              {project.name}
            </Link>
            <span className="text-gray-300 text-sm">/</span>
            <span className="text-sm font-medium" style={{ color: "#0F2744" }}>Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{session.name}</span>
            <ClientPortalLogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <ClientProjectNav projectId={id} current="/dashboard" />
        {dashboard ? (
          <>
            <h1 className="text-2xl font-bold" style={{ color: "#0F2744" }}>{dashboard.title}</h1>
            <DashboardView data={dashboard.data as unknown as DashboardData} asOf={dashboard.asOf} />
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid #e5eaf0" }}>
            <p className="text-base font-semibold" style={{ color: "#0F2744" }}>Your dashboard is being prepared</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              As your records come in we turn them into figures here: what the business earns, where it
              comes from, and what has changed. You will see it as soon as the first version is ready.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
