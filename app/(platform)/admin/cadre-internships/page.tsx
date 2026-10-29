import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ALL_STAFF_ROLES, OFFICE_ROLES } from "@/lib/constants";
import { CURRENT_INTAKE, INTAKE_LABEL, PARTNER_LED, STAGE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { SECTIONS, type SectionKey } from "@/lib/cadreHealth/internship/paper";
import { CENTRES_PAGE, REPLY_TO } from "@/lib/cadreHealth/internship/outreachSend";
import CentreRow from "./CentreRow";
import Composer from "./Composer";
import ContactImport from "./ContactImport";
import Playbook from "./Playbook";

export const dynamic = "force-dynamic";

const ALLOWED = [...ALL_STAFF_ROLES, ...OFFICE_ROLES] as readonly string[];
const STAGES = ["PROSPECT", "CONTACTED", "MEETING", "COMMITTED", "DECLINED"] as const;
const TABS = [
  ["centres", "Centres"],
  ["email", "Email centres"],
  ["contacts", "Contacts"],
  ["readiness", "Readiness"],
  ["playbook", "Playbook"],
] as const;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600_000).toISOString().slice(0, 10);
/** Below this, a university's average identifies the few people behind it. */
const MIN_COHORT = 5;

/**
 * The internship centres and our engagement with each, plus the applicant
 * pool. One page for the people working the list: who owns which centre, what
 * happens next, and how many nurses have already chosen it, which is the
 * strongest thing to say to a centre that has not yet joined.
 */
