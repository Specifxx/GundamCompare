// temporary
import { readFileSync } from "node:fs";
import { fetchRowsFor } from "../src/lib/fetchtcg";
const cat = JSON.parse(readFileSync("data/public/catalog.json", "utf8")) as { sets: { id: number; name: string }[]; products: { name: string; number: string | null; rarity: string | null; setId: number; kind: string }[] };
const sets = new Map(cat.sets.map((s) => [s.id, s.name]));
let n = 0, hit = 0; const miss: Record<string, string[]> = {};
for (const p of cat.products) { if (p.kind !== "card") continue; n++; const r = fetchRowsFor({ name: p.name, number: p.number, rarity: p.rarity, setName: sets.get(p.setId) ?? null }); if (r) hit++; else (miss[sets.get(p.setId) ?? "?"] ||= []).push(`${p.number} ${p.name} [${p.rarity}]`); }
console.log("cards", n, "matched", hit);
for (const [s, m] of Object.entries(miss)) console.log("MISS", s, m.length, m.slice(0, 4).join(" ;; "));
