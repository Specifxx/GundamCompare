import { SITE } from "@/site.config";

// Titles the way Rift Compare writes them (its card and set pages, DECISIONS.md
// "Titles that fit"): Google cuts a title around 60 characters, so each page
// offers a ladder of candidates, longest and most specific first, and takes the
// first that fits. Each candidate is tried with " | <site>" and then bare, so a
// title keeps the brand when it fits and never gives up words people search for it.

export const TITLE_MAX = 60;

/** The first candidate that fits, as an absolute title (the layout's template would add the brand again). */
export function fitTitle(candidates: string[], max = TITLE_MAX): { absolute: string } {
  const suffix = ` | ${SITE.name}`;
  for (const t of candidates) {
    if (`${t}${suffix}`.length <= max) return { absolute: `${t}${suffix}` };
    if (t.length <= max) return { absolute: t };
  }
  return { absolute: candidates[candidates.length - 1] };
}

/** "Card List: All 120 Cards + Prices" for a set page, the phrase Rift Compare's set pages rank for. */
export function setTitleCandidates(setName: string, cardCount: number, upcoming = false): string[] {
  const g = SITE.gameShort;
  const named = setName.toLowerCase().includes(g.toLowerCase()) ? setName : `${g} ${setName}`;
  // Spoiler season (Rift Compare's best non-brand searches, "riftbound legacy spoilers"): until release day a set with
  // revealed cards is titled for the spoiler search; release day turns it back into the card list at the same URL.
  if (upcoming && cardCount > 0)
    return [`${named} Spoilers: ${cardCount} Cards Revealed + Prices`, `${named} Spoilers: ${cardCount} Cards Revealed`, `${setName} Spoilers: ${cardCount} Cards Revealed`, `${setName} Spoilers`];
  return [
    ...(cardCount > 0 ? [`${named} Card List: All ${cardCount} Cards + Prices`, `${setName} Card List: All ${cardCount} Cards + Prices`] : []),
    `${named} Card List & Prices`,
    `${setName} Card List & Prices`,
    `${setName} Card List`,
  ];
}

/**
 * "<Card> <number> Price — <game> <set>", stepping down to the card and its number. With today's reference price
 * (2026-11-10: card pages ranked 5th to 8th for "zz gundam lr+" and the like with 0 clicks in 28 days), the price
 * leads: "<Card> <number> Price: $76.28 — <set>", the one fact the searcher came for, visible in the result itself.
 */
export function cardTitleCandidates(name: string, number: string | null, setName: string | null, sealed: boolean, price: string | null = null): string[] {
  const g = SITE.gameShort;
  // Store names often carry the number already ("Jagd Doga (GD05-057)"): say it once.
  const bare = number ? name.replace(` (${number})`, "") : name;
  const head = number && !sealed && !bare.includes(number) ? `${bare} ${number}` : bare;
  const out: string[] = [];
  if (price) {
    if (setName && !bare.includes(setName)) out.push(`${head} Price: ${price} — ${g} ${setName}`, `${head} Price: ${price} — ${setName}`);
    out.push(`${head} Price: ${price}`);
  }
  if (setName && !bare.includes(setName)) out.push(`${head} Price — ${g} ${setName}`, `${head} Price — ${setName}`);
  out.push(`${head} Price — ${g}`, `${head} Price`, head);
  return out;
}

/** "<Kit> Price: $X (N shops)", stepping down; without a US price it keeps the old "price: compare N shops" wording. */
export function kitTitleCandidates(name: string, price: string | null, stores: number): string[] {
  const out: string[] = [];
  if (price) out.push(`${name} Price: ${price} (${stores} shops)`, `${name} Price: ${price}`);
  out.push(`${name} price: compare ${stores} shops`, `${name} Price`, name);
  return out;
}

export const DESCRIPTION_MAX = 160;

const IN_MARKET: Record<string, string> = { US: "in the US", UK: "in the UK", CA: "in Canada", AU: "in Australia", EU: "in Europe", SG: "in Singapore" };

/**
 * A kit page's meta description (2026-11-21, the site file's backlog item 3): the price and the kit's grade and scale lead,
 * like the title (#177), so the result says what the searcher came for before the click. The price is the US shop price
 * when one has it in stock; else the first other market that does, named (1,513 kit pages had no in-stock US shop,
 * 2026-11-13); else it says the kit is sold out and that a restock email is free. Shops only: never eBay or Amazon.
 * Candidates longest first; the first that fits 160 characters wins, the last is returned whatever its length.
 */
export function kitDescriptionCandidates(o: {
  name: string;
  gradeLabel: string | null;
  scale: string | null;
  jan: string;
  /** The cheapest in-stock shop price and its market, already formatted ("$24.99"). */
  lead: { price: string; market: string; inStockShops: number } | null;
  stores: number;
  alerts: boolean;
}): string[] {
  const facts = [o.gradeLabel, o.scale].filter(Boolean).join(" ");
  const kind = facts ? `${facts} model kit` : "Model kit";
  const shops = (n: number) => `${n} hobby shop${n === 1 ? "" : "s"}`;
  const out: string[] = [];
  if (o.lead) {
    const head = `${o.name} from ${o.lead.price} ${IN_MARKET[o.lead.market] ?? `in ${o.lead.market}`}`;
    const stock = `in stock at ${shops(o.lead.inStockShops)} today`;
    out.push(
      `${head}, ${stock}. ${kind}, compared across ${shops(o.stores)} in the US, UK, Canada and Australia, matched by JAN barcode ${o.jan}.`,
      `${head}, ${stock}. ${kind}, compared across ${shops(o.stores)}, matched by JAN barcode.`,
      `${head}, ${stock}. ${kind}, matched by JAN barcode.`,
      `${head}. ${kind}, matched by JAN barcode.`,
      `${head}.`,
    );
  } else {
    const tail = o.alerts ? " Get a free email when it is back in stock." : "";
    out.push(
      `${o.name}: sold out at the ${shops(o.stores)} we track today. ${kind}, matched by JAN barcode ${o.jan}.${tail}`,
      `${o.name}: sold out at the ${shops(o.stores)} we track today. ${kind}, matched by JAN barcode.${tail}`,
      `${o.name}: sold out at the ${shops(o.stores)} we track today.${tail}`,
      `${o.name}: sold out at the ${shops(o.stores)} we track today.`,
    );
  }
  return out;
}

export function fitDescription(candidates: string[], max = DESCRIPTION_MAX): string {
  return candidates.find((d) => d.length <= max) ?? candidates[candidates.length - 1];
}
