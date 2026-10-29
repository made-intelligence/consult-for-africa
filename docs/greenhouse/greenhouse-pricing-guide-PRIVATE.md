# Greenhouse produce platform: the pricing ladder

**INTERNAL. CFA ONLY. NEVER SENT.** This file carries the walk away, the cost to
serve and the order in which concessions get spent. The client document is
`docs/greenhouse/greenhouse-produce-platform-deck-cfa.pdf`, which carries the
anchor and one visible concession and nothing on this page.

Set 5 October 2026. The client is **Segun Oyewole**, who Debo already knows. The
deck is addressed to him by name. Still outstanding is the trading name of the
business, which sits as `CLIENT_SHORT` at the top of
`scripts/build-greenhouse-deck.py` and appears only on the WhatsApp business
account header in the delivery mock.

---

## The numbers

Repriced 5 October 2026 on Debo's instruction to bring the page close to 6m.
**The move was days, not rates.** The build went from 50 resourced days to 42 and
the day rates did not change, because a discount on unchanged scope teaches a
client the card is soft and sets the reference price for everything after. The
deck still shows the day build, so the cut is visible as a smaller scope rather
than as a weaker number.

| | |
|---|---|
| Walk away | **N5,400,000** |
| Anchor on the page, standard | **N6,920,000**, being 42 resourced days |
| One visible concession | Programme rate at 10 per cent, **(N692,000)** |
| Net on the page | **N6,228,000** |
| Anchor against walk away | **28 per cent above**, slightly under the house band of 35 to 40 |
| Platform care | **N1,800,000 a year**, N150,000 a month |
| Year one on the page | **N8,028,000** |

Billing is 40 on signature, 30 at design sign off, 30 on go live. The first
instalment is N2,491,200 and it is non refundable, which the deck says.

The anchor sits a little under the house band, which is the deliberate cost of
opening close to 6m. The ladder below is therefore shorter than usual and the
first rung is the one that matters.

## The build, by grade

| Workstream | Days | Fee |
|---|---:|---:|
| Discovery, the box model and the harvest rules | 3 | 850,000 |
| Experience design and the screens | 5 | 950,000 |
| The customer ordering app | 10 | 1,550,000 |
| Subscription and payments | 6 | 975,000 |
| Harvest, box and admin console | 10 | 1,550,000 |
| Delivery, manifest and WhatsApp | 4 | 650,000 |
| Testing, launch and handover | 4 | 395,000 |
| | **42** | **6,920,000** |

Grades used, which are a **proposed** software card and not the published one:
principal 350k, senior engineer 200k, designer 150k, engineer 125k, test and
data 90k. Blended 164,762 a day.

The firm has no software rate card. `lib/pricing.ts` lists that as an open gap
alongside the marketing agency, and this engagement is the first time it has
mattered. Two things follow. The consulting card would have produced about N23m
for the same 50 days, which is not a number this client will pay and not a
number that reflects what engineering costs to deliver. And once these rates go
out they become the reference price for every software build the firm quotes,
so they want Debo's sign off before the deck is sent rather than after.

## The ladder

Spend these in order. One at a time, each one asked for rather than offered,
and each one bought with something.

| # | What to give | Cost | Lands at | Ask for in return |
|---|---|---:|---:|---|
| 0 | The Play Store submission, the NDPC registration done for them, and staying close for the first two trading weeks | about a day | 6,228,000 | A named reference and permission to write the case study |
| 1 | The reports layer in the admin portal lands in month four rather than at go live | 228,000 | **6,000,000** | The twelve month care agreement signed at the same time |
| 2 | Delivery routing moves to phase two. A printable manifest stays | 350,000 | 5,650,000 | Payment at 50 on signature rather than 40 |
| 3 | Surplus routing drops to a manual list rather than a rule engine | 250,000 | **5,400,000** | Only if it closes in the room, on the day |

Step 0 is free and reads generous, so it goes first and it goes early.

**Step 1 is the whole negotiation.** It lands on exactly six million, which is a
number a man remembers and repeats, and it costs a feature he will not miss
until month three anyway. Hold it back until he has pushed at least once, then
give it as his win rather than as our offer. If it closes there, stop. Steps 2
and 3 exist so there is somewhere to go, not because they should be reached.

Every rung is scope, never rate. A cut because the scope genuinely shrank is a
different conversation from a cut on the same scope, and only the first one
leaves the card intact for the next client.

Below 5,400,000 the answer is no, and the reason is that the console is what
makes this build worth buying. Cutting into it produces a shop, and a shop is
what the cheaper quote was already offering.

## Never concede

- The source code and the accounts sitting in the client's name. It is the
  strongest thing in the deck and it costs nothing.
- The non refundable first instalment.
- Care below N1,800,000, or care unbundled from the build in year one.
- A native app for the same money, which is the concession he will fish for if
  the app argument does not land.
- Revenue share or equity in place of a fee. One naira, one fee.
- Paying for the third party costs ourselves. They pass through at cost, which
  is cheap goodwill and true.

## The four objections, and the answers

**"I still want a real app."** Page seven of the deck is the honest case and it
is there so he can see we are not hiding anything. The only genuine loss is live
driver tracking. If he will not move, price the native build separately and let
him choose. Do not discount the web build to win the argument, because that
trades a price for a point of pride and leaves nothing for the real negotiation.

**"Somebody quoted me two million."** Page sixteen. Seven decisions a general
developer gets wrong, of which the Paystack and Verve one is checkable in an
afternoon and will land hardest. Then move scope, never rate. Note that the page
price is already close to the floor, so there is far less room here than on a
normal mandate and it should not be spent on the first push.

**"Why is maintenance so much?"** Only if challenged, and never volunteered: it
carries the payment and messaging integrations, which change under him whether
or not he touches the product, and it includes two days a quarter of change
which is where almost every request actually lands. Do not open with the
percentage of build, and do not explain our cost.

**"Can you take a share of sales instead?"** No, for phase one. There is a real
conversation about an operating arrangement once the thing is running and the
numbers exist, and it is a better conversation when we have delivered. Say that,
and leave it there.

## The thing to lead the meeting with

Not the fee, and not the app argument. The slide that does the work is the one
listing GoLemon, Jumia Food, Fresh Direct, Bolt Food and FoodCourt, because it
establishes that we looked at his market before we looked at his budget, and it
sets up the only sentence that matters in the whole deck: every one of them died
carrying a fixed cost the order book could not reach, and he already owns the
farm. That makes the console the centre of the purchase rather than the app,
and the console is the part nobody else is quoting for.

## Open before sending

- The trading name of the business, for the WhatsApp mock. Everything else is
  already addressed to Segun.
- Debo's sign off on the software day rates, which become the firm's card.
- Whether he wants the native build priced as a parallel option in an appendix
  or held until asked. Current deck holds it.
