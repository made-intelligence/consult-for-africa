"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * One candidate, as a hospital reads them.
 *
 * The card is built around telling the truth about provenance. 99% of the
 * specialties on the register are what a regulatory list said about someone
 * rather than what they say about themselves, and a hospital booking a theatre
 * on the strength of that deserves to know which it is reading. So every claim
 * carries where it came from, and an unconfirmed one is visibly weaker than a
 * confirmed one rather than looking identical.
 */

export interface Candidate {
  id: string;
  name: string;
  cadre: string;
  cadreLabel: string;
  specialty: { value: string; confirmed: boolean; note: string } | null;
  licence: { value: string; confirmed: boolean; note: string };
  yearsOfExperience: number | null;
  currentRole: string | null;
  location: string;
  isDiaspora: boolean;
  tier: {
    tier: "OPEN" | "MEMBER" | "REGISTER";
    label: string;
    meaning: string;
    bg: string;
    color: string;
    contactDirect: boolean;
  };
  availabilityLabel: string | null;
  availabilityStale: boolean;
  noticePeriodWeeks: number | null;
  openTo: string[];
  hasCv: boolean;
  profileCompleteness: number;
}

export default function CandidateCard({
  candidate,
  employerVerified,
  onShortlist,
  onApproach,
  shortlisted,
}: {
  candidate: Candidate;
  employerVerified: boolean;
  onShortlist: (c: Candidate) => void;
  onApproach: (c: Candidate) => void;
  shortlisted: boolean;
}) {
  const [showProvenance, setShowProvenance] = useState(false);
  const c = candidate;

  return (
    <div
      className="flex flex-col rounded-2xl bg-white p-5"
      style={{
        border: "1px solid #E8EBF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{c.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {c.cadreLabel}
            {c.specialty ? (
              <>
                {" / "}
                <span
                  style={{
                    borderBottom: c.specialty.confirmed
                      ? "none"
                      : "1px dashed #CBD5E1",
                    color: c.specialty.confirmed ? "#374151" : "#6B7280",
                  }}
                  title={c.specialty.note}
                >
                  {c.specialty.value}
                </span>
              </>
            ) : null}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: c.tier.bg, color: c.tier.color }}
          title={c.tier.meaning}
        >
          {c.tier.label}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        {c.yearsOfExperience != null && (
          <span className="rounded-md px-2 py-0.5 text-gray-600" style={{ background: "#F8F9FB" }}>
            {c.yearsOfExperience} yrs
          </span>
        )}
        <span className="rounded-md px-2 py-0.5 text-gray-600" style={{ background: "#F8F9FB" }}>
          {c.location}
        </span>
        {c.isDiaspora && (
          <span
            className="rounded-md px-2 py-0.5"
            style={{ background: "rgba(99,102,241,0.08)", color: "#4F46E5" }}
          >
            Diaspora
          </span>
        )}
        {c.hasCv && (
          <span
            className="rounded-md px-2 py-0.5"
            style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}
          >
            CV on file
          </span>
        )}
      </div>

      {c.currentRole && (
        <p className="mt-2 truncate text-xs text-gray-500">{c.currentRole}</p>
      )}

      {c.availabilityLabel && (
        <p className="mt-2 text-xs" style={{ color: c.availabilityStale ? "#9CA3AF" : "#059669" }}>
          {c.availabilityLabel}
          {c.availabilityStale && " (said a while ago)"}
          {c.noticePeriodWeeks != null &&
            `, ${c.noticePeriodWeeks === 0 ? "available now" : `${c.noticePeriodWeeks} weeks notice`}`}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowProvenance((v) => !v)}
        className="mt-3 self-start text-[11px] font-medium text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
      >
        {showProvenance ? "Hide what we know" : "What do we actually know?"}
      </button>

      {showProvenance && (
        <dl
          className="mt-2 space-y-1.5 rounded-lg p-3 text-[11px]"
          style={{ background: "#F8F9FB" }}
        >
          <div>
            <dt className="font-semibold text-gray-700">{c.licence.value}</dt>
            <dd className="text-gray-500">{c.licence.note}</dd>
          </div>
          {c.specialty && (
            <div>
              <dt className="font-semibold text-gray-700">{c.specialty.value}</dt>
              <dd className="text-gray-500">{c.specialty.note}</dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-gray-700">{c.tier.label}</dt>
            <dd className="text-gray-500">{c.tier.meaning}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-700">
              Profile {c.profileCompleteness}% complete
            </dt>
            <dd className="text-gray-500">
              {c.profileCompleteness >= 70
                ? "Most of their record is filled in"
                : "Much of their record is still empty"}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-4 flex flex-wrap gap-2 pt-1">
        <Link
          href={`/oncadre/employer/candidates/${c.id}`}
          className="rounded-lg px-3 py-2 text-xs font-semibold transition hover:bg-[#0B3C5D]/5"
          style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
        >
          View profile
        </Link>
        <button
          type="button"
          onClick={() => onShortlist(c)}
          disabled={shortlisted}
          className="rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:opacity-60"
          style={{
            background: shortlisted ? "rgba(16,185,129,0.09)" : "rgba(11,60,93,0.06)",
            color: shortlisted ? "#059669" : "#0B3C5D",
          }}
        >
          {shortlisted ? "Shortlisted" : "Add to shortlist"}
        </button>
        <button
          type="button"
          onClick={() => onApproach(c)}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: "#0B3C5D" }}
          title={
            employerVerified
              ? "Ask them whether you may make contact"
              : "Your organisation needs to be verified first"
          }
        >
          {c.tier.contactDirect ? "Approach" : "Ask to contact"}
        </button>
      </div>
    </div>
  );
}
