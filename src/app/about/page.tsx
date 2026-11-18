import type { Metadata } from "next";
import { SITE } from "@/site.config";
import { canon } from "@/lib/site";
import { StaticPage } from "@/components/StaticPage";

export const revalidate = 86400;
export const metadata: Metadata = { title: `About ${SITE.name}`, description: `Who runs ${SITE.name}, how it compares ${SITE.game} and Gunpla prices, how it makes money and what it costs to run.`, ...canon("/about") };

export default function About() {
  return (
    <StaticPage title={`About ${SITE.name}`}>
      <p>{SITE.name} is a free price comparison site for {SITE.game}. Every day it collects the price of every {SITE.gameShort} card and sealed product from TCGplayer, eBay and {SITE.stores.length} online game stores in the US, UK, Canada, Australia and Europe, and puts them side by side, cheapest first.</p>
      <h2>Who runs it</h2>
      <p>
        {SITE.name} is run by its two co-founders, Bill and George. It started as the tool we wanted ourselves: Gunpla shops price the same kit very differently, and checking a dozen of them before buying one HG takes longer than
        building it. Nobody else owns or funds the site, and no shop, distributor or Bandai pays to appear or to rank higher.
      </p>
      <p>
        AI tools help us write the code and the guides. The prices are never typed in by anyone: a program reads each shop&apos;s own listing every day, matches a kit only by the barcode (JAN) printed on its box and a card only by its number and
        name, and drops anything it can&apos;t match for certain.
      </p>
      <h2>What it costs to run</h2>
      <p>
        Hosting, the daily price reads, data and software for {SITE.name} and the other price guides we run cost us about A$790 a month (our own books, the 30 days to 15 November 2026). The commissions below pay for it; when they
        don&apos;t, we cover the rest.
      </p>
      {SITE.disclaimer && <p>{SITE.disclaimer}</p>}
      <h2>How we make money</h2>
      <p>Some buy links are affiliate links (eBay Partner Network, TCGplayer, Amazon): if you buy, the store may pay us a small commission at no cost to you. Amazon, eBay and TCGplayer, our affiliate partners, head each price table whatever their price, with &ldquo;Best price&rdquo; still marking the cheapest. The stores below them are ranked by price only — a store that pays us nothing ranks exactly where its price puts it.</p>
      <h2>Contact</h2>
      <p>Spotted a wrong price, or run a store that sells {SITE.gameShort}? <a href="/contact">Get in touch</a> or email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.</p>
    </StaticPage>
  );
}
