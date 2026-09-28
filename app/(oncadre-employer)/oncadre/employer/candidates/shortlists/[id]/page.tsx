import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { displayNameFor } from "@/lib/cadreSalutation";
import { tierFor, specialtyProvenance } from "@/lib/cadreHealth/candidateVisibility";

/** One list, side by side, so a hospital can actually compare. */
export const dynamic = "force-dynamic";

export default async function ShortlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const { id } = await params;
  const shortlist = await prisma.cadreShortlist.findFirst({
    where: { id, orgId: ctx.org.id },
    select: {
      id: true,
      name: true,
      mandate: { select: { id: true, title: true } },
      entries: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          note: true,
          createdAt: true,
          addedBy: { select: { contactName: true } },
          professional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              cadre: true,
              subSpecialty: true,
              specialtyConfirmedAt: true,
              yearsOfExperience: true,
              state: true,
              city: true,
              country: true,
              isDiaspora: true,
              diasporaCountry: true,
              accountStatus: true,
              availability: true,
              lastLoginAt: true,
              passwordHash: true,
              cvFileUrl: true,
            },
          },
        },
      },
    },
  });
  if (!shortlist) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/oncadre/employer/candidates/shortlists"
          className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
        >
          &larr; Shortlists
        </Link>
        <h1
          className="mt-3 font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          {shortlist.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {shortlist.entries.length}{" "}
          {shortlist.entries.length === 1 ? "person" : "people"}
          {shortlist.mandate && (
            <>
              {" for "}
              <Link
                href={`/oncadre/employer/roles/${shortlist.mandate.id}`}
                className="font-medium text-[#0B3C5D] underline-offset-2 hover:underline"
              >
                {shortlist.mandate.title}
              </Link>
            </>
          )}
        </p>
      </div>

      {shortlist.entries.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center"
          style={{ border: "1px solid #E8EBF0" }}
        >
          <p className="text-sm text-gray-500">Nobody on this list yet.</p>
          <Link
            href="/oncadre/employer/candidates"
            className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#0B3C5D" }}
          >
            Search candidates
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shortlist.entries.map((entry) => {
            const p = entry.professional;
            const tier = tierFor(p);
            const specialty = specialtyProvenance(p);
            const location = p.isDiaspora
              ? (p.diasporaCountry ?? p.country)
              : [p.city, p.state].filter(Boolean).join(", ") || p.country;

            return (
              <div
                key={entry.id}
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
                        {displayNameFor(p)}
                      </h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: tier.bg, color: tier.color }}
                        title={tier.meaning}
                      >
                        {tier.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {getCadreLabel(p.cadre)}
                      {specialty && (
                        <>
                          {" / "}
                          <span
                            title={specialty.note}
                            style={{
                              borderBottom: specialty.confirmed
                                ? "none"
                                : "1px dashed #CBD5E1",
                            }}
                          >
                            {specialty.value}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {location}
                      {p.yearsOfExperience != null && ` · ${p.yearsOfExperience} yrs`}
                      {p.cvFileUrl && " · CV on file"}
                    </p>
                    {entry.note && (
                      <p className="mt-2 text-sm italic text-gray-600">
                        &ldquo;{entry.note}&rdquo;
                        {entry.addedBy && (
                          <span className="not-italic text-gray-400">
                            {" "}
                            &mdash; {entry.addedBy.contactName}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/oncadre/employer/candidates/${p.id}`}
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
