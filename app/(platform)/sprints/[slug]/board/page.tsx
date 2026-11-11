import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ALL_STAGES, NEEDS, SIGNED_STAGES, fmtDay, needLabel, startOfLagosDay, stageLabel } from "@/lib/outreach";
import { sprintAccess } from "@/lib/outreach-server";
import { sprintStats } from "@/lib/outreach-stats";
import { CopyBox } from "../SprintClient";
import { SprintHeader, card, h2 } from "../parts";

export const dynamic = "force-dynamic";

// The whole sprint on one page: the number, the week, each person, where
// providers drop out, what is stuck with the runner, and what providers say.

export default async function SprintBoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { slug } = await params;
  const a = await sprintAccess(slug, session.user);
  if (!a) notFound();
  const s = await sprintStats(a.sprint);
  const client = a.sprint.clientName;

  const weeks = ((a.sprint.weeklyTargets as { from: string; label: string; target: number }[] | null) ?? []).sort((x, y) => x.from.localeCompare(y.from));
  const signed = await prisma.sprintTarget.findMany({ where: { sprintId: a.sprint.id, signedAt: { not: null } }, select: { signedAt: true } });
  const perWeek = weeks.map((w, i) => {
    const from = startOfLagosDay(w.from);
    const to = weeks[i + 1] ? startOfLagosDay(weeks[i + 1].from) : null;
    return { ...w, signed: signed.filter((r) => r.signedAt! >= from && (!to || r.signedAt! < to)).length };
  });

  const needCounts = await prisma.sprintTouch.findMany({ where: { target: { sprintId: a.sprint.id }, needs: { isEmpty: false } }, select: { needs: true, targetId: true } });
  const needTally = NEEDS.map((n) => ({ ...n, hospitals: new Set(needCounts.filter((x) => x.needs.includes(n.key)).map((x) => x.targetId)).size })).filter((n) => n.hospitals > 0).sort((x, y) => y.hospitals - x.hospitals);

  const funnel = ALL_STAGES.map((k) => ({ k, n: s.stageCounts[k] ?? 0 }));
  const maxF = Math.max(1, ...funnel.map((f) => f.n));

  return (
    <div className="flex h-full flex-col">
      <TopBar title={a.sprint.name} subtitle="The team, the week and what providers are saying." />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <SprintHeader slug={slug} tab="board" total={s.total} target={s.target} week={s.week} signedThisWeek={s.signedThisWeek} endsAt={a.sprint.endsAt} briefUrl={a.sprint.briefUrl} />

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["Signed today", s.signedToday.length],
            ["Signed in the sprint", s.signedInSprint],
            ["SLAs out", s.out],
            ["Follow-ups overdue", s.overdue],
            ["With the runner", s.escalated.length + s.silentlyOverdue],
          ].map(([l, n]) => (
            <div key={l as string} className={card}>
              <p className="text-2xl font-semibold text-[#0B3C5D]">{n}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>

        {perWeek.length > 0 && (
          <section>
            <h2 className={h2}>By week</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {perWeek.map((w) => {
                const pct = Math.min(100, Math.round((w.signed / Math.max(1, w.target)) * 100));
                const current = s.week?.from === w.from;
                return (
                  <div key={w.from} className={`${card} ${current ? "ring-2 ring-[#D4AF37]" : ""}`}>
                    <p className="text-xs text-slate-500">{w.label}</p>
                    <p className="text-lg font-semibold text-[#0B3C5D]">
                      {w.signed} <span className="text-sm font-normal text-slate-500">of {w.target}</span>
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${w.signed >= w.target ? "bg-emerald-500" : "bg-[#D4AF37]"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className={h2}>The team today</h2>
          <div className={`${card} overflow-x-auto p-0`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {["Person", "Area", "Contacts today", "SLAs sent today", "Signed today", "SLAs out", "Due today", "Overdue", "Not yet called", "Signed in sprint"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {s.people.map((p) => (
                  <tr key={p.userId}>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {a.steer ? (
                        <Link href={`/sprints/${slug}?as=${p.userId}`} className="underline">
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                      <span className="ml-1 text-xs text-slate-400">{p.role.toLowerCase()}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.area ?? ""}</td>
                    <td className="px-3 py-2">{p.contactsToday}</td>
                    <td className="px-3 py-2">{p.sentToday}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{p.signedToday.length || ""}</td>
                    <td className="px-3 py-2">{p.out}</td>
                    <td className="px-3 py-2">{p.dueNow}</td>
                    <td className={`px-3 py-2 ${p.overdue ? "font-semibold text-rose-700" : ""}`}>{p.overdue}</td>
                    <td className="px-3 py-2">{p.fresh}</td>
                    <td className="px-3 py-2 font-semibold">{p.signedTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className={h2}>Where providers stand</h2>
            <div className={`${card} space-y-1.5`}>
              {funnel.map((f) => (
                <Link key={f.k} href={`/sprints/${slug}/providers?stage=${f.k}`} className="flex items-center gap-3 text-sm hover:opacity-80">
                  <span className="w-32 shrink-0 text-slate-600">{stageLabel(f.k, client)}</span>
                  <span className="h-4 flex-1 overflow-hidden rounded bg-slate-50">
                    <span className={`block h-full rounded ${SIGNED_STAGES.includes(f.k) ? "bg-emerald-500" : "bg-[#0B3C5D]/70"}`} style={{ width: `${(f.n / maxF) * 100}%` }} />
                  </span>
                  <span className="w-10 text-right font-medium text-slate-800">{f.n}</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className={h2}>With the runner ({s.escalated.length})</h2>
            {s.escalated.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing escalated. A chase that runs to day 8 unsigned lands here.</p>
            ) : (
              <div className={`${card} divide-y divide-slate-100 p-0`}>
                {s.escalated.map((e) => (
                  <Link key={e.id} href={`/sprints/${slug}/t/${e.id}`} className="block px-4 py-2.5 hover:bg-slate-50">
                    <p className="text-sm font-medium text-slate-800">
                      {e.hospital.name} <span className="text-xs font-normal text-slate-500">{e.owner?.name}</span>
                    </p>
                    <p className="text-xs text-slate-500">{e.escalationNote}</p>
                  </Link>
                ))}
              </div>
            )}
            {s.silentlyOverdue > 0 && <p className="mt-2 text-xs text-rose-700">{s.silentlyOverdue} more SLA{s.silentlyOverdue === 1 ? " is" : "s are"} past day 8 with no chase logged. Check the overdue lists.</p>}
          </section>
        </div>

        <section>
          <h2 className={h2}>What providers are saying</h2>
          {needTally.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {needTally.map((n) => (
                <span key={n.key} className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs text-[#7a5f10]">
                  {n.label}: {n.hospitals} provider{n.hospitals === 1 ? "" : "s"}
                </span>
              ))}
            </div>
          )}
          {s.heard.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing logged yet. Every touch asks for the provider&apos;s own words: objections, and anything about their hospital.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {s.heard.map((h) => (
                <Link key={h.id} href={`/sprints/${slug}/t/${h.target.id}`} className={`${card} block hover:bg-slate-50`}>
                  {h.said && <p className="text-sm italic text-slate-700">&ldquo;{h.said}&rdquo;</p>}
                  <p className="mt-1 text-xs text-slate-500">
                    {h.target.hospital.name}
                    {h.target.hospital.lga ? `, ${h.target.hospital.lga}` : ""} · {h.user.name} · {fmtDay(h.createdAt)}
                    {h.needs.length ? ` · ${h.needs.map(needLabel).join(", ")}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {a.steer && (
          <section>
            <h2 className={h2}>The 6pm roll-up</h2>
            <div className={card}>
              <CopyBox text={s.rollUp} label="Copy roll-up" />
              <p className="mt-2 text-xs text-slate-500">Written from the record at the moment you open this page. Paste it into the WhatsApp group.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
