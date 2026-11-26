import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE } from "@/site.config";
import { DESCRIPTION_MAX, TITLE_MAX, cardDescriptionCandidates, cardTitleCandidates, fitDescription, fitTitle, setTitleCandidates } from "@/lib/seo-title";

test("fitTitle keeps the brand when it fits and drops it before the words", () => {
  assert.equal(fitTitle(["Short"]).absolute, `Short | ${SITE.name}`);
  const long = "x".repeat(TITLE_MAX - 2);
  assert.equal(fitTitle([long]).absolute, long);
  assert.equal(fitTitle(["y".repeat(80), "z".repeat(10)]).absolute, `${"z".repeat(10)} | ${SITE.name}`);
  // A more specific candidate beats the brand.
  assert.equal(fitTitle([long, "short"]).absolute, long);
});

test("a card's number appears once", () => {
  assert.match(cardTitleCandidates("Jagd Doga (GD05-057)", "GD05-057", "Set", false)[0], /^Jagd Doga GD05-057 Price/);
});

test("every title fits in 60 characters when any candidate does", () => {
  const set = fitTitle(setTitleCandidates("A Very Long Expansion Name Indeed", 214)).absolute;
  assert.ok(set.length <= TITLE_MAX, set);
  assert.match(set, /Card List/);
  const card = fitTitle(cardTitleCandidates("Some Card", "AB01-001", "First Set", false)).absolute;
  assert.ok(card.length <= TITLE_MAX, card);
  assert.match(card, /^Some Card AB01-001 Price/);
});

test("a set page leads with the card list and its count", () => {
  assert.match(setTitleCandidates("First Set", 120)[0], /Card List: All 120 Cards \+ Prices$/);
  assert.ok(!setTitleCandidates("First Set", 0).some((t) => t.includes("All 0")));
});

test("llms.txt lists the main sections and every guide", async () => {
  const { GET } = await import("../src/app/llms.txt/route");
  const body = await GET().text();
  assert.match(body, new RegExp(`^# ${SITE.name}`));
  assert.match(body, /\/sets\)/);
  assert.match(body, /## Guides/);
});

test("an unreleased set with revealed cards is titled for the spoiler search, inside the limit", () => {
  const t = fitTitle(setTitleCandidates("First Set", 48, true)).absolute;
  assert.match(t, /Spoilers: 48 Cards Revealed/);
  assert.ok(t.length <= TITLE_MAX + 20);
  assert.match(setTitleCandidates("First Set", 0, true)[0], /Card List/);
});

test("a card's title leads with today's price when it has one, and still fits", () => {
  const t = fitTitle(cardTitleCandidates("ZZ Gundam (LR+)", "GD06-033", "Stardust Trails", false, "$76.28")).absolute;
  assert.match(t, /^ZZ Gundam \(LR\+\) GD06-033 Price: \$76\.28/);
  assert.ok(t.length <= TITLE_MAX, t);
  assert.match(fitTitle(cardTitleCandidates("ZZ Gundam (LR+)", "GD06-033", "Stardust Trails", false)).absolute, /Price — /, "no price, the old title");
});

// 2026-11-24 (page scorecard, Job D): card snippets lead with the cheapest in-stock store price, US first, and say the rarity once.
test("card description leads with the store price and TCGplayer's market, rarity said once", () => {
  const d = fitDescription(
    cardDescriptionCandidates({ name: "Gundam Bael (LR+)", number: "GD06-034", setName: "Stardust Trails", rarity: "LR+", sealed: false, ref: "$22.69", lead: { price: "$24.25", market: "US", inStockStores: 1 }, stores: 9 }),
  );
  assert.ok(d.startsWith("Gundam Bael (LR+) GD06-034 from $24.25 in the US, in stock at 1 store; TCGplayer market $22.69."), d);
  assert.equal(d.match(/LR\+/g)?.length, 1, d);
  assert.ok(d.length <= DESCRIPTION_MAX);
  assert.doesNotMatch(d, /eBay/);
});

test("card description names the market when only another market has stock, and plurals stores", () => {
  const d = fitDescription(
    cardDescriptionCandidates({ name: "Familial Love", number: "GD06-110", setName: "Stardust Trails", rarity: "Rare", sealed: false, ref: "$1.36", lead: { price: "C$2.00", market: "CA", inStockStores: 4 }, stores: 6 }),
  );
  assert.ok(d.startsWith("Familial Love GD06-110 from C$2.00 in Canada, in stock at 4 stores;"), d);
  assert.match(d, /Stardust Trails, Rare/);
});

test("card description without stock gives the TCGplayer reference, without any price says so", () => {
  const sold = fitDescription(cardDescriptionCandidates({ name: "[EVX09] Special Booster Bundle 01", number: null, setName: "Promotional Cards", rarity: null, sealed: true, ref: "$468.33", lead: null, stores: 0 }));
  assert.ok(sold.startsWith("[EVX09] Special Booster Bundle 01 price: TCGplayer market $468.33."), sold);
  assert.match(sold, /Not in stock at any store we track yet/);
  const none = fitDescription(cardDescriptionCandidates({ name: "New Card", number: "GD07-001", setName: null, rarity: null, sealed: false, ref: null, lead: null, stores: 0 }));
  assert.match(none, /no TCGplayer market price yet/);
  for (const s of [sold, none]) assert.ok(s.length <= DESCRIPTION_MAX);
});

test("a sealed title names the game its set-led name leaves out, and the price outranks it", () => {
  const g = SITE.gameShort;
  const t = fitTitle(cardTitleCandidates("Stardust Trails Sleeved Booster Pack", null, "Stardust Trails", true, "$5.49")).absolute;
  assert.match(t, new RegExp(`^${g} Stardust Trails Sleeved Booster Pack Price: \\$5\\.49`));
  assert.ok(t.length <= TITLE_MAX, t);
  // Too long with the game word and the price: the price stays, the game word goes.
  const long = "Stardust Trails Sleeved Booster Pack Display";
  assert.match(fitTitle(cardTitleCandidates(long, null, "Stardust Trails", true, "$129.99")).absolute, /Price: \$129\.99/);
  // A name that already says the game is not doubled, and single cards are untouched.
  assert.ok(!cardTitleCandidates(`${g} Assemble Case`, null, null, true, "$9.00")[0].startsWith(`${g} ${g}`));
  assert.match(cardTitleCandidates("Some Card", "AB01-001", "First Set", false, "$1.00")[0], /^Some Card AB01-001/);
});
