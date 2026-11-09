import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";
import { awaitingApproval, dayLabel, weekOfStart } from "@/lib/arabellaLearn";
import { ARABELLA_MODULES } from "@/lib/arabella-modules";
import { MarkRead, ModuleTest, ReviewTest } from "@/components/staff/ModuleTest";
import ModuleBody from "@/components/staff/ModuleBody";
import ModuleApproval from "@/components/arabella/ModuleApproval";
import StaffShell, { card, INK, LINE, MUTED, SECOND, Eyebrow } from "@/components/staff/StaffShell";

// One module. Staff: read it, then the questions. Dr Chito, before approval:
// the same text with every answer and its reason, and Approve or Send back
// pinned under her thumb.

export const metadata: Metadata = { title: "Arabella Women's Health: training", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const CLINICAL = new Set(ARABELLA_MODULES.filter((m) => m.clinical).map((m) => m.code));

export default async function ArabellaModule({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ review?: string }> }) {
  const site = ARABELLA;
  const session = await getSiteSession(site);
  if (!session) redirect(`${site.pathPrefix}/login`);
  const base = `${site.pathPrefix}/learn`;
  const api = `${site.apiPrefix}/learn`;
  const { code } = await params;

  const protocol = await prisma.protocol.findUnique({
    where: { clientId_code: { clientId: session.clientId, code: decodeURIComponent(code) } },
    select: {
      id: true, code: true, domain: true, title: true, summary: true, body: true, version: true, approvedAt: true, isActive: true,
      startsOn: true, sentBackAt: true, approvalNote: true,
      approvedBy: { select: { name: true } },
      questions: { orderBy: { sortOrder: "asc" }, select: { id: true, question: true, options: true, correct: true, because: true } },
    },
  });
  if (!protocol || !protocol.isActive) notFound();
  const me = await prisma.staffMember.findUnique({ where: { id: session.sub }, select: { canApproveClinical: true } });
  const approver = !!me?.canApproveClinical;
  if (!protocol.approvedAt && !approver) notFound();

  const week = weekOfStart(protocol.startsOn);
  const notYet = !!protocol.startsOn && protocol.startsOn.getTime() > Date.now();
  const header = (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Eyebrow>{protocol.domain}{week ? ` · week ${week}` : ""}</Eyebrow>
        {approver && CLINICAL.has(protocol.code) && <span style={{ color: "#B0392B", fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em" }}>CLINICAL</span>}
      </div>
      <h2 style={{ color: INK, fontSize: 24, lineHeight: 1.2, margin: "6px 0 0" }}>{protocol.title}</h2>
      <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.55, margin: "8px 0 0" }}>{protocol.summary}</p>
    </>
  );
  const body = (
    <div style={{ ...card, padding: "20px 18px" }}>
      {protocol.body ? <ModuleBody text={protocol.body} /> : <p style={{ color: MUTED, margin: 0 }}>The text for this module is being written.</p>}
    </div>
  );

  // ---- Dr Chito, before approval: everything, answers included ----------
  if (!protocol.approvedAt) {
    const waiting = (await awaitingApproval(session.clientId)).filter((w) => !w.sentBackAt && w.id !== protocol.id);
    const next = waiting[0];
    return (
      <StaffShell site={site} title="Check and approve" backTo={{ href: `${base}/approve`, label: "To approve" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <div>{header}</div>
          <p style={{ color: MUTED, fontSize: 14, margin: 0, lineHeight: 1.55 }}>
            {week ? `Opens to staff on ${dayLabel(protocol.startsOn!)} (week ${week}), once approved.` : "Opens to staff as soon as you approve it."}
            {CLINICAL.has(protocol.code) ? " Clinical: check every threshold and kit list matches what you want staff to do here." : ""}
          </p>
          {protocol.sentBackAt && protocol.approvalNote && (
            <div style={{ ...card, background: "#FDF2F0", borderColor: "transparent", padding: 16 }}>
              <div style={{ color: INK, fontWeight: 700, fontSize: 14.5 }}>You sent this back</div>
              <div style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>{protocol.approvalNote}</div>
            </div>
          )}
          {body}
          <div>
            <h3 style={{ color: INK, fontSize: 18, margin: "4px 0 10px" }}>The questions, with the answers</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {protocol.questions.map((q, i) => (
                <div key={q.id} style={{ ...card, padding: 16 }}>
                  <div style={{ color: INK, fontWeight: 650, fontSize: 15 }}>{i + 1}. {q.question}</div>
                  <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
                    {q.options.map((o, j) => (
                      <div key={j} style={{ fontSize: 14.5, color: j === q.correct ? SECOND : "#1F2937", fontWeight: j === q.correct ? 700 : 400 }}>
                        {j === q.correct ? "✓ " : "· "}{o}
                      </div>
                    ))}
                  </div>
                  {q.because && <p style={{ color: MUTED, fontSize: 13.5, margin: "8px 0 0", lineHeight: 1.5 }}>Shown after answering: {q.because}</p>}
                </div>
              ))}
            </div>
          </div>
          <ModuleApproval
            protocolId={protocol.id}
            api={api}
            listHref={`${base}/approve`}
            nextHref={next ? `${base}/${encodeURIComponent(next.code)}` : null}
            sentBack={!!protocol.sentBackAt}
          />
        </div>
      </StaffShell>
    );
  }

  // ---- Approved but its week has not come ------------------------------
  if (notYet) {
    return (
      <StaffShell site={site} title="Training" backTo={{ href: base, label: "All training" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div>{header}</div>
          <div style={card}>
            <div style={{ color: INK, fontWeight: 700 }}>Opens on {dayLabel(protocol.startsOn!)}</div>
            <p style={{ color: MUTED, fontSize: 14.5, margin: "4px 0 0" }}>It will be on your training page then.</p>
          </div>
          {approver && body}
        </div>
      </StaffShell>
    );
  }

  // ---- Staff: read, then the questions ----------------------------------
  const progress = await prisma.protocolProgress.findUnique({
    where: { protocolId_staffId: { protocolId: protocol.id, staffId: session.sub } },
    select: { studiedAt: true, passed: true, againstVersion: true, reviewStage: true },
  });
  const reviewing = (await searchParams).review === "1";
  const current = progress && progress.againstVersion === protocol.version;
  const read = !!(current && progress?.studiedAt);
  const passed = !!(current && progress?.passed);
  const qs = protocol.questions.map((q) => ({ id: q.id, question: q.question, options: q.options }));

  return (
    <StaffShell site={site} title="Training" backTo={{ href: base, label: "All training" }}>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          {header}
          {passed && <p style={{ color: SECOND, fontWeight: 700, margin: "10px 0 0" }}>Passed ✓</p>}
        </div>

        {reviewing && passed && qs.length > 0 && (
          <section>
            <h3 style={{ color: INK, fontSize: 19, margin: "0 0 6px" }}>Two quick questions</h3>
            <p style={{ color: MUTED, margin: "0 0 14px" }}>From a module you passed. Answering again later is what makes it stick.</p>
            <ReviewTest
              api={api}
              protocolId={protocol.id}
              questions={[0, 1].map((i) => qs[((progress?.reviewStage ?? 0) * 2 + i) % qs.length]).filter((q, i, a) => a.indexOf(q) === i)}
            />
          </section>
        )}

        {body}

        <MarkRead api={api} protocolId={protocol.id} done={read} />

        {qs.length > 0 && read && (
          <section>
            <h3 style={{ color: INK, fontSize: 19, margin: "0 0 4px" }}>The questions</h3>
            <p style={{ color: MUTED, fontSize: 14, margin: "0 0 14px" }}>Four in five is a pass. After you submit, each answer shows why.</p>
            <ModuleTest api={api} protocolId={protocol.id} questions={qs.map(({ question, options }) => ({ question, options }))} passedAlready={passed} />
          </section>
        )}

        {protocol.approvedBy && (
          <p style={{ color: MUTED, fontSize: 13, margin: 0, borderTop: `1px solid ${LINE}`, paddingTop: 12 }}>Approved by {protocol.approvedBy.name}.</p>
        )}
      </div>
    </StaffShell>
  );
}
