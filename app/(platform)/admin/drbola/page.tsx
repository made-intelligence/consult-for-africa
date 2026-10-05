import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { REFERRAL_STATUSES, SURVEY_IDS, UPLOAD_ENGAGEMENT } from "@/lib/drbola";
import StatusButtons from "./StatusButtons";

export const dynamic = "force-dynamic";

// Everything Dr Bola Akinola's site collects, in one queue: his own feedback
// while the site is in preview, referrals from doctors, second opinion
// requests and consultation requests.

type P = Record<string, unknown> & { status?: string; reference?: string; preview?: boolean };

const ENQUIRY_STATUSES = ["New", "Contacted", "Booked", "Closed"];

const fmt = (d: Date) =>
  d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

const s = (v: unknown) => (typeof v === "string" && v ? v : null);

export default async function DrBolaAdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"].includes(session.user.role)) redirect("/dashboard");

  const [rows, uploads] = await Promise.all([
    prisma.auditSurveyResponse.findMany({
      where: { survey: { in: Object.values(SURVEY_IDS) } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.auditUpload.findMany({
      where: { engagement: UPLOAD_ENGAGEMENT },
      select: { id: true, section: true, filename: true },
    }),
  ]);
  const filesByRef = new Map<string, { id: string; filename: string }[]>();
  for (const u of uploads) filesByRef.set(u.section, [...(filesByRef.get(u.section) ?? []), u]);

  const group = (id: string) => rows.filter((r) => r.survey === id);
  const feedback = group(SURVEY_IDS.feedback);
  const referrals = group(SURVEY_IDS.referral);
  const patients = rows.filter((r) => r.survey === SURVEY_IDS.secondOpinion || r.survey === SURVEY_IDS.consultation);

  const card = "rounded-xl border border-slate-200 bg-white p-4";

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Dr Bola Akinola: site queue" />
      <div className="flex-1 space-y-10 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <a href="/drbola" target="_blank" className="rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-white">
            Open the site
          </a>
          <span>
            {feedback.length} feedback · {referrals.length} referrals · {patients.length} patient enquiries
          </span>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Feedback on the preview</h2>
          {feedback.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
          <div className="space-y-2">
            {feedback.map((r) => {
              const p = r.payload as P;
              return (
                <div key={r.id} className={card}>
                  <div className="text-xs text-slate-500">
                    {fmt(r.createdAt)} · <span className="font-mono">{s(p.page)}</span> · {s(p.name) ?? "Anonymous"}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{s(p.comment)}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Referrals</h2>
          {referrals.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
          <div className="space-y-3">
            {referrals.map((r) => {
              const p = r.payload as P;
              const files = filesByRef.get(p.reference ?? "") ?? [];
              return (
                <div key={r.id} className={card}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-medium text-slate-900">
                      <span className="font-mono">{p.reference}</span> · {s(p.fullName)}, {s(p.specialty)}, {s(p.hospital)}
                      {p.preview && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">test</span>}
                    </div>
                    <div className="text-xs text-slate-500">
                      {fmt(r.createdAt)} · {s(p.urgency)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    Patient {s(p.patientRef)}
                    {s(p.patientAge) ? `, ${s(p.patientAge)}` : ""}
                    {s(p.patientSex) ? `, ${s(p.patientSex)}` : ""}: <b>{s(p.diagnosis)}</b>
                  </div>
                  {s(p.summary) && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{s(p.summary)}</p>}
                  <div className="mt-1 text-xs text-slate-500">
                    {s(p.phone)} · {s(p.email)}
                    {s(p.mdcn) ? ` · MDCN ${s(p.mdcn)}` : ""}
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {files.map((f) => (
                        <a key={f.id} href={`/api/osteon-audit/upload/${f.id}`} target="_blank" className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200">
                          {f.filename}
                        </a>
                      ))}
                    </div>
                  )}
                  <StatusButtons id={r.id} current={p.status ?? "Received"} options={[...REFERRAL_STATUSES]} />
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Second opinions and consultations</h2>
          {patients.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
          <div className="space-y-3">
            {patients.map((r) => {
              const p = r.payload as P;
              const files = filesByRef.get(p.reference ?? "") ?? [];
              return (
                <div key={r.id} className={card}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-medium text-slate-900">
                      {r.survey === SURVEY_IDS.secondOpinion ? "Second opinion" : "Consultation"} ·{" "}
                      <span className="font-mono">{p.reference}</span> · {s(p.fullName)}
                      {p.preview && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">test</span>}
                    </div>
                    <div className="text-xs text-slate-500">{fmt(r.createdAt)}</div>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {s(p.concern)} · for {s(p.forWhom)} · {s(p.based)} · prefers {s(p.contactBy)}
                  </div>
                  {s(p.message) && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{s(p.message)}</p>}
                  <div className="mt-1 text-xs text-slate-500">
                    {s(p.phone)} · {s(p.email)}
                    {s(p.heard) ? ` · heard via ${s(p.heard)}` : ""}
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {files.map((f) => (
                        <a key={f.id} href={`/api/osteon-audit/upload/${f.id}`} target="_blank" className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200">
                          {f.filename}
                        </a>
                      ))}
                    </div>
                  )}
                  <StatusButtons id={r.id} current={p.status ?? "New"} options={ENQUIRY_STATUSES} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
