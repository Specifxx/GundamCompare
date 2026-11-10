// eBay rows for Gunpla kit pages (GUN-1, 2026-11-10): the cheapest new, Buy It Now listing of the kit's own barcode,
// pinned first in the kit page's price table like a card page's eBay row.
//
// THE BUDGET. No new calls: the kits take `SITE.ebay.kitCalls` of this site's existing SITE.ebay.dailyBudget (1,150),
// and the card pass (scripts/import-all.ts, which runs first) stops that many short of it. The kit pass then spends what
// is left of the day's own count (data/state/ebay-usage.json), so any calls the cards leave unused go to kits too.
//
// WHAT GETS A CALL (planKitEbay, pure and tested): each kit in each eBay market where a hobby shop we track sells it
// (that shop's price is the reference; no reference, no search). Kits people find through Google (the demand branch's
// gsc-pages.json) are refreshed daily, the rest every three days; the most overdue first, weighted by search
// impressions and the number of shops stocking it (how popular the kit is), the US before other markets.
//
// MATCHING. eBay's own product identifier: the search is by GTIN (the JAN on the box), New condition, and the price must
// sit in 60–300% of the market's shop median. Titles that read used, built, painted, a bootleg or a lot are refused.
// The row is display only: never a shop, a "cheapest" claim in prose, structured data, tiles, an alert or the feed.
import { SITE } from "@/site.config";
import { CURRENCY, type Kit, type Market, type Offer } from "@/lib/site-types";
import { endUserContext, MARKETPLACE, type ItemSummary } from "./ebay";

/** Searches are made in this order; a quota stop cuts the later markets first. */
export const KIT_EBAY_MARKETS: Market[] = ["US", "UK", "AU", "CA"];
export const KIT_WINDOW = { min: 0.6, max: 3 };
/** Hours between refreshes: kits with search demand, and the rest. */
export const KIT_INTERVAL_H = { demand: 24, rest: 72 };
/** A saved result older than this is dropped rather than shown. */
export const KIT_STALE_H = 24 * 7;

export interface KitEbayEntry {
  at: string;
  offer: Offer | null;
}
/** jan → market → last result */
export type KitEbayState = Record<string, Partial<Record<Market, KitEbayEntry>>>;

export interface KitCall {
  kit: Kit;
  market: Market;
  refCents: number;
}

/** The median in-stock shop price of a kit in one market, in that market's currency, or null. */
export function kitReference(offers: Offer[], market: Market): number | null {
  const xs = offers
    .filter((o) => o.source !== "ebay" && o.market === market && o.inStock && o.currency === CURRENCY[market])
    .map((o) => o.cents)
    .sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : Math.round((xs[mid - 1] + xs[mid]) / 2);
}

/** Kit slugs → Search Console impressions (56 days), from gsc-pages.json's `pages`. */
export function kitDemand(pages: Record<string, number[]>): Map<string, number> {
  const out = new Map<string, number>();
  for (const [p, [clicks = 0, impressions = 0]] of Object.entries(pages)) {
    const m = /^\/kit\/([^/]+)$/.exec(p);
    if (m && (clicks > 0 || impressions > 0)) out.set(decodeURIComponent(m[1]), impressions + clicks * 10);
  }
  return out;
}

export function planKitEbay(input: {
  kits: Kit[];
  offers: (jan: string) => Offer[];
  demand: Map<string, number>;
  state: KitEbayState;
  budget: number;
  now: Date;
}): { calls: KitCall[]; eligible: number } {
  const { kits, offers, demand, state, budget, now } = input;
  const cands: (KitCall & { rank: number; due: boolean; m: number })[] = [];
  for (const kit of kits) {
    const os = offers(kit.jan);
    const shops = new Set(os.filter((o) => o.inStock).map((o) => o.source)).size;
    const d = demand.get(kit.slug) ?? 0;
    const interval = d > 0 ? KIT_INTERVAL_H.demand : KIT_INTERVAL_H.rest;
    KIT_EBAY_MARKETS.forEach((market, m) => {
      const refCents = kitReference(os, market);
      if (refCents == null) return;
      const last = state[kit.jan]?.[market]?.at;
      const ageH = last ? (now.getTime() - new Date(last).getTime()) / 3_600_000 : interval * 2;
      const weight = 1 + d + shops;
      cands.push({ kit, market, refCents, m, due: ageH >= interval, rank: (ageH / interval) * weight });
    });
  }
  const eligible = cands.length;
  const due = cands.filter((c) => c.due).sort((a, b) => a.m - b.m || b.rank - a.rank || a.kit.jan.localeCompare(b.kit.jan));
  return { calls: due.slice(0, Math.max(0, budget)).map(({ kit, market, refCents }) => ({ kit, market, refCents })), eligible };
}

