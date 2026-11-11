import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { SPRINT_ADMIN_ROLES, fmtDay } from "@/lib/outreach";

export const dynamic = "force-dynamic";

/** The sprints you are on. With one, it goes straight to your queue. */
export default async function SprintsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const admin = SPRINT_ADMIN_ROLES.includes(session.user.role);
  const sprints = await prisma.outreachSprint.findMany({
    where: { active: true, ...(admin ? {} : { members: { some: { userId: session.user.id } } }) },
    orderBy: { endsAt: "asc" },
  });
  if (sprints.length === 1) redirect(`/sprints/${sprints[0].slug}`);
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Sprints" subtitle="Time-boxed drives to get a list of hospitals to sign." />
      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {sprints.length === 0 && <p className="text-sm text-slate-500">You are not on a sprint.</p>}
        {sprints.map((s) => (
          <Link key={s.id} href={`/sprints/${s.slug}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
            <p className="font-semibold text-[#0B3C5D]">{s.name}</p>
            <p className="text-sm text-slate-500">Closes {fmtDay(s.endsAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
