import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ELEVATED_ROLES } from "@/lib/constants";
import { surveyBySlug } from "@/lib/surveys/registry";
import { loadSurvey, distributions } from "@/lib/surveys/archive";
import SurveyCloseControl from "@/components/platform/surveys/SurveyCloseControl";

export const dynamic = "force-dynamic";

const NAVY = "#0F2744";
const TEAL = "#0B8B77";

function Bar({ label, count, base }: { label: string; count: number; base: number }) {
  const pct = base === 0 ? 0 : Math.round((count / base) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-gray-700">{label}</span>
        <span className="whitespace-nowrap text-[12px] font-semibold tabular-nums text-gray-900">
          {count} <span className="font-normal text-gray-400">{pct}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-gray-100">
        <div className="h-full rounded-r" style={{ width: `${pct}%`, background: TEAL }} />
      </div>
    </div>
  );
}

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ELEVATED_ROLES.includes(session.user.role as (typeof ELEVATED_ROLES)[number])) {
    redirect("/dashboard");
  }

  const { slug } = await params;
  const survey = surveyBySlug(slug);
  if (!survey) notFound();

  const [rows, closure, engagement] = await Promise.all([
    loadSurvey(slug),
    prisma.surveyClosure.findUnique({ where: { survey: slug } }),
    survey.engagementId
      ? prisma.engagement.findUnique({
          where: { id: survey.engagementId },
          select: { id: true, name: true, client: { select: { name: true } } },
        })
      : Promise.resolve(null),
  ]);

  const dists = distributions(rows);
  const drifted = closure ? rows.length !== closure.frozenCount : false;
  const retiredCount = rows.filter((r) => r.usesRetiredOption).length;
  const predating = rows.filter((r) => r.notAsked.length > 0).length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title={survey.title}
        subtitle={`${survey.client} · ${rows.length} response${rows.length === 1 ? "" : "s"}`}
        backHref="/admin/surveys"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* ---- provenance ---- */}
          <div className="rounded-xl border bg-white p-5">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Engagement
                </dt>
                <dd className="mt-1 text-sm" style={{ color: NAVY }}>
                  {engagement ? (
                    <Link href={`/projects/${engagement.id}`} className="hover:underline">
                      {engagement.name}
                    </Link>
                  ) : (
                    <span className="text-amber-700">Not linked to an engagement</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Audience
                </dt>
                <dd className="mt-1 text-sm text-gray-700">{survey.audience}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Identity
                </dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {survey.anonymous ? "Anonymous" : "Respondents are named"}
                  {survey.pii === "columns" && ", contact details opt-in and separable"}
                  {survey.pii === "profile" && ", held on the member record"}
                  {survey.pii === "payload" && ", name inside the payload"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Form
                </dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {survey.formPath ? (
                    <a href={survey.formPath} className="font-mono text-[12px] hover:underline">
                      {survey.formPath}
                    </a>
                  ) : (
                    "Behind the member login"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Detailed analysis
                </dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {survey.readerPath ? (
                    <Link href={survey.readerPath} className="hover:underline" style={{ color: TEAL }}>
                      Purpose-built reader
                    </Link>
                  ) : (
                    "None built"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Export
                </dt>
                <dd className="mt-1 flex gap-3 text-sm">
                  <a
                    href={`/api/admin/surveys/${slug}/export?format=csv`}
                    className="hover:underline"
                    style={{ color: TEAL }}
                  >
                    CSV
                  </a>
                  <a
                    href={`/api/admin/surveys/${slug}/export?format=json`}
                    className="hover:underline"
                    style={{ color: TEAL }}
                  >
                    JSON
                  </a>
                  {survey.pii !== "none" && (
                    <a
                      href={`/api/admin/surveys/${slug}/export?format=csv&contact=1`}
                      className="hover:underline"
                      style={{ color: TEAL }}
                    >
                      CSV with contacts
                    </a>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* ---- closure ---- */}
          <SurveyCloseControl
            slug={slug}
            liveCount={rows.length}
            closure={
              closure
                ? {
                    closedAt: closure.closedAt.toISOString(),
                    frozenCount: closure.frozenCount,
                    note: closure.note,
                  }
                : null
            }
          />

          {drifted && closure && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <span className="font-semibold">This survey has drifted since it was closed.</span> It
              was frozen at {closure.frozenCount} responses and now holds {rows.length}. Anything
              already quoted to the client was written against {closure.frozenCount}. Nothing has
              been discarded; the later responses are in the table below.
            </div>
          )}

          {/* ---- instrument history ---- */}
          {survey.changes.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                The instrument changed while it was in the field
              </h2>
              <p className="mt-2 text-sm text-amber-900">
                {predating} of {rows.length} responses predate a change, so some questions have a
                smaller base than the response count.
                {retiredCount > 0 &&
                  ` ${retiredCount} carry an option the instrument no longer offers and cannot be placed on the current scale.`}
              </p>
              <ul className="mt-3 space-y-2">
                {survey.changes.map((c) => (
                  <li key={c.date} className="text-sm text-amber-900">
                    <span className="font-semibold tabular-nums">{c.date}</span> {c.note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---- distributions ---- */}
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
              No responses yet.
              {survey.formPath && (
                <>
                  {" "}
                  The form is live at <span className="font-mono text-xs">{survey.formPath}</span>.
                </>
              )}
            </p>
          ) : (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: NAVY }}>
                Answers
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {dists.map((d) => (
                  <div key={d.question} className="rounded-xl border bg-white p-4">
                    <div className="mb-3">
                      <p className="font-mono text-[12px] font-semibold" style={{ color: NAVY }}>
                        {d.question}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500 tabular-nums">
                        {d.base} answered
                        {d.notAsked > 0 && ` · ${d.notAsked} never asked`}
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {d.values.slice(0, 10).map((v) => (
                        <Bar key={v.value} label={v.value} count={v.count} base={d.base} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---- responses ---- */}
          {rows.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: NAVY }}>
                Responses
              </h2>
              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3">Respondent</th>
                      <th className="px-4 py-3">Answers</th>
                      <th className="px-4 py-3">Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-[12px] tabular-nums text-gray-600">
                          {r.createdAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium" style={{ color: NAVY }}>
                            {r.respondent ?? <span className="text-gray-400">Anonymous</span>}
                          </div>
                          {r.respondentDetail && (
                            <div className="text-[11px] text-gray-500">{r.respondentDetail}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">
                          {Object.keys(r.answers).length}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {r.status && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                                {r.status}
                              </span>
                            )}
                            {r.notAsked.length > 0 && (
                              <span
                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                                title={`Never shown: ${r.notAsked.join(", ")}`}
                              >
                                {r.notAsked.length} not asked
                              </span>
                            )}
                            {r.usesRetiredOption && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                Retired option
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
