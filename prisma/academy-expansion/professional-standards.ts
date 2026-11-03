import type { TrackExpansion } from "./types";

const expansion: TrackExpansion = {
  slug: "professional-standards",
  topUp: [
    {
      moduleSlug: "cfa-code-of-conduct-ethics",
      questions: [
        {
          question:
            "Your diagnostic shows that most theatre delays at a client hospital trace to the CEO personally approving every consumables requisition above N50,000. The CEO sponsors the engagement. What does the integrity principle require?",
          options: [
            { id: "a", text: "Leave the finding out, because naming the sponsor would put the follow-on work at risk", isCorrect: false },
            { id: "b", text: "Mention it only verbally to the medical director, so it is not in writing", isCorrect: false },
            { id: "c", text: "Present the finding with its evidence, professionally and constructively, with a proposed approval limit that fixes it", isCorrect: true },
            { id: "d", text: "Reword it as a general observation about approval processes across the hospital, without saying whose approval it is, so the CEO can draw the conclusion privately", isCorrect: false },
          ],
          explanation:
            "Integrity means telling the client the truth even when it is uncomfortable, said in a way that helps them act. Blurring it into a general observation softens the finding to protect the relationship, which the Code rules out.",
        },
        {
          question:
            "Two years ago you worked as a pharmacist at a hospital that has just hired C4A. The engagement includes a pharmacy stock review. What is the most likely way the conflict is handled once you disclose it?",
          options: [
            { id: "a", text: "You are recused from the pharmacy workstream and stay on the rest of the engagement", isCorrect: true },
            { id: "b", text: "You are removed from the engagement entirely", isCorrect: false },
            { id: "c", text: "Nothing changes, because two years is long enough for any conflict to lapse", isCorrect: false },
            { id: "d", text: "You lead the pharmacy workstream, because you know the people, the stock systems and the history better than anyone else on the team", isCorrect: false },
          ],
          explanation:
            "Most conflicts are managed by recusal from the affected workstream rather than removal. Leading the pharmacy review would mean assessing your former colleagues and possibly your own past work.",
        },
        {
          question:
            "You need to file a facility document with a state regulator, and the regulator's published process carries a fee paid to its account against an official receipt. How should this be handled?",
          options: [
            { id: "a", text: "Refuse to pay, because C4A has zero tolerance for any payment to officials", isCorrect: false },
            { id: "b", text: "Pay it in cash to the desk officer to save time, and keep a note", isCorrect: false },
            { id: "c", text: "Ask the client to pay it privately through one of its own staff so that the payment does not appear anywhere in C4A's records or expense claims", isCorrect: false },
            { id: "d", text: "Pay it as a documented, approved filing fee through the official channel, with the receipt kept", isCorrect: true },
          ],
          explanation:
            "A formal fee required by a legitimate process is allowed when documented and approved by the engagement lead. Refusing it confuses a lawful fee with a facilitation payment; cash to an individual is the opposite of the official channel.",
        },
        {
          question:
            "At the end of a project the client's medical director gives each team member a framed print of the hospital's founding photograph. Separately, a department head offers you a new smartphone \"for all your help\". What should you do?",
          options: [
            { id: "a", text: "Accept both, since both are thank-you gifts at the end of the work", isCorrect: false },
            { id: "b", text: "Accept the framed print as a token item and decline the smartphone politely", isCorrect: true },
            { id: "c", text: "Decline both politely, because accepting any gift of any kind from client staff could create the appearance of impropriety", isCorrect: false },
            { id: "d", text: "Accept the smartphone and declare it later if anyone asks", isCorrect: false },
          ],
          explanation:
            "Token items below the Code's limit are acceptable; a smartphone is well above it and must be declined. A blanket refusal of every token would be needlessly rude and is not what the Code asks.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which of these fit the Code's boundaries for client relationships? Select all that apply.",
          options: [
            { id: "a", text: "Following the hospital's hierarchy when requesting meetings with senior clinicians", isCorrect: true },
            { id: "b", text: "Lending N150,000 to a client staff member who is struggling with school fees", isCorrect: false },
            { id: "c", text: "Raising a difficult finding with the managing director when the data demands it", isCorrect: true },
            { id: "d", text: "Accepting the client's offer of a weekend at their chairman's beach house", isCorrect: false },
          ],
          explanation:
            "Respecting the client's hierarchy and having difficult conversations when the data demands them both belong to the professional relationship. Personal financial transactions with client staff and lavish hospitality compromise independence.",
        },
      ],
    },
    {
      moduleSlug: "data-protection-confidentiality",
      questions: [
        {
          question:
            "After a successful turnaround, you want to post on LinkedIn: \"Proud of our team's work cutting discharge times by half at a 150-bed hospital in Asaba this year.\" What is the problem?",
          options: [
            { id: "a", text: "There is no problem, because the client is not named", isCorrect: false },
            { id: "b", text: "The bed count, town and timing together identify the client, so it breaches confidentiality", isCorrect: true },
            { id: "c", text: "It is only a problem if the client complains", isCorrect: false },
            { id: "d", text: "It is fine as long as you remove the percentage and post it after the engagement has formally closed", isCorrect: false },
          ],
          explanation:
            "Confidentiality covers posts that could identify the client, not only those that name it, and in a small market the details give it away. Removing one figure still leaves the hospital identifiable.",
        },
        {
          question:
            "You need to analyse 30-day readmissions. The hospital offers a full extract including names, NIN, phone numbers, diagnoses and admission and discharge dates. What should you ask for?",
          options: [
            { id: "a", text: "The full extract, since more data allows more analysis later", isCorrect: false },
            { id: "b", text: "The full extract, deleting the names, NIN and phone numbers yourself as soon as it arrives on your encrypted laptop and before analysis starts", isCorrect: false },
            { id: "c", text: "Names and dates only, since diagnoses are the most sensitive field", isCorrect: false },
            { id: "d", text: "A pseudonymised extract with a patient key, diagnoses, and admission and discharge dates, and no names, NIN or phone numbers", isCorrect: true },
          ],
          explanation:
            "Data minimisation means collecting only what the purpose needs, and readmission analysis needs a stable key, dates and diagnoses, not identity. Deleting identifiers after receipt still means you collected and held them.",
        },
        {
          question:
            "An engagement closes on 31 March and the contract says nothing about data retention. What must happen to the client data the team holds?",
          options: [
            { id: "a", text: "Return or securely delete it by 30 April and record what was deleted, when and by whom in the data destruction register", isCorrect: true },
            { id: "b", text: "Keep it securely on the platform for at least a year, in case the client returns for follow-on work and needs the baseline figures again", isCorrect: false },
            { id: "c", text: "Delete it whenever each consultant gets round to it", isCorrect: false },
            { id: "d", text: "Move it to the knowledge base so it is available to future teams", isCorrect: false },
          ],
          explanation:
            "Without a contractual retention period, client data is returned or securely deleted within 30 days of the end of the engagement, and the deletion is documented. Moving it into the knowledge base is still keeping it, and spreads it further.",
        },
        {
          question:
            "In a ride-hailing car after a site visit, your colleague starts discussing which consultants at the client hospital are likely to lose their jobs. What should you do?",
          options: [
            { id: "a", text: "Join in quietly, since the driver is unlikely to know the hospital", isCorrect: false },
            { id: "b", text: "Switch to speaking in Yoruba or Igbo for the rest of the journey, so the driver is less likely to follow the conversation", isCorrect: false },
            { id: "c", text: "Suggest you pick it up when you are back in the office, and change the subject", isCorrect: true },
            { id: "d", text: "Let it go and remind them by email afterwards", isCorrect: false },
          ],
          explanation:
            "Client details are not discussed in public places, taxis included, and the simplest fix is to stop the conversation and move it to a private setting. Switching language assumes nobody nearby understands it, which is a gamble with someone else's information.",
        },
        {
          question:
            "Three months after an engagement closed, a partner asks for proof that the team deleted the client's patient-level files. Who should be able to produce it, and from what?",
          options: [
            { id: "a", text: "Each consultant who worked on the engagement, by confirming from memory what they deleted and roughly when they did it", isCorrect: false },
            { id: "b", text: "The client, from its own records of what it sent", isCorrect: false },
            { id: "c", text: "Nobody, because deletion does not need to be recorded", isCorrect: false },
            { id: "d", text: "The engagement lead, from the data destruction register", isCorrect: true },
          ],
          explanation:
            "The engagement lead is responsible for making sure destruction is completed and documented in the register. Memory and the client's records cannot show what C4A itself deleted.",
        },
      ],
    },
  ],
  modules: [
    {
      slug: "client-conduct-conflicts",
      name: "Conflicts, Gifts and Independence",
      description:
        "Recognising the threats to independence on hospital engagements, declaring and managing conflicts, handling gifts and hospitality in the Nigerian context, and staying independent while working closely with a client.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "What independence means on a hospital engagement",
            body:
              "Independence is the client's assurance that your advice is your honest judgement and not shaped by anything else. It has two sides. Independence of mind is whether your judgement is actually free. Independence in appearance is whether a reasonable person who knew all the facts would believe it is. You need both, because a client who later learns of an undeclared link will doubt every finding, even the sound ones.\n\nThe Code of Conduct module set out the principle of objectivity and the duty to disclose. This module is about the situations where independence comes under pressure. Five threats cover most of them:\n- Self-interest: you or C4A gain from a particular answer, such as a recommendation that creates follow-on work.\n- Familiarity: you are close to people at the client, so you find it hard to judge their work.\n- Advocacy: you start arguing the client's side to a third party, such as an HMO or a lender, when you were engaged to advise.\n- Self-review: you are asked to evaluate a system or plan that you, or C4A, designed.\n- Intimidation: someone with power over the engagement pressures you to change a finding.\n\nNigerian healthcare makes several of these sharper. The private hospital market in any one city is small, and the people in it trained together, served on the same committees and often belong to the same associations. Many hospitals are owned by founder-doctors and their families, so the owner, the medical director and the chairman may be one person or one family. A consultant from a medical background may well be assessing a hospital where former classmates work.\n\nNone of this means you should not take the work. It means you notice the threat, name it to your engagement lead, and put a safeguard in place. A threat that is noticed and managed is ordinary professional life. A threat that is ignored until the client discovers it becomes a question about the firm's integrity.",
          },
          {
            title: "Declaring and managing a conflict",
            body:
              "Declare any possible conflict early, in writing, to your engagement lead, and let the firm decide whether it matters. Your job is to disclose; it is not to judge whether your own conflict is serious. People are poor judges of their own conflicts, and a declaration that turns out to be unnecessary costs nothing.\n\nThe situations that most often need declaring:\n- Personal relationships: a relative, partner or close friend at the client, at a competitor in the same catchment, or at a vendor being evaluated.\n- Prior employment at the client or a direct competitor, usually within the last few years.\n- Financial interests: shares in a diagnostic centre, pharmacy or supplier that would gain from your recommendations, or a stake in a competing facility.\n- Other work: a private practice, a locum post or a board seat that touches the client's market.\n- Offers from the client: a job, a private consultancy arrangement on the side, or an invitation to invest.\n\nThe engagement lead records the declaration and chooses a safeguard. The common ones are recusal from the affected workstream, a firewall so you do not see certain information, review of your work by someone independent of the conflict, disclosure to the client with their written consent, or, rarely, removal from the engagement. Where C4A itself has a conflict, such as advising two hospitals competing for the same corporate contract, the partners decide whether both engagements can continue with separate teams and informed consent, or whether one must be declined.\n\nA useful test: if the client's chairman learned of this from someone else in six months, would they feel misled? If the honest answer is perhaps, declare it now.\n\nDeclarations are not one-off. A conflict can arise mid-engagement, for example when a client's head of procurement turns out to be your cousin's husband, or when your sister takes a job at the hospital's main competitor. Declare it the day you learn of it.",
          },
          {
            title: "Gifts and hospitality",
            body:
              "Accept only token gifts within the Code's limit, refuse cash in any form, and record every gift you are offered, accepted or not, in the gift register. The difficulty in practice is not knowing the rule; it is applying it gracefully in a culture where giving is part of good manners.\n\nYou will meet Christmas and Sallah hampers, an envelope \"for your transport\" after a long day on site, fabric or a bag at a hospital anniversary, and lavish invitations when a new wing opens. Judge each one on five things:\n- Value: is it beyond a token, or would it look so to an outsider?\n- Timing: gifts offered while you are scoring a vendor, reviewing someone's department or about to issue findings carry the most risk.\n- Form: cash, transfers, airtime, vouchers and fuel are cash, whatever they are called, and are always declined.\n- Openness: a gift given publicly to the whole team differs from one slipped to you alone.\n- Pattern: a single hamper at Christmas differs from a gift every visit.\n\nWhen you decline, be warm and brief, and give the rule as the reason so it is not personal: \"Thank you, that is very kind. Our firm's policy does not let me accept this, but I really appreciate the thought.\" Where refusing would cause real offence, for example a hamper delivered to the office or a gift presented at a staff party, accept it on behalf of the firm, record it, and let the engagement lead decide whether it is shared, returned or donated.\n\nHospitality follows the same logic. A working lunch in the hospital canteen, or a modest meal while working late, is normal. A dinner at an expensive restaurant while you are mid-review, a trip abroad to see a supplier's factory, or a hotel weekend for a \"strategy retreat\" that is mostly leisure needs prior approval from the engagement lead, and where the trip is genuinely for work, C4A pays its own way.",
          },
          {
            title: "Staying independent while being close",
            body:
              "Good engagements need closeness to the client, and independence means you stay close without becoming the instrument of any one person in it. Be clear about who the client is. It is the organisation named in the engagement letter, acting through the people the letter names, usually the board or the managing director. It is not whichever senior person you happen to be talking to.\n\nThis matters most in hospitals where power is divided. In a family-owned hospital with two founding families on the board, one family's representative may ask you to send them the draft findings first, or to look quietly into the other family's management of the pharmacy. The answer is the same: you report to the client as defined in the engagement, and you do not run a side channel. Say so politely and tell your engagement lead the same day. Fair process protects everyone, including the person asking.\n\nThe same applies when a senior figure wants a finding changed. A medical director who asks you to attribute theatre delays to nursing, when the data points to consultants arriving late, is applying intimidation, however friendly the request. Listen properly, because they may know something the data does not show. Check it. If the evidence still stands, the finding stands, and the engagement lead handles the conversation.\n\nSome other common situations:\n- A client offers you a job. Declare it to your engagement lead at once and step back from any work assessing the role or the people you might manage. Most engagement letters restrict hiring each other's staff for a period; the firm, not you, deals with that.\n- A client staff member asks you to help with their private business at weekends. Decline, and tell your engagement lead.\n- Client staff send friend requests or add you to personal WhatsApp groups. Being friendly is fine; discussing the engagement there is not.\n\nYou will be closer to some people than others. That is human. The safeguard is that your findings rest on evidence anyone could check.",
          },
        ],
        exercises: [
          {
            title: "A week of independence decisions",
            instruction:
              "You are a consultant on a six-week operations review at a 140-bed family-owned hospital in Ibadan. In one week: on Monday you learn that the hospital's new head of procurement is married to your cousin; on Tuesday a laboratory equipment vendor being evaluated in your workstream invites the team to dinner at a top hotel; on Wednesday a director from one of the two owning families asks you to send her the draft findings before they go to the board; on Thursday the medical director hands you an envelope \"for transport, you have worked so hard\"; on Friday the managing director says she would like you to join the hospital as COO when the engagement ends. For each day, write what you would say in the moment (one or two sentences), what you would record and where, and what you would tell your engagement lead. Then identify which of the five threats to independence each situation represents.",
          },
        ],
      },
      resources: { tools: ["Conflict of interest declaration", "Gift register", "Engagement letter"] },
      questions: [
        {
          question:
            "You are about to start a review of a hospital's laboratory outsourcing. Your brother holds a 15% stake in one of the three labs bidding for the contract. You will not be scoring the bids. What should you do?",
          options: [
            { id: "a", text: "Nothing, because you are not scoring the bids and so cannot influence the outcome", isCorrect: false },
            { id: "b", text: "Declare it in writing to your engagement lead now and let the firm choose the safeguard", isCorrect: true },
            { id: "c", text: "Tell the client's procurement head informally, so the client knows", isCorrect: false },
            { id: "d", text: "Ask your brother to sell the stake before the review starts, which removes the conflict so there is nothing left to declare", isCorrect: false },
          ],
          explanation:
            "Your job is to disclose; the firm decides whether and how to manage it, and people are poor judges of their own conflicts. An informal word to the client skips the record and the engagement lead, who is responsible for the safeguard.",
        },
        {
          question:
            "C4A designed a hospital's new bed management process last year. The same hospital now asks C4A to evaluate whether that process is working. Which threat to independence is most directly in play?",
          options: [
            { id: "a", text: "Self-review", isCorrect: true },
            { id: "b", text: "Advocacy", isCorrect: false },
            { id: "c", text: "Familiarity", isCorrect: false },
            { id: "d", text: "Intimidation", isCorrect: false },
          ],
          explanation:
            "Evaluating a process the firm itself designed is self-review, because there is a pull to find that your own work succeeded. Familiarity is about closeness to people, which may also be present but is not the core threat here.",
        },
        {
          question:
            "During a vendor evaluation you are scoring, one bidder's sales manager sends a N50,000 airtime transfer to your phone \"as a Sallah greeting\". What should you do?",
          options: [
            { id: "a", text: "Keep it, because airtime is a small courtesy and not cash", isCorrect: false },
            { id: "b", text: "Keep it, but score that bidder more strictly than the others to make sure the greeting does not tilt the evaluation in their favour", isCorrect: false },
            { id: "c", text: "Ignore it, since you did not ask for it", isCorrect: false },
            { id: "d", text: "Decline or return it, record it in the gift register and tell your engagement lead, because it is cash offered during a decision you are making", isCorrect: true },
          ],
          explanation:
            "Airtime and transfers count as cash, and the timing, during an evaluation you are scoring, makes it the highest-risk kind of gift. Scoring harshly to compensate is still letting the gift affect the evaluation.",
        },
        {
          question:
            "At the hospital's end-of-year staff party, the managing director presents every C4A team member with a wrapped hamper in front of all the staff. Refusing would embarrass her publicly. What is the best course?",
          options: [
            { id: "a", text: "Refuse firmly in front of everyone, because the rule applies regardless of setting", isCorrect: false },
            { id: "b", text: "Accept it graciously on behalf of the firm, record it, and let the engagement lead decide what happens to it", isCorrect: true },
            { id: "c", text: "Accept it and keep it as a personal gift, since it was given openly to the whole team and the managing director meant it personally", isCorrect: false },
            { id: "d", text: "Accept it and give it to a junior member of the client's staff the next day", isCorrect: false },
          ],
          explanation:
            "Where refusal would cause real offence, you accept on behalf of the firm, record it, and the engagement lead decides on sharing, returning or donating. Openness lowers the risk but does not make it a personal gift.",
        },
        {
          question:
            "In a hospital owned by two families, one family's board member asks you privately to send her the draft findings a week before the board sees them. What should you do?",
          options: [
            { id: "a", text: "Send them, because she is a director and entitled to information", isCorrect: false },
            { id: "b", text: "Send a summary only, leaving out the sensitive findings", isCorrect: false },
            { id: "c", text: "Explain politely that findings go to the client as set out in the engagement, and tell your engagement lead the same day", isCorrect: true },
            { id: "d", text: "Agree, but send the same draft to a member of the other family at the same time, so that neither side has an advantage before the board meets", isCorrect: false },
          ],
          explanation:
            "The client is the organisation acting through the people the engagement letter names, and a private early channel to one faction undermines fair process. Sending it to both families is still running side channels outside the agreed reporting line.",
        },
        {
          question:
            "The medical director asks you to attribute theatre delays to nursing preparation. Your data shows 70% of late starts follow consultants arriving after the scheduled time. What should you do first?",
          options: [
            { id: "a", text: "Change the attribution, since he knows the theatre better than you do", isCorrect: false },
            { id: "b", text: "Refuse and end the conversation, because the data is clear", isCorrect: false },
            { id: "c", text: "Present both explanations as equally likely in the report and leave the board to decide which one it believes, so nobody is singled out", isCorrect: false },
            { id: "d", text: "Listen to his reasons, check whether they change the evidence, and if the data still stands keep the finding and involve your engagement lead", isCorrect: true },
          ],
          explanation:
            "He may know something the data does not show, so you listen and check, but a finding moves only if the evidence moves. Presenting a weaker explanation as equally likely is softening the finding under pressure.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Which of these should you declare to your engagement lead? Select all that apply.",
          options: [
            { id: "a", text: "You did your housemanship at the client hospital eight years ago and know several of its consultants", isCorrect: true },
            { id: "b", text: "The client's managing director has offered you a job starting after the engagement", isCorrect: true },
            { id: "c", text: "You have read the client hospital's public annual report", isCorrect: false },
            { id: "d", text: "You hold shares in a pharmacy chain that supplies the client", isCorrect: true },
          ],
          explanation:
            "Prior work there, a job offer and a financial interest in a supplier are all possible conflicts the firm should judge. Reading public information creates no relationship or interest.",
        },
        {
          question:
            "Which response to an expensive gift best combines warmth with the rule?",
          options: [
            { id: "a", text: "\"Thank you, that is very kind. Our firm's policy does not let me accept this, but I really appreciate the thought.\"", isCorrect: true },
            { id: "b", text: "\"I cannot accept gifts from clients because it could look like a bribe.\"", isCorrect: false },
            { id: "c", text: "\"Maybe after the engagement finishes, when it will not matter.\"", isCorrect: false },
            { id: "d", text: "\"I really cannot take this from you, but if you would like to, please give it to my engagement lead instead and she will decide.\"", isCorrect: false },
          ],
          explanation:
            "Giving the firm's policy as the reason keeps the refusal impersonal and the relationship intact. Mentioning bribery implies the giver had a corrupt motive, which is needlessly insulting.",
        },
        {
          question:
            "A supplier invites the team on a three-day trip to see its manufacturing plant in another country, all expenses paid, while you are evaluating its bid. The visit would genuinely help the evaluation. What is the right approach?",
          options: [
            { id: "a", text: "Accept, since the trip is for work and the evaluation will benefit", isCorrect: false },
            { id: "b", text: "Seek prior approval from the engagement lead and, if the visit goes ahead, C4A or the client pays rather than the supplier", isCorrect: true },
            { id: "c", text: "Decline any visit, because seeing a supplier's site is never appropriate", isCorrect: false },
            { id: "d", text: "Accept the invitation, and disclose the trip and its full cost transparently in the final evaluation report to the client's board", isCorrect: false },
          ],
          explanation:
            "Supplier-paid travel during an evaluation is a serious threat to independence, so a genuine work visit needs approval and is paid for by C4A or the client. Disclosing it afterwards does not undo the obligation it creates.",
        },
        {
          question:
            "Midway through an engagement your sister takes a senior job at the client hospital's main competitor in the same town. What should you do?",
          options: [
            { id: "a", text: "Nothing, because the conflict did not exist when the engagement started", isCorrect: false },
            { id: "b", text: "Wait until the next engagement to declare it", isCorrect: false },
            { id: "c", text: "Declare it to your engagement lead the day you learn of it", isCorrect: true },
            { id: "d", text: "Ask your sister not to mention your engagement at work, and keep the two parts of your life separate until the engagement ends", isCorrect: false },
          ],
          explanation:
            "Declarations are not one-off; a conflict that arises mid-engagement is declared when you learn of it. Waiting lets the client discover it first, which is the outcome declaration exists to prevent.",
        },
      ],
    },
    {
      slug: "integrity-procurement-payments",
      name: "Integrity Around Money",
      description:
        "How money goes wrong in hospital procurement and payments, the consultant's own integrity when C4A is in the money flow, payments to officials under Nigerian and foreign law, and exactly what to do when you are asked.",
      estimatedMinutes: 70,
      content: {
        sections: [
          {
            title: "How money goes wrong in hospital procurement",
            body:
              "Most procurement fraud in hospitals follows a handful of patterns, and knowing them lets you spot the signs in data you are already analysing. You are not there to investigate, but you will often be the first person to notice something does not add up.\n\nThe common patterns:\n- Inflated quotes with a kickback: a supplier prices 20 to 30% above market and returns part of the margin to the person who approved the order, often called \"returns\" or \"PR\".\n- Split orders: one N4m purchase broken into five orders of N800,000 so each sits under the N1m limit that needs the managing director's approval.\n- Staff-owned or related vendors: a supplier owned by a storekeeper's spouse or a director's relative, never declared.\n- Phantom deliveries: goods paid for, signed for at the store, never used or never received.\n- Rebates paid to individuals: a volume rebate or free goods that should go to the hospital going to the buyer instead.\n- Paid referrals: fees from a diagnostic centre or specialist to the doctor who refers patients. The Code of Medical Ethics issued under the MDCN treats fee-splitting and paid referrals as unethical conduct.\n\nThe signs in the data are usually numbers that do not fit. One supplier wins every tender for a category. Prices for the same item vary widely between orders in the same month. Many orders sit just under an approval limit. Consumption of a costly consumable rises while patient numbers do not. A supplier's address matches a staff member's.\n\nWhen you see such a sign, write down what you found, the source and the date, and take it to your engagement lead. Do not ask the storekeeper about it, do not tell colleagues at the client, and do not draw conclusions in writing. A price variance has many innocent explanations, from a supply shortage to a change of pack size. The client's board decides whether to investigate; C4A's role is to report what the data shows, framed as a finding about a control, not an accusation against a person.",
          },
          {
            title: "When C4A is in the money flow",
            body:
              "When C4A designs a procurement, evaluates vendors or recommends a supplier, the firm's own integrity is on the line, and the safeguards must be visible. Clients hire C4A partly because they trust its advice to be free of the commissions that colour so much advice in the sector.\n\nThe rules are straightforward:\n- C4A takes no commission, referral fee or rebate from any vendor it recommends or evaluates, and neither do you personally. If a vendor offers one, decline, record the offer and tell your engagement lead.\n- Evaluation criteria and their weights are set and agreed with the client before bids are opened. Changing weights after you have seen the bids is the classic way to steer a result, even unintentionally.\n- Scoring is documented: each evaluator scores separately, with reasons, and the scores and reasons are kept.\n- Where the client's own policy calls for competitive quotes, the team makes sure the quotes are real and comparable: same specification, same quantities, same delivery terms.\n- Anyone with a link to a bidder declares it before evaluation and steps out of scoring that bid.\n\nFor government clients, procurement also has to follow public procurement law. Federal bodies are bound by the Public Procurement Act 2007, overseen by the Bureau of Public Procurement, and many states have their own procurement laws. The thresholds and methods are set there, not by C4A.\n\nYour own expenses are part of this. Claim only what you spent, with receipts, on the engagement it relates to. A fuel receipt rounded up, a hotel night for a colleague who stayed elsewhere, a taxi fare claimed when the client drove you: these are small, and they are dishonest, and an expense claim that does not match the record is the kind of thing a client's finance director notices.\n\nIf you are ever unsure whether something is acceptable, the test is whether you would be comfortable with the client's chairman reading a full account of it. If not, ask before you act.",
          },
          {
            title: "Payments to officials",
            body:
              "C4A makes no facilitation payments of any size to anyone, and the only payment to a public official or agency is an official fee paid through the official channel. An official fee is one set out in the agency's published process, paid into the agency's designated account, against an official receipt. Registration and renewal fees with a state health facility regulator such as HEFAMAA in Lagos, product registration fees with NAFDAC and company filings with the Corporate Affairs Commission are examples.\n\nAnything else asked by an official in a personal capacity is a bribe, whatever it is called: \"logistics\", \"mobilisation\", \"something for the boys\", \"to move your file to the top\", \"weekend money\". It does not become acceptable because it is small, because it is customary, or because the official is underpaid.\n\nThe law points the same way. In Nigeria, the Corrupt Practices and Other Related Offences Act 2000, enforced by the Independent Corrupt Practices and Other Related Offences Commission (ICPC), criminalises offering and accepting gratification, and the Economic and Financial Crimes Commission (EFCC) pursues financial crimes more broadly. Firms with links abroad can also be caught by foreign law. The UK Bribery Act 2010 makes no exception for facilitation payments and can hold an organisation liable for failing to prevent bribery by people acting for it. The United States Foreign Corrupt Practices Act has a narrow exception for routine government actions, but C4A's policy is stricter than that exception, and many of the donors and investors the firm works alongside apply the strictest standard.\n\nThere is one exception, and it is about safety, not convenience. If you are threatened with harm to yourself or others, for example at a roadblock or held in an office, and a payment is the only way to get safe, pay, get safe, and report it to your engagement lead within 24 hours. That report is recorded and you will not be disciplined for it. A threat to delay your paperwork is not a threat to your safety.",
          },
          {
            title: "What to do when you are asked",
            body:
              "When someone asks you for an improper payment, refuse clearly without giving offence, ask for the official route, write it down the same day and escalate. Have the words ready, because these requests usually come when you are tired and in a hurry.\n\nIn the moment:\n- Refuse plainly and politely, giving the firm's policy as the reason: \"I am sorry, our firm does not allow any payment outside the official fee.\"\n- Ask for the official process: \"Please can you give me the official invoice and the account it should be paid into?\" Many requests fade at this point.\n- Do not negotiate, hint, or promise to \"see what you can do\". Ambiguity is read as yes.\n- Do not pay through someone else. Asking the client's driver, an agent or a \"consultant\" to handle it is the same payment.\n\nThe same day, write a short note: who asked, their role, what they asked for, the amount, when and where, who else was present, and what you said. Send it to your engagement lead, who escalates to a partner. If the request came from someone at the client, the partner decides how and when the client is told, because it may be the first sign of a wider problem for them.\n\nDo not investigate it yourself, confront the person, or discuss it with colleagues at the client. Keep any messages or documents, as they are.\n\nSometimes the issue is not a request but something you find. Suppose your revenue analysis shows the same supplier invoice of N3.4m paid twice, three weeks apart, with different invoice numbers. You report it to your engagement lead with the evidence, and the report to the client describes the control that failed (duplicate payment checks) and the amount, not a conclusion about who did it. The client's board decides what happens next.\n\nEscalating is never wrong. There is no penalty for raising a concern that turns out to be innocent. There are serious consequences for staying quiet about one that was not.",
          },
        ],
        exercises: [
          {
            title: "A file that will not move",
            instruction:
              "You are supporting a client's application to register a new 30-bed annex with the state's health facility regulator. The published fee has been paid into the agency's account and you hold the receipt. On your third visit, the desk officer tells you the file is \"stuck upstairs\" and that N150,000 \"for logistics\" would see it approved this week; otherwise it may take two months, and the client's opening date is in five weeks. Write what you would say to the officer, word for word. Then write the note you would send your engagement lead that afternoon. Finally, list three legitimate steps the client or the firm could take to move the application, and say which one you would recommend and why.",
          },
          {
            title: "Reading the purchase ledger",
            instruction:
              "In a 160-bed hospital's purchase ledger for six months you find: one supplier won 11 of 12 orders for surgical consumables; 23 orders sit between N900,000 and N990,000, with the managing director's approval limit at N1m; the price of a box of sterile gloves ranged from N7,800 to N12,500 in the same month; and a vendor's registered address matches the home address in a storekeeper's HR file. For each, write one innocent explanation and one concerning one. Then draft the paragraph you would put in your findings to the client, framed as a finding about controls, without naming any individual.",
          },
        ],
      },
      resources: { tools: ["Gift register", "Conflict of interest declaration", "Expense claim policy", "Ethics escalation procedure"] },
      questions: [
        {
          question:
            "Analysing a hospital's purchase ledger, you see 23 orders between N900,000 and N990,000, and the managing director's approval limit is N1m. What should you do?",
          options: [
            { id: "a", text: "Ask the procurement officer to explain the pattern before you tell anyone, so you do not raise a false alarm", isCorrect: false },
            { id: "b", text: "Record the pattern, the source and the date, and take it to your engagement lead without drawing conclusions about anyone", isCorrect: true },
            { id: "c", text: "Leave it out of your work, because approval limits are a governance matter outside the scope of a revenue review and the auditors will pick it up", isCorrect: false },
            { id: "d", text: "Report the procurement officer to the managing director as likely to be splitting orders", isCorrect: false },
          ],
          explanation:
            "Orders clustered under an approval limit are a sign of order splitting, but there may be an innocent reason, so you document and escalate rather than investigate or accuse. Questioning the officer yourself can alert the wrong person and damage evidence.",
        },
        {
          question:
            "A laboratory equipment vendor you are evaluating offers C4A a 5% referral fee if the hospital buys from them. What is the right response?",
          options: [
            { id: "a", text: "Accept it on the firm's behalf and disclose it to the client", isCorrect: false },
            { id: "b", text: "Accept it but pass it on to the hospital as a discount", isCorrect: false },
            { id: "c", text: "Decline, record the offer and tell your engagement lead", isCorrect: true },
            { id: "d", text: "Decline, but keep the offer to yourself to avoid embarrassing the vendor", isCorrect: false },
          ],
          explanation:
            "C4A takes no commission, referral fee or rebate from vendors it evaluates, and offers are recorded and escalated. Keeping it quiet loses a fact the engagement lead needs when weighing that vendor's conduct.",
        },
        {
          question:
            "After opening the bids for a pharmacy supply contract, a client director suggests raising the weight on \"local presence\" from 10% to 30%, which would change the winner. What should you say?",
          options: [
            { id: "a", text: "Agree, since the client owns the criteria and can change them", isCorrect: false },
            { id: "b", text: "Agree, provided the change is recorded in the minutes", isCorrect: false },
            { id: "c", text: "Recalculate the scores both ways and present both winners side by side, so the board can decide openly which weighting reflects its real priorities", isCorrect: false },
            { id: "d", text: "Explain that weights must be fixed before bids are opened, and that if local presence matters more, the fair course is to re-run the process with new weights", isCorrect: true },
          ],
          explanation:
            "Changing weights after seeing the bids is the classic way to steer a result, which is why criteria are agreed beforehand. Presenting two winners invites the same steering by another route.",
        },
        {
          question:
            "An official at a state agency says a N50,000 \"mobilisation fee\" paid to him in cash would speed up a client's inspection. The agency's published process lists no such fee. What is it?",
          options: [
            { id: "a", text: "A bribe, whatever it is called, because it is not an official fee paid through the official channel", isCorrect: true },
            { id: "b", text: "An acceptable facilitation payment, because the amount is small", isCorrect: false },
            { id: "c", text: "An official fee, because an official asked for it", isCorrect: false },
            { id: "d", text: "Acceptable if the client agrees in writing to reimburse it and the payment is recorded in the engagement file as a client cost", isCorrect: false },
          ],
          explanation:
            "An official fee is published, paid into the agency's account and receipted; a cash request in a personal capacity is a bribe whatever its name. C4A makes no facilitation payments of any size.",
        },
        {
          question:
            "You are stopped at night by armed men at an unofficial roadblock who demand N20,000 before they will let your car pass. What does C4A's policy say?",
          options: [
            { id: "a", text: "Refuse in all circumstances, because the policy has no exceptions", isCorrect: false },
            { id: "b", text: "Pay, get safe, and report it to your engagement lead within 24 hours; you will not be disciplined", isCorrect: true },
            { id: "c", text: "Pay it, then claim it back as a travel expense with a note explaining the roadblock, so that the firm carries the cost rather than you", isCorrect: false },
            { id: "d", text: "Pay, and say nothing, since it was not a business payment", isCorrect: false },
          ],
          explanation:
            "The one exception is a threat to safety: pay, get safe and report promptly so it is on the record. It is not an expense to be claimed quietly, and not something to keep silent about.",
        },
        {
          question:
            "Which of these is a genuine threat to safety, rather than a delay, for the purposes of the safety exception?",
          options: [
            { id: "a", text: "An official says the client's licence renewal will take three months without a payment", isCorrect: false },
            { id: "b", text: "A port clerk says a shipment of equipment will sit in the warehouse until something is paid", isCorrect: false },
            { id: "c", text: "Someone holding a weapon tells you that you cannot leave the office until you pay", isCorrect: true },
            { id: "d", text: "A clerk says your file will be lost unless you pay", isCorrect: false },
          ],
          explanation:
            "The exception covers threats of harm to people, not threats to paperwork, timelines or goods. Delay is costly, but paying to avoid it is a bribe.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "A desk officer asks you for \"something for the weekend\" to approve a client's document. Which actions are correct? Select all that apply.",
          options: [
            { id: "a", text: "Refuse politely, citing the firm's policy", isCorrect: true },
            { id: "b", text: "Ask for the official invoice and the account it should be paid into", isCorrect: true },
            { id: "c", text: "Say you will \"see what you can do\" to keep things friendly", isCorrect: false },
            { id: "d", text: "Ask the client's driver to handle it so the firm is not involved", isCorrect: false },
            { id: "e", text: "Write down who asked, what, when and who was present, and send it to your engagement lead that day", isCorrect: true },
          ],
          explanation:
            "Refuse, ask for the official route, record and escalate. A vague promise is read as yes, and paying through a driver or agent is the same payment made by another hand.",
        },
        {
          question:
            "Your analysis shows the same N3.4m supplier invoice paid twice, three weeks apart, under different invoice numbers. How should it appear in the findings to the client?",
          options: [
            { id: "a", text: "As a finding that the duplicate payment check failed, with the amount and evidence, without a conclusion about who was responsible", isCorrect: true },
            { id: "b", text: "As evidence of fraud by the accounts payable officer who processed both payments", isCorrect: false },
            { id: "c", text: "Not at all, since it is a finance matter outside an operations review", isCorrect: false },
            { id: "d", text: "In a separate private note to the managing director only, naming the officer who processed both payments so she can act on it quickly", isCorrect: false },
          ],
          explanation:
            "C4A reports what the data shows as a control failure and the board decides what follows. Naming the officer as a fraudster is a conclusion the evidence does not yet support.",
        },
        {
          question:
            "Your hotel bill for a two-night site visit was N96,000, and a colleague who stayed with relatives suggests you claim for her room too, since \"the budget allows it\". What should you do?",
          options: [
            { id: "a", text: "Claim both rooms, since the budget was approved", isCorrect: false },
            { id: "b", text: "Claim both rooms but give her share back to the firm later", isCorrect: false },
            { id: "c", text: "Claim a higher room rate for your own room instead of a second room, which keeps the total within the budget that was approved for the visit", isCorrect: false },
            { id: "d", text: "Claim only your own room, with the receipt, and decline her suggestion", isCorrect: true },
          ],
          explanation:
            "Expenses are claimed only as actually spent, with receipts; a budget is a ceiling, not an entitlement. Any version that claims money not spent is a false claim, however it is arranged.",
        },
        {
          question:
            "A diagnostic centre in the client's catchment pays the client's doctors N5,000 for every patient they refer for a scan. In a referral-pattern review, how should you treat this?",
          options: [
            { id: "a", text: "As normal market practice that does not need mentioning", isCorrect: false },
            { id: "b", text: "As a finding about paid referrals, which the Code of Medical Ethics treats as unethical, reported to your engagement lead and framed around the referral control", isCorrect: true },
            { id: "c", text: "As an opportunity: recommend the client charge the centre a higher fee", isCorrect: false },
            { id: "d", text: "As a matter for you to report directly and confidentially to the MDCN yourself, since professional misconduct by doctors is the regulator's business and not the client's", isCorrect: false },
          ],
          explanation:
            "Paid referrals are treated as unethical in the medical code, and they distort where patients are sent, so it is a finding to raise through the engagement lead. Reporting to the regulator yourself bypasses the firm and the client, who decide on any report.",
        },
      ],
    },
    {
      slug: "quality-review-signoff",
      name: "Quality, Review and Sign-off",
      description:
        "How C4A keeps the quality of its work: what each layer of review is for, a practical self-review before you submit, giving and taking peer review, what signing off means, and how to own and correct an error.",
      estimatedMinutes: 60,
      content: {
        sections: [
          {
            title: "What each layer of review is for",
            body:
              "Quality at C4A comes from a chain of checks, and each check is designed to catch errors the others miss. Knowing what each layer is for tells you what to look for when it is your turn.\n\nSelf-review is the author's check. It catches the errors you know you should look for: arithmetic, sources, consistency, style. It is the cheapest layer, and anything that reaches a reviewer which self-review should have caught wastes the reviewer's time on the wrong things.\n\nPeer review is a colleague's check. It catches what you are too close to see: a step in the logic that is obvious to you and invisible to a reader, an assumption you never wrote down, a chart that says something different from its title.\n\nSign-off by the engagement manager or lead is the final check. It asks whether the work answers the client's actual question, whether it is right for this client at this moment, and whether the firm is willing to stand behind it.\n\nOn the platform, the reviewer scores every deliverable on four criteria that make the standard concrete:\n- Technical quality: is the analysis rigorous and evidence-based?\n- Actionability: are the recommendations specific and implementable?\n- Nigerian context: does it account for local healthcare realities, such as payor mix, power, staffing and regulation?\n- Client-ready: is the presentation professional?\n\nUse these as your own checklist before you submit, not just as the reviewer's. A piece that is technically sound but tells a hospital in Kano to \"improve patient experience\" fails actionability. A staffing model that assumes nurses can be recruited at will, in a market losing nurses abroad every month, fails Nigerian context however neat it looks.\n\nNo layer replaces another. An author who skips self-review because \"the reviewer will catch it\" and a reviewer who signs off because \"the author is careful\" together produce exactly the error both assumed someone else would find.",
          },
          {
            title: "Self-review before you submit",
            body:
              "Self-review is a deliberate pass against a checklist, done after a break, not a skim the moment you finish. The best time is the next morning. If the deadline will not allow that, at least an hour away from the document, ideally reading it printed or on a different screen.\n\nA practical checklist for an analytical deliverable:\n- The answer comes first, and the executive summary says the same thing as the body.\n- Every number traces to a named source and date. Pick three numbers at random and trace each back to the source yourself.\n- Totals add up across and down. Percentages in a breakdown add to 100.\n- Units and scale are consistent: N, N'000 or Nm, monthly or annual, beds or available beds.\n- Dates, names, job titles and the client's name are spelled correctly throughout.\n- Charts match their titles, and axes start where they should.\n- Nothing is left from a template or earlier engagement, including another client's name in a footer, a hidden tab or a speaker note.\n- House style is followed: plain words, no em dashes, no sentences that carry no information.\n- The file is named to the convention and the right version is attached.\n\nThe most damaging errors are rarely typing errors. They are a formula that drags the wrong range, a figure entered in thousands in one tab and in millions in another, or a sum that counts the same patients twice. Test the result for sense: if your model says a 60-bed hospital will earn N2.4bn a year, compare it with what hospitals that size actually earn before you look for anything else.\n\nWrite a short note to the reviewer when you submit, saying what the deliverable is meant to do, what you are least sure of, and anything you could not verify. \"Pharmacy margins use the September price list; I could not get August, so the Q3 figure assumes no price change\" lets the reviewer spend their time where it matters. Hiding a weak point and hoping it passes is not self-review.",
          },
          {
            title: "Giving and taking peer review",
            body:
              "A good review reads the work as the client will, checks substance before style, and leaves the author clear about what must change and what is only a suggestion. A good author receives it as help, not judgement.\n\nAs a reviewer, read in this order:\n- Substance: is the answer right, and is it supported by the evidence shown?\n- Logic: does each step follow, and are the assumptions stated?\n- Presentation: is it clear, consistent and in house style?\n\nStarting with commas and fonts is tempting because it is easy, and it can leave a wrong conclusion untouched under a tidy surface. Write comments the author can act on without asking you. \"This is unclear\" is not a comment. \"Slide 6 says occupancy is 82% but the table on slide 9 gives 74% for the same quarter; which is right?\" is. Mark each comment as must-fix or suggestion, so the author knows where the line is.\n\nAs the author, respond to every comment. Either make the change, or say briefly why you have not. Do not argue in defence of a sentence; ask what the reviewer took it to mean, because if a careful colleague misread it, the client will too. Keep the review conversation in the review, not on the client-facing comment thread.\n\nSigning off means the person signing takes responsibility for the work. It has three conditions:\n- The signer has read the whole thing, not the summary.\n- The must-fix comments are resolved.\n- The signer would be content to defend it in front of the client's board.\n\nIf you are asked to sign off something you have not read properly, say so and ask for the time to do it. If you are the author and a deadline is close, do not lean on the reviewer to approve something they have doubts about. A day's delay is a small cost against a deliverable the firm has to withdraw.",
          },
          {
            title: "Owning and correcting an error",
            body:
              "When you find an error in work that has already gone to the client, tell your engagement manager the same day, bring a proposed fix, and never correct it quietly. Every consultant makes mistakes; what the client remembers is how the firm handled it.\n\nThe first step is to size it. A typing error in a name is not the same as a number that changes a decision. Ask three questions: what exactly is wrong, by how much, and which of the client's decisions it touches. Then go to your engagement manager with the answers and a draft correction. \"The tariff model double-counts HMO capitation and fee-for-service for the same 1,400 enrollees. Projected annual revenue is overstated by about N38m, from N412m to N374m. The board used the higher figure to approve two new nurse posts. Corrected model attached\" is a report someone can act on.\n\nNever swap the file in the portal and hope nobody noticed. The client may already have used the earlier version, quoted it to their board or a lender, and a silent change, once discovered, makes them doubt every other number the firm has given them.\n\nThe correction goes out as a new version with a short note saying what changed and why. The engagement lead decides how the client is told, and for anything that touches a decision, that is a direct conversation, not just a revised file. Owning the error does not mean excessive apology. State it, fix it, explain what will stop it happening again.\n\nAfterwards, record the lesson where the next person will see it: in the review notes for the deliverable, and in the engagement debrief under what failed. Write it about the method, such as \"enrolment and capitation data came from two sources with overlapping members; reconcile member lists before modelling\", not about the person.\n\nIf you notice an error in someone else's work, tell them first, privately, unless the client is about to act on it, in which case tell the engagement manager straight away.",
          },
        ],
        exercises: [
          {
            title: "Review a flawed slide",
            instruction:
              "A colleague's draft slide for a 90-bed hospital in Abeokuta says: title \"Occupancy is healthy\"; body \"Average occupancy was 82% in Q2, up from 64% in Q1, driven by maternity\"; chart showing monthly occupancy of 61%, 66%, 65% for Q1 and 70%, 72%, 74% for Q2; footnote \"Source: ward census\"; and a speaker note mentioning another client's name. Write your review comments as you would leave them, marking each as must-fix or suggestion, and putting substance before presentation. Then rewrite the slide title as an action title that the chart actually supports.",
          },
          {
            title: "An error after delivery",
            instruction:
              "Two weeks after a cost analysis was delivered to a 120-bed hospital in Benin City, you notice that diesel costs were entered as monthly in one tab and treated as annual in the summary. The summary shows energy at N18m a year; the correct figure is about N216m a year, which turns the recommended theatre extension from profitable to loss-making. The client's board meets in nine days. Write the message you would send your engagement manager that afternoon, including the size of the error, what it touches and your proposed next steps. Then draft the two-sentence change note that would accompany the corrected version.",
          },
        ],
      },
      resources: { tools: ["Deliverable quality rubric", "Self-review checklist", "Engagement debrief"] },
      questions: [
        {
          question:
            "You are about to submit a deliverable and think, \"The reviewer will catch anything I miss.\" What is wrong with this reasoning?",
          options: [
            { id: "a", text: "Nothing, because review exists to catch the author's errors", isCorrect: false },
            { id: "b", text: "Each layer catches different errors, so skipping self-review spends the reviewer's time on errors you should have caught and leaves the ones only they can see", isCorrect: true },
            { id: "c", text: "Reviewers are not allowed to correct arithmetic", isCorrect: false },
            { id: "d", text: "It is only wrong for client-facing deliverables; for internal work it is an efficient way to share the load between the author and the reviewer", isCorrect: false },
          ],
          explanation:
            "Self-review catches what the author knows to check; peer review catches what the author is too close to see. When either relies on the other, the error both assumed someone else would find goes through.",
        },
        {
          question:
            "A model you built says a 60-bed private hospital in Osogbo will earn N2.4bn a year. What should you check first?",
          options: [
            { id: "a", text: "The formatting of the summary table", isCorrect: false },
            { id: "b", text: "Whether the reviewer has seen it yet, so that they can confirm the figure before you spend time checking the model yourself", isCorrect: false },
            { id: "c", text: "The spelling of the hospital's name throughout", isCorrect: false },
            { id: "d", text: "Whether the result is plausible against what hospitals of that size actually earn, and then the units and formulas behind it", isCorrect: true },
          ],
          explanation:
            "A sense check against reality catches the most damaging errors, such as wrong units or a formula dragging the wrong range. Polishing the presentation of an implausible number makes it more convincing, not more correct.",
        },
        {
          question:
            "Which note to your reviewer best supports a good review?",
          options: [
            { id: "a", text: "\"Pharmacy margins use the September price list; August was not available, so the Q3 figure assumes no price change.\"", isCorrect: true },
            { id: "b", text: "\"All done, should be fine.\"", isCorrect: false },
            { id: "c", text: "\"Please check everything very carefully, as I was rushed on this one and some parts may not be fully right yet.\"", isCorrect: false },
            { id: "d", text: "\"Same approach as the last deliverable.\"", isCorrect: false },
          ],
          explanation:
            "Saying what you are least sure of and what you could not verify directs the reviewer's time to where it matters. Asking them to check everything gives them no more information than saying nothing.",
        },
        {
          question:
            "You are peer-reviewing a 20-slide deck the day before it goes to the client. In what order should you review it?",
          options: [
            { id: "a", text: "Presentation, then logic, then substance, since the client sees the presentation first", isCorrect: false },
            { id: "b", text: "Only the executive summary, since that is what the board will read", isCorrect: false },
            { id: "c", text: "Substance, then logic, then presentation", isCorrect: true },
            { id: "d", text: "Whatever order the slides are in, fixing each as you go", isCorrect: false },
          ],
          explanation:
            "Check whether the answer is right and supported before polishing how it reads. Starting with presentation is easy and can leave a wrong conclusion under a tidy surface.",
        },
        {
          question:
            "Which review comment is most useful to the author?",
          options: [
            { id: "a", text: "\"This section is unclear and needs work.\"", isCorrect: false },
            { id: "b", text: "\"Must-fix: slide 6 says occupancy is 82% but the table on slide 9 gives 74% for the same quarter; which is right?\"", isCorrect: true },
            { id: "c", text: "\"I would have approached this differently.\"", isCorrect: false },
            { id: "d", text: "\"Looks good overall, a few small issues here and there that you will probably spot yourself on a final read-through.\"", isCorrect: false },
          ],
          explanation:
            "A useful comment is specific, can be acted on without asking the reviewer, and says whether it is must-fix or a suggestion. General comments leave the author guessing what to change.",
        },
        {
          type: "MULTI_SELECT",
          question:
            "Your engagement manager asks you to sign off a colleague's deliverable as peer reviewer. Which conditions must be true before you do? Select all that apply.",
          options: [
            { id: "a", text: "You have read the whole deliverable, not only the summary", isCorrect: true },
            { id: "b", text: "The must-fix comments have been resolved", isCorrect: true },
            { id: "c", text: "The author has more experience than you", isCorrect: false },
            { id: "d", text: "You would be content to defend it in front of the client's board", isCorrect: true },
          ],
          explanation:
            "Signing off means taking responsibility, which requires having read it all, resolved must-fix points and being willing to defend it. The author's seniority is no substitute for your own reading.",
        },
        {
          question:
            "The day after delivery you notice the tariff model double-counts 1,400 HMO enrollees, overstating annual revenue by about N38m. The client's board used the higher figure to approve two new posts. What should you do first?",
          options: [
            { id: "a", text: "Upload a corrected version to the portal quietly, since the client may not have opened it yet", isCorrect: false },
            { id: "b", text: "Wait to see if the client notices, then correct it", isCorrect: false },
            { id: "c", text: "Email the client's finance director directly that evening with a full apology and the corrected file, so the client hears it from you first", isCorrect: false },
            { id: "d", text: "Tell your engagement manager the same day, with what is wrong, its size, the decision it touches and a draft correction", isCorrect: true },
          ],
          explanation:
            "Errors are reported the same day with enough detail to act on, and the engagement lead decides how the client is told. Going directly to the client bypasses the person accountable for the relationship, and a quiet swap destroys trust once discovered.",
        },
        {
          question:
            "How should the corrected version of a delivered deliverable go to the client?",
          options: [
            { id: "a", text: "As a new version with a short note saying what changed and why, with the engagement lead deciding how the client is told", isCorrect: true },
            { id: "b", text: "As a replacement of the original file under the same version number", isCorrect: false },
            { id: "c", text: "With a long, detailed apology explaining exactly how the mistake happened, who on the team made it and what disciplinary steps have been taken", isCorrect: false },
            { id: "d", text: "Only if the client asks for it", isCorrect: false },
          ],
          explanation:
            "A new version with a change note keeps the record honest, and the lead handles the conversation. Replacing the file under the same version hides the change from anyone who has already used the original.",
        },
        {
          question:
            "Which lesson recorded in the debrief after an error is most useful?",
          options: [
            { id: "a", text: "\"The analyst made a mistake with the HMO data.\"", isCorrect: false },
            { id: "b", text: "\"Be more careful with models in future.\"", isCorrect: false },
            { id: "c", text: "\"Enrolment and capitation data came from two sources with overlapping members; reconcile member lists before modelling.\"", isCorrect: true },
            { id: "d", text: "\"Error found in the HMO tab during week three and fixed in the next version; no further action needed.\"", isCorrect: false },
          ],
          explanation:
            "A lesson written about the method tells the next team what to do differently. Naming the person teaches nothing reusable and may reach the colleague it describes.",
        },
        {
          question:
            "You spot a significant error in a colleague's analysis. The client will not see it for another week. What should you do?",
          options: [
            { id: "a", text: "Tell the engagement manager first, so it is on record", isCorrect: false },
            { id: "b", text: "Tell your colleague privately first so they can correct it", isCorrect: true },
            { id: "c", text: "Correct it yourself in their file without mentioning it, which saves them embarrassment and makes sure it is fixed in time", isCorrect: false },
            { id: "d", text: "Mention it at the next team meeting", isCorrect: false },
          ],
          explanation:
            "Where there is time, the author should hear first and fix their own work; you go straight to the engagement manager only if the client is about to act on it. Silently editing their file means the author never learns what went wrong.",
        },
      ],
    },
  ],
};

export default expansion;
