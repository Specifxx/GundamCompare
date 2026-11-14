import Link from "@/components/Link";
import { SearchBox } from "@/components/SearchBox";

// A friendly dead end: say what happened in one line, offer the search, and the few pages most visitors were after.
const WAYS_IN = [
  { href: "/kits", label: "Gunpla prices" },
  { href: "/cards", label: "Card prices" },
  { href: "/sealed", label: "Booster boxes and sealed" },
  { href: "/sets", label: "Every set" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-12 text-center sm:py-20">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-2 font-display text-3xl font-black">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md leading-7 text-muted">That page has moved or never existed. Search for what you were after, or pick up from one of these.</p>
      <div className="mt-6 text-left"><SearchBox big /></div>
      <nav aria-label="Popular pages" className="mt-6 flex flex-wrap justify-center gap-2">
        {WAYS_IN.map((w) => (
          <Link key={w.href} href={w.href} className="chip min-h-10">{w.label}</Link>
        ))}
      </nav>
      <Link href="/" className="link mt-8 inline-flex min-h-10 items-center gap-1.5">
        <span aria-hidden="true">←</span> Back to the home page
      </Link>
    </div>
  );
}
