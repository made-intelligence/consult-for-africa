import type { Metadata } from "next";
import { Confirm, Container } from "@/components/drbola/ui";
import { PageHero } from "@/components/drbola/blocks";
import PatientForm from "@/components/drbola/PatientForm";

export const metadata: Metadata = {
  title: "Free Second Opinion on Your X-rays, Joint Replacement and Revision",
  description:
    "Told you need surgery, or that nothing more can be done? Send your X-rays for a free second opinion from revision hip and knee surgeon Dr Bola Akinola, from Nigeria or abroad.",
};

export default function SecondOpinionPage() {
  return (
    <>
      <PageHero
        eyebrow="Second opinion"
        title="Free second opinion."
        lead={
          <>
            Send your X-rays. I look at them myself and tell you what I think.{" "}
            <Confirm note="free, reviewed by Dr Bola personally, and the reply time">No charge, no obligation.</Confirm>
          </>
        }
      />
      <section className="py-14">
        <Container className="grid gap-12 lg:grid-cols-[18rem_1fr]">
          <ol className="space-y-6">
            {[
              ["Send", "X-rays, scans, reports. A phone photo of the film is fine."],
              ["I review", "Personally. Not an assistant, not a template."],
              ["You hear back", "What I think, and what I would do next. Even if that is nothing."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--db-ink) text-sm text-white">{i + 1}</span>
                <div>
                  <div className="font-medium text-(--db-ink)">{t}</div>
                  <div className="mt-0.5 text-[14.5px] text-(--db-body)">{d}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="rounded-3xl border border-(--db-line) bg-(--db-bone)/50 p-5 sm:p-8">
            <PatientForm kind="secondOpinion" />
          </div>
        </Container>
      </section>
    </>
  );
}
