import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { inRoles, RATE_CARD_ROLES } from "@/lib/constants";
import {
  ALL_BLOCKS,
  HOUSE_RULES,
  NEGOTIATION_GUIDES,
  NEVER_CONCEDE,
  OPEN_GAPS,
  type Block,
} from "@/lib/pricing";

export const dynamic = "force-dynamic";

const NAVY = "#0F2744";
const GOLD = "#D4AF37";
const SLATE = "#64748B";
const LINE = "#e5eaf0";

function Section({ block }: { block: Block }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
        {block.heading}
      </h2>
      {block.intro && (
        <p className="text-sm leading-relaxed mb-4" style={{ color: SLATE }}>
          {block.intro}
        </p>
      )}
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
        {block.rows.map((row, i) => (
          <div
            key={row.label}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3"
            style={{
              background: i % 2 ? "#fafbfc" : "#ffffff",
              borderTop: i ? `1px solid ${LINE}` : undefined,
            }}
          >
            <div className="text-sm font-medium sm:w-72 shrink-0" style={{ color: NAVY }}>
              {row.label}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: NAVY }}>
                {row.value}
              </div>
              {row.note && (
                <div className="text-xs mt-0.5 leading-relaxed" style={{ color: SLATE }}>
                  {row.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {block.caution && (
        <p
          className="text-sm leading-relaxed mt-3 pl-3"
          style={{ color: NAVY, borderLeft: `3px solid ${GOLD}` }}
        >
          {block.caution}
        </p>
      )}
    </section>
  );
}

export default async function RateCardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!inRoles(session.user.role, RATE_CARD_ROLES)) redirect("/dashboard");

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl">
      <h1 className="text-2xl font-semibold" style={{ color: NAVY }}>
        The rate card
      </h1>
      <p className="text-sm leading-relaxed mt-2 mb-2" style={{ color: SLATE }}>
        Every price the firm holds, the doctrine behind it, and where the private ladders live. This is the
        document the growth pack deliberately left out, because a figure in a mailbox travels and a figure
        behind a login does not.
      </p>
      <p className="text-sm leading-relaxed mb-8" style={{ color: SLATE }}>
        What is not here, on purpose: client balances and agreed fees, which sit on the engagement record and
        on Invoices, because that is the only place they are ever current. Read a client number there on the
        day you quote it.
      </p>

      {ALL_BLOCKS.map((b) => (
        <Section key={b.heading} block={b} />
      ))}

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
          How we hold a price
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: SLATE }}>
          A client reads any proposal as an opening bid regardless of how carefully it was reasoned, so
          opening at the number that feels fair just forfeits the spread.
        </p>
        <ul className="space-y-2">
          {HOUSE_RULES.map((r) => (
            <li key={r} className="text-sm leading-relaxed pl-4" style={{ color: NAVY, borderLeft: `2px solid ${LINE}` }}>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
          Never concede these
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: SLATE }}>
          On a build and operate mandate, these are the terms that carry the economics rather than the
          headline, so they are worth more than the fee line and are the last things to trade.
        </p>
        <div className="flex flex-wrap gap-2">
          {NEVER_CONCEDE.map((n) => (
            <span
              key={n}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}
            >
              {n}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
          The private negotiation guides
        </h2>
        <p className="text-sm leading-relaxed mb-4" style={{ color: SLATE }}>
          Each of these carries the floor, the concession ladder and the prepared answers to that client's
          pushback. They live in the repository alongside the client facing document and{" "}
          <strong style={{ color: NAVY }}>none of them is ever sent to a client under any circumstances</strong>.
        </p>
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
          {NEGOTIATION_GUIDES.map((g, i) => (
            <div
              key={g.path}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-2.5"
              style={{ background: i % 2 ? "#fafbfc" : "#ffffff", borderTop: i ? `1px solid ${LINE}` : undefined }}
            >
              <div className="text-sm font-medium sm:w-64 shrink-0" style={{ color: NAVY }}>
                {g.client}
              </div>
              <code className="text-xs break-all" style={{ color: SLATE }}>
                {g.path}
              </code>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2" style={{ color: NAVY }}>
          What is missing, and whose decision it is
        </h2>
        <ul className="space-y-3">
          {OPEN_GAPS.map((g) => (
            <li key={g} className="text-sm leading-relaxed pl-3" style={{ color: NAVY, borderLeft: `3px solid ${GOLD}` }}>
              {g}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed pt-6" style={{ color: SLATE, borderTop: `1px solid ${LINE}` }}>
        Internal to the firm, and to this role. None of these figures appears in any external material, in
        marketing copy, or in a document that leaves the building. Prices change when the Founding Partner
        changes them, so if something here disagrees with what he has just told you, he is right and this page
        needs correcting.
      </p>
    </div>
  );
}
