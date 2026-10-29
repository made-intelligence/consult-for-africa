"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { parseApiError } from "@/lib/parse-api-error";

export default function SignInLinkPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/client-portal/go", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError((await parseApiError(res)) || "Sign-in failed. Please ask us for a new link.");
        return;
      }
      router.push("/client/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F8FAFB" }}>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center" style={{ border: "1px solid #e5eaf0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-cfa.png" alt="Consult For Africa" className="mx-auto mb-4" style={{ height: 40, width: "auto" }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: "#0F2744" }}>Client Portal</h1>
        <p className="text-sm text-gray-500 mb-6">This link signs you in on this device. No password is needed.</p>
        {error && (
          <div className="flex items-start gap-2 text-left text-sm rounded-lg p-3 mb-4" style={{ background: "#FEF2F2", color: "#991B1B" }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          onClick={signIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-lg text-white disabled:opacity-60"
          style={{ background: "#0F2744" }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Sign in
        </button>
      </div>
    </div>
  );
}
