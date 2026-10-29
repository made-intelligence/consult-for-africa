import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getClientPortalSession } from "@/lib/clientPortalAuth";
import ClientPortalLogoutButton from "@/components/client-portal/LogoutButton";
import TeamClient from "./TeamClient";

export const dynamic = "force-dynamic";

// Who on the client can see the portal. The main contact decides; we are told
// each time access changes.

export default async function ClientTeamPage() {
  const session = await getClientPortalSession();
  if (!session) redirect("/client/login");

  const [me, contacts] = await Promise.all([
    prisma.clientContact.findUnique({ where: { id: session.sub }, select: { isPrimary: true, client: { select: { name: true } } } }),
    prisma.clientContact.findMany({
      where: { clientId: session.clientId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      select: { id: true, name: true, email: true, title: true, isPortalEnabled: true, passwordHash: true, lastLoginAt: true },
    }),
  ]);
  if (!me) redirect("/client/login");

  const members = contacts.map((c) => ({
    id: c.id, name: c.name, email: c.email, title: c.title, isPortalEnabled: c.isPortalEnabled,
    invited: Boolean(c.passwordHash), lastLoginAt: c.lastLoginAt?.toISOString() ?? null, isMe: c.id === session.sub,
  }));

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFB" }}>
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: "1px solid #e5eaf0" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-cfa.png" alt="C4A" style={{ height: 28, width: "auto" }} />
            <Link href="/client/dashboard" className="text-sm text-gray-500 hover:text-gray-800">Client Portal</Link>
            <span className="text-gray-300 text-sm">/</span>
            <span className="text-sm font-medium" style={{ color: "#0F2744" }}>Team</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{session.name}</span>
            <ClientPortalLogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0F2744" }}>Your team</h1>
          <p className="text-sm text-gray-500 mt-1">Who at {me.client.name} can sign in to this portal.</p>
        </div>
        <TeamClient members={members} canManage={me.isPrimary} />
      </main>
    </div>
  );
}
