import Link from "next/link";

/**
 * Where the member stands with the recruitment team. Every recruitment email and
 * notification sends the member to /oncadre/dashboard#application, so this card
 * is what they land on. recruitmentNotes are internal and never shown here.
 */

type Step = { label: string; detail: string; cta?: { text: string; href: string } };

const DOC_STAGES = ["SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEW_DONE", "OFFER", "PLACED"];

function formatDateTime(date: Date): string {
  const day = date.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${day} at ${time}`;
}

function stepFor(stage: string, interviewDate: Date | null, documentsIn: boolean): Step | null {
  const documents = { text: "Upload your documents", href: "/oncadre/documents" };
  switch (stage) {
    case "SCREENING":
      return {
        label: "Being reviewed",
        detail: "Our recruitment team is looking at your profile. Keeping it up to date helps.",
        cta: { text: "Review your profile", href: "/oncadre/profile" },
      };
    case "SHORTLISTED":
      return documentsIn
        ? { label: "Shortlisted", detail: "Your documents are in. We will be in touch about an interview." }
        : {
            label: "Shortlisted",
            detail: "You have been shortlisted. Upload your CV, licence and certificates so we can move you forward.",
            cta: documents,
          };
    case "INTERVIEW_SCHEDULED":
      return {
        label: "Interview scheduled",
        detail: interviewDate
          ? `Your interview is on ${formatDateTime(interviewDate)}. We will send joining details before then.`
          : "We are confirming a date for your interview and will be in touch.",
        cta: documentsIn ? undefined : documents,
      };
    case "INTERVIEW_DONE":
      return {
        label: "Interview done",
        detail: "Thank you for your time. We will come back to you as soon as the hospital decides.",
        cta: documentsIn ? undefined : documents,
      };
    case "OFFER":
      return {
        label: "Offer made",
        detail: "Congratulations. We will call you to go through the offer and agree next steps.",
        cta: documentsIn ? undefined : documents,
      };
    case "PLACED":
      return {
        label: "Placed",
        detail: "Your placement is confirmed. We will be in touch with your start date and onboarding.",
        cta: documentsIn ? undefined : documents,
      };
    case "REJECTED":
      return {
        label: "Not progressed this time",
        detail: "We could not take this application further. Your profile stays active and we will contact you about new roles.",
      };
    default:
      return null;
  }
}

export default function ApplicationStatusCard({
  stage,
  interviewDate,
  documentsSubmittedAt,
}: {
  stage: string | null;
  interviewDate: Date | null;
  documentsSubmittedAt: Date | null;
}) {
  if (!stage) return null;
  const step = stepFor(stage, interviewDate, !!documentsSubmittedAt || !DOC_STAGES.includes(stage));
  if (!step) return null;

  return (
    <div
      id="application"
      className="scroll-mt-24 rounded-2xl border bg-white p-6"
      style={{ borderColor: "#E8EBF0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: "#D4AF37" }}>
        Your application
      </p>
      <h2 className="mt-1.5 text-lg font-semibold" style={{ color: "#0F2744" }}>
        {step.label}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.detail}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {step.cta && (
          <Link
            href={step.cta.href}
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "#0B3C5D" }}
          >
            {step.cta.text}
          </Link>
        )}
        <p className="text-xs text-gray-500">
          Questions? Write to{" "}
          <a href="mailto:hello@consultforafrica.com" className="font-medium text-[#0B3C5D] hover:underline">
            hello@consultforafrica.com
          </a>
        </p>
      </div>
    </div>
  );
}
