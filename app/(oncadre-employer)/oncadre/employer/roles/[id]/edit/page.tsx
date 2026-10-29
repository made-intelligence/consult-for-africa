import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import { prisma } from "@/lib/prisma";
import RoleForm from "../../RoleForm";

export const dynamic = "force-dynamic";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");

  const { id } = await params;
  if (!canWrite(ctx)) redirect(`/oncadre/employer/roles/${id}`);

  const role = await prisma.cadreMandate.findFirst({
    where: { id, employerOrgId: ctx.org.id },
  });
  if (!role) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/oncadre/employer/roles/${id}`}
          className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
        >
          &larr; {role.title}
        </Link>
        <h1
          className="mt-3 font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          Edit role
        </h1>
      </div>

      <RoleForm
        roleId={role.id}
        initial={{
          title: role.title,
          description: role.description ?? "",
          cadre: role.cadre,
          subSpecialty: role.subSpecialty ?? "",
          type: role.type,
          minYearsExperience:
            role.minYearsExperience != null ? String(role.minYearsExperience) : "",
          locationState: role.locationState ?? "",
          locationCity: role.locationCity ?? "",
          salaryRangeMin: role.salaryRangeMin ? String(Number(role.salaryRangeMin)) : "",
          salaryRangeMax: role.salaryRangeMax ? String(Number(role.salaryRangeMax)) : "",
          urgency: role.urgency ?? "MEDIUM",
          requiredQualifications: role.requiredQualifications.join("\n"),
          preferredQualifications: role.preferredQualifications.join("\n"),
          isRemoteOk: role.isRemoteOk,
          isRelocationRequired: role.isRelocationRequired,
        }}
      />
    </div>
  );
}
