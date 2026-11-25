import Link from "@/components/Link";
import type { Product } from "@/lib/site-types";
import { imageAt } from "@/lib/image";
import { money, pct } from "@/lib/format";
import { refCents, setById, summaryOf } from "@/lib/data";
import { shortName } from "@/lib/names";
import { StockPill } from "./StockPill";
import { GridControls } from "./GridControls";
import { CONTROLS_MIN } from "@/lib/grid-sort";

/**
 * A product card (the engine's ProductCard, from MTG Compare): the art on a plate, the name, the set and number, the stock pill,
 * the headline price (TCGplayer market, lib/data.ts refCents) and "Compare N prices →". A plain click opens the quick view
 * (QuickView.tsx); the link itself stays for crawlers and new tabs.
 */
export function ProductTile({ p, change }: { p: Product; change?: number | null }) {
  const ref = refCents(p.id);
  const e = summaryOf(p.id);
  const ch = change !== undefined ? change : e.change7d;
  const stores = e.inStockSources;
  const set = setById(p.setId)?.name;
  const name = shortName(p.name);
  // The tile's facts for the listing's sort and filter bar (GridControls, lib/grid-sort.ts; owner, 2026-11-23 UX review, P0 3):
  // the price shown, % under TCGplayer's market for the cheapest in-stock US store, the set's release date and name.
  const us = e.best.find((o) => o.market === "US" && o.currency === "USD" && o.inStock && !["ebay", "tcgplayer", "amazon"].includes(o.source));
  const under = ref && us && us.cents < ref ? Math.round((1 - us.cents / ref) * 100) : null;
  return (
    <Link
      href={`/card/${p.slug}`}
      data-gp={ref ?? ""}
      data-gu={under ?? ""}
      data-gn={setById(p.setId)?.releasedOn ?? ""}
      data-gs={set ?? ""}
      data-gk={stores > 0 ? "1" : "0"}
      data-qv={p.slug}
      data-qv-name={name}
      data-qv-sub={[set, p.number].filter(Boolean).join(" · ") || undefined}
      data-qv-img={p.image ? imageAt(p.image, "400w")! : undefined}
      className="group card flex flex-col overflow-hidden p-2 transition-colors hover:border-ink/40"
    >
      <div className="plate pc-plate aspect-[5/7]">
        {p.image ? (
          <img src={imageAt(p.image, "400w")!} alt={`${name} ${p.kind === "card" ? "card" : ""}`} loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5 transition-transform group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs text-neutral-500">No image yet</div>
        )}
      </div>
      <div className="card-body flex flex-1 flex-col gap-1 px-1 pb-1 pt-2.5">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-ink group-hover:text-brand">{name}</p>
        <p className="truncate text-xs text-muted">{set}{p.number ? ` · ${p.number}` : ""}</p>
        <div className="mt-auto pt-1.5">
          <StockPill state={stores > 0 ? "open" : "soldout"} size="sm">
            {stores > 0 ? (
              <>
                In stock<span className="stock-unit"> · {stores} store{stores === 1 ? "" : "s"}</span>
              </>
            ) : (
              "Sold out"
            )}
          </StockPill>
        </div>
        <div className="flex flex-col gap-0.5">
          {/* The week's change sits beside the price it describes: on a 2-up phone card it no longer runs off the edge. */}
          <span className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="tabular text-base font-bold text-ink">{money(ref)}</span>
            {ch != null && <span className={`tabular text-xs font-semibold ${ch >= 0 ? "text-up" : "text-down"}`}>{pct(ch)}</span>}
          </span>
          <span className="text-[11px] font-semibold text-brand">Compare {e.listedSources} price{e.listedSources === 1 ? "" : "s"} →</span>
        </div>
      </div>
    </Link>
  );
}

/** `rail`: one sideways row on a phone (the home page's shelves, 2026-11-19), the usual grid from sm up. */
/** `controls`: a full listing of 8+ products gets the sort and filter bar (owner, 2026-11-23 UX review, P0 3); the server HTML keeps the page's one order. */
export function TileGrid({ items, rail, controls }: { items: Product[]; rail?: boolean; controls?: string }) {
  const bar = !!controls && !rail && items.length >= CONTROLS_MIN;
  const id = bar ? `grid-${controls}` : undefined;
  const sets = bar ? [...new Set(items.map((p) => setById(p.setId)?.name).filter((x): x is string => !!x))].sort() : [];
  return (
    <>
      {bar && <GridControls gridId={id!} sets={sets} />}
      <div id={id} className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6${rail ? " phone-rail scroller" : ""}`}>
        {items.map((p) => <ProductTile key={p.id} p={p} />)}
      </div>
    </>
  );
}
