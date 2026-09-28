import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { displayNameFor } from "@/lib/cadreSalutation";
import {
  tierFor,
  specialtyProvenance,
  licenceProvenance,
  availabilityIsStale,
} from "@/lib/cadreHealth/candidateVisibility";

/**
 * One professional, as a hospital reads them.
 *
 * Two changes from the page this replaces. It was unreachable from search: the
 * button there recorded a view and never navigated, so the profile could only be
 * opened from an application. And it showed the candidate's UK, US, Canada and
 * Gulf emigration readiness to a Lagos employer, which is a strange thing to put
 * in front of someone deciding whether to hire them.
 *
 * Contact details appear only where the professional has agreed to this
 * organisation having them.
 */
export const dynamic = "force-dynamic";

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const { id } = await params;

  const p = await prisma.cadreProfessional.findFirst({
    where: { id, accountStatus: { not: "SUSPENDED" } },
    include: {
      credentials: {
        select: {
          id: true,
          type: true,
          regulatoryBody: true,
          verificationStatus: true,
          verifiedAt: true,
          expiryDate: true,
        },
      },
      qualifications: {
        select: {
          id: true,
          type: true,
          name: true,
          institution: true,
          yearObtained: true,
        },
        orderBy: { yearObtained: "desc" },
      },
      workHistory: {
        select: {
          id: true,
          facilityName: true,
          role: true,
          department: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
        },
        orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
        take: 10,
      },
    },
  });
  if (!p) notFound();

  // Contact is released by consent, not by being logged in.
  const consent = await prisma.cadreContactRequest.findFirst({
    where: { orgId: ctx.org.id, professionalId: id, status: "ACCEPTED" },
    select: { id: true, respondedAt: true },
  });

  const applied = await prisma.cadreMandateMatch.findFirst({
    where: { professionalId: id, mandate: { employerOrgId: ctx.org.id } },
    select: { id: true, source: true, mandate: { select: { id: true, title: true } } },
  });

  // Counted rather than left silent, so profile analytics stay honest.
  await prisma.cadreProfessional
    .update({
      where: { id },
      data: { profileViews: { increment: 1 }, lastViewedAt: new Date() },
    })
    .catch(() => {});

  const tier = tierFor(p);
  const specialty = specialtyProvenance(p);
  const licence = licenceProvenance(p);
  const name = displayNameFor(p);
  const location = p.isDiaspora
    ? p.diasporaCountry ?? p.country
    : [p.city, p.state].filter(Boolean).join(", ") || p.country;

  const CREDENTIAL_LABELS: Record<string, string> = {
    PRACTICING_LICENSE: "Practising licence",
    FULL_REGISTRATION: "Full registration",
    COGS: "Certificate of good standing",
    SPECIALIST_REGISTRATION: "Specialist registration",
    ADDITIONAL_LICENSE: "Additional licence",
  };
  const QUAL_LABELS: Record<string, string> = {
    PRIMARY_DEGREE: "Primary degree",
    POSTGRADUATE: "Postgraduate",
    FELLOWSHIP: "Fellowship",
    CERTIFICATION: "Certification",
    INTERNATIONAL_EXAM: "International exam",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/oncadre/employer/candidates"
        className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
      >
        &larr; Candidates
      </Link>

      <section
        className="rounded-2xl bg-white p-6 sm:p-8"
        style={{
          border: "1px solid #E8EBF0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {getCadreLabel(p.cadre)}
              {specialty && (
                <>
                  {" / "}
                  <span
                    title={specialty.note}
                    style={{
                      borderBottom: specialty.confirmed ? "none" : "1px dashed #CBD5E1",
                    }}
                  >
                    {specialty.value}
                  </span>
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {location}
              {p.yearsOfExperience != null && ` · ${p.yearsOfExperience} years`}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: tier.bg, color: tier.color }}
            title={tier.meaning}
          >
            {tier.label}
          </span>
        </div>

        {applied && (
          <div
            className="mt-5 rounded-xl px-4 py-3 text-sm"
            style={{ background: "rgba(11,60,93,0.05)", color: "#0B3C5D" }}
          >
            {applied.source === "APPLIED" ? "Applied to " : "In your pipeline for "}
            <Link
              href={`/oncadre/employer/pipeline/${applied.mandate.id}`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {applied.mandate.title}
            </Link>
          </div>
        )}

        <div className="mt-5">
          {consent ? (
            <div
              className="rounded-xl p-4"
              style={{ background: "#ecfdf5", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "#065f46" }}>
                They agreed to hear from you
              </p>
              <dl className="mt-2 space-y-1 text-sm" style={{ color: "#047857" }}>
                <div>
                  <dt className="inline font-medium">Email: </dt>
                  <dd className="inline">{p.email}</dd>
                </div>
                {p.phone && (
                  <div>
                    <dt className="inline font-medium">Phone: </dt>
                    <dd className="inline">{p.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ background: "#F8F9FB" }}>
              <p className="text-sm text-gray-600">
                We do not pass on an email or a phone number until the professional
                agrees. Ask from the Candidates list and we will put your message to
                them.
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        className="rounded-2xl bg-white p-6"
        style={{
          border: "1px solid #E8EBF0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        <h2 className="text-lg font-bold text-gray-900">What we actually know</h2>
        <p className="mt-1 text-sm text-gray-500">
          Where each of these came from, so you can weigh it.
        </p>
        <dl className="mt-4 space-y-3">
          <Claim title={licence.value} note={licence.note} confirmed={licence.confirmed} />
          {specialty && (
            <Claim
              title={`Specialty: ${specialty.value}`}
              note={specialty.note}
              confirmed={specialty.confirmed}
            />
          )}
          <Claim
            title={tier.label}
            note={tier.meaning}
            confirmed={tier.tier === "OPEN"}
          />
          {p.availability && (
            <Claim
              title={`They said: ${p.availability.toLowerCase().replace(/_/g, " ")}`}
              note={
                availabilityIsStale(p.availabilityUpdatedAt)
                  ? "Said more than six months ago, so it may have changed"
                  : `Updated ${p.availabilityUpdatedAt?.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`
              }
              confirmed={!availabilityIsStale(p.availabilityUpdatedAt)}
            />
          )}
          <Claim
            title={`Profile ${p.profileCompleteness}% complete`}
            note={
              p.profileCompleteness >= 70
                ? "Most of their record is filled in"
                : "Much of their record is still empty, so absence of a fact is not evidence"
            }
            confirmed={p.profileCompleteness >= 70}
          />
        </dl>
      </section>

      {p.credentials.length > 0 && (
        <Panel title="Credentials">
          <ul className="space-y-2">
            {p.credentials.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-gray-700">
                  {CREDENTIAL_LABELS[c.type] ?? c.type}
                  <span className="text-gray-400"> &middot; {c.regulatoryBody}</span>
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={
                    c.verificationStatus === "VERIFIED"
                      ? { background: "rgba(16,185,129,0.09)", color: "#059669" }
                      : { background: "#F3F4F6", color: "#6B7280" }
                  }
                >
                  {c.verificationStatus === "VERIFIED" ? "Verified" : "Not verified"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {p.qualifications.length > 0 && (
        <Panel title="Qualifications">
          <ul className="space-y-2">
            {p.qualifications.map((q) => (
              <li key={q.id} className="text-sm text-gray-700">
                <span className="font-medium">{q.name}</span>
                <span className="text-gray-400">
                  {" "}
                  &middot; {QUAL_LABELS[q.type] ?? q.type}
                  {q.institution ? ` · ${q.institution}` : ""}
                  {q.yearObtained ? ` · ${q.yearObtained}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {p.workHistory.length > 0 && (
        <Panel title="Where they have worked">
          <ul className="space-y-3">
            {p.workHistory.map((w) => (
              <li key={w.id}>
                <p className="text-sm font-medium text-gray-900">
                  {w.role}
                  {w.isCurrent && (
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(16,185,129,0.09)", color: "#059669" }}
                    >
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {w.facilityName}
                  {w.department ? ` · ${w.department}` : ""}
                </p>
                <p className="text-xs text-gray-400">
                  {w.startDate.getFullYear()}
                  {" to "}
                  {w.isCurrent ? "now" : (w.endDate?.getFullYear() ?? "")}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {p.summary && (
        <Panel title="In their words">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {p.summary}
          </p>
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl bg-white p-6"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Claim({
  title,
  note,
  confirmed,
}: {
  title: string;
  note: string;
  confirmed: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: confirmed ? "#10B981" : "#CBD5E1" }}
      />
      <div>
        <dt className="text-sm font-medium text-gray-900">{title}</dt>
        <dd className="text-xs text-gray-500">{note}</dd>
      </div>
    </div>
  );
}
