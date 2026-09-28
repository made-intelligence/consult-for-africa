import { redirect } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { replyOverdueCutoff } from "@/lib/cadreHealth/matchStages";

/**
 * What needs this hospital today, and nothing else.
 *
 * The old dashboard showed two counters that were almost always zero, a stat
 * card that linked to itself, and a verification panel that said "contact us"
 * and named nobody. It answered no question a person arriving at work would ask.
 */
export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const overdueBefore = replyOverdueCutoff();
  const orgWhere = { mandate: { employerOrgId: ctx.org.id } };

  const [
    newApplicants,
    overdueApplicants,
    answeredApproaches,
    pendingApproaches,
    liveRoles,
    rolesWithNobody,
    registerSize,
    openToApproach,
  ] = await Promise.all([
    prisma.cadreMandateMatch.count({
      where: { ...orgWhere, source: "APPLIED", status: "NEW" },
    }),
    prisma.cadreMandateMatch.count({
      where: {
        ...orgWhere,
        source: "APPLIED",
        status: "NEW",
        createdAt: { lt: overdueBefore },
      },
    }),
    prisma.cadreContactRequest.count({
      where: { orgId: ctx.org.id, status: "ACCEPTED" },
    }),
    prisma.cadreContactRequest.count({
      where: { orgId: ctx.org.id, status: "PENDING" },
    }),
    prisma.cadreMandate.count({
      where: {
        employerOrgId: ctx.org.id,
        status: { in: ["OPEN", "SHORTLISTED", "INTERVIEWING", "OFFER_EXTENDED"] },
      },
    }),
    prisma.cadreMandate.count({
      where: {
        employerOrgId: ctx.org.id,
        status: "OPEN",
        matches: { none: {} },
      },
    }),
    prisma.cadreProfessional.count({ where: { accountStatus: { not: "SUSPENDED" } } }),
    prisma.cadreProfessional.count({
      where: { availability: { in: ["ACTIVELY_LOOKING", "OPEN_TO_OFFERS"] } },
    }),
  ]);

  const nothingToDo =
    newApplicants === 0 && answeredApproaches === 0 && rolesWithNobody === 0;

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 sm:px-8 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #0B3C5D 0%, #0E4D6E 50%, #0B3C5D 100%)",
          boxShadow: "0 4px 24px rgba(11,60,93,0.18)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 80% at 90% 20%, rgba(212,175,55,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <p
            className="text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: "#D4AF37" }}
          >
            {ctx.org.name}
          </p>
          <h1
            className="mt-2 font-bold text-white"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            {nothingToDo
              ? `Good day, ${ctx.contactName}`
              : `${newApplicants + answeredApproaches} things need you`}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {registerSize.toLocaleString()} professionals on the register,{" "}
            {openToApproach.toLocaleString()} of them open to an approach right now.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500">What needs you</h2>

        {nothingToDo ? (
          <div
            className="rounded-2xl bg-white p-6"
            style={{
              border: "1px solid #E8EBF0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
            }}
          >
            <p className="text-sm text-gray-600">
              Nothing is waiting on you.{" "}
              {liveRoles === 0
                ? "You have no live roles, so the next move is either to post one or to go and find people yourself."
                : "Your live roles are covered. Sourcing is the thing that moves a search on when applications are quiet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/oncadre/employer/candidates"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "#0B3C5D", minHeight: "44px" }}
              >
                Search the register
              </Link>
              <Link
                href="/oncadre/employer/roles/new"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                style={{ border: "1px solid #E8EBF0", color: "#0B3C5D", minHeight: "44px" }}
              >
                Post a role
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {newApplicants > 0 && (
              <Task
                href="/oncadre/employer/pipeline"
                title={`${newApplicants} ${newApplicants === 1 ? "applicant has" : "applicants have"} not been looked at`}
                body={
                  overdueApplicants > 0
                    ? `${overdueApplicants} of them applied more than a week ago. People who hear nothing stop applying.`
                    : "They came to you. Each one is owed an answer."
                }
                urgent={overdueApplicants > 0}
              />
            )}
            {answeredApproaches > 0 && (
              <Task
                href="/oncadre/employer/candidates/approaches"
                title={`${answeredApproaches} ${answeredApproaches === 1 ? "person has" : "people have"} agreed to hear from you`}
                body="Their contact details are waiting. An approach goes cold quickly."
              />
            )}
            {rolesWithNobody > 0 && (
              <Task
                href="/oncadre/employer/roles"
                title={`${rolesWithNobody} open ${rolesWithNobody === 1 ? "role has" : "roles have"} nobody in the pipeline`}
                body="Posting and waiting is the slow way. Search the register and approach people directly."
              />
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Figure value={liveRoles} label="live roles" href="/oncadre/employer/roles" />
        <Figure
          value={pendingApproaches}
          label="approaches awaiting an answer"
          href="/oncadre/employer/candidates/approaches"
        />
        <Figure
          value={openToApproach}
          label="open to an approach"
          href="/oncadre/employer/candidates?openOnly=true"
        />
      </section>

      {!ctx.org.isVerified && (
        <Link
          href="/oncadre/employer/account"
          className="block rounded-2xl p-6 transition hover:opacity-95 sm:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.02))",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <h3 className="text-lg font-semibold text-gray-900">
            You can search, but you cannot yet approach anyone
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm text-gray-600">
            Approaching a professional puts your name in front of a doctor who did not
            ask to hear from you, so we check who you are first. It is quick.
          </p>
          <span
            className="mt-4 inline-block text-sm font-semibold"
            style={{ color: "#B8941E" }}
          >
            Start verification
          </span>
        </Link>
      )}
    </div>
  );
}

function Task({
  href,
  title,
  body,
  urgent,
}: {
  href: string;
  title: string;
  body: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-white p-5 transition-all duration-200 hover:shadow-md"
      style={{
        border: urgent ? "1px solid rgba(212,175,55,0.4)" : "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{body}</p>
    </Link>
  );
}

function Figure({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white p-5 transition-all duration-200 hover:shadow-md"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div className="text-3xl font-bold" style={{ color: "#0B3C5D" }}>
        {value.toLocaleString()}
      </div>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </Link>
  );
}
