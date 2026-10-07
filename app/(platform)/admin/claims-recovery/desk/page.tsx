import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { PRODUCT_KEY } from "@/lib/claims-recovery";
import { DESK_ROLES, OPEN_STATUSES } from "@/lib/recovery-desk";
import { OpenAccountButton } from "./DeskClient";

export const dynamic = "force-dynamic";

const naira = (n: number) => `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

export default async function RecoveryDeskPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!DESK_ROLES.includes(session.user.role)) redirect("/dashboard");

  const [accounts, ready] = await Promise.all([
    prisma.recoveryAccount.findMany({ orderBy: { createdAt: "desc" }, include: { hospital: { select: { name: true, lga: true } } } }),
    prisma.hospital.findMany({
      where: { recoveryAccount: null, productStages: { some: { product: PRODUCT_KEY, stage: { in: ["ENQUIRED", "SAMPLE", "PROPOSAL", "WON"] } } } },
      select: { id: true, name: true, productStages: { where: { product: PRODUCT_KEY }, select: { stage: true } } },
      take: 50,
    }),
  ]);
  const sums = await prisma.recoveryClaim.groupBy({
    by: ["accountId"],
    where: { status: { in: OPEN_STATUSES } },
    _sum: { billedAmount: true, recoveredAmount: true, advanceAmount: true },
    _count: true,
  });
  const due = await prisma.recoveryClaim.groupBy({ by: ["accountId"], where: { status: { in: OPEN_STATUSES }, nextActionAt: { lte: new Date() } }, _count: true });
  const s = (id: string) => sums.find((x) => x.accountId === id);

  const card = "rounded-xl border border-slate-200 bg-white p-4";
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Claims recovery: desk" />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <Link href="/admin/claims-recovery" className="text-sm text-slate-500 hover:underline">Back to sales</Link>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Hospitals on the desk</h2>
          {accounts.length === 0 && <p className="text-sm text-slate-500">None yet. Open one below when a hospital sends its sample.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {accounts.map((a) => {
              const x = s(a.id);
              return (
                <Link key={a.id} href={`/admin/claims-recovery/desk/${a.id}`} className={`${card} hover:border-slate-400`}>
                  <div className="flex justify-between">
                    <p className="font-semibold text-[#0B3C5D]">{a.hospital.name}</p>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{a.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {x?._count ?? 0} open claims · {naira(x?._sum.billedAmount?.toNumber() ?? 0)} billed · {naira(x?._sum.recoveredAmount?.toNumber() ?? 0)} recovered · {naira(x?._sum.advanceAmount?.toNumber() ?? 0)} advanced
                  </p>
                  {(due.find((d) => d.accountId === a.id)?._count ?? 0) > 0 && <p className="mt-1 text-xs font-medium text-amber-700">{due.find((d) => d.accountId === a.id)?._count} actions due</p>}
                </Link>
              );
            })}
          </div>
        </section>
        {ready.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Enquired, not yet on the desk</h2>
            <div className="space-y-2">
              {ready.map((h) => (
                <div key={h.id} className={`${card} flex items-center justify-between`}>
                  <p className="text-sm text-slate-800">{h.name} <span className="text-xs text-slate-400">({h.productStages[0]?.stage})</span></p>
                  <OpenAccountButton hospitalId={h.id} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
