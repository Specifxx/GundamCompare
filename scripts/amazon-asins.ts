// Finds each sealed product's ASIN on each market's own Amazon (US, UK, CA, AU, DE for the eurozone) with the Creators
// API's searchItems, in the daily refresh (refresh-prices.yml, after the import). A result counts only when the store
// matcher (lib/import/match.ts matchSealed) reads its title as THIS product: ten results, no match, no ASIN; a wrong
// merge is worse than a missing price, as with the stores. Found ASINs and misses go in data/amazon/asins-<MARKET>.json
// (keyed by product id; ASINs may be stored, prices never are) and ride the data commit; a miss is retried after 30
// days. Without credentials it does nothing; a store whose account has no API access yet (403) ends that market quietly
// and the next still runs. data/amazon/status-<MARKET>.json says what the last run did (the ops monitor reads it).
//
// Gunpla kits (2026-11-10, owner: Gundam Compare is Gunpla-first): after the sealed products, each market's kits with the
// most in-stock hobby shops are searched by their JAN, then by "Bandai <name>"; a result counts ONLY when Amazon's own
// externalIds carry that JAN (barcodeMatches), never by title. Kept in the same file under the JAN (the kit page's
// product id is Number(jan)). Three failed calls in a row end a market: a store our credential can't serve fails every
// call, and the workflow shouldn't spend minutes learning it again.
//   npx tsx scripts/amazon-asins.ts            AMAZON_SEARCH_BUDGET=400 sealed searches, AMAZON_KIT_CALLS=600 kit calls
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { AMAZON_STORES } from "@/lib/affiliate";
import { AmazonRefused, barcodeMatches, credentialsFor, creatorsClient, MARKETS as API } from "@/lib/amazon-creators";
import type { AsinFile } from "@/lib/amazon-live";
import { products, sets } from "@/lib/data";
import { buildIndex, matchSealed, type MatchIndex } from "@/lib/import/match";
import type { Market, Product } from "@/lib/site-types";
import { SITE } from "@/site.config";
import { API_MARKETS, marketKits, marketSealed } from "./amazon-shared";

const DIR = path.join(process.cwd(), "data", "amazon");
const RECHECK_MISS_DAYS = 30;

/** Whether an Amazon title is this product and no other: the store matcher lands on it. */
export const amazonTitleMatches = (p: Pick<Product, "id">, title: string, idx: MatchIndex): boolean => matchSealed(title, idx)?.product.id === p.id;

