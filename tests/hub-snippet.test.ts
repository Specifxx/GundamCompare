import { test } from "node:test";
import assert from "node:assert/strict";
import { facetIndexSnippet, rarityHubSnippet } from "../src/lib/hub-snippet";

test("rarity hub: dearest real card leads, placeholder $9,999 skipped", () => {
  const s = rarityHubSnippet("Gundam Card Game", "Gundam", "LR++", [
    { name: "Wing Gundam", cents: 999900 },
    { name: "Phoenix Gundam (LR++)", cents: 109400 },
    { name: "Zaku", cents: 5000 },
    { name: "Unpriced", cents: null },
  ]);
  assert.equal(s.titles[0], "LR++ Gundam cards: Phoenix Gundam $1,094, 2 priced");
  assert.match(s.description, /^The most valuable LR\+\+ card is Phoenix Gundam at \$1,094\. All 2 priced/);
  assert.ok(!s.description.includes("9,999"));
});

test("rarity hub with nothing priced keeps the plain lines", () => {
  const s = rarityHubSnippet("Gundam Card Game", "Gundam", "Promo", [{ name: "A", cents: null }]);
  assert.equal(s.titles[0], "Promo Gundam card prices, most valuable first");
  assert.match(s.description, /^All 1 Promo/);
});

test("facet index: values by size in the title, each one's dearest card in the description", () => {
  const s = facetIndexSnippet("Gundam Card Game", "Gundam", ["card type", "card types"], [
    { label: "Pilot", count: 50, items: [{ name: "Amuro", cents: 2000 }] },
    { label: "Unit", count: 300, items: [{ name: "Wing", cents: 999900 }, { name: "Phoenix", cents: 109400 }] },
    { label: "Base", count: 10, items: [{ name: "Corsica", cents: null }] },
  ]);
  assert.equal(s.titles[0], "Gundam cards by card type: Unit, Pilot, Base prices");
  assert.ok(s.titles.includes("Gundam cards by card type: top card $1,094"));
  assert.match(s.description, /card type: Unit: Phoenix \$1,094; Pilot: Amuro \$20\.00\. All 3 card types/);
  assert.ok(!s.description.includes("9,999"));
});
