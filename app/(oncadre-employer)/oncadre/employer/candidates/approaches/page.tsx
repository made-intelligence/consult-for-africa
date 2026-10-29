import { redirect } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { displayNameFor } from "@/lib/cadreSalutation";

/**
 * Who this hospital has asked, and what they said.
 *
 * A declined approach is shown rather than hidden. It is the evidence that the
 * consent gate is real, and it stops a colleague asking the same person again
 * next month.
 */
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; bg: string; color: string; note: string }> = {
  PENDING: {
    label: "Waiting",
    bg: "rgba(59,130,246,0.08)",
    color: "#2563EB",
    note: "They have not answered yet",
  },
  ACCEPTED: {
    label: "Agreed",
    bg: "rgba(16,185,129,0.09)",
    color: "#059669",
    note: "Their details are below",
  },
  DECLINED: {
    label: "Declined",
    bg: "rgba(239,68,68,0.07)",
    color: "#DC2626",
    note: "We will not ask them again for you",
  },
  EXPIRED: {
    label: "Lapsed",
    bg: "rgba(107,114,128,0.08)",
    color: "#6B7280",
    note: "No answer inside a month",
  },
};

export default async function ApproachesPage() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const requests = await prisma.cadreContactRequest.findMany({
    where: { orgId: ctx.org.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      respondedAt: true,
      mandate: { select: { id: true, title: true } },
      requestedBy: { select: { contactName: true } },
      professional: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          cadre: true,
          subSpecialty: true,
          state: true,
          city: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/oncadre/employer/candidates"
          className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
        >
          &larr; Candidates
        </Link>
        <h1
          className="mt-3 font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          Approaches
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Everyone you have asked, and what they said.
        </p>
      </div>

      {requests.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center sm:p-10"
          style={{ border: "1px solid #E8EBF0" }}
        >
          <h3 className="font-semibold text-gray-900">You have not approached anyone</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Most people on the register were listed by their regulatory body and have
            not asked to hear from employers, so we put your message to them and let
            them decide. You get an answer either way.
          </p>
          <Link
            href="/oncadre/employer/candidates"
            className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#0B3C5D", minHeight: "44px" }}
          >
            Search candidates
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const s = STATUS[r.status] ?? STATUS.PENDING;
            const location =
              [r.professional.city, r.professional.state].filter(Boolean).join(", ") ||
              "Nigeria";
            return (
              <div
                key={r.id}
                className="rounded-2xl bg-white p-5"
                style={{
                  border: "1px solid #E8EBF0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {displayNameFor(r.professional)}
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {getCadreLabel(r.professional.cadre)}
                      {r.professional.subSpecialty
                        ? ` / ${r.professional.subSpecialty}`
                        : ""}
                      {" · "}
                      {location}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {s.note} &middot; Asked{" "}
                      {r.createdAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {r.requestedBy ? ` by ${r.requestedBy.contactName}` : ""}
                      {r.mandate ? ` about ${r.mandate.title}` : ""}
                    </p>

                    {r.status === "ACCEPTED" && (
                      <div
                        className="mt-3 rounded-xl px-4 py-3 text-sm"
                        style={{ background: "#ecfdf5", color: "#047857" }}
                      >
                        <span className="font-medium">Email: </span>
                        {r.professional.email}
                        {r.professional.phone && (
                          <>
                            <span className="font-medium"> Phone: </span>
                            {r.professional.phone}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/oncadre/employer/candidates/${r.professional.id}`}
                    className="shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition hover:bg-[#0B3C5D]/5"
                    style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
                  >
                    View profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