async function market(m: Market, idx: MatchIndex) {
  const store = AMAZON_STORES[m];
  if (!store || !API[m]) return;
  const FILE = path.join(DIR, `asins-${m}.json`);
  const status = (o: object) => writeFileSync(path.join(DIR, `status-${m}.json`), JSON.stringify({ at: new Date().toISOString(), ...o }) + "\n");
  mkdirSync(DIR, { recursive: true });
  const creds = credentialsFor(m);
  if (!creds) {
    status({ state: "off" });
    return console.log(`Amazon ASINs ${m}: no AMAZON_CREATORS_* credentials yet, skipped.`);
  }
  const budget = Number(process.env.AMAZON_SEARCH_BUDGET || 400);
  const today = new Date().toISOString().slice(0, 10);
  const known: AsinFile = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : {};
  const list = marketSealed(m);
  const kitList = marketKits(m);
  const live = new Set([...list.map((x) => String(x.p.id)), ...kitList.map((k) => k.jan)]);
  const due = (key: string) => {
    const k = known[key];
    if (k?.asin) return false;
    return !k || (Date.parse(today) - Date.parse(k.checked)) / 864e5 >= RECHECK_MISS_DAYS;
  };
  const todo = list.filter(({ p }) => due(String(p.id)));
  const api = await creatorsClient(m, store.tag, creds).catch((e) => {
    console.log(`Amazon ASINs ${m}: ${(e as Error).message} (no Creators API access yet?), skipped.`);
    status({ state: "refused", note: (e as Error).message.slice(0, 120) });
    return null;
  });
  if (!api) return;
  let found = 0, searched = 0, refused = "", failed = 0;
  for (const { p } of todo.slice(0, budget)) {
    if (failed >= 3) break;
    try {
      const items = await api.call("searchItems", { keywords: `${SITE.game} ${p.name}`.replace(/\s+/g, " ").trim(), resources: ["itemInfo.title"], itemCount: 10 });
      searched++;
      const hit = items.find((it) => amazonTitleMatches(p, it.itemInfo?.title?.displayValue ?? "", idx));
      known[String(p.id)] = { asin: hit?.asin ?? null, checked: today };
      if (hit) found++;
      failed = 0;
    } catch (e) {
      failed++;
      console.log(`Amazon ASINs ${m}: stopped at ${p.slug}: ${(e as Error).message}`);
      if (e instanceof AmazonRefused) {
        refused = (e as Error).message.slice(0, 120);
        break;
      }
    }
  }
  // Gunpla kits: by barcode only.
  const kitTodo = refused || failed >= 3 ? [] : kitList.filter((k) => due(k.jan));
  const kitBudget = Number(process.env.AMAZON_KIT_CALLS || 600);
  const resources = ["itemInfo.title", "itemInfo.externalIds"];
  let kitCalls = 0, kitSearched = 0, kitFound = 0;
  failed = 0;
  for (const k of kitTodo) {
    if (kitCalls >= kitBudget || failed >= 3) break;
    try {
      kitCalls++;
      let hit = (await api.call("searchItems", { keywords: k.jan, resources, itemCount: 10 })).find((it) => barcodeMatches(it, k.jan));
      if (!hit && kitCalls < kitBudget) {
        kitCalls++;
        hit = (await api.call("searchItems", { keywords: `Bandai ${k.name}`.replace(/\s+/g, " ").trim(), resources, itemCount: 10 })).find((it) => barcodeMatches(it, k.jan));
      }
      kitSearched++;
      known[k.jan] = { asin: hit?.asin ?? null, checked: today };
      if (hit) kitFound++;
      failed = 0;
    } catch (e) {
      failed++;
      console.log(`Amazon ASINs ${m}: kits stopped at ${k.jan}: ${(e as Error).message}`);
      if (e instanceof AmazonRefused) {
        refused = (e as Error).message.slice(0, 120);
        break;
      }
    }
  }
  const kitAsins = kitList.filter((k) => known[k.jan]?.asin).length;
  console.log(`Amazon ASINs ${m}: kits ${kitSearched} searched, ${kitFound} found, ${kitAsins} known, ${Math.max(0, kitTodo.length - kitSearched)} waiting.`);
  // Products gone from the market drop out, so the file stays the size of the catalogue.
  const out = Object.fromEntries(Object.entries(known).filter(([k]) => live.has(k)).sort(([a], [b]) => Number(a) - Number(b)));
  writeFileSync(FILE, JSON.stringify(out, null, 0).replace(/},"/g, '},\n"') + "\n");
  const asins = Object.values(out).filter((e) => e.asin).length;
  status({ state: refused && !searched && !kitSearched ? "refused" : "ok", searched, found, known: asins, waiting: Math.max(0, todo.length - searched), kits: { searched: kitSearched, found: kitFound, known: kitAsins, waiting: Math.max(0, kitTodo.length - kitSearched) }, ...(refused ? { note: refused } : {}) });
  console.log(`Amazon ASINs ${m}: ${searched} searched, ${found} found, ${asins} known, ${Math.max(0, todo.length - searched)} waiting.`);
}

async function main() {
  const idx = buildIndex(products(), sets(), SITE.numberStyle, { rarityMustAgree: SITE.rarityMustAgree, rarityAliases: SITE.rarityAliases, setEditions: SITE.setEditions });
  for (const m of API_MARKETS) await market(m, idx).catch((e) => console.log(`Amazon ASINs ${m} skipped: ${(e as Error).message}`));
}

if (process.argv[1] && /amazon-asins\.ts$/.test(process.argv[1])) main().catch((e) => console.log(`Amazon ASINs skipped: ${(e as Error).message}`));
