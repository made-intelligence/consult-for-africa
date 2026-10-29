# Facilities from Mezo, as leads

Mezo assesses facilities against the Mezo Facility Standard. After a fair
report it invites them to the Mezo Readiness Programme, and the work that
follows is hospital operations and clinical governance work this firm delivers,
behind Mezo. The facility only ever deals with Mezo.

## The call

```
POST {C4A}/api/partners/mezo/improvement
x-mezo-signature: <hex HMAC-SHA256 of the raw body, keyed with MEZO_PARTNER_SECRET>
```

The same secret the CadreHealth handoff uses in the other direction. Mezo sends
it when the owner accepts the invitation, and staff can resend from the
assessment page. The body is `OpportunitySchema` in `lib/mezo/improvement-lead.ts`.

Mezo needs `C4A_BASE_URL` set to this app's URL, and both apps the same
`MEZO_PARTNER_SECRET`.

## What it becomes

One `Lead` per facility, source `MEZO_NETWORK`, project type "Mezo Readiness
Programme". The opening line of `inboundMessage` is `Mezo ref MZF-XXXXXX`, which
is how a resend finds and updates the same lead.

- Service line hooks from the work areas, with "Managed Hospital Operations"
  first when the owner asked Mezo to run the site or Mezo marked it a managed
  prospect.
- Known pain points: the essential gaps.
- Qualification: HOT when the owner asked for help or for Mezo to run it, WARM
  for a managed prospect or a self-serve answer, COLD otherwise.
- The note lists each area of work with consultant days by grade. Days, never
  naira: price them from the rate card.

Partners are notified when a facility first arrives, and by email when one
asks for help.
