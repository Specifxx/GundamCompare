"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FamilySearch } from "@/components/FamilySearch";

interface Hit { slug: string; href?: string; name: string; set: string; image: string | null; price: string; number: string | null; rarity: string | null; kind?: string }

/** A bigger copy of a result's photo for a tile: TCGplayer's 400w file, or a Shopify kit box at 400px. */
function tileImage(h: Hit): string | null {
  if (!h.image) return null;
  if (h.kind === "kit") return h.image.replace(/([?&]width=)\d+/, "$1400");
  return h.image.replace("_200w", "_400w");
}

/**
 * The search page's results: the same tile as the home page's shelves (photo on a plate, name, set, price), and a no-results state
 * that offers the ways in that do exist. Drawn in the browser from /api/search: the page itself is one static CDN copy for every
 * query, so the results necessarily arrive after the first paint.
 */
export function CardSearch() {
  const q = useSearchParams().get("q") ?? "";
  const [hits, setHits] = useState<Hit[] | null>(null);
  useEffect(() => {
    if (!q) return setHits(null);
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=60`).then((r) => r.json()).then((d: { hits: Hit[] }) => setHits(d.hits)).catch(() => setHits([]));
  }, [q]);
  if (!q) return null;
  return (
    <section className="mt-8" aria-live="polite">
      <h2 className="mb-3 font-display text-xl font-bold sm:mb-4 sm:text-2xl">Results for “{q}”</h2>
      {hits === null && <p className="text-sm leading-6 text-muted">Searching…</p>}
      {/* No results: a short paragraph close to the height "Searching…" held, so the page below barely moves (results arrive after paint). */}
      {hits?.length === 0 && (
        <p className="max-w-2xl text-sm leading-6 text-muted">
          <span className="font-semibold text-ink">Nothing matches that yet.</span> Try fewer words, or browse{" "}
          <a className="link" href="/kits">Gunpla prices</a>, <a className="link" href="/sealed">sealed</a> or <a className="link" href="/sets">every set</a>.
        </p>
      )}
      {hits && hits.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {hits.map((h) => {
            const img = tileImage(h);
            return (
              <a key={h.href ?? h.slug} href={h.href ?? `/card/${h.slug}`} className="group card flex flex-col overflow-hidden p-2 transition-colors hover:border-ink/40">
                <div className={`plate ${h.kind === "kit" ? "aspect-square" : "aspect-[5/7]"}`}>
                  {img ? <img src={img} alt={h.name} className="h-full w-full object-contain p-1.5 transition-transform group-hover:scale-[1.02]" loading="lazy" decoding="async" /> : <div className="flex h-full items-center justify-center p-3 text-center text-xs text-neutral-500">No image yet</div>}
                </div>
                <div className="flex flex-1 flex-col gap-1 px-1 pb-1 pt-2.5">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-ink group-hover:text-brand">{h.name}</p>
                  <p className="truncate text-xs text-muted">{h.set}{h.number ? ` · ${h.number}` : ""}</p>
                  <p className="tabular mt-auto pt-1 text-base font-bold text-ink">{h.price}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
      {/* The same words on the other card-game sites (2026-10-28). */}
      {hits !== null && <FamilySearch q={q} className="mt-4 text-sm leading-5 text-muted" />}
    </section>
  );
}
