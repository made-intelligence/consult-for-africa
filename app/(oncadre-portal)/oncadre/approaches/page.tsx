import { redirect } from "next/navigation";
import { getCadreSession } from "@/lib/cadreAuth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ApproachResponse from "./ApproachResponse";

/**
 * Hospitals that have asked to contact this member.
 *
 * The member's half of the consent gate. Nothing about a professional's contact
 * details reaches an employer until an answer here says so, and a no is recorded
 * so the same hospital cannot ask again.
 */
export const dynamic = "force-dynamic";

export default async function ApproachesPage() {
  const session = await getCadreSession();
  if (!session) redirect("/oncadre/login");

  const requests = await prisma.cadreContactRequest.findMany({
    where: { professionalId: session.sub },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      message: true,
      createdAt: true,
      expiresAt: true,
      org: { select: { name: true, isVerified: true } },
      mandate: {
        select: { id: true, title: true, locationState: true, locationCity: true },
      },
    },
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const answered = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approaches</h1>
        <p className="mt-1 text-sm text-gray-500">
          Hospitals that would like to contact you. They do not have your phone number
          or your email unless you say yes.
        </p>
      </div>

      {requests.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center sm:p-10"
          style={{ border: "1px solid #E8EBF0" }}
        >
          <h3 className="font-semibold text-gray-900">Nobody has asked yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Employers search this network by cadre, specialty and location. Saying
            whether you are open to hearing from them puts you nearer the front.
          </p>
          <Link
            href="/oncadre/profile"
            className="mt-6 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "#0B3C5D", minHeight: "44px" }}
          >
            Set your availability
          </Link>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500">
                Waiting on you ({pending.length})
              </h2>
              {pending.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl bg-white p-6"
                  style={{
                    border: "1px solid rgba(212,175,55,0.3)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{r.org.name}</h3>
                    {r.org.isVerified && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: "rgba(16,185,129,0.09)", color: "#059669" }}
                      >
                        Verified employer
                      </span>
                    )}
                  </div>

                  {r.mandate && (
                    <p className="mt-1 text-sm text-gray-500">
                      About {r.mandate.title}
                      {r.mandate.locationState
                        ? ` in ${[r.mandate.locationCity, r.mandate.locationState]
                            .filter(Boolean)
                            .join(", ")}`
                        : ""}
                    </p>
                  )}

                  {r.message && (
                    <blockquote
                      className="mt-4 whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-relaxed text-gray-700"
                      style={{ background: "#F8F9FB" }}
                    >
                      {r.message}
                    </blockquote>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Asked{" "}
                    {r.createdAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {r.expiresAt &&
                      ` · lapses ${r.expiresAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}`}
                  </p>

                  <ApproachResponse requestId={r.id} orgName={r.org.name} />
                </article>
              ))}
            </section>
          )}

          {answered.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500">
                Already answered ({answered.length})
              </h2>
              {answered.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5"
                  style={{ border: "1px solid #E8EBF0" }}
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{r.org.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {r.mandate ? `${r.mandate.title} · ` : ""}
                      {r.createdAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={
                      r.status === "ACCEPTED"
                        ? { background: "rgba(16,185,129,0.09)", color: "#059669" }
                        : { background: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {r.status === "ACCEPTED"
                      ? "You said yes"
                      : r.status === "DECLINED"
                        ? "You said no"
                        : "Lapsed"}
                  </span>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
