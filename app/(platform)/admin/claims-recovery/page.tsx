import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { LEAD_SOURCE, PRODUCT_KEY, SERVICE_PATH } from "@/lib/claims-recovery";
import { CLOSED_STAGES, DEFAULT_CAMPAIGN, STAGES, WHATSAPP_OPENER, whatsappLink } from "@/lib/hospital-sales";
import { CampaignControls, NewCampaign, HospitalActions } from "./SalesClient";

export const dynamic = "force-dynamic";

// The claims recovery sales funnel: where every hospital in the directory
// stands, what the campaigns have done, and who has enquired. The desk (what
// happens after a hospital signs) is at ./desk.

const ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];
const PAGE = 60;

export default async function ClaimsRecoverySalesPage({ searchParams }: { searchParams: Promise<{ stage?: string; q?: string; reach?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ROLES.includes(session.user.role)) redirect("/dashboard");
  const sp = await searchParams;

  const stageFilter = sp.stage && [...STAGES, ...CLOSED_STAGES].some((s) => s.key === sp.stage) ? sp.stage : undefined;
  const q = sp.q?.trim();

  const [stageCounts, totalHospitals, withEmail, withPhoneOnly, campaigns, sendStats, leads, hospitals] = await Promise.all([
    prisma.hospitalProductStage.groupBy({ by: ["stage"], where: { product: PRODUCT_KEY }, _count: true }),
    prisma.hospital.count({ where: { importKey: { not: null } } }),
    prisma.hospital.count({ where: { contacts: { some: { email: { not: null } } } } }),
    prisma.hospital.count({ where: { contacts: { some: { phone: { not: null } }, none: { email: { not: null } } } } }),
    prisma.salesCampaign.findMany({ where: { product: PRODUCT_KEY }, orderBy: { createdAt: "desc" } }),
    prisma.salesCampaignSend.groupBy({ by: ["campaignId", "status"], _count: true }),
    prisma.lead.findMany({ where: { source: LEAD_SOURCE }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.hospital.findMany({
      where: {
        ...(stageFilter ? { productStages: { some: { product: PRODUCT_KEY, stage: stageFilter } } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { lga: { contains: q, mode: "insensitive" } }] } : {}),
        ...(sp.reach === "phone" ? { contacts: { some: { phone: { not: null } }, none: { email: { not: null } } } } : {}),
        ...(sp.reach === "email" ? { contacts: { some: { email: { not: null } } } } : {}),
      },
      orderBy: [{ lastContactDate: { sort: "desc", nulls: "last" } }, { name: "asc" }],
      take: PAGE,
      include: {
        contacts: { select: { email: true, phone: true, name: true } },
        productStages: { where: { product: PRODUCT_KEY }, select: { stage: true } },
        contactLog: { orderBy: { contactedAt: "desc" }, take: 1, select: { channel: true, summary: true, contactedAt: true } },
      },
    }),
  ]);
  const clickAndEnquire = await prisma.salesCampaignSend.groupBy({
    by: ["campaignId"],
    where: { campaign: { product: PRODUCT_KEY } },
    _count: { clickedAt: true, enquiredAt: true, unsubscribedAt: true },
  });

  const count = (k: string) => stageCounts.find((s) => s.stage === k)?._count ?? 0;
  const stat = (cid: string, status: string) => sendStats.find((s) => s.campaignId === cid && s.status === status)?._count ?? 0;
  const ce = (cid: string) => clickAndEnquire.find((x) => x.campaignId === cid)?._count;

  const card = "rounded-xl border border-slate-200 bg-white p-4";

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Claims recovery: sales" />
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a href={SERVICE_PATH} target="_blank" className="rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-white">Open the public page</a>
          <Link href="/admin/claims-recovery/desk" className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700">Go to the desk</Link>
          <span className="text-slate-500">
            {totalHospitals} hospitals imported · {withEmail} with email · {withPhoneOnly} phone only
          </span>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Funnel</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-9">
            {[...STAGES, ...CLOSED_STAGES].map((s) => (
              <Link key={s.key} href={`?stage=${s.key}`} className={`${card} ${stageFilter === s.key ? "ring-2 ring-[#D4AF37]" : ""}`}>
                <p className="text-2xl font-semibold text-[#0B3C5D]">{count(s.key)}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Enquiries</h2>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-500">None yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {leads.map((l) => (
                <div key={l.id} className={card}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/leads/${l.id}`} className="font-semibold text-[#0B3C5D] hover:underline">{l.organizationName}</Link>
                      <p className="text-xs text-slate-500">{l.contactName} · {l.contactRole} · {l.contactPhone} · {l.contactEmail}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.qualificationScore === "HOT" ? "bg-red-50 text-red-700" : l.qualificationScore === "WARM" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{l.qualificationScore}</span>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600">{l.inboundMessage}</pre>
                  <p className="mt-2 text-xs text-slate-400">{l.status} · {l.createdAt.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Email campaigns</h2>
          <div className="space-y-3">
            {campaigns.map((c) => {
              const x = ce(c.id);
              return (
                <div key={c.id} className={card}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-[#0B3C5D]">{c.name} <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{c.status}</span></p>
                    <p className="text-xs text-slate-500">cap {c.dailyCap}/day</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Subject: {c.subject}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {stat(c.id, "QUEUED")} queued · {stat(c.id, "SENT")} sent · {stat(c.id, "FAILED")} failed · {stat(c.id, "SUPPRESSED")} suppressed · {x?.clickedAt ?? 0} clicked · {x?.enquiredAt ?? 0} enquired · {x?.unsubscribedAt ?? 0} opted out
                  </p>
                  <CampaignControls id={c.id} status={c.status} queued={stat(c.id, "QUEUED")} />
                </div>
              );
            })}
            <NewCampaign defaults={DEFAULT_CAMPAIGN} product={PRODUCT_KEY} />
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Hospitals {stageFilter ? `at ${[...STAGES, ...CLOSED_STAGES].find((s) => s.key === stageFilter)?.label}` : ""}
            </h2>
            <form className="flex gap-2 text-sm">
              {stageFilter && <input type="hidden" name="stage" value={stageFilter} />}
              <select name="reach" defaultValue={sp.reach ?? ""} className="rounded-lg border border-slate-300 px-2 py-1">
                <option value="">Any contact</option>
                <option value="email">Has email</option>
                <option value="phone">Phone only (call or WhatsApp)</option>
              </select>
              <input name="q" defaultValue={q} placeholder="Name or LGA" className="rounded-lg border border-slate-300 px-2 py-1" />
              <button className="rounded-lg bg-[#0B3C5D] px-3 py-1 text-white">Filter</button>
              {(stageFilter || q || sp.reach) && <Link href="?" className="px-2 py-1 text-slate-500">Clear</Link>}
            </form>
          </div>
          <div className="space-y-2">
            {hospitals.map((h) => {
              const phone = h.contacts.find((c) => c.phone)?.phone;
              const email = h.contacts.find((c) => c.email)?.email;
              const stage = h.productStages[0]?.stage ?? "—";
              const last = h.contactLog[0];
              return (
                <div key={h.id} className={card}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{h.name}</p>
                      <p className="text-xs text-slate-500">{[h.lga, h.category].filter(Boolean).join(" · ")} · stage {stage}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {email && <a href={`mailto:${email}`} className="mr-3 hover:underline">{email}</a>}
                        {phone && <a href={`tel:${phone}`} className="mr-3 hover:underline">{phone}</a>}
                        {phone && <a href={whatsappLink(phone, WHATSAPP_OPENER(h.name))} target="_blank" className="text-green-700 hover:underline">WhatsApp</a>}
                      </p>
                      {last && <p className="mt-1 text-xs text-slate-400">Last: {last.channel} {last.contactedAt.toLocaleDateString("en-GB")}: {last.summary.slice(0, 120)}</p>}
                    </div>
                    <HospitalActions id={h.id} product={PRODUCT_KEY} stage={stage} />
                  </div>
                </div>
              );
            })}
            {hospitals.length === PAGE && <p className="text-xs text-slate-400">Showing the first {PAGE}. Filter to narrow.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
