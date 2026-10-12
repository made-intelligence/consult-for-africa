"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  STATUS_LABELS, STATUS_TONE, PRIORITY_TONE, CATEGORY_LABELS, isBreached,
} from "@/lib/estate/issues";
import type { EstateIssueCategory, EstateIssuePriority, EstateIssueStatus } from "@prisma/client";

/**
 * Working the board.
 *
 * Acknowledging is deliberately one tap and separate from everything else,
 * because it is the action with the tightest clock and the one a tenant judges
 * the office on. It is also the only action here that is worth doing from a
 * phone at a traffic light.
 */

interface Update {
  id: string;
  authorType: string;
  authorName: string;
  body: string | null;
  photoKeys: string[];
  statusTo: string | null;
  visibleToTenant: boolean;
  createdAt: string;
}

interface Issue {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: EstateIssueCategory;
  priority: EstateIssuePriority;
  status: EstateIssueStatus;
  photoKeys: string[];
  createdAt: string;
  acknowledgedAt: string | null;
  respondBy: string | null;
  resolveBy: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  costNaira: number | null;
  building: string;
  unit: string | null;
  tenant: string | null;
  tenantPhone: string | null;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  updates: Update[];
}

export default function IssueBoard({
  issues,
  staff,
}: {
  issues: Issue[];
  staff: Array<{ id: string; name: string; role: string }>;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/founder/estate/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "That did not go through.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  if (issues.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm" style={{ border: "1px solid #E8EBF0" }}>
        <p className="text-sm text-gray-400">Nothing outstanding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-xl p-3 text-xs font-semibold" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {issues.map((i) => {
        const br = isBreached({
          respondBy: i.respondBy ? new Date(i.respondBy) : null,
          resolveBy: i.resolveBy ? new Date(i.resolveBy) : null,
          acknowledgedAt: i.acknowledgedAt ? new Date(i.acknowledgedAt) : null,
          resolvedAt: i.resolvedAt ? new Date(i.resolvedAt) : null,
        });
        const open = openId === i.id;
        const tone = STATUS_TONE[i.status];
        const pt = PRIORITY_TONE[i.priority];

        return (
          <div
            key={i.id}
            className="rounded-2xl bg-white shadow-sm overflow-hidden"
            style={{
              border: "1px solid #E8EBF0",
              borderLeft: br.response || br.resolution ? "3px solid #DC2626" : undefined,
            }}
          >
            <button
              onClick={() => setOpenId(open ? null : i.id)}
              className="w-full text-left p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: "#0F2744" }}>
                  {i.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {i.building}
                  {i.unit ? ` ${i.unit}` : ""} · {CATEGORY_LABELS[i.category]} · {i.reference}
                  {i.tenant ? ` · ${i.tenant}` : ""}
                </p>
                {(br.response || br.resolution) && (
                  <p className="text-[10px] font-semibold mt-1" style={{ color: "#DC2626" }}>
                    {br.response ? "No reply yet and past the response target" : "Past the fix target"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {i.priority !== "NORMAL" && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                    style={{ background: pt.bg, color: pt.color }}
                  >
                    {i.priority}
                  </span>
                )}
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                  style={{ background: tone.bg, color: tone.color }}
                >
                  {STATUS_LABELS[i.status]}
                </span>
              </div>
            </button>

            {!i.acknowledgedAt && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => patch(i.id, { status: "ACKNOWLEDGED", body: null })}
                  disabled={busy}
                  className="w-full rounded-xl py-2.5 text-xs font-semibold text-white"
                  style={{ background: "#0F2744" }}
                >
                  Acknowledge — starts the clock and tells the tenant it is seen
                </button>
              </div>
            )}

            {open && (
              <Detail issue={i} staff={staff} busy={busy} onPatch={(b) => patch(i.id, b)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Detail({
  issue,
  staff,
  busy,
  onPatch,
}: {
  issue: Issue;
  staff: Array<{ id: string; name: string; role: string }>;
  busy: boolean;
  onPatch: (body: Record<string, unknown>) => void;
}) {
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(true);
  const [cost, setCost] = useState(issue.costNaira ? String(issue.costNaira) : "");

  return (
    <div className="px-4 pb-4 border-t" style={{ borderColor: "#E8EBF0" }}>
      <p className="text-xs text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">
        {issue.description}
      </p>

      {issue.photoKeys.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {issue.photoKeys.map((k) => (
            <a
              key={k}
              href={`/api/founder/estate/photo?key=${encodeURIComponent(k)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold"
              style={{ background: "#F3F4F6", color: "#4B5563" }}
            >
              View photo
            </a>
          ))}
        </div>
      )}

      {issue.tenantPhone && (
        <a
          href={`tel:${issue.tenantPhone}`}
          className="inline-block mt-3 text-[11px] font-semibold"
          style={{ color: "#D4AF37" }}
        >
          Call {issue.tenant} on {issue.tenantPhone}
        </a>
      )}

      {issue.updates.length > 0 && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3 space-y-2">
          {issue.updates.map((u) => (
            <div key={u.id} className="text-[11px]">
              <p className="text-gray-700">
                <span className="font-semibold">{u.authorName}</span>
                {u.statusTo ? ` · ${STATUS_LABELS[u.statusTo as EstateIssueStatus]}` : ""}
                {!u.visibleToTenant ? " · internal" : ""}
              </p>
              {u.body && <p className="text-gray-500 mt-0.5">{u.body}</p>}
              <p className="text-gray-300 text-[9px] mt-0.5">
                {new Date(u.createdAt).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add a note"
          className="w-full rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#E8EBF0" }}
        />
        <label className="flex items-center gap-2 text-[10px] text-gray-500">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          The tenant can see this note
        </label>

        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={issue.assignedStaffId ?? ""}
            onChange={(e) => onPatch({ assignedStaffId: e.target.value || null })}
            disabled={busy}
            className="rounded-lg border px-2.5 py-1.5 text-[11px]"
            style={{ borderColor: "#E8EBF0" }}
          >
            <option value="">Unassigned</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={issue.priority}
            onChange={(e) => onPatch({ priority: e.target.value })}
            disabled={busy}
            className="rounded-lg border px-2.5 py-1.5 text-[11px]"
            style={{ borderColor: "#E8EBF0" }}
          >
            {["EMERGENCY", "HIGH", "NORMAL", "LOW"].map((p) => (
              <option key={p} value={p}>
                {p.toLowerCase()}
              </option>
            ))}
          </select>
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value.replace(/[^\d.]/g, ""))}
            onBlur={() => cost && onPatch({ costNaira: Number(cost) })}
            placeholder="Cost ₦"
            inputMode="decimal"
            className="w-24 rounded-lg border px-2.5 py-1.5 text-[11px]"
            style={{ borderColor: "#E8EBF0" }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["SCHEDULED", "IN_PROGRESS", "AWAITING_PARTS"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onPatch({ status: s, body: note || null, visibleToTenant: visible })}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-[11px] font-semibold"
              style={{ border: "1px solid #E8EBF0", color: "#0F2744" }}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          {issue.status !== "RESOLVED" && issue.status !== "CLOSED" ? (
            <button
              onClick={() => onPatch({ status: "RESOLVED", body: note || null, visibleToTenant: visible })}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-[11px] font-semibold text-white"
              style={{ background: "#059669" }}
            >
              Fixed
            </button>
          ) : (
            <button
              onClick={() => onPatch({ status: "CLOSED", body: note || null, visibleToTenant: visible })}
              disabled={busy}
              className="rounded-lg px-3 py-2 text-[11px] font-semibold"
              style={{ border: "1px solid #E8EBF0", color: "#4B5563" }}
            >
              Close
            </button>
          )}
        </div>
        {issue.status !== "RESOLVED" &&
          !issue.updates.some(
            (u) => u.authorType !== "TENANT" && u.photoKeys.length > 0,
          ) && (
            <p className="text-[10px] text-gray-400">
              Marking this fixed needs a photo of the finished work from the team — the tenant&rsquo;s
              own photo of the problem does not count. That photo is what the tenant sees.
            </p>
          )}
      </div>
    </div>
  );
}
