import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { SITE } from "@/site.config";
import { gradeSlug, GRADE_LABEL, kitAdTiles, kitBest, kitBySlug, kitEbayOffers, kitImage, kitIsIndexable, kitLowsOf, kitOffers, kits, kitsUpdatedAt, popular, scaleHubOf } from "@/lib/kits";
import { money } from "@/lib/format";
import { PriceTable } from "@/components/PriceTable";
import { CardStickyBuyBar, CardTopBuy, CheckedAgo } from "@/components/CardBuy";
import { KitGrid } from "@/components/KitTile";
import { JsonLd } from "@/components/JsonLd";
import { InlineAds } from "@/components/InlineAds";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { amazonSearchUrls, ebaySearchUrl, goHref } from "@/lib/affiliate";
import { amazonCells } from "@/lib/amazon-live";
import { historyThrough, meta } from "@/lib/data";
import { PriceHistory } from "@/components/PriceHistory";
import { abs, KITS_SHARE_IMAGE } from "@/lib/site";
import { MARKET_LABEL, MARKETS, type Market, type Offer } from "@/lib/site-types";
import { buyerRead } from "@/lib/buyer-read";
import { sourceNameServer } from "@/lib/sources";
import { fitDescription, fitTitle, kitDescriptionCandidates, kitTitleCandidates } from "@/lib/seo-title";
import { kitShipping } from "@/lib/kit-shipping-data";
import { lowestByMarket } from "@/lib/alert-feed";
import { PriceAlert } from "@/components/PriceAlert";
import { WatchPrice } from "@/components/WatchPrice";

