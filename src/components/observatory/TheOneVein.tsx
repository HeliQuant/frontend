"use client";

/**
 * TheOneVein — the "diorama" for HeliQuant's single validated edge (id="edge").
 *
 * METAPHOR (prospecting): a dark mineral field where MANY dim, dead grey veins crisscross
 * faintly — the strategies that FAILED out-of-sample (trend-following, mean-reversion,
 * funding-capture, price-TA). Exactly ONE living SOLAR-GOLD vein draws itself in, then a
 * bright nugget of light flows along it on a loop while the whole vein breathes. Most veins
 * are dead rock; one carries gold. Text removed → "a field of dead lines, one glowing gold
 * line alive" reads instantly.
 *
 * The live vein = EDGE.name ("OI-Contrarian") on EDGE.asset ("MNT"). Every number is REAL,
 * read from @/lib/heliquant — nothing is invented. The honest caveat sits ON the diorama,
 * not buried.
 *
 * Self-contained: all colour / easing constants are LOCAL (mirroring the flagships); only
 * fonts (--font-mono / --font-display) and REAL data are borrowed. Idle loops are gated
 * behind a mounted flag (no hydration drift) and freeze to a sensible static state under
 * prefers-reduced-motion. Chartreuse is RESERVED — it never appears in this scene.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EDGE } from "@/lib/heliquant";

// ───────────────────────────── the LAW: local palette (no global-token dependency) ─────────────────────────────
const VOID = "#05060f"; // warm near-black canvas — NEVER pure #000
const SUN_CORE = "#ffd06a"; // incandescent gold core (the living vein)
const SUN_GLOW = "#fa520f"; // solar flame
const SUN_EMBER = "#a1131a"; // outer ember
const FLAME_BRIGHT = "#fff2d6"; // hottest nugget centre
const ICE = "#d8ecf8"; // atmospheric / ghost text + headline
const ROCK = "#3a414c"; // dead-rock vein stroke (cold grey, dim)
const ROCK_DIM = "#2a2f38"; // dimmer dead vein
const MUTE = "#81899b"; // dim instrument label
const MUTE_2 = "#4d535d"; // dimmer / "FAILED" tag
// chartreuse is RESERVED — deliberately NOT defined here.

// ───────────────────────────── motion physics (authored — mirror the flagships) ─────────────────────────────
const EASE_ORGANIC = [0.4, 0, 0.2, 1] as const; // slide / arc draw-in
const POP = [0.175, 0.885, 0.32, 1.275] as const; // elastic pop (benchmark)
const DAMPED = [0.16, 1, 0.3, 1] as const; // settle / reveal
const SPRING_POP = { type: "spring" as const, stiffness: 200, damping: 18 };
const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

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

// ───────────────────────────── geometry: viewBox 0..100 (x) × 0..70 (y), wide field ─────────────────────────────
// A dead vein is an organic cubic Bézier crossing the field — two control points bowed by
// hand-seeded offsets so no two threads are alike. `label` (optional) marks a FAILED strategy.
type DeadVein = {
  d: string;
  w: number; // stroke width
  o: number; // base opacity
  dim: boolean; // use the dimmer rock hue
  label?: string; // strategy name (only the 4 named failures carry one)
  lx?: number; // label x
  ly?: number; // label y
};

/** Build ~8 dead grey veins crisscrossing the field; 4 carry FAILED strategy labels. */
function buildDeadVeins(seed: number): DeadVein[] {
  const rnd = mulberry32(seed);
  // hand-placed endpoints (varied entry/exit edges → genuine crisscross, never a grid)
  const segs: { p: [number, number, number, number]; bow: number }[] = [
    { p: [-4, 10, 104, 26], bow: -10 }, // top sweep L→R
    { p: [-4, 58, 104, 40], bow: 12 }, // lower sweep, opposite bow
    { p: [12, -6, 70, 76], bow: 16 }, // steep top→bottom
    { p: [-6, 38, 96, 64], bow: -14 }, // shallow rising
    { p: [40, -6, 28, 76], bow: -18 }, // near-vertical, left-leaning
    { p: [-4, 24, 104, 58], bow: 8 }, // long diagonal
    { p: [62, -6, 104, 50], bow: -10 }, // short upper-right
    { p: [-6, 70, 80, -4], bow: 14 }, // bottom-left → top
  ];
  // the 4 named OOS failures — attached to the 4 most legible threads
  const failed = ["TREND-FOLLOWING", "MEAN-REVERSION", "FUNDING-CAPTURE", "PRICE-TA"];

  return segs.map((s, i) => {
    const [x1, y1, x2, y2] = s.p;
    // perpendicular bow → organic cubic; jitter the two control points independently
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const j1 = (rnd() - 0.5) * 10;
    const j2 = (rnd() - 0.5) * 10;
    const c1x = mx - dx * 0.22 + nx * (s.bow + j1);
    const c1y = my - dy * 0.22 + ny * (s.bow + j1);
    const c2x = mx + dx * 0.22 + nx * (s.bow + j2);
    const c2y = my + dy * 0.22 + ny * (s.bow + j2);
    const d = `M ${x1} ${y1} C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(
      2,
    )} ${x2} ${y2}`;

    const named = i < failed.length;
    // place the label roughly two-thirds along the chord, nudged off the line
    const lx = x1 + dx * 0.66 + nx * 5;
    const ly = y1 + dy * 0.66 + ny * 5;
    return {
      d,
      w: 0.35 + rnd() * 0.4,
      o: named ? 0.5 : 0.3 + rnd() * 0.16,
      dim: !named,
      label: named ? failed[i] : undefined,
      lx: named ? Math.max(8, Math.min(78, lx)) : undefined,
      ly: named ? Math.max(8, Math.min(64, ly)) : undefined,
    };
  });
}

