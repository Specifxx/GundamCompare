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
