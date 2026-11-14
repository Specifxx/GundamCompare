import type { Metadata } from "next";
import Link from "@/components/Link";
import { SITE } from "@/site.config";
import { canon } from "@/lib/site";
import { posts } from "@/lib/posts";

export const revalidate = 86400;
export const metadata: Metadata = {
  title: `${SITE.gameShort} guides and price analysis`,
  description: `Guides to buying ${SITE.game} cards: set price guides, most valuable cards, where to buy and pre-order advice.`,
  ...canon("/blog"),
};

export default function Blog() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-black">{SITE.gameShort} guides</h1>
        <p className="mt-2 text-muted">Buying guides and price explainers, with today&apos;s prices in every one.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts().map((p) => (
          <li key={p.slug} className="group card relative flex flex-col overflow-hidden transition-colors hover:border-ink/40">
            {p.image && (
              <Link href={`/blog/${p.slug}`} className="block" tabIndex={-1} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image.src} alt={p.image.alt} width={1200} height={630} loading="lazy" decoding="async" className="aspect-[1200/630] w-full border-b border-line object-cover" />
              </Link>
            )}
            <div className="flex flex-1 flex-col p-5">
              <Link href={`/blog/${p.slug}`} className="font-display text-lg font-bold leading-snug text-ink after:absolute after:inset-0 group-hover:text-brand">{p.title}</Link>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{p.description}</p>
              <p className="tabular mt-auto pt-3 text-xs text-muted">{p.updated ?? p.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
