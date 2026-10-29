import { redirect } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import PipelineBoard from "./PipelineBoard";
import { loadPipeline } from "@/lib/cadreHealth/pipeline";

/**
 * Everyone in play across every role.
 *
 * The section the old product did not have. Applications was the roles list, and
 * the only way to see candidates was to open one role at a time, so nobody could
 * answer "who is waiting on us" without clicking through every post.
 */
export const dynamic = "force-dynamic";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const { source } = await searchParams;
  const entries = await loadPipeline(ctx.org.id);
  const roleCount = await prisma.cadreMandate.count({
    where: { employerOrgId: ctx.org.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          Pipeline
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Everyone in play across every role, and what you owe them.
        </p>
      </div>

      {entries.length === 0 && roleCount === 0 ? (
        <div
          className="rounded-2xl bg-white p-8 text-center sm:p-10"
          style={{ border: "1px solid #E8EBF0" }}
        >
          <h3 className="font-semibold text-gray-900">Nobody in play yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            People arrive here two ways: they apply to a role you posted, or you
            approach them from the register and they agree to talk.
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
      ) : (
        <PipelineBoard entries={entries} showRole initialTab={source} />
      )}
    </div>
  );
}
