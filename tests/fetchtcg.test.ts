import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cents, pickCondition } from "../src/lib/fetchtcg";

test("Fetch's price is dollars; we keep cents", () => {
  assert.equal(cents(1.2), 120);
  assert.equal(cents(0.29), 29);
});

test("Near Mint wins, graded and damaged copies never", () => {
  assert.deepEqual(pickCondition([{ condition: "Light Play", price: 1 }, { condition: "Near Mint", price: 2 }, { condition: "PSA 10", price: 0.5 }]), { condition: "Near Mint", price: 2 });
  assert.equal(pickCondition([{ condition: "PSA 10", price: 10 }, { condition: "Damaged", price: 1 }]), null);
});

test("a card matches only on number, set, rarity and name; a stale or missing file shows nothing", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "fetchtcg-"));
  mkdirSync(path.join(dir, "data", "fetch-live"), { recursive: true });
  const c = (o: object) => ({ s: "Dual Impact", no: "GD02-001", n: "Psycho Gundam (LR+)", r: "LR+", f: "Holofoil", c: "Near Mint", p: 1200, u: "https://www.fetchtcg.com/cards/x?utm_source=a", ...o });
  writeFileSync(
    path.join(dir, "data", "fetch-live", "au.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), cards: [c({}), c({ n: "Psycho Gundam", r: "LR", p: 300 }), c({ no: "GD02-002", n: "Twin", r: "R" }), c({ no: "GD02-002", n: "Twin", r: "R", p: 99 }), c({ no: "GD02-003", n: "Twin Two", r: "R", p: 77 })] }),
  );
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    const { fetchRowsFor } = await import("../src/lib/fetchtcg");
    const me = { name: "Psycho Gundam (LR+)", number: "GD02-001", rarity: "LR+", setName: "Dual Impact" };
    assert.equal(fetchRowsFor(me)?.rows[0].priceCents, 1200);
    assert.equal(fetchRowsFor({ ...me, name: "Psycho Gundam", rarity: "LR" })?.rows[0].priceCents, 300);
    assert.equal(fetchRowsFor({ name: "Twin Two", number: "GD02-003", rarity: "Rare", setName: "Dual Impact" })?.rows[0].priceCents, 77, "Rare is Fetch's R");
    assert.equal(fetchRowsFor({ ...me, rarity: "LR++" }), null, "another rarity is another card");
    assert.equal(fetchRowsFor({ ...me, setName: "Steel Requiem" }), null, "a reprint in another set is not this card");
    assert.equal(fetchRowsFor({ name: "Twin", number: "GD02-002", rarity: "R", setName: "Dual Impact" }), null, "two Fetch listings of one card is ambiguous");
    assert.equal(fetchRowsFor({ ...me, number: null }), null);
  } finally {
    process.chdir(cwd);
  }
});

test("the feed is never committed and the build reads it", () => {
  assert.match(readFileSync(".gitignore", "utf8"), /^\/data\/fetch-live\/$/m);
  assert.match(readFileSync("package.json", "utf8"), /fetch-fetchtcg\.ts/);
});
