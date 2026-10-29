import { INTAKE_LABEL } from "@/lib/cadreHealth/internship/programme";
import { PROGRAMME_LEAD } from "@/lib/cadreHealth/internship/outreach";

const card = { border: "1px solid #E8EBF0" };

/** How to work the list. Written for the programme lead and anyone helping her. */
export default function Playbook() {
  const sections: { title: string; items: [string, string][] }[] = [
    {
      title: "What we are selling",
      items: [
        ["To the centre", "A ranked shortlist of BNSc graduates who chose it and passed its own minimum score. It replaces setting and marking an exam, and the stack of unscreened letters."],
        ["To the nurse", "One application, one assessment, up to five centres. Free."],
        ["To the system", "Places filled on merit, and a yearly picture of what new graduates can and cannot do on day one, by section and by university. That is the nursing development half: evidence a school or the council can act on."],
        ["To CadreHealth", "Every applicant joins CadreHealth as a nurse. After the internship year they are the staff nurse pipeline for the same hospitals."],
        ["Price", `No fee to the centre for the ${INTAKE_LABEL}. Free to graduates, always. Anything else goes to Debo.`],
      ],
    },
    {
      title: "The weekly rhythm",
      items: [
        ["Monday", "Add any new contacts on the Contacts tab. Send the First approach to every Not yet approached centre that now has an email."],
        ["Wednesday", "Phone every centre emailed a week ago. Each one shows a follow-up date on the Centres tab, in red when it is late."],
        ["Friday", "Send the Demand update to centres that nurses have chosen. It only goes to centres with a number above zero."],
        ["Every day", "Check Centres that asked to join at the top of the page. Reply within one working day."],
      ],
    },
    {
      title: "Finding the right person",
      items: [
        ["Who", "Head of Nursing, Director of Nursing Services or Chief Nursing Officer. In state hospitals, the Health Service Commission."],
        ["How", "Call the switchboard and ask who handles nursing interns. Ask for an email, not only a WhatsApp number."],
        ["Record it", "Name, role, email, phone on the centre. Paste several at once on the Contacts tab."],
        ["Route first", "Evercare and Duchess go through Debo before anyone writes to them."],
      ],
    },
    {
      title: "The call, in 30 seconds",
      items: [
        ["Open", `"I am ${PROGRAMME_LEAD.name.split(" ")[0]} from CadreHealth. We run one application and one assessment for BNSc graduates looking for internship places in Lagos."`],
        ["The point", `"Instead of setting your own exam, you get a ranked list of the graduates who chose your hospital, filtered by the score you set. You still interview and decide."`],
        ["The proof", `"Some nurses have already chosen you." Use the number on the centre's row.`],
        ["The ask", `"Can I have 20 minutes with you this week or next?"`],
      ],
    },
    {
      title: "What they will ask",
      items: [
        ["We already run our own exam", "Keep it if you want. Ours is the first filter, so you examine 20 people, not 200."],
        ["What does it cost?", `Nothing to the centre for the ${INTAKE_LABEL}.`],
        ["Is this NMCN's scheme?", "No. NMCN's central scheme is approved but not yet funded. We work alongside it, and the centre keeps the decision."],
        ["Can we trust the scores?", "Each nurse sits once, on a timed paper drawn from a bank, through a link sent to their own email. You still interview and check documents."],
        ["Who sees the data?", "A centre sees only the nurses who chose it and agreed to share. Contact details appear once the centre invites someone."],
        ["Can we choose more than one?", "The centre sets its number of places and its minimum score. It can invite as many as it wants from its list."],
      ],
    },
    {
      title: "When a centre says yes",
      items: [
        ["Get four things", "Places for this intake, minimum score, when the intake starts, and who reviews candidates. The Confirm terms email asks for all four."],
        ["Record them", "On the centre: places, minimum score, intake timing. Move it to Committed."],
        ["Give them a login", "Create the employer login for the reviewer, then link it on the centre. Their Interns tab fills as nurses finish the assessment."],
      ],
    },
    {
      title: "Take to Debo",
      items: [
        ["Always", "Any fee, any request for terms in writing, any approach from a regulator, school, journalist or another state."],
      ],
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map((s) => (
        <div key={s.title} className="rounded-xl bg-white p-5" style={card}>
          <p className="text-sm font-semibold text-gray-900">{s.title}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {s.items.map(([k, v]) => (
              <li key={k} className="text-gray-700">
                <span className="font-semibold text-gray-900">{k}: </span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
