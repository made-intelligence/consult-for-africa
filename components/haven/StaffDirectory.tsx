"use client";

import { useMemo, useState } from "react";

/**
 * The directory. Nineteen people and nobody has everybody's number.
 *
 * This is the one thing on the page that gives rather than asks, which is why
 * it sits above the forms. At three in the morning you need the medical officer
 * on, or the pharmacist, and the honest alternative today is scrolling WhatsApp.
 *
 * Numbers are tap to call on a phone, which is where this will be opened. It is
 * behind sign-in because it is nineteen colleagues' personal mobiles, and it is
 * not on the page at all for somebody who has only followed the link.
 */

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

export interface DirectoryEntry {
  name: string;
  position: string;
  department: string;
  phone: string | null;
}

const DEPT_ORDER = ["MEDICAL", "NURSING", "PHARMACY", "LAB", "ADMIN", "DOMESTIC"];
const DEPT_LABEL: Record<string, string> = {
  MEDICAL: "Medical",
  NURSING: "Nursing",
  PHARMACY: "Pharmacy",
  LAB: "Laboratory",
  ADMIN: "Admin and front desk",
  DOMESTIC: "Support",
};

export default function StaffDirectory({ people }: { people: DirectoryEntry[] }) {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matched = needle
      ? people.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.position.toLowerCase().includes(needle) ||
            p.department.toLowerCase().includes(needle)
        )
      : people;
    const by: Record<string, DirectoryEntry[]> = {};
    for (const p of matched) (by[p.department] ??= []).push(p);
    const keys = Object.keys(by).sort(
      (a, b) =>
        (DEPT_ORDER.indexOf(a) + 1 || 99) - (DEPT_ORDER.indexOf(b) + 1 || 99)
    );
    return keys.map((k) => [k, by[k].sort((a, b) => a.name.localeCompare(b.name))] as const);
  }, [people, q]);

  const total = people.length;

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${total} people by name or role`}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 16, // 16px or iOS zooms on focus
          border: `1px solid ${LINE}`,
          borderRadius: 10,
          fontFamily: "inherit",
          boxSizing: "border-box",
          marginBottom: 18,
        }}
      />

      {grouped.length === 0 && (
        <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>Nobody matches that.</p>
      )}

      {grouped.map(([dept, list]) => (
        <div key={dept} style={{ marginBottom: 22 }}>
          <div
            style={{
              color: GOLD,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {DEPT_LABEL[dept] ?? dept}
          </div>
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
            {list.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 14px",
                  borderTop: i === 0 ? "none" : `1px solid ${LINE}`,
                  background: "#fff",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: NAVY, fontWeight: 650, fontSize: 15.5 }}>{p.name}</div>
                  <div style={{ color: MUTED, fontSize: 13.5, marginTop: 1 }}>{p.position}</div>
                </div>
                {p.phone ? (
                  <a
                    href={`tel:${p.phone.replace(/\s/g, "")}`}
                    style={{
                      flexShrink: 0,
                      color: TEAL,
                      fontWeight: 650,
                      fontSize: 14.5,
                      textDecoration: "none",
                      border: `1px solid ${LINE}`,
                      borderRadius: 999,
                      padding: "8px 14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Call
                  </a>
                ) : (
                  <span style={{ flexShrink: 0, color: MUTED, fontSize: 13 }}>no number</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, margin: "4px 0 0" }}>
        These are your colleagues' work contact details, for work. If yours is wrong, or you would
        rather it was not here, tell us and we will change it the same day.
      </p>
    </div>
  );
}