// Words that make a listing something other than a new, boxed kit. A word the kit's own name carries ("GM Custom",
// "Crossbone Gundam X1") never counts against it.
const JUNK =
  /\b(used|pre-?owned|opened|open box|built|assembled|painted|custom (?:build|built|painted)|bootleg|knock ?off|replica|no box|without box|box only|damaged|incomplete|missing|loose|repro(?:duction)?|lot of|lot|bundle|job lot|third party|3rd party|led unit|decals? only|instructions? only|manual only|runners? only|[2-9] ?x|x ?[2-9])\b/gi;

export function kitJunk(title: string, kitName: string): boolean {
  const own = kitName.toLowerCase();
  for (const m of title.matchAll(JUNK)) if (!own.includes(m[0].toLowerCase())) return true;
  return false;
}

/** The cheapest delivered listing (item + stated postage) from a local seller, inside the price window. */
export function pickKitBest(market: Market, refCents: number, kitName: string, items: ItemSummary[]): Offer | null {
  const mp = MARKETPLACE[market];
  if (!mp) return null;
  let best: Offer | null = null;
  for (const it of items) {
    if (!it.price || it.price.currency !== mp.currency) continue;
    if (it.itemLocation?.country && it.itemLocation.country !== mp.country) continue;
    if (it.condition && !/^new$/i.test(it.condition.trim())) continue;
    if (kitJunk(it.title, kitName)) continue;
    const ship = it.shippingOptions?.[0]?.shippingCost;
    if (!ship || ship.value == null || (ship.currency && ship.currency !== mp.currency)) continue;
    const shippingCents = Math.round(Number(ship.value) * 100);
    const cents = Math.round(Number(it.price.value) * 100);
    if (!Number.isFinite(shippingCents) || shippingCents < 0 || !Number.isFinite(cents) || cents <= 0) continue;
    if (cents < refCents * KIT_WINDOW.min || cents > refCents * KIT_WINDOW.max) continue;
    if (!best || cents + shippingCents < best.cents + (best.shippingCents ?? 0)) {
      best = { source: "ebay", market, currency: mp.currency, cents, shippingCents, inStock: true, url: it.itemAffiliateWebUrl || it.itemWebUrl, title: it.title };
    }
  }
  return best;
}

/** One Browse call: the kit's JAN as the GTIN, new, Buy It Now, a local seller, in the price window. */
export async function searchKit(token: string, c: KitCall): Promise<Offer | null> {
  const mp = MARKETPLACE[c.market];
  if (!mp) return null;
  const lo = Math.max(1, Math.floor((c.refCents * KIT_WINDOW.min) / 100));
  const hi = Math.ceil((c.refCents * KIT_WINDOW.max) / 100);
  const params = new URLSearchParams({
    gtin: c.kit.jan,
    filter: [
      "buyingOptions:{FIXED_PRICE}",
      "conditionIds:{1000}",
      `price:[${lo}..${hi}]`,
      `priceCurrency:${mp.currency}`,
      `itemLocationCountry:${mp.country}`,
      `deliveryCountry:${mp.country}`,
    ].join(","),
    sort: "price",
    limit: "25",
  });
  const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": mp.id,
      "X-EBAY-C-ENDUSERCTX": endUserContext(c.market, `${SITE.key}-kit-${c.kit.jan}`),
    },
  });
  if (res.status === 429) throw Object.assign(new Error("eBay quota exhausted (429)"), { quota: true });
  if (!res.ok) throw new Error(`eBay search ${res.status}`);
  const d = (await res.json()) as { itemSummaries?: ItemSummary[] };
  return pickKitBest(c.market, c.refCents, c.kit.name, d.itemSummaries ?? []);
}

/** kits.json's eBay rows: [market, cents, shippingCents, url]. */
export type KitEbayTuple = [Market, number, number, string];

/** Today's rows from the saved state: fresh, still inside today's window, for kits that still have a page. */
export function kitEbayRows(state: KitEbayState, kits: Kit[], offers: (jan: string) => Offer[], now: Date): Record<string, KitEbayTuple[]> {
  const out: Record<string, KitEbayTuple[]> = {};
  for (const k of kits) {
    const rows: KitEbayTuple[] = [];
    for (const market of KIT_EBAY_MARKETS) {
      const e = state[k.jan]?.[market];
      if (!e?.offer) continue;
      if (now.getTime() - new Date(e.at).getTime() > KIT_STALE_H * 3_600_000) continue;
      const ref = kitReference(offers(k.jan), market);
      if (ref == null || e.offer.cents < ref * KIT_WINDOW.min || e.offer.cents > ref * KIT_WINDOW.max) continue;
      rows.push([market, e.offer.cents, e.offer.shippingCents ?? 0, e.offer.url]);
    }
    if (rows.length) out[k.jan] = rows;
  }
  return out;
}
