import Link from "next/link";
import type { PendingFit } from "@/lib/cadreHealth/pendingFit";

/** The first thing a client sees while their roles wait on the fit request. */
export default function PendingFitBanner({ pending }: { pending: PendingFit }) {
  const applied = pending.roles.reduce((n, r) => n + r.applied, 0);
  const shortlisted = pending.roles.reduce((n, r) => n + r.shortlisted, 0);
  const count = pending.roles.length;

  return (
    <section
      className="mb-8 overflow-hidden rounded-2xl bg-white"
      style={{ border: "1px solid #E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" }}
    >
      <div className="px-6 py-6 sm:px-8" style={{ background: "#0B3C5D" }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">One step left</p>
        <h2 className="mt-2 font-bold leading-tight text-white" style={{ fontSize: "clamp(1.25rem, 3vw, 1.6rem)" }}>
          {count === 1 ? "Your role is" : `Your ${count} roles are`} live and doctors are applying
        </h2>
        <p className="mt-2 text-sm text-white/80">
          {applied} {applied === 1 ? "doctor has" : "doctors have"} applied and {shortlisted} {shortlisted === 1 ? "is" : "are"} already shortlisted. Tell us what fit looks like and accept our terms, and your candidates appear here.
        </p>
      </div>

      <ul className="divide-y" style={{ borderColor: "#F0F1F4" }}>
        {pending.roles.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
            <p className="min-w-0 text-sm font-medium text-gray-900">{r.title}</p>
            <div className="flex shrink-0 gap-4 text-right">
              <div>
                <p className="text-lg font-bold text-[#0B3C5D]">{r.applied}</p>
                <p className="text-[11px] text-gray-400">applied</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#059669]">{r.shortlisted}</p>
                <p className="text-[11px] text-gray-400">shortlisted</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8" style={{ background: "#F8F9FB" }}>
        <p className="text-xs text-gray-500">About ten minutes. Everyone who has applied is re-assessed against your answers the moment you save.</p>
        <Link
          href={pending.href}
          className="shrink-0 rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", boxShadow: "0 2px 8px rgba(212,175,55,0.3)" }}
        >
          Tell us what fit looks like
        </Link>
      </div>
    </section>
  );
}
