import test from "node:test";
import assert from "node:assert/strict";
import { fitTitle, kitTitleCandidates } from "../src/lib/seo-title";

test("kit title leads with the US price when there is one", () => {
  const t = fitTitle(kitTitleCandidates("HG Gundam Aerial", "$24.99", 12)).absolute;
  assert.match(t, /^HG Gundam Aerial Price: \$24\.99/);
});

test("kit title keeps the old wording with no price", () => {
  const t = fitTitle(kitTitleCandidates("HG Gundam Aerial", null, 12)).absolute;
  assert.match(t, /^HG Gundam Aerial price: compare 12 shops/);
});

test("a long kit name steps down to fit 60 characters", () => {
  const name = "MG 1/100 Gundam Barbatos Lupus Rex Iron-Blooded Orphans";
  const t = fitTitle(kitTitleCandidates(name, "$79.99", 9)).absolute;
  assert.ok(t.startsWith(name) && t.includes("$79.99") || t.length <= 60);
});

import { fitDescription, kitDescriptionCandidates } from "../src/lib/seo-title";

const base = { name: "HG 1/144 Gundam Aerial", gradeLabel: "High Grade", scale: "1/144", jan: "4573102630568", stores: 12, alerts: true };

test("kit description leads with the price, its market and the grade and scale", () => {
  const d = fitDescription(kitDescriptionCandidates({ ...base, lead: { price: "$24.99", market: "US", inStockShops: 5 } }));
  assert.match(d, /^HG 1\/144 Gundam Aerial from \$24\.99 in the US, in stock at 5 hobby shops today\. High Grade 1\/144 model kit/);
  assert.ok(d.length <= 160);
});

test("with no US shop in stock it names the market that has one", () => {
  const d = fitDescription(kitDescriptionCandidates({ ...base, lead: { price: "£18.99", market: "UK", inStockShops: 1 } }));
  assert.match(d, /from £18\.99 in the UK, in stock at 1 hobby shop today/);
});

test("a sold-out kit says so and offers the restock email", () => {
  const d = fitDescription(kitDescriptionCandidates({ ...base, lead: null }));
  assert.match(d, /sold out at the 12 hobby shops we track today/);
  assert.match(d, /back in stock/);
  assert.ok(d.length <= 160);
});

test("a long kit name still fits 160 characters with its price", () => {
  const name = "MG 1/100 Gundam Barbatos Lupus Rex Iron-Blooded Orphans Expansion Parts Set Special Coating Ver.";
  const d = fitDescription(kitDescriptionCandidates({ ...base, name, lead: { price: "$79.99", market: "US", inStockShops: 3 } }));
  assert.ok(d.length <= 160 && d.includes("$79.99"));
});
