import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CredentialVerdict } from "@/components/cadrehealth/CredentialVerdict";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];

const TYPE_LABELS: Record<string, string> = {
  PRACTICING_LICENSE: "Practising licence",
  FULL_REGISTRATION: "Full registration",
  COGS: "Certificate of good standing",
  SPECIALIST_REGISTRATION: "Specialist registration",
  ADDITIONAL_LICENSE: "Additional licence",
};

/**
 * The queue of credentials members have submitted with a number and nobody has
 * checked. Oldest first: the member who has waited longest is the one writing in.
 */
export default async function CredentialQueuePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED_ROLES.includes(session.user.role)) redirect("/dashboard");

  const [pending, total] = await Promise.all([
    prisma.cadreCredential.findMany({
      where: { verificationStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { professional: { select: { id: true, firstName: true, lastName: true, subSpecialty: true, cadre: true } } },
    }),
    prisma.cadreCredential.count({ where: { verificationStatus: "PENDING" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/admin/cadrehealth" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> CadreHealth
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Credentials to check</h1>
      <p className="mt-1 text-sm text-gray-500">
        {total} waiting. Look each number up on the regulator&apos;s register, then mark it. The member sees the result on their profile.
      </p>

      {pending.length === 0 ? (
        <p className="mt-8 rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500">Nothing waiting.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white">
          {pending.map((c) => (
            <div key={c.id} className="flex flex-col gap-3 border-b border-gray-100 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/admin/cadrehealth/${c.professional.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                  {c.professional.firstName} {c.professional.lastName}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">
                  {TYPE_LABELS[c.type] || c.type} · {c.regulatoryBody} · <span className="font-mono text-gray-700">{c.licenseNumber}</span>
                  {c.professional.subSpecialty ? ` · ${c.professional.subSpecialty}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Submitted {c.createdAt.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  {c.documentUrl && (
                    <>
                      {" · "}
                      <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[#0B3C5D] hover:underline">
                        Document
                      </a>
                    </>
                  )}
                </p>
              </div>
              <CredentialVerdict credentialId={c.id} status={c.verificationStatus} hasNumber={!!c.licenseNumber} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
