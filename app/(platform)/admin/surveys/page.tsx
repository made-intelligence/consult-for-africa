import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ELEVATED_ROLES } from "@/lib/constants";
import { surveysByClient, SURVEYS } from "@/lib/surveys/registry";
import { surveyTotals } from "@/lib/surveys/archive";

export const dynamic = "force-dynamic";

/**
 * Every survey the firm has fielded, in one place.
 *
 * Before this page a survey was discoverable only by reading the route that
 * accepted it, so eight of the seventeen below had no reader at all and the
 * only way to know whether anything had arrived was to run a script.
 *
 * Grouped by client because that is how the work is organised and how someone
 * arrives here: they are looking for a client's research, not for a slug.
 */

const NAVY = "#0F2744";

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "quiet" }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      <div
        className="mt-1 text-2xl font-bold tabular-nums"
        style={{ color: tone === "quiet" ? "#94a3b8" : NAVY }}
      >
        {value}
      </div>
    </div>
  );
}

function fmt(d: Date | null) {
  return d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
}

export default async function SurveysIndexPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ELEVATED_ROLES.includes(session.user.role as (typeof ELEVATED_ROLES)[number])) {
    redirect("/dashboard");
  }

  const [totals, closures, engagements] = await Promise.all([
    surveyTotals(),
    prisma.surveyClosure.findMany(),
    prisma.engagement.findMany({
      where: { id: { in: SURVEYS.map((s) => s.engagementId).filter((x): x is string => !!x) } },
      select: { id: true, name: true },
    }),
  ]);
  const closedBySlug = new Map(closures.map((c) => [c.survey, c]));
  const engagementById = new Map(engagements.map((e) => [e.id, e.name]));

  const groups = surveysByClient();
  const totalResponses = [...totals.values()].reduce((a, t) => a + t.count, 0);
  const live = SURVEYS.filter((s) => !closedBySlug.has(s.slug) && (totals.get(s.slug)?.count ?? 0) > 0);
  const empty = SURVEYS.filter((s) => (totals.get(s.slug)?.count ?? 0) === 0);
  const unlinked = SURVEYS.filter((s) => !s.engagementId);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Surveys"
        subtitle={`${SURVEYS.length} surveys · ${totalResponses} responses archived`}
        backHref="/dashboard"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Surveys" value={SURVEYS.length} />
            <Stat label="Responses" value={totalResponses} />
            <Stat label="Collecting" value={live.length} />
            <Stat label="Nothing yet" value={empty.length} tone="quiet" />
          </div>

          {unlinked.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">{unlinked.length} surveys are not tied to an
                engagement.</span>{" "}
                Their responses are archived but cannot be found from the client&rsquo;s file.
                Fixing one means setting <code className="rounded bg-amber-100 px-1">engagementId</code>{" "}
                in <code className="rounded bg-amber-100 px-1">lib/surveys/registry.ts</code>, which
                needs the engagement to exist first.
              </p>
            </div>
          )}

          {groups.map((group) => (
            <section key={group.client}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: NAVY }}>
                {group.client}
              </h2>
              <div className="overflow-hidden rounded-xl border bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Survey</th>
                      <th className="px-4 py-3">Audience</th>
                      <th className="px-4 py-3 text-right">Responses</th>
                      <th className="px-4 py-3">Collected</th>
                      <th className="px-4 py-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.surveys.map((s) => {
                      const t = totals.get(s.slug) ?? { count: 0, first: null, last: null };
                      const closure = closedBySlug.get(s.slug);
                      const drifted = closure && t.count !== closure.frozenCount;
                      return (
                        <tr key={s.slug} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/surveys/${s.slug}`}
                              className="font-medium hover:underline"
                              style={{ color: NAVY }}
                            >
                              {s.title}
                            </Link>
                            <div className="mt-0.5 font-mono text-[11px] text-gray-400">{s.slug}</div>
                            {s.engagementId && engagementById.get(s.engagementId) && (
                              <div className="mt-0.5 text-[11px] text-gray-500">
                                {engagementById.get(s.engagementId)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{s.audience}</td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            <span
                              className="font-semibold"
                              style={{ color: t.count === 0 ? "#94a3b8" : NAVY }}
                            >
                              {t.count}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[12px] text-gray-500">
                            {t.count === 0 ? "" : `${fmt(t.first)} to ${fmt(t.last)}`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {closure ? (
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                  Closed
                                </span>
                              ) : t.count > 0 ? (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                  Collecting
                                </span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                                  Nothing yet
                                </span>
                              )}
                              {drifted && (
                                <span
                                  className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                                  title={`Frozen at ${closure.frozenCount}, now ${t.count}`}
                                >
                                  Drifted
                                </span>
                              )}
                              {s.changes.length > 0 && (
                                <span
                                  className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                                  title="The instrument changed while it was in the field"
                                >
                                  Instrument changed
                                </span>
                              )}
                              {!s.anonymous && (
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                                  Named
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