// THE living vein — a single confident organic Bézier sweeping low across the field, rising
// toward the right where the MNT readout anchors. Authored by hand (this is the hero curve).
const GOLD_VEIN =
  "M -6 60 C 16 58 24 30 44 30 C 62 30 64 54 84 44 C 95 38 100 30 110 26";

// the gold vein's visible terminus (≈ x100,y29 on the path) — readout anchors just past it
const GOLD_END = { x: 86, y: 41 };

// faint ore-flecks scattered through the rock (tiny inert grey ticks) for texture / depth.
type Fleck = { x: number; y: number; r: number; o: number };
function buildFlecks(seed: number, n: number): Fleck[] {
  const rnd = mulberry32(seed);
  const out: Fleck[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      x: rnd() * 100,
      y: rnd() * 70,
      r: 0.18 + rnd() * 0.45,
      o: 0.06 + rnd() * 0.16,
    });
  }
  return out;
}

// ───────────────────────────── live readout (instrument voice — all REAL) ─────────────────────────────
const READOUT: { v: string; em?: boolean }[] = [
  { v: `${(EDGE.pWin * 100).toFixed(1)}% WIN`, em: true },
  { v: `${EDGE.payoff.toFixed(2)} PAYOFF` },
  { v: `n=${EDGE.trades}` },
  { v: `+${EDGE.oosRoiPct}% OOS`, em: true },
];
// terse rendering of EDGE.caveat (kept dim + small — honest, never hidden)
const CAVEAT_CHIPS = ["HEDGE-LIKE", "BEAR-AMPLIFIED", "SMALL-SAMPLE", "FRACTIONAL-KELLY"];

