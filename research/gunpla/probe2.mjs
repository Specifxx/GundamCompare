// One-off probe (2026-10-29): three shops the owner asked for. Platform,
// currency, Gunpla collections and whether a JAN can be read per product.
import fs from "node:fs";
const UA = "Mozilla/5.0 (compatible; GundamCompareBot/1.0; +https://gundamcompare.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25000) });
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: r.status, url: r.url, text, json, headers: Object.fromEntries(r.headers) };
  } catch (e) { return { status: 0, error: String(e.message || e) }; }
}
const JAN = /\b(45\d{11})\b/g;
const out = {};
for (const base of ["https://www.frontlinehobbies.com.au", "https://gundamextra.com", "https://www.metrohobbies.ca"]) {
  const r = { base };
  const home = await get(base);
  r.home = { status: home.status, url: home.url, server: home.headers?.server, powered: home.headers?.["x-powered-by"] };
  const t = home.text || "";
  r.markers = ["Shopify", "woocommerce", "wp-content", "neto", "maropost", "bigcommerce", "squarespace", "wix", "magento", "ecwid", "lightspeed", "cloudflare"].filter((m) => t.toLowerCase().includes(m.toLowerCase()));
  r.janOnHome = [...new Set(t.match(JAN) || [])].slice(0, 5);
  await sleep(1200);
  const p = await get(`${base}/products.json?limit=250`);
  r.shopify = !!p.json?.products;
  if (r.shopify) {
    const cart = await get(`${base}/cart.js`); r.currency = cart.json?.currency;
    const cols = await get(`${base}/collections.json?limit=250`);
    r.collections = (cols.json?.collections || []).filter((c) => /gun|plam|model|kit|bandai|hg|mg|rg|pg|grade/i.test(c.handle + " " + c.title)).map((c) => `${c.handle} (${c.products_count ?? "?"})`);
    const kits = p.json.products.filter((x) => /\b(hg|mg|rg|pg|eg|sd|gundam|gunpla)\b/i.test(x.title)).slice(0, 8);
    r.listSamples = kits.map((x) => ({ t: x.title, sku: x.variants[0]?.sku, price: x.variants[0]?.price, bodyJan: (String(x.body_html || "").match(JAN) || [])[0] }));
    r.single = [];
    for (const k of kits.slice(0, 6)) {
      await sleep(1100);
      const s = await get(`${base}/products/${k.handle}.json`);
      r.single.push({ t: k.title, status: s.status, barcode: s.json?.product?.variants?.map((v) => v.barcode) });
    }
  } else {
    r.productsJson = p.status;
    const w = await get(`${base}/wp-json/wc/store/v1/products?per_page=20&search=gundam`);
    r.woo = w.status;
    if (Array.isArray(w.json)) r.wooSamples = w.json.slice(0, 8).map((x) => ({ t: x.name, sku: x.sku, price: x.prices?.price, cur: x.prices?.currency_code, inStock: x.is_in_stock, descJan: (String(x.description || x.short_description || "").match(JAN) || [])[0] }));
    const s = await get(`${base}/search?q=gundam+hg`); r.search = { status: s.status, url: s.url, jans: [...new Set((s.text || "").match(JAN) || [])].slice(0, 5), len: (s.text || "").length };
    const sm = await get(`${base}/sitemap.xml`); r.sitemap = { status: sm.status, head: (sm.text || "").slice(0, 600) };
    const rb = await get(`${base}/robots.txt`); r.robots = (rb.text || "").slice(0, 800);
  }
  out[base] = r;
  console.log(JSON.stringify(r, null, 1).slice(0, 4000));
  await sleep(2000);
}
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