export const dynamic = "force-dynamic"; // one CDN copy per URL (next.config.js CDN_PAGES), never ISR

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const k = SITE.kits ? kitBySlug(params.slug) : null;
  if (!k || !SITE.kits) return {};
  const offers = kitOffers(k.jan);
  const stores = new Set(offers.map((o) => o.source)).size;
  const us = offers.find((o) => o.market === "US" && o.inStock);
  // The cheapest in-stock US price leads the title (2026-11-18, like the card pages): the fact the searcher came for, visible in the result.
  const title = fitTitle(kitTitleCandidates(k.name, us ? money(us.cents, us.currency) : null, stores)).absolute;
  // The description leads with the price and the kit's grade and scale, like the title (2026-11-21): the US shop price, else
  // the first other market with the kit in stock (named), else "sold out" and the free restock email. Shops only.
  const leadOffer = us ?? MARKETS.map((mk) => offers.find((o) => o.market === mk && o.inStock)).find(Boolean) ?? null;
  const description = fitDescription(
    kitDescriptionCandidates({
      name: k.name,
      gradeLabel: k.grade ? (GRADE_LABEL[k.grade] ?? k.grade).replace(/\s*\([^)]*\)$/, "").replace(/,.*$/, "").replace(/ Missions$/, "") : null,
      scale: k.scale,
      jan: k.jan,
      lead: leadOffer
        ? { price: money(leadOffer.cents, leadOffer.currency), market: leadOffer.market, inStockShops: new Set(offers.filter((o) => o.market === leadOffer.market && o.inStock).map((o) => o.source)).size }
        : null,
      stores,
      alerts: Boolean(SITE.priceAlerts),
    }),
  );
  const images = k.image ? [kitImage(k.image, 1000)] : [KITS_SHARE_IMAGE];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/kit/${k.slug}` },
    // No price from anywhere: reachable, links followed, out of the index and the sitemap (lib/indexing.ts kitIndexable).
    ...(kitIsIndexable(k) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { type: "website", siteName: SITE.name, url: `/kit/${k.slug}`, title, description, images },
    twitter: { card: "summary_large_image", images },
  };
}

export default function KitPage({ params }: { params: { slug: string } }) {
  const k = SITE.kits ? kitBySlug(params.slug) : null;
  if (!k || !SITE.kits) notFound();
  const cfg = SITE.kits;
  const offers = kitOffers(k.jan);
  // The price table, buy block and sticky bar also get the kit's eBay row (GUN-1, 2026-11-10: pinned first, "Ad", the
  // barcode's cheapest new listing); the prose, structured data and counts below stay shops only.
  const withEbay = [...kitEbayOffers(k.jan), ...offers];
  const inStock = offers.filter((o) => o.inStock);
  const usOffers = inStock.filter((o) => o.currency === "USD");
  const m = meta();
  const pid = Number(k.jan);
  // The price alert (RiftCompare's shared service; lib/alert-feed.ts lists every kit by its JAN): each market's cheapest
  // in-stock shop, never eBay or Amazon. With none in the visitor's market the form offers "back in stock" instead.
  const alertPrices = lowestByMarket(offers);
  const search = `${cfg.searchPrefix} ${k.name}`;
  // Amazon's row in the table (pinned under eBay): the kit's own Amazon page where the daily refresh found its ASIN by
  // the JAN on the box, with this build's price for 24 hours; else the tagged search (2026-11-10).
  const amazon = amazonCells(pid, amazonSearchUrls(search));
  const sameGrade = popular(kits().filter((x) => x.grade === k.grade && x.jan !== k.jan));
  const related = sameGrade.slice(0, 6);
  // eBay ads of the kit itself first, then its grade's popular kits.
  const adTiles = kitAdTiles([k, ...sameGrade], 10);
  const lows = kitLowsOf(k.jan);
  const markets = [...new Set(inStock.map((o) => o.market))];
  // "Where is it cheapest?" from this kit's own shop prices and history (lib/buyer-read.ts, 2026-11-23 SEO quality pass):
  // shops only, never eBay or Amazon, each market in its own currency.
  const usLows = lows.US ?? [];
  const read = buyerRead({
    name: k.name,
    sealedType: null,
    refCents: null,
    history: usLows,
    historyLabel: "the cheapest in-stock US shop price",
    today: historyThrough(),
    offers,
    storeName: (o) => sourceNameServer(o as Offer),
    set: null,
    siblings: [],
    money,
    marketOrder: MARKETS,
    marketName: (mk) => (mk === "US" || mk === "UK" ? `the ${MARKET_LABEL[mk as Market]}` : MARKET_LABEL[mk as Market] ?? String(mk)),
    ebayPrices: false,
  });
  // Where this kit's price sits among the same grade's kits with an in-stock US shop price (shops only).
  const usBest = kitBest(k.jan, "US");
  const gradePeers = k.grade && usBest ? kits().filter((x) => x.grade === k.grade && x.jan !== k.jan).map((x) => kitBest(x.jan, "US")?.cents).filter((c): c is number => c != null) : [];
  const gradeLine = usBest && gradePeers.length >= 5
    ? `Among the ${gradePeers.length + 1} ${GRADE_LABEL[k.grade!] ?? k.grade} kits with an in-stock US shop price, this one is ${(() => { const below = gradePeers.filter((c) => c < usBest.cents).length; const p = Math.round((below / gradePeers.length) * 100); return p >= 50 ? `dearer than ${p}%` : `cheaper than ${100 - p}%`; })()} of them${k.scale ? ` (scale ${k.scale})` : ""}.`
    : null;
  const firstSeen = k.firstSeen ? `A shop we track first listed it on ${new Date(`${k.firstSeen.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}.` : null;
  return (
    <article className="flex flex-col gap-8">
      {/* A Product with no offers is a Search Console error (the card page's rule, 2026-11-04): 1,513 of 2,328 kit pages had
          no in-stock US shop on 2026-11-13, so the block is drawn only when one backs it. */}
      {usOffers.length > 0 && (
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: k.name,
          image: k.image ? kitImage(k.image, 1000) : undefined,
          gtin13: k.jan,
          sku: k.jan,
          brand: { "@type": "Brand", name: cfg.maker },
          category: "Plastic model kit",
          url: abs(`/kit/${k.slug}`),
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: (Math.min(...usOffers.map((o) => o.cents)) / 100).toFixed(2),
            highPrice: (Math.max(...usOffers.map((o) => o.cents)) / 100).toFixed(2),
            offerCount: usOffers.length,
            availability: "https://schema.org/InStock",
          },
        }}
      />
      )}
      <Breadcrumbs items={[{ name: cfg.label, href: "/kits" }, ...(k.grade ? [{ name: GRADE_LABEL[k.grade] ?? k.grade, href: `/kits/grade/${gradeSlug(k.grade)}` }] : []), { name: k.name }]} />
      <div className="grid gap-8 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="order-2 flex flex-col gap-4 md:order-1">
          {k.image && <img src={kitImage(k.image, 640)} alt={`${k.name} box`} className="plate hidden aspect-square w-full object-contain p-3 md:block" width={320} height={320} />}
          <dl className="card-surface grid grid-cols-2 gap-x-3 gap-y-1.5 p-4 text-sm">
            {k.grade && (<><dt className="text-muted">Grade</dt><dd><Link className="link" href={`/kits/grade/${gradeSlug(k.grade)}`}>{GRADE_LABEL[k.grade] ?? k.grade}</Link></dd></>)}
            {k.scale && (<><dt className="text-muted">Scale</dt><dd>{scaleHubOf(k) ? <Link className="link" href={`/kits/scale/${scaleHubOf(k)!.slug}`}>{k.scale}</Link> : k.scale}</dd></>)}
            <dt className="text-muted">Maker</dt><dd>{cfg.maker}</dd>
            <dt className="text-muted">JAN barcode</dt><dd className="tabular-nums">{k.jan}</dd>
          </dl>
        </div>
        <div className="order-1 flex min-w-0 flex-col gap-6 md:order-2">
          <header>
            <div className="flex items-start gap-3">
              {k.image && <img src={kitImage(k.image, 200)} alt={k.name} className="plate h-[88px] w-[88px] shrink-0 object-contain p-1 md:hidden" width={88} height={88} />}
              <h1 className="font-display text-2xl font-black md:text-3xl">{k.name} price</h1>
            </div>
            <p className="mt-2 text-sm text-muted">
              {inStock.length
                ? `${inStock.length} in-stock listing${inStock.length === 1 ? "" : "s"}${markets.length ? ` in ${markets.map((x) => MARKET_LABEL[x]).join(", ")}` : ""}.`
                : "Sold out at every shop we track today."}
            </p>
            <CardTopBuy offers={withEbay} productId={pid} ebayQuery={search} amazon={amazon} />
            {SITE.priceAlerts && <WatchPrice site={SITE.key} productId={pid} prices={alertPrices} />}
          </header>
          <section>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="font-display text-xl font-bold">Compare prices</h2>
              <CheckedAgo at={kitsUpdatedAt() ?? m?.updatedAt} />
            </div>
            <PriceTable offers={withEbay} fx={m?.fx ?? { USD: 1 }} productId={pid} page="kit" amazon={amazon} image={k.image ?? null} product={`${k.name} (JAN ${k.jan})`} delivery={kitShipping()} />
            {SITE.priceAlerts && <PriceAlert site={SITE.key} productId={pid} prices={alertPrices} />}
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <a className="link font-semibold" rel="sponsored nofollow noopener" target="_blank" href={goHref({ url: ebaySearchUrl(search, "US"), source: "ebay", market: "US" }, pid, "kit_ebay_search")}>Check eBay listings →</a>
              <span className="rounded bg-ink-800 px-1.5 py-0.5 text-[10px] text-muted">Paid link</span>
            </p>
          </section>
          {/* The cheapest in-stock shop price in the visitor's market, recorded daily from 2026-11-20 (shops only, never eBay or
              Amazon). Drawn once the kit has a recorded day. */}
          {Object.keys(lows).length > 0 && (
            <section className="card-surface p-4">
              <h2 className="mb-2 font-display text-xl font-bold">Price history</h2>
              <PriceHistory lows={lows} fx={m?.fx} through={historyThrough()} days={365} />
            </section>
          )}
          <section className="prose-site max-w-none text-sm">
            <h2>Where is {k.name} cheapest?</h2>
            {read.length ? read.map((t, i) => <p key={i}>{t}</p>) : <p>No shop we track has it in stock today.</p>}
            {(gradeLine || firstSeen) && <p>{[gradeLine, firstSeen].filter(Boolean).join(" ")}</p>}
            <p>
              We compare {cfg.stores.length} hobby shops every day and match each listing by the kit&apos;s JAN barcode ({k.jan}), so every price above is for this exact kit. Prices are before postage and stay sorted by the kit&apos;s own price; where a shop&apos;s checkout gave us a delivery quote, it is shown under the shop&apos;s name with the order value that makes delivery free. The shop&apos;s checkout price is final.
            </p>
          </section>
        </div>
      </div>
      {related.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">More {GRADE_LABEL[k.grade!] ?? k.grade} kits</h2>
          <KitGrid items={related} />
        </section>
      )}
      <CardStickyBuyBar offers={withEbay} productId={pid} />
      {/* Ads sit below the page's own content, never above it (2026-11-19, core-update quality pass). */}
      <InlineAds kit={adTiles} page="kit" />
    </article>
  );
}
