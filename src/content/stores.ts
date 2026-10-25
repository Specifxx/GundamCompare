// Verified Shopify stores (research/stores.json, checked 2026-10-24: each
// collection's products.json returned this game's products). Add a store only
// after the same check — a Shopify path pointed at the wrong collection fails
// silently. English-language product only.
import type { StoreConfig } from "@/lib/site-types";

export const STORES: StoreConfig[] = [
  { key: "bardsandcards", name: "Bards & Cards", base: "https://singles.bardsandcards.com", market: "US", collections: ["gundam-card-game-singles", "gundam-card-game-newtype-rising-gd01-singles", "gundam-card-game-dual-impact-gd02-singles", "gundam-card-game-steel-requiem-gd03-singles"], kind: "singles" },
  { key: "mysterymtg", name: "Mystery MTG", base: "https://mysterymtg.com", market: "US", collections: ["gundam-card-game-singles", "gundam-card-game"], kind: "both" },
  { key: "capefear", name: "Cape Fear Collectibles", base: "https://www.capefearcollectibles.com", market: "US", collections: ["gundam-card-game-singles", "gundam-card-game-sealed"], kind: "both" },
  { key: "pokeboxusa", name: "PokeBox USA", base: "https://www.pokeboxusa.com", market: "US", collections: ["gundam-tcg-single-cards", "gundam-tcg"], kind: "both" },
  { key: "doubleinfinity", name: "Double Infinity Gaming", base: "https://doubleinfinitygaming.com", market: "US", collections: ["gundam-ccg"], kind: "sealed" },
  { key: "flipside", name: "Flipside Gaming", base: "https://flipsidegaming.com", market: "US", collections: ["gundam-card-game-booster-boxes-cases-starter-sets-more"], kind: "sealed" },
  { key: "kanzen", name: "Kanzen Games", base: "https://www.kanzengames.com", market: "CA", collections: ["gundam-singles-in-stock", "gundam-cg-sealed"], kind: "both" },
  { key: "realmhoppers", name: "Realm Hoppers", base: "https://www.realmhoppers.com", market: "CA", collections: ["gundam-tcg"], kind: "singles" },
  { key: "hfxgames", name: "HFX Games", base: "https://hfxgames.com", market: "CA", collections: ["gundam-singles-instock"], kind: "singles" },
  { key: "thistletavern", name: "Thistle Tavern", base: "https://thistletavern.com", market: "UK", collections: ["gundam-singles"], kind: "singles" },
  { key: "ultrararecards", name: "Ultra Rare Cards", base: "https://ultrararecards.co.uk", market: "UK", collections: ["gundam-singles-cards"], kind: "singles" },
  { key: "totalcards", name: "Total Cards", base: "https://totalcards.net", market: "UK", collections: ["gundam-tcg-single-cards"], kind: "singles" },
  { key: "gundamlab", name: "GundamLAB", base: "https://gundamlab.com", market: "UK", collections: ["gundam-card-game", "gundam-tcg-booster-box", "gundam-tcg-starter-decks"], kind: "sealed" },
  { key: "goblingaming", name: "Goblin Gaming", base: "https://www.goblingaming.co.uk", market: "UK", collections: ["gundam-tcg"], kind: "sealed" },
  { key: "thirstymeeples", name: "Thirsty Meeples", base: "https://www.thirstymeeples.co.uk", market: "UK", collections: ["gundam-card-game"], kind: "sealed" },
  { key: "gamesportal", name: "Games Portal", base: "https://www.gamesportal.com.au", market: "AU", collections: ["gundam-card-game-sealed", "gundam-card-game-preorders"], kind: "sealed" },
  { key: "gameology", name: "Gameology", base: "https://www.gameology.com.au", market: "AU", collections: ["gundam-card-game"], kind: "sealed" },
  { key: "gamesempire", name: "Games Empire", base: "https://www.gamesempire.com.au", market: "AU", collections: ["gundam-card-game"], kind: "sealed" },
];
