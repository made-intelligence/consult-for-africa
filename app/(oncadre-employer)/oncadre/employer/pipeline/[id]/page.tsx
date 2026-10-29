import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCadreEmployerContext } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import { getCadreLabel } from "@/lib/cadreHealth/cadres";
import PipelineBoard from "../PipelineBoard";
import { loadPipeline } from "@/lib/cadreHealth/pipeline";

/** One role's pipeline. */
export const dynamic = "force-dynamic";

export default async function RolePipelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const { id } = await params;
  const { source } = await searchParams;

  const role = await prisma.cadreMandate.findFirst({
    where: { id, employerOrgId: ctx.org.id },
    select: { id: true, title: true, cadre: true },
  });
  if (!role) notFound();

  const entries = await loadPipeline(ctx.org.id, id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/oncadre/employer/pipeline"
          className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
        >
          &larr; All roles
        </Link>
        <h1
          className="mt-3 font-bold text-gray-900"
          style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)" }}
        >
          {role.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ background: "rgba(11,60,93,0.06)", color: "#0B3C5D" }}
          >
            {getCadreLabel(role.cadre)}
          </span>
          <Link
            href={`/oncadre/employer/roles/${role.id}`}
            className="text-xs font-medium text-[#0B3C5D] underline-offset-2 hover:underline"
          >
            See the brief
          </Link>
        </div>
      </div>

      <PipelineBoard entries={entries} showRole={false} initialTab={source} />
    </div>
  );
}
