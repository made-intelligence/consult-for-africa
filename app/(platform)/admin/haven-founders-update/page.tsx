import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import FounderUpdateForm from "@/components/haven/FounderUpdateForm";
import { composeUpdate, havenFounders } from "@/lib/havenFounderUpdate";

export const dynamic = "force-dynamic";

// Dr Tanwa can see the draft and tell Debo what to add; sending is Debo's
// office, because it goes out in his name to the owners.
const VIEWERS = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR", "CONSULTANT"];
const SENDERS = ["PARTNER", "ADMIN"];

export default async function HavenFoundersUpdatePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!VIEWERS.includes(session.user.role)) redirect("/");

  const [u, { clientId, founders }] = await Promise.all([composeUpdate(), havenFounders()]);
  const last = await prisma.communication.findFirst({
    where: { clientId, tags: { has: "haven-founders-weekly" }, status: "SENT" },
    orderBy: { sentAt: "desc" },
    select: { sentAt: true, tags: true },
  });
  const sentThisWeek = !!last?.tags.includes(`week:${u.week}`);

  return (
    <>
      <TopBar title="Haven: founders' weekly update" />
      <FounderUpdateForm
        update={u}
        founders={founders.map((f) => ({ name: f.name, salutation: f.salutation }))}
        canSend={SENDERS.includes(session.user.role)}
        sentThisWeek={sentThisWeek}
        lastSent={last?.sentAt?.toISOString() ?? null}
      />
    </>
  );
}
