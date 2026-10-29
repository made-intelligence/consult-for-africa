import Link from "next/link";
import { redirect } from "next/navigation";
import { getCadreEmployerContext, canWrite } from "@/lib/cadreEmployerAuth";
import RoleForm, { BLANK_ROLE } from "../RoleForm";

export const dynamic = "force-dynamic";

export default async function NewRolePage() {
  const ctx = await getCadreEmployerContext();
  if (!ctx) redirect("/oncadre/employer/login");
  if (!canWrite(ctx)) redirect("/oncadre/employer/roles");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/oncadre/employer/roles"
          className="text-sm text-gray-400 transition-colors hover:text-[#0B3C5D]"
        >
          &larr; Roles
        </Link>
        <h1
          className="mt-3 font-bold text-gray-900"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)" }}
        >
          Post a role
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-gray-500">
          It goes on the CadreHealth job board under {ctx.org.name}. You can also
          reach people directly from Candidates rather than waiting for applications.
        </p>
      </div>

      <RoleForm initial={BLANK_ROLE} />
    </div>
  );
}
