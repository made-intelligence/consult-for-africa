import { redirect } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";

/** Lists this hospital is building. */
export const dynamic = "force-dynamic";

export default async function ShortlistsPage() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const shortlists = await prisma.cadreShortlist.findMany({
    where: { orgId: ctx.org.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      mandate: { select: { id: true, title: true } },
      _count: { select: { entries: true } },
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
          Shortlists
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          People you are keeping an eye on. They belong to {ctx.org.name}, so your
          colleagues see them too.
        </p>
      </div>

      {shortlists.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center sm:p-10"
          style={{ border: "1px solid #E8EBF0" }}
        >
          <h3 className="font-semibold text-gray-900">No lists yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Search the register and add people as you go. A list is the natural way to
            work: find ten, compare them, then decide who to approach.
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
          {shortlists.map((s) => (
            <Link
              key={s.id}
              href={`/oncadre/employer/candidates/shortlists/${s.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 transition-all duration-200 hover:shadow-md"
              style={{
                border: "1px solid #E8EBF0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
              }}
            >
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900">{s.name}</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {s.mandate ? `For ${s.mandate.title} · ` : ""}
                  Updated{" "}
                  {s.updatedAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: "#0B3C5D" }}>
                  {s._count.entries}
                </div>
                <p className="text-[11px] text-gray-400">
                  {s._count.entries === 1 ? "person" : "people"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
