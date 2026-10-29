import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { relocationQueue } from "@/lib/cadreHealth/zuriRelocationSend";
import SendButtons from "./SendButtons";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["DIRECTOR", "PARTNER", "ADMIN"];

/** The relocation questions for Zuri Health applicants: who is waiting for the link, and the buttons that send it. */
export default async function ZuriRelocationPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED_ROLES.includes(session.user.role)) redirect("/dashboard");

  const { inPlay, answered, skipped, byRole, queue } = await relocationQueue();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Zuri Health: relocation questions</h1>
        <p className="text-sm text-gray-500 mt-1">Applicants still in play on the Nairobi roles.</p>
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[
          ["In play", inPlay],
          ["Waiting for the link", queue.length],
          ["Already sent", skipped.alreadySent],
          ["Answered", answered],
        ].map(([label, n]) => (
          <div key={label} className="rounded-lg border border-gray-200 p-3">
            <dt className="text-gray-500">{label}</dt>
            <dd className="text-xl font-semibold text-gray-900">{n}</dd>
          </div>
        ))}
      </dl>
      {queue.length > 0 && (
        <p className="text-sm text-gray-700">
          {Object.entries(byRole)
            .map(([role, n]) => `${role}: ${n}`)
            .join(" · ")}
        </p>
      )}
      <SendButtons waiting={queue.length} />
    </div>
  );
}
