"use client";

/**
 * HeroObservatory — the flagship hero for the HeliQuant dApp.
 *
 * A "spatial narrative diorama" (anti-card): a near-black void where a single warm
 * solar light (Helios) is the only source of mass, seven cold desk-satellites orbit it,
 * and thin Bézier arcs carry signal pulses inward — an all-seeing intelligence gathering
 * data from many sources and acting only when the data has earned it. Chartreuse is
 * rationed to exactly one moment: the primary CTA.
 *
 * Self-contained: every colour/easing constant is defined locally; only font-family
 * utilities + REAL data (DESKS, EDGE) are borrowed from the app. Respects reduced motion.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DESKS, EDGE } from "@/lib/heliquant";

// ───────────────────────────── the LAW: local palette (no global token dependency) ─────────────────────────────
const VOID = "#0a0a0a"; // warm near-black canvas — never pure #000
const SUN_CORE = "#ffd06a"; // incandescent core
const SUN_GLOW = "#fa520f"; // solar flame
const SUN_EMBER = "#a1131a"; // outer ember
const ICE = "#e0f6ff"; // ghost / atmospheric text + secondary ghost link
const COLD = "#7d93b0"; // cold satellite hue (muted blue-grey, NOT chartreuse)
const COLD_DIM = "#566173"; // dimmer cold label
const CHARTREUSE = "#d0f100"; // THE single accent — primary CTA only, ONE moment

// ───────────────────────────── motion physics (authored — sources give no curves) ─────────────────────────────
const SPRING_OVERSHOOT = { type: "spring" as const, stiffness: 120, damping: 14 };
const EASE_SPRING_CSS = "cubic-bezier(0.2, 0.8, 0.2, 1.05)"; // Antimetal-ish entrance overshoot
const EASE_ORGANIC = [0.4, 0, 0.2, 1] as const; // slide / arc draw-in

// choreography clock (seconds) — eyebrow → headline → sun → satellites → arcs → telemetry → CTA
const T = {
  eyebrow: 0.15,
  headline: 0.35,
  sun: 0.55,
  satellitesBase: 1.15, // + i*0.1 cascade
  arcsBase: 1.35, // + i*0.1 stagger (draw-in begins as satellites land)
  telemetry: 2.05,
  cta: 2.25,
};

// ───────────────────────────── desk → terse satellite label ─────────────────────────────
const DESK_ABBR: Record<string, string> = {
  "Regime/Technical": "RGM",
  "Macro (Allora)": "MACRO",
  "On-chain/Risk": "CHAIN",
  Research: "RSRCH",
  "Smart-Money Flow": "FLOW",
  "Smart-Social": "SOCIAL",
  "OI-Contrarian": "OI",
};
function abbr(key: string): string {
  return DESK_ABBR[key] ?? key.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
}

// ───────────────────────────── geometry ─────────────────────────────
// Helios sits slightly off-centre (asymmetric, monumental) — coords in % of the scene box.
const SUN = { x: 62, y: 44 };

/**
 * 7 satellites placed by hand at VARIED angle / radius / size / depth — never a grid,
 * never an even ring. Angles are deliberately uneven; radii + sizes fan the constellation
 * across foreground and background. `depth` (0 far → 1 near) drives opacity, blur & scale.
 */
type Sat = { angleDeg: number; radius: number; size: number; depth: number; curve: number };
const SAT_LAYOUT: Sat[] = [
  { angleDeg: 196, radius: 30, size: 13, depth: 0.95, curve: 0.22 }, // near-left, foreground
  { angleDeg: 158, radius: 38, size: 8, depth: 0.46, curve: -0.3 }, // far left
  { angleDeg: 210, radius: 24, size: 11, depth: 0.82, curve: 0.16 }, // left, close
  { angleDeg: 130, radius: 36, size: 8, depth: 0.38, curve: 0.34 }, // lower-left, far
  { angleDeg: 320, radius: 30, size: 10, depth: 0.6, curve: -0.24 }, // upper-right, mid
  { angleDeg: 28, radius: 32, size: 8, depth: 0.48, curve: 0.28 }, // lower-right, far
  { angleDeg: 8, radius: 22, size: 12, depth: 0.9, curve: -0.18 }, // right, foreground (the OI edge)
];

type Placed = Sat & { x: number; y: number; key: string; label: string; blurb: string };

function placeSatellites(): Placed[] {
  return DESKS.slice(0, SAT_LAYOUT.length).map((desk, i) => {
    const s = SAT_LAYOUT[i]!;
    const a = (s.angleDeg * Math.PI) / 180;
    // scene box is wider than tall → scale Y so visual radii read evenly
    const x = SUN.x + s.radius * Math.cos(a);
    const y = SUN.y + s.radius * 1.05 * Math.sin(a);
    return { ...s, x, y, key: desk.key, label: abbr(desk.key), blurb: desk.blurb };
  });
}

