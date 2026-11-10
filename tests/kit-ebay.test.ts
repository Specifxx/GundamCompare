import { test } from "node:test";
import assert from "node:assert/strict";
import type { Kit, Offer } from "@/lib/site-types";
import { kitDemand, kitEbayRows, kitJunk, kitReference, pickKitBest, planKitEbay, type KitEbayState } from "@/lib/import/kit-ebay";
import type { ItemSummary } from "@/lib/import/ebay";
import { SITE } from "@/site.config";

const kit = (jan: string, slug = jan, name = `Kit ${jan}`): Kit => ({ jan, slug, name, grade: "HG", scale: "1/144", image: null, firstSeen: "2026-10-01" });
const shop = (source: string, market: Offer["market"], cents: number, inStock = true): Offer => ({ source, market, currency: { US: "USD", UK: "GBP", AU: "AUD", CA: "CAD" }[market as "US"] ?? "USD", cents, inStock, url: "", title: "" });
const item = (title: string, price: string, ship: string | null = "5.00", extra: Partial<ItemSummary> = {}): ItemSummary => ({
  title,
  price: { value: price, currency: "USD" },
  shippingOptions: ship == null ? [] : [{ shippingCost: { value: ship, currency: "USD" } }],
  itemLocation: { country: "US" },
  itemWebUrl: `https://www.ebay.com/itm/${title.length}`,
  condition: "New",
  ...extra,
});
const now = new Date("2026-11-10T18:00:00Z");

test("the kit budget is carved out of the site's 1,150, never added to it", () => {
  assert.equal(SITE.ebay.dailyBudget, 1150);
  assert.ok((SITE.ebay.kitCalls ?? 0) > 0 && (SITE.ebay.kitCalls ?? 0) < SITE.ebay.dailyBudget);
});

test("reference: the median in-stock shop price in the market's own currency, never eBay", () => {
  const os = [shop("a", "US", 2000), shop("b", "US", 3000), shop("c", "US", 9000, false), { ...shop("ebay", "US", 100), source: "ebay" }, shop("d", "AU", 5000)];
  assert.equal(kitReference(os, "US"), 2500);
  assert.equal(kitReference(os, "AU"), 5000);
  assert.equal(kitReference(os, "UK"), null);
});

test("plan: only markets with a shop reference, US first, demand and popular kits first, within budget", () => {
  const kits = [kit("1"), kit("2", "hg-sazabi"), kit("3")];
  const offers: Record<string, Offer[]> = {
    "1": [shop("a", "US", 2000), shop("b", "US", 2100), shop("c", "US", 2200), shop("d", "AU", 4000)],
    "2": [shop("a", "US", 2000)],
    "3": [shop("a", "UK", 2000)],
  };
  const demand = new Map([["hg-sazabi", 30]]);
  const plan = planKitEbay({ kits, offers: (j) => offers[j] ?? [], demand, state: {}, budget: 3, now });
  assert.equal(plan.eligible, 4);
  assert.deepEqual(plan.calls.map((c) => `${c.kit.jan}:${c.market}`), ["2:US", "1:US", "3:UK"]);
  assert.equal(plan.calls[0].refCents, 2000);
});

test("plan: a kit searched recently waits its interval (24 h with demand, 72 h without)", () => {
  const kits = [kit("1"), kit("2", "hg-sazabi")];
  const offers = (_: string) => [shop("a", "US", 2000)];
  const at = new Date(now.getTime() - 30 * 3_600_000).toISOString();
  const state: KitEbayState = { "1": { US: { at, offer: null } }, "2": { US: { at, offer: null } } };
  const plan = planKitEbay({ kits, offers, demand: new Map([["hg-sazabi", 5]]), state, budget: 10, now });
  assert.deepEqual(plan.calls.map((c) => c.kit.jan), ["2"]);
});

test("pick: cheapest delivered, stated postage, new, local, inside 60–300% of the shop median", () => {
  const items = [
    item("HG 1/144 Sazabi Bandai", "30.00", "8.00"),
    item("HG 1/144 Sazabi Bandai new sealed", "33.00", "0.00"),
    item("HG 1/144 Sazabi no postage stated", "20.00", null),
    item("HG 1/144 Sazabi too cheap", "5.00"),
    item("HG 1/144 Sazabi used", "21.00", "0.00"),
    item("HG 1/144 Sazabi from abroad", "21.00", "0.00", { itemLocation: { country: "CN" } }),
    item("HG 1/144 Sazabi", "21.00", "0.00", { condition: "Used" }),
  ];
  const best = pickKitBest("US", 2500, "HG 1/144 Sazabi", items)!;
  assert.equal(best.cents, 3300);
  assert.equal(best.shippingCents, 0);
  assert.equal(best.source, "ebay");
});

test("junk words refuse a listing unless the kit's own name carries them", () => {
  assert.equal(kitJunk("HG GM Custom Bandai new", "HG 1/144 GM Custom"), false);
  assert.equal(kitJunk("Crossbone Gundam X1 Full Cloth HG", "HG 1/144 Crossbone Gundam X1 Full Cloth Ver. Gbf"), false);
  assert.equal(kitJunk("HG Sazabi built and painted", "HG 1/144 Sazabi"), true);
  assert.equal(kitJunk("HG Sazabi x2 lot", "HG 1/144 Sazabi"), true);
  assert.equal(kitJunk("Bandai HG Sazabi NO BOX", "HG 1/144 Sazabi"), true);
});

test("rows: fresh, in today's window, kits with a page only", () => {
  const kits = [kit("1"), kit("2")];
  const offers = (_: string) => [shop("a", "US", 2000)];
  const fresh = new Date(now.getTime() - 3_600_000).toISOString();
  const old = new Date(now.getTime() - 8 * 86_400_000).toISOString();
  const offer = (cents: number): Offer => ({ ...shop("ebay", "US", cents), source: "ebay", url: "https://ebay/x", shippingCents: 400 });
  const state: KitEbayState = { "1": { US: { at: fresh, offer: offer(2400) } }, "2": { US: { at: old, offer: offer(2400) } }, "9": { US: { at: fresh, offer: offer(2400) } } };
  assert.deepEqual(kitEbayRows(state, kits, offers, now), { "1": [["US", 2400, 400, "https://ebay/x"]] });
  const outside: KitEbayState = { "1": { US: { at: fresh, offer: offer(9000) } } };
  assert.deepEqual(kitEbayRows(outside, kits, offers, now), {});
});

test("demand: kit pages with clicks or impressions", () => {
  const d = kitDemand({ "/kit/hg-sazabi": [1, 6, 9], "/kit/none": [0, 0, 0], "/card/x": [3, 50, 2] });
  assert.deepEqual([...d], [["hg-sazabi", 16]]);
});
