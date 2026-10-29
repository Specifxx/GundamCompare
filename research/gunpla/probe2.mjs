// One-off probe (2026-10-29), round 3: raw HTML of a Frontline Hobbies (Neto)
// category page and a Metro Hobbies (Square Online) product page, and Square's
// public store API.
import fs from "node:fs";
const UA = "Mozilla/5.0 (compatible; GundamCompareBot/1.0; +https://gundamcompare.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "*/*" }, redirect: "follow", signal: AbortSignal.timeout(30000) });
    return { status: r.status, url: r.url, text: await r.text() };
  } catch (e) { return { status: 0, error: String(e.message || e), text: "" }; }
}
fs.mkdirSync("research/gunpla/raw", { recursive: true });
const out = {};
const f = await get("https://www.frontlinehobbies.com.au/model-building/gundam-plastic-models/high-grade/");
fs.writeFileSync("research/gunpla/raw/frontline-hg.html", f.text);
out.frontline = { status: f.status, len: f.text.length, pg: (f.text.match(/[?&]pgnum=\d+/g) || []).slice(0, 10), total: (f.text.match(/[\d,]+\s+(?:items|products|results)/gi) || []).slice(0, 5) };
await sleep(2000);
const f2 = await get("https://www.frontlinehobbies.com.au/model-building/gundam-plastic-models/high-grade/?pgnum=2&sortby=lowest_price");
out.frontline.page2 = { status: f2.status, len: f2.text.length };
await sleep(2000);
// one product page
const prod = (f.text.match(/href="(https:\/\/www\.frontlinehobbies\.com\.au\/[a-z0-9-]+)"[^>]*>[^<]*(?:HG|High Grade)/i) || [])[1];
if (prod) { const p = await get(prod); fs.writeFileSync("research/gunpla/raw/frontline-product.html", p.text); out.frontline.product = { prod, status: p.status, jans: [...new Set(p.text.match(/\b45\d{11}\b/g) || [])] }; }
await sleep(3000);
const m = await get("https://www.metrohobbies.ca/product/-pre-order-2026-q4-macross-hg-1-100-vf-25g-messiah-valkyrie-michael/T7YIXLE3LLTPABOB6QHBWETP");
fs.writeFileSync("research/gunpla/raw/metro-product.html", m.text);
const ids = { user: (m.text.match(/"user_id"\s*:\s*"?(\d+)/) || m.text.match(/users\/(\d+)/) || [])[1], site: (m.text.match(/"site_id"\s*:\s*"?(\d+)/) || m.text.match(/sites\/(\d+)/) || [])[1] };
out.metro = { status: m.status, len: m.text.length, ids, editmysite: m.text.includes("editmysite"), square: m.text.includes("square") };
if (ids.user && ids.site) {
  await sleep(5500);
  const api = await get(`https://cdn5.editmysite.com/app/store/api/v28/editor/users/${ids.user}/sites/${ids.site}/products?page=1&per_page=20&include=images,media_files,discounts&q=hg`);
  fs.writeFileSync("research/gunpla/raw/metro-api.json", api.text.slice(0, 200000));
  out.metro.api = { status: api.status, len: api.text.length, sku: [...new Set(api.text.match(/"(?:sku|upc|gtin|barcode)"\s*:\s*"[^"]*"/gi) || [])].slice(0, 10), jans: [...new Set(api.text.match(/\b45\d{11}\b/g) || [])].slice(0, 6) };
}
console.log(JSON.stringify(out, null, 1));
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
