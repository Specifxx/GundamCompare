// One-off probe (2026-10-29), round 2: what a product page of the two
// non-Shopify shops carries (JSON-LD, gtin/JAN, price), and how many Gunpla
// product URLs their sitemaps list.
import fs from "node:fs";
import zlib from "node:zlib";
const UA = "Mozilla/5.0 (compatible; GundamCompareBot/1.0; +https://gundamcompare.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, bin = false) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(30000) });
    const buf = Buffer.from(await r.arrayBuffer());
    let text = buf.toString("utf8");
    if (url.endsWith(".gz")) try { text = zlib.gunzipSync(buf).toString("utf8"); } catch {}
    return { status: r.status, url: r.url, text };
  } catch (e) { return { status: 0, error: String(e.message || e), text: "" }; }
}
const locs = (t) => [...t.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
const KIT = /(^|[-/])(hg|hguc|hgce|mg|rg|pg|eg|sd|mgex|mgsd|re-100|gunpla|gundam)([-/]|$)/i;
function page(t) {
  const ld = [...t.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim().slice(0, 1500));
  return {
    ld,
    jans: [...new Set(t.match(/\b45\d{11}\b/g) || [])].slice(0, 6),
    gtin: [...new Set((t.match(/gtin1?3?["'\s:=>]+["']?\d{8,14}/gi) || []))].slice(0, 4),
    meta: [...t.matchAll(/<meta[^>]+(?:product:|og:)(?:price|availability|upc|ean|retailer_item_id)[^>]*>/gi)].map((m) => m[0]).slice(0, 8),
    sku: [...new Set(t.match(/(?:sku|SKU|Item code|Product code|UPC|EAN|Barcode)[^<]{0,60}/g) || [])].slice(0, 8),
    title: (t.match(/<title>([^<]*)/) || [])[1],
  };
}
const out = {};
// Frontline Hobbies (Neto)
{
  const r = {};
  const idx = await get("https://www.frontlinehobbies.com.au/sitemap_index.xml.gz");
  r.indexStatus = idx.status; const maps = locs(idx.text); r.maps = maps.slice(0, 20);
  let urls = [];
  for (const m of maps.slice(0, 12)) { await sleep(1500); const s = await get(m.replace(/^http:/, "https:")); urls.push(...locs(s.text)); }
  r.urlCount = urls.length; const kits = urls.filter((u) => KIT.test(new URL(u).pathname)); r.kitUrlCount = kits.length; r.kitUrlSample = kits.slice(0, 15);
  r.pages = [];
  for (const u of kits.slice(0, 3)) { await sleep(2000); const p = await get(u.replace(/^http:/, "https:")); r.pages.push({ u, status: p.status, ...page(p.text) }); }
  out.frontline = r; console.log(JSON.stringify(r, null, 1).slice(0, 6000));
}
// Metro Hobbies (custom)
{
  const r = {};
  const sm = await get("https://www.metrohobbies.ca/sitemap.xml");
  const urls = locs(sm.text); r.urlCount = urls.length;
  const kits = urls.filter((u) => KIT.test(new URL(u).pathname.split("/")[2] || "") || /gundam|gunpla|-hg-|-mg-|-rg-|-pg-|^hg-|^mg-|^rg-/i.test(u)); r.kitUrlCount = kits.length; r.kitUrlSample = kits.slice(0, 15);
  r.pages = [];
  for (const u of kits.filter((u) => /hg|mg|rg/i.test(u)).slice(0, 3)) { await sleep(5500); const p = await get(u); r.pages.push({ u, status: p.status, ...page(p.text) }); }
  out.metro = r; console.log(JSON.stringify(r, null, 1).slice(0, 6000));
}
// Gundam Extra (Shopify): size of the catalogue
{
  const r = {};
  for (const h of ["all", "gunpla", "bandai", "high-grade", "master-grade"]) {
    await sleep(1200);
    const p = await get(`https://gundamextra.com/collections/${h}/products.json?limit=250&page=1`);
    try { r[h] = JSON.parse(p.text).products.length; } catch { r[h] = p.status; }
  }
  let n = 0; for (let pg = 1; pg <= 40; pg++) { await sleep(1000); const p = await get(`https://gundamextra.com/products.json?limit=250&page=${pg}`); let l = []; try { l = JSON.parse(p.text).products; } catch {} n += l.length; if (l.length < 250) break; }
  r.allProducts = n;
  out.gundamextra = r; console.log(JSON.stringify(r));
}
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
