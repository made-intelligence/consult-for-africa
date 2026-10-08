import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { SURVEYS } from "@/lib/surveys/registry";
import { ARABELLA_ENGAGEMENT, PRIORITY_EIGHT, REQUEST_SECTIONS, sectionLabel } from "@/lib/arabella-audit";

export const dynamic = "force-dynamic";

// What Arabella has sent through /ArabellaProject. The four surveys already
// have a reader at /admin/surveys/<slug>, so this page counts them and links
// across rather than re-aggregating them here.

const CARD = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 } as const;

const prettySize = (b: number) =>
  b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

const when = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

export default async function ArabellaAuditPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const allowed = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"].includes(session.user.role);
  if (!allowed) redirect("/dashboard");

  const surveys = SURVEYS.filter((s) => s.slug.startsWith("arabella-"));
  const [uploads, counts] = await Promise.all([
    prisma.auditUpload.findMany({
      where: { engagement: ARABELLA_ENGAGEMENT },
      orderBy: { createdAt: "desc" },
      select: { id: true, section: true, filename: true, sizeBytes: true, uploadedBy: true, note: true, createdAt: true },
    }),
    prisma.auditSurveyResponse.groupBy({
      by: ["survey"],
      where: { survey: { in: surveys.map((s) => s.slug) } },
      _count: true,
      _max: { createdAt: true },
    }),
  ]);

  const bySection = new Map<string, typeof uploads>();
  for (const u of uploads) bySection.set(u.section, [...(bySection.get(u.section) ?? []), u]);
  // A file sent as "priority" could answer any of the eight, so only chase a
  // priority section when nothing at all has come in under the priority tag.
  const priorityOutstanding = PRIORITY_EIGHT.filter(
    (p) => !bySection.has(p.section) && !bySection.has("priority")
  );
  const silent = REQUEST_SECTIONS.filter((s) => !bySection.has(s.key));
  const ordered = [...bySection.entries()].sort(([a], [b]) => {
    const rank = (k: string) => (k === "priority" ? -1 : k === "other" ? 99 : k.charCodeAt(0));
    return rank(a) - rank(b);
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Arabella Audit: Documents & Surveys"
        subtitle={`${uploads.length} document${uploads.length === 1 ? "" : "s"} in · ${counts.reduce((a, c) => a + c._count, 0)} survey responses`}
        backHref="/dashboard"
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section style={{ ...CARD, padding: 22 }} className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#0B3C5D" }}>Documents received</h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Uploaded from{" "}
                <a href="/ArabellaProject" className="underline" style={{ color: "#1F7A8C" }}>/ArabellaProject</a>.
                Click a file to open it. The link is presigned and expires in five minutes.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold" style={{ color: uploads.length ? "#0B3C5D" : "#94a3b8" }}>{uploads.length}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {uploads.length ? `last ${when(uploads[0].createdAt)}` : "nothing yet"}
              </div>
            </div>
          </div>

          {priorityOutstanding.length > 0 && (
            <div className="text-sm" style={{ background: "#FDF3E3", borderLeft: "3px solid #D4AF37", padding: "10px 14px", color: "#7a5b1f" }}>
              <b>Priority items with nothing against them yet:</b>
              <ul className="mt-1 list-disc pl-5">
                {priorityOutstanding.map((p) => (
                  <li key={p.n}>{p.n}. {p.what} <span style={{ color: "#94a3b8" }}>(section {p.section})</span></li>
                ))}
              </ul>
            </div>
          )}

          {uploads.length === 0 && (
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Nothing uploaded yet. Files appear here the moment one lands, and an email goes out too.
            </p>
          )}

          {ordered.map(([key, files]) => (
            <div key={key}>
              <h4 className="text-sm font-semibold mb-1" style={{ color: "#0B3C5D" }}>
                {sectionLabel(key)} <span className="font-normal" style={{ color: "#6B7280" }}>({files.length})</span>
              </h4>
              <table className="w-full text-sm">
                <tbody>
                  {files.map((f) => (
                    <tr key={f.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td className="py-1.5 pr-3">
                        <a href={`/api/arabella-audit/upload/${f.id}`} target="_blank" rel="noreferrer" className="underline" style={{ color: "#1F7A8C" }}>
                          {f.filename}
                        </a>
                        {f.note && <span className="ml-2 text-xs" style={{ color: "#6B7280" }}>&ldquo;{f.note}&rdquo;</span>}
                      </td>
                      <td className="py-1.5 w-24 text-right text-xs" style={{ color: "#6B7280" }}>{prettySize(f.sizeBytes)}</td>
                      <td className="py-1.5 pl-3 w-48 text-right text-xs" style={{ color: "#6B7280" }}>
                        {f.uploadedBy || "unnamed"} &middot; {when(f.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {silent.length > 0 && uploads.length > 0 && (
            <p className="text-xs" style={{ color: "#6B7280" }}>
              <b>No documents yet against:</b> {silent.map((s) => s.key).join(", ")}.
            </p>
          )}
        </section>

        <section style={{ ...CARD, padding: 22 }}>
          <h2 className="text-lg font-bold mb-3" style={{ color: "#0B3C5D" }}>Surveys</h2>
          <table className="w-full text-sm">
            <tbody>
              {surveys.map((s) => {
                const c = counts.find((x) => x.survey === s.slug);
                return (
                  <tr key={s.slug} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td className="py-2 pr-3">
                      <a href={`/admin/surveys/${s.slug}`} className="underline font-semibold" style={{ color: "#1F7A8C" }}>{s.title}</a>
                      <span className="ml-2 text-xs" style={{ color: "#6B7280" }}>{s.audience}</span>
                    </td>
                    <td className="py-2 w-16 text-right font-bold" style={{ color: c ? "#0B3C5D" : "#94a3b8" }}>{c?._count ?? 0}</td>
                    <td className="py-2 pl-3 w-40 text-right text-xs" style={{ color: "#6B7280" }}>
                      {c?._max.createdAt ? `last ${when(c._max.createdAt)}` : "no responses yet"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
