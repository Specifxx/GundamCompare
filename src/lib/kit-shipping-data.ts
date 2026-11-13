// data/public/kit-shipping.json, read once per server instance (lib/kit-shipping.ts says what it is).
import fs from "node:fs";
import path from "node:path";
import { MAX_SMALL_ORDER_FEE, type KitShippingData } from "./kit-shipping";

export const KIT_SHIPPING_FILE = path.join(process.cwd(), "data", "public", "kit-shipping.json");
/** A quote older than this is not shown (the weekly job keeps a failed shop's quote for five weeks). */
export const QUOTE_MAX_DAYS = 45;

let cache: KitShippingData | null = null;

export function kitShipping(now = Date.now()): KitShippingData {
  if (cache) return cache;
  let raw: KitShippingData = {};
  try {
    raw = JSON.parse(fs.readFileSync(KIT_SHIPPING_FILE, "utf8")) as KitShippingData;
  } catch {
    /* no quotes yet: the pages simply show none */
  }
  cache = freshQuotes(raw, now);
  return cache;
}

export function freshQuotes(raw: KitShippingData, now: number): KitShippingData {
  return Object.fromEntries(Object.entries(raw).filter(([, q]) => q.fee <= MAX_SMALL_ORDER_FEE && (now - Date.parse(q.at)) / 86_400_000 <= QUOTE_MAX_DAYS));
}

/** The ops monitor's reading of the weekly quotes (scripts/ops-monitor.ts): amber when the newest is over ten days old (a weekly job missed) or fewer
 *  than a third of the Shopify kit shops have one. */
export function judgeKitShipping(raw: Record<string, { at: string }>, shops: number, now = Date.now()): { status: "ok" | "warn"; detail: string } {
  const days = Object.values(raw).map((q) => (now - Date.parse(q.at)) / 86_400_000);
  const n = days.length;
  if (!n) return { status: "warn", detail: "no kit shop has a delivery quote: check the Kit delivery quotes workflow" };
  const newest = Math.min(...days);
  if (newest > 10) return { status: "warn", detail: `the newest delivery quote is ${newest.toFixed(0)} days old: the weekly Kit delivery quotes workflow has not run` };
  if (n < shops / 3) return { status: "warn", detail: `only ${n} of ${shops} Shopify kit shops have a delivery quote` };
  return { status: "ok", detail: `${n} of ${shops} Shopify kit shops quoted, newest ${newest.toFixed(0)} days old` };
}
