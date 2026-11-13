// What delivery costs at each kit shop (r/Gunpla, 2026-11-11, the two top comments: "Delivery matters massively…
// free delivery over X", "A cheapest delivered would be very nice").
//
// scripts/kit-shipping.ts asks each Shopify kit shop's own cart for its delivery rates once a week (one HG-size
// kit to one address per market, then bigger baskets until delivery turns free) and writes
// data/public/kit-shipping.json. It is a quote for that address, that day and a small box, so every place that
// shows it says where to and when, and that a bigger box can cost more. Item prices stay the sort order and the
// "Best price" everywhere; delivery is shown beside them and added up only in the one line that says so.
// Client-safe: no node imports. Ported from KaeYoung's lib/shipping.ts.
import type { Market, Offer } from "./site-types";

export interface StoreShipping {
  /** the day we asked, YYYY-MM-DD */
  at: string;
  /** where to, for the label: "Sydney" */
  to: string;
  /** cheapest delivery rate for one small kit, minor units (0: always free) */
  fee: number;
  /** smallest basket total we saw delivered free (null: none up to maxTested) */
  freeFrom: number | null;
  /** largest basket total we saw still charged */
  paidAt: number;
  /** the biggest basket we tried */
  maxTested: number;
}

export type KitShippingData = Record<string, StoreShipping>;

/** A small-order fee over this (40 units of the shop's currency) is a zone the shop doesn't really serve, never
 *  shown or kept. */
export const MAX_SMALL_ORDER_FEE = 4000;

/** Where each market's quote is for. */
export const DESTINATIONS: Record<Market, { city: string; country: string; province: string; zip: string }> = {
  US: { city: "New York", country: "United States", province: "New York", zip: "10001" },
  UK: { city: "London", country: "United Kingdom", province: "", zip: "SW1A 1AA" },
  CA: { city: "Toronto", country: "Canada", province: "Ontario", zip: "M5V 2T6" },
  AU: { city: "Sydney", country: "Australia", province: "New South Wales", zip: "2000" },
  EU: { city: "Berlin", country: "Germany", province: "", zip: "10115" },
  SG: { city: "Singapore", country: "Singapore", province: "", zip: "018956" },
};

/** Delivery for an order of this total, minor units: 0 when free, the fee when charged, null when the total falls
 *  between what we saw charged and what we saw free (the threshold is somewhere in there). */
export function deliveryFor(s: StoreShipping | undefined, total: number): number | null {
  if (!s) return null;
  if (s.fee === 0) return 0;
  if (s.freeFrom != null && s.paidAt >= s.freeFrom) {
    if (total < s.freeFrom) return s.fee;
    return total > s.paidAt ? 0 : null;
  }
  if (s.freeFrom != null && total >= s.freeFrom) return 0;
  if (total <= s.paidAt || s.freeFrom == null) return s.fee;
  return null;
}

/** "free from A$150": the smallest basket we saw go free, rounded up to a whole unit. */
export function freeLine(s: StoreShipping, money: (minor: number) => string): string | null {
  if (s.fee === 0) return "free delivery";
  if (s.freeFrom == null) return null;
  return `free from ${money(Math.ceil(s.freeFrom / 100) * 100).replace(/\.00$/, "")}`;
}

/** A store row's delivery note for one kit at this price. */
export function deliveryNote(s: StoreShipping | undefined, price: number, money: (minor: number) => string): string | null {
  if (!s) return null;
  if (s.fee === 0) return `Free delivery to ${s.to}`;
  const d = deliveryFor(s, price);
  const free = freeLine(s, money);
  if (d === 0) return `Free delivery to ${s.to}`;
  if (d == null) return `Delivery to ${s.to}: ${money(s.fee)} or free (${free})`;
  return `+${money(d)} delivery to ${s.to}${free ? ` (${free})` : ""}`;
}

export interface Delivered {
  offer: Offer;
  /** delivery, minor units */
  fee: number;
  /** item + delivery */
  total: number;
  to: string;
  /** shops in this market with a quote and the kit in stock */
  quoted: number;
  /** shops in this market with the kit in stock */
  of: number;
}

/**
 * The cheapest in-stock shop offer in one market once each shop's quoted delivery is added. Only shop rows (never
 * eBay, Amazon or TCGplayer), only shops whose quote gives a figure for this price, and only when at least two
 * shops can be compared that way: one quoted shop is not a comparison.
 */
export function cheapestDelivered(offers: Offer[], market: Market, quotes: KitShippingData | null | undefined): Delivered | null {
  if (!quotes) return null;
  const shops = offers.filter((o) => o.market === market && o.inStock && o.source !== "ebay" && o.source !== "tcgplayer" && o.source !== "amazon");
  const priced = shops
    .map((offer) => ({ offer, fee: deliveryFor(quotes[offer.source], offer.cents), to: quotes[offer.source]?.to ?? "" }))
    .filter((x): x is { offer: Offer; fee: number; to: string } => x.fee != null);
  if (priced.length < 2) return null;
  const best = priced.map((x) => ({ ...x, total: x.offer.cents + x.fee })).sort((a, b) => a.total - b.total || a.offer.cents - b.offer.cents)[0];
  return { ...best, quoted: priced.length, of: new Set(shops.map((o) => o.source)).size };
}
