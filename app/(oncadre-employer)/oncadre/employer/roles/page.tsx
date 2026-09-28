import { redirect } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { ROLE_STATUS, ROLE_TYPE_LABELS } from "@/lib/cadreHealth/roleStatus";

/**
 * What this hospital is hiring for.
 *
 * This list used to be called Applications, which named what sat one level below
 * it rather than what it was. Roles now carry their real state: the status map
 * covers the whole enum, where the old one covered four values, two of which
 * (PAUSED, FILLED) do not exist, so six real states rendered as a green "open"
 * badge with the raw enum name showing through.
 */

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const roles = await prisma.cadreMandate.findMany({
    where: { employerOrgId: ctx.org.id },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      cadre: true,
      type: true,
      status: true,
      isPublished: true,
      locationState: true,
      locationCity: true,
      createdAt: true,
      matches: { select: { source: true, status: true } },
    },
  });

  const live = roles.filter((r) => ROLE_STATUS[r.status]?.live);
  const closed = roles.filter((r) => !ROLE_STATUS[r.status]?.live);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="font-bold text-gray-900"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
          >
            Roles
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            What you are hiring for, and where each one has got to.
          </p>
        </div>
        <Link
          href="/oncadre/employer/roles/new"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #0B3C5D, #0E4D6E)",
            boxShadow: "0 2px 8px rgba(11,60,93,0.25)",
            minHeight: "44px",
          }}
        >
          Post a role
        </Link>
      </div>

      {roles.length === 0 ? (
        <EmptyRoles />
      ) : (
        <>
          {live.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500">Live ({live.length})</h2>
              {live.map((r) => (
                <RoleRow key={r.id} role={r} />
              ))}
            </section>
          )}
          {closed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500">
                Closed and filled ({closed.length})
              </h2>
              {closed.map((r) => (
                <RoleRow key={r.id} role={r} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

type RoleRowData = {
  id: string;
  title: string;
  cadre: string;
  type: string;
  status: string;
  isPublished: boolean;
  locationState: string | null;
  locationCity: string | null;
  createdAt: Date;
  matches: { source: string; status: string }[];
};

function RoleRow({ role }: { role: RoleRowData }) {
  const status = ROLE_STATUS[role.status] ?? ROLE_STATUS.OPEN;
  const applicants = role.matches.filter((m) => m.source === "APPLIED");
  const unread = applicants.filter((m) => m.status === "NEW").length;
  const sourced = role.matches.filter((m) => m.source !== "APPLIED").length;
  const location = [role.locationCity, role.locationState].filter(Boolean).join(", ");

  return (
    <div
      className="rounded-2xl bg-white p-5 transition-all duration-200 hover:shadow-md"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            {!role.isPublished && status.live && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(107,114,128,0.08)", color: "#6B7280" }}
              >
                Not on the job board
              </span>
            )}
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgba(11,60,93,0.06)", color: "#0B3C5D" }}
            >
              {getCadreLabel(role.cadre)}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgba(107,114,128,0.06)", color: "#4B5563" }}
            >
              {ROLE_TYPE_LABELS[role.type] ?? role.type}
            </span>
          </div>

          <Link
            href={`/oncadre/employer/roles/${role.id}`}
            className="font-semibold text-gray-900 transition-colors hover:text-[#0B3C5D]"
          >
            {role.title}
          </Link>
          <p className="mt-1 text-xs text-gray-400">
            {location || "Nigeria"} &middot; Posted{" "}
            {role.createdAt.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <div className="text-right">
            <div
              className="text-2xl font-bold"
              style={{ color: applicants.length > 0 ? "#0B3C5D" : "#9CA3AF" }}
            >
              {applicants.length}
            </div>
            <p className="text-[11px] text-gray-400">
              applicant{applicants.length === 1 ? "" : "s"}
            </p>
            {unread > 0 && (
              <p className="text-[11px] font-semibold" style={{ color: "#B8941E" }}>
                {unread} unread
              </p>
            )}
          </div>
          {sourced > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-400">{sourced}</div>
              <p className="text-[11px] text-gray-400">sourced</p>
            </div>
          )}
          <Link
            href={`/oncadre/employer/pipeline/${role.id}`}
            className="rounded-lg px-3.5 py-2 text-xs font-semibold transition hover:bg-[#0B3C5D]/5"
            style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
          >
            Pipeline
          </Link>
        </div>
      </div>
    </div>
  );
}

async function EmptyRoles() {
  // A count from the real register, so the first screen proves the people are
  // there rather than asking a hospital to take it on faith.
  const doctors = await prisma.cadreProfessional.count({
    where: { cadre: "MEDICINE", accountStatus: { not: "SUSPENDED" } },
  });

  return (
    <div
      className="rounded-2xl bg-white p-8 text-center sm:p-10"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h3 className="font-semibold text-gray-900">No roles yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        There are {doctors.toLocaleString()} doctors on the register. You do not have
        to post anything to reach them: you can search now and approach people
        directly. Posting a role gets you the ones who come looking.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/oncadre/employer/candidates"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#0B3C5D", minHeight: "44px" }}
        >
          Search candidates
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
  );
}
