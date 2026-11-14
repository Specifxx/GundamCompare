import type { Metadata } from "next";
import { SITE } from "@/site.config";
import { canon } from "@/lib/site";
import { meta } from "@/lib/data";
import { MARKET_LABEL } from "@/lib/site-types";
import { StaticPage } from "@/components/StaticPage";
import { kitStoreStatus } from "@/lib/kits";
import { SuggestStore } from "@/components/ReportForms";

export const revalidate = 86400;
export const metadata: Metadata = { title: `${SITE.gameShort} stores we compare`, description: `Every online ${SITE.game} store ${SITE.name} compares, by country.`, ...canon("/stores") };

const listings = (n: number) => `${n.toLocaleString()} listing${n === 1 ? "" : "s"} matched`;

export default function Stores() {
  const m = meta();
  const markets = [...new Set(SITE.stores.map((s) => s.market))];
  return (
    <StaticPage title={`${SITE.gameShort} stores we compare`}>
      <p>Plus TCGplayer and eBay (US, UK, Australia and Canada). Know a store we should compare? <a href="#suggest">Suggest it below</a>. Run one? <a href="/list-your-store">List your store</a>, free. Every store is checked before it is listed and every week after: <a href="/how-we-pick-stores">how we pick stores</a>.</p>
      {markets.map((mk) => (
        <section key={mk}>
          <h2>{MARKET_LABEL[mk]}</h2>
          <ul className="store-list">
            {SITE.stores.filter((s) => s.market === mk).map((s) => (
              <li key={s.key}><a href={s.base} rel="noopener nofollow">{s.name}</a> {m?.stores[s.key]?.matched ? <span>{listings(m.stores[s.key].matched)}</span> : null}</li>
            ))}
          </ul>
        </section>
      ))}
      {SITE.kits && (
        <section>
          <h2>{SITE.kits.label} shops</h2>
          <p>For <a href="/kits">{SITE.kits.noun}</a>, matched by the barcode on the box.</p>
          <ul className="store-list">
            {SITE.kits.stores.map((s) => (
              <li key={s.key}><a href={s.base} rel="noopener nofollow">{s.name}</a> <span>{MARKET_LABEL[s.market]}{kitStoreStatus()[s.key]?.matched ? `, ${kitStoreStatus()[s.key].matched.toLocaleString()} kit${kitStoreStatus()[s.key].matched === 1 ? "" : "s"} matched` : ""}</span></li>
            ))}
          </ul>
        </section>
      )}
      <section id="suggest">
        <h2>Suggest a store</h2>
        <p>Tell us about a {SITE.gameShort} store we don&apos;t compare yet. We check every suggestion and add the store if we can read its prices.</p>
        <SuggestStore regions={markets.map((mk) => [mk, MARKET_LABEL[mk]])} what={`${SITE.gameShort} products`} buttonClassName="btn-primary" />
      </section>
    </StaticPage>
  );
}
