import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";

export const dynamic = "force-dynamic";

const STATUS = {
  PUBLISHED: { bg: "#DCFCE7", fg: "#166534", word: "Live" },
  DRAFT: { bg: "#FEF3C7", fg: "#92400E", word: "Draft" },
  ARCHIVED: { bg: "#F1F5F9", fg: "#64748b", word: "Superseded" },
} as const;

export default async function ClientDashboardsIndex() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"].includes(session.user.role)) redirect("/dashboard");

  const rows = await prisma.engagementDashboard.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, title: true, status: true, asOf: true, createdAt: true, publishedAt: true,
      engagement: { select: { name: true, client: { select: { name: true } } } },
    },
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Client dashboards" subtitle="Drafts to review, and what each client can see" backHref="/dashboard" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl" style={{ border: "1px solid #e5eaf0" }}>
          {rows.length === 0 && <p className="p-6 text-sm text-gray-500">No dashboards yet.</p>}
          <table className="w-full text-sm">
            <tbody>
              {rows.map((r) => {
                const s = STATUS[r.status];
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/client-dashboards/${r.id}`} className="font-semibold underline" style={{ color: "#0F2744" }}>
                        {r.engagement.client.name}: {r.title}
                      </Link>
                      <span className="block text-xs text-gray-500">{r.engagement.name}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: s.bg, color: s.fg }}>{s.word}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                      figures to {r.asOf.toLocaleDateString("en-GB")}
                      <span className="block">made {r.createdAt.toLocaleDateString("en-GB")}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