/**
 * Organic (slightly irregular) Bézier arc from a satellite to the sun, in viewBox units.
 * Control point is offset perpendicular to the chord by `curve` so no two arcs are alike.
 */
function arcPath(sx: number, sy: number, p: Placed): string {
  const dx = SUN.x - sx;
  const dy = SUN.y - sy;
  const mx = (sx + SUN.x) / 2;
  const my = (sy + SUN.y) / 2;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular unit vector × curve magnitude (scaled by chord length)
  const px = (-dy / len) * p.curve * len;
  const py = (dx / len) * p.curve * len;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${(mx + px).toFixed(2)} ${(my + py).toFixed(2)} ${SUN.x.toFixed(2)} ${SUN.y.toFixed(2)}`;
}

// ───────────────────────────── deterministic field generators (no hydration drift) ─────────────────────────────
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

type Dot = { x: number; y: number; r: number; o: number };

/** Dot-matrix sphere for Helios: concentric rings, denser & brighter toward the core. */
function buildSunDots(): Dot[] {
  const dots: Dot[] = [{ x: 0, y: 0, r: 1.6, o: 1 }];
  const rings = 7;
  for (let ring = 1; ring <= rings; ring++) {
    const rr = ring / rings; // 0..1 outward
    const radius = rr * 20; // viewBox units (sun glyph is ~40u wide)
    const count = Math.round(6 + ring * 6); // more dots further out
    const brightness = 1 - rr * 0.78; // fade outward
    for (let k = 0; k < count; k++) {
      const ang = (k / count) * Math.PI * 2 + ring * 0.4; // phase-offset rings → sphere feel
      dots.push({
        x: Math.cos(ang) * radius,
        y: Math.sin(ang) * radius * 0.94, // slight squash → volume
        r: 1.5 - rr * 1.0,
        o: brightness,
      });
    }
  }
  return dots;
}

/** Faint far starfield — tiny ticks scattered across the backdrop. */
function buildStars(seed: number, n: number): Dot[] {
  const rnd = mulberry32(seed);
  const out: Dot[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ x: rnd() * 100, y: rnd() * 100, r: 0.18 + rnd() * 0.5, o: 0.1 + rnd() * 0.32 });
  }
  return out;
}

// ───────────────────────────── telemetry strip (instrument voice) ─────────────────────────────
const TELEMETRY: string[] = [
  "REGIME 82.6% OOS",
  `1 VALIDATED EDGE · ${EDGE.asset}`, // EDGE.asset = "MNT"
  "DECISIONS SEALED ON-CHAIN",
];

// ───────────────────────────── component ─────────────────────────────
export default function HeroObservatory() {
  const reduce = useReducedMotion();
  const sats = useMemo(() => placeSatellites(), []);
  const sunDots = useMemo(() => buildSunDots(), []);
  const stars = useMemo(() => buildStars(0x5e1105, 90), []);

  // gate idle loops until after first paint so SSR markup matches, then loops engage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = mounted && !reduce; // run breathing / drift / pulses only when truly live

  return (
    <section
      className="relative isolate flex min-h-screen w-full items-end overflow-hidden"
      style={{ backgroundColor: VOID }}
      aria-label="The Observatory — HeliQuant, the all-seeing quant"
    >
      {/* ░░░ deep atmosphere: warm vertical luminance + bottom horizon glow (depth via light, not shadow) ░░░ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(140% 120% at 62% 40%, rgba(40,22,10,0.55) 0%, rgba(12,9,8,0.0) 45%), linear-gradient(180deg, ${VOID} 0%, #0c0a09 60%, #100b08 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `radial-gradient(120% 100% at 50% 130%, rgba(250,82,15,0.10) 0%, rgba(161,19,26,0.04) 35%, transparent 70%)`,
        }}
      />

      {/* ░░░ THE DIORAMA — full-bleed SVG scene (sun · arcs · satellites · starfield) ░░░ */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            {/* soft glow for arcs + pulses */}
            <radialGradient id="ho-sun-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={SUN_CORE} />
              <stop offset="45%" stopColor={SUN_GLOW} />
              <stop offset="100%" stopColor={SUN_EMBER} />
            </radialGradient>
            <filter id="ho-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>

          {/* far starfield — pure atmosphere, no content */}
          <g>
            {stars.map((s, i) => (
              <motion.circle
                key={`star-${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill={ICE}
                initial={{ opacity: 0 }}
                animate={
                  live
                    ? { opacity: [s.o * 0.5, s.o, s.o * 0.5] }
                    : { opacity: reduce ? s.o : 0 }
                }
                transition={
                  live
                    ? {
                        duration: 3.5 + (i % 5),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (i % 7) * 0.3,
                      }
                    : { duration: 1.2, delay: 0.1 }
                }
              />
            ))}
          </g>

          {/* signal arcs — drawn from satellite to sun on a staggered queue */}
          <g>
            {sats.map((p, i) => {
              const d = arcPath(p.x, p.y, p);
              return (
                <motion.path
                  key={`arc-${p.key}`}
                  d={d}
                  stroke={COLD}
                  strokeWidth={0.18}
                  strokeLinecap="round"
                  style={{ opacity: 0.12 + p.depth * 0.16 }}
                  initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.7, delay: T.arcsBase + i * 0.1, ease: EASE_ORGANIC }
                  }
                />
              );
            })}
          </g>

          {/* signal pulses — a faint bright dot travels each arc toward the sun, looping + staggered */}
          {live && (
            <g>
              {sats.map((p, i) => {
                const d = arcPath(p.x, p.y, p);
                return (
                  <motion.circle
                    key={`pulse-${p.key}`}
                    r={0.45 + p.depth * 0.35}
                    fill={ICE}
                    filter="url(#ho-soft)"
                    initial={{ opacity: 0, offsetDistance: "0%" }}
                    animate={{ opacity: [0, 0.7, 0.7, 0], offsetDistance: "100%" }}
                    transition={{
                      duration: 2.6 + (i % 3) * 0.6,
                      repeat: Infinity,
                      ease: "easeIn",
                      delay: T.arcsBase + 0.6 + i * 0.45,
                      times: [0, 0.1, 0.85, 1],
                    }}
                    style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
                  />
                );
              })}
            </g>
          )}

          {/* satellites — cold nodes with terse mono labels, gentle idle orbit-drift */}
          <g>
            {sats.map((p, i) => {
              const driftX = p.depth < 0.6 ? 0.5 : 0.9; // foreground drifts a touch more
              return (
                <motion.g
                  key={`sat-${p.key}`}
                  initial={reduce ? { opacity: p.depth, scale: 1 } : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 0.62 + p.depth * 0.38, scale: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { ...SPRING_OVERSHOOT, delay: T.satellitesBase + i * 0.1 }
                  }
                >
                  {/* very slow orbital drift wrapper */}
                  <motion.g
                    animate={
                      live
                        ? { x: [0, driftX, 0, -driftX, 0], y: [0, -driftX * 0.7, 0, driftX * 0.7, 0] }
                        : undefined
                    }
                    transition={
                      live
                        ? { duration: 22 + i * 3, repeat: Infinity, ease: "easeInOut" }
                        : undefined
                    }
                  >
                    {/* faint halo */}
                    <circle cx={p.x} cy={p.y} r={p.size * 0.5} fill={COLD} opacity={0.06} />
                    {/* node ring */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.size * 0.18}
                      fill={VOID}
                      stroke={COLD}
                      strokeWidth={0.16}
                      opacity={0.5 + p.depth * 0.5}
                    />
                    {/* node core dot */}
                    <circle cx={p.x} cy={p.y} r={p.size * 0.07} fill={COLD} opacity={0.7 + p.depth * 0.3} />
                    {/* terse label, wide-tracked mono — placed just outside the node */}
                    <text
                      className="ho-sat-label"
                      x={p.x}
                      y={p.y + p.size * 0.18 + 2.4}
                      textAnchor="middle"
                      fill={p.depth > 0.6 ? COLD : COLD_DIM}
                      style={{
                        fontFamily: "var(--font-mono, ui-monospace, monospace)",
                        fontSize: `${1.7 + p.depth * 0.6}px`,
                        letterSpacing: "0.18px",
                        opacity: 0.65 + p.depth * 0.35,
                      }}
                    >
                      {p.label}
                    </text>
                  </motion.g>
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* ░░░ HELIOS — the only light source: corona + dot-matrix sphere (HTML layer for big blur) ░░░ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: `${SUN.x}%`,
          top: `${SUN.y}%`,
          width: "clamp(220px, 30vw, 460px)",
          height: "clamp(220px, 30vw, 460px)",
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { ...SPRING_OVERSHOOT, delay: T.sun, damping: 16 }}
      >
        {/* breathing wrapper — sinusoidal idle loop, ~6s */}
        <motion.div
          className="relative h-full w-full"
          animate={live ? { scale: [1, 1.04, 1] } : undefined}
          transition={live ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          {/* huge blurred corona */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "180%",
              height: "180%",
              background: `radial-gradient(circle, rgba(255,160,60,0.42) 0%, rgba(250,82,15,0.18) 30%, rgba(161,19,26,0.06) 50%, transparent 68%)`,
              filter: "blur(36px)",
            }}
            animate={live ? { opacity: [0.78, 1, 0.78] } : undefined}
            transition={live ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
          {/* layered radial core */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "56%",
              height: "56%",
              background: `radial-gradient(circle at 50% 46%, ${SUN_CORE} 0%, ${SUN_GLOW} 42%, ${SUN_EMBER} 72%, transparent 100%)`,
              boxShadow: `0 0 70px 10px rgba(250,82,15,0.30), 0 0 140px 40px rgba(161,19,26,0.14)`,
              filter: "blur(2px)",
            }}
          />
          {/* dot-matrix sphere overlay — denser/brighter at centre (SVG glyph) */}
          <motion.svg
            className="absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2"
            viewBox="-22 -22 44 44"
            fill="none"
            animate={live ? { opacity: [0.9, 1, 0.9] } : undefined}
            transition={live ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            {sunDots.map((d, i) => (
              <circle
                key={`sd-${i}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill={d.o > 0.55 ? "#fff2d6" : SUN_CORE}
                opacity={d.o}
              />
            ))}
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* legibility scrim — strong on mobile (diorama overlaps copy), faint on desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-2/3 sm:h-1/2"
        style={{ background: "linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.72) 32%, transparent 100%)" }}
      />

      {/* ░░░ COPY LAYER — minimal, ~30% of the composition, anchored lower-left ░░░ */}
      <div className="relative z-10 w-full px-6 pb-16 pt-32 sm:px-10 md:pb-20 lg:px-16">
        <div className="max-w-2xl">
          {/* eyebrow */}
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, delay: T.eyebrow, ease: EASE_ORGANIC }}
            className="font-mono text-[11px] uppercase"
            style={{ color: COLD, letterSpacing: "0.26em" }}
          >
            <span style={{ color: SUN_GLOW }}>●</span>{" "}
            <span style={{ color: ICE, opacity: 0.85 }}>OBSERVATORY · MANTLE SEPOLIA · 7 DESKS LIVE</span>
          </motion.p>

          {/* headline — whisper-light, wide-tracked, NOT bold */}
          <motion.h1
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.9, delay: T.headline, ease: [0.2, 0.8, 0.2, 1.05] }
            }
            className="font-display mt-5 text-balance"
            style={{
              color: ICE,
              fontWeight: 300,
              lineHeight: 1.02,
              letterSpacing: "0.01em",
              fontSize: "clamp(2.6rem, 6.4vw, 5.4rem)",
              textShadow: "0 0 40px rgba(10,10,10,0.6)",
            }}
          >
            <span style={{ opacity: 0.92 }}>THE </span>
            <span
              style={{
                background: `linear-gradient(95deg, ${SUN_CORE} 0%, ${SUN_GLOW} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontStyle: "italic",
              }}
            >
              ALL-SEEING
            </span>
            <br />
            <span style={{ opacity: 0.92 }}>QUANT</span>
          </motion.h1>

          {/* subhead */}
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.8, delay: T.headline + 0.15, ease: EASE_ORGANIC }
            }
            className="mt-6 max-w-xl text-balance"
            style={{ color: ICE, opacity: 0.62, fontSize: "clamp(1rem, 1.4vw, 1.15rem)", lineHeight: 1.6 }}
          >
            Autonomous multi-source intelligence on Mantle — it watches everything, and acts only
            when the data has earned it.
          </motion.p>

          {/* telemetry strip — machined mono readouts with hairline separators (NOT cards) */}
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: T.telemetry, ease: EASE_ORGANIC }}
            className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono"
            style={{ fontSize: "11px", letterSpacing: "0.16em", color: ICE }}
          >
            {TELEMETRY.map((stat, i) => (
              <span key={stat} className="flex items-center gap-x-5">
                {i > 0 && (
                  <span aria-hidden style={{ height: 11, width: 1, backgroundColor: COLD, opacity: 0.4 }} />
                )}
                <span style={{ opacity: 0.78 }}>{stat}</span>
              </span>
            ))}
          </motion.div>

          {/* actions — the ONE chartreuse moment + an ice-blue ghost link */}
          <motion.div
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { ...SPRING_OVERSHOOT, delay: T.cta }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#org"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                backgroundColor: CHARTREUSE,
                color: VOID,
                letterSpacing: "0.04em",
                boxShadow: `0 0 0 1px rgba(208,241,0,0.4), 0 14px 40px -12px rgba(208,241,0,0.5)`,
                outlineColor: CHARTREUSE,
              }}
            >
              ENTER THE OBSERVATORY
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
            <a
              href="#ledger"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ borderColor: `${ICE}55`, color: ICE, letterSpacing: "0.04em", outlineColor: ICE }}
            >
              View the ledger
            </a>
          </motion.div>
        </div>
      </div>

      {/* hide satellite labels on mobile — they collide with the headline at narrow widths */}
      <style>{`@media (max-width: 640px) { .ho-sat-label { opacity: 0 !important; } }`}</style>
    </section>
  );
}
