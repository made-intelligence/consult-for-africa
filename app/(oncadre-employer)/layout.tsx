import { redirect } from "next/navigation";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EmployerLogoutButton from "./EmployerLogoutButton";
import EmployerNav from "./EmployerNav";

/**
 * The four sections an employer works in, and nothing else.
 *
 * The nav was Dashboard, Post Role, Applications, Search, which was not a set of
 * places: "Post Role" was an action, "Applications" was actually the list of
 * roles with the applicants a level below it, and Search and Applications each
 * showed candidates on different cards with nothing shared between them. There
 * was no account section at all.
 *
 *   Roles       what am I hiring for
 *   Candidates  who is out there
 *   Pipeline    who is in play, and what do I owe them
 *   Account     who we are, who can log in, are we verified
 *
 * Dashboard sits above the four and answers only what needs me today.
 */
export default async function OncadreEmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  // Counts that belong on the navigation itself, because an applicant nobody
  // looks at is the failure this product is trying to prevent.
  const [newApplicants, answeredApproaches] = await Promise.all([
    prisma.cadreMandateMatch.count({
      where: {
        mandate: { employerOrgId: ctx.org.id },
        source: "APPLIED",
        status: "NEW",
      },
    }),
    prisma.cadreContactRequest.count({
      where: { orgId: ctx.org.id, status: "ACCEPTED" },
    }),
  ]);

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FB" }}>
      <nav
        className="sticky top-0 z-50 bg-white"
        style={{
          borderBottom: "1px solid #E8EBF0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/oncadre/employer/dashboard"
              className="shrink-0 text-xl font-bold tracking-tight text-[#0B3C5D]"
            >
              Cadre<span style={{ color: "#D4AF37" }}>Health</span>
            </Link>
            <span
              className="hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:inline"
              style={{ background: "rgba(212,175,55,0.1)", color: "#B8941E" }}
            >
              Employer
            </span>
          </div>

          <EmployerNav
            variant="top"
            newApplicants={newApplicants}
            answeredApproaches={answeredApproaches}
          />

          <div className="flex shrink-0 items-center gap-3">
            {ctx.org.isVerified ? (
              <span
                className="hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex"
                style={{
                  background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                  color: "#065f46",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                Verified
              </span>
            ) : (
              <Link
                href="/oncadre/employer/account"
                className="hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 sm:inline-flex"
                style={{
                  background: "rgba(212,175,55,0.1)",
                  color: "#B8941E",
                  border: "1px solid rgba(212,175,55,0.2)",
                }}
              >
                Get verified
              </Link>
            )}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "#0B3C5D" }}
            >
              {ctx.contactName?.[0]?.toUpperCase() || "E"}
            </div>
            <EmployerLogoutButton />
          </div>
        </div>
      </nav>

      <EmployerNav
        variant="bottom"
        newApplicants={newApplicants}
        answeredApproaches={answeredApproaches}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
