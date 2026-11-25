import Link from "@/components/Link";
import type { Kit } from "@/lib/site-types";
import { kitBestByMarket, kitImage, kitInStockStores, kitOffers } from "@/lib/kits";
import { KitPrice } from "./KitPrice";
import { StockPill } from "./StockPill";
import { GridControls } from "./GridControls";
import { CONTROLS_MIN } from "@/lib/grid-sort";

/** A model kit card: the engine's product card with the box on a white plate. */
export function KitTile({ k, facet }: { k: Kit; facet?: "grade" | "scale" }) {
  const best = kitBestByMarket(k.jan);
  const stores = new Set(kitOffers(k.jan).map((o) => o.source)).size;
  const inStock = kitInStockStores(k.jan);
  return (
    <Link
      href={`/kit/${k.slug}`}
      // The sort and filter bar's facts (GridControls; owner, 2026-11-23 UX review, P0 3): the US price, the other facet, stock.
      data-gp={best.find((o) => o.market === "US")?.cents ?? ""}
      data-gs={(facet === "grade" ? k.scale : k.grade) ?? ""}
      data-gk={inStock > 0 ? "1" : "0"}
      className="group card flex flex-col overflow-hidden p-2 transition-colors hover:border-ink/40">
      <div className="plate pc-plate aspect-square">
        {k.image ? (
          <img src={kitImage(k.image, 400)} alt={`${k.name} box`} loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5 transition-transform group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs text-neutral-500">No image yet</div>
        )}
      </div>
      <div className="card-body flex flex-1 flex-col gap-1 px-1 pb-1 pt-2.5">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-ink group-hover:text-brand">{k.name}</p>
        <div className="mt-auto pt-1.5">
          <StockPill state={inStock > 0 ? "open" : "soldout"} size="sm">
            {inStock > 0 ? (
              <>
                In stock<span className="stock-unit"> · {inStock} store{inStock === 1 ? "" : "s"}</span>
              </>
            ) : (
              "Sold out"
            )}
          </StockPill>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="tabular text-base font-bold text-ink"><KitPrice best={best} /></span>
          <span className="text-[11px] font-semibold text-brand">Compare {stores} price{stores === 1 ? "" : "s"} →</span>
        </div>
      </div>
    </Link>
  );
}

/** `rail`: one sideways row on a phone (the home page, 2026-11-19), the usual grid from sm up. */
/** `facet`: a grade or scale listing of 8+ kits gets the sort and filter bar, filtering by the other facet. */
export function KitGrid({ items, rail, facet }: { items: Kit[]; rail?: boolean; facet?: "grade" | "scale" }) {
  const bar = !!facet && !rail && items.length >= CONTROLS_MIN;
  const id = bar ? `kits-${facet}` : undefined;
  const sets = bar ? [...new Set(items.map((k) => (facet === "grade" ? k.scale : k.grade)).filter((x): x is string => !!x))].sort() : [];
  return (
    <>
      {bar && <GridControls gridId={id!} sets={sets} setsLabel={facet === "grade" ? "scales" : "grades"} />}
      <div id={id} className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6${rail ? " phone-rail scroller" : ""}`}>
        {items.map((k) => <KitTile key={k.jan} k={k} facet={facet} />)}
      </div>
    </>
  );
}
