import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ALL_STAGES, endOfLagosDay, startOfLagosDay, stageLabel, todayInLagos } from "@/lib/outreach";
import { sprintAccess } from "@/lib/outreach-server";
import { sprintStats } from "@/lib/outreach-stats";
import { emailsFor, isTested } from "@/lib/outreach-hospital";
import { AddProvider, BulkIntro } from "../SprintClient";
import { DueLabel, SprintHeader, StagePill, card } from "../parts";

export const dynamic = "force-dynamic";
const PAGE = 100;

export default async function SprintProvidersPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ stage?: string; owner?: string; q?: string; page?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { slug } = await params;
  const sp = await searchParams;
  const a = await sprintAccess(slug, session.user);
  if (!a) notFound();
  const s = await sprintStats(a.sprint);

  const stage = sp.stage && (ALL_STAGES as readonly string[]).includes(sp.stage) ? sp.stage : undefined;
  const q = sp.q?.trim();
  const page = Math.max(0, Number(sp.page ?? 0) || 0);
  const where = {
    sprintId: a.sprint.id,
    ...(stage ? { stage } : {}),
    ...(sp.owner ? { ownerId: sp.owner } : {}),
    ...(q ? { OR: [{ hospital: { name: { contains: q, mode: "insensitive" as const } } }, { hospital: { lga: { contains: q, mode: "insensitive" as const } } }, { signatoryName: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [count, rows] = await Promise.all([
    prisma.sprintTarget.count({ where }),
    prisma.sprintTarget.findMany({
      where,
      orderBy: [{ ownerId: "asc" }, { priority: "desc" }, { hospital: { name: "asc" } }],
      skip: page * PAGE,
      take: PAGE,
      include: { hospital: { select: { name: true, lga: true, category: true } }, owner: { select: { name: true } } },
    }),
  ]);
  const today = todayInLagos();
  const dayStart = startOfLagosDay(today);
  const dayEnd = endOfLagosDay(today);
  const link = (o: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const m = { stage, owner: sp.owner, q, ...o };
    for (const [k, v] of Object.entries(m)) if (v) u.set(k, v);
    return `?${u.toString()}`;
  };
  const members = s.people.map((p) => ({ userId: p.userId, name: p.name }));

  return (
    <div className="flex h-full flex-col">
      <TopBar title={a.sprint.name} subtitle="Every provider on the sprint, and whose list it is on." />
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <SprintHeader slug={slug} tab="providers" total={s.total} target={s.target} week={s.week} signedThisWeek={s.signedThisWeek} endsAt={a.sprint.endsAt} briefUrl={a.sprint.briefUrl} steer={a.steer} />

        <div className="flex flex-wrap items-center gap-2">
          <form className="flex gap-2">
            {stage && <input type="hidden" name="stage" value={stage} />}
            {sp.owner && <input type="hidden" name="owner" value={sp.owner} />}
            <input name="q" defaultValue={q} placeholder="Search name, LGA or signatory" className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          </form>
          <AddProvider slug={slug} members={members} steer={a.steer} />
        </div>
        {a.steer && (
          <BulkIntro slug={slug} tested={isTested(a.sprint, emailsFor(a.sprint).intro)} targetIds={rows.filter((r) => r.stage === "TARGET" && !r.linkSentAt).slice(0, 50).map((r) => r.id)} />
        )}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Link href={link({ stage: undefined, page: undefined })} className={`rounded-full border px-2.5 py-1 ${!stage ? "border-[#0B3C5D] bg-[#0B3C5D] text-white" : "border-slate-300"}`}>
            All stages
          </Link>
          {ALL_STAGES.map((k) => (
            <Link key={k} href={link({ stage: k, page: undefined })} className={`rounded-full border px-2.5 py-1 ${stage === k ? "border-[#0B3C5D] bg-[#0B3C5D] text-white" : "border-slate-300"}`}>
              {stageLabel(k, a.sprint.clientName)} {s.stageCounts[k] ?? 0}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Link href={link({ owner: undefined, page: undefined })} className={`rounded-full border px-2.5 py-1 ${!sp.owner ? "border-[#0B3C5D] bg-[#0B3C5D] text-white" : "border-slate-300"}`}>
            Everyone
          </Link>
          {s.people.map((p) => (
            <Link key={p.userId} href={link({ owner: p.userId, page: undefined })} className={`rounded-full border px-2.5 py-1 ${sp.owner === p.userId ? "border-[#0B3C5D] bg-[#0B3C5D] text-white" : "border-slate-300"}`}>
              {p.first}
            </Link>
          ))}
        </div>

        <div className={`${card} overflow-x-auto p-0`}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                {["Provider", "Type", "LGA", "Owner", "Stage", "Signatory", "Next"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link href={`/sprints/${slug}/t/${r.id}`} className="font-medium text-[#0B3C5D] hover:underline">
                      {r.hospital.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.hospital.category}</td>
                  <td className="px-3 py-2 text-slate-600">{r.hospital.lga}</td>
                  <td className="px-3 py-2 text-slate-600">{r.owner?.name.split(" ")[0]}</td>
                  <td className="px-3 py-2">
                    <StagePill stage={r.stage} client={a.sprint.clientName} />
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.signatoryName}</td>
                  <td className="px-3 py-2">
                    <DueLabel at={r.nextActionAt} dayStart={dayStart} dayEnd={dayEnd} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>
            {count === 0 ? "None" : `${page * PAGE + 1} to ${Math.min(count, (page + 1) * PAGE)} of ${count}`}
          </span>
          {page > 0 && <Link href={link({ page: String(page - 1) })} className="underline">Previous</Link>}
          {(page + 1) * PAGE < count && <Link href={link({ page: String(page + 1) })} className="underline">Next</Link>}
        </div>
      </div>
    </div>
  );
}
