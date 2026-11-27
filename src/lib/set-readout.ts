// The set page's card read-out (page scorecard of 23 Nov, Job D: /sets/eternal-nexus "seen but ranks too low",
// 17 impressions at position 15.6). Ported from Rift Compare's set template as Lorcana Compare runs it
// (lib/set-readout.ts there, DECISIONS.md 2026-11-24): "About <set> card prices" and "How to read <set> prices",
// sentences only this set's own rows can produce. Pure: the page hands in each card's name, rarity, TCGplayer
// market price and whether a store we track has it in stock today.
//
// A TCGplayer "market" of $999, $9,999 or $99,999 is a seller's placeholder ask on a thin listing, not a price
// (the same rule as the trait / colour / type hub snippets, 2026-11-25): such a card counts as unpriced here.
import { money } from "./format";

export interface ReadoutCard {
  name: string;
  rarity: string | null;
  /** TCGplayer market price, US cents; null when TCGplayer has none. */
  cents: number | null;
  /** At least one store we track (never eBay, TCGplayer or Amazon) has it in stock today. */
  inStock: boolean;
}

export interface SetReadout {
  about: string[];
  facts: string | null;
  /** The most valuable priced card ("Name (rarity)") and its price, for the page's snippet. */
  top: { label: string; cents: number } | null;
  /** One of each priced card, US cents. */
  totalCents: number;
}

export function isPlaceholderMarket(cents: number | null | undefined): boolean {
  return cents != null && cents >= 99900 && /^9+$/.test(String(Math.round(cents / 100)));
}

const median = (xs: number[]): number | null => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

const label = (c: ReadoutCard) => `${c.name}${c.rarity && !c.name.includes(`(${c.rarity})`) ? ` (${c.rarity})` : ""}`;

export function setReadout(setName: string, cards: readonly ReadoutCard[]): SetReadout {
  const priced = cards
    .filter((c): c is ReadoutCard & { cents: number } => c.cents != null && c.cents > 0 && !isPlaceholderMarket(c.cents))
    .sort((a, b) => b.cents - a.cents);
  if (!priced.length) return { about: [], facts: null, top: null, totalCents: 0 };
  const about: string[] = [];
  const total = priced.reduce((a, c) => a + c.cents, 0);
  const top = priced.slice(0, 10);
  const topShare = Math.floor((top.reduce((a, c) => a + c.cents, 0) / total) * 100);
  const lead = priced.slice(0, 3).map((c) => `${label(c)} at ${money(c.cents)}`);
  about.push(
    `${priced.length === cards.length ? `All ${cards.length}` : `${priced.length} of the ${cards.length}`} ${setName} cards have a TCGplayer market price today, and one of each comes to ${money(total)}. ` +
      (priced.length > 10 ? `The ten most valuable make up ${topShare}% of that, led by ` : "The most valuable is ") +
      `${lead[0]}${lead.length > 1 ? `, then ${lead.slice(1).join(" and ")}` : ""}.`,
  );
  const mid = median(priced.map((c) => c.cents));
  const cheap = priced.filter((c) => c.cents <= 100).length;
  if (mid != null && priced.length >= 5) {
    about.push(
      `The middle card of the set costs ${money(mid)}` +
        (cheap ? `, and ${cheap} of the priced cards are ${money(100)} or less, so the set's value sits in the chase cards at the top of the list.` : "."),
    );
  }
  const stocked = cards.filter((c) => c.inStock).length;
  about.push(
    stocked === cards.length
      ? `Every ${setName} card is in stock at one or more of the stores we track today.`
      : stocked === 0
        ? `No store we track has a ${setName} single in stock today; the list shows TCGplayer's market price until one does.`
        : `${stocked} of the ${cards.length} cards are in stock at one or more of the stores we track today; the rest show TCGplayer's market price until a store lists them.`,
  );
  const tally = new Map<string, number>();
  for (const c of top) if (c.rarity) tally.set(c.rarity, (tally.get(c.rarity) ?? 0) + 1);
  const [rarity, n] = [...tally].sort((x, y) => y[1] - x[1])[0] ?? [null, 0];
  const low = priced.length > 1 ? priced[priced.length - 1] : null;
  const facts =
    `The most valuable ${setName} card today is ${label(priced[0])}, at ${money(priced[0].cents)}` +
    (low ? `; the cheapest priced one is ${label(low)}, at ${money(low.cents)}` : "") +
    "." +
    (rarity && priced.length >= 10 && n >= 5 ? ` ${n} of the ten most valuable are ${rarity} cards.` : "");
  return { about, facts, top: { label: label(priced[0]), cents: priced[0].cents }, totalCents: total };
}
