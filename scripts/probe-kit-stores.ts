// Finds US hobby and card shops whose Gunpla listings can be matched the way the kit import
// matches them (lib/import/kits.ts: the JAN, or Bandai Spirits' item number, in a variant's
// SKU or barcode, or a one-variant description). Run by .github/workflows/probe-kit-stores.yml
// (GitHub's runners can reach the stores, the agent container cannot). Read-only: it prints a
// ready-to-review src/content/kit-stores.ts block and writes research/kit-stores-probe.json.
// A person reads it and copies stores in; nothing here changes the site.
//
//   npx tsx scripts/probe-kit-stores.ts --hosts research/kit-candidate-hosts-us-2026-11-22.txt
//
// Candidates (US-first push, owner 2026-11-22): TCG Prices' 456 US stores plus the US shops the
// 2026-10-28 kit probe saw selling Gunpla. Two stores at a time, as the import reads them.
import fs from "node:fs";
import path from "node:path";
import { fetchJson, sleep } from "@/lib/import/http";
import { SITE } from "@/site.config";
import { isKitTitle, janOf } from "@/lib/import/kits";
import { readKitFile } from "@/lib/kit-store";

const MARKET: Record<string, string> = { USD: "US", GBP: "UK", CAD: "CA", AUD: "AU" };
const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const LISTED = new Set((SITE.kits?.stores ?? []).map((s) => host(s.base)));
const KIT_COL = /gunpla|plamo|model[\s-]*kits?|plastic[\s-]*models?|bandai[\s-]*(hobby|spirits|model)|master[\s-]*grade|high[\s-]*grade|real[\s-]*grade|perfect[\s-]*grade|entry[\s-]*grade|\b(hguc|mgex|mgsd|30mm|30-minute)\b|^gundams?$/i;
const NOT_COL = /card|tcg|ccg|single|sealed|booster|starter|deck|sleeve|binder|playmat|event|ticket|pokemon|magic|lorcana|one[\s-]*piece|yu-?gi|paint|tool|supplies|sale|clearance|pre-?owned|used/i;
const MAX_PAGES = 8;

interface Product {
  id: number;
  title: string;
  body_html?: string;
  variants: { price: string; available: boolean; sku?: string | null; barcode?: string | null }[];
}
interface Col { handle: string; title: string; products_count?: number }
interface Found {
  key: string;
  name: string;
  base: string;
  market: string;
  collections: { handle: string; products: number; kits: number; matched: number }[];
  products: number;
  kitTitles: number;
  matched: number;
  matchedInStock: number;
  inCatalogue: number;
  inCatalogueInStock: number;
  samples: { title: string; sku: string | null; jan: string | null }[];
}

const catalogue = new Set(readKitFile().kits.map((k) => k.jan));
const cfg = SITE.kits!;

