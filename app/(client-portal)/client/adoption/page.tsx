import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientPortalSession } from "@/lib/clientPortalAuth";
import ClientPortalLogoutButton from "@/components/client-portal/LogoutButton";
import AdoptionList, { HAVEN_CLIENT_NAME } from "@/components/haven/AdoptionList";

export const dynamic = "force-dynamic";

// Haven's leadership sees the same chase list we do. Every other client gets
// sent home: the page only means something where the staff app is running.

export default async function ClientAdoptionPage() {
  const session = await getClientPortalSession();
  if (!session) redirect("/client/login");

  const client = await prisma.client.findUnique({ where: { id: session.clientId }, select: { name: true } });
  if (client?.name !== HAVEN_CLIENT_NAME) redirect("/client/dashboard");

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFB" }}>
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: "1px solid #e5eaf0" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cfa.png" alt="C4A" style={{ height: 28, width: "auto" }} />
            <Link href="/client/dashboard" className="text-sm text-gray-500 hover:text-gray-800">Client Portal</Link>
            <span className="text-gray-300 text-sm">/</span>
            <span className="text-sm font-medium" style={{ color: "#0F2744" }}>Staff app</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{session.name}</span>
            <ClientPortalLogoutButton />
          </div>
        </div>
      </header>
      <AdoptionList clientId={session.clientId} />
    </div>
  );
}
