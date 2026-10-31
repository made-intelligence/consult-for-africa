"use client";

import { useState } from "react";
import { MATCH_LABEL } from "@/lib/cadreHealth/internship/programme";
import { PER_SECTION, SECTIONS, type SectionKey } from "@/lib/cadreHealth/internship/paper";

const MIN_SCORE = 60;
const SLOTS = 6;

type Candidate = {
  name: string;
  school: string;
  year: number;
  rank: number;
  licence: string | null;
  email: string;
  phone: string;
  /** Correct answers per section, out of PER_SECTION, in SECTIONS order. */
  sections: number[];
};

// Sample people. Names, numbers and addresses are invented.
const CANDIDATES: Candidate[] = [
  { name: "Adaeze Okonkwo", school: "University of Lagos", year: 2026, rank: 1, licence: "NMCN/INT/26/0412", email: "adaeze.sample@example.com", phone: "0803 000 0101", sections: [6, 5, 6, 5, 6, 5, 5] },
  { name: "Oluwaseun Adebayo", school: "Obafemi Awolowo University", year: 2026, rank: 2, licence: "NMCN/INT/26/0388", email: "seun.sample@example.com", phone: "0803 000 0102", sections: [5, 5, 6, 5, 5, 6, 4] },
  { name: "Halima Bello", school: "Ahmadu Bello University", year: 2025, rank: 1, licence: null, email: "halima.sample@example.com", phone: "0803 000 0103", sections: [5, 6, 4, 6, 5, 5, 4] },
  { name: "Chidinma Eze", school: "University of Nigeria, Nsukka", year: 2026, rank: 3, licence: "NMCN/INT/26/0577", email: "chidinma.sample@example.com", phone: "0803 000 0104", sections: [5, 4, 5, 5, 5, 5, 4] },
  { name: "Temitope Ogunleye", school: "Lagos State University", year: 2026, rank: 1, licence: null, email: "temi.sample@example.com", phone: "0803 000 0105", sections: [5, 5, 3, 5, 6, 4, 4] },
  { name: "Ifeoma Nwankwo", school: "University of Benin", year: 2025, rank: 2, licence: "NMCN/INT/25/1190", email: "ifeoma.sample@example.com", phone: "0803 000 0106", sections: [4, 5, 4, 4, 5, 5, 4] },
  { name: "Abdulrahman Yusuf", school: "University of Ibadan", year: 2026, rank: 4, licence: null, email: "abdul.sample@example.com", phone: "0803 000 0107", sections: [4, 4, 5, 3, 5, 4, 4] },
  { name: "Blessing Akpan", school: "Babcock University", year: 2026, rank: 2, licence: "NMCN/INT/26/0233", email: "blessing.sample@example.com", phone: "0803 000 0108", sections: [4, 4, 3, 5, 4, 4, 3] },
  { name: "Damilola Fashola", school: "Afe Babalola University", year: 2026, rank: 5, licence: null, email: "dami.sample@example.com", phone: "0803 000 0109", sections: [4, 3, 4, 4, 4, 3, 4] },
  { name: "Grace Odum", school: "University of Port Harcourt", year: 2025, rank: 3, licence: "NMCN/INT/25/0951", email: "grace.sample@example.com", phone: "0803 000 0110", sections: [3, 4, 3, 4, 4, 4, 3] },
  // Below the minimum: counted, not listed, as in the real view.
  { name: "Below minimum", school: "", year: 2026, rank: 3, licence: null, email: "", phone: "", sections: [3, 3, 2, 3, 3, 3, 3] },
  { name: "Below minimum", school: "", year: 2026, rank: 4, licence: null, email: "", phone: "", sections: [2, 3, 3, 3, 2, 3, 2] },
];

const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];
const score = (c: Candidate) => Math.round((c.sections.reduce((a, b) => a + b, 0) / (PER_SECTION * SECTION_KEYS.length)) * 100);

const ranked = CANDIDATES.map((c) => ({ ...c, score: score(c) }))
  .sort((a, b) => b.score - a.score || a.rank - b.rank);
const listed = ranked.filter((c) => c.score >= MIN_SCORE);
const below = ranked.length - listed.length;

const NEXT: Record<string, { to: string; label: string; primary?: boolean }[]> = {
  PENDING: [
    { to: "INVITED", label: "Invite to interview", primary: true },
    { to: "DECLINED", label: "Not progressing" },
  ],
  INVITED: [
    { to: "OFFERED", label: "Offer a place", primary: true },
    { to: "DECLINED", label: "Not progressing" },
  ],
  // In the real flow the nurse accepts on their own link; here the demo plays their part.
  OFFERED: [{ to: "ACCEPTED", label: "Show the nurse accepting", primary: true }],
};

export default function DemoList() {
  const [status, setStatus] = useState<string[]>(() => listed.map(() => "PENDING"));
  const accepted = status.filter((s) => s === "ACCEPTED").length;
  const set = (i: number, to: string) => setStatus((s) => s.map((v, j) => (j === i ? to : v)));

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {listed.length} candidates at or above your minimum of {MIN_SCORE}%, {below} below it. {accepted} of {SLOTS} places
        filled.
      </p>
      {listed.map((c, i) => {
        const s = status[i];
        const showContact = ["INVITED", "OFFERED", "ACCEPTED"].includes(s);
        return (
          <div key={c.email} className="rounded-xl bg-white p-5" style={{ border: "1px solid #E8EBF0", opacity: s === "DECLINED" ? 0.55 : 1 }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  <span className="mr-2 text-xs tabular-nums text-gray-400">#{i + 1}</span>
                  {c.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  BNSc, {c.school}, {c.year} · their choice {c.rank} · intern licence {c.licence || "not yet given"}
                </p>
                <p className="mt-1 text-xs text-gray-700">
                  {showContact ? `${c.email} · ${c.phone}` : <span className="text-gray-400">Contact details open when you invite</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums text-[#0B3C5D]">{c.score}%</p>
                <p className="text-xs text-gray-500">{MATCH_LABEL[s]}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
              {SECTION_KEYS.map((k, j) => (
                <span key={k} className="tabular-nums">
                  {SECTIONS[k]}: {c.sections[j]}/{PER_SECTION}
                </span>
              ))}
            </div>
            {NEXT[s] && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {NEXT[s].map((a) => (
                  <button
                    key={a.to}
                    onClick={() => set(i, a.to)}
                    disabled={a.to === "ACCEPTED" && accepted >= SLOTS}
                    className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
                    style={a.primary ? { background: "#0B3C5D", color: "#fff" } : { border: "1px solid #E8EBF0", color: "#374151" }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
