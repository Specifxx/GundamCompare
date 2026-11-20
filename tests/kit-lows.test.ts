import { test } from "node:test";
import assert from "node:assert/strict";
import { recordKitLows } from "../src/lib/import/store-lows";
import type { Offer } from "../src/lib/site-types";

const o = (source: string, market: Offer["market"], cents: number, inStock = true, extra: Partial<Offer> = {}): Offer =>
  ({ source, market, currency: "USD", cents, inStock, url: "", title: "", ...extra }) as Offer;

test("recordKitLows keeps each market's cheapest in-stock shop price per kit, by JAN, shops only", () => {
  const next = recordKitLows({}, 100, [
    ["4573102725424", [o("a", "US", 3000), o("b", "US", 2500), o("c", "US", 1000, false), o("ebay", "US", 900), o("amazon", "US", 800), o("d", "AU", 4500)]],
    ["4573102000000", [o("a", "US", 2000, false)]],
  ]);
  assert.deepEqual(next, { "4573102725424": { US: [[100, 2500]], AU: [[100, 4500]] } });
});

test("recordKitLows records a sell-out as 0, adds only changes, and leaves kits missing from the run untouched", () => {
  const prev = { A: { US: [[100, 2500]] as [number, number][] }, B: { US: [[100, 1000]] as [number, number][] } };
  const next = recordKitLows(prev, 101, [["A", [o("a", "US", 2500)]]]);
  assert.deepEqual(next.A.US, [[100, 2500]]);
  assert.deepEqual(next.B, prev.B);
  const sold = recordKitLows(next, 102, [["A", [o("a", "US", 2500, false)]]]);
  assert.deepEqual(sold.A.US, [[100, 2500], [102, 0]]);
});
