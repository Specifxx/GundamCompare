// Delivery quotes for the kit shops (r/Gunpla, 2026-11-11; DECISIONS.md 2026-11-13).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { cheapestDelivered, deliveryFor, deliveryNote, type KitShippingData, type StoreShipping } from "@/lib/kit-shipping";
import { freshQuotes, judgeKitShipping } from "@/lib/kit-shipping-data";
import { KIT_BAND, pickKits } from "../scripts/kit-shipping";
import type { Offer } from "@/lib/site-types";

const aud = (c: number) => `A$${(c / 100).toFixed(2)}`;
const q = (over: Partial<StoreShipping>): StoreShipping => ({ at: "2026-11-13", to: "Sydney", fee: 995, freeFrom: 15000, paidAt: 14200, maxTested: 15000, ...over });
const offer = (source: string, cents: number, over: Partial<Offer> = {}): Offer => ({ source, market: "AU", currency: "AUD", cents, inStock: true, url: `https://${source}.example/p`, title: "", ...over });

test("a shop's quote for one kit: the fee under its free threshold, free over it, unknown in between", () => {
  assert.equal(deliveryFor(q({}), 4499), 995);
  assert.equal(deliveryFor(q({}), 15000), 0);
  assert.equal(deliveryFor(q({}), 14600), null);
  assert.equal(deliveryFor(q({ fee: 0 }), 500), 0);
  assert.equal(deliveryFor(q({ freeFrom: null, paidAt: 30000 }), 20000), 995);
  assert.equal(deliveryFor(undefined, 4499), null);
  assert.equal(deliveryNote(q({}), 4499, aud), "+A$9.95 delivery to Sydney (free from A$150)");
  assert.equal(deliveryNote(q({}), 16000, aud), "Free delivery to Sydney");
  assert.equal(deliveryNote(q({ fee: 0 }), 4499, aud), "Free delivery to Sydney");
  assert.equal(deliveryNote(undefined, 4499, aud), null);
});

test("cheapest delivered: shops only, in stock, this market, two quoted shops at least", () => {
  const quotes: KitShippingData = { a: q({ fee: 1500 }), b: q({ fee: 0 }), c: q({ fee: 500 }) };
  const offers = [offer("ebay", 3000), offer("a", 4000), offer("b", 4900), offer("c", 4600), offer("d", 3900), offer("us", 100, { market: "US", currency: "USD" }), offer("out", 100, { inStock: false })];
  const d = cheapestDelivered(offers, "AU", { ...quotes, out: q({ fee: 0 }), us: q({ fee: 0 }) });
  // a: 55.00, b: 49.00, c: 51.00; d has no quote and eBay is not a shop.
  assert.equal(d?.offer.source, "b");
  assert.equal(d?.total, 4900);
  assert.equal(d?.fee, 0);
  assert.deepEqual([d?.quoted, d?.of], [3, 4]);
  // One quoted shop is not a comparison; no quotes, no line.
  assert.equal(cheapestDelivered([offer("a", 4000), offer("d", 3900)], "AU", quotes), null);
  assert.equal(cheapestDelivered(offers, "AU", null), null);
  // A price inside the unknown band of a shop's threshold is left out of the sum.
  assert.equal(cheapestDelivered([offer("a", 14600), offer("d", 5000), offer("e", 5200)], "AU", { a: q({}), d: q({}), e: q({ fee: 0 }) })?.offer.source, "e");
  assert.equal(cheapestDelivered([offer("a", 14600), offer("d", 5000)], "AU", { a: q({}), d: q({}) }), null);
});

test("the quote is taken with an in-stock, HG-size kit, never a tool, a pre-order or a huge box", () => {
  const v = (id: number, price: string, available = true) => ({ id, price, available });
  const picked = pickKits([
    { title: "HG 1/144 Gundam Aerial", variants: [v(1, "32.00")] },
    { title: "Gundam Marker Black", variants: [v(2, "7.99")] },
    { title: "PG 1/60 Unicorn Gundam", variants: [v(3, "389.00")] },
    { title: "(Pre-Order) HG 1/144 Gundam Helix", variants: [v(4, "44.99")] },
    { title: "MG 1/100 Sazabi Ver.Ka", variants: [v(5, "69.99", false)] },
    { title: "SD Gundam EX-Standard Strike", variants: [v(6, "16.00")] },
  ]);
  assert.deepEqual(picked.map((x) => x.id), [6, 1]);
  assert.deepEqual([...KIT_BAND], [1500, 7000]);
});

test("old or implausible quotes are not shown, and the ops monitor notices a missed week", () => {
  const now = Date.parse("2026-12-20T00:00:00Z");
  const kept = freshQuotes({ a: q({ at: "2026-12-13" }), old: q({ at: "2026-10-01" }), heavy: q({ at: "2026-12-13", fee: 9000 }) }, now);
  assert.deepEqual(Object.keys(kept), ["a"]);
  assert.equal(judgeKitShipping({ a: { at: "2026-12-13" }, b: { at: "2026-12-13" } }, 4, now).status, "ok");
  assert.equal(judgeKitShipping({ a: { at: "2026-12-01" } }, 2, now).status, "warn");
  assert.equal(judgeKitShipping({ a: { at: "2026-12-13" } }, 30, now).status, "warn");
  assert.equal(judgeKitShipping({}, 30, now).status, "warn");
});

test("delivery never decides the order or the best price, and only kit pages pass it", () => {
  const rows = fs.readFileSync("src/lib/price-rows.ts", "utf8");
  assert.ok(!/kit-shipping|delivery/i.test(rows), "lib/price-rows.ts must not read delivery");
  const table = fs.readFileSync("src/components/PriceTable.tsx", "utf8");
  assert.match(table, /data-cheapest-delivered/);
  assert.match(table, /data-delivery-note/);
  const users = ["src/app", "src/components"].flatMap((d) => (fs.readdirSync(d, { recursive: true }) as string[]).map((f) => `${d}/${f}`)).filter((f) => /\.tsx?$/.test(f) && /delivery=\{/.test(fs.readFileSync(f, "utf8")));
  assert.deepEqual(users, ["src/app/kit/[slug]/page.tsx"]);
  // The weekly data commit never carries a deploy marker in its subject.
  const wf = fs.readFileSync(".github/workflows/kit-shipping.yml", "utf8");
  assert.ok(!/git commit -m "[^"]*\[deploy\]/.test(wf));
});
