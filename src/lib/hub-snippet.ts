// Price-led titles and descriptions for the rarity hubs and the colour / type index pages (page scorecard of 23 Nov,
// Job D: /cards/rarity/lr-plus-plus 14 impressions at position 10.9, /cards/color 12 at 7.8 and /cards/type 16 at 36.8,
// none clicked). The same rule as the trait hubs (2026-11-25): the searcher's answer goes first, the dearest card and its
// TCGplayer market price, then the range. A placeholder "market" ($999, $9,999, $99,999) is never put in a snippet.
// Pure: the pages hand in names and prices, most valuable first. The pages' own grids and tables are unchanged.
import { money } from "./format";
import { isPlaceholderMarket } from "./set-readout";

export interface SnippetCard {
  name: string;
  /** TCGplayer market price, US cents; null when TCGplayer has none. */
  cents: number | null;
}

const real = (c: number | null): c is number => c != null && !isPlaceholderMarket(c);

/** Title candidates (longest first, for fitTitle) and the description of one rarity hub. */
export function rarityHubSnippet(game: string, gameShort: string, label: string, items: SnippetCard[]) {
  // "Wing Gundam Zero (EW) (LR++)" on the LR++ hub says its rarity twice: the hub's own label is dropped from the name.
  const own = new RegExp(`\\s*\\(${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\s*$`);
  const priced = items
    .filter((p) => real(p.cents))
    .map((p) => ({ ...p, name: p.name.replace(own, "") }))
    .sort((a, b) => b.cents! - a.cents!);
  const top = priced[0];
  const low = priced[priced.length - 1];
  const name = `${label} ${gameShort} cards`;
  const titles = [
    ...(top
      ? [`${name}: ${top.name} ${money(top.cents)}, ${priced.length} priced`, `${name}: top card ${money(top.cents)}, ${priced.length} priced`]
      : []),
    `${label} ${gameShort} card prices, most valuable first`,
    `${label} ${gameShort} card prices`,
  ];
  const description = top
    ? `The most valuable ${label} card is ${top.name} at ${money(top.cents)}. All ${priced.length} priced ${label} ${game} cards${priced.length > 1 ? `, ${money(low.cents)} to ${money(top.cents)}` : ""}, ranked by TCGplayer market price with the cheapest store for each. Updated daily.`
    : `All ${items.length} ${label} ${game} cards ranked by TCGplayer market price, with the cheapest store for each. Updated daily.`;
  return { titles, description };
}

export interface FacetRow {
  label: string;
  count: number;
  /** The hub's cards, most valuable first. */
  items: SnippetCard[];
}

/** Title candidates and description of a colour / type index: the values by size, then each one's dearest card. */
export function facetIndexSnippet(game: string, gameShort: string, noun: [string, string], rows: FacetRow[]) {
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const labels = sorted.map((r) => r.label);
  const tops = sorted
    .map((r) => ({ label: r.label, top: r.items.filter((p) => real(p.cents)).sort((a, b) => b.cents! - a.cents!)[0] }))
    .filter((r): r is { label: string; top: SnippetCard } => !!r.top);
  const overall = [...tops].sort((a, b) => b.top.cents! - a.top.cents!)[0];
  const head = `${gameShort} cards by ${noun[0]}`;
  const titles: string[] = [];
  // As many values as fit, largest first: "Gundam cards by card type: Unit, Pilot, Command, Base prices".
  for (let n = labels.length; n >= 2; n--) titles.push(`${head}: ${labels.slice(0, n).join(", ")} prices`);
  if (overall) titles.push(`${head}: top card ${money(overall.top.cents)}`);
  titles.push(`${head}: prices for every ${noun[0]}`, head);
  // Dearest first and only three, so the line fits the ~155 characters Google shows.
  const lead = [...tops]
    .sort((a, b) => b.top.cents! - a.top.cents!)
    .slice(0, 3)
    .map((t) => `${t.label}: ${t.top.name} ${money(t.top.cents)}`)
    .join("; ");
  const description = tops.length
    ? `The most valuable ${game} card of each ${noun[0]}: ${lead}. All ${rows.length} ${noun[1]} with card counts and median price, every store compared. Updated daily.`
    : `All ${rows.length} ${game} ${noun[1]} with card counts, median price and the most valuable card in each. Compare every store.`;
  return { titles, description };
}
