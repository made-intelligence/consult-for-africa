import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { CONFIRMATION, emailsFor, isTested } from "@/lib/outreach-hospital";
import { sprintAccess } from "@/lib/outreach-server";
import { sprintStats } from "@/lib/outreach-stats";
import { SprintSettings } from "../SprintClient";
import { SprintHeader } from "../parts";

export const dynamic = "force-dynamic";

// What hospitals see and receive. The lead or runner sets it once, tests each
// email in their own inbox, then switches automatic emails on.

export default async function SprintSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { slug } = await params;
  const a = await sprintAccess(slug, session.user);
  if (!a) notFound();
  if (!a.steer) redirect(`/sprints/${slug}`);
  const s = await sprintStats(a.sprint);
  const emails = emailsFor(a.sprint);
  const testTarget = await prisma.sprintTarget.findFirst({ where: { sprintId: a.sprint.id, OR: [{ ownerId: session.user.id }, {}] }, orderBy: [{ ownerId: "asc" }, { priority: "desc" }], select: { id: true } });

  return (
    <div className="flex h-full flex-col">
      <TopBar title={a.sprint.name} subtitle="What hospitals see on their page and receive by email." />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <SprintHeader slug={slug} tab="settings" steer total={s.total} target={s.target} week={s.week} signedThisWeek={s.signedThisWeek} endsAt={a.sprint.endsAt} briefUrl={a.sprint.briefUrl} />
        <div className="max-w-3xl">
          <SprintSettings
            slug={slug}
            testTargetId={testTarget?.id ?? null}
            confirmation={CONFIRMATION}
            initial={{
              pitch: a.sprint.pitch ?? "",
              checklist: a.sprint.checklist ?? "",
              emails,
              tested: { intro: isTested(a.sprint, emails.intro), sla: isTested(a.sprint, emails.sla), chase: isTested(a.sprint, emails.chase) },
              autoChaseOn: a.sprint.autoChaseOn,
              agreementName: a.sprint.agreementName,
            }}
          />
        </div>
      </div>
    </div>
  );
}
