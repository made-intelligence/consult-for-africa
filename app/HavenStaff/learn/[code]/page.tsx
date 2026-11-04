import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/staffAuth";
import { MarkRead, ModuleTest, ApproveModule, ReviewTest } from "@/components/haven/ModuleTest";

export const metadata: Metadata = { title: "Haven Paediatric Centre: training", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

/** Plain text with short headings and numbered steps, rendered as such. */
function Body({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        const heading = lines.length === 1 && lines[0].length < 70 && !/[.:;]$/.test(lines[0]) && !/^\d+[.)]/.test(lines[0]);
        if (heading) return <h3 key={i} style={{ color: NAVY, fontSize: 17, margin: "10px 0 0" }}>{lines[0].replace(/^#+\s*/, "")}</h3>;
        return (
          <div key={i} style={{ fontSize: 15.5, lineHeight: 1.7, color: "#1F2937" }}>
            {lines.map((l, j) => <div key={j} style={{ paddingLeft: /^(\d+[.)]|[-•])\s/.test(l) ? 4 : 0 }}>{l}</div>)}
          </div>
        );
      })}
    </div>
  );
}

export default async function ModulePage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ review?: string }> }) {
  const session = await getStaffSession();
  if (!session) redirect("/HavenStaff/login");
  const { code } = await params;

  const protocol = await prisma.protocol.findUnique({
    where: { clientId_code: { clientId: session.clientId, code: decodeURIComponent(code) } },
    select: {
      id: true, code: true, domain: true, title: true, summary: true, body: true, version: true, approvedAt: true, isActive: true,
      approvedBy: { select: { name: true } },
      questions: { orderBy: { sortOrder: "asc" }, select: { id: true, question: true, options: true } },
    },
  });
  if (!protocol || !protocol.isActive) notFound();
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { canApproveClinical: true } });
  if (!protocol.approvedAt && !me?.canApproveClinical) notFound();

  const progress = await prisma.protocolProgress.findUnique({
    where: { protocolId_staffId: { protocolId: protocol.id, staffId: session.sub } },
    select: { studiedAt: true, passed: true, againstVersion: true, reviewStage: true },
  });
  const reviewing = (await searchParams).review === "1";
  const current = progress && progress.againstVersion === protocol.version;
  const read = !!(current && progress?.studiedAt);
  const passed = !!(current && progress?.passed);

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "40px 20px 44px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 16 }} />
          <Link href="/HavenStaff/learn" style={{ color: "#9FC6D1", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; All training</Link>
          <div style={{ color: "#9FC6D1", fontWeight: 700, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", marginTop: 14 }}>{protocol.domain}</div>
          <h1 style={{ color: "#fff", fontSize: 28, lineHeight: 1.2, margin: "8px 0 0" }}>{protocol.title}</h1>
          <p style={{ color: "#B9CBD8", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0" }}>{protocol.summary}</p>
          {passed && <p style={{ color: GOLD, fontWeight: 700, margin: "12px 0 0" }}>Passed</p>}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 72px", display: "grid", gap: 24 }}>
        {reviewing && passed && protocol.questions.length > 0 && (
          <section>
            <h2 style={{ color: NAVY, fontSize: 21, margin: "0 0 6px" }}>Two quick questions</h2>
            <p style={{ color: MUTED, margin: "0 0 14px" }}>From a module you passed. Answering again later is what makes it stick.</p>
            <ReviewTest
              protocolId={protocol.id}
              // A different pair at each stage, so a re-test is not the same two questions.
              questions={[0, 1].map((i) => protocol.questions[((progress?.reviewStage ?? 0) * 2 + i) % protocol.questions.length]).filter((q, i, a) => a.indexOf(q) === i)}
            />
          </section>
        )}
        {!protocol.approvedAt && <ApproveModule protocolId={protocol.id} />}
        {protocol.approvedAt && protocol.approvedBy && (
          <p style={{ color: MUTED, fontSize: 13.5, margin: 0 }}>Approved by {protocol.approvedBy.name}.</p>
        )}

        <div style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24 }}>
          {protocol.body ? <Body text={protocol.body} /> : <p style={{ color: MUTED }}>The text for this module is being written.</p>}
        </div>

        {protocol.approvedAt && <MarkRead protocolId={protocol.id} done={read} />}

        {protocol.questions.length > 0 && (read || !protocol.approvedAt) && (
          <section>
            <h2 style={{ color: NAVY, fontSize: 21, margin: "0 0 14px" }}>The questions</h2>
            {protocol.approvedAt ? (
              <ModuleTest protocolId={protocol.id} questions={protocol.questions.map((q) => ({ question: q.question, options: q.options }))} passedAlready={passed} />
            ) : (
              // The approver sees the questions and the answers, to check them.
              <ApproverPreview protocolId={protocol.id} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}

async function ApproverPreview({ protocolId }: { protocolId: string }) {
  const qs = await prisma.protocolQuestion.findMany({ where: { protocolId }, orderBy: { sortOrder: "asc" } });
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {qs.map((q, i) => (
        <div key={q.id} style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: 16 }}>
          <div style={{ color: NAVY, fontWeight: 650 }}>{i + 1}. {q.question}</div>
          <ol type="a" style={{ margin: "8px 0 0", paddingLeft: 22, fontSize: 14.5 }}>
            {q.options.map((o, j) => (
              <li key={j} style={{ fontWeight: j === q.correct ? 700 : 400, color: j === q.correct ? "#1F7A8C" : "#1F2937" }}>
                {o}{j === q.correct ? "  (answer)" : ""}
              </li>
            ))}
          </ol>
          {q.because && <p style={{ color: MUTED, fontSize: 13.5, margin: "8px 0 0" }}>Because: {q.because}</p>}
        </div>
      ))}
    </div>
  );
}
