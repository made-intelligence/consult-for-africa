import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import { ROLE_STATUS, ROLE_TYPE_LABELS } from "@/lib/cadreHealth/roleStatus";
import RoleLifecycle from "./RoleLifecycle";
import RoleEditToggle from "./RoleEditToggle";

/**
 * A single role: what it says, where it is in its life, and what to do next.
 *
 * None of this existed. A role could be created and never touched again, so a
 * filled post stayed on the job board indefinitely and professionals kept
 * applying to it.
 */
export const dynamic = "force-dynamic";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const { id } = await params;
  const role = await prisma.cadreMandate.findFirst({
    where: { id, employerOrgId: ctx.org.id },
    include: { matches: { select: { source: true, status: true } } },
  });
  if (!role) notFound();

  const status = ROLE_STATUS[role.status] ?? ROLE_STATUS.OPEN;
  const applicants = role.matches.filter((m) => m.source === "APPLIED");
  const sourced = role.matches.filter((m) => m.source !== "APPLIED").length;
  const location = [role.locationCity, role.locationState].filter(Boolean).join(", ");
  const editable = canWrite(ctx);

  const money = (v: unknown) =>
    v == null ? null : `NGN ${Number(v).toLocaleString("en-NG")}`;
  const salary =
    role.salaryRangeMin || role.salaryRangeMax
      ? [money(role.salaryRangeMin), money(role.salaryRangeMax)]
          .filter(Boolean)
          .join(" to ")
      : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/oncadre/employer/roles"
          className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
        >
          &larr; Roles
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
          {!role.isPublished && (
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
        <h1
          className="mt-2 font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          {role.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {location || "Nigeria"}
          {salary ? ` · ${salary} per month` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          value={applicants.length}
          label={`applicant${applicants.length === 1 ? "" : "s"}`}
          sub={`${applicants.filter((m) => m.status === "NEW").length} not yet looked at`}
          href={`/oncadre/employer/pipeline/${role.id}`}
          accent="#0B3C5D"
        />
        <Stat
          value={sourced}
          label="sourced"
          sub="Surfaced by us, not approached"
          href={`/oncadre/employer/pipeline/${role.id}?source=SOURCED`}
          accent="#6B7280"
        />
        <Stat
          value={null}
          label="Find more"
          sub="Search the register for this cadre"
          href={`/oncadre/employer/candidates?cadre=${role.cadre}`}
          accent="#059669"
        />
      </div>

      {editable && (
        <RoleLifecycle
          roleId={role.id}
          status={role.status}
          isPublished={role.isPublished}
        />
      )}

      <div
        className="rounded-2xl bg-white p-6"
        style={{
          border: "1px solid #E8EBF0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">The brief</h2>
          {editable && <RoleEditToggle roleId={role.id} />}
        </div>

        {role.description ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {role.description}
          </p>
        ) : (
          <p className="mt-3 text-sm text-gray-400">
            No description yet. A role with nothing written about it is rarely applied
            to.
          </p>
        )}

        {role.requiredQualifications.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700">Required</h3>
            <ul className="mt-2 space-y-1">
              {role.requiredQualifications.map((q) => (
                <li key={q} className="text-sm text-gray-600">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {role.preferredQualifications.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700">Nice to have</h3>
            <ul className="mt-2 space-y-1">
              {role.preferredQualifications.map((q) => (
                <li key={q} className="text-sm text-gray-600">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {role.isPublished && role.slug && (
          <Link
            href={`/oncadre/jobs/${role.id}`}
            className="mt-6 inline-block text-sm font-medium text-[#0B3C5D] underline-offset-2 hover:underline"
          >
            See it as a candidate sees it
          </Link>
        )}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  sub,
  href,
  accent,
}: {
  value: number | null;
  label: string;
  sub: string;
  href: string;
  accent: string;
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
      {value !== null ? (
        <div className="text-3xl font-bold" style={{ color: accent }}>
          {value}
        </div>
      ) : (
        <div className="text-xl font-bold" style={{ color: accent }}>
          {label}
        </div>
      )}
      {value !== null && <p className="mt-1 text-sm text-gray-500">{label}</p>}
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </Link>
  );
}
