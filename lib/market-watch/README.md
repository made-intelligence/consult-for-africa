# Market Watch

Social listening and market intelligence for a client's brand and its competitors.
Admin at `/admin/market-watch`. The client sees only the weekly dashboard, after a partner publishes it at `/admin/client-dashboards`.

## How it runs

- `/api/cron/market-watch`, every 3 hours: each source that is due fetches, slow jobs from earlier runs are collected, new mentions are read and tagged, alerts are raised and emailed to the watch's CFA recipients.
- `/api/cron/market-watch-weekly`, Monday 06:00 Lagos: composes the week into a draft client dashboard and emails the brief. Also deletes mentions older than 13 months (NDPA).

## Sources and keys

A source without its key is skipped and says so on the watch page.

| Source | Env vars | Cost |
|---|---|---|
| Google reviews, place lookup, search interest | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | About $0.0075 per 100 reviews; $50 minimum top-up |
| Instagram profiles (official) | `META_IG_USER_ID`, `META_ACCESS_TOKEN` | Free; needs CFA's Instagram professional account linked to a Facebook page |
| Instagram comments, TikTok, Facebook pages | `APIFY_TOKEN`, optional `APIFY_MAX_USD_PER_RUN` (default 0.5) | $1.50 to $2.70 per 1,000 items |
| X | `X_BEARER_TOKEN`, optional `X_MAX_POSTS_PER_RUN` (default 100) | $0.005 per post read; set a spend cap in the X console |
| Web, forums, blogs, Reddit | `AWARIO_TOKEN`, plus an Awario alert id on each brand | Awario plan; confirm API access with Awario before buying |
| YouTube | `YOUTUBE_API_KEY` | Free quota, 100 searches a day |
| News (GDELT), Nairaland front page, competitor websites | none | Free |

The reader and the brief use `ANTHROPIC_API_KEY`; `MARKET_WATCH_MODEL` overrides the model.

## Not covered

WhatsApp, private Facebook groups and private accounts. Google News RSS is excluded because its terms forbid commercial use. Nairaland search sits behind a Cloudflare challenge, so only the front page is read.

## Starting a watch

1. `/admin/market-watch`, Start a watch. Link the client's portal project so the weekly draft has somewhere to go.
2. Brands and sources: the client's own brand, then three to eight competitors. Search terms match whole words; use "Ignore when it mentions" for namesakes. Find each brand on Google Maps.
3. Run now. Check the feed and correct tags where the reader is wrong; corrections are never overwritten.
