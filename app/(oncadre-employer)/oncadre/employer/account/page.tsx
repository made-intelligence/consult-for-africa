import { redirect } from "next/navigation";
import { getCadreEmployerContext, canManageTeam } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import TeamManager from "./TeamManager";

/**
 * Who we are, who can log in, and whether we are verified.
 *
 * The section that did not exist. Verification was a panel on the dashboard that
 * said "contact us" and named nobody, which is why none of the four live
 * employers had ever been verified, and a hospital could only ever have one
 * login because the facility link was unique on the account row.
 */
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  RECRUITER: "Recruiter",
  VIEWER: "Viewer",
};

const ROLE_MEANING: Record<string, string> = {
  OWNER: "Everything, including inviting colleagues",
  RECRUITER: "Post roles, search, move the pipeline",
  VIEWER: "Can see the pipeline, cannot change it",
};

export default async function AccountPage() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const org = await prisma.cadreEmployerOrg.findUnique({
    where: { id: ctx.org.id },
    select: {
      id: true,
      name: true,
      isVerified: true,
      verifiedAt: true,
      createdAt: true,
      facility: { select: { name: true } },
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          contactName: true,
          contactEmail: true,
          role: true,
          lastLoginAt: true,
          acceptedAt: true,
        },
      },
      _count: { select: { mandates: true, shortlists: true, contactRequests: true } },
    },
  });
  if (!org) redirect("/oncadre/employer/login");

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          Account
        </h1>
        <p className="mt-1 text-sm text-gray-500">{org.name}</p>
      </div>

      <section
        className="rounded-2xl p-6"
        style={
          org.isVerified
            ? {
                background: "linear-gradient(135deg, #ecfdf5, #f7fefb)",
                border: "1px solid rgba(16,185,129,0.22)",
              }
            : {
                background: "linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.02))",
                border: "1px solid rgba(212,175,55,0.22)",
              }
        }
      >
        <h2 className="text-lg font-bold text-gray-900">
          {org.isVerified ? "You are verified" : "Get verified"}
        </h2>
        {org.isVerified ? (
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Verified on{" "}
            {org.verifiedAt?.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            . You can approach professionals directly, and your roles carry a verified
            badge on the job board. Professionals still choose whether to share their
            details with you.
          </p>
        ) : (
          <>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Searching is open to every employer. Approaching a professional puts your
              name in front of a doctor who did not ask to hear from you, so we check
              who you are before we will do that.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-gray-600">
              Send us your facility registration or practising licence and a line about
              who you are hiring for, and we will come back to you.
            </p>
            <a
              href={`mailto:hello@oncadre.com?subject=${encodeURIComponent(
                `Verification for ${org.name}`,
              )}&body=${encodeURIComponent(
                `We would like ${org.name} verified on CadreHealth.\n\nWho we are:\nWhat we are hiring for:\nOur registration number:\n`,
              )}`}
              className="mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "#0B3C5D", minHeight: "44px" }}
            >
              Ask to be verified
            </a>
          </>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Fact label="Roles posted" value={org._count.mandates} />
        <Fact label="Shortlists" value={org._count.shortlists} />
        <Fact label="Approaches made" value={org._count.contactRequests} />
      </div>

      <section
        className="rounded-2xl bg-white p-6"
        style={{
          border: "1px solid #E8EBF0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        <h2 className="text-lg font-bold text-gray-900">Your team</h2>
        <p className="mt-1 text-sm text-gray-500">
          Roles, shortlists and pipelines belong to {org.name}, not to whoever created
          them, so nothing is lost when someone leaves.
        </p>

        <ul className="mt-5 space-y-2">
          {org.members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ border: "1px solid #E8EBF0" }}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {m.contactName}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ background: "#F3F4F6", color: "#4B5563" }}
                    title={ROLE_MEANING[m.role]}
                  >
                    {ROLE_LABELS[m.role] ?? m.role}
                  </span>
                  {m.id === ctx.accountId && (
                    <span className="text-[10px] font-medium text-gray-400">You</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{m.contactEmail}</p>
              </div>
              <span className="text-xs text-gray-400">
                {m.lastLoginAt
                  ? `Last in ${m.lastLoginAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}`
                  : m.acceptedAt
                    ? "Never signed in"
                    : "Invited, not accepted"}
              </span>
            </li>
          ))}
        </ul>

        {canManageTeam(ctx) ? (
          <TeamManager />
        ) : (
          <p className="mt-4 text-xs text-gray-400">
            Only an owner can invite colleagues.
          </p>
        )}
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl bg-white p-5"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div className="text-2xl font-bold" style={{ color: "#0B3C5D" }}>
        {value}
      </div>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}
