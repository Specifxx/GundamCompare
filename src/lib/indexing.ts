// Which card pages ask to be indexed, and how long a price in JSON-LD is good for.
//
// Zero-data rule (Gemini SEO research, 2026-11-04; Google's scaled-content and
// soft-404 guidance): a programmatic page with nothing of its own, no TCGplayer
// reference price and no store or eBay listing, is a template with a name in it.
// It stays reachable (noindex, follow: crawlers still walk its links) but out of
// the index, so the thin long tail does not drag the rest of the domain down.
// Cards in an upcoming set are kept: they have no price yet because the set is
// not out, and reveal-week searches are exactly when people look for them.
// Nothing is deleted and no URL changes (owner, 2026-11-03: narrow, never delete).
export function cardIndexable(p: { kind: "card" | "sealed"; sealedType: string | null }, refCents: number | null, offerCount: number, set: { upcoming: boolean } | null | undefined): boolean {
  if (p.sealedType === "Insert") return false; // pack inserts, as before (DECISIONS.md, 2026-10-28)
  if (set?.upcoming) return true;
  return refCents != null || offerCount > 0;
}

/**
 * The stricter rule after the November 2026 core update (2026-11-19): 1,429 card pages asked to be indexed and Search Console
 * showed people finding 78 of them in 56 days; the long tail of US$1-5 singles with one listing read as a template to Google.
 * A single now asks to be indexed when it is in an upcoming set, when search already finds it, or when it is worth
 * CARD_INDEX_MIN_CENTS+ on TCGplayer AND a store sells it (≈695 pages). Sealed products keep the zero-data rule. The rest stay
 * live, linked, noindex, follow. DECISIONS.md, 2026-11-19.
 */
export const CARD_INDEX_MIN_CENTS = 500;
export function cardAsksIndex(
  p: { kind: "card" | "sealed"; sealedType: string | null },
  refCents: number | null,
  offerCount: number,
  storeCount: number,
  set: { upcoming: boolean } | null | undefined,
  found: boolean,
): boolean {
  if (!cardIndexable(p, refCents, offerCount, set)) return false;
  if (p.kind === "sealed" || set?.upcoming || found) return true;
  return (refCents ?? 0) >= CARD_INDEX_MIN_CENTS && storeCount > 0;
}

/** Store prices refresh on the daily import, so a price in JSON-LD is good until tomorrow (schema.org priceValidUntil, YYYY-MM-DD). */
export function priceValidUntil(now = Date.now()): string {
  return new Date(now + 86400e3).toISOString().slice(0, 10);
}

// Kit pages (SITE.kits, 2026-11-14). The same zero-data rule, measured on the 2026-11-13 data: 1,025 of 2,328 kit pages
// had no shop with the kit in stock, but every one of them still showed two or more shop rows with the shop's own price
// (sold out, linked), because the import keeps a kit only while two shops list it. That is buying information (the price
// to expect, where to watch for a restock), and 104 of those pages had Search Console impressions, so they stay indexed.
// Only a kit page with no price from anywhere (no shop listing at any stock state, no eBay row) is a template with a
// name in it: noindex, follow, out of the sitemap, URL kept.
export function kitIndexable(shopOffers: readonly { cents: number }[], ebayRows: number): boolean {
  return shopOffers.some((o) => o.cents > 0) || ebayRows > 0;
}

// 2026-11-19 (core update): 2,330 kit pages asked to be indexed and Search Console showed people finding 5. A kit now asks to be
// indexed when two shops have it in stock (a real comparison today) or search already finds its page (≈938 pages).
export const KIT_INDEX_MIN_IN_STOCK = 2;
export function kitAsksIndex(priced: boolean, inStockShops: number, found: boolean): boolean {
  return priced && (inStockShops >= KIT_INDEX_MIN_IN_STOCK || found);
}
