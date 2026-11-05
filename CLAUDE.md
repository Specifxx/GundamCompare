# Working in this repo

Read `README.md` first. This is Gundam Compare: the Gundam Card Game and Gunpla model
kits, compared across stores. Since 2026-11-04 (owner) it runs the **Dex / MTG Compare
engine's look** (the design tokens in `src/app/globals.css` and `tailwind.config.ts`, the
one-row sticky header with the Browse dropdown, the `<dialog>` phone menu, the in-flow
sidebar from xl, the engine's cards, price rows, quick view, ad banner and side rails) on
its own data layer. It is NO LONGER a sister of the card engine (Lorcana, YGO, Cyberpunk,
Bandai): there is no `engine.json`, no engine-drift workflow and nothing to sync. Change
this repo on its own. When the Dex / MTG engine's presentation changes, port it here by
hand as WargameCompare does. Game-specific facts still live in `src/site.config.ts` and
`src/content/`.

## The port's rules (DECISIONS.md, 2026-11-04)

- URLs, titles, meta descriptions, canonicals, robots, Open Graph, JSON-LD, the h1 and
  the h2 outline of every page are unchanged by design work. The sidebar's and menu's
  group labels are `<p>`, never headings. Compare a sample of pages against `main`
  with scripts off before merging a redesign.
- The old class names (`card-surface`, `btn-buy`, `text-fg`, `bg-ink-*`, `text-brand-400`,
  `.link`, `.prose-site`) are aliases of the engine tokens in `tailwind.config.ts`; new
  work uses the engine names (`card`, `btn-primary`, `text-ink`, `bg-surface`, `chip`,
  `tag`, `ad-box`, `ad-pill`).
- The side rails (`SideAds.tsx`) and the home banner (`LandingAds.tsx`) draw the import's
  own eBay results and TCGplayer prices (`lib/card-ads.ts`); they never fetch, never call
  eBay, never show Amazon, and the rails are browser-only above 1864px.

## Deploys are gated — do not add `[deploy]` to commit subjects

**One production build per 12 hours, and production only (owner, 2026-11-02: Vercel spend capped at $5–6 a
day).** `scripts/vercel-ignore-build.sh` skips a `[deploy]` commit within 12 hours of the last production
deployment (it rides the next release); `[urgent]` in the subject overrides that, only when the owner says
so. `vercel.json` disables every branch except production (`"**": false`), so no preview is ever built.
Never dispatch a manual release just to ship a merge. DECISIONS.md, 2026-11-02.

Production builds only when the commit SUBJECT carries `[deploy]`
(`scripts/vercel-ignore-build.sh`). The daily data commit from
`refresh-prices.yml` carries it; that is the one build a day. Never put
`[deploy]` in a subject on your own initiative. "Push to prod" means land on
`main` and ride the next daily release, unless the owner says it is urgent.
Previews build only with `[preview]` in the subject, when the owner asks.

## No accounts, no database, no email

Since 2026-10-25 the site is price comparison only: no sign-in, no Premium,
no email service and no database. Everything it serves is the
committed JSON under `data/` (`src/lib/data.ts`).

**Price alerts are the one exception (owner, 2026-11-02):** the card page's
"Email me when the price drops" form (`PriceAlertForm.tsx`, `SITE.priceAlerts`)
posts to RiftCompare's shared alert service, which keeps the address, emails
and reads this site's static `/alert-feed.json` (`src/lib/alert-feed.ts`) once
a day. This site still stores no address and holds no mail key; never add one.
Keep the feed's price the lowest in-stock store price, never eBay or converted. The removed features are in
`archive/accounts-premium/` (not built); don't import from it.

## Cost rules (from Rift Compare, where breaking them exhausted Neon projects)

1. Public data stays in committed files under `data/`; don't add a database
   read to any page or route.
2. No `generateStaticParams` that prerenders database- or data-heavy pages at
   build. Card and set pages use an empty list (cached on first visit).
3. No page or route handler revalidates under 21600 seconds (six hours);
   86400 for slow content. A route handler caches through its CDN header.
4. Every database query selects only the columns it needs and is bounded.
5. Never write anything private to `data/` — it is public with the source.

## eBay

One eBay app (5,000 Browse calls/day) is shared with Lorcana Compare and
YGO Compare: Lorcana and Gundam 1,150 each, YGO
2,200 (2026-10-28; 1,500 each from the owner's 2026-10-26 split), counted in
`data/state/ebay-usage.json`. Cards under $10 get no call; every
sealed product does. The
plan is `planEbayRefresh` in `src/lib/import/ebay.ts`, pinned by
`tests/ebay-plan.test.ts`. Do not raise `SITE.ebay.dailyBudget` without moving
another site's down by the same amount; the three must total 4,500 or less.

## Amazon's price on sealed pages (owner, 2026-11-05)

`scripts/amazon-asins.ts` (daily refresh) finds each sealed product's ASIN on each market's own Amazon, kept only when
`matchSealed` lands on that product; `scripts/fetch-amazon-prices.ts` (first in every build) fetches those prices into the
git-ignored `data/amazon-live/`; `lib/amazon-live.ts` gives the card page its Amazon row's link and 24-hour price. Prices
are never committed, never a sort, cheapest, deal, feed or quick view. Credentials `AMAZON_CREATORS_AU_*` (GitHub + Vercel)
serve every store; a store without API access is skipped. `tests/amazon-api.test.ts`; the ops monitor reads the status.

## Matching

`src/lib/import/match.ts`: a wrong match is worse than none. Every card match
needs the number AND the name (or an exact name inside a named set); ties are
no match; foreign-language products are never matched; a store price under a
quarter or over four times TCGplayer's is dropped. Add a test in
`tests/match.test.ts` for every new title format.

## The site watches itself

`ops-monitor.yml` runs `scripts/ops-monitor.ts` every three hours; a failing
check fails the run, and GitHub emails the owner. When you add a scheduled job,
external API or anything with a limit, add a check there.

## Checks

```
npm run typecheck
npm run lint
npm test
```

Record non-obvious decisions in `DECISIONS.md` (newest at the bottom).
