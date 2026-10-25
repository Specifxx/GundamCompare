// The ONE game-specific configuration file. Lorcana Compare and Gundam Compare
// run the same engine (the Rift Compare playbook, rebuilt lean); everything
// that differs between them — names, colours, data sources, stores, copy —
// lives here or in src/content/. Keep engine code free of game names.
import type { SiteConfig } from "@/lib/site-types";
import { STORES } from "@/content/stores";

export const SITE: SiteConfig = {
  key: "gundam",
  name: "Gundam Compare",
  shortName: "GundamCompare",
  wordmark: ["GUNDAM", "COMPARE"],
  game: "Gundam Card Game",
  gameShort: "Gundam",
  domain: "gundamcompare.com",
  tagline: "Compare Gundam Card Game prices across every store",
  description:
    "Free Gundam Card Game price comparison: live prices for every Gundam TCG card, parallel and booster box across TCGplayer, eBay and game stores in the US, UK, Canada and Australia.",
  keywords: [
    "gundam card game prices",
    "gundam tcg prices",
    "gundam card game price guide",
    "gundam booster box price",
    "gundam card game parallel prices",
    "gd06 stardust trails price",
  ],
  adminEmails: ["bill.jyang101@gmail.com"],
  supportEmail: "riftcompare@gmail.com",
  ownerEmail: "bill.jyang101@gmail.com",

  tcgcsvCategoryId: 86,
  tcgplayerSlug: "gundam-card-game",
  ebay: {
    query: "gundam",
    singlesCategoryId: "183454",
    sealedCategoryId: "183456",
    minPriceUsd: 20,
    dailyBudget: 2500,
    // Lorcana Compare runs at 06 UTC on the same eBay app; eBay's daily count
    // resets at midnight Pacific, so each eBay day holds one run of each site.
    runHourUtc: 18,
  },

  // Card numbers look like "GD02-048" (unique across sets; parallels share it).
  numberStyle: "code",
  rarityOrder: ["LR++", "LR+", "Legend Rare", "R+", "Rare", "U+", "Uncommon", "C++", "C+", "Common", "Promo"],
  chaseRarities: ["LR++", "LR+", "R+"],

  theme: {
    brand: "#3d7bff",
    brandLight: "#7aa5ff",
    brandDark: "#2557c9",
    accent: "#e5303f",
    pageDark: "#070b14",
    inkDark: ["#05080f", "#0a0f1b", "#0f1626", "#151e33", "#24304d", "#37476d"],
    wordmarkGradient: "linear-gradient(180deg, #ffffff 0%, #b9ceff 45%, #3d7bff 100%)",
    displayFont: "Orbitron",
  },
  halloween: {
    headline: "Night Raid: Zeon's in the shadows until 31 October",
    blurb: "Halloween on the battlefield — hunt down the cheapest Legend Rare parallels before the clock strikes midnight.",
  },

  stores: STORES,
  sisterSites: [
    { name: "Rift Compare", url: "https://riftcompare.com", game: "Riftbound" },
    { name: "OP Compare", url: "https://opcompare.app", game: "One Piece" },
    { name: "Lorcana Compare", url: "https://lorcanacompare.com", game: "Disney Lorcana" },
    { name: "DexCompare", url: "https://www.dexcompare.app", game: "Pokémon" },
    { name: "MTG Compare", url: "https://mtgcompare.app", game: "Magic" },
  ],
  social: { reddit: "https://www.reddit.com/r/GundamTCG/" },
};
