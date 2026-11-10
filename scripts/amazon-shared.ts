// Helpers the two Amazon scripts share: the sealed products (and Gunpla kits) of a market, read from data/public through lib/data.ts, with
// their in-stock STORE prices (never eBay or TCGplayer): most stores, then dearest, first.
import { priceOf, products } from "@/lib/data";
import { kitOffers, kits } from "@/lib/kits";
import { SITE } from "@/site.config";
import type { Market, Product } from "@/lib/site-types";

export const API_MARKETS: Market[] = ["US", "UK", "CA", "AU", "EU"];

export function marketSealed(market: Market): { p: Product; prices: number[] }[] {
  return products()
    .filter((p) => p.kind === "sealed")
    .map((p) => ({
      p,
      prices: priceOf(p.id)
        .offers.filter((o) => o.market === market && o.inStock && !o.preorder && o.source !== "ebay" && o.source !== "tcgplayer" && o.cents > 0)
        .map((o) => o.cents)
        .sort((a, b) => a - b),
    }))
    .filter((x) => x.prices.length)
    .sort((a, b) => b.prices.length - a.prices.length || b.prices[0] - a.prices[0]);
}

export function median(xs: number[]): number | undefined {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * The Gunpla kits of a market (SITE.kits, data/public/kits.json) with their in-stock hobby-shop prices: most shops, then
 * dearest, first. Keyed like a product by the kit's JAN (the kit page's product id is Number(jan)), and matched on Amazon
 * ONLY by that barcode in Amazon's own externalIds (lib/amazon-creators.ts barcodeMatches), never by title.
 */
export function marketKits(market: Market): { jan: string; name: string; prices: number[] }[] {
  if (!SITE.kits) return [];
  return kits()
    .map((k) => ({
      jan: k.jan,
      name: k.name,
      prices: kitOffers(k.jan)
        .filter((o) => o.market === market && o.inStock && !o.preorder && o.cents > 0)
        .map((o) => o.cents)
        .sort((a, b) => a - b),
    }))
    .filter((x) => x.prices.length)
    .sort((a, b) => b.prices.length - a.prices.length || b.prices[0] - a.prices[0]);
}
