// The lively look (owner, 2026-11-26; DECISIONS.md): decoration only. The hero's art is small server markup with no link, photo
// or word in it; the look's CSS loads no image, and everything in it that moves sits inside prefers-reduced-motion: no-preference.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const look = css.slice(css.indexOf("── The lively look"));

test("the hero's art: one aria-hidden block under 1.5 KB, plain geometry, no link, photo or word", async () => {
  // The component is compiled for Next's automatic JSX runtime; under tsx it needs React in scope.
  (globalThis as unknown as { React: typeof React }).React = React;
  const { HeroArt } = await import("../src/components/home/HeroArt");
  const html = renderToStaticMarkup(React.createElement(HeroArt));
  assert.match(html, /^<div class="hud" aria-hidden="true">/);
  assert.ok(html.length < 1500, `the art is ${html.length} bytes of markup`);
  assert.doesNotMatch(html, /<a\b|<img|href=|<text|<image|url\(/, "decoration only");
  const page = readFileSync("src/app/page.tsx", "utf8");
  assert.match(page, /<HeroSparks \/>\s*<HeroArt \/>/, "the art is inside the hero band, under the words");
});

test("the look's CSS: no image, and no animation outside prefers-reduced-motion: no-preference", () => {
  assert.ok(look.length > 2000, "the block is in globals.css");
  assert.doesNotMatch(look, /url\(/, "gradients only");
  const start = look.indexOf("@media screen and (prefers-reduced-motion: no-preference) {");
  assert.ok(start > 0);
  // The motion block ends where the keyframes begin.
  const end = look.indexOf("@keyframes", start);
  const outside = look.slice(0, start) + look.slice(end);
  assert.doesNotMatch(outside.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, ""), /\banimation(?:-name)?\s*:/, "an animation outside the motion block");
  // What moves is transform, opacity or a gradient's position: never a size, an offset or a colour.
  for (const [, name, body] of look.matchAll(/@keyframes ([\w-]+) \{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)) {
    for (const [, prop] of body.matchAll(/([a-z-]+)\s*:/g)) assert.ok(["transform", "opacity", "background-position"].includes(prop), `${name} animates ${prop}`);
  }
});

test("the art stays in the page's column and out of the layout: absolute, clipped, never clickable", () => {
  const hud = /\.hero-band > \.hud \{([^}]*)\}/.exec(look)?.[1] ?? "";
  for (const rule of ["position: absolute", "inset: 0", "overflow: clip", "pointer-events: none"]) assert.ok(hud.includes(rule), rule);
});
