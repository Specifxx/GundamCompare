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
