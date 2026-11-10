"use client";
// The card page's phone buy path, ported from RiftCompare (CardMobileBuy.tsx).
// At 390px the price table started below the first screen, under the card
// image. Below md:
//   • CardTopBuy puts the cheapest in-stock listing in the visitor's market
//     and its Buy button directly under the card name;
//   • CardStickyBuyBar pins "$X at {store} · Buy" to the bottom of the screen
//     once that block has scrolled away, and hides again whenever the price
//     table itself is on screen.
// Both read lib/price-rows.ts, the table's own order, so they can never
// disagree with its "Cheapest" row. Links go through /go like every buy
// button, so buy_click events count them (from=card_top / card_bar).
import { useEffect, useState } from "react";
import { ebaySearchUrl, goHref } from "@/lib/affiliate";
import { ago, money } from "@/lib/format";
import { PAID_ALTERNATIVE_BAND, priceRows } from "@/lib/price-rows";
import type { AmazonCell } from "@/lib/amazon-live";
import { MARKET_LABEL, type Market, type Offer } from "@/lib/site-types";
import { useMarket } from "./ClientPrefs";
import { PRICE_TABLE_ID, sourceName } from "./PriceTable";

const TOP_BUY_ATTR = "data-top-buy";

function postage(o: Offer) {
  if (o.shippingCents == null) return o.source === "tcgplayer" ? "" : " · + postage";
  return o.shippingCents === 0 ? " · free postage" : ` · + ${money(o.shippingCents, o.currency)} postage`;
}

function buyClass(o: Offer) {
  return o.source === "ebay" ? "btn bg-[#0064d2] px-4 py-2 text-white hover:bg-[#0053ad]" : "btn-buy px-4 py-2";
}

const AMAZON_MAX_AGE_MS = 24 * 3600_000;

export function CardTopBuy({ offers, productId, ebayQuery, amazon = null }: { offers: Offer[]; productId: number; ebayQuery?: string; /** Kit pages: Amazon's row per market (lib/amazon-live.ts amazonCells), a candidate for the paid alternative (2026-11-10) */ amazon?: Partial<Record<Market, string | AmazonCell>> | null }) {
  const { market } = useMarket();
  const { cheapest: best, paidAlternative: rowAlt } = priceRows(offers, market);
  // Amazon's own listing of the kit (matched by JAN) counts as a paid alternative like eBay's, at its live price, in the same
  // currency and band, and only while that price is under 24 hours old (its licence; checked again in the browser).
  const cell = amazon?.[market];
  const live = typeof cell === "object" ? cell.live : undefined;
  const [fresh, setFresh] = useState(false);
  useEffect(() => setFresh(!!live && Date.now() - Date.parse(live.at) < AMAZON_MAX_AGE_MS), [live]);
  const amazonAlt =
    best && fresh && typeof cell === "object" && live?.cents && live.currency === best.currency && best.source !== "ebay" && best.source !== "tcgplayer" && live.cents <= best.cents * PAID_ALTERNATIVE_BAND
      ? { offer: { source: "amazon", market, currency: live.currency, cents: live.cents, inStock: true, url: cell.url, title: "" } as Offer, pctMore: Math.max(0, Math.round(((live.cents - best.cents) / best.cents) * 100)) }
      : null;
  const alt = amazonAlt && (!rowAlt || amazonAlt.offer.cents < rowAlt.offer.cents) ? amazonAlt : rowAlt;
  if (!best) return null;
  // No eBay or TCGplayer row close enough: a labelled eBay search instead (owner, 2026-10-28: push eBay harder). Never a price.
  const searchMarket = market === "UK" || market === "AU" || market === "CA" ? market : "US";
  const search = !alt && ebayQuery && best.source !== "ebay" && best.source !== "tcgplayer" ? goHref({ url: ebaySearchUrl(ebayQuery, searchMarket), source: "ebay", market: searchMarket }, productId, "card_top_ebay_search") : null;
  return (
    <div {...{ [TOP_BUY_ATTR]: "" }} className="mt-3 card p-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow">Cheapest in {MARKET_LABEL[market]}</div>
          <div className="text-lg font-bold tabular-nums text-fg">{money(best.cents, best.currency)}</div>
          <div className="truncate text-xs text-muted">at {sourceName(best)}{postage(best)}</div>
        </div>
        <a href={goHref(best, productId, "card_top")} rel="sponsored nofollow noopener" target="_blank" className={`${buyClass(best)} shrink-0`}>
          Buy →
        </a>
      </div>
      {/* A store that pays nothing is cheapest: name eBay or TCGplayer when
          within 50% (lib/price-rows.ts paidAlternative), or Amazon on a kit page, else an eBay search. */}
      {alt && (
        <div className="mt-2 flex items-center gap-2 border-t border-line pt-1 text-xs text-muted">
          <a
            href={goHref(alt.offer, productId, "card_top_alt")}
            rel="sponsored nofollow noopener"
            target="_blank"
            className="block min-w-0 flex-1 truncate py-2 font-semibold text-brand-400 hover:underline"
          >
            or <span className="tabular-nums">{money(alt.offer.cents, alt.offer.currency)}</span> on {alt.offer.source === "ebay" ? "eBay" : alt.offer.source === "amazon" ? "Amazon" : "TCGplayer"}
            {alt.pctMore > 0 ? ` (+${alt.pctMore}%)` : ""} →
          </a>
          <span className="shrink-0 ad-pill">Paid link</span>
        </div>
      )}
      {search && (
        <div className="mt-2 flex items-center gap-2 border-t border-line pt-1 text-xs text-muted" data-ebay-search="">
          <a href={search} rel="sponsored nofollow noopener" target="_blank" className="block min-w-0 flex-1 truncate py-2 font-semibold text-brand-400 hover:underline">
            or check listings on eBay →
          </a>
          <span className="shrink-0 ad-pill">Paid link</span>
        </div>
      )}
    </div>
  );
}

