import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopBar from "@/components/platform/TopBar";
import { ETH_ENGAGEMENT, sectionLabel } from "@/lib/ethereal-audit";

// Internal tracker for the Ethereal diagnostic audit: what has been uploaded
// from /EtherealProject, newest first, with a short-lived authenticated
// download for each. Uploads only; this engagement has no client surveys.
// Mirrors the uploads half of app/(platform)/admin/dennis-ashley-audit.

export const dynamic = "force-dynamic";

const prettySize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export default async function EtherealAuditPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const allowed = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"].includes(session.user.role);
  if (!allowed) redirect("/dashboard");

  const uploads = await prisma.auditUpload.findMany({
    where: { engagement: ETH_ENGAGEMENT },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, section: true, filename: true, sizeBytes: true,
      uploadedBy: true, note: true, createdAt: true,
    },
  });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Ethereal Audit Documents"
        subtitle={`${uploads.length} document${uploads.length === 1 ? "" : "s"} in · Ref MZ-ENG-ETH-2026`}
        backHref="/dashboard"
      />
      <div className="flex-1 overflow-y-auto p-6">
        {uploads.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
            Nothing uploaded yet. Documents sent from{" "}
            <span className="font-mono text-gray-700">consultforafrica.com/EtherealProject</span> will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Section</th>
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Sent by / note</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((f, i) => (
                  <tr key={f.id} className={i % 2 ? "bg-gray-50/50" : ""}>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(f.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{sectionLabel(f.section)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{f.filename}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{prettySize(f.sizeBytes)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {f.uploadedBy?.trim() || <span className="text-gray-400">unnamed</span>}
                      {f.note?.trim() ? <div className="mt-0.5 text-xs text-gray-500">{f.note}</div> : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a href={`/api/ethereal-audit/upload/${f.id}`} className="font-medium underline" style={{ color: "#1F7A8C" }}>
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
