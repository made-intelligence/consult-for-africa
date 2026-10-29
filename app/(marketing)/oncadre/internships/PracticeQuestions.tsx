"use client";

import { useState } from "react";

/**
 * Three practice questions in the style of the paper. None of them is in the
 * bank: they show the level, they do not give anything away.
 */
const PRACTICE: { section: string; stem: string; options: string[]; answer: number; why: string }[] = [
  {
    section: "Drug calculations",
    stem: "Metronidazole 400 mg is prescribed. The tablets are 200 mg each. How many tablets do you give?",
    options: ["Half a tablet", "1 tablet", "2 tablets", "4 tablets"],
    answer: 2,
    why: "Dose wanted over dose in stock: 400 ÷ 200 = 2 tablets.",
  },
  {
    section: "Maternal, newborn and child health",
    stem: "After drying and stimulating, a newborn is not breathing and the heart rate is below 100 a minute. What comes next?",
    options: ["Give oxygen by face mask and wait", "Start bag-and-mask ventilation", "Start chest compressions", "Bath the baby to stimulate breathing"],
    answer: 1,
    why: "A baby who is not breathing after stimulation needs ventilation, started within the golden minute.",
  },
  {
    section: "Infection prevention",
    stem: "The sharps container on your trolley is three-quarters full. What do you do?",
    options: ["Press the contents down to make room", "Keep using it until it is full", "Close and seal it, and replace it", "Empty it into a waste bin"],
    answer: 2,
    why: "Sharps containers are sealed and replaced at three-quarters full, so no one is injured reaching in.",
  },
];

export default function PracticeQuestions() {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const done = Object.keys(picked).length;
  const right = Object.entries(picked).filter(([i, v]) => PRACTICE[Number(i)].answer === v).length;

  return (
    <div className="space-y-4">
      {PRACTICE.map((q, i) => {
        const chosen = picked[i];
        const answered = chosen !== undefined;
        return (
          <div key={i} className="rounded-2xl bg-white p-5 sm:p-6" style={{ border: "1px solid #E8EBF0" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0B3C5D]/60">{q.section}</p>
            <p className="mt-1.5 font-medium text-gray-900">{q.stem}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((o, j) => {
                const isAnswer = j === q.answer;
                const style = !answered
                  ? { border: "1px solid #E8EBF0", background: "#F8F9FB" }
                  : isAnswer
                    ? { border: "1px solid #059669", background: "#ECFDF5", color: "#065F46" }
                    : j === chosen
                      ? { border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B" }
                      : { border: "1px solid #E8EBF0", background: "#fff", opacity: 0.6 };
                return (
                  <button
                    key={j}
                    type="button"
                    disabled={answered}
                    onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                    className="rounded-xl px-4 py-3 text-left text-sm transition hover:border-[#0B3C5D] disabled:cursor-default"
                    style={style}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {answered && (
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold">{chosen === q.answer ? "Correct. " : "Not quite. "}</span>
                {q.why}
              </p>
            )}
          </div>
        );
      })}
      {done === PRACTICE.length && (
        <div className="rounded-2xl p-5 text-center" style={{ background: "#0B3C5D" }}>
          <p className="font-semibold text-white">You got {right} of {PRACTICE.length}.</p>
          <p className="mt-1 text-sm text-white/75">The real paper is the same style, across seven sections.</p>
          <a href="#apply" className="mt-3 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-[#0B3C5D]" style={{ background: "#D4AF37" }}>
            Apply now
          </a>
        </div>
      )}
    </div>
  );
}
