import type { Metadata } from "next";
import Link from "next/link";
import { INTAKE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { QUESTION_COUNT, TIME_LIMIT_MINUTES } from "@/lib/cadreHealth/internship/paper";
import DemoList from "./DemoList";

export const metadata: Metadata = {
  title: "Demo: a centre's intern list | CadreHealth",
  robots: { index: false, follow: false },
};

/**
 * What a centre sees in its Interns tab, with sample candidates, for staff to
 * show on a call. No login and no database: the candidates are fixtures and
 * the buttons change only this page, so a demo can never touch a real nurse.
 */
export default function InternshipDemoPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FB] pt-20">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#FBF6E6", border: "1px solid #EADFB8", color: "#6B5413" }}>
          <b>Demo with sample candidates.</b> This is the view your centre gets once it joins. The people below are
          not real applicants, and nothing you click here is saved.
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Interns, {INTAKE_LABEL}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Your hospital</h1>
          <p className="mt-1 text-sm text-gray-500">
            Everyone here chose your centre and sat the same {QUESTION_COUNT}-question, {TIME_LIMIT_MINUTES}-minute
            assessment. Best first.
          </p>
        </div>
        <DemoList />
        <div className="rounded-xl bg-white p-5 text-sm text-gray-600" style={{ border: "1px solid #E8EBF0" }}>
          You set the number of places and the minimum score. Contact details open when you invite, and we tell each
          candidate the outcome, so your team writes no letters.{" "}
          <Link href="/oncadre/internships/centres" className="font-semibold text-[#0B3C5D] underline">
            Ask to join for the {INTAKE_LABEL}
          </Link>
        </div>
      </div>
    </main>
  );
}
