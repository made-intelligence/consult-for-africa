import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import TopBar from "@/components/platform/TopBar";
import { whatsappLink } from "@/lib/hospital-sales";
import { HOSPITAL_OUTCOMES, hospitalLink } from "@/lib/outreach-hospital";
import { endOfLagosDay, fmtDay, outcome, startOfLagosDay, whatsappOpener } from "@/lib/outreach";
import { queueFor, sprintAccess, type QueueTarget } from "@/lib/outreach-server";
import { sprintStats } from "@/lib/outreach-stats";
import { CheckInBox } from "./SprintClient";
import { DueLabel, SprintHeader, StagePill, card, h2 } from "./parts";

export const dynamic = "force-dynamic";

// A caller's day. Work down the list: due first, then fresh providers. Tap a
// provider to call, WhatsApp and log what happened.

export default async function SprintQueuePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ as?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { slug } = await params;
  const sp = await searchParams;
  const a = await sprintAccess(slug, session.user);
  if (!a) notFound();

  const stats = await sprintStats(a.sprint);
  const callers = stats.people.filter((p) => p.openCount > 0 || p.role !== "LEAD");
  // The lead, runner or an admin can look at anyone's queue.
  const viewing = a.steer && sp.as ? stats.people.find((p) => p.userId === sp.as) : stats.people.find((p) => p.userId === session.user.id);
  const dayStart = startOfLagosDay(stats.today);
  const dayEnd = endOfLagosDay(stats.today);
  const q = viewing ? await queueFor(a.sprint.id, viewing.userId, dayEnd) : null;
  const client = a.sprint.clientName;
  const callerName = (viewing?.name ?? session.user.name ?? "").replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "");

  return (
    <div className="flex h-full flex-col">
      <TopBar title={a.sprint.name} subtitle="Work down the list. Log every contact the same day." />
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <SprintHeader slug={slug} tab="queue" total={stats.total} target={stats.target} week={stats.week} signedThisWeek={stats.signedThisWeek} endsAt={a.sprint.endsAt} briefUrl={a.sprint.briefUrl} steer={a.steer} />

        {a.steer && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Queue for</span>
            {callers.map((p) => (
              <Link key={p.userId} href={`?as=${p.userId}`} className={`rounded-full border px-3 py-1 ${viewing?.userId === p.userId ? "border-[#0B3C5D] bg-[#0B3C5D] text-white" : "border-slate-300 text-slate-700"}`}>
                {p.first} <span className="opacity-70">{p.dueNow}</span>
              </Link>
            ))}
          </div>
        )}

        {!viewing || !q ? (
          <div className={card}>
            <p className="text-sm text-slate-600">You have no list on this sprint. Use the Board to see the team, or pick a person above.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ["Due today", viewing.dueNow],
                ["Overdue", viewing.overdue],
                ["Contacts today", viewing.contactsToday],
                ["SLAs out", viewing.out],
                ["Signed so far", viewing.signedTotal],
              ].map(([l, n]) => (
                <div key={l as string} className={card}>
                  <p className={`text-2xl font-semibold ${l === "Overdue" && (n as number) > 0 ? "text-rose-700" : "text-[#0B3C5D]"}`}>{n}</p>
                  <p className="text-xs text-slate-500">{l}</p>
                </div>
              ))}
            </div>

            <Section title={`Due now (${q.due.length})`} empty="Nothing due. Start on the fresh providers below.">
              {q.due.map((t) => (
                <Row key={t.id} t={t} slug={slug} client={client} caller={callerName} dayStart={dayStart} dayEnd={dayEnd} />
              ))}
            </Section>

            <Section title={`Fresh, best first (${viewing.fresh} not yet called)`} empty="Every provider on your list has been contacted.">
              {q.fresh.map((t) => (
                <Row key={t.id} t={t} slug={slug} client={client} caller={callerName} dayStart={dayStart} dayEnd={dayEnd} />
              ))}
            </Section>

            <section>
              <h2 className={h2}>Your 5pm check-in</h2>
              <div className={card}>
                <CheckInBox text={viewing.checkIn} />
              </div>
            </section>

            {q.upcoming.length > 0 && (
              <section>
                <h2 className={h2}>Coming up</h2>
                <div className={`${card} divide-y divide-slate-100 p-0`}>
                  {q.upcoming.map((t) => (
                    <Link key={t.id} href={`/sprints/${slug}/t/${t.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-slate-50">
                      <span className="truncate font-medium text-slate-800">{t.hospital.name}</span>
                      <span className="flex shrink-0 items-center gap-3">
                        <StagePill stage={t.stage} client={client} />
                        <span className="text-xs text-slate-500">{t.nextActionAt ? fmtDay(t.nextActionAt) : ""}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section>
      <h2 className={h2}>{title}</h2>
      {children.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : <div className="space-y-2">{children}</div>}
    </section>
  );
}

function Row({ t, slug, client, caller, dayStart, dayEnd }: { t: QueueTarget; slug: string; client: string | null; caller: string; dayStart: Date; dayEnd: Date }) {
  const phone = t.signatoryPhone ?? t.hospital.contacts.find((c) => c.phone)?.phone ?? null;
  const last = t.touches[0];
  const text = `${whatsappOpener({ clientName: client ?? "", caller, signatory: t.signatoryName, hospital: t.hospital.name })}${t.token ? `\n\nEverything is on one page for ${t.hospital.name}, including the agreement: ${hospitalLink(t.token)}` : ""}`;
  const wa = phone ? whatsappLink(phone.startsWith("+") ? phone : `+234${phone.replace(/\D/g, "").replace(/^0/, "")}`, text) : null;
  return (
    <div className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
      <Link href={`/sprints/${slug}/t/${t.id}`} className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[#0B3C5D]">{t.hospital.name}</span>
          <StagePill stage={t.stage} client={client} />
          {t.escalatedAt && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">With the runner</span>}
          {t.packReadyAt && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Pack ready</span>}
          {!t.packReadyAt && t.linkOpenedAt && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">Opened their page</span>}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {[t.hospital.category, t.hospital.lga, t.signatoryName ? `Signs: ${t.signatoryName}` : "Signatory not known yet"].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          <DueLabel at={t.nextActionAt} dayStart={dayStart} dayEnd={dayEnd} /> <span className="ml-1">{t.nextAction ?? "First call: find out who signs"}</span>
        </p>
        {last && (
          <p className="mt-1 truncate text-xs text-slate-500">
            Last: {outcome(last.outcome)?.label ?? HOSPITAL_OUTCOMES[last.outcome] ?? last.outcome}, {fmtDay(last.createdAt)}
            {last.said ? ` · "${last.said}"` : ""}
          </p>
        )}
      </Link>
      <div className="flex shrink-0 gap-2">
        {phone && (
          <a href={`tel:${phone}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
            Call
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-800">
            WhatsApp
          </a>
        )}
        <Link href={`/sprints/${slug}/t/${t.id}`} className="rounded-lg bg-[#0B3C5D] px-3 py-2 text-sm font-medium text-white">
          Log
        </Link>
      </div>
    </div>
  );
}
