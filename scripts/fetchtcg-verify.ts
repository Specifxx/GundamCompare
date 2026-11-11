// temporary
import { readFileSync } from "node:fs";
const f = JSON.parse(readFileSync("data/fetch-live/au.json", "utf8")) as { cards: { s: string; no: string; n: string; r: string; f: string; p: number }[] };
for (const no of ["GD06-004", "GD06-005", "ST11-002", "GD05-001", "GD01-004"]) console.log(no, JSON.stringify(f.cards.filter((c) => c.no === no).map((c) => `${c.s}|${c.n}|${c.r}|${c.f}`)));
const rar: Record<string, number> = {}; for (const c of f.cards) rar[c.r] = (rar[c.r] || 0) + 1; console.log("rarities", JSON.stringify(rar));
