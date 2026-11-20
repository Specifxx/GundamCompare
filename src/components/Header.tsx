import Link from "@/components/Link";
import { SITE } from "@/site.config";
import { ebaySearchUrl, goHref } from "@/lib/affiliate";
import { navGroups, type NavGroup } from "@/lib/nav";
import { shopNav, type ShopMenus } from "@/lib/shop-nav";
import { historyOn } from "@/lib/data";
import { holidayNav } from "@/lib/holiday-nav";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { MarketPicker } from "./ClientPrefs";
import { HeaderNavItems, type HeaderNavItem } from "./HeaderNav";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBox } from "./SearchBox";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import { AccountHeaderLink, PremiumHeaderLink } from "@/components/premium/AccountHeaderLink";

/**
 * The desktop nav (lg and up), in order: Cards, Sealed, Gunpla (SITE.kits), Deals, More, Guides. Cards, Sealed and Gunpla open a
 * dropdown of the game's own dimensions (colour, rarity, type, set / product type / grade, scale: lib/shop-nav.ts); More opens the
 * rest of the site (deals, tools, guides). `also`: other paths that count as the section, for its current state.
 */
export function headerNavItems(all: NavGroup[], shop: ShopMenus, sale: { href: string; label: string } | null = null): HeaderNavItem[] {
  // Deals & stock gets its own dropdown (owner, 2026-11-09); "More" keeps the tools, the guides and the rest.
  const deals = all.filter((g) => g.title === "Deals & stock");
  const more = all.filter((g) => g.title !== "Deals & stock");
  return [
    ...(sale ? [{ href: sale.href, label: sale.label, also: [] as string[] }] : []),
    { href: "/cards", label: "Cards", also: ["/card", "/sets"], menu: shop.cards.length ? shop.cards : undefined },
    { href: "/sealed", label: "Sealed", also: ["/preorders"], menu: shop.sealed.length ? shop.sealed : undefined },
    ...(SITE.kits ? [{ href: "/kits", label: SITE.kits.label, also: ["/kit"], menu: shop.kits.length ? shop.kits : undefined }] : []),
    { href: "/tools/deal-finder", label: "Deals", also: ["/black-friday", "/cyber-monday", "/boxing-day", "/january-sales", "/lunar-new-year", "/movers", "/preorders", "/stores"], menu: deals.length ? deals : undefined },
    { href: "/tools", label: "More", rest: "tools and guides", also: ["/price-report", "/forum", "/blog"], menu: more },
  ];
}

/**
 * The site header (the Dex / MTG Compare engine's): ONE row, var(--hdr) tall (60px; 64px from lg), sticky. Everything a page needs
 * to go somewhere else is in it at every width, so nothing below it has to repeat it. From xl it spans the shell (the sidebar's
 * column and the page's). No cookie, header or session is read: one CDN copy per URL; the visitor's market is a browser preference
 * (ClientPrefs.tsx).
 *
 * - Below lg: the logo mark (the word from sm), the search box filling the row, the market button and the menu button
 *   (components/MobileMenu.tsx: every section, then the markets).
 * - lg and up: logo, the sections (NavLink marks the current one), eBay's labelled search link (xl), search, market, theme.
 */
export function Header() {
  const sale = holidayNav();
  const history = historyOn();
  const shop = shopNav();
  const groups = navGroups({ history, sale, shop: shop.groups });
  // The "More" dropdown is everything the shopping dropdowns do not already list.
  const items = headerNavItems(navGroups({ history, sale, shop: [] }), shop.menus, sale);
  return (
    <header className="sticky top-0 z-40 h-[var(--hdr)] border-b border-line bg-surface/90 backdrop-blur-md xmas-garland">
      <div className="page flex h-full items-center gap-2 sm:gap-3 lg:gap-4 xl:max-w-shell">
        <Link href="/" className="flex h-11 shrink-0 items-center rounded-lg" aria-label={`${SITE.name} home`}>
          <Logo wordmark="hidden sm:inline" />
        </Link>
        <nav className="hidden items-center gap-0.5 2xl:flex" aria-label="Main">
          <HeaderNavItems items={items} />
          {/* A discreet, labelled sponsored item (xl and up only): eBay's search for the game, tagged. Not a section of the site. */}
          <a
            href={goHref({ url: ebaySearchUrl(SITE.ebay.query, "US"), source: "ebay", market: "US" }, undefined, "header-ebay")}
            rel="sponsored nofollow noopener"
            target="_blank"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-ink min-[1700px]:inline-flex"
          >
            <span className="ad-pill">Ad</span> eBay
          </a>
        </nav>
        <div className="hdr-search min-w-0 flex-1 2xl:ml-auto 2xl:w-56 2xl:flex-none min-[1700px]:w-64">
          <SearchBox size="sm" />
        </div>
        <ThemeToggle className="hidden sm:inline-flex" />
        {/* Premium (owner, 2026-11-19: "premium should also be visible"): the gold pill from md; phones have it atop the menu. Sign in must
            never be pushed off the row (owner, 2026-11-19), so the sections row starts at 2xl (the sidebar and the menu carry them below),
            and the pill and the eBay item step aside where the row is full. */}
        <PremiumHeaderLink className="hidden md:inline-flex 2xl:hidden min-[1700px]:inline-flex" />
        <MarketPicker />
        {/* The cart list (components/cart, owner 2026-11-06): every width, with its count. */}
        {/* Sign in / account (owner, 2026-11-19: "the login/signup button should be visible for all sites"): every width. */}
        <AccountHeaderLink />
        <CartHeaderLink />
        <MobileMenu groups={groups} className="2xl:hidden" />
      </div>
    </header>
  );
}