async function probe(base: string): Promise<Found | { base: string; skip: string }> {
  let meta: { name?: string; currency?: string };
  try {
    meta = await fetchJson(`${base}/meta.json`, {}, 1);
  } catch (e) {
    return { base, skip: `not Shopify (${(e as Error).message.slice(-50)})` };
  }
  const market = MARKET[meta.currency ?? ""];
  if (market !== "US") return { base, skip: `currency ${meta.currency}` };
  const cols: Col[] = [];
  for (let page = 1; page <= 6; page++) {
    try {
      const d = await fetchJson<{ collections: Col[] }>(`${base}/collections.json?limit=250&page=${page}`, {}, 1);
      cols.push(...d.collections);
      if (d.collections.length < 250) break;
      await sleep(400);
    } catch {
      break;
    }
  }
  const cands = cols
    .filter((c) => KIT_COL.test(c.handle) || KIT_COL.test(c.title))
    .filter((c) => !NOT_COL.test(`${c.handle} ${c.title}`))
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
    .slice(0, 4);
  if (!cands.length) return { base, skip: `no kit collection (${cols.length} collections)` };
  const seen = new Set<number>();
  const jans = new Map<string, boolean>();
  const out: Found["collections"] = [];
  const samples: Found["samples"] = [];
  let kitTitles = 0;
  for (const c of cands) {
    let products = 0;
    let kits = 0;
    let matched = 0;
    for (let page = 1; page <= MAX_PAGES; page++) {
      let list: Product[] = [];
      try {
        list = (await fetchJson<{ products: Product[] }>(`${base}/collections/${c.handle}/products.json?limit=250&page=${page}`, {}, 2)).products;
      } catch {
        break;
      }
      for (const p of list) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        products++;
        if (!isKitTitle(p.title)) continue;
        kits++;
        kitTitles++;
        const vs = p.variants.filter((v) => Number(v.price) > 0);
        if (!vs.length) continue;
        const hits = vs.map((v) => janOf({ title: p.title, sku: v.sku, barcode: v.barcode, body: vs.length === 1 ? p.body_html : null }, cfg.janPrefixes, cfg.itemCodeJanPrefix));
        const one = new Set(hits.map((h) => h?.jan ?? null));
        const jan = one.size === 1 && hits[0] ? hits[0].jan : null;
        if (samples.length < 8) samples.push({ title: p.title, sku: vs[0].sku ?? null, jan });
        if (!jan) continue;
        matched++;
        jans.set(jan, (jans.get(jan) ?? false) || vs.some((v) => v.available));
      }
      if (list.length < 250) break;
      await sleep(900);
    }
    out.push({ handle: c.handle, products, kits, matched });
    await sleep(500);
  }
  const all = [...jans.entries()];
  const name = meta.name ?? host(base);
  const key = host(base).replace(/^store\.|^shop\./, "").split(".")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
  return {
    key,
    name,
    base,
    market,
    collections: out,
    products: seen.size,
    kitTitles,
    matched: all.length,
    matchedInStock: all.filter(([, s]) => s).length,
    inCatalogue: all.filter(([j]) => catalogue.has(j)).length,
    inCatalogueInStock: all.filter(([j, s]) => s && catalogue.has(j)).length,
    samples,
  };
}

async function main() {
  const i = process.argv.indexOf("--hosts");
  const file = i > 0 ? process.argv[i + 1] : "research/kit-candidate-hosts-us-2026-11-22.txt";
  const hosts = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim().replace(/\/$/, ""))
    .filter((l) => l.startsWith("http") && !LISTED.has(host(l)));
  console.log(`[probe] ${hosts.length} candidates (${LISTED.size} kit stores already listed are skipped)`);
  const results: (Found | { base: string; skip: string })[] = [];
  const queue = hosts.slice();
  await Promise.all(
    [0, 1].map(async () => {
      while (queue.length) {
        const b = queue.shift()!;
        const r = await probe(b);
        results.push(r);
        if ("skip" in r) console.log(`---- ${b} ${r.skip}`);
        else console.log(`SHOP ${b} products=${r.products} kits=${r.kitTitles} matched=${r.matched} inStock=${r.matchedInStock} catalogue=${r.inCatalogue}/${r.inCatalogueInStock} cols=${r.collections.map((c) => `${c.handle}:${c.matched}/${c.kits}`).join(",")}`);
        await sleep(800);
      }
    }),
  );
  const good = results
    .filter((r): r is Found => !("skip" in r) && r.matched >= 20 && r.matched / Math.max(1, r.kitTitles) >= 0.5)
    .sort((a, b) => b.inCatalogueInStock - a.inCatalogueInStock);
  console.log(`\n[probe] ${good.length} shops match 20+ kits on half or more of their kit listings:\n`);
  for (const g of good) {
    const cols = g.collections.filter((c) => c.matched > 0).map((c) => `"${c.handle}"`);
    console.log(`  { key: "${g.key}", name: ${JSON.stringify(g.name)}, base: "${g.base}", market: "US", collections: [${cols.join(", ")}] }, // ${g.matched} of ${g.kitTitles} matched, ${g.inCatalogueInStock} in stock and in the catalogue`);
  }
  fs.mkdirSync("research", { recursive: true });
  fs.writeFileSync(path.join("research", "kit-stores-probe.json"), JSON.stringify(results, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
