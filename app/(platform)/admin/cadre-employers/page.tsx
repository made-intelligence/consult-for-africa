import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, BadgeCheck } from "lucide-react";
import { EmployerResetButton } from "@/components/cadrehealth/EmployerResetButton";
import { EmployerVerifyButton } from "@/components/cadrehealth/EmployerVerifyButton";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];
const PAGE_SIZE = 25;

const SEAT_ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  RECRUITER: "Recruiter",
  VIEWER: "Viewer",
};

/**
 * Employer organisations, and the place verification is granted.
 *
 * This lists orgs rather than logins. A hospital can now hold several seats, and
 * verification belongs to the hospital: verifying the HR manager and not the
 * medical director would be meaningless.
 */
export default async function CadreEmployersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED_ROLES.includes(session.user.role)) redirect("/dashboard");

  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const filter = params.filter === "unverified" ? "unverified" : undefined;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const where = {
    ...(filter === "unverified" ? { isVerified: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            {
              members: {
                some: {
                  OR: [
                    { contactEmail: { contains: search, mode: "insensitive" as const } },
                    { contactName: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const [orgs, total, unverifiedCount] = await Promise.all([
    prisma.cadreEmployerOrg.findMany({
      where,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        isVerified: true,
        verifiedAt: true,
        verifiedNote: true,
        createdAt: true,
        verifiedBy: { select: { name: true } },
        facility: { select: { name: true, slug: true } },
        members: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            role: true,
            lastLoginAt: true,
          },
        },
        _count: { select: { mandates: true, contactRequests: true } },
      },
    }),
    prisma.cadreEmployerOrg.count({ where }),
    prisma.cadreEmployerOrg.count({ where: { isVerified: false } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const qs = (extra: Record<string, string>) =>
    new URLSearchParams({
      ...(search ? { q: search } : {}),
      ...(filter ? { filter } : {}),
      ...extra,
    }).toString();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/cadrehealth"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-gray-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          CadreHealth Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0F2744" }}>
          Employers
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} organisation{total === 1 ? "" : "s"}. Verifying an employer is what
          lets them approach professionals directly, so it is recorded against your
          name.
        </p>
      </div>

      {unverifiedCount > 0 && !filter && (
        <Link
          href={`/admin/cadre-employers?${qs({ filter: "unverified" })}`}
          className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:opacity-90"
          style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: "#B8941E" }} />
          <p className="text-sm" style={{ color: "#8A6D1A" }}>
            <strong>{unverifiedCount}</strong> employer{unverifiedCount === 1 ? "" : "s"}{" "}
            waiting on verification. Until they are verified they can search but cannot
            approach anyone.
          </p>
        </Link>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <form className="flex flex-1 gap-2" method="GET">
          {filter && <input type="hidden" name="filter" value={filter} />}
          <input
            type="text"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Search by organisation, contact name, or email"
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B3C5D]/20"
            style={{ border: "1px solid #E8EBF0" }}
          />
          <button
            type="submit"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#0B3C5D" }}
          >
            Search
          </button>
        </form>
        {filter && (
          <Link
            href={`/admin/cadre-employers?${qs({})}`.replace(/filter=unverified&?/, "")}
            className="rounded-xl border px-3 py-2.5 text-sm font-medium transition hover:bg-gray-50"
            style={{ borderColor: "#E8EBF0", color: "#0B3C5D" }}
          >
            Showing unverified only. Clear
          </Link>
        )}
      </div>

      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: "#E8EBF0" }}
      >
        {orgs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              {search || filter
                ? "No employers match this."
                : "No employer organisations yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#F3F4F6" }}>
            {orgs.map((org) => (
              <li key={org.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
                      <p className="text-sm font-semibold" style={{ color: "#0F2744" }}>
                        {org.name}
                      </p>
                      {org.isVerified ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                          Not verified
                        </span>
                      )}
                      {org.facility && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                          {org.facility.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>
                        {org._count.mandates} role{org._count.mandates === 1 ? "" : "s"}
                      </span>
                      <span>
                        {org._count.contactRequests} contact request
                        {org._count.contactRequests === 1 ? "" : "s"}
                      </span>
                      <span>
                        Joined{" "}
                        {org.createdAt.toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {org.isVerified && org.verifiedAt && (
                      <p className="mt-1.5 text-xs text-emerald-700">
                        Verified{" "}
                        {org.verifiedAt.toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {org.verifiedBy?.name ? ` by ${org.verifiedBy.name}` : ""}
                      </p>
                    )}
                    {!org.isVerified && org.verifiedNote && (
                      <p className="mt-1.5 text-xs text-red-600">
                        Withdrawn: {org.verifiedNote}
                      </p>
                    )}

                    <ul className="mt-3 space-y-1.5">
                      {org.members.map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                        >
                          <span className="font-medium text-gray-700">{m.contactName}</span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{ background: "#F3F4F6", color: "#4B5563" }}
                          >
                            {SEAT_ROLE_LABELS[m.role] ?? m.role}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            <Mail className="h-3 w-3" />
                            {m.contactEmail}
                          </span>
                          {m.contactPhone && (
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Phone className="h-3 w-3" />
                              {m.contactPhone}
                            </span>
                          )}
                          <span className="text-gray-400">
                            {m.lastLoginAt
                              ? `Last in ${m.lastLoginAt.toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                })}`
                              : "Never signed in"}
                          </span>
                          <EmployerResetButton employerId={m.id} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="shrink-0">
                    <EmployerVerifyButton
                      orgId={org.id}
                      isVerified={org.isVerified}
                      orgName={org.name}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/cadre-employers?${qs({ page: String(page - 1) })}`}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                style={{ borderColor: "#E8EBF0", color: "#0B3C5D" }}
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/cadre-employers?${qs({ page: String(page + 1) })}`}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                style={{ borderColor: "#E8EBF0", color: "#0B3C5D" }}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
