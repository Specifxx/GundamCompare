import { test } from "node:test";
import assert from "node:assert/strict";
import { isPlaceholderMarket, setReadout, type ReadoutCard } from "../src/lib/set-readout";

const card = (name: string, cents: number | null, rarity: string | null = "R", inStock = false): ReadoutCard => ({ name, rarity, cents, inStock });

test("placeholder TCGplayer asks are not prices", () => {
  assert.equal(isPlaceholderMarket(99900), true);
  assert.equal(isPlaceholderMarket(999900), true);
  assert.equal(isPlaceholderMarket(9999900), true);
  assert.equal(isPlaceholderMarket(99800), false);
  assert.equal(isPlaceholderMarket(2684), false);
  assert.equal(isPlaceholderMarket(null), false);
});

test("a small set: value, lead cards, stock, and the top card for the snippet", () => {
  const r = setReadout("Eternal Nexus", [
    card("Phoenix Gundam (EX) (LR++)", 12000, "LR++", true),
    card("Hi-Nu Gundam (EX)", 4000, "LR+"),
    card("Psycho Zaku (EX)", 300, "R+", true),
    card("Wing Gundam (LR+)", 999900, "LR+"), // placeholder: unpriced
  ]);
  assert.match(r.about[0], /^3 of the 4 Eternal Nexus cards have a TCGplayer market price today, and one of each comes to \$163\.00\. The most valuable is Phoenix Gundam \(EX\) \(LR\+\+\) at \$120\.00, then Hi-Nu Gundam \(EX\) \(LR\+\) at \$40\.00 and Psycho Zaku/);
  assert.match(r.about.join(" "), /2 of the 4 cards are in stock/);
  assert.deepEqual(r.top, { label: "Phoenix Gundam (EX) (LR++)", cents: 12000 });
  assert.equal(r.totalCents, 16300);
  assert.match(r.facts!, /cheapest priced one is Psycho Zaku \(EX\) \(R\+\), at \$3\.00\./);
  assert.doesNotMatch(r.about.join(" ") + r.facts, /9,999/);
});

test("a big set: the top ten's share and the rarity that fills it", () => {
  const cards = [
    ...Array.from({ length: 6 }, (_, i) => card(`Chase ${i}`, 5000 + i * 100, "LR+")),
    ...Array.from({ length: 4 }, (_, i) => card(`Rare ${i}`, 1000 + i, "R")),
    ...Array.from({ length: 10 }, (_, i) => card(`Common ${i}`, 25, "C", true)),
  ];
  const r = setReadout("Stardust Trails", cards);
  assert.match(r.about[0], /^All 20 Stardust Trails cards .* The ten most valuable make up \d+% of that, led by Chase 5 \(LR\+\)/);
  assert.match(r.about[1], /10 of the priced cards are \$1\.00 or less/);
  assert.match(r.facts!, /6 of the ten most valuable are LR\+ cards\./);
});

test("nothing priced: nothing said", () => {
  const r = setReadout("New Set", [card("A", null), card("B", 99900)]);
  assert.deepEqual(r, { about: [], facts: null, top: null, totalCents: 0 });
});
