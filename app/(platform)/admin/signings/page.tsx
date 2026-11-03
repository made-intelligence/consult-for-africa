import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { accessibleProgrammes, dayLabel } from "@/lib/signings";

export const dynamic = "force-dynamic";

/** Every signing programme the person works on. With one, it goes straight there. */
export default async function SigningsIndex() {
  const session = await auth();
  if (!session) redirect("/login");
  const programmes = await accessibleProgrammes(session.user);
  if (programmes.length === 1) redirect(`/admin/signings/${programmes[0].id}`);
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Provider signings</h1>
      {programmes.length === 0 && <p className="text-sm text-slate-500">You are not on any signing programme.</p>}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {programmes.map((p) => (
          <Link key={p.id} href={`/admin/signings/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
            <span className="font-semibold text-slate-900">{p.name}</span>
            <span className="text-xs text-slate-500">Target {p.target}{p.deadline ? `, by ${dayLabel(p.deadline)}` : ""}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
