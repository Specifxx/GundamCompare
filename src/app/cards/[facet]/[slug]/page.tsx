import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { SITE } from "@/site.config";
import { canon } from "@/lib/site";
import { refCents, setById } from "@/lib/data";
import { money } from "@/lib/format";
import { shortName } from "@/lib/names";
import { attrFacet, attrFacets, attrHub, attrHubTitle } from "@/lib/hubs";
import { ChipList } from "@/components/ChipList";
import { TileGrid } from "@/components/ProductTile";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { fitTitle } from "@/lib/seo-title";

// One attribute hub (SITE.cardHubs): every card of one colour, type or
// franchise, most valuable first. Cached on first visit, never prerendered.
export const dynamic = "force-dynamic"; // one CDN copy per URL (next.config.js CDN_PAGES), never ISR

export function generateMetadata({ params }: { params: { facet: string; slug: string } }): Metadata {
  const f = attrFacet(params.facet);
  const h = attrHub(params.facet, params.slug);
  if (!f || !h) return {};
  const name = attrHubTitle(f.cfg, h.label);
  // Price-led snippet (2026-11-25, page scorecard of 23 Nov: /cards/trait/alphacide at position 4.6 and
  // /cards/trait/ghingnham-fleet at 8.3 had impressions and no clicks under "prices, most valuable first").
  // The searcher's answer goes first: the dearest card and its price, then the range. TCGplayer market only.
  // A TCGplayer "market" of $999, $9,999 or $99,999 is a seller's placeholder ask on a thin listing, not a price (an
  // Edition Beta Wing Gundam LR+ at $9,999 heads the Unit hub): the snippet skips such cards rather than put that
  // number in front of a searcher. The page's own grid is unchanged.
  const real = (c: number | null) => c != null && !(c >= 99900 && /^9+$/.test(String(Math.round(c / 100))));
  const priced = h.items.filter((p) => real(refCents(p.id)));
  const top = priced[0];
  const topCents = top ? refCents(top.id) : null;
  const lowCents = priced.length ? refCents(priced[priced.length - 1].id) : null;
  const topName = top ? shortName(top.name) : "";
  return {
    title: fitTitle([
      ...(top ? [`${name}: ${topName} ${money(topCents)}, ${priced.length} priced`, `${name}: top card ${money(topCents)}, ${priced.length} priced`] : []),
      `${name}: prices, most valuable first`,
      `${name}: prices`,
      name,
    ]),
    description: top
      ? `The most valuable ${h.label} card is ${topName} at ${money(topCents)}. All ${priced.length} priced ${h.label} ${SITE.game} cards${priced.length > 1 ? `, ${money(lowCents)} to ${money(topCents)}` : ""}, ranked by TCGplayer market price with the cheapest store for each. Updated daily.`
      : `All ${h.items.length} ${h.label} ${SITE.game} cards ranked by TCGplayer market price, with the cheapest store for each. Updated daily.`,
    ...canon(`/cards/${f.cfg.facet}/${h.slug}`),
  };
}

export default function AttrHubPage({ params }: { params: { facet: string; slug: string } }) {
  const f = attrFacet(params.facet);
  const h = attrHub(params.facet, params.slug);
  if (!f || !h) notFound();
  const name = attrHubTitle(f.cfg, h.label);
  const priced = h.items.filter((p) => refCents(p.id) != null);
  const top = priced[0];
  const over10 = priced.filter((p) => (refCents(p.id) ?? 0) >= 1000).length;
  // Which sets these cards come from, most first: a crawlable route to each set.
  const bySet = new Map<number, number>();
  for (const p of h.items) bySet.set(p.setId, (bySet.get(p.setId) ?? 0) + 1);
  const setChips = [...bySet.entries()].sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ s: setById(id), n })).filter((x) => x.s).map((x) => ({ key: x.s!.id, href: `/sets/${x.s!.slug}`, label: `${x.s!.name} (${x.n})` }));
  const others = attrFacets().filter((x) => x.cfg.facet !== f.cfg.facet);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ name: "Cards", href: "/cards" }, { name: `By ${f.cfg.noun[0]}`, href: `/cards/${f.cfg.facet}` }, { name: h.label }]} />
      <header>
        <h1 className="font-display text-3xl font-black">{name}: prices</h1>
        <p className="mt-2 text-muted">
          {h.items.length} {h.label} cards
          {priced.length ? `, from ${money(refCents(priced[priced.length - 1].id))} to ${money(refCents(priced[0].id))}` : ""}
          {over10 ? `; ${over10} of them are worth $10 or more` : ""}.
          {top ? <> The most valuable is <Link className="link" href={`/card/${top.slug}`}>{shortName(top.name)}</Link> at {money(refCents(top.id))}.</> : null} Open any card to compare every store and eBay.
        </p>
      </header>
      <TileGrid items={h.items.slice(0, 120)} controls="facet" />
      {h.items.length > 120 && <p className="text-sm text-muted">Showing the 120 most valuable of {h.items.length}. <Link className="link" href="/cards">Search every card</Link>.</p>}
      {setChips.length > 1 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">{h.label} cards by set</h2>
          <ChipList items={setChips} more="sets" />
        </section>
      )}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Other {f.cfg.noun[1]}</h2>
        <ChipList items={f.hubs.filter((x) => x.slug !== h.slug).map((x) => ({ key: x.slug, href: `/cards/${f.cfg.facet}/${x.slug}`, label: x.label }))} more={f.cfg.noun[1]} />
      </section>
      {others.map((o) => (
        <section key={o.cfg.facet}>
          <h2 className="mb-3 font-display text-lg font-bold">Browse by {o.cfg.noun[0]}</h2>
          <ChipList items={o.hubs.map((x) => ({ key: x.slug, href: `/cards/${o.cfg.facet}/${x.slug}`, label: x.label }))} more={o.cfg.noun[1]} />
        </section>
      ))}
    </div>
  );
}
