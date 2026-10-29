"use client";

import Link from "next/link";

export default function RoleEditToggle({ roleId }: { roleId: string }) {
  return (
    <Link
      href={`/oncadre/employer/roles/${roleId}/edit`}
      className="shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition hover:bg-[#0B3C5D]/5"
      style={{ border: "1px solid #E8EBF0", color: "#0B3C5D" }}
    >
      Edit
    </Link>
  );
}
