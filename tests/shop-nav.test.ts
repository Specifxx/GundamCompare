import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { navGroups } from "@/lib/nav";
import { shopNav } from "@/lib/shop-nav";
import { attrFacets, rarityHubs, sealedHubs } from "@/lib/hubs";
import { gradeHubs, scaleHubs, SCALE_MIN } from "@/lib/kits";

// Navigation by the game's own dimensions (owner, 2026-11-09): the header dropdowns, the sidebar's shop groups and the phone menu
// read one list, built from the hubs that exist, so nothing links a page with no products.
test("every shop link is a hub that exists, and the sidebar lists every dropdown link", () => {
  const s = shopNav();
  const hubs = new Set<string>(["/cards", "/sets", "/sealed", "/preorders", "/kits"]);
  for (const f of attrFacets()) { hubs.add(`/cards/${f.cfg.facet}`); for (const h of f.hubs) hubs.add(`/cards/${f.cfg.facet}/${h.slug}`); }
  for (const h of rarityHubs()) hubs.add(`/cards/rarity/${h.slug}`);
  for (const h of sealedHubs()) hubs.add(`/sealed/${h.slug}`);
  for (const h of gradeHubs()) hubs.add(`/kits/grade/${h.slug}`);
  for (const h of scaleHubs()) hubs.add(`/kits/scale/${h.slug}`);
  const menu = [...s.menus.cards, ...s.menus.sealed, ...s.menus.kits].flatMap((g) => g.links);
  const rail = navGroups({ shop: s.groups }).flatMap((g) => g.links);
  for (const l of [...menu, ...s.groups.flatMap((g) => g.links)]) assert.ok(hubs.has(l.href) || /^\/sets\/[a-z0-9-]+$/.test(l.href), `${l.href} is not a hub`);
  const hrefs = rail.map((l) => l.href);
  for (const l of menu) assert.ok(hrefs.includes(l.href), `${l.href} is in a dropdown but not the sidebar`);
  assert.ok(s.groups.some((g) => /colour/i.test(g.title)), "the game's own dimension is in the sidebar");
  assert.ok(s.groups.some((g) => /grade/i.test(g.title)) && s.groups.some((g) => /scale/i.test(g.title)), "Gunpla grade and scale are in the sidebar");
});

test("a scale hub exists only with enough kits, and the header and phone menu read the same list", () => {
  for (const h of scaleHubs()) assert.ok(h.items.length >= SCALE_MIN, `${h.scale} is thin`);
  const header = readFileSync("src/components/Header.tsx", "utf8");
  assert.match(header, /shopNav\(\)/);
  assert.match(header, /<MobileMenu groups=\{groups\}/);
  assert.doesNotMatch(readFileSync("src/components/HeaderNav.tsx", "utf8"), /useState/);
});

test("the scale hubs are in the sitemap and the CDN rules", () => {
  assert.match(readFileSync("src/app/sitemap.ts", "utf8"), /kits\/scale/);
  assert.match(readFileSync("next.config.js", "utf8"), /"\/kits\/scale\/:scale"/);
});

test("the search finds a product by its set code and the header box names what it finds", () => {
  assert.match(readFileSync("src/app/api/search/route.ts", "utf8"), /setById\(p\.setId\)\?\.code/);
  assert.match(readFileSync("src/components/SearchBox.tsx", "utf8"), /Search cards, sealed, /);
});

// Owner, 2026-11-09: every dropdown is one shared mega menu (components/NavMenu.tsx), and Deals & stock has its own.
test("header: Deals opens a dropdown of real links, seven items at most, and NavMenu has hover intent, Escape, arrows and aria", async () => {
  const { headerNavItems } = await import("@/components/Header");
  const items = headerNavItems(navGroups({ shop: [] }), shopNav().menus, null);
  assert.ok(items.length <= 7, items.map((i) => i.label).join());
  const deals = items.find((i) => i.label === "Deals");
  assert.ok(deals?.menu?.[0]?.links.length, "Deals has a dropdown");
  assert.ok(deals!.menu!.flatMap((c) => c.links).some((l) => l.href === "/tools/deal-finder"));
  const src = readFileSync(new URL("../src/components/NavMenu.tsx", import.meta.url), "utf8");
  for (const needle of ["OPEN_MS", "CLOSE_MS", 'e.key === "Escape"', "ArrowDown", "aria-expanded", "aria-controls", "pointerdown", "onBlur", "usePathname"]) assert.ok(src.includes(needle), needle);
});
