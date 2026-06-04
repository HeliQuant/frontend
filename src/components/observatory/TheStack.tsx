"use client";

/**
 * TheStack — "A firm, deployed." (id="architecture")
 *
 * The fifth observatory diorama: HeliQuant's machinery rendered as a single connected
 * spatial machine (anti-card, borderless). Continuity with the hero's constellation —
 * cold desk-nodes + thin Bézier connectors + inbound signal pulses — but here the
 * subject is the *deployed firm*, not the awe:
 *
 *   · UPPER PLANE  seven cold specialist DESKS fan around a warm solar PM core; each
 *                  feeds a thin organic arc inward that carries an occasional pulse.
 *   · BASEPLATE    a faceted Mantle slab below bears six engraved CONTRACT anchor-nodes
 *                  (real addresses, truncated mono, Mantlescan links, emerald DEPLOYED
 *                  ticks). The first three are the ERC-8004 identity trio, grouped under
 *                  a featured badge; a hairline umbilical drops from the PM into the slab.
 *   · NOTES        wide-tracked mono whispers: ERC-8004 · chain 5003 · bring-your-own LLM.
 *
 * If the text were stripped, the picture still reads: a machine of desks feeding a core,
 * anchored to a plane of on-chain contract nodes.
 *
 * The LAW: midnight void #05060f (hero standard, never #000); blue-tinted glass hairlines;
 * blueprint-grid texture behind; depth via glow, never black drop-shadow; mono all-caps
 * wide-tracked for every label/address; display 300 headline; chartreuse is RESERVED — never
 * used here. Self-contained colour/easing consts + inline styles. Loops
 * gate behind a mounted flag (no hydration drift); randomness seeded via local mulberry32;
 * reduced-motion freezes to a sensible final state. Only fonts + REAL data are borrowed.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DESKS, CONTRACTS, MANTLESCAN, CHAIN_ID, type Contract } from "@/lib/heliquant";

// ───────────────────────────── the LAW: local palette (mirrors the hero standard tokens) ─────────────────────────────
const VOID = "#05060f"; // midnight abyss — matches the hero base (NEVER pure #000)
const PANEL = "#0d0d0e"; // node interior fill (reads as cut-out, not card)
const SLAB = "#101012"; // baseplate surface base
const SLAB_HI = "#17171a"; // baseplate facet highlight
const HAIRLINE = "rgba(186, 215, 247, 0.08)"; // blue-tinted glass hairline (hero standard)
const ICE = "#d8ecf8"; // comet — primary text on dark
const COLD = "#7d93b0"; // cold desk-node hue (muted blue-grey)
const COLD_DIM = "#566173"; // dimmer cold label / connector
const MUTE = "#81899b"; // interstellar gray — dim instrument label
const MUTE_2 = "#4d535d"; // dimmer / future
const SOLAR = "#ffd06a"; // PM incandescent core
const FLAME = "#fa520f"; // solar flame
const EMBER = "#a1131a"; // outer ember
const EMERALD = "#72ce7b"; // DEPLOYED / verified
// chartreuse #d0f100 — DELIBERATELY ABSENT here (reserved for the hero CTA + seal).

// ───────────────────────────── motion physics (authored — organic / elastic, never linear) ─────────────────────────────
const SPRING_LAND = { type: "spring" as const, stiffness: 120, damping: 15 }; // node arrival overshoot
const SPRING_SLAB = { type: "spring" as const, stiffness: 90, damping: 18 }; // heavier slab settle
const EASE_DRAW = [0.4, 0, 0.2, 1] as const; // connector draw-in
const POP = [0.175, 0.885, 0.32, 1.275] as const; // tick / badge pop
const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

// choreography clock (seconds) — caption first (handled by viewport), then machine assembles
const T = {
  pm: 0.1,
  desksBase: 0.45, // + i*0.09 cascade
  arcsBase: 0.75, // + i*0.09 (draw begins as desks land)
  slab: 1.05,
  anchorsBase: 1.35, // + i*0.08
  umbilical: 1.2,
};

// ───────────────────────────── desk → terse mono label + one-line blurb (real DESKS) ─────────────────────────────
const DESK_ABBR: Record<string, string> = {
  "Regime/Technical": "RGM",
  "Macro (Allora)": "MACRO",
  "On-chain/Risk": "CHAIN",
  Research: "RSRCH",
  "Smart-Money Flow": "FLOW",
  "Smart-Social": "SOCIAL",
  "OI-Contrarian": "OI",
};
// a terse, scene-legible rendering of each desk's edge (distilled from the real blurb)
const DESK_TAG: Record<string, string> = {
  "Regime/Technical": "82.6% OOS",
  "Macro (Allora)": "ALLORA",
  "On-chain/Risk": "GOPLUS VETO",
  Research: "FEAR & GREED",
  "Smart-Money Flow": "NANSEN",
  "Smart-Social": "ELFA",
  "OI-Contrarian": "VALIDATED EDGE",
};
function abbr(key: string): string {
  return DESK_ABBR[key] ?? key.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase();
}
function tag(key: string): string {
  return DESK_TAG[key] ?? "";
}

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

// ───────────────────────────── geometry: the constellation plane (viewBox 0..100 × 0..100) ─────────────────────────────
// PM core sits high-centre-ish; the slab occupies the lower band. Desks fan above + around it,
// hand-placed at varied angle/radius/size/depth so it never reads as a ring or a grid.
const PM = { x: 50, y: 33 };

type DeskNode = {
  x: number;
  y: number;
  size: number; // node scale
  depth: number; // 0 far → 1 near : drives opacity / label brightness
  curve: number; // perpendicular bow of its inbound arc
  side: "L" | "R"; // label anchor side
  edge?: boolean; // the OI validated edge — the one warm-tinted node
};
// 7 placements, deliberately uneven. Indices map 1:1 to DESKS order.
const DESK_LAYOUT: DeskNode[] = [
  { x: 18, y: 18, size: 1.0, depth: 0.92, curve: 0.18, side: "L" }, // RGM   — upper-left, foreground
  { x: 9, y: 40, size: 0.78, depth: 0.5, curve: -0.26, side: "L" }, // MACRO — far left
  { x: 30, y: 9, size: 0.82, depth: 0.62, curve: 0.3, side: "L" }, // CHAIN — top, mid-far
  { x: 71, y: 10, size: 0.8, depth: 0.58, curve: -0.3, side: "R" }, // RSRCH — top-right, mid-far
  { x: 90, y: 28, size: 0.74, depth: 0.46, curve: -0.2, side: "R" }, // FLOW  — far right
  { x: 84, y: 47, size: 0.86, depth: 0.66, curve: 0.24, side: "R" }, // SOCIAL— right, mid
  { x: 62, y: 50, size: 1.05, depth: 0.96, curve: -0.16, side: "R", edge: true }, // OI — near-centre-right, foreground (the edge)
];

type PlacedDesk = DeskNode & { key: string; label: string; tagline: string };
function placeDesks(): PlacedDesk[] {
  return DESKS.slice(0, DESK_LAYOUT.length).map((d, i) => {
    const n = DESK_LAYOUT[i]!;
    return { ...n, key: d.key, label: abbr(d.key), tagline: tag(d.key) };
  });
}

/** Organic Bézier arc from a desk node to the PM core; control offset perpendicular to chord. */
function arcPath(n: PlacedDesk): string {
  const sx = n.x;
  const sy = n.y;
  const dx = PM.x - sx;
  const dy = PM.y - sy;
  const mx = (sx + PM.x) / 2;
  const my = (sy + PM.y) / 2;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * n.curve * len;
  const py = (dx / len) * n.curve * len;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${(mx + px).toFixed(2)} ${(my + py).toFixed(2)} ${PM.x.toFixed(2)} ${PM.y.toFixed(2)}`;
}

// ───────────────────────────── PM dot-matrix sphere (small, dense-to-sparse) ─────────────────────────────
type Dot = { x: number; y: number; r: number; o: number };
function buildPmDots(): Dot[] {
  const dots: Dot[] = [{ x: 0, y: 0, r: 0.5, o: 1 }];
  const rings = 4;
  for (let ring = 1; ring <= rings; ring++) {
    const rr = ring / rings;
    const radius = rr * 4.4;
    const count = Math.round(5 + ring * 5);
    const brightness = 1 - rr * 0.74;
    for (let k = 0; k < count; k++) {
      const ang = (k / count) * Math.PI * 2 + ring * 0.5;
      dots.push({ x: Math.cos(ang) * radius, y: Math.sin(ang) * radius * 0.94, r: 0.42 - rr * 0.26, o: brightness });
    }
  }
  return dots;
}

/** Faint far ticks scattered across the upper void — pure atmosphere. */
function buildStars(seed: number, n: number): Dot[] {
  const rnd = mulberry32(seed);
  const out: Dot[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ x: rnd() * 100, y: rnd() * 58, r: 0.12 + rnd() * 0.32, o: 0.08 + rnd() * 0.22 });
  }
  return out;
}

// ───────────────────────────── baseplate: 6 contract anchor slots ─────────────────────────────
// Two engraved rows on the slab. Row 1 = ERC-8004 identity trio (badge); row 2 = the rest.
const ERC8004 = new Set(["IdentityRegistry", "ReputationRegistry", "ValidationRegistry"]);
function truncAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

// ───────────────────────────── component ─────────────────────────────
export default function TheStack() {
  const reduce = useReducedMotion() ?? false;
  const desks = useMemo(() => placeDesks(), []);
  const pmDots = useMemo(() => buildPmDots(), []);
  const stars = useMemo(() => buildStars(0x57ac, 64), []);

  // gate idle loops until after first paint → SSR markup matches, no hydration drift
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const live = mounted && !reduce;

  const trio = CONTRACTS.filter((c) => ERC8004.has(c.name));
  const rest = CONTRACTS.filter((c) => !ERC8004.has(c.name));

  return (
    <section
      id="architecture"
      aria-label="The Stack — HeliQuant, a firm deployed on Mantle"
      className="relative isolate overflow-hidden px-6 py-28 sm:px-10 lg:px-16"
      style={{ backgroundColor: VOID }}
    >
      {/* faint top seam — the void flows on from the section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
      />
      {/* deep atmosphere — warm core luminance up top, cool settle toward the slab (depth via light) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(80% 50% at 50% 30%, rgba(40,22,10,0.40) 0%, rgba(12,9,8,0) 55%), linear-gradient(180deg, ${VOID} 0%, #0b0b0c 70%, #0c0c0e 100%)`,
        }}
      />
      {/* blueprint grid — the hero's quiet unifying texture, faded at the edges; sits behind everything */}
      <div aria-hidden className="bg-blueprint pointer-events-none absolute inset-0 z-0 opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ░░░ CAPTION (~30%) ░░░ */}
        <motion.div
          className="max-w-xl"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_DRAW }}
            className="font-mono text-[11px] uppercase"
            style={{ color: COLD, letterSpacing: "0.26em" }}
          >
            <span style={{ color: FLAME }}>◦</span>{" "}
            <span style={{ color: ICE, opacity: 0.82 }}>THE STACK · ERC-8004 ON MANTLE</span>
          </motion.p>

          <motion.h2
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={reduce ? { duration: 0 } : { duration: 0.85, ease: [0.2, 0.8, 0.2, 1.05] }}
            className="font-display mt-5 text-balance"
            style={{
              color: ICE,
              fontWeight: 300,
              fontSize: "clamp(2rem, 4.6vw, 3.3rem)",
              lineHeight: 1.04,
              letterSpacing: "0.01em",
            }}
          >
            A firm,{" "}
            <span
              style={{
                fontStyle: "italic",
                background: `linear-gradient(95deg, ${SOLAR}, ${FLAME})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              deployed.
            </span>
          </motion.h2>

          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.12, ease: EASE_DRAW }}
            className="mt-5 max-w-lg text-balance"
            style={{ color: ICE, opacity: 0.6, fontSize: "1rem", lineHeight: 1.65 }}
          >
            Seven real-source desks debate; a PM decides; six contracts — identity, reputation,
            validation, vault — make it a verifiable on-chain firm.{" "}
            <span style={{ color: COLD, opacity: 0.95 }}>Bring your own LLM.</span>
          </motion.p>
        </motion.div>

        {/* ░░░ THE DIORAMA (~70%) — one connected spatial machine ░░░ */}
        <motion.div
          className="relative mt-12"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          {/* ambient warm bloom behind the PM (glow-depth, not shadow) */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[20%] h-72 w-72 -translate-x-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(250,82,15,0.20) 0%, rgba(161,19,26,0.06) 45%, transparent 70%)`,
              filter: "blur(56px)",
            }}
            animate={live ? { opacity: [0.6, 0.95, 0.6], scale: [1, 1.08, 1] } : { opacity: 0.7 }}
            transition={live ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : undefined}
          />

          {/* the machine plane — a single SVG (constellation above · baseplate below) */}
          <svg
            className="relative block h-auto w-full"
            viewBox="0 0 100 78"
            fill="none"
            role="img"
            aria-label="Seven desk nodes feeding a central PM core, anchored to a Mantle baseplate of six deployed contract nodes"
          >
            <defs>
              <radialGradient id="ts-pm" cx="50%" cy="46%" r="55%">
                <stop offset="0%" stopColor="#fff2d6" />
                <stop offset="38%" stopColor={SOLAR} />
                <stop offset="78%" stopColor={FLAME} />
                <stop offset="100%" stopColor={EMBER} stopOpacity="0.25" />
              </radialGradient>
              <linearGradient id="ts-slab" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SLAB_HI} />
                <stop offset="100%" stopColor={SLAB} />
              </linearGradient>
              <filter id="ts-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.4" />
              </filter>
            </defs>

            {/* ── far starfield (upper void only) ── */}
            <g>
              {stars.map((s, i) => (
                <motion.circle
                  key={`star-${i}`}
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill={ICE}
                  initial={{ opacity: 0 }}
                  animate={live ? { opacity: [s.o * 0.5, s.o, s.o * 0.5] } : { opacity: reduce ? s.o : 0 }}
                  transition={
                    live
                      ? { duration: 3.5 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.3 }
                      : { duration: 1, delay: 0.1 }
                  }
                />
              ))}
            </g>

            {/* ── inbound arcs: desk → PM (draw in, then carry pulses) ── */}
            <g>
              {desks.map((n, i) => {
                const d = arcPath(n);
                return (
                  <motion.path
                    key={`arc-${n.key}`}
                    d={d}
                    stroke={n.edge ? SOLAR : COLD}
                    strokeWidth={0.16}
                    strokeLinecap="round"
                    style={{ opacity: n.edge ? 0.34 : 0.12 + n.depth * 0.14 }}
                    initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.7, delay: T.arcsBase + i * 0.09, ease: EASE_DRAW }}
                  />
                );
              })}
            </g>

            {/* ── signal pulses travelling inward along each arc (idle, staggered) ── */}
            {live && (
              <g>
                {desks.map((n, i) => {
                  const d = arcPath(n);
                  return (
                    <motion.circle
                      key={`pulse-${n.key}`}
                      r={0.42 + n.depth * 0.3}
                      fill={n.edge ? SOLAR : ICE}
                      filter="url(#ts-soft)"
                      initial={{ opacity: 0, offsetDistance: "0%" }}
                      animate={{ opacity: [0, 0.75, 0.75, 0], offsetDistance: "100%" }}
                      transition={{
                        duration: 2.6 + (i % 3) * 0.6,
                        repeat: Infinity,
                        ease: "easeIn",
                        delay: T.arcsBase + 0.7 + i * 0.42,
                        times: [0, 0.1, 0.85, 1],
                      }}
                      style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
                    />
                  );
                })}
              </g>
            )}

            {/* ── umbilical: a hairline drop from the PM into the slab (firm → ledger) ── */}
            <motion.line
              x1={PM.x}
              y1={PM.y + 5}
              x2={PM.x}
              y2={51}
              stroke={COLD_DIM}
              strokeWidth={0.18}
              strokeDasharray="0.6 1.1"
              style={{ opacity: 0.5 }}
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={reduce ? { duration: 0 } : { duration: 0.6, delay: T.umbilical, ease: EASE_DRAW }}
            />
            {live && (
              <motion.circle
                r={0.4}
                fill={EMERALD}
                filter="url(#ts-soft)"
                initial={{ opacity: 0, cy: PM.y + 5 }}
                animate={{ opacity: [0, 0.9, 0.9, 0], cy: [PM.y + 5, 51] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn", delay: 2.2, times: [0, 0.15, 0.8, 1] }}
                cx={PM.x}
              />
            )}

            {/* ── PM core — the only warm mass: corona ring + dot-matrix sphere ── */}
            <motion.g
              initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={reduce ? { duration: 0 } : { ...SPRING_LAND, delay: T.pm }}
              style={{ transformOrigin: `${PM.x}px ${PM.y}px` }}
            >
              {/* breathing corona */}
              <motion.circle
                cx={PM.x}
                cy={PM.y}
                r={7.5}
                fill="url(#ts-pm)"
                style={{ transformOrigin: `${PM.x}px ${PM.y}px` }}
                animate={live ? { opacity: [0.16, 0.3, 0.16], scale: [1, 1.1, 1] } : { opacity: 0.22 }}
                transition={live ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
              />
              <circle cx={PM.x} cy={PM.y} r={4.6} fill="url(#ts-pm)" opacity={0.95} />
              {/* dot-matrix sphere overlay */}
              <g transform={`translate(${PM.x} ${PM.y})`}>
                {pmDots.map((dt, i) => (
                  <circle key={`pm-${i}`} cx={dt.x} cy={dt.y} r={dt.r} fill={dt.o > 0.55 ? "#fff2d6" : SOLAR} opacity={dt.o} />
                ))}
              </g>
              {/* PM ident ring + label */}
              <circle cx={PM.x} cy={PM.y} r={6} fill="none" stroke={SOLAR} strokeWidth={0.18} opacity={0.4} />
              <text
                x={PM.x}
                y={PM.y - 8.6}
                textAnchor="middle"
                fill={SOLAR}
                style={{ fontFamily: MONO, fontSize: "2.4px", letterSpacing: "0.24em", opacity: 0.95 }}
              >
                PM · SYNTHESIS
              </text>
            </motion.g>

            {/* ── the seven desk nodes — cold cut-out nodes, terse mono label + tagline ── */}
            <g>
              {desks.map((n, i) => {
                const nodeColor = n.edge ? SOLAR : COLD;
                const labelColor = n.edge ? SOLAR : n.depth > 0.6 ? COLD : COLD_DIM;
                const driftX = n.depth < 0.6 ? 0.4 : 0.7;
                const r = 1.5 * n.size;
                return (
                  <motion.g
                    key={`desk-${n.key}`}
                    initial={reduce ? { opacity: n.depth, scale: 1 } : { opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 0.6 + n.depth * 0.4, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={reduce ? { duration: 0 } : { ...SPRING_LAND, delay: T.desksBase + i * 0.09 }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  >
                    {/* slow idle orbital drift */}
                    <motion.g
                      animate={live ? { x: [0, driftX, 0, -driftX, 0], y: [0, -driftX * 0.7, 0, driftX * 0.7, 0] } : undefined}
                      transition={live ? { duration: 20 + i * 2.5, repeat: Infinity, ease: "easeInOut" } : undefined}
                    >
                      {/* faint halo */}
                      <circle cx={n.x} cy={n.y} r={r * 2.4} fill={nodeColor} opacity={n.edge ? 0.07 : 0.05} />
                      {/* node ring (cut-out: void interior + thin ring → not a card) */}
                      <circle cx={n.x} cy={n.y} r={r} fill={PANEL} stroke={nodeColor} strokeWidth={0.18} opacity={0.55 + n.depth * 0.45} />
                      {/* core dot */}
                      <circle cx={n.x} cy={n.y} r={r * 0.4} fill={nodeColor} opacity={0.75 + n.depth * 0.25} />
                      {/* edge node: a soft idle pulse ring (the one validated edge breathes) */}
                      {n.edge && live && (
                        <motion.circle
                          cx={n.x}
                          cy={n.y}
                          r={r}
                          fill="none"
                          stroke={SOLAR}
                          strokeWidth={0.18}
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ scale: [1, 2.1], opacity: [0.6, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", repeatDelay: 0.6 }}
                          style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                        />
                      )}
                      {/* label + tagline, wide-tracked mono, anchored outward from the node */}
                      <text
                        className="ts-desk-label"
                        x={n.x + (n.side === "L" ? -(r + 1) : r + 1)}
                        y={n.y - 0.2}
                        textAnchor={n.side === "L" ? "end" : "start"}
                        fill={labelColor}
                        style={{ fontFamily: MONO, fontSize: `${2.1 + n.depth * 0.5}px`, letterSpacing: "0.14em", opacity: 0.7 + n.depth * 0.3 }}
                      >
                        {n.label}
                      </text>
                      <text
                        className="ts-desk-label"
                        x={n.x + (n.side === "L" ? -(r + 1) : r + 1)}
                        y={n.y + 2.4}
                        textAnchor={n.side === "L" ? "end" : "start"}
                        fill={n.edge ? SOLAR : MUTE}
                        style={{ fontFamily: MONO, fontSize: "1.55px", letterSpacing: "0.1em", opacity: n.edge ? 0.9 : 0.55 }}
                      >
                        {n.tagline}
                      </text>
                    </motion.g>
                  </motion.g>
                );
              })}
            </g>

            {/* ── THE MANTLE BASEPLATE — a faceted slab carrying engraved contract anchors ── */}
            <motion.g
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={reduce ? { duration: 0 } : { ...SPRING_SLAB, delay: T.slab }}
            >
              {/* slab body */}
              <rect x="4" y="52" width="92" height="24" rx="1.6" fill="url(#ts-slab)" stroke={HAIRLINE} strokeWidth="0.2" />
              {/* top facet highlight + base shade seam (depth via light) */}
              <line x1="4" x2="96" y1="53.1" y2="53.1" stroke={ICE} strokeWidth="0.12" opacity={0.08} />
              <line x1="4" x2="96" y1="74.8" y2="74.8" stroke={EMBER} strokeWidth="0.12" opacity={0.12} />
              {/* baseplate engraving: title left, chain right */}
              <text x="6.5" y="56.4" fill={MUTE} style={{ fontFamily: MONO, fontSize: "1.7px", letterSpacing: "0.2em" }}>
                MANTLE SEPOLIA BASEPLATE
              </text>
              <text x="93.5" y="56.4" textAnchor="end" fill={EMERALD} style={{ fontFamily: MONO, fontSize: "1.7px", letterSpacing: "0.2em" }}>
                CHAIN {CHAIN_ID} · DEPLOYED
              </text>
              {/* row divider hairline between the ERC-8004 trio and the rest */}
              <line x1="6.5" x2="93.5" y1="64.4" y2="64.4" stroke={HAIRLINE} strokeWidth="0.18" />
              {/* the ERC-8004 trio badge bracket (row 1) */}
              <line x1="6.5" x2="6.5" y1="58.6" y2="63.2" stroke={SOLAR} strokeWidth="0.22" opacity={0.5} />
              <text x="8" y="59.9" fill={SOLAR} style={{ fontFamily: MONO, fontSize: "1.45px", letterSpacing: "0.18em", opacity: 0.85 }}>
                ERC-8004 IDENTITY TRIO
              </text>
            </motion.g>

            {/* engraved contract anchor-nodes (SVG layer = the dots + ticks; the links are an HTML overlay below) */}
            <g>
              {CONTRACTS.map((c, i) => {
                const isTrio = ERC8004.has(c.name);
                const idx = isTrio ? trio.indexOf(c) : rest.indexOf(c);
                const cols = 3;
                const cx = 16 + (idx % cols) * 30; // three columns across the slab
                const cy = isTrio ? 61.4 : 70.2; // row 1 (trio) / row 2 (rest)
                return (
                  <motion.g
                    key={`anchor-${c.address}`}
                    initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={reduce ? { duration: 0 } : { ...SPRING_LAND, delay: T.anchorsBase + i * 0.08 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  >
                    {/* engraved seat (recessed look: dark fill + hairline) */}
                    <circle cx={cx} cy={cy} r={1.5} fill={SLAB} stroke={isTrio ? SOLAR : COLD_DIM} strokeWidth={0.18} opacity={0.9} />
                    {/* deployed core dot */}
                    <circle cx={cx} cy={cy} r={0.62} fill={EMERALD} opacity={0.95} />
                    {/* idle "DEPLOYED" tick pulse */}
                    {live && (
                      <motion.circle
                        cx={cx}
                        cy={cy}
                        r={1.5}
                        fill="none"
                        stroke={EMERALD}
                        strokeWidth={0.16}
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 0.3 + i * 0.35 }}
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                      />
                    )}
                  </motion.g>
                );
              })}
            </g>
          </svg>

          {/* ░░░ HTML OVERLAY — contract labels + addresses + Mantlescan links (interactive, accessible) ░░░
               Positioned over the slab band of the SVG (slab spans y≈52..76 of a 0..78 viewBox ⇒ ≈67%..97% height).
               Each anchor's column matches the SVG dots; links are real and open Mantlescan. */}
          <div className="pointer-events-none absolute inset-0">
            {/* trio row (row 1) */}
            <div className="absolute left-0 right-0" style={{ top: "75%" }}>
              <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-[10%]">
                {trio.map((c) => (
                  <AnchorLabel key={c.address} contract={c} trio />
                ))}
              </div>
            </div>
            {/* rest row (row 2) */}
            <div className="absolute left-0 right-0" style={{ top: "86%" }}>
              <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-[10%]">
                {rest.map((c) => (
                  <AnchorLabel key={c.address} contract={c} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ░░░ MACHINE NOTES — wide-tracked mono whispers, hairline-separated (NOT cards) ░░░ */}
        <motion.div
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-14 flex flex-col gap-y-3 font-mono sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6"
          style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.18em", color: ICE }}
        >
          <span className="flex items-center gap-2.5">
            <span aria-hidden style={{ height: 5, width: 5, borderRadius: 999, backgroundColor: EMERALD }} />
            <span style={{ color: MUTE, opacity: 0.92 }}>
              ERC-8004 IDENTITY · DEPLOYED ON MANTLE SEPOLIA · CHAIN {CHAIN_ID}
            </span>
          </span>
          <span aria-hidden className="hidden h-3 w-px sm:block" style={{ backgroundColor: COLD_DIM, opacity: 0.4 }} />
          <span className="flex items-center gap-2.5">
            <span aria-hidden style={{ height: 5, width: 5, borderRadius: 999, backgroundColor: COLD }} />
            <span style={{ color: MUTE, opacity: 0.92 }}>
              BRING-YOUR-OWN MULTI-PROVIDER LLM · DETERMINISTIC TOOLS COMPUTE, AGENTS DEBATE, PM DECIDES
            </span>
          </span>
        </motion.div>
      </div>

      {/* on narrow widths the in-SVG desk labels collide — hide them; the machine still reads as nodes + arcs */}
      <style>{`@media (max-width: 700px){ .ts-desk-label{ opacity:0 !important; } }`}</style>
    </section>
  );
}

// ───────────────────────────── HTML anchor label (over an SVG contract dot) ─────────────────────────────
function AnchorLabel({ contract, trio = false }: { contract: Contract; trio?: boolean }) {
  return (
    <div className="pointer-events-auto flex flex-col items-center text-center">
      <span
        className="font-mono"
        style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: trio ? "#ffe2ac" : ICE, opacity: 0.92 }}
      >
        {contract.name}
      </span>
      <a
        href={`${MANTLESCAN}/address/${contract.address}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`${contract.name} on Mantlescan — ${contract.address}`}
        title={contract.address}
        className="group mt-0.5 inline-flex items-center gap-1 font-mono transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", color: MUTE, opacity: 0.82, outlineColor: EMERALD }}
      >
        <span className="tabular-nums">{truncAddr(contract.address)}</span>
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ color: EMERALD }}
        >
          ↗
        </span>
      </a>
    </div>
  );
}