export default async function CadreInternshipsAdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; stage?: string; owner?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED.includes(session.user.role)) redirect("/dashboard");
  const sp = await searchParams;
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab! : "centres";

  const [centres, staff, orgs, apps, assessed, scoreAgg, choiceCounts, recent, outreach, attempts] = await Promise.all([
    prisma.cadreInternshipCentre.findMany({ orderBy: [{ stage: "desc" }, { name: "asc" }] }),
    prisma.user.findMany({
      where: { role: { in: [...ALLOWED] as never } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.cadreEmployerOrg.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE } }),
    prisma.cadreInternshipApplication.count({ where: { intake: CURRENT_INTAKE, status: { in: ["ASSESSED", "PLACED"] } } }),
    prisma.cadreInternshipAttempt.aggregate({ where: { submittedAt: { not: null }, application: { intake: CURRENT_INTAKE } }, _avg: { score: true } }),
    prisma.cadreInternshipPreference.groupBy({ by: ["centreId"], where: { application: { intake: CURRENT_INTAKE } }, _count: { _all: true } }),
    prisma.cadreInternshipApplication.findMany({
      where: { intake: CURRENT_INTAKE },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        school: true,
        status: true,
        createdAt: true,
        professional: { select: { firstName: true, lastName: true } },
        attempt: { select: { score: true } },
        _count: { select: { preferences: true } },
      },
    }),
    prisma.cadreInternshipOutreach.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, centreId: true, direction: true, subject: true, status: true, error: true, createdAt: true, sentById: true, email: true },
    }),
    tab === "readiness"
      ? prisma.cadreInternshipAttempt.findMany({
          where: { submittedAt: { not: null }, application: { intake: CURRENT_INTAKE } },
          select: { score: true, sectionScores: true, application: { select: { school: true } } },
        })
      : Promise.resolve([]),
  ]);

  const choices = new Map(choiceCounts.map((c) => [c.centreId, c._count._all]));
  const byStage = Object.fromEntries(STAGES.map((s) => [s, centres.filter((c) => c.stage === s).length]));
  const slots = centres.filter((c) => c.stage === "COMMITTED").reduce((n, c) => n + (c.slotsOffered ?? 0), 0);
  const staffName = new Map(staff.map((u) => [u.id, u.name]));
  const withEmail = centres.filter((c) => c.contactEmail).length;
  const emailed = new Set(outreach.filter((o) => o.direction === "OUT" && o.status === "SENT").map((o) => o.centreId)).size;
  const enquiries = outreach.filter((o) => o.direction === "IN");
  const history = new Map<string, typeof outreach>();
  for (const o of outreach) if (o.centreId) history.set(o.centreId, [...(history.get(o.centreId) ?? []), o]);

  const shown = centres.filter(
    (c) => (!sp.stage || c.stage === sp.stage) && (!sp.owner || (sp.owner === "none" ? !c.ownerUserId : c.ownerUserId === sp.owner)),
  );
  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ tab, stage: sp.stage, owner: sp.owner, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/cadre-internships?${q}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <Link href="/admin/cadrehealth" className="text-xs text-gray-500 hover:text-gray-800">CadreHealth admin</Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Nurse internship placement, {INTAKE_LABEL}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Nurses apply at <Link href="/oncadre/internships" className="underline">/oncadre/internships</Link>. Centres read about it and ask to join at{" "}
          <Link href="/oncadre/internships/centres" className="underline">/oncadre/internships/centres</Link>. A centre sees its list once it is Committed and linked to an employer login.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {[
          ["Centres committed", `${byStage.COMMITTED} of ${centres.length}`],
          ["In conversation", String(byStage.MEETING + byStage.CONTACTED)],
          ["With an email", `${withEmail} of ${centres.length}`],
          ["Emailed", String(emailed)],
          ["Places committed", String(slots)],
          ["Applicants", String(apps)],
          ["Assessed", String(assessed)],
          ["Average score", scoreAgg._avg.score != null ? `${Math.round(scoreAgg._avg.score)}%` : "None yet"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white p-4" style={{ border: "1px solid #E8EBF0" }}>
            <p className="text-xs text-gray-500">{k}</p>
            <p className="mt-1 text-xl font-bold text-gray-900 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      {centres.length === 0 && (
        <div className="rounded-xl p-4 text-sm" style={{ background: "#FEF3C7", color: "#92400E" }}>
          No centres are loaded yet, so nurses have nothing to choose on the public page. Run <code>npx tsx --env-file=.env.local scripts/seed-internship-centres.ts --apply</code>.
        </div>
      )}

      {enquiries.length > 0 && (
        <div className="rounded-xl bg-white p-4" style={{ border: "1px solid #E8EBF0" }}>
          <p className="text-sm font-semibold text-gray-900">Centres that asked to join</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {enquiries.slice(0, 5).map((e) => (
              <li key={e.id}>
                {e.subject.replace(/^Enquiry from /, "")} · {e.email} · {e.createdAt.toISOString().slice(0, 10)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="flex flex-wrap gap-1 rounded-xl bg-white p-1" style={{ border: "1px solid #E8EBF0" }}>
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={`/admin/cadre-internships?tab=${k}`}
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={k === tab ? { background: "#0B3C5D", color: "#fff" } : { color: "#4B5563" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "centres" && (
        <>
          <section>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={href({ stage: undefined })} className="rounded-full px-3 py-1 text-xs font-medium" style={!sp.stage ? { background: "#0B3C5D", color: "#fff" } : { border: "1px solid #E8EBF0", color: "#4B5563" }}>
                All {centres.length}
              </Link>
              {STAGES.map((s) => (
                <Link key={s} href={href({ stage: s })} className="rounded-full px-3 py-1 text-xs font-medium" style={sp.stage === s ? { background: "#0B3C5D", color: "#fff" } : { border: "1px solid #E8EBF0", color: "#4B5563" }}>
                  {STAGE_LABEL[s]} {byStage[s]}
                </Link>
              ))}
              <span className="mx-1 text-gray-300">|</span>
              <Link href={href({ owner: session.user.id })} className="rounded-full px-3 py-1 text-xs font-medium" style={sp.owner === session.user.id ? { background: "#0B3C5D", color: "#fff" } : { border: "1px solid #E8EBF0", color: "#4B5563" }}>
                Mine
              </Link>
              <Link href={href({ owner: "none" })} className="rounded-full px-3 py-1 text-xs font-medium" style={sp.owner === "none" ? { background: "#0B3C5D", color: "#fff" } : { border: "1px solid #E8EBF0", color: "#4B5563" }}>
                No owner
              </Link>
              {sp.owner && <Link href={href({ owner: undefined })} className="text-xs text-gray-500 underline">Any owner</Link>}
            </div>
            <div className="mt-3 space-y-2">
              {shown.length === 0 && <p className="text-sm text-gray-500">No centres match.</p>}
              {shown.map((c) => (
                <CentreRow
                  key={c.id}
                  centre={{
                    id: c.id,
                    name: c.name,
                    area: c.area,
                    ownership: c.ownership,
                    stage: c.stage,
                    ownerUserId: c.ownerUserId,
                    contactName: c.contactName,
                    contactRole: c.contactRole,
                    contactEmail: c.contactEmail,
                    contactPhone: c.contactPhone,
                    nextAction: c.nextAction,
                    nextActionDue: c.nextActionDue?.toISOString().slice(0, 10) ?? null,
                    notes: c.notes,
                    slotsOffered: c.slotsOffered,
                    minScore: c.minScore,
                    intakeNote: c.intakeNote,
                    employerOrgId: c.employerOrgId,
                  }}
                  ownerName={c.ownerUserId ? staffName.get(c.ownerUserId) ?? "Unknown" : null}
                  choices={choices.get(c.id) ?? 0}
                  staff={staff}
                  orgs={orgs}
                  history={(history.get(c.id) ?? []).map((o) => ({
                    id: o.id,
                    direction: o.direction,
                    subject: o.subject,
                    status: o.status,
                    error: o.error,
                    date: o.createdAt.toISOString().slice(0, 10),
                    by: o.sentById ? staffName.get(o.sentById) ?? null : null,
                  }))}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">Latest applicants</h2>
            <div className="mt-3 overflow-x-auto rounded-xl bg-white" style={{ border: "1px solid #E8EBF0" }}>
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">University</th>
                    <th className="px-4 py-2 font-medium">Centres chosen</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No applications yet.</td>
                    </tr>
                  )}
                  {recent.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid #F1F3F6" }}>
                      <td className="px-4 py-2 text-gray-900">{a.professional.firstName} {a.professional.lastName}</td>
                      <td className="px-4 py-2 text-gray-600">{a.school}</td>
                      <td className="px-4 py-2 text-gray-600 tabular-nums">{a._count.preferences}</td>
                      <td className="px-4 py-2 text-gray-600">{a.status.toLowerCase()}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-gray-900">{a.attempt?.score != null ? `${a.attempt.score}%` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === "email" && (
        <Composer
          me={session.user.id}
          weekAgo={daysAgo(7)}
          senderName={session.user.name ?? ""}
          replyTo={REPLY_TO}
          centresPage={CENTRES_PAGE}
          figures={{ applicants: apps, centres: centres.length }}
          staff={staff}
          centres={centres.map((c) => {
            const sent = (history.get(c.id) ?? []).filter((o) => o.direction === "OUT" && o.status === "SENT");
            return {
              id: c.id,
              name: c.name,
              partnerLed: PARTNER_LED.has(c.slug),
              area: c.area,
              stage: c.stage,
              ownerUserId: c.ownerUserId,
              contactName: c.contactName,
              contactEmail: c.contactEmail,
              choices: choices.get(c.id) ?? 0,
              emailedCount: sent.length,
              lastEmailed: sent[0]?.createdAt.toISOString().slice(0, 10) ?? null,
            };
          })}
        />
      )}

      {tab === "contacts" && (
        <ContactImport centres={centres.map((c) => ({ id: c.id, name: c.name, contactName: c.contactName, contactRole: c.contactRole, contactEmail: c.contactEmail, contactPhone: c.contactPhone }))} />
      )}

      {tab === "readiness" && <Readiness attempts={attempts} />}

      {tab === "playbook" && <Playbook />}
    </div>
  );
}

type Attempt = { score: number | null; sectionScores: unknown; application: { school: string } };

/**
 * What the cohort can and cannot do on day one, by section and by university.
 * The development half of the programme: the evidence a nursing school or the
 * council can act on. Universities with fewer than five candidates are not
 * shown, because an average of two people is two people's results.
 */
function Readiness({ attempts }: { attempts: Attempt[] }) {
  const pct = (c: number, t: number) => (t ? Math.round((100 * c) / t) : 0);
  const sum = (rows: Attempt[]) => {
    const acc: Record<string, { correct: number; total: number }> = {};
    for (const a of rows) {
      for (const [k, v] of Object.entries((a.sectionScores ?? {}) as Record<string, { correct: number; total: number }>)) {
        acc[k] = { correct: (acc[k]?.correct ?? 0) + v.correct, total: (acc[k]?.total ?? 0) + v.total };
      }
    }
    return acc;
  };
  const all = sum(attempts);
  const bySchool = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const k = a.application.school.trim().toLowerCase();
    bySchool.set(k, [...(bySchool.get(k) ?? []), a]);
  }
  const schools = [...bySchool.entries()].filter(([, r]) => r.length >= MIN_COHORT).sort((a, b) => b[1].length - a[1].length);
  const keys = Object.keys(SECTIONS) as SectionKey[];
  const weakest = keys.filter((k) => all[k]).sort((a, b) => pct(all[a].correct, all[a].total) - pct(all[b].correct, all[b].total))[0];

  if (!attempts.length) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-gray-600" style={{ border: "1px solid #E8EBF0" }}>
        <p className="font-semibold text-gray-900">Cohort readiness</p>
        <p className="mt-2">
          Once candidates finish the assessment, this shows how the {INTAKE_LABEL} performs in each of the seven sections, overall and by university. It is the evidence we can take to nursing schools and to the council about where new graduates need more preparation, and the reason this is nursing development and not only placement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0" }}>
        <p className="text-sm font-semibold text-gray-900">Cohort readiness, {attempts.length} assessed</p>
        {weakest && <p className="mt-1 text-sm text-gray-600">Weakest section: {SECTIONS[weakest]}, {pct(all[weakest].correct, all[weakest].total)}% correct.</p>}
        <div className="mt-4 space-y-2">
          {keys.map((k) => {
            const v = all[k];
            const p = v ? pct(v.correct, v.total) : 0;
            return (
              <div key={k} className="grid grid-cols-[minmax(0,14rem)_1fr_3rem] items-center gap-3 text-sm">
                <span className="truncate text-gray-700">{SECTIONS[k]}</span>
                <span className="h-2 rounded-full bg-gray-100">
                  <span className="block h-2 rounded-full" style={{ width: `${p}%`, background: p < 50 ? "#B91C1C" : p < 70 ? "#D4AF37" : "#0B3C5D" }} />
                </span>
                <span className="text-right tabular-nums text-gray-900">{p}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white" style={{ border: "1px solid #E8EBF0" }}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">University</th>
              <th className="px-4 py-2 font-medium text-right">Candidates</th>
              {keys.map((k) => (
                <th key={k} className="px-3 py-2 font-medium text-right" title={SECTIONS[k]}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 && (
              <tr>
                <td colSpan={keys.length + 2} className="px-4 py-6 text-center text-gray-400">No university has {MIN_COHORT} or more candidates yet.</td>
              </tr>
            )}
            {schools.map(([name, rows]) => {
              const s = sum(rows);
              return (
                <tr key={name} style={{ borderTop: "1px solid #F1F3F6" }}>
                  <td className="px-4 py-2 capitalize text-gray-900">{name}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-600">{rows.length}</td>
                  {keys.map((k) => (
                    <td key={k} className="px-3 py-2 text-right tabular-nums text-gray-700">{s[k] ? `${pct(s[k].correct, s[k].total)}%` : ""}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="px-4 py-2 text-[11px] text-gray-400">
          {keys.map((k) => `${k} ${SECTIONS[k]}`).join(" · ")}. Universities with fewer than {MIN_COHORT} candidates are left out so no one is identifiable.
        </p>
      </div>
    </div>
  );
}