// ───────────────────────────── component ─────────────────────────────
export default function TheOneVein() {
  const reduce = useReducedMotion() ?? false;
  const dead = useMemo(() => buildDeadVeins(0x90e1d), []);
  const flecks = useMemo(() => buildFlecks(0x5e1105, 54), []);

  // gate idle loops until after first paint → SSR markup matches, no hydration drift.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const live = mounted && !reduce; // run breathing / draw / pulses only when truly live

  return (
    <section
      id="edge"
      className="relative isolate w-full overflow-hidden px-6 py-28 sm:px-10 lg:px-16"
      style={{ backgroundColor: VOID }}
      aria-label="The Edge — one validated strategy survives out-of-sample"
    >
      {/* faint top seam so the void flows on from the section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }}
      />
      {/* deep atmosphere — a single warm pool of light around the living vein's far end (depth via glow, not shadow) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 82% 56%, rgba(40,22,10,0.5) 0%, rgba(12,9,8,0) 46%), linear-gradient(180deg, ${VOID} 0%, #0c0a09 70%, ${VOID} 100%)`,
        }}
      />
      {/* blueprint grid — the hero's quiet unifying texture, faded at the edges; sits behind everything */}
      <div aria-hidden className="bg-blueprint pointer-events-none absolute inset-0 z-0 opacity-30" />

      <div className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.85fr)]">
        {/* ░░░░░░░░░░░░░░░ CAPTION (~30%) — mono eyebrow · whisper-serif headline · one subline ░░░░░░░░░░░░░░░ */}
        <div className="max-w-md">
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_ORGANIC }}
            className="font-mono text-[11px] uppercase"
            style={{ color: MUTE, letterSpacing: "0.26em" }}
          >
            <span style={{ color: SUN_GLOW }}>◦</span>{" "}
            <span style={{ color: ICE, opacity: 0.82 }}>THE EDGE · ONE SURVIVES OOS</span>
          </motion.p>

          <motion.h2
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.08, ease: [0.2, 0.8, 0.2, 1.05] }}
            className="font-display mt-5 text-balance"
            style={{
              color: ICE,
              fontWeight: 300,
              lineHeight: 1.04,
              letterSpacing: "0.01em",
              fontSize: "clamp(2rem, 4.6vw, 3.3rem)",
            }}
          >
            <span style={{ opacity: 0.92 }}>One vein, </span>
            <span
              style={{
                fontStyle: "italic",
                background: `linear-gradient(95deg, ${SUN_CORE} 0%, ${SUN_GLOW} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              earned.
            </span>
          </motion.h2>

          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.18, ease: EASE_ORGANIC }}
            className="mt-5 text-balance"
            style={{ color: ICE, opacity: 0.6, fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)", lineHeight: 1.65 }}
          >
            Trend, mean-reversion, funding-capture — all died on unseen data. Only fading
            open-interest extremes on {EDGE.asset} cleared the cost-aware out-of-sample bar. Sized by
            fractional-Kelly, never promised.
          </motion.p>

          {/* method subline — the instrument's own description of the surviving edge */}
          <motion.p
            initial={reduce ? { opacity: 0.78 } : { opacity: 0 }}
            whileInView={{ opacity: 0.78 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.32, ease: EASE_ORGANIC }}
            className="mt-6 max-w-sm border-l font-mono"
            style={{
              borderColor: `${SUN_GLOW}55`,
              color: MUTE,
              fontSize: "10.5px",
              lineHeight: 1.7,
              letterSpacing: "0.04em",
              paddingLeft: "0.85rem",
            }}
          >
            {EDGE.method}
          </motion.p>
        </div>

        {/* ░░░░░░░░░░░░░░░ THE DIORAMA (~70%) — dead rock field + one living gold vein ░░░░░░░░░░░░░░░ */}
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, ease: DAMPED }}
          className="relative w-full"
          style={{ aspectRatio: "100 / 70" }}
        >
          {/* warm corona pooled at the gold vein's bright far end — the only mass/energy in the field */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              left: `${GOLD_END.x}%`,
              top: `${(GOLD_END.y / 70) * 100}%`,
              width: "46%",
              height: "62%",
              translateX: "-50%",
              translateY: "-50%",
              background: `radial-gradient(circle, rgba(255,160,60,0.30) 0%, rgba(250,82,15,0.12) 36%, rgba(161,19,26,0.04) 56%, transparent 72%)`,
              filter: "blur(34px)",
            }}
            animate={live ? { opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] } : { opacity: reduce ? 0.85 : 0 }}
            transition={
              live ? { duration: 6.5, repeat: Infinity, ease: "easeInOut" } : { duration: 1.0, ease: EASE_ORGANIC }
            }
          />

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 70"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
          >
            <defs>
              {/* the living vein's gradient: incandescent core → flame → ember */}
              <linearGradient id="ov-gold" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor={SUN_EMBER} />
                <stop offset="34%" stopColor={SUN_GLOW} />
                <stop offset="72%" stopColor={SUN_CORE} />
                <stop offset="100%" stopColor={FLAME_BRIGHT} />
              </linearGradient>
              <radialGradient id="ov-nugget" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={FLAME_BRIGHT} />
                <stop offset="45%" stopColor={SUN_CORE} />
                <stop offset="100%" stopColor={SUN_GLOW} stopOpacity="0" />
              </radialGradient>
              {/* soft glow for the gold vein + travelling nugget */}
              <filter id="ov-soft" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="0.7" />
              </filter>
              <filter id="ov-bloom" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
            </defs>

            {/* inert ore-flecks — faint grey texture in the rock */}
            <g>
              {flecks.map((f, i) => (
                <motion.circle
                  key={`fl-${i}`}
                  cx={f.x}
                  cy={f.y}
                  r={f.r}
                  fill={ROCK}
                  initial={{ opacity: 0 }}
                  animate={
                    live ? { opacity: [f.o * 0.5, f.o, f.o * 0.5] } : { opacity: reduce ? f.o : 0 }
                  }
                  transition={
                    live
                      ? { duration: 5 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.4 }
                      : { duration: 1.0, delay: 0.1 }
                  }
                />
              ))}
            </g>

            {/* ── the DEAD veins — cold grey rock, dim, crisscrossing; 4 named OOS failures ── */}
            <g>
              {dead.map((v, i) => (
                <g key={`dv-${i}`}>
                  <motion.path
                    d={v.d}
                    stroke={v.dim ? ROCK_DIM : ROCK}
                    strokeWidth={v.w}
                    strokeLinecap="round"
                    fill="none"
                    style={{ opacity: v.o }}
                    initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, margin: "-6% 0px" }}
                    transition={
                      reduce ? { duration: 0 } : { duration: 1.1, delay: 0.1 + i * 0.05, ease: EASE_ORGANIC }
                    }
                  />
                </g>
              ))}
            </g>

            {/* ── THE LIVING vein — solar-gold: a soft under-glow, then the bright stroke draws in ── */}
            {/* under-glow (bloomed, sits beneath the crisp stroke for depth-via-light) */}
            <motion.path
              d={GOLD_VEIN}
              stroke="url(#ov-gold)"
              strokeWidth={2.6}
              strokeLinecap="round"
              fill="none"
              filter="url(#ov-bloom)"
              initial={reduce ? { pathLength: 1, opacity: 0.5 } : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: live ? [0.4, 0.6, 0.4] : 0.5 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      pathLength: { duration: 1.6, delay: 0.45, ease: EASE_ORGANIC },
                      opacity: live
                        ? { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.0 }
                        : { duration: 1.2, delay: 0.45 },
                    }
              }
            />
            {/* crisp gold stroke — the vein itself; breathes (stroke-width pulse) once drawn */}
            <motion.path
              d={GOLD_VEIN}
              stroke="url(#ov-gold)"
              strokeLinecap="round"
              fill="none"
              filter="url(#ov-soft)"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={reduce ? { duration: 0 } : { duration: 1.6, delay: 0.45, ease: EASE_ORGANIC }}
              animate={live ? { strokeWidth: [1.15, 1.5, 1.15] } : undefined}
              style={{ strokeWidth: 1.3 }}
            />

            {/* travelling nugget — a bright bead of light flows along the gold vein on a loop */}
            {live ? (
              <>
                {/* comet trail (dim, slightly lagging) */}
                <motion.circle
                  r={1.5}
                  fill="url(#ov-nugget)"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ offsetDistance: "100%", opacity: [0, 0.5, 0.5, 0] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                    delay: 2.2 - 0.18,
                    times: [0, 0.12, 0.86, 1],
                  }}
                  style={{ offsetPath: `path("${GOLD_VEIN}")` } as React.CSSProperties}
                />
                {/* the hot core nugget */}
                <motion.circle
                  r={0.95}
                  fill={FLAME_BRIGHT}
                  filter="url(#ov-soft)"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                    delay: 2.2,
                    times: [0, 0.1, 0.88, 1],
                  }}
                  style={{ offsetPath: `path("${GOLD_VEIN}")` } as React.CSSProperties}
                />
              </>
            ) : null}

            {/* bright wellhead at the vein's terminus — where the gold surfaces (anchors the readout) */}
            <motion.g
              initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={reduce ? { duration: 0 } : { ...SPRING_POP, delay: 1.9 }}
              style={{ transformOrigin: `${GOLD_END.x}px ${GOLD_END.y}px` }}
            >
              <motion.circle
                cx={GOLD_END.x}
                cy={GOLD_END.y}
                r={3.4}
                fill={SUN_GLOW}
                opacity={0.16}
                filter="url(#ov-bloom)"
                animate={live ? { scale: [1, 1.35, 1], opacity: [0.12, 0.26, 0.12] } : undefined}
                transition={live ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : undefined}
                style={{ transformOrigin: `${GOLD_END.x}px ${GOLD_END.y}px` }}
              />
              <circle cx={GOLD_END.x} cy={GOLD_END.y} r={1.5} fill="url(#ov-nugget)" />
              <circle cx={GOLD_END.x} cy={GOLD_END.y} r={0.65} fill={FLAME_BRIGHT} />
            </motion.g>

            {/* ── FAILED labels — terse mono tags pinned to the four named dead veins ── */}
            <g>
              {dead.map((v, i) =>
                v.label && v.lx != null && v.ly != null ? (
                  <motion.g
                    key={`lbl-${i}`}
                    initial={reduce ? { opacity: 0.7 } : { opacity: 0 }}
                    whileInView={{ opacity: 0.7 }}
                    viewport={{ once: true, margin: "-6% 0px" }}
                    transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.7 + i * 0.12, ease: EASE_ORGANIC }}
                  >
                    {/* tiny dead-node marker on the vein */}
                    <circle cx={v.lx} cy={v.ly} r={0.7} fill={ROCK} opacity={0.9} />
                    <text
                      x={v.lx + 1.8}
                      y={v.ly - 1.1}
                      fill={MUTE}
                      style={{ fontFamily: MONO, fontSize: "1.95px", letterSpacing: "0.14em", opacity: 0.85 }}
                    >
                      {v.label}
                    </text>
                    <text
                      x={v.lx + 1.8}
                      y={v.ly + 1.4}
                      fill={MUTE_2}
                      style={{ fontFamily: MONO, fontSize: "1.6px", letterSpacing: "0.2em" }}
                    >
                      OOS · FAILED
                    </text>
                  </motion.g>
                ) : null,
              )}
            </g>
          </svg>

          {/* ── the MNT readout — HTML overlay anchored beside the gold wellhead (crisp mono, never blurred) ── */}
          <motion.div
            className="absolute"
            style={{
              left: `${GOLD_END.x}%`,
              top: `${(GOLD_END.y / 70) * 100}%`,
              transform: "translate(-104%, -118%)",
              textAlign: "right",
            }}
            initial={reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 2.0, ease: EASE_ORGANIC }}
          >
            {/* asset + edge name */}
            <div
              className="flex items-center justify-end gap-2 font-mono"
              style={{ fontSize: "11px", letterSpacing: "0.22em" }}
            >
              <span style={{ color: SUN_CORE, fontWeight: 500 }}>{EDGE.asset}</span>
              <span style={{ color: MUTE_2 }}>·</span>
              <span style={{ color: ICE, opacity: 0.78 }}>{EDGE.name.toUpperCase()}</span>
            </div>

            {/* the four real metrics — tabular mono, the two headline figures warm */}
            <div
              className="mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 font-mono"
              style={{ fontSize: "12px", letterSpacing: "0.12em", fontVariantNumeric: "tabular-nums" }}
            >
              {READOUT.map((m, i) => (
                <span key={m.v} className="flex items-center gap-x-3">
                  {i > 0 ? (
                    <span aria-hidden style={{ height: 10, width: 1, backgroundColor: MUTE_2, opacity: 0.6 }} />
                  ) : null}
                  <span style={{ color: m.em ? SUN_CORE : ICE, opacity: m.em ? 1 : 0.74 }}>{m.v}</span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── honest caveat — pinned low-left in the field, dim + small (never buried) ── */}
          <motion.div
            className="absolute bottom-1 left-0 max-w-[60%]"
            initial={reduce ? { opacity: 0.85 } : { opacity: 0 }}
            whileInView={{ opacity: 0.85 }}
            viewport={{ once: true, margin: "-6% 0px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 1.0, ease: EASE_ORGANIC }}
          >
            <div
              className="font-mono"
              style={{ fontSize: "8.5px", letterSpacing: "0.24em", color: MUTE_2 }}
            >
              HONEST CAVEAT
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              {CAVEAT_CHIPS.map((c, i) => (
                <span key={c} className="flex items-center gap-x-2">
                  {i > 0 ? <span aria-hidden style={{ color: MUTE_2, opacity: 0.6 }}>·</span> : null}
                  <span
                    className="font-mono"
                    style={{ fontSize: "9px", letterSpacing: "0.16em", color: MUTE, opacity: 0.82 }}
                  >
                    {c}
                  </span>
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* hide the in-field SVG FAILED labels on very narrow widths (they collide at small scale) */}
      <style>{`@media (max-width: 480px){ #edge svg text { opacity: 0.55; } }`}</style>
    </section>
  );
}
