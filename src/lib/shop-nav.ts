// The shopping half of the navigation (owner, 2026-11-09: "a collector or someone deep in a space wants to navigate it fast").
// A Gundam Card Game player thinks colour, card type, rarity, set; a Gunpla builder thinks grade then scale; a sealed buyer thinks
// product type. The header dropdowns (components/Header.tsx), the sidebar's "Shop" groups (lib/nav.ts navGroups `shop`) and the phone
// menu all read this ONE list. It reads only the loaders the hub pages already read, and every link is a hub that exists (a hub
// exists only with products), so there is no dead end and no new query. Server-side: lib/nav.ts stays free of data.
import { SITE } from "@/site.config";
import { products, sets } from "@/lib/data";
import { attrFacets, rarityHubs, sealedHubs } from "@/lib/hubs";
import { gradeHubs, kitsOn, scaleHubs } from "@/lib/kits";
import type { NavGroup, NavLink } from "@/lib/nav";

export interface ShopMenus {
  cards: NavGroup[];
  sealed: NavGroup[];
  kits: NavGroup[];
}
export interface ShopNav {
  menus: ShopMenus;
  /** The sidebar and phone menu groups, before "Deals & stock". */
  groups: NavGroup[];
}

const MENU_LINKS = 6;
/** Links per sidebar group before its "All ..." link. */
const SIDEBAR_LINKS = MENU_LINKS;
const cap = (list: NavLink[], n: number, all: NavLink): NavLink[] => (list.length > n ? [...list.slice(0, n), all] : list);

let memo: { at: unknown; v: ShopNav } | null = null;
export function shopNav(): ShopNav {
  const at = products();
  if (memo && memo.at === at) return memo.v;
  const v = build();
  memo = { at, v };
  return v;
}

function build(): ShopNav {
  const facets = attrFacets();
  const rarities = rarityHubs();
  const sealed = sealedHubs();
  const listed = sets().filter((s) => s.productCount > 0);
  const released = listed.filter((s) => !s.upcoming && s.productCount > 20);

  // One column per card dimension: the short lists first (colour, rarity, type), the long one (traits) last.
  const dims: { title: string; links: NavLink[]; all: NavLink }[] = facets.map((f) => ({
    title: `By ${f.cfg.noun[0]}`,
    links: f.hubs.map((h) => ({ href: `/cards/${f.cfg.facet}/${h.slug}`, label: h.label })),
    all: { href: `/cards/${f.cfg.facet}`, label: `All ${f.hubs.length} ${f.cfg.noun[1]}` },
  }));
  if (rarities.length > 1) dims.splice(Math.min(1, dims.length), 0, { title: "By rarity", links: rarities.map((h) => ({ href: `/cards/rarity/${h.slug}`, label: h.label })), all: { href: "/cards", label: "All cards" } });
  const first = dims.slice(0, 1);
  dims.splice(0, dims.length, ...first, ...dims.slice(1).sort((a, b) => Number(a.links.length > 25) - Number(b.links.length > 25)));

  const setLinks: NavLink[] = released.map((s) => ({ href: `/sets/${s.slug}`, label: s.name }));
  const sealedLinks: NavLink[] = sealed.map((h) => ({ href: `/sealed/${h.slug}`, label: h.label }));
  const kitGroups: NavGroup[] = [];
  if (SITE.kits && kitsOn()) {
    const g = gradeHubs();
    const sc = scaleHubs();
    kitGroups.push({ title: "By grade", links: [...g.map((h) => ({ href: `/kits/grade/${h.slug}`, label: h.label })), { href: "/kits", label: `All ${SITE.kits.label}` }] });
    if (sc.length) kitGroups.push({ title: "By scale", links: sc.map((h) => ({ href: `/kits/scale/${h.slug}`, label: h.scale })) });
  }

  const cards: NavGroup[] = [
    ...dims.slice(0, 2).map((d) => ({ title: d.title, links: cap(d.links, MENU_LINKS, d.all) })),
    { title: "Newest sets", links: cap(setLinks, MENU_LINKS, { href: "/sets", label: `All ${listed.length} sets` }) },
  ];
  // Gunpla first (2026-11-14): kits are half the site's visits, so the sidebar and the phone menu open on grade and scale.
  // The sidebar keeps a short list per group (2026-11-19, the core-update quality pass: the rail alone put ~200 links on
  // every page, more than the page's own content). Each group shows its first SIDEBAR_LINKS and an "All ..." link; the
  // hubs themselves list the rest. DECISIONS.md, 2026-11-19 "Fewer links on every page".
  const groups: NavGroup[] = [
    ...kitGroups.map((g) => ({ title: `${SITE.kits!.label} ${g.title.toLowerCase()}`, links: cap(g.links.filter((l) => l.href !== "/kits"), SIDEBAR_LINKS, { href: "/kits", label: `All ${SITE.kits!.label}` }) })),
    ...dims.slice(0, 2).map((d, i) => ({ title: `Cards ${d.title.toLowerCase()}`, links: [...(i === 0 ? [{ href: "/cards", label: "All cards" }] : []), ...cap(d.links, SIDEBAR_LINKS, d.all)] })),
    { title: "Card sets", links: cap(setLinks, SIDEBAR_LINKS, { href: "/sets", label: "Every set" }) },
    ...(sealedLinks.length ? [{ title: "Sealed by type", links: cap(sealedLinks, SIDEBAR_LINKS, { href: "/sealed", label: "All sealed" }) }] : []),
  ];
  const seen = new Set<string>();
  const unique = groups.map((g) => ({ ...g, links: g.links.filter((l) => !seen.has(l.href) && !!seen.add(l.href)) })).filter((g) => g.links.length);
  return { menus: { cards, sealed: sealedLinks.length ? [{ title: "By product type", links: [...cap(sealedLinks, MENU_LINKS, { href: "/sealed", label: "All sealed" }), { href: "/preorders", label: "Pre-orders" }] }] : [], kits: kitGroups.map((g) => ({ ...g, links: cap(g.links.filter((l) => l.href !== "/kits"), MENU_LINKS, { href: "/kits", label: `All ${SITE.kits?.label ?? "kits"}` }) })) }, groups: unique };
}
