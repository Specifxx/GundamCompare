// Gunpla shops for the model-kit section (SITE.kits). Every store here was
// read by a probe on 2026-10-28 (a temporary Actions workflow over 285
// Shopify shops: the ~190 card stores below plus ~95 hobby shops): its
// collection's products.json returned Bandai kits whose SKU or description
// carries the JAN or Bandai's item number, which is how kits are matched
// (lib/import/kits.ts). Shops that sell Gunpla without either (Hobbies
// Online, Tokyo Toys…) are left out: their kits cannot be matched without
// guessing (Robot4Less and Gundam Place Store were too, until they began
// printing the JAN; added 2026-11-23). Keys equal the card store's key where
// the shop is the same. Metro Hobbies (metrohobbies.ca, Square Online) was
// asked for on 2026-10-29 but its pages carry no SKU, item number or JAN, so
// it is left out on the same rule. Metro Hobbies Australia (metrohobbies.com.au) is a
// different shop on Shopify whose SKUs are Bandai item numbers: added 2026-11-13.
// Gundams Plus (gundamsplus.com.au) has no SKU on most kits and Little Robot's site
// did not answer: both left out.
import type { KitStoreConfig } from "@/lib/site-types";

export const KIT_STORES: KitStoreConfig[] = [
  // United States
  { key: "gundamplanet", name: "Gundam Planet", base: "https://www.gundamplanet.com", market: "US", collections: ["gunpla"] },
  { key: "usagundamstore", name: "USA Gundam Store", base: "https://www.usagundamstore.com", market: "US", collections: ["bandai-model-kits"] },
  { key: "toyarena", name: "Toy Arena", base: "https://www.toyarena.com", market: "US", collections: ["gundam"] },
  { key: "allaccesscardshop", name: "All Access Card Shop", base: "https://allaccesscardshop.com", market: "US", collections: ["gunpla-model-kits"] },
  { key: "superanimestore", name: "Super Anime Store", base: "https://superanimestore.com", market: "US", collections: ["model-kits"] },
  { key: "japanfigure", name: "Japan Figure", base: "https://www.japan-figure.com", market: "US", collections: ["bandai-spirits"] },
  // US-first (owner, 2026-11-22): probed from an Actions runner over TCG Prices' 456 US stores and the US Gunpla shops
  // of the 2026-10-28 probe (scripts/probe-kit-stores.ts). Each matches 20+ kits on half or more of its kit listings by
  // the JAN or Bandai's item number: Galactic Toys 695 of 862, Mox Valley Games 585 of 591, Unplugged Gaming 83 of 83,
  // Nerdzoic 65 of 125, Retrofix Games 57 of 58, Shall We Play? 30 of 31.
  { key: "galactictoys", name: "Galactic Toys", base: "https://galactictoys.com", market: "US", collections: ["new-model-kits", "new-arrival-model-kits-july-2023", "bandai-models"] },
  { key: "moxvalleygames", name: "Mox Valley Games", base: "https://moxvalleygames.com", market: "US", collections: ["gundams", "all-model-kits"] },
  { key: "unpluggedgamestore", name: "Unplugged Gaming", base: "https://unpluggedgamestore.com", market: "US", collections: ["model-kits"] },
  { key: "nerdzoic", name: "Nerdzoic Toy Store", base: "https://nerdzoic.com", market: "US", collections: ["model-kits-1", "gunpla-model-kits-1"] },
  { key: "retrofixgames", name: "Retrofix Games", base: "https://retrofixgames.com", market: "US", collections: ["gunpla"] },
  { key: "shallweplaygames", name: "Shall We Play?", base: "https://shallweplaygames.com", market: "US", collections: ["gunpla"] },
  // Two big US Gunpla shops the 2026-10-28 probe left out (no JAN then) that now print it on many kits (the same probe's
  // 2026-11-22 run): Robot4Less 816 of 1,751 kit listings matched (94 in stock), Gundam Place Store 315 of 1,424 (89 in
  // stock). Under the "half" mark only because each lists many kits without a code, which are skipped, never guessed, as
  // at Union Gundam (35 of 2,359). Only Bandai JAN prefixes match, and keepConsistent still drops odd grades and prices.
  { key: "robot4less", name: "Robot4Less", base: "https://www.robot4less.com", market: "US", collections: ["high-grade", "master-grade", "other-model-kits", "gundam"] },
  { key: "gundamplacestore", name: "Gundam Place Store", base: "https://www.gundamplacestore.com", market: "US", collections: ["gundams", "high-grade", "master-grade"] },
  // United Kingdom
  { key: "travellingman", name: "Travelling Man", base: "https://www.travellingman.com", market: "UK", collections: ["model-kit-gunpla", "gundam"] },
  { key: "uniongundam", name: "Union Gundam", base: "https://www.uniongundam.co.uk", market: "UK", collections: ["all-gunpla"] },
  { key: "gundamlab", name: "GundamLAB", base: "https://gundamlab.com", market: "UK", collections: ["gunpla"] },
  { key: "dragoongaming", name: "Dragoon Gaming", base: "https://www.dragoongaming.co.uk", market: "UK", collections: ["gunadam-kits"] },
  { key: "gaijingadgets", name: "Gaijin Gadgets", base: "https://www.gaijingadgets.com", market: "UK", collections: ["gunpla", "gundam"] },
  { key: "lvlupgaming", name: "Lvl Up Gaming UK", base: "https://lvlupgaming.co.uk", market: "UK", collections: ["bandai-model-kit-gunpla"] },
  { key: "redsuncollectables", name: "Red Sun Collectables", base: "https://redsuncollectables.com", market: "UK", collections: ["gunpla"] },
  { key: "pucapucagames", name: "Puca Puca Games", base: "https://www.pucapucagames.co.uk", market: "UK", collections: ["gunpla"] },
  // Australia
  { key: "goodgames", name: "Good Games", base: "https://www.goodgames.com.au", market: "AU", collections: ["gundam"] },
  { key: "mechaexpressaustralia", name: "Mecha Express Australia", base: "https://mechaexpressaustralia.com.au", market: "AU", collections: ["all"] },
  { key: "hobbyco", name: "Hobbyco", base: "https://hobbyco.com.au", market: "AU", collections: ["all-products-gundam-gunpla"] },
  { key: "gamesportal", name: "Games Portal", base: "https://www.gamesportal.com.au", market: "AU", collections: ["model-kits"] },
  { key: "gapgames", name: "Gap Games", base: "https://www.gapgames.com.au", market: "AU", collections: ["gundam-kits", "gundam-hg", "gundam-mg", "gundam-rg", "gundam-pg", "gundam-entry-grade", "gundam-sdw"] },
  { key: "generalgames", name: "General Games Chirnside Park", base: "https://generalgames.com.au", market: "AU", collections: ["gundam"] },
  { key: "hobbycollectorsaustralia", name: "Hobby Collectors Australia", base: "https://hobbycollectorsaustralia.com.au", market: "AU", collections: ["gunpla"] },
  { key: "turtletcg", name: "Turtle TCG", base: "https://turtletcg.com.au", market: "AU", collections: ["gundam"] },
  // Named by r/Gunpla commenters under the 11 November 2026 post; each checked by hand on 2026-11-13: Shopify, the
  // SKU is Bandai's item number ("G5068839") on 248 of 250, 202 of 250, 207 of 250 and 221 of 250 products read.
  { key: "hearnshobbies", name: "Hearns Hobbies", base: "https://www.hearnshobbies.com", market: "AU", collections: ["gundam"] },
  { key: "hobbykitz", name: "Hobbykitz", base: "https://www.hobbykitz.com.au", market: "AU", collections: ["gundam-non-preorders", "gundam-pre-orders"] },
  { key: "metrohobbiesau", name: "Metro Hobbies", base: "https://www.metrohobbies.com.au", market: "AU", collections: ["gundam-kits-in-stock", "gundam-new-arrivals", "bandai-30-minute-missions"] },
  { key: "principalityofg", name: "Principality of G", base: "https://principalityofg.com.au", market: "AU", collections: ["all-gundam-kits"] },
  // Suggested through the store form (Megaculture, HobbyTech Toys); probed from an Actions runner on 2026-11-18: Shopify,
  // Bandai item number in the SKU ("G5063041") on 94 of 250 (Megaculture gundam), 124 of 131 and 35 of 37 (HobbyTech HG and MG).
  { key: "megaculture", name: "Megaculture", base: "https://megaculture.com.au", market: "AU", collections: ["hg-gundam", "mg-gundam", "rg-gundam"] },
  { key: "hobbytechtoys", name: "HobbyTech Toys", base: "https://hobbytechtoys.com.au", market: "AU", collections: ["gundam-hg-high-grade", "gundam-mg-master-grade", "gundam-rg-real-grade", "gundam-pg-perfect-grade", "gundam-eg-entry-grade", "gundam-sd-super-deformed"] },
  // Neto, not Shopify: category pages, each card naming the Bandai item number (owner's request, 2026-10-29).
  {
    key: "frontlinehobbies",
    name: "Frontline Hobbies",
    base: "https://www.frontlinehobbies.com.au",
    market: "AU",
    platform: "neto",
    collections: [
      "model-building/gundam-plastic-models/high-grade",
      "model-building/gundam-plastic-models/master-grade",
      "model-building/gundam-plastic-models/real-grade",
      "model-building/gundam-plastic-models/perfect-grade",
      "model-building/gundam-plastic-models/sd-gundam",
      "model-building/bandai-gundam-model-kits/gundam-other-grades",
      "model-building/gundam-gunpla-model-kits/30-minute-missions-sisters/30-minute-missions",
    ],
  },
  // Neto as well (r/Gunpla, three commenters, 2026-11-13): every card's "mpn" is the Bandai item number.
  {
    key: "rhyplabuilds",
    name: "Rhypla Builds",
    base: "https://www.rhyplabuilds.com.au",
    market: "AU",
    platform: "neto",
    collections: [
      "gunpla/hg-high-grade",
      "gunpla/mg-master-grade",
      "gunpla/rg-real-grade",
      "gunpla/pg-perfect-grade",
      "gunpla/eg-entry-grade",
      "gunpla/sd-gundam",
      "gunpla/re-100-reborn-one-hundred-ng-100",
      "gunpla/mega-mega-size",
      "gunpla/30mm-30-minute-mission",
    ],
  },
  // Canada
  { key: "401games", name: "401 Games", base: "https://store.401games.ca", market: "CA", collections: ["bandai-gunpla"] },
  { key: "bananagames", name: "Banana Games & Hobby", base: "https://bananagames.ca", market: "CA", collections: ["gundams", "bandai-model-kits"] },
  { key: "bentogaming", name: "Bento Gaming", base: "https://bentogaming.com", market: "CA", collections: ["gunpla-hg", "gunpla-mg", "gunpla-rg", "gunpla-pg", "gunpla-eg", "gunpla-sd", "gunpla-mgsd", "gunpla-non-grade", "gunpla-other", "megasize"] },
  { key: "pandahobby", name: "Panda Hobby", base: "https://pandahobby.ca", market: "CA", collections: ["gundam"] },
  { key: "torchlightgh", name: "Torchlight Games and Hobbies", base: "https://torchlightgh.com", market: "CA", collections: ["all-gunpla"] },
  { key: "zonegunpla", name: "Zone Gunpla", base: "https://www.zonegunpla.com", market: "CA", collections: ["high-grade", "master-grade", "realgrade", "perfect-grade", "entry-grade", "sd", "mgex", "mgsd", "precommandes"] },
  { key: "clawmebaby", name: "Claw Me Baby", base: "https://clawmebaby.ca", market: "CA", collections: ["gundams"] },
  // SKU is the Bandai item number (owner's request, 2026-10-29).
  { key: "gundamextra", name: "Gundam Extra", base: "https://gundamextra.com", market: "CA", collections: ["all"] },
];
