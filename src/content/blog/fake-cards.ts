import type { Post } from "./types";

export const post: Post = {
  slug: "how-to-spot-fake-gundam-card-game-cards",
  title: "How to spot fake Gundam Card Game cards: six checks before you buy",
  description:
    "Fake Gundam Card Game LRs and parallels are sold cheap on marketplaces. Six checks that catch them: the card number and rarity against a real printing, the foil, the back, the stock, the price and the seller.",
  date: "2026-11-05",
  keywords: ["fake gundam card game cards", "how to spot fake gundam cards", "counterfeit gundam card game", "gundam card game real or fake", "gundam tcg fake lr"],
  image: { src: "/blog/how-to-spot-fake-gundam-card-game-cards.jpg", alt: "How to spot fake Gundam Card Game cards: the six checks" },
  html: `
<p>The Gundam Card Game is a year old and its chase cards already cost enough to be worth faking. The fakes follow the pattern of every Bandai card game before it: the Legend Rares and the alternate-art parallels, sold singly at a price that is just low enough to tempt, or as a "complete LR set" that would be a steal if any of it were real. These six checks catch almost all of them.</p>

<h2>Which cards get faked</h2>
<p>The expensive ones. This is today's top ten by TCGplayer market price, rebuilt every morning. A listing for any of these at a fraction of the Market figure is a fake until the card proves otherwise.</p>
{{topall:10}}
<p>The longer list is on <a href="/blog/most-expensive-gundam-card-game-cards">the most expensive Gundam Card Game cards</a>; counterfeiters also target the LR+ and LR++ parallels, which our <a href="/blog/gundam-card-game-rarities-explained">rarities guide</a> explains.</p>

<h2>1. The card number and rarity must exist</h2>
<p>Every card carries a number in the form <b>GD01-001</b> (set code, then the card's number in the set) with its rarity beside it. The number tells you the exact printing, and this site lists every printing with its rarity. Search the card's name, open the result with the matching number, and compare: if the number is not in that set, or the rarity on the card was never printed with that number (an "LR" of a card that only exists as R, say), the card is not real. Counterfeit sets are full of parallels that were never printed.</p>

<h2>2. The foil must match the rarity</h2>
<p>Each rarity has a specific finish. The rare-plus parallels and LRs have a foil treatment with a fine, even pattern that shifts as you tilt the card, while the text stays crisp on top of it. Fakes most often show a flat rainbow sheen over the whole card, borders and text included, or are glossy with no shift at all. Tilt a known-real foil beside the suspect card: the difference is obvious in seconds. Bandai also prints a small holographic mark on the front of its cards; on a fake it is often a flat silver square with no image inside, or missing.</p>

<h2>3. The back</h2>
<p>The back of every card is identical, and it is the easiest comparison to make because any common from a pack you opened yourself is a perfect reference. Fakes are usually paler or more saturated, slightly blurred, or printed off-centre so one border is thicker than the other. The printing on a real back is sharp to the edge.</p>

<h2>4. The stock</h2>
<p>A real card is stiff and dense with a slight matte feel; it bends back flat and barely glows when held to a bright light. Fakes tend to be thinner, glossier or laminated-feeling, and often slightly off in size. Sleeve it with a real card and look at the edges: a size difference shows at once.</p>

<h2>5. The price</h2>
<p>Counterfeiters price to sell. Every card page here shows TCGplayer's market price, every store we track and the eBay listings for that exact printing, so a price can be judged in seconds. An LR at a third of market from a new seller, or a seller who happens to have every chase card in the game in perfect condition, is a warning. A "complete LR set" for the price of two real LRs is a box of fakes.</p>

<h2>6. The seller</h2>
<p>Buy from <a href="/stores">the stores we list</a>, each a real card shop, or from marketplace sellers with a long record of card sales and photos of the actual card front and back. Stock images, shipping from a country the English game is not distributed in, and lots of ten or twenty chase cards together are the usual signs of a counterfeit listing.</p>

<h2>If you already have one</h2>
<p>Marketplaces refund counterfeit goods: open a case with photos beside a real card and point to the number check. Do not pass it on. A proxy among friends is one thing; a fake in a trade or a sale is fraud.</p>
`,
  faq: [
    { q: "How can I tell if a Gundam Card Game card is fake?", a: "Check the card number and rarity against a real printing on this site, the foil against a known-real foil, the back against a common, and the price against the market. Most fakes fail at least two." },
    { q: "Where is the card number on a Gundam Card Game card?", a: "Along the bottom of the front, in the form GD01-001 with the rarity beside it. The number identifies the exact printing." },
    { q: "Are cheap LR lots on marketplaces real?", a: "A lot of every Legend Rare in the game at a fraction of the market price is a lot of fakes. Real LRs are pulled one per several boxes and are rarely sold in bulk." },
  ],
};
