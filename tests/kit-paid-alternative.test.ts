// Kit pages: Amazon's own listing (matched by JAN) is a paid alternative under the cheapest shop too (2026-11-10).
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

test("the kit page hands its Amazon cells to the top buy block, which quotes Amazon only fresh, in band and in the same currency", () => {
  assert.match(fs.readFileSync("src/app/kit/[slug]/page.tsx", "utf8"), /<CardTopBuy [^>]*amazon=\{amazon\}/);
  const s = fs.readFileSync("src/components/CardBuy.tsx", "utf8");
  assert.match(s, /AMAZON_MAX_AGE_MS = 24 \* 3600_000/);
  assert.match(s, /live\.currency === best\.currency/);
  assert.match(s, /live\.cents <= best\.cents \* PAID_ALTERNATIVE_BAND/);
  assert.match(s, /"card_top_alt"/);
  assert.ok(!/from "@\/lib\/amazon-live"/.test(s.replace(/import type [^\n]*\n/g, "")), "the client block never imports the server reader");
});
