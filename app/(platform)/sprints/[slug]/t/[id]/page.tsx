import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { normalisePhone, whatsappLink } from "@/lib/hospital-sales";
import { CHASE, endOfLagosDay, fmtDay, fmtTime, needLabel, outcome, slaEmail, startOfLagosDay, todayInLagos, whatsappOpener, workingDaysBetween } from "@/lib/outreach";
import { canWork, queueFor, sprintAccess } from "@/lib/outreach-server";
import { emailsFor, ensureToken, hospitalLink, isTested, recipientFor, HOSPITAL_OUTCOMES } from "@/lib/outreach-hospital";
import { FileRow, HospitalLinkPanel, LogTouch, SignatoryForm, SteerPanel } from "../../SprintClient";
import { DueLabel, StagePill, card, h2 } from "../../parts";

export const dynamic = "force-dynamic";

export default async function SprintTargetPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { slug, id } = await params;
  const a = await sprintAccess(slug, session.user);
  if (!a) notFound();

  const t = await prisma.sprintTarget.findFirst({
    where: { id, sprintId: a.sprint.id },
    include: {
      hospital: { include: { contacts: { orderBy: { isPrimary: "desc" } } } },
      owner: { select: { id: true, name: true } },
      touches: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
      files: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!t) notFound();
  const link = hospitalLink(t.token ?? (await ensureToken(t.id)));

  const mayWork = canWork(a, t, session.user.id);
  const client = a.sprint.clientName ?? "";
  const caller = (session.user.name ?? "").replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, "");
  const today = todayInLagos();
  const dayStart = startOfLagosDay(today);
  const dayEnd = endOfLagosDay(today);

  // The next provider in the owner's queue, so a caller never goes back to the list.
  let nextHref: string | null = null;
  if (t.ownerId) {
    const q = await queueFor(a.sprint.id, t.ownerId, dayEnd, 3);
    const next = [...q.due, ...q.fresh].find((x) => x.id !== t.id);
    if (next) nextHref = `/sprints/${slug}/t/${next.id}`;
  }

  const members = a.steer
    ? (await prisma.sprintMember.findMany({ where: { sprintId: a.sprint.id }, include: { user: { select: { name: true } } } })).map((m) => ({ userId: m.userId, name: m.user.name }))
    : [];

  const phones = [
    ...(t.signatoryPhone ? [{ phone: normalisePhone(t.signatoryPhone) ?? t.signatoryPhone, who: t.signatoryName ?? "Signatory" }] : []),
    ...t.hospital.contacts.filter((c) => c.phone).map((c) => ({ phone: c.phone!, who: c.name ?? "Main line" })),
  ];
  const emails = [...(t.signatoryEmail ? [t.signatoryEmail] : []), ...t.hospital.contacts.filter((c) => c.email).map((c) => c.email!)];
  const opener = `${whatsappOpener({ clientName: client, caller, signatory: t.signatoryName, hospital: t.hospital.name })}\n\nEverything is on one page for ${t.hospital.name}, including the agreement: ${link}`;
  const wording = emailsFor(a.sprint);
  const tested = { intro: isTested(a.sprint, wording.intro), sla: isTested(a.sprint, wording.sla), chase: isTested(a.sprint, wording.chase) };
  const recipient = recipientFor(t)?.email ?? null;
  const waPhone = phones.find((p) => p.phone.startsWith("+"))?.phone ?? null;
  const mail = slaEmail({ clientName: client, caller, signatory: t.signatoryName, hospital: t.hospital.name });
  const mailto = emails[0] ? `mailto:${emails[0]}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}` : null;
  const daysOut = t.sentAt ? workingDaysBetween(t.sentAt, new Date()) : null;

  return (
    <div className="flex h-full flex-col">
      <TopBar title={t.hospital.name} subtitle={[t.hospital.category, t.hospital.lga, t.owner ? `${t.owner.name}'s list` : "No owner"].filter(Boolean).join(" · ")} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <Link href={`/sprints/${slug}`} className="text-[#0B3C5D] underline">
            Back to the queue
          </Link>
          {nextHref && (
            <Link href={nextHref} className="text-[#0B3C5D] underline">
              Next provider
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className={card}>
              <div className="flex flex-wrap items-center gap-2">
                <StagePill stage={t.stage} client={client} />
                {t.escalatedAt && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">With the runner</span>}
                {t.linkOpenedAt && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">Opened their page {fmtDay(t.linkOpenedAt)}</span>}
                {t.packReadyAt && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Pack ready for review</span>}
                {daysOut != null && t.stage === "SENT" && <span className="text-xs text-slate-500">SLA out {daysOut} working day{daysOut === 1 ? "" : "s"}</span>}
              </div>
              <p className="mt-2 text-base text-slate-800">
                <DueLabel at={t.nextActionAt} dayStart={dayStart} dayEnd={dayEnd} /> <span className="ml-1 font-medium">{t.nextAction ?? "First call: find out who signs, and send the SLA today if they are interested"}</span>
              </p>
              {t.escalationNote && <p className="mt-1 text-sm text-rose-700">{t.escalationNote}</p>}
              {t.notes && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">{t.notes}</p>}
              {t.closedReason && <p className="mt-2 text-sm text-slate-600">Why closed: {t.closedReason}</p>}
            </div>

            {mayWork ? (
              <section>
                <h2 className={h2}>Log a contact</h2>
                <div className={card}>
                  <LogTouch slug={slug} targetId={t.id} stage={t.stage} nextHref={nextHref} />
                </div>
              </section>
            ) : (
              <p className="text-sm text-slate-500">This provider is on {t.owner?.name ?? "someone else"}&apos;s list. Two people never call the same facility.</p>
            )}

            <section>
              <h2 className={h2}>History</h2>
              {t.touches.length === 0 ? (
                <p className="text-sm text-slate-500">No contact logged yet.</p>
              ) : (
                <ol className="space-y-2">
                  {t.touches.map((x) => (
                    <li key={x.id} className={card}>
                      <p className="text-sm">
                        <span className="font-semibold text-slate-800">{outcome(x.outcome)?.label ?? HOSPITAL_OUTCOMES[x.outcome] ?? x.outcome.toLowerCase()}</span>
                        <span className="text-slate-500">
                          {" "}
                          · {x.channel.toLowerCase()} · {x.user?.name ?? (x.actor === "HOSPITAL" ? "the hospital" : "automatic")} · {fmtDay(x.createdAt)} {fmtTime(x.createdAt)}
                        </span>
                      </p>
                      {x.spokeTo && <p className="text-xs text-slate-500">Spoke to {x.spokeTo}</p>}
                      {x.said && <p className="mt-1 border-l-2 border-[#D4AF37] pl-2 text-sm italic text-slate-700">&ldquo;{x.said}&rdquo;</p>}
                      {x.needs.length > 0 && (
                        <p className="mt-1 flex flex-wrap gap-1">
                          {x.needs.map((n) => (
                            <span key={n} className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-xs text-[#7a5f10]">
                              {needLabel(n)}
                            </span>
                          ))}
                        </p>
                      )}
                      {x.note && <p className="mt-1 text-xs text-slate-500">{x.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {mayWork && (
              <section>
                <h2 className={h2}>The hospital&apos;s page</h2>
                <div className={card}>
                  <HospitalLinkPanel slug={slug} targetId={t.id} link={link} whatsappHref={waPhone ? whatsappLink(waPhone, opener) : null} recipient={recipient} tested={tested} hasAgreement={!!a.sprint.agreementKey} />
                </div>
              </section>
            )}

            {t.files.length > 0 && (
              <section>
                <h2 className={h2}>What they returned</h2>
                <div className={`${card} divide-y divide-slate-100`}>
                  {t.files.map((f) => (
                    <FileRow key={f.id} slug={slug} file={f} mayReject={mayWork} />
                  ))}
                </div>
                {mayWork && ["SIGNED"].includes(t.stage) && <p className="mt-2 text-xs text-slate-500">When the copy and documents are right, log Docs complete, then Handed over once they are with {client}.</p>}
              </section>
            )}

            <section>
              <h2 className={h2}>Reach them</h2>
              <div className={`${card} space-y-2`}>
                {phones.length === 0 && <p className="text-sm text-slate-500">No phone on file.</p>}
                {phones.map((p, i) => (
                  <div key={`${p.phone}${i}`} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">
                      <span className="text-slate-800">{p.phone}</span> <span className="text-xs text-slate-500">{p.who}</span>
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <a href={`tel:${p.phone}`} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                        Call
                      </a>
                      {p.phone.startsWith("+") && (
                        <a href={whatsappLink(p.phone, opener)} target="_blank" className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-800">
                          WhatsApp
                        </a>
                      )}
                    </span>
                  </div>
                ))}
                {emails.map((e) => (
                  <p key={e} className="truncate text-sm text-slate-700">
                    {e}
                  </p>
                ))}
                {mailto && (
                  <a href={mailto} className="inline-block rounded-md bg-[#0B3C5D] px-3 py-1.5 text-xs font-medium text-white">
                    Draft the SLA email
                  </a>
                )}
                <p className="text-xs text-slate-500">The email opens in your mail app with the wording filled in. Attach the SLA before you send it.</p>
              </div>
            </section>

            <section>
              <h2 className={h2}>Who signs</h2>
              <div className={card}>{mayWork ? <SignatoryForm slug={slug} targetId={t.id} initial={t} /> : <p className="text-sm text-slate-700">{t.signatoryName ?? "Not known yet"}</p>}</div>
            </section>

            {t.stage === "SENT" && (
              <section>
                <h2 className={h2}>The chase</h2>
                <ol className={`${card} space-y-1.5 text-sm`}>
                  {CHASE.map((c, i) => (
                    <li key={c.day} className={i < t.chaseStep ? "text-slate-400 line-through" : i === t.chaseStep ? "font-semibold text-slate-800" : "text-slate-600"}>
                      Day {c.day}: {c.action}
                    </li>
                  ))}
                  <li className="text-slate-600">Day 8: passed to the runner, who escalates or parks it</li>
                </ol>
              </section>
            )}

            {a.steer && (
              <section>
                <h2 className={h2}>Steer</h2>
                <div className={card}>
                  <SteerPanel slug={slug} targetId={t.id} ownerId={t.ownerId} members={members} stage={t.stage} escalated={!!t.escalatedAt} />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