export function CardStickyBuyBar({ offers, productId }: { offers: Offer[]; productId: number }) {
  const { market } = useMarket();
  const best = priceRows(offers, market).cheapest;
  // Starts hidden: on first paint the top buy block is on screen.
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!best) return;
    const els = [document.getElementById(PRICE_TABLE_ID), document.querySelector(`[${TOP_BUY_ATTR}]`)].filter(Boolean) as Element[];
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      setShow(![...seen.values()].some(Boolean));
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [best]);
  // Room under the footer while the bar shows, so it never covers the last lines.
  useEffect(() => {
    if (!show) return;
    document.body.style.paddingBottom = "4rem";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [show]);
  if (!best) return null;
  const name = sourceName(best);
  return (
    <div
      aria-hidden={!show}
      data-buybar=""
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-2 backdrop-blur transition-transform duration-200 md:hidden ${show ? "translate-y-0" : "pointer-events-none translate-y-[120%]"}`}
    >
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <div className="min-w-0 flex-1 truncate text-sm">
          <span className="font-bold tabular-nums text-fg">{money(best.cents, best.currency)}</span>
          <span className="text-muted"> at {name.length > 22 ? `${name.slice(0, 21)}…` : name}</span>
        </div>
        <a href={goHref(best, productId, "card_bar")} tabIndex={show ? 0 : -1} rel="sponsored nofollow noopener" target="_blank" className={`${buyClass(best)} shrink-0`}>
          Buy →
        </a>
      </div>
    </div>
  );
}

/** "Prices checked 5 hours ago": relative in the browser, because the page
 *  around it is cached for hours; the exact time is in the tooltip. */
export function CheckedAgo({ at }: { at: string | null | undefined }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => setText(ago(at)), [at]);
  if (!at) return null;
  return (
    <span className="text-xs text-muted" title={new Date(at).toUTCString()} suppressHydrationWarning>
      Prices checked {text ?? new Date(at).toISOString().slice(0, 10)}
    </span>
  );
}
