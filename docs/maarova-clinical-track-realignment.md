# Maarova: the clinical track, and the non-clinical one that was never built

Internal. Written 28 September 2026, after the HR Manager at Duchess International Hospital reported that "some of the questions are clinical" while taking the assessment.

## What is actually wrong

One module was meant to be clinical, taken only by clinicians, and swapped for a non-clinical equivalent for everyone else. Neither half of that happened. There is no swap, there is no equivalent, and the clinical framing did not stay inside its module.

Measured against the live question bank, counting items whose **stem or any answer option** assumes the reader practises clinically. Scanning stems alone understates it badly: a DISC stem can be perfectly neutral while all four of its options talk about resuscitation protocols and vital signs.

| Module | Clinical items | Total | Share | Intended? |
|---|---|---|---|---|
| DISC Behavioural Style | 19 | 28 | 68% | No |
| Values and Drivers | 12 | 12 | 100% | No |
| Emotional Intelligence | 16 | 20 | 80% | No |
| Clinical-to-Leadership Identity | 24 | 24 | 100% | **Yes** |
| Culture and Team | 2 | 30 | 7% | No |
| 360 Feedback | 15 | 36 | 42% | No |

**Outside the one module meant to be clinical, 64 of 126 items assume the respondent is a clinician.**

Values and Drivers is the worst of it, and it hides from a stem-level reading. Every one of its twelve items is a forced choice between values, and in every one the theoretical option is the clinician's: "evidence-based medicine updates and research methodology", "reading the latest journals or attending an online clinical seminar". A finance director holds theoretical values too. She simply has no way to say so.

A non-clinical leader does not meet the occasional odd question. They meet a majority of the behavioural style module and two thirds of the emotional intelligence module written for somebody else, and then an entire module about a transition they never made.

The Culture and Team items are the exception worth arguing about. They describe the *institution*, not the respondent: "our institution is highly results-oriented, with a strong focus on patient throughput". An HR director can answer that about her hospital without being a clinician. Five Culture items trip the vocabulary check and three of them stand for exactly this reason.

## The design decision: parallelise, do not neutralise

The obvious fix is to rewrite the clinical scenarios into neutral ones. That would be a mistake, and an expensive one.

The clinical specificity is the product. It is what is sold, in those words: an assessment "built for healthcare leaders in Africa, rather than one adapted from a corporate tool". Neutralising the bank to accommodate non-clinical leaders would remove the only thing that distinguishes it from the corporate tools it is sold against, and would degrade the experience for clinicians, who are the majority of the market, in order to serve the minority.

The structure of the items makes a better answer available. A DISC item looks like this:

```
"During a ward-round crisis where a patient's condition deteriorates rapidly,
 I am most likely to:"
   D -> Take immediate command and direct the team on next steps
   I -> Rally the team with encouragement and maintain morale
   S -> Calmly follow established resuscitation protocols step by step
   C -> Analyse the vital signs and lab data before deciding on intervention
```

The scenario is clinical. The **construct is not**: each option maps to a D, I, S or C dimension, and that mapping is what is scored. The clinical content is a wrapper around a role-neutral measurement.

So: keep the clinical items for clinicians, and write a parallel non-clinical item for each, carrying the identical dimension mapping and differing only in the scenario. Same construct, same scoring, different world. The clinician gets a ward round; the finance director gets a budget committee; both are measured on the same thing.

## Architecture

**1. A track, captured explicitly.** `MaarovaUser.clinicalBackground` already exists but cannot carry this. It is free text holding a discipline (Medicine 7, Nursing 3, Allied Health 3, Pharmacy 2, Internal Medicine 1, Dentistry 1) and is null for 50 of 67 users. Null means unanswered, not non-clinical, so it cannot be branched on.

Add an explicit track, `CLINICAL | NON_CLINICAL`, asked as a single unambiguous question at the start of the assessment and **stored on the session**, not only on the user. A person's role changes; the session must record which form was actually served, or the responses cannot be interpreted later.

The question needs care. "Are you clinical?" is ambiguous for a pharmacist who now runs compliance. Something closer to the construct: *did you come into leadership from practising a clinical profession?* That is what the module actually measures.

