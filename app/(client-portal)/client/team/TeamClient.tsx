"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Member = { id: string; name: string; email: string; title: string | null; isPortalEnabled: boolean; invited: boolean; lastLoginAt: string | null; isMe: boolean };

const NAVY = "#0F2744";

export default function TeamClient({ members, canManage }: { members: Member[]; canManage: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", title: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`${form.name || "This person"} will see everything in this portal, including invoices. Send the invitation?`)) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/client-portal/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, title: form.title || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? "That did not work. Please try again." });
    setMsg({ ok: true, text: `Invitation sent to ${form.email}. Their login details are in the email.` });
    setForm({ name: "", email: "", title: "" });
    router.refresh();
  }

  async function access(contactId: string, action: "revoke" | "restore") {
    setBusy(true);
    const res = await fetch("/api/client-portal/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, action }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) setMsg({ ok: false, text: data.error ?? "That did not work." });
    router.refresh();
  }

  const input = "w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2";
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl" style={{ border: "1px solid #e5eaf0" }}>
        <ul>
          {members.map((m, i) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4" style={{ borderTop: i ? "1px solid #f1f5f9" : "none" }}>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-semibold" style={{ color: NAVY }}>
                  {m.name} {m.isMe && <span className="text-xs font-normal text-gray-400">(you)</span>}
                </p>
                <p className="text-xs text-gray-500">{[m.title, m.email].filter(Boolean).join(" · ")}</p>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={m.isPortalEnabled ? { background: "#DCFCE7", color: "#166534" } : { background: "#F1F5F9", color: "#64748b" }}
              >
                {m.isPortalEnabled ? (m.lastLoginAt ? "Has access" : "Invited") : "No access"}
              </span>
              {canManage && !m.isMe && (
                m.isPortalEnabled ? (
                  <button disabled={busy} onClick={() => access(m.id, "revoke")} className="text-xs font-semibold underline" style={{ color: "#b3261e" }}>
                    Remove access
                  </button>
                ) : m.invited ? (
                  <button disabled={busy} onClick={() => access(m.id, "restore")} className="text-xs font-semibold underline" style={{ color: NAVY }}>
                    Restore access
                  </button>
                ) : (
                  <button
                    disabled={busy}
                    onClick={() => setForm({ name: m.name, email: m.email, title: m.title ?? "" })}
                    className="text-xs font-semibold underline"
                    style={{ color: NAVY }}
                  >
                    Invite
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      </div>

      {canManage ? (
        <form onSubmit={invite} className="bg-white rounded-xl p-5 space-y-3" style={{ border: "1px solid #e5eaf0" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: NAVY }}>Invite a colleague</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              They will get an email with their own login. Anyone you invite sees everything here, including invoices and the dashboard,
              so invite only people you would share those with. You can remove access at any time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input required className={input} style={{ border: "1px solid #e5eaf0" }} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" className={input} style={{ border: "1px solid #e5eaf0" }} placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={input} style={{ border: "1px solid #e5eaf0" }} placeholder="Role (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: NAVY, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Sending..." : "Send invitation"}
            </button>
            {msg && <span className="text-sm" style={{ color: msg.ok ? "#166534" : "#b3261e" }}>{msg.text}</span>}
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">Only your organisation&rsquo;s main contact can invite colleagues or change access.</p>
      )}
    </div>
  );
}
