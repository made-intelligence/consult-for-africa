import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import AdoptionList, { HAVEN_CLIENT_NAME } from "@/components/haven/AdoptionList";

export const dynamic = "force-dynamic";

// CONSULTANT is on this list on purpose: Dr Tanwa runs the engagement on the
// ground and the chase list is useless to her through somebody else's screen.
const HAVEN_ADOPTION_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR", "ENGAGEMENT_MANAGER", "CONSULTANT"];

export default async function HavenAdoptionPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!HAVEN_ADOPTION_ROLES.includes(session.user.role)) redirect("/");

  const client = await prisma.client.findFirst({ where: { name: HAVEN_CLIENT_NAME }, select: { id: true } });
  if (!client) return <div style={{ padding: 40 }}>No Haven client record.</div>;

  return (
    <>
      <TopBar title="Haven: who has started" />
      <AdoptionList clientId={client.id} />
    </>
  );
}
