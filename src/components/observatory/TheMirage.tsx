"use client";

/**
 * TheMirage — the honesty-by-design centerpiece for HeliQuant (id="findings").
 *
 * A spatial diorama (anti-card) that makes honesty a physical EVENT. A seductive,
 * shimmering "fool's-gold" number — +96.0% OOS / 95.6% WIN on an mETH/ETH convergence
 * — floats and breathes, almost too beautiful. Then a wave of REALITY (the slippage of
 * trading thin mETH on both legs) hits: a crack propagates, the number FRACTURES into
 * shards that scatter and crumble, revealing the small ugly truth beneath — −73 bps a
 * trade — struck with a "REJECTED" stamp. We threw out our own prettiest number.
 *
 * If the text were removed: a beautiful thing shimmers, then shatters to reveal something
 * small. That reads on its own.
 *
 * Every figure is REAL (FINDINGS #15 from @/lib/heliquant). Self-contained: all colour /
 * easing constants are LOCAL; only fonts (--font-mono / --font-display) + REAL data are
 * borrowed. Loops gate behind a mounted flag (no hydration drift); randomness is seeded
 * with a local mulberry32 (no Math.random / Date.now). Under prefers-reduced-motion the
 * loop FREEZES on the final TRUTH state — the honest message is what statics.
 *
 * Chartreuse is deliberately NOT used here (reserved for the CTA / seal elsewhere).
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { FINDINGS } from "@/lib/heliquant";

// ───────────────────────────── the LAW: local palette (mirrors the hero standard tokens) ─────────────────────────────
const VOID = "#05060f"; // midnight abyss — matches the hero base (NEVER pure #000)
const GLASS_HAIRLINE = "rgba(186, 215, 247, 0.08)"; // blue-tinted glass hairline (hero standard)
const ICE = "#d8ecf8"; // comet — primary text on dark
const MUTE = "#81899b"; // interstellar gray — dim instrument label
const MUTE_2 = "#4d535d"; // dimmer / index
const SOLAR = "#ffd06a"; // warm spark (rationed — crack ignition only)
const CRIMSON = "#ff6467"; // the truth: −73 bps, REJECTED
const IRID_A = "#bbdef2"; // mirage shimmer — cool
const IRID_B = "#d1aad7"; // mirage shimmer — warm
const IRID_HI = "#eaf6ff"; // mirage specular highlight

// ───────────────────────────── motion physics (authored — no linear) ─────────────────────────────
const ORGANIC = [0.4, 0, 0.2, 1] as const; // slide / draw-in
const HEAVY = [0.8, 0, 0.2, 1] as const; // shards falling (weighted, ballistic)
const ELASTIC = [0.175, 0.885, 0.32, 1.275] as const; // the REJECTED stamp punch
const DAMPED = [0.16, 1, 0.3, 1] as const; // truth settling — no overshoot, restraint
const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const DISPLAY = "var(--font-display, ui-sans-serif, system-ui, sans-serif)"; // Space Grotesk — hero standard

// ───────────────────────────── loop choreography (ms) ─────────────────────────────
// SHIMMER (seductive breathe) → CRACK (sharp) → SHATTER (shards scatter) → TRUTH (settle) → HOLD → reset
const PHASE = {
  shimmer: 0, // mirage breathes, glitters — "almost too beautiful"
  crack: 2600, // a hairline fracture races across it
  shatter: 3150, // the number breaks into shards that fall
  truth: 3950, // −73 bps + REJECTED stamp arrive beneath
  hold: 4250, // let the honest verdict sit
  reset: 7200, // fade truth, re-coalesce the mirage
} as const;
const LOOP_MS = 8000;
type Phase = "shimmer" | "crack" | "shatter" | "truth" | "reset";

// ───────────────────────────── deterministic RNG (no hydration drift) ─────────────────────────────
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───────────────────────────── the mirage glass: a shard field over the number ─────────────────────────────
// The "+96.0%" lives behind a pane of glass. We tile that pane with irregular triangular
// shards (jittered grid → triangulated cells). Each shard reveals the number beneath via a
// shared clip. On SHATTER each shard flies off on its own ballistic vector + spin — no two
// alike, staggered radially from the crack's impact point. Classy, not toy: small count,
// heavy easing, gravity-biased.
const PANE = { w: 100, h: 34 }; // shard-field viewBox (the number's bounding pane)
const IMPACT = { x: 78, y: 9 }; // upper-right strike point (where reality lands first)

type Shard = {
  pts: string; // "x,y x,y x,y" polygon
  cx: number; // centroid (for stagger + fly vector)
  cy: number;
  dx: number; // scatter vector
  dy: number;
  rot: number; // spin on scatter
  delay: number; // staggered by distance from impact
  tint: 0 | 1 | 2; // shimmer band index → subtle facet colour variance
};

function buildShards(seed: number): Shard[] {
  const rnd = mulberry32(seed);
  const cols = 7;
  const rows = 3;
  // jittered lattice of points
  const grid: { x: number; y: number }[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: { x: number; y: number }[] = [];
    for (let c = 0; c <= cols; c++) {
      const edge = c === 0 || c === cols || r === 0 || r === rows;
      const jx = edge ? 0 : (rnd() - 0.5) * (PANE.w / cols) * 0.55;
      const jy = edge ? 0 : (rnd() - 0.5) * (PANE.h / rows) * 0.55;
      row.push({ x: (c / cols) * PANE.w + jx, y: (r / rows) * PANE.h + jy });
    }
    grid.push(row);
  }
  // each cell → 2 triangles (diagonal flips per cell for organic facets)
  const shards: Shard[] = [];
  let maxDist = 1;
  const raw: { tri: { x: number; y: number }[]; cx: number; cy: number; dist: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = grid[r]![c]!;
      const b = grid[r]![c + 1]!;
      const d = grid[r + 1]![c]!;
      const e = grid[r + 1]![c + 1]!;
      const flip = rnd() > 0.5;
      const tris = flip
        ? [
            [a, b, e],
            [a, e, d],
          ]
        : [
            [a, b, d],
            [b, e, d],
          ];
      for (const tri of tris) {
        const cx = (tri[0]!.x + tri[1]!.x + tri[2]!.x) / 3;
        const cy = (tri[0]!.y + tri[1]!.y + tri[2]!.y) / 3;
        const dist = Math.hypot(cx - IMPACT.x, cy - IMPACT.y);
        maxDist = Math.max(maxDist, dist);
        raw.push({ tri, cx, cy, dist });
      }
    }
  }
  for (const { tri, cx, cy, dist } of raw) {
    // scatter vector: radially away from impact, gravity-biased downward, slight spread
    const ang = Math.atan2(cy - IMPACT.y, cx - IMPACT.x) + (rnd() - 0.5) * 0.7;
    const force = 16 + rnd() * 26;
    shards.push({
      pts: tri.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "),
      cx,
      cy,
      dx: Math.cos(ang) * force,
      dy: Math.sin(ang) * force + 22 + rnd() * 16, // + gravity
      rot: (rnd() - 0.5) * 150,
      delay: (dist / maxDist) * 0.34, // closest to impact leaves first
      tint: (Math.floor(rnd() * 3) as 0 | 1 | 2),
    });
  }
  return shards;
}

// a jagged crack polyline racing from the impact point across the pane
function buildCrack(seed: number): string {
  const rnd = mulberry32(seed);
  let x = IMPACT.x;
  let y = IMPACT.y;
  const pts = [`${x},${y}`];
  const steps = 9;
  const dir = -1; // travel leftward / downward across the number
  for (let i = 0; i < steps; i++) {
    x += (dir * PANE.w) / steps + (rnd() - 0.5) * 4;
    y += (PANE.h / steps) * 0.7 + (rnd() - 0.5) * 9;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M ${pts.join(" L ")}`;
}

// faint glitter motes drifting over the mirage (the seductive "too beautiful" sparkle)
type Mote = { x: number; y: number; r: number; dur: number; delay: number; tint: 0 | 1 };
function buildMotes(seed: number, n: number): Mote[] {
  const rnd = mulberry32(seed);
  const out: Mote[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: 6 + rnd() * 88,
      y: 4 + rnd() * 26,
      r: 0.18 + rnd() * 0.42,
      dur: 2.4 + rnd() * 2.6,
      delay: rnd() * 3,
      tint: (rnd() > 0.5 ? 1 : 0) as 0 | 1,
    });
  }
  return out;
}

// ───────────────────────────── the honest-findings rail (terse mono index, NOT cards) ─────────────────────────────
// Three short honest discoveries pulled from FINDINGS — a quiet index beneath the event.
function railLine(n: number, fallback: string): string {
  const f = FINDINGS.find((x) => x.n === n);
  return f ? f.title : fallback;
}
const RAIL: { n: number; text: string }[] = [
  { n: 5, text: railLine(5, "Accuracy is not profit") },
  { n: 1, text: railLine(1, "Mantle's smart money is genuinely sparse") },
  { n: 9, text: railLine(9, "Honesty-by-design") },
];

// ───────────────────────────── component ─────────────────────────────
export default function TheMirage() {
  const reduce = useReducedMotion() ?? false;
  const finding = useMemo(() => FINDINGS.find((f) => f.n === 15), []);

  const shards = useMemo(() => buildShards(0x9605), []);
  const crack = useMemo(() => buildCrack(0x73b9), []);
  const motes = useMemo(() => buildMotes(0xfa52, 22), []);

  // gate loops until after first paint → SSR markup matches, no hydration drift
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const live = mounted && !reduce;

  // phase clock — drives the visceral loop; under reduced motion we freeze on TRUTH
  const [phase, setPhase] = useState<Phase>(reduce ? "truth" : "shimmer");
  useEffect(() => {
    if (!live) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setPhase("shimmer");
      timers.push(setTimeout(() => setPhase("crack"), PHASE.crack));
      timers.push(setTimeout(() => setPhase("shatter"), PHASE.shatter));
      timers.push(setTimeout(() => setPhase("truth"), PHASE.truth));
      timers.push(setTimeout(() => setPhase("reset"), PHASE.reset));
    };
    run();
    const loop = setInterval(run, LOOP_MS);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, [live]);

  const broken = phase === "shatter" || phase === "truth"; // mirage gone, shards loose
  const showTruth = reduce || phase === "truth";
  const showMirage = !broken; // intact number visible during shimmer/crack/reset
  const cracking = phase === "crack" || phase === "shatter";

  // values straight from FINDINGS #15 (never invented)
  const MIRAGE_PCT = "+96.0%";
  const MIRAGE_SUB = "95.6% WIN · mETH/ETH CONVERGENCE";
  const TRUTH = "−73 bps";
  const TRUTH_UNIT = "/ TRADE";

  // tint palette for facets — subtle iridescent variance
  const tintFill = [IRID_A, IRID_B, IRID_HI] as const;

  return (
    <section
      id="findings"
      className="relative isolate w-full overflow-hidden px-6 py-28 sm:px-10 lg:px-16"
      style={{ backgroundColor: VOID }}
      aria-label="The Mirage — we rejected our own prettiest number"
    >
      {/* faint top seam so the void flows on from the section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
      />

      {/* blueprint grid — the hero's quiet unifying texture, faded at the edges; sits behind everything */}
      <div aria-hidden className="bg-blueprint pointer-events-none absolute inset-0 z-0 opacity-30" />

      {/* deep atmosphere — a cool iridescent haze pooling around the mirage, warming to nothing.
          When the truth lands, a low crimson floor-glow bleeds in (depth via GLOW, never shadow). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 62% 42%, rgba(120,150,180,0.10) 0%, rgba(12,9,8,0) 55%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "radial-gradient(120% 100% at 60% 130%, rgba(255,100,103,0.12) 0%, rgba(161,19,26,0.04) 38%, transparent 70%)",
        }}
        animate={{ opacity: showTruth ? 1 : 0 }}
        transition={{ duration: showTruth ? 1.1 : 0.6, ease: ORGANIC }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.5fr)] lg:gap-16">
        {/* ░░░░░░░░░░░░░░░░░░ CAPTION (~30%) — lower-left voice ░░░░░░░░░░░░░░░░░░ */}
        <div className="max-w-md">
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: ORGANIC }}
            className="font-mono text-[11px] uppercase"
            style={{ color: MUTE, letterSpacing: "0.26em" }}
          >
            <span style={{ color: CRIMSON }}>◦</span>{" "}
            <span style={{ color: ICE, opacity: 0.82 }}>THE DISCIPLINE · WE KILLED IT</span>
          </motion.p>

          <motion.h2
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.1, ease: [0.2, 0.8, 0.2, 1.05] }}
            className="font-display mt-5 text-balance"
            style={{
              color: ICE,
              fontWeight: 300,
              fontSize: "clamp(2rem, 4.4vw, 3.2rem)",
              lineHeight: 1.05,
              letterSpacing: "0.01em",
            }}
          >
            We rejected our{" "}
            <span
              style={{
                fontStyle: "italic",
                background: `linear-gradient(95deg, ${IRID_A} 0%, ${IRID_B} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              prettiest
            </span>{" "}
            number.
          </motion.h2>

          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.22, ease: ORGANIC }}
            className="mt-6 text-balance"
            style={{ color: ICE, opacity: 0.62, fontSize: "clamp(1rem, 1.3vw, 1.12rem)", lineHeight: 1.62 }}
          >
            +96% OOS, 95.6% win — spectacular, until you price the slippage of trading thin mETH on
            both legs. It turns to −73 bps a trade. A thin-liquidity artifact. We threw it out.
          </motion.p>

          {/* honest-findings rail — terse mono one-liners, dim, NOT cards. a quiet index. */}
          <motion.ul
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.4, ease: ORGANIC }}
            className="mt-9 flex flex-col gap-2.5 border-l"
            style={{ borderColor: GLASS_HAIRLINE }}
          >
            {RAIL.map((r) => (
              <li
                key={r.n}
                className="flex items-baseline gap-3 pl-4 font-mono"
                style={{ fontSize: "10.5px", letterSpacing: "0.14em", color: MUTE }}
              >
                <span style={{ color: MUTE_2 }}>#{r.n}</span>
                <span className="uppercase" style={{ opacity: 0.92 }}>
                  {r.text}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ░░░░░░░░░░░░░░░░░░ DIORAMA (~70%) — the mirage that shatters ░░░░░░░░░░░░░░░░░░ */}
        <div className="relative">
          {/* status chip — the desk voice on this finding */}
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="font-mono" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.24em", color: MUTE }}>
              {finding ? `FINDING #${finding.n} · BACKTEST AUDIT` : "BACKTEST AUDIT"}
            </span>
            <motion.span
              className="flex items-center gap-1.5 font-mono"
              style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.24em" }}
              animate={{ color: showTruth ? CRIMSON : IRID_A }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative flex h-1.5 w-1.5">
                {live ? (
                  <span
                    className="absolute inline-flex h-full w-full rounded-full"
                    style={{ backgroundColor: showTruth ? CRIMSON : IRID_A, opacity: 0.7, animation: "mirage-ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }}
                  />
                ) : null}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: showTruth ? CRIMSON : IRID_A }} />
              </span>
              {showTruth ? "REJECTED" : "UNDER REVIEW"}
            </motion.span>
          </div>

          {/* the stage — borderless spatial void; depth comes entirely from light */}
          <div
            className="relative h-[340px] w-full overflow-hidden sm:h-[380px]"
            style={{ borderRadius: 18 }}
          >
            {/* iridescent aura behind the mirage — blooms while seductive, collapses on shatter */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "78%",
                height: "62%",
                background: `radial-gradient(circle, rgba(187,222,242,0.20) 0%, rgba(209,170,215,0.12) 38%, rgba(187,222,242,0.02) 62%, transparent 72%)`,
                filter: "blur(34px)",
              }}
              animate={
                live
                  ? broken
                    ? { opacity: 0.08, scale: 1.15 }
                    : { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }
                  : { opacity: reduce ? 0.08 : 0.7, scale: reduce ? 1.15 : 1 }
              }
              transition={
                live
                  ? broken
                    ? { duration: 0.5, ease: HEAVY }
                    : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.6 }
              }
            />

            {/* crimson truth-aura — bleeds up from below once the verdict lands */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "60%",
                height: "44%",
                background: `radial-gradient(circle, rgba(255,100,103,0.16) 0%, rgba(161,19,26,0.06) 45%, transparent 70%)`,
                filter: "blur(30px)",
              }}
              animate={{ opacity: showTruth ? 1 : 0, scale: showTruth ? 1 : 0.7 }}
              transition={{ duration: showTruth ? 1 : 0.4, ease: ORGANIC }}
            />

            {/* ── THE MIRAGE NUMBER + its shard-glass, centred on the stage ── */}
            <div className="absolute left-1/2 top-[36%] w-[88%] max-w-[640px] -translate-x-1/2 -translate-y-1/2">
              <svg viewBox={`-4 -4 ${PANE.w + 8} ${PANE.h + 8}`} className="h-auto w-full" fill="none">
                <defs>
                  {/* the seductive shimmer sweep — animated x for a moving specular band */}
                  <linearGradient id="mir-shimmer" x1="0" y1="0" x2="1" y2="0.35">
                    <stop offset="0%" stopColor={IRID_A} />
                    <stop offset="38%" stopColor={IRID_HI} />
                    <stop offset="62%" stopColor={IRID_B} />
                    <stop offset="100%" stopColor={IRID_A} />
                  </linearGradient>
                  <linearGradient id="mir-facet" x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0%" stopColor={IRID_HI} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={IRID_B} stopOpacity="0.5" />
                  </linearGradient>
                  {/* clip so the number text masks the shard glass — shards only show where the glyphs are */}
                  <clipPath id="mir-clip">
                    <text
                      x={PANE.w / 2}
                      y={PANE.h / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "30px", letterSpacing: "-0.01em" }}
                    >
                      {MIRAGE_PCT}
                    </text>
                  </clipPath>
                  <filter id="mir-soft" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="0.35" />
                  </filter>
                </defs>

                {/* soft glow ghost of the number — gives the glyphs luminous mass (glow, not shadow) */}
                <AnimatePresence>
                  {showMirage ? (
                    <motion.text
                      key="ghost"
                      x={PANE.w / 2}
                      y={PANE.h / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      filter="url(#mir-soft)"
                      style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: "30px", letterSpacing: "-0.01em" }}
                      fill={IRID_A}
                      initial={{ opacity: 0 }}
                      animate={live ? { opacity: cracking ? 0.5 : [0.28, 0.5, 0.28] } : { opacity: 0.4 }}
                      exit={{ opacity: 0, transition: { duration: 0.18 } }}
                      transition={
                        live && !cracking
                          ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.4 }
                      }
                    />
                  ) : null}
                </AnimatePresence>

                {/* INTACT mirage: a single shimmering pane clipped to the glyphs, with a travelling
                    specular sweep. This is the body of the number while it still seduces. */}
                <AnimatePresence>
                  {showMirage ? (
                    <motion.g
                      key="pane"
                      clipPath="url(#mir-clip)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    >
                      {/* base iridescent fill */}
                      <rect x={-4} y={-4} width={PANE.w + 8} height={PANE.h + 8} fill="url(#mir-shimmer)" opacity={0.92} />
                      {/* moving specular highlight band (the "glitter" sweeping across the glass) */}
                      {live ? (
                        <motion.rect
                          y={-6}
                          width={26}
                          height={PANE.h + 12}
                          fill={IRID_HI}
                          opacity={0.5}
                          style={{ filter: "blur(3px)", mixBlendMode: "screen" }}
                          initial={{ x: -30 }}
                          animate={{ x: [-30, PANE.w + 4] }}
                          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.2 }}
                        />
                      ) : null}
                      {/* faint internal facet lines — hints the glass that is about to break */}
                      <path d={crack} stroke={IRID_HI} strokeWidth={0.18} opacity={0.18} />
                    </motion.g>
                  ) : null}
                </AnimatePresence>

                {/* glitter motes drifting over the intact mirage — the "too beautiful" sparkle */}
                {live && showMirage ? (
                  <g>
                    {motes.map((m, i) => (
                      <motion.circle
                        key={`mote-${i}`}
                        cx={m.x}
                        cy={m.y}
                        r={m.r}
                        fill={m.tint ? IRID_HI : IRID_A}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: cracking ? 0 : [0, 0.9, 0], scale: [0.6, 1, 0.6] }}
                        transition={{
                          duration: m.dur,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: m.delay,
                        }}
                      />
                    ))}
                  </g>
                ) : null}

                {/* THE CRACK — a hot hairline races across the glyphs an instant before shatter */}
                {cracking || reduce ? (
                  <g clipPath="url(#mir-clip)">
                    <motion.path
                      d={crack}
                      stroke={IRID_HI}
                      strokeWidth={0.7}
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 1px rgba(234,246,255,0.9))" }}
                      initial={reduce ? { pathLength: 1, opacity: 0 } : { pathLength: 0, opacity: 1 }}
                      animate={reduce ? { opacity: 0 } : { pathLength: 1, opacity: [0, 1, 0.7] }}
                      transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.7, 0, 0.3, 1] }}
                    />
                    {/* spark at the impact point as reality strikes */}
                    {!reduce ? (
                      <motion.circle
                        cx={IMPACT.x}
                        cy={IMPACT.y}
                        fill={SOLAR}
                        initial={{ r: 0, opacity: 0 }}
                        animate={{ r: [0, 2.4, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    ) : null}
                  </g>
                ) : null}

                {/* SHATTER — the glyph-pane breaks into shards that scatter + crumble.
                    Each shard is clipped to the glyphs (so the broken pieces still read as the
                    number), flies on its own ballistic vector, spins, and fades to dust. */}
                <AnimatePresence>
                  {broken && !reduce ? (
                    <g clipPath="url(#mir-clip)">
                      {shards.map((s, i) => (
                        <motion.polygon
                          key={`shard-${i}`}
                          points={s.pts}
                          fill={tintFill[s.tint]}
                          stroke={IRID_HI}
                          strokeWidth={0.12}
                          style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
                          initial={{ x: 0, y: 0, rotate: 0, opacity: 0.95 }}
                          animate={{ x: s.dx, y: s.dy, rotate: s.rot, opacity: 0 }}
                          transition={{
                            duration: 0.95,
                            delay: s.delay,
                            ease: HEAVY,
                          }}
                        />
                      ))}
                    </g>
                  ) : null}
                </AnimatePresence>
              </svg>

              {/* sub-line under the mirage — the seductive credentials (mono), fades on shatter */}
              <AnimatePresence>
                {showMirage ? (
                  <motion.div
                    key="mirage-sub"
                    className="mt-1 text-center font-mono"
                    style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.24em", color: IRID_A }}
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: cracking ? 0.4 : 0.85, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.5, ease: ORGANIC }}
                  >
                    {MIRAGE_SUB}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* ── THE TRUTH beneath — small, crimson, struck with a REJECTED stamp ── */}
            <div className="absolute inset-x-0 bottom-7 flex flex-col items-center">
              <AnimatePresence>
                {showTruth ? (
                  <motion.div
                    key="truth"
                    className="flex flex-col items-center"
                    initial={reduce ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  >
                    {/* the real number — deliberately MODEST beside the mirage it replaced */}
                    <motion.div
                      className="flex items-baseline gap-2 font-mono"
                      initial={reduce ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.1, ease: DAMPED }}
                    >
                      <span
                        style={{
                          fontFamily: DISPLAY,
                          fontWeight: 400,
                          fontSize: "clamp(2rem, 5vw, 3rem)",
                          lineHeight: 1,
                          color: CRIMSON,
                          textShadow: `0 0 26px rgba(255,100,103,0.30)`,
                        }}
                      >
                        {TRUTH}
                      </span>
                      <span
                        style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.22em", color: CRIMSON, opacity: 0.75 }}
                      >
                        {TRUTH_UNIT}
                      </span>
                    </motion.div>

                    {/* honest verdict line */}
                    <motion.div
                      className="mt-2.5 font-mono"
                      style={{ fontFamily: MONO, fontSize: "9.5px", letterSpacing: "0.2em", color: MUTE }}
                      initial={reduce ? { opacity: 0.85 } : { opacity: 0 }}
                      animate={{ opacity: 0.85 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.4, ease: ORGANIC }}
                    >
                      THIN-LIQUIDITY ARTIFACT · <span style={{ color: CRIMSON, opacity: 0.9 }}>NOT ALPHA</span>
                    </motion.div>

                    {/* the struck / stamped REJECTED mark — punched in at an angle (elastic) */}
                    <motion.div
                      className="relative mt-4 inline-flex items-center"
                      initial={reduce ? { scale: 1, opacity: 1, rotate: -7 } : { scale: 1.6, opacity: 0, rotate: -7 }}
                      animate={{ scale: 1, opacity: 1, rotate: -7 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.45, ease: ELASTIC }}
                    >
                      <span
                        className="font-mono uppercase"
                        style={{
                          fontFamily: MONO,
                          fontSize: "13px",
                          letterSpacing: "0.34em",
                          color: CRIMSON,
                          padding: "5px 14px 5px 18px",
                          border: `1.5px solid ${CRIMSON}`,
                          borderRadius: 3,
                          boxShadow: `0 0 18px rgba(255,100,103,0.22), inset 0 0 10px rgba(255,100,103,0.10)`,
                          opacity: 0.92,
                        }}
                      >
                        REJECTED
                      </span>
                      {/* strike-through bar across the stamp, like an audit cancel */}
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-1/2 h-px"
                        style={{ backgroundColor: CRIMSON, opacity: 0.55 }}
                        initial={reduce ? { width: "100%" } : { width: 0 }}
                        animate={{ width: "100%" }}
                        transition={reduce ? { duration: 0 } : { duration: 0.4, delay: 0.7, ease: [0.7, 0, 0.3, 1] }}
                      />
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* local keyframes (status ping) — kept inline so the component is self-contained */}
      <style>{`@keyframes mirage-ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }`}</style>
    </section>
  );
}
