"""
Build the four Arabella Women's Health audit survey forms as self-contained HTML.

    python3 scripts/build-arabella-surveys.py

Writes public/arabella-{staff,patient,referrer,leadership}-survey.html.

Osteon's four forms were each hand-written, which is why the shell drifted
between them. Here the shell, the CSS, the scale rendering, the progress bar and
the submit handler are defined once and the four instruments supply only their
own content. Question wording lives in this file and nowhere else, so the form a
respondent sees cannot disagree with what we think we asked.

Slugs must match ALLOWED in app/api/arabella-audit/responses/route.ts and the
entries in lib/surveys/registry.ts.
"""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public"
ENDPOINT = "/api/arabella-audit/responses"

# --------------------------------------------------------------------- shell

SHELL = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>__TITLE__</title>
<style>
  :root{
    --navy:#0B3C5D; --deep:#081521; --gold:#D4AF37; --teal:#1F7A8C;
    --body:#1F2937; --muted:#6B7280; --surface:#F1F5F9; --line:#E2E8F0;
    --cream:#FBF6E6; --white:#fff;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
       color:var(--body);background:#eef2f6;line-height:1.5;font-size:16px}
  .wrap{max-width:720px;margin:0 auto;padding:0 16px 64px}
  header.top{background:var(--navy);color:#fff;padding:22px 0 20px;border-bottom:3px solid var(--gold)}
  header.top .wrap{padding-top:0;padding-bottom:0}
  .eyebrow{color:var(--gold);font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
  header.top h1{font-size:22px;margin:6px 0 2px;line-height:1.2}
  header.top p{margin:0;color:#C9D6E0;font-size:14px}
  .card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px;margin:16px 0;
        box-shadow:0 1px 2px rgba(8,21,33,.04)}
  .privacy{background:var(--cream);border-left:4px solid var(--gold)}
  .privacy strong{color:var(--navy)}
  .scalekey{background:var(--surface);border-left:4px solid var(--teal);font-size:14px}
  .scalekey b{color:var(--navy)}
  h2.section{font-size:16px;color:var(--navy);margin:26px 2px 8px;padding-top:6px;
             border-top:1px solid var(--line)}
  h2.section .n{color:var(--teal);font-weight:800;margin-right:8px}
  h2.section .hint{font-weight:400;color:var(--muted);font-size:13px;display:block;margin-top:2px}
  .q{padding:14px 0;border-bottom:1px solid var(--line)}
  .q:last-child{border-bottom:0}
  .q .qt{font-size:15px;margin-bottom:10px}
  .q .qt .num{color:var(--muted);font-weight:700;margin-right:6px}
  .opts{display:flex;flex-wrap:wrap;gap:8px}
  .opts label{flex:1 1 auto;min-width:56px;text-align:center;border:1px solid var(--line);
     border-radius:9px;padding:9px 6px;font-size:13px;cursor:pointer;background:#fff;user-select:none}
  .opts.five label{min-width:0}
  .opts input{position:absolute;opacity:0;width:0;height:0}
  .opts label:hover{border-color:var(--teal)}
  .opts label.na{color:var(--muted);flex-basis:100%;min-width:100%;margin-top:2px}
  .opts label:has(input:checked){background:var(--navy);color:#fff;border-color:var(--navy)}
  .opts label:has(input:checked) .sub{color:#C9D6E0}
  .opts .big{display:block;font-weight:800;font-size:15px;line-height:1}
  .opts .sub{display:block;font-size:11px;color:var(--muted);margin-top:3px}
  .stack{display:grid;gap:8px}
  .stack label{border:1px solid var(--line);border-radius:9px;padding:11px 12px;font-size:14px;
     cursor:pointer;background:#fff;display:flex;gap:10px;align-items:flex-start}
  .stack label:hover{border-color:var(--teal)}
  .stack label:has(input:checked){background:#F6FAFB;border-color:var(--teal)}
  .stack input{margin:2px 0 0}
  textarea,select,input[type=text],input[type=number]{width:100%;font:inherit;padding:10px 12px;
     border:1px solid var(--line);border-radius:9px;background:#fff;color:var(--body)}
  textarea{min-height:74px;resize:vertical}
  .field{margin:12px 0}
  .field label.lbl{display:block;font-size:14px;margin-bottom:6px}
  .two{display:grid;gap:10px;grid-template-columns:1fr 1fr}
  @media (max-width:560px){.two{grid-template-columns:1fr}}
  .grades{display:flex;flex-wrap:wrap;gap:8px}
  .grades label{flex:1 1 auto;text-align:center;border:1px solid var(--line);border-radius:9px;
     padding:10px 6px;font-size:13px;cursor:pointer}
  .grades label:has(input:checked){background:var(--gold);border-color:var(--gold);color:var(--deep);font-weight:700}
  .split{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}
  .split .lab{flex:1;font-size:14px}
  .split input{width:86px;flex:0 0 auto;text-align:center}
  .splittot{font-weight:800;padding:10px 0 0;font-size:14px}
  .splittot.good{color:#15803d}
  .splittot.bad{color:#b3261e}
  .progress{position:sticky;top:0;z-index:5;background:#eef2f6;padding:10px 0}
  .bar{height:8px;background:var(--line);border-radius:20px;overflow:hidden}
  .bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--gold));transition:width .25s}
  .bar-t{font-size:12px;color:var(--muted);margin:6px 2px 0}
  button.submit{width:100%;background:var(--navy);color:#fff;border:0;border-radius:11px;
     padding:16px;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px}
  button.submit:disabled{opacity:.6;cursor:not-allowed}
  .foot{color:var(--muted);font-size:12px;text-align:center;margin-top:22px}
  .thanks{display:none;text-align:center;padding:40px 10px}
  .thanks h2{color:var(--navy)}
  .thanks .check{width:56px;height:56px;border-radius:50%;background:var(--cream);color:var(--gold);
     display:inline-flex;align-items:center;justify-content:center;font-size:30px;border:2px solid var(--gold)}
  .err{background:#fdecec;border-left:4px solid #c0392b;color:#7a2f2f;font-size:14px;display:none}
</style>
</head>
<body>
<header class="top">
  <div class="wrap">
    <div class="eyebrow">Consult for Africa &middot; Confidential</div>
    <h1>__HEADING__</h1>
    <p>__STRAP__</p>
  </div>
</header>

<div class="wrap">
  <div id="form">
    <div class="card privacy">__PRIVACY__</div>
    __SCALEKEY__

    <div class="progress">
      <div class="bar"><i id="barfill"></i></div>
      <div class="bar-t"><span id="answered">0</span> of <span id="total">0</span> answered</div>
    </div>

    <div class="card err" id="err"></div>
    <form id="survey" novalidate></form>

    <button class="submit" id="submitBtn" type="button">__SUBMIT_LABEL__</button>
    <div class="foot">Consult for Africa &middot; hello@consultforafrica.com &middot; consultforafrica.com</div>
  </div>

  <div class="thanks card" id="thanks">
    <div class="check">&#10003;</div>
    <h2>Thank you.</h2>
    <p>__THANKS__</p>
  </div>
</div>

<script>
const ENDPOINT = "__ENDPOINT__";
const SLUG = "__SLUG__";

const AGREE = [["1","Strongly disagree"],["2","Disagree"],["3","Neither"],["4","Agree"],["5","Strongly agree"]];
const FREQ  = [["1","Never"],["2","Rarely"],["3","Sometimes"],["4","Most times"],["5","Always"]];

// [section title, scale ("a" agree | "f" frequency), items, optional hint]
const SECTIONS = __SECTIONS__;

const form = document.getElementById("survey");
let idx = 0;
const scaleItems = [];

SECTIONS.forEach((sec, si) => {
  const h = document.createElement("h2"); h.className = "section";
  h.innerHTML = '<span class="n">' + (si + 1) + '</span>' + sec[0] +
    (sec[3] ? '<span class="hint">' + sec[3] + '</span>' : '');
  form.appendChild(h);
  const scale = sec[1] === "f" ? FREQ : AGREE;
  sec[2].forEach(text => {
    idx++;
    const name = "q" + idx;
    scaleItems.push(name);
    const q = document.createElement("div"); q.className = "q";
    let opts = '';
    scale.forEach(o => {
      opts += '<label><input type="radio" name="' + name + '" value="' + o[0] + '">'
            + '<span class="big">' + o[0] + '</span><span class="sub">' + o[1] + '</span></label>';
    });
    opts += '<label class="na"><input type="radio" name="' + name + '" value="NA">N/A &middot; Don\'t know</label>';
    q.innerHTML = '<div class="qt"><span class="num">' + idx + '.</span>' + text + '</div>'
                + '<div class="opts five">' + opts + '</div>';
    form.appendChild(q);
  });
});

// Helpers the bespoke tail of each instrument uses.
const scaleRow = (name, scale, naLabel) => '<div class="opts five">' +
  (scale || AGREE).map(o => '<label><input type="radio" name="' + name + '" value="' + o[0] + '"><span class="big">' +
    o[0] + '</span><span class="sub">' + o[1] + '</span></label>').join("") +
  '<label class="na"><input type="radio" name="' + name + '" value="NA">' + (naLabel || "N/A") + '</label></div>';

const radios = (name, list) => '<div class="stack">' +
  list.map(v => '<label><input type="radio" name="' + name + '" value="' + v + '"><span>' + v + '</span></label>').join("") +
  '</div>';

const boxes = (name, list) => '<div class="stack">' +
  list.map((v, i) => '<label><input type="checkbox" name="' + name + '_' + i + '" value="' + v + '"><span>' + v + '</span></label>').join("") +
  '</div>';

const SECTION_N = SECTIONS.length;

// Declarations the tail's template literal reads while it is being evaluated.
// They have to be initialised before that line runs, not after it.
__EXTRA_DATA__

const tail = document.createElement("div");
tail.innerHTML = __TAIL__;
form.appendChild(tail);

document.getElementById("total").textContent = scaleItems.length;
function updateProgress(){
  let n = 0;
  scaleItems.forEach(name => { if (form.querySelector('input[name="' + name + '"]:checked')) n++; });
  document.getElementById("answered").textContent = n;
  document.getElementById("barfill").style.width = (n / Math.max(1, scaleItems.length) * 100) + "%";
}
form.addEventListener("change", updateProgress);
__EXTRA_JS__

const err = document.getElementById("err");
function fail(msg){
  err.style.display = "block";
  err.textContent = msg;
  window.scrollTo({top:0,behavior:"smooth"});
  return false;
}

document.getElementById("submitBtn").addEventListener("click", async () => {
  const data = {};
  new FormData(form).forEach((v, k) => {
    if (data[k] === undefined) data[k] = v;
    else data[k] = data[k] + "; " + v;
  });
  const answered = scaleItems.filter(n => data[n]).length;
  err.style.display = "none";
  if (scaleItems.length && answered < scaleItems.length * 0.6) {
    return fail("Please answer a few more questions before submitting. Your responses are most useful when the survey is mostly complete, and N/A counts as an answer.");
  }
  if (typeof validateTail === "function" && !validateTail(data, fail)) return;

  const payload = { survey:SLUG, respondent:(data.respondent || "").slice(0,120) || undefined,
                    submittedAt:new Date().toISOString(), responses:data };
  const btn = document.getElementById("submitBtn");
  btn.disabled = true; btn.textContent = "Submitting...";
  try {
    const r = await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if (!r.ok) throw new Error("bad status");
    document.getElementById("form").style.display = "none";
    document.getElementById("thanks").style.display = "block";
    window.scrollTo({top:0,behavior:"smooth"});
  } catch (e) {
    btn.disabled = false; btn.textContent = "__SUBMIT_LABEL__";
    fail("Something went wrong sending your answers. Please try again in a moment.");
  }
});
</script>
</body>
</html>
"""


def js_template(s: str) -> str:
    """A JS template literal, so the tail can use ${...} helpers."""
    return "`" + s + "`"


def build(spec: dict) -> None:
    html = SHELL
    html = html.replace("__TITLE__", spec["title"])
    html = html.replace("__HEADING__", spec["heading"])
    html = html.replace("__STRAP__", spec["strap"])
    html = html.replace("__PRIVACY__", spec["privacy"])
    html = html.replace("__SCALEKEY__", spec.get("scalekey", ""))
    html = html.replace("__SECTIONS__", json.dumps(spec["sections"], indent=2))
    html = html.replace("__TAIL__", js_template(spec["tail"]))
    html = html.replace("__EXTRA_DATA__", spec.get("extra_data", ""))
    html = html.replace("__EXTRA_JS__", spec.get("extra_js", ""))
    html = html.replace("__SUBMIT_LABEL__", spec.get("submit", "Submit my answers"))
    html = html.replace("__THANKS__", spec["thanks"])
    html = html.replace("__SLUG__", spec["slug"])
    html = html.replace("__ENDPOINT__", ENDPOINT)
    out = OUT / spec["file"]
    out.write_text(html, encoding="utf-8")
    n = sum(len(s[2]) for s in spec["sections"])
    print(f"wrote {out.name}  ({len(spec['sections'])} sections, {n} scale items)")


SCALEKEY = (
    '<div class="card scalekey">For most questions, choose how much you agree, or how often it '
    'happens, from <b>1</b> to <b>5</b>. Every question also has <b>N/A &middot; Don\'t know</b>, '
    'and you should use it freely if a question is about a part of Arabella you do not work in.</div>'
)

# ------------------------------------------------------------------- staff

STAFF = {
    "file": "arabella-staff-survey.html",
    "slug": "arabella-staff-culture",
    "title": "Arabella Women's Health - Staff Survey",
    "heading": "Arabella Women&rsquo;s Health &mdash; Staff Survey",
    "strap": "Anonymous &middot; about 10 minutes &middot; your honest voice shapes what changes here",
    "privacy": (
        "<strong>Your answers are anonymous.</strong> They go to Consult for Africa, not to "
        "Dr Chito or to anyone who manages you, and they are reported only as grouped totals. "
        "We never report anything in a way that could identify who said it. There are no right "
        "answers and nothing here is a test of you. Honesty is the whole point, and the parts "
        "that are hardest to say are usually the parts that are most useful."
    ),
    "scalekey": SCALEKEY,
    "thanks": (
        "Your answers are in, and they are anonymous. Every honest response makes the plan we give "
        "Arabella sharper and fairer. You can close this page."
    ),
    "sections": [
        ["Your team and how the work gets done", "a", [
            "People here treat each other with respect.",
            "When the day is heavy, we pull together to get the work done.",
            "We have enough people on duty to do the work safely.",
            "The pace of work here is so high that it feels unsafe.",
            "I know what I am responsible for, and so does everybody else.",
        ]],
        ["Speaking up", "a", [
            "I can question a decision made by someone more senior without it being held against me.",
            "If I saw something that could harm a patient or a baby, I would say so immediately.",
            "Staff here are afraid to ask questions when something does not seem right.",
            "When somebody raises a concern, something is actually done about it.",
            "I know exactly who to go to when something is wrong, including at night.",
        ]],
        ["When something goes wrong", "a", [
            "When a mistake happens here, we talk about it so that we can learn from it.",
            "People here feel their mistakes are held against them.",
            "We are told when something has gone wrong, and what changed because of it.",
        ]],
        ["The delivery room and maternity", "f", [
            "A senior clinician is reachable within minutes when labour goes wrong.",
            "The drugs and equipment needed for a haemorrhage are ready and in date.",
            "Everyone in the room knows what to do in an emergency without being told.",
            "The newborn resuscitation equipment is checked before it is needed.",
            "When a patient needs to be transferred out, it happens quickly and smoothly.",
            "Blood can be obtained in time when it is urgently needed.",
        ], "If you do not work in maternity, please answer N/A."],
        ["Theatre and procedures", "f", [
            "The list starts at the time it was meant to start.",
            "Everything needed for a case is ready before the patient comes into theatre.",
            "A safety check is done out loud before the first cut, with the whole team listening.",
            "I am confident that every instrument set opened here is properly sterile.",
            "The sterilisation records are completed for every load.",
        ], "If you do not work in theatre, please answer N/A."],
        ["The fertility unit", "f", [
            "The laboratory is covered by someone properly trained whenever it needs to be.",
            "Patients are given a realistic picture of their chances, not an optimistic one.",
            "The storage tanks and their alarms are checked and recorded.",
            "A power failure would not put anything stored at risk.",
        ], "If you do not work in the fertility unit, please answer N/A."],
        ["Drugs, stock and equipment", "f", [
            "The equipment I need is working when I need it.",
            "We run short of something a patient needs.",
            "Medicines are in date and stored the way they should be.",
            "Controlled drugs are properly signed for every single time.",
        ]],
        ["The front desk, bookings and money", "a", [
            "A patient who calls or messages gets an answer the same day.",
            "Patients understand what they are paying for before they pay it.",
            "Money taken at the front desk is receipted and recorded every time.",
            "When an HMO code is delayed, we know what to tell the patient.",
            "Nobody is ever seen and treated without it being recorded somewhere.",
        ]],
        ["Cover and how decisions get made", "a", [
            "When Dr Chito is not here, it is clear who is in charge.",
            "I can get a senior clinical decision quickly when I need one.",
            "The rota gives me enough notice to plan my life.",
            "I have had the training I need to do my job properly.",
            "New people are properly shown how things are done here.",
        ]],
        ["How the place is run", "a", [
            "I understand where this business is trying to get to.",
            "Decisions here are made and explained clearly.",
            "Someone would notice if I did my job especially well.",
            "I am paid fairly, and on time, for the work I do.",
            "I have what I need to give patients a good experience.",
        ]],
        ["Patients", "a", [
            "Patients here are treated with kindness.",
            "A woman's privacy and dignity are protected, including in the waiting area.",
            "Patients get their questions answered before they agree to a procedure.",
            "If a patient complained, it would reach somebody who could fix it.",
        ]],
        ["The change from Tabitha to Arabella", "a", [
            "I understand what has changed and what has not.",
            "The change was explained to me properly before it happened.",
            "My own position, pay and terms are clear to me.",
            "Patients ask us about the change and we can answer them confidently.",
        ], "Answer N/A on any of these if you joined after the change."],
    ],
    "tail": r"""
  <h2 class="section"><span class="n">${SECTION_N + 1}</span>Overall</h2>
  <div class="q"><div class="qt">Overall, how safe do you think patients are here?</div>
    <div class="grades">
      ${["Excellent","Very good","Acceptable","Poor","Failing"].map(g =>
        '<label><input type="radio" name="grade" value="' + g + '">' + g + '</label>').join("")}
    </div>
  </div>
  <div class="q field"><label class="lbl">I would be happy for my own sister or daughter to be cared for here.</label>
    ${scaleRow("rec_care")}</div>
  <div class="q field"><label class="lbl">I would recommend Arabella as a place to work.</label>
    ${scaleRow("rec_work")}</div>
  <div class="q field"><label class="lbl">I expect to still be working here in a year.</label>
    ${scaleRow("stay")}</div>

  <h2 class="section"><span class="n">${SECTION_N + 2}</span>A little about you
    <span class="hint">Optional. It helps us group answers, and it is never used to identify you.</span></h2>
  <div class="field"><label class="lbl">Where you mostly work</label>
    <select name="area"><option value="">Prefer not to say</option>
      <option>Maternity, labour and postnatal</option><option>Theatre and recovery</option>
      <option>Fertility and the laboratory</option><option>Nursing and ward</option>
      <option>Medical and clinical</option><option>Sterile services</option>
      <option>Pharmacy</option><option>Front desk and patient coordination</option>
      <option>Accounts and admin</option><option>Imaging and ultrasound</option>
      <option>Wellness, aesthetics and nutrition</option>
      <option>Support and housekeeping</option><option>Other</option></select></div>
  <div class="field"><label class="lbl">How long you have worked here</label>
    <select name="tenure"><option value="">Prefer not to say</option>
      <option>Under 6 months</option><option>6 to 12 months</option>
      <option>1 to 2 years</option><option>2 to 5 years</option>
      <option>More than 5 years</option></select></div>
  <div class="field"><label class="lbl">Did you work here when it was Tabitha?</label>
    <select name="was_tabitha"><option value="">Prefer not to say</option>
      <option>Yes</option><option>No, I joined after the change</option></select></div>
  <div class="field"><label class="lbl">Do you also work somewhere else?</label>
    <select name="elsewhere"><option value="">Prefer not to say</option>
      <option>No, only here</option><option>Yes, one other place</option>
      <option>Yes, more than one other place</option></select></div>

  <h2 class="section"><span class="n">${SECTION_N + 3}</span>Three open questions
    <span class="hint">Optional, and the most useful part of the survey.</span></h2>
  <div class="field"><label class="lbl">The one thing that would make Arabella safer for patients:</label>
    <textarea name="open_safe"></textarea></div>
  <div class="field"><label class="lbl">The one thing that would make Arabella a better place to work:</label>
    <textarea name="open_work"></textarea></div>
  <div class="field"><label class="lbl">Something that happens here that a visitor would never notice, but that you think we should know:</label>
    <textarea name="open_hidden"></textarea></div>
""",
}

# ----------------------------------------------------------------- patient

PATIENT = {
    "file": "arabella-patient-survey.html",
    "slug": "arabella-patient-experience",
    "title": "Arabella Women's Health - Patient Survey",
    "heading": "Arabella Women&rsquo;s Health &mdash; Your Experience",
    "strap": "Anonymous &middot; about 5 minutes &middot; it helps us make the care better",
    "privacy": (
        "<strong>This is anonymous.</strong> Your answers go to Consult for Africa, who have been "
        "asked to look at how the service runs, and not to the doctors or nurses who cared for "
        "you. Nothing you say here can affect your care in any way, now or later. Please be as "
        "honest as you would be with a friend."
    ),
    "scalekey": (
        '<div class="card scalekey">Choose how much you agree with each statement, from <b>1</b> '
        "to <b>5</b>. If something does not apply to you, choose <b>N/A</b>.</div>"
    ),
    "thanks": (
        "Your answers are in, and they are anonymous. Thank you for taking the time. It genuinely "
        "changes what we recommend. You can close this page."
    ),
    "sections": [
        ["Getting an appointment", "a", [
            "It was easy to find out how to book.",
            "Somebody answered when I called or messaged.",
            "I was offered an appointment soon enough.",
            "I was told clearly what to bring and what to expect.",
        ]],
        ["When you arrived", "a", [
            "I was seen close to my appointment time.",
            "The front desk was welcoming and helpful.",
            "The place was clean and comfortable.",
            "My privacy was respected while I waited and while I was seen.",
        ]],
        ["Your doctor and what you were told", "a", [
            "My doctor listened to me properly.",
            "Things were explained in a way I understood.",
            "I was given time to ask my questions.",
            "I was told about the options, not just the one being recommended.",
            "I felt looked after as a person, not processed.",
        ]],
        ["Money, and what you were told it would cost", "a", [
            "I knew what it would cost before I agreed to it.",
            "The final bill matched what I had been told.",
            "Paying was straightforward and I was given a receipt.",
            "If my HMO was involved, it was handled without me having to chase it.",
        ], "Choose N/A for anything that did not apply to you."],
        ["The care itself", "a", [
            "I was confident in the people caring for me.",
            "The nurses and midwives were kind.",
            "If I was in pain or worried, someone helped quickly.",
            "I was treated with dignity throughout.",
        ]],
        ["Afterwards", "a", [
            "I knew what to do and who to call after I left.",
            "Somebody followed up with me.",
            "I got my results or my report when I was told I would.",
        ]],
    ],
    "tail": r"""
  <h2 class="section"><span class="n">${SECTION_N + 1}</span>Overall</h2>
  <div class="q"><div class="qt">Overall, how would you rate your experience?</div>
    <div class="grades">
      ${["Excellent","Very good","Acceptable","Poor","Very poor"].map(g =>
        '<label><input type="radio" name="grade" value="' + g + '">' + g + '</label>').join("")}
    </div>
  </div>
  <div class="q field"><label class="lbl">I would send my sister or a close friend here.</label>
    ${scaleRow("rec")}</div>
  <div class="q field"><label class="lbl">I would come back here myself.</label>
    ${scaleRow("return")}</div>

  <h2 class="section"><span class="n">${SECTION_N + 2}</span>A little about your visit
    <span class="hint">Optional. It helps us group answers, and it cannot identify you.</span></h2>
  <div class="field"><label class="lbl">What were you mainly seen for?</label>
    <select name="service"><option value="">Prefer not to say</option>
      <option>Pregnancy care or delivery</option><option>A gynaecology consultation</option>
      <option>Gynaecology surgery</option><option>Fertility treatment</option>
      <option>A scan or a test</option><option>Wellness, aesthetics or nutrition</option>
      <option>Something else</option></select></div>
  <div class="field"><label class="lbl">When were you last seen?</label>
    <select name="recency"><option value="">Prefer not to say</option>
      <option>In the last month</option><option>One to three months ago</option>
      <option>Three to six months ago</option><option>Six to twelve months ago</option>
      <option>More than a year ago</option></select></div>
  <div class="field"><label class="lbl">How did you pay?</label>
    <select name="payer"><option value="">Prefer not to say</option>
      <option>I paid myself</option><option>My HMO</option>
      <option>My employer</option><option>Family abroad paid</option>
      <option>A mixture</option></select></div>

  <h2 class="section"><span class="n">${SECTION_N + 3}</span>How you came to us
    <span class="hint">This one genuinely helps. We are trying to understand how women find this place.</span></h2>
  <div class="q"><div class="qt">How did you first hear about us?</div>
    ${radios("source", ["Another doctor sent me","A friend or family member",
      "I have been coming here for years","Instagram or Facebook",
      "A Google search","The podcast","A church or a group I belong to",
      "I passed the building","Somewhere else"])}</div>
  <div class="field"><label class="lbl">If a doctor, clinic or physiotherapist sent you, please tell us who. A name is very useful to us and it is not shared with anyone.</label>
    <input type="text" name="referrer_name"></div>

  <h2 class="section"><span class="n">${SECTION_N + 4}</span>Two questions in your own words
    <span class="hint">Optional, and the most useful part of this form.</span></h2>
  <div class="field"><label class="lbl">What was the best thing about being cared for here?</label>
    <textarea name="open_best"></textarea></div>
  <div class="field"><label class="lbl">What one thing would you change?</label>
    <textarea name="open_change"></textarea></div>
""",
}

# ---------------------------------------------------------------- referrer

REFERRER = {
    "file": "arabella-referrer-survey.html",
    "slug": "arabella-referrer",
    "title": "Arabella Women's Health - Referring Colleagues",
    "heading": "A short survey for referring colleagues",
    "strap": "About 6 minutes &middot; answered in your own name &middot; please forward it on",
    "privacy": (
        "<strong>This is for doctors, physiotherapists, diagnostic centres and anyone who sees "
        "women and sometimes needs to send them on.</strong> Consult for Africa has been asked to "
        "look at how Arabella Women&rsquo;s Health in Asokoro actually works, and the view of "
        "colleagues who refer is the part nobody ever asks for. We ask for your name because an "
        "answer we cannot place is an answer we cannot act on, and you decide at the end whether "
        "we may say who told us. Nothing here is shared with any other hospital."
    ),
    "scalekey": (
        '<div class="card scalekey">Choose how much you agree with each statement from <b>1</b> to '
        "<b>5</b>. If you have never referred to Arabella or to Tabitha before it, use <b>N/A</b> "
        "freely: what you expect from a service is as useful to us as what you have received.</div>"
    ),
    "thanks": (
        "Thank you. This is the part of the picture nobody usually collects, and it carries real "
        "weight in what we recommend. If you said you would like to see what colleagues said, we "
        "will send it to you."
    ),
    "submit": "Send my answers",
    "sections": [
        ["What you want from a women's health service", "a", [
            "I need to be confident about what my patient will be charged before I send her.",
            "I need to hear back about what happened to my patient.",
            "I need to be able to reach the consultant directly when it matters.",
            "I need to know my patient will come back to me rather than be kept.",
            "I need to be sure they can handle it if the case goes wrong.",
        ]],
        ["What you get back today", "a", [
            "I am clear about what this service is particularly good at.",
            "My patients are seen quickly when I refer them.",
            "I hear back about what happened to my patient.",
            "I hear back quickly enough for it to be useful to me.",
            "My patients come back satisfied with how they were treated.",
            "I am confident about what my patient will be charged.",
            "I would be comfortable sending a complicated case.",
            "The patient stays mine. I do not worry about losing her.",
        ], "If you have never referred here, answer N/A on each of these."],
    ],
    "tail": r"""
  <h2 class="section"><span class="n">${SECTION_N + 1}</span>What decides where you send a patient
    <span class="hint">Divide 100 points across these six, giving more to what weighs most heavily on you. It is the single most useful question here.</span></h2>
  <div id="splitbox">
    ${SPLIT.map(s => '<div class="split"><div class="lab">' + s[1] +
      '</div><input type="number" min="0" max="100" name="' + s[0] + '" value="0"></div>').join("")}
    <div class="splittot" id="splittot">Total: 0 of 100</div>
  </div>

  <h2 class="section"><span class="n">${SECTION_N + 2}</span>Your referring, honestly</h2>
  <div class="q"><div class="qt">Roughly how many women a month do you see who need specialist obstetric, gynaecological or fertility care?</div>
    ${radios("volume", ["None","1 to 2","3 to 5","6 to 10","More than 10"])}</div>
  <div class="q"><div class="qt">Where do those patients actually go? Choose as many as apply.</div>
    ${boxes("where_go", ["I manage them myself for as long as I can",
      "I refer to a named consultant I trust","I refer to a hospital rather than a person",
      "A government or teaching hospital","They go abroad",
      "They do nothing, usually because of cost","I am not sure what happens to them"])}</div>
  <div class="q"><div class="qt">Has your referring to this practice changed over the last two years?</div>
    ${radios("trend", ["I refer more than I used to","About the same",
      "I refer less than I used to","I used to refer and I stopped",
      "I have never referred here"])}</div>
  <div class="field"><label class="lbl">If it has dropped, or you stopped, what changed? This is the most useful answer on the form and it will not be held against anybody.</label>
    <textarea name="open_stopped"></textarea></div>
  <div class="q"><div class="qt">Did you know the practice changed its name from Tabitha to Arabella?</div>
    ${radios("knew_change", ["Yes, and I understand what changed",
      "I had heard something but I am not sure what it means",
      "No, this is the first I am hearing of it"])}</div>

  <h2 class="section"><span class="n">${SECTION_N + 3}</span>What would actually change your referring</h2>
  <div class="q"><div class="qt">Choose everything that would make a real difference.</div>
    ${boxes("would_change", ["A clear, fixed price my patient can plan around",
      "An instalment or financing option for my patients",
      "A letter back to me within a week, guaranteed",
      "A direct number that reaches the consultant herself",
      "Being able to discuss a case before I refer",
      "A regular case discussion meeting I could join",
      "Published outcome figures I could show my patient",
      "A clinic where she sees patients at my own practice",
      "Being able to follow my patient's progress online",
      "Shorter waiting time to be seen",
      "Nothing, I already refer everything I can"])}</div>
  <div class="field"><label class="lbl">Of those, the single biggest:</label>
    <input type="text" name="biggest_change"></div>

  <h2 class="section"><span class="n">${SECTION_N + 4}</span>Who you are
    <span class="hint">So that we can place your answer, and come back to you if you want us to.</span></h2>
  <div class="two">
    <div class="field"><label class="lbl">Your name</label><input type="text" name="respondent"></div>
    <div class="field"><label class="lbl">Your practice or clinic</label><input type="text" name="practice"></div>
  </div>
  <div class="two">
    <div class="field"><label class="lbl">Your specialty or role</label><input type="text" name="specialty"></div>
    <div class="field"><label class="lbl">A phone number or email</label><input type="text" name="contact"></div>
  </div>

  <h2 class="section"><span class="n">${SECTION_N + 5}</span>Three colleagues we should also ask
    <span class="hint">Optional, and it is how this survey reaches the people who matter. Anyone who sees women and sometimes refers them on.</span></h2>
  <div class="field"><label class="lbl">Colleague one: name, and a number or email if you have it</label><input type="text" name="nominee1"></div>
  <div class="field"><label class="lbl">Colleague two</label><input type="text" name="nominee2"></div>
  <div class="field"><label class="lbl">Colleague three</label><input type="text" name="nominee3"></div>
  <div class="q"><div class="qt">May we say that you suggested we speak to them?</div>
    ${radios("consent_name", ["Yes, please say I suggested it",
      "No, please approach them without using my name"])}</div>

  <h2 class="section"><span class="n">${SECTION_N + 6}</span>Last two questions</h2>
  <div class="q"><div class="qt">Would you like a summary of what colleagues said?</div>
    ${radios("wants_summary", ["Yes please","No thank you"])}</div>
  <div class="field"><label class="lbl">Anything else you would want the owner of this practice to hear, said plainly:</label>
    <textarea name="open_final"></textarea></div>
""",
    "extra_data": r"""
const SPLIT = [
  ["split_price", "What my patient will be charged"],
  ["split_outcome", "Clinical result and safety"],
  ["split_speed", "How quickly she will be seen"],
  ["split_feedback", "Whether I hear back about her"],
  ["split_relationship", "My relationship with the consultant"],
  ["split_ownership", "Confidence that the patient comes back to me"],
];
""",
    "extra_js": r"""
function splitTotal(){
  let t = 0;
  SPLIT.forEach(s => { const el = form.querySelector('[name="' + s[0] + '"]'); t += Number((el && el.value) || 0); });
  const el = document.getElementById("splittot");
  el.textContent = "Total: " + t + " of 100";
  el.className = "splittot " + (t === 100 ? "good" : "bad");
  return t;
}
form.addEventListener("input", splitTotal);
splitTotal();

function validateTail(data, fail){
  if (!(data.respondent || "").trim()) {
    return fail("Please tell us your name. An answer we cannot place is an answer we cannot act on, and it is not published anywhere.");
  }
  const t = splitTotal();
  if (t !== 100) {
    return fail("The six factors need to add up to exactly 100. They currently add to " + t + ".");
  }
  return true;
}
""",
}

# -------------------------------------------------------------- leadership

LEADERSHIP = {
    "file": "arabella-leadership-survey.html",
    "slug": "arabella-leadership-direction",
    "title": "Arabella Women's Health - Leadership Direction",
    "heading": "Arabella Women&rsquo;s Health &mdash; Leadership Direction",
    "strap": "About 10 minutes &middot; answered in your own name, on purpose",
    "privacy": (
        "<strong>This one is not anonymous, deliberately.</strong> Its whole purpose is to put the "
        "senior team's instincts side by side and find the places where you disagree without "
        "knowing that you disagree. Those gaps are usually more valuable than anything we could "
        "find in the accounts. Your individual answers are not circulated to the rest of the team; "
        "what comes back is the comparison, and where it is useful we will quote a view without "
        "naming who held it unless you would rather we did."
    ),
    "scalekey": SCALEKEY,
    "thanks": (
        "Thank you. We will bring the comparison back to you rather than a report, because the "
        "interesting part is where the answers differ."
    ),
    "submit": "Send my answers",
    "sections": [
        ["Where the business is going", "a", [
            "I could state in one sentence what Arabella is trying to become.",
            "Everyone on the senior team would say the same sentence.",
            "The premium positioning is the right strategy for this market.",
            "We have the clinical capability today to deliver what the brand promises.",
            "We have the operational capability today to deliver what the brand promises.",
        ]],
        ["The truth about today", "a", [
            "I know, to the nearest million, what this business earned last month.",
            "I trust the numbers I am shown.",
            "I know which of our services makes money and which does not.",
            "We collect nearly all of what we invoice.",
            "Nothing material happens here without somebody senior knowing about it.",
            "If I were away for a month, the place would run properly.",
        ]],
        ["The transition from Tabitha", "a", [
            "The legal and contractual side of the change is properly documented.",
            "Our payers understand and accept the change.",
            "Our patients understand the change.",
            "Our staff understand the change and their own position in it.",
        ]],
        ["People and accountability", "a", [
            "The right people are in the right roles.",
            "People here are held to what they agreed to do.",
            "A poor performer would be dealt with rather than tolerated.",
            "We could recruit a senior clinician into this business if we needed to.",
            "I spend my time on the things only I can do.",
        ]],
        ["Growth", "a", [
            "We could handle three times today's volume without breaking.",
            "We know where our patients come from.",
            "Our prices are right for what we deliver.",
            "The existing patient base is an asset we have actually used.",
        ]],
    ],
    "tail": r"""
  <h2 class="section"><span class="n">${SECTION_N + 1}</span>Where the effort should go
    <span class="hint">Divide 100 points across these seven, giving more to where you think the next six months of effort belongs. Answer as you actually see it, not as you think you should.</span></h2>
  <div id="splitbox">
    ${SPLIT.map(s => '<div class="split"><div class="lab">' + s[1] +
      '</div><input type="number" min="0" max="100" name="' + s[0] + '" value="0"></div>').join("")}
    <div class="splittot" id="splittot">Total: 0 of 100</div>
  </div>

  <h2 class="section"><span class="n">${SECTION_N + 2}</span>Numbers, as you expect them</h2>
  <div class="q"><div class="qt">What do you think the business earns in an average month today?</div>
    ${radios("baseline", ["Under 5 million","5 to 8 million","8 to 12 million",
      "12 to 20 million","Over 20 million","I genuinely do not know"])}</div>
  <div class="q"><div class="qt">What could it earn in twelve months if this goes well?</div>
    ${radios("target", ["Under 15 million","15 to 25 million","25 to 40 million",
      "40 to 60 million","Over 60 million"])}</div>
  <div class="q"><div class="qt">What is the binding constraint on getting there?</div>
    ${radios("constraint", ["Patient demand","Clinical capacity and people",
      "Physical space and equipment","Cash to invest",
      "Management and execution","Payer and tariff economics"])}</div>

  <h2 class="section"><span class="n">${SECTION_N + 3}</span>In your own words
    <span class="hint">These four answers are the reason for the whole form.</span></h2>
  <div class="field"><label class="lbl">The single biggest risk to this business in the next twelve months:</label>
    <textarea name="open_risk"></textarea></div>
  <div class="field"><label class="lbl">The thing you would change tomorrow if it were entirely your call:</label>
    <textarea name="open_change"></textarea></div>
  <div class="field"><label class="lbl">Something everybody here knows but nobody says out loud:</label>
    <textarea name="open_unsaid"></textarea></div>
  <div class="field"><label class="lbl">What would make this engagement a success, in your judgement?</label>
    <textarea name="open_success"></textarea></div>

  <h2 class="section"><span class="n">${SECTION_N + 4}</span>You</h2>
  <div class="two">
    <div class="field"><label class="lbl">Your name</label><input type="text" name="respondent"></div>
    <div class="field"><label class="lbl">Your role</label><input type="text" name="role"></div>
  </div>
""",
    "extra_data": r"""
const SPLIT = [
  ["split_clinical", "Clinical quality and safety"],
  ["split_ops", "Operations, process and the patient journey"],
  ["split_finance", "Financial visibility and collections"],
  ["split_payers", "Payers, tariffs and corporate accounts"],
  ["split_marketing", "Brand, marketing and demand"],
  ["split_people", "People, roles and accountability"],
  ["split_capacity", "Space, equipment and capacity"],
];
""",
    "extra_js": r"""
function splitTotal(){
  let t = 0;
  SPLIT.forEach(s => { const el = form.querySelector('[name="' + s[0] + '"]'); t += Number((el && el.value) || 0); });
  const el = document.getElementById("splittot");
  el.textContent = "Total: " + t + " of 100";
  el.className = "splittot " + (t === 100 ? "good" : "bad");
  return t;
}
form.addEventListener("input", splitTotal);
splitTotal();

function validateTail(data, fail){
  if (!(data.respondent || "").trim()) {
    return fail("Please put your name on it. This instrument compares named views, which is the whole point of it.");
  }
  const t = splitTotal();
  if (t !== 100) {
    return fail("The seven priorities need to add up to exactly 100. They currently add to " + t + ".");
  }
  return true;
}
""",
}


if __name__ == "__main__":
    for spec in (STAFF, PATIENT, REFERRER, LEADERSHIP):
        build(spec)
