import type { Post } from "./types";

// Facts: TCGplayer market prices in this site's catalogue on 2026-11-04 (the
// prices below are live tokens and move with the daily import). Set totals,
// medians and counts quoted in prose were computed from that day's snapshot.
export const post: Post = {
  slug: "gundam-card-game-market-six-sets-in",
  title: "Six sets in: how the Gundam Card Game market has moved, and where it goes next",
  description:
    "Booster box and LR++ prices from Newtype Rising to Stardust Trails: the first-set premium, the Freedom Ascension spike, what GD06 is doing in its first week, and what to expect from Blazing Fist in January.",
  date: "2026-11-04",
  keywords: ["gundam card game market", "gundam card game prices 2026", "gundam booster box prices", "lr++ prices", "stardust trails prices", "blazing fist gd07"],
  image: {
    src: "/blog/gundam-card-game-market-six-sets-in.jpg",
    alt: "Bar chart of Gundam Card Game booster box prices by set, Newtype Rising to Stardust Trails",
  },
  html: `
<p>The Gundam Card Game's English edition is sixteen months old and six main sets deep, with a seventh, Blazing Fist, due at the end of January. That is enough history to see a shape. This is a look at where the market has gone set by set, using the store and TCGplayer prices we track every day, and where we think it goes from here.</p>

<p>Every price in this post is a live market price from our catalogue. The totals and counts in the text were computed on 4 November 2026.</p>

<h2>The box curve: one spike, then a flat line</h2>
<p>Booster box prices by set, newest last:</p>
<ul>
<li><b>Newtype Rising (GD01)</b>, July 2025: {{card:619072}} at {{price:619072}}.</li>
<li><b>Dual Impact (GD02)</b>, October 2025: {{card:650748}} at {{price:650748}}.</li>
<li><b>Steel Requiem (GD03)</b>, January 2026: {{card:662114}} at {{price:662114}}.</li>
<li><b>Phantom Aria (GD04)</b>, April 2026: {{card:682302}} at {{price:682302}}.</li>
<li><b>Eternal Nexus (EB01)</b>, June 2026: {{card:693103}} at {{price:693103}}.</li>
<li><b>Freedom Ascension (GD05)</b>, July 2026: {{card:693621}} at {{price:693621}}.</li>
<li><b>Stardust Trails (GD06)</b>, 30 October 2026: {{card:710652}} at {{price:710652}}.</li>
</ul>
<p>The first set is the outlier, and it is the outlier for the usual reason: it was printed before anyone knew the game would work, then the game worked. Everything after it was printed to demand, and the boxes show it. GD02 to GD04 all sit within a US$40 band, and the newest box is cheaper than any of them because it is still being opened. The one set that broke the pattern after launch is Freedom Ascension, and it broke it with singles, not sealed.</p>

<h2>The LR++ curve: Freedom Ascension changed the ceiling</h2>
<p>The game's value lives in the LR++ alternate-art Legend Rares, one or two per set, and in the EX resource and base tokens. The top LR++ of each set today:</p>
<ul>
<li>GD01: {{card:645375}} at {{price:645375}}; {{card:645376}} at {{price:645376}}.</li>
<li>GD02: {{card:659292}} at {{price:659292}}.</li>
<li>GD03: {{card:675689}} at {{price:675689}}.</li>
<li>GD04: {{card:691970}} at {{price:691970}}.</li>
<li>EB01: {{card:702815}} at {{price:702815}}.</li>
<li>GD05: {{card:707601}} at {{price:707601}}; {{card:707600}} at {{price:707600}}.</li>
</ul>
<p>For a year the ceiling was roughly US$1,000 to US$1,200 for the single best card in a set, and GD03 did not even reach US$500. Then Freedom Ascension put two LR++ cards over US$2,500 and one near US$4,000. Its total card value across 197 priced cards is about US$14,470, with 23 cards over US$50. The next most valuable main set is GD01 at about US$5,290, and GD02, GD03 and GD04 together add up to less than GD05 alone.</p>

<p>Why GD05 and not the others? Licence and art. Wing Zero (Endless Waltz) and Strike Freedom are the two most recognisable mobile suits to buyers who grew up on Toonami-era Gundam, and the set paired them with the game's strongest alternate-art treatment so far. That is a one-off until Bandai prints another set with that mix, which is exactly what makes it the number to watch below.</p>

<h2>Stardust Trails, five days in</h2>
<p>GD06 released on 30 October. Its box trades at {{price:710652}}, the cheapest of the six main sets, and its singles are still settling: the most valuable priced cards so far are the special-art <b>Argama</b> and <b>Archangel</b> at {{price:727898}} and {{price:727899}}, with the LR++ parallels of ZZ Gundam and GP01Fb not yet priced on TCGplayer as we write this. The set page lists its cards most valuable first and updates each morning, so <a href="/sets/stardust-trails">watch it there</a> rather than taking a number from the first week: every GD set so far has had its top cards fall from the launch-week price once supply arrived, then find a floor in the second month. Our expectation is that GD06's ceiling lands between GD04's and GD05's, nearer GD04, because ZZ and 0083 are beloved but older licences with a smaller pool of buyers than SEED and Wing.</p>

<h2>The quiet money: tokens and starter decks</h2>
<p>Two things the box curve hides. First, the promotional EX tokens are the game's most consistently expensive cards: the serialized {{card:713274}} is listed at {{price:713274}}, and the median promotional EX resource token is over US$40. Second, the first four starter deck displays from July 2025 are the game's best-performing sealed product, at {{price:619092}}, {{price:619112}}, {{price:619151}} and {{price:619176}}, against US$75 to US$140 for every display printed since. First print runs of a new game age well; later ones do not.</p>

<h2>What is coming</h2>
<p><a href="/sets/blazing-fist">Blazing Fist (GD07)</a> is set for 29 January 2027. Between now and then the market has no new main set, which in the game's first year meant the current set's chase cards climbed slowly through the gap. Three things we are watching:</p>
<ul>
<li><b>Freedom Ascension's box.</b> At {{price:693621}} it is the one post-GD01 box that has gone up, not down. If it keeps climbing through the gap, the game has a genuine collector market and not just a player market.</li>
<li><b>GD06's LR++ pair.</b> Where ZZ Gundam and GP01Fb settle in December tells you whether GD05 was the new normal or a spike.</li>
<li><b>Store spread.</b> Across the stores we compare, a sealed box of the current set is usually US$20 to US$40 apart from cheapest to dearest, which is more than most boxes move in a month. The <a href="/sealed">sealed price guide</a> shows every store's price, and the <a href="/preorders">pre-order tracker</a> will list Blazing Fist as stores open orders.</li>
</ul>
`,
  faq: [
    {
      q: "Which Gundam Card Game set is the most valuable?",
      a: "Freedom Ascension (GD05). On 4 November 2026 its priced cards added up to about US$14,470, with Wing Gundam Zero (EW) LR++ and Strike Freedom Gundam LR++ both over US$2,500. Newtype Rising (GD01) is second because of its first-print premium.",
    },
    {
      q: "Why is the Newtype Rising booster box so expensive?",
      a: "It was the game's first set, printed before demand was known, and it has not been reprinted in the same way later sets were. Every set printed after it sits in a far narrower price band.",
    },
    {
      q: "When is the next Gundam Card Game set?",
      a: "Blazing Fist (GD07) is listed for 29 January 2027. Stardust Trails (GD06) released on 30 October 2026.",
    },
  ],
};
