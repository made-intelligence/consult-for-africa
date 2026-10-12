# The AGELESS invitation list

Put the list here as `invite-list.csv` with at least:

```
name,email
Dr. Orode Doherty,oodoherty@yahoo.com
```

Any other columns are ignored. Titles are stripped for the greeting, so
`Dr. Orode Doherty` is written to as Orode.

Then:

```
npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts            # dry run
npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts --test     # one to yourself
npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts --send --size=25
```

Run the last one again for each further batch. Every address that goes out is
written to `sent.csv` here and skipped next time, so a repeat run cannot write
to the same person twice.

Neither file is in git. They hold personal contact details for people who have
not asked to hear from us.
