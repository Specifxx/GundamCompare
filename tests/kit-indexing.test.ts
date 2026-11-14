// Kit pages (2026-11-14): a kit page is noindex and out of the sitemap only when nothing on it is priced. A sold-out
// shop row with its own price, or an eBay row, keeps it indexed. URLs, titles and canonicals never change.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { kitIndexable } from "@/lib/indexing";

const read = (p: string) => readFileSync(p, "utf8");

test("a kit with no price from anywhere is thin; any shop price (sold out too) or an eBay row is not", () => {
  assert.equal(kitIndexable([], 0), false);
  assert.equal(kitIndexable([{ cents: 0 }], 0), false);
  assert.equal(kitIndexable([{ cents: 2499 }], 0), true); // a sold-out shop row with its last price
  assert.equal(kitIndexable([], 1), true); // an eBay row alone
});

test("the kit page sets noindex,follow from kitIsIndexable and keeps its canonical; the sitemap filters by it", () => {
  const page = read("src/app/kit/[slug]/page.tsx");
  assert.match(page, /kitIsIndexable\(k\) \? \{\} : \{ robots: \{ index: false, follow: true \} \}/);
  assert.match(page, /canonical: `\/kit\/\$\{k\.slug\}`/);
  assert.doesNotMatch(page, /redirect\(|permanentRedirect\(/);
  // A Product with no offers is a Search Console error: drawn only when an in-stock US shop backs it.
  assert.match(page, /\{usOffers\.length > 0 && \(\s*<JsonLd/);
  assert.doesNotMatch(page, /offers: usOffers\.length\s*\?/);
  assert.match(read("src/app/sitemap.ts"), /kits\(\)\.filter\(kitIsIndexable\)\.map\(\(k\) => \(\{ url: `\$\{SITE_URL\}\/kit\//);
  assert.match(read("src/lib/kits.ts"), /kitIndexable\(kitOffers\(k\.jan\), kitEbayOffers\(k\.jan\)\.length\)/);
});
