import { redirect } from "next/navigation";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import Link from "next/link";
import { stageFor, type CadreMatchStage } from "@/lib/cadreHealth/matchStages";

// The member's wording for each pipeline stage. Colours come from the shared
// stage definitions; the labels there are written for the employer.
const MEMBER_STAGE_LABELS: Record<CadreMatchStage, string> = {
  NEW: "Sent",
  REVIEWING: "Being reviewed",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interview",
  OFFERED: "Offer made",
  PLACED: "Placed",
  REJECTED: "Not progressed",
  WITHDRAWN: "Withdrawn",
};

const MANDATE_TYPE_LABELS: Record<string, string> = {
  PERMANENT: "Permanent",
  LOCUM: "Locum",
  CONTRACT: "Contract",
  CONSULTING: "Consulting",
  INTERNATIONAL: "International",
};

export default async function MyApplicationsPage() {
  const session = await getCadreSession();
  if (!session) redirect("/oncadre/login");

  const applications = await prisma.cadreMandateMatch.findMany({
    // SOURCED means we surfaced them and nobody has approached them yet, so it
    // is not something the member has done or agreed to.
    where: { professionalId: session.sub, source: { in: ["APPLIED", "INVITED"] } },
    include: {
      mandate: {
        select: {
          id: true,
          status: true,
          isPublished: true,
          title: true,
          cadre: true,
          type: true,
          facilityName: true,
          locationState: true,
          locationCity: true,
          facility: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)" }}
        >
          My Applications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Roles you have applied to, and roles you agreed to be put forward for.
        </p>
      </div>

      {applications.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center"
          style={{
            border: "1px solid #E8EBF0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(11,60,93,0.06)" }}
          >
            <svg className="h-7 w-7 text-[#0B3C5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">No applications yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse open roles and apply to get started.
          </p>
          <Link
            href="/oncadre/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0B3C5D, #0E4D6E)",
              boxShadow: "0 2px 8px rgba(11,60,93,0.25)",
            }}
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const stage = stageFor(app.status);
            const statusConfig = { label: MEMBER_STAGE_LABELS[stage.value], bg: stage.bg, color: stage.color };
            // The job page only serves open, published roles; anything else 404s.
            const roleOpen = app.mandate.status === "OPEN" && app.mandate.isPublished;
            const facilityName = app.mandate.facility?.name || app.mandate.facilityName || "Confidential";
            const location = [app.mandate.locationCity, app.mandate.locationState]
              .filter(Boolean)
              .join(", ") || "Nigeria";

            return (
              <div
                key={app.id}
                className="rounded-2xl bg-white p-5 sm:p-6"
                style={{
                  border: "1px solid #E8EBF0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: "rgba(107,114,128,0.06)", color: "#4B5563" }}
                      >
                        {MANDATE_TYPE_LABELS[app.mandate.type] || app.mandate.type}
                      </span>
                    </div>
                    {roleOpen ? (
                      <Link
                        href={`/oncadre/jobs/${app.mandate.id}`}
                        className="font-semibold text-gray-900 hover:text-[#0B3C5D] transition-colors"
                      >
                        {app.mandate.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900">
                        {app.mandate.title}
                        <span className="ml-2 text-xs font-normal text-gray-400">Role closed</span>
                      </p>
                    )}
                    <p className="mt-0.5 text-sm text-gray-500">{facilityName}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {location} &middot; {getCadreLabel(app.mandate.cadre)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-gray-400">
                      {app.source === "INVITED" ? "Put forward" : "Applied"}{" "}
                      {new Date(app.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {app.contactedAt && (
                      <p className="mt-1 text-[11px] text-blue-500">
                        Contacted{" "}
                        {new Date(app.contactedAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
