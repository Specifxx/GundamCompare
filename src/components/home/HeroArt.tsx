/**
 * The hero's art (the lively look, owner 2026-11-26: "so dull … we want it to be a very nice experience … oh, look, these sites are
 * amazing"): a cockpit's head-up display in deep space. A targeting reticle of our own drawing (rings, a tick scale, arcs and a
 * lock-on square: plain geometry, nobody's logo, mobile suit or character), a radar sweep turning inside it, and two streaks of
 * light crossing the band. The panel-line grid, the corner brackets and the gauge along the foot are CSS on the wrapper
 * (globals.css .hud). Decoration only: aria-hidden, never a product, a photo, a word or a link, drawn by the server as one small
 * SVG and three empty spans, moved by CSS alone (transform and opacity; still for prefers-reduced-motion). Absolute inside the
 * hero band, which is the page's own column: nothing shifts when it paints, and nothing reaches the window's empty sides.
 */
export function HeroArt() {
  return (
    <div className="hud" aria-hidden="true">
      <span className="hud-sweep" />
      <svg className="hud-ret" viewBox="0 0 600 600" fill="none" focusable="false">
        <g className="hr-a">
          <circle cx="300" cy="300" r="296" strokeWidth="1.5" />
          {/* The scale round the rim: one dashed ring, 72 ticks, and a second of 12 long ones. */}
          <circle cx="300" cy="300" r="284" strokeWidth="12" strokeDasharray="1.5 23.286" />
          <circle cx="300" cy="300" r="279" strokeWidth="22" strokeDasharray="2.5 143.582" />
        </g>
        <g className="hr-b">
          <circle cx="300" cy="300" r="232" strokeWidth="3" strokeDasharray="182.2 182.2" />
          <circle cx="300" cy="300" r="246" strokeWidth="1" strokeDasharray="3 9" />
        </g>
        <g className="hr-c">
          <circle cx="300" cy="300" r="150" strokeWidth="1" />
          <path d="M300 96v84M300 420v84M96 300h84M420 300h84" strokeWidth="1.5" />
          <path className="hr-red" d="M262 244h-18v18M338 244h18v18M262 356h-18v-18M338 356h18v-18" strokeWidth="2.5" />
        </g>
        <circle className="hr-dot" cx="300" cy="300" r="4" />
      </svg>
      <span className="hud-beam hud-beam-1" />
      <span className="hud-beam hud-beam-2" />
    </div>
  );
}