**2. An audience discriminator on modules and questions.** `BOTH | CLINICAL | NON_CLINICAL`, defaulting to `BOTH`. The 62 items already role neutral stay `BOTH` and need no twin. The renderer selects `audience IN (BOTH, <session track>)`.

Prefer parallel rows over extra columns on the same row. It handles the whole-module swap, keeps the scoring joins untouched, and means an item response points at exactly the item that was served, which matters for audit and for any later psychometric work.

**3. The replacement module.** Clinical-to-Leadership Identity measures the move from being excellent at the work to being responsible for people who do the work. That construct is not clinical at all. A lawyer who now runs HR made the same transition, and finds it just as hard.

So the twin is the same instrument with the profession changed: Professional-to-Leadership Identity, identical dimensions and subdimensions, 24 items, different scenarios. Because the construct is preserved, scores remain interpretable across both tracks.

**4. Scoring needs no change.** Dimension and subDimension mappings are identical across twins, so every scoring path, report generator and aggregate continues to work untouched.

## What has to be written

This is the bulk of the work, and it is authoring rather than engineering.

| Item | Count | Note |
|---|---|---|
| DISC twins | 19 | Forced choice, so all four options need parallel text with identical D/I/S/C mapping |
| Values and Drivers twins | 12 | Every item. Six value dimensions, each needing a non-clinical expression |
| Emotional Intelligence twins | 16 | Long scenario stems, the most writing per item |
| 360 twins | 15 | Rater facing, see the caveat below |
| Culture and Team twins | 2 | Three further items tripped the check but describe the institution, so they stand |
| Professional-to-Leadership module | 24 | A complete parallel module, the twin of CILTI |
| **Total** | **88** | |

This is psychometric content, not copy. Each twin has to hold the same construct at the same difficulty, or the two tracks stop being comparable and the scores quietly stop meaning the same thing.

The discipline that keeps a twin honest is mechanical rather than mysterious: identical dimension mapping, a scenario of the same stakes and seniority, the same number of options at the same reading level, and no option made more attractive than the one it parallels. Whether the forms really are equivalent is then settled by item analysis once both have volume, not by anyone's judgement in advance.

## Sequence

1. **Schema and capture.** Track on the session, audience on modules and questions, the intake question. Tag the 29 existing completed sessions as CLINICAL, which they all are.
2. **Content.** The 88 items above. The long pole.
3. **Render and serve.** Filter by track. Scoring untouched.
4. **Norms, per track.** When numbers allow.

## Why this is urgent now rather than later

**There are zero normative rows.** No norms have been computed against the current bank. That is the whole argument for doing this now.

The moment norms are built on a clinical-skewed bank, every non-clinical leader who takes the assessment is scored against a clinician population, which is psychometrically wrong in a way that is invisible in the output and expensive to unwind. Today the cost of change is 88 items of writing. After norms, it is 88 items plus a renormalisation plus every report issued in between.

The present blast radius is small and will not get smaller: 50 sessions, 29 completed, 3,112 item responses, 26 reports, 67 users across 26 organisations.

## Open questions

**Tagging is done.** The bank now carries an audience on every item: 88 CLINICAL, 62 BOTH. Three Culture items that trip the vocabulary check were deliberately left BOTH because they describe the institution rather than the respondent, and a hospital has patient throughput whoever is answering.

**The 360 module follows the subject, not the rater.** A rater is asked to describe somebody else's behaviour. If the subject is non-clinical, "invests time in coaching and mentoring junior clinicians" does not apply, whoever is answering. The track for a 360 item has to be taken from the person being rated. Worth confirming that is how the rater invite resolves it.

**Where does the track live for norms?** `MaarovaNormativeData` has `roleLevel` and `sectorType` but no track. Adding one explicitly is cleaner than overloading either.

**Are the two forms equivalent?** Parallel-form equivalence is an empirical question, not a drafting one. It cannot be answered until both tracks have volume. Until then the honest position internally is that the tracks are designed to be comparable and have not yet been shown to be.

**Duchess will exercise both tracks immediately.** The HR Manager is non-clinical and is taking the assessment now. The Chief Compliance Officer, invited 28 September, is a doctor. None of this work will land before the HR Manager finishes, so her experience of it is already what it is.
