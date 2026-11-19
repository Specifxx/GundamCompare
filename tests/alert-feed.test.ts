import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { lowestByMarket } from "../src/lib/alert-feed";
import { parseAmount, suggestTarget, ALERT_SERVICE } from "../src/components/PriceAlertForm";
import type { Offer } from "../src/lib/site-types";

// Price alerts through RiftCompare's shared service (DECISIONS.md, 2026-11-02).

const o = (x: Partial<Offer>): Offer => ({ source: "store", market: "US", currency: "USD", cents: 1000, inStock: true, url: "", title: "", ...x });

test("the feed's price is the lowest in-stock non-eBay offer per market, never converted", () => {
  const p = lowestByMarket([
    o({ cents: 900, source: "ebay" }),
    o({ cents: 1200 }),
    o({ cents: 1100, source: "tcgplayer" }),
    o({ cents: 500, inStock: false }),
    o({ market: "UK", currency: "GBP", cents: 800 }),
  ]);
  assert.deepEqual(p, { US: 1100, UK: 800 });
});

test("the form posts only to the shared service and parses prices strictly", () => {
  assert.equal(ALERT_SERVICE, "https://riftcompare.com/api/sister-alerts");
  assert.equal(parseAmount("45"), 4500);
  assert.equal(parseAmount("£12,50"), 1250);
  assert.equal(parseAmount("1,299.99"), 129999);
  assert.equal(parseAmount("abc"), null);
  assert.equal(parseAmount("0"), null);
  assert.equal(suggestTarget(13999), 12500);
  const src = fs.readFileSync("src/components/PriceAlertForm.tsx", "utf8");
  assert.ok(!/localStorage|document\.cookie/.test(src), "the form remembers nothing about the visitor");
  assert.match(src, /JSON\.stringify\(\{ site, productId, region, email: [^}]*targetCents \}\)/, "only these fields are sent");
});

test("the feed route is static and keeps eBay out", () => {
  const route = fs.readFileSync("src/app/alert-feed.json/route.ts", "utf8");
  assert.match(route, /export const revalidate = 86400;/);
  assert.ok(!/headers\(\)|cookies\(\)|force-dynamic/.test(route));
});

test("the weekly price drops box is opt-in: unticked, and sent only as the visitor left it (2026-11-08)", () => {
  const src = fs.readFileSync("src/components/PriceAlertForm.tsx", "utf8");
  assert.match(src, /<input type="checkbox" name="weekly" style=\{\{ marginTop: 3 \}\} \/>/);
  assert.ok(!/defaultChecked|checked=/.test(src), "never pre-ticked");
  assert.match(src, /const weekly = f\.get\("weekly"\) === "on";/);
});

test("Gunpla kits are in the feed by their JAN, at their shops' lowest in-stock price, and the kit page asks for alerts (2026-11-19)", async () => {
  const { buildAlertFeed } = await import("../src/lib/alert-feed");
  const { kits, kitOffers, kitsOn } = await import("../src/lib/kits");
  const feed = buildAlertFeed(new Date("2026-11-19T00:00:00Z"));
  if (kitsOn()) {
    const k = kits().find((x) => kitOffers(x.jan).some((o) => o.inStock));
    if (k) {
      const item = feed.items[k.jan];
      assert.ok(item, "a kit with an in-stock shop is in the feed");
      assert.equal(item.u, `/kit/${k.slug}`);
      assert.deepEqual(item.p, lowestByMarket(kitOffers(k.jan)));
    }
  }
  const page = fs.readFileSync("src/app/kit/[slug]/page.tsx", "utf8");
  assert.match(page, /<PriceAlert site=\{SITE\.key\} productId=\{pid\} prices=\{alertPrices\} \/>/);
  assert.match(page, /const pid = Number\(k\.jan\);/, "the form sends the JAN the feed is keyed by");
  assert.match(page, /const alertPrices = lowestByMarket\(offers\);/, "shops only: never the eBay row");
});
