"use client";

/**
 * HeroEngine — HeliQuant's cinematic "Gear Engine" hero.
 *
 * A clustered mechanical engine: a central solar PM AGENT gear with seven desk gears
 * (REGIME · MACRO · CHAIN · RSRCH · FLOW · SOCIAL · OI[EDGE]) interlocking around it.
 * On mount the desks fly in from deep Z-space and SLAM into the cluster with an elastic
 * rebound; the centre absorbs each impact (squash → spring back). Once assembled, every
 * gear spins continuously (CSS keyframe — never re-renders React) and on hover a gear
 * leaps forward in 3D, tilts, brightens, and speeds up.
 *
 * Stack: Next 16 · React 19 · Tailwind v4 · motion/react. No GSAP, no images — pure SVG/CSS.
 * Reduced motion → gears freeze in their final clustered positions (fully static, legible).
 * Idle loops gate behind a mounted flag; any randomness is seeded (mulberry32) so SSR == CSR.
 *
 * Self-contained: every colour/curve is a local constant; only the REAL `DESKS` + `EDGE`
 * data and the font-family CSS vars are borrowed from the app.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DESKS, EDGE } from "@/lib/heliquant";

// ───────────────────────────── palette (local — mirrors the standard tokens, no global dep) ─────────────────────────────
const VOID = "#030408";
const MIDNIGHT = "#05060f";
const SOLAR_CORE = "#ffd06a";
const SOLAR_FLAME = "#fa520f";
const ICE_TEXT = "#d8ecf8";
const ICE_MUTED = "#81899b";
const ICE_GLOW = "#b6d9fc";
const CTA = "#d0f100";
const BULL = "#10b981";
const GLASS_BORDER = "rgba(186, 215, 247, 0.15)";

// ───────────────────────────── desk → terse gear label (the 7 real desks) ─────────────────────────────
const DESK_LABEL: Record<string, string> = {
  "Regime/Technical": "REGIME",
  "Macro (Allora)": "MACRO",
  "On-chain/Risk": "CHAIN",
  Research: "RSRCH",
  "Smart-Money Flow": "FLOW",
  "Smart-Social": "SOCIAL",
  "OI-Contrarian": "OI (EDGE)",
};
function labelFor(key: string): string {
  return DESK_LABEL[key] ?? key.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase();
}

// ───────────────────────────── gear cluster geometry (px offsets from the PM centre) ─────────────────────────────
// Hand-placed for tight interlock — asymmetric, never a ring. `reverse` alternates spin sense
// so neighbouring teeth read as meshing. OI carries the chartreuse glow (the validated edge).
type DeskGear = {
  size: number;
  x: number; // resting offset from centre (px)
  y: number;
  speed: number; // seconds per rotation
  reverse: boolean;
  accent: boolean; // true → chartreuse OI edge
};
const DESK_GEARS: DeskGear[] = [
  { size: 140, x: -25, y: -150, speed: 28, reverse: true, accent: false }, // REGIME — top
  { size: 120, x: 110, y: -110, speed: 22, reverse: false, accent: false }, // MACRO — upper right
  { size: 150, x: 160, y: 30, speed: 30, reverse: true, accent: false }, // CHAIN — right
  { size: 110, x: 90, y: 150, speed: 20, reverse: false, accent: false }, // RSRCH — lower right
  { size: 130, x: -50, y: 160, speed: 26, reverse: true, accent: false }, // FLOW — bottom
  { size: 140, x: -160, y: 50, speed: 28, reverse: false, accent: false }, // SOCIAL — left
  { size: 160, x: -140, y: -80, speed: 32, reverse: true, accent: true }, // OI (EDGE) — upper left, chartreuse
];

type PlacedGear = DeskGear & { key: string; label: string; blurb: string };
function placeGears(): PlacedGear[] {
  return DESKS.slice(0, DESK_GEARS.length).map((desk, i) => {
    const g = DESK_GEARS[i]!;
    return { ...g, key: desk.key, label: labelFor(desk.key), blurb: desk.blurb };
  });
}

const CENTER_SIZE = 220;
const CENTER_SPEED = 50; // PM agent turns slow + heavy

// ───────────────────────────── entrance choreography (motion reimplementation of the GSAP slam) ─────────────────────────────
// The centre rises from the void first; desks then machine-gun in from deep Z-space and overshoot
// into place. Each desk's landing pulses the centre (squash → elastic rebound) via the keyframe below.
const CENTER_RISE_DELAY = 0.15;
const DESK_BASE_DELAY = 0.9; // first desk lands ~here
const DESK_STAGGER = 0.16; // rapid cascade between desk landings

// spring that overshoots then settles — the "elastic rebound" slam
const SLAM_SPRING = { type: "spring" as const, stiffness: 170, damping: 12, mass: 0.9 };
const CENTER_SPRING = { type: "spring" as const, stiffness: 140, damping: 15, mass: 1 };

// when the cluster is fully assembled (last desk landed) → start continuous spin
const ASSEMBLE_MS = (DESK_BASE_DELAY + DESK_STAGGER * DESK_GEARS.length + 0.9) * 1000;

// ───────────────────────────── deterministic particle field (no hydration drift) ─────────────────────────────
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
type Particle = { left: number; top: number; size: number; opacity: number; dur: number; delay: number };
function buildParticles(seed: number, n: number): Particle[] {
  const rnd = mulberry32(seed);
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      left: rnd() * 100,
      top: rnd() * 100,
      size: rnd() * 2.4 + 1,
      opacity: rnd() * 0.3 + 0.08,
      dur: rnd() * 7 + 9,
      delay: rnd() * 9,
    });
  }
  return out;
}

// ───────────────────────────── telemetry strip ─────────────────────────────
const TELEMETRY: { label: string; value: string }[] = [
  { label: "REGIME OOS", value: "82.6%" },
  { label: "VALIDATED EDGE", value: `1 (${EDGE.asset})` }, // EDGE.asset = "MNT"
  { label: "DECISIONS", value: "ON-CHAIN" },
];

// ═══════════════════════════════════════════ the metallic gear glyph ═══════════════════════════════════════════
type GearProps = {
  size: number;
  color: string; // rim / spoke hue
  glow: string | null; // box-shadow colour, null = none
  label: string;
  speed: number;
  reverse: boolean;
  isCenter: boolean;
  spinning: boolean; // continuous rotation engaged (post-assembly)
  reduce: boolean; // reduced motion → no spin, no hover leap
};

function Gear({ size, color, glow, label, speed, reverse, isCenter, spinning, reduce }: GearProps) {
  const [hovered, setHovered] = useState(false);
  const gid = `hg-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  // 3D hover leap (disabled under reduced motion)
  const hover = hovered && !reduce;
  const spinClass = reduce || !spinning ? "gear-paused" : reverse ? "gear-spin-reverse" : "gear-spin";
  // speed up on hover (halve the rotation period) — matches Hero4
  const spinDuration = `${hover ? speed * 0.5 : speed}s`;

  const glowSpread = isCenter ? (hover ? 250 : 150) : hover ? 120 : 50;

  return (
    <div
      className="absolute flex items-center justify-center transition-transform duration-700 ease-out"
      style={{
        width: size,
        height: size,
        transform: hover
          ? "translateZ(80px) scale(1.18) rotateX(9deg)"
          : "translateZ(0px) scale(1) rotateX(0deg)",
        zIndex: hover ? 50 : isCenter ? 10 : 20,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* dynamic core glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full transition-all duration-700 ease-out"
        style={{
          boxShadow: glow ? `0 0 ${glowSpread}px ${glow}` : "none",
          opacity: isCenter ? (hover ? 0.9 : 0.7) : hover ? 0.8 : 0.3,
          transform: hover ? "scale(1.1)" : "scale(1)",
        }}
      />

      {/* the metallic SVG gear — continuous rotation lives here (CSS keyframe) */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute h-full w-full ${spinClass} ${
          hover ? "drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]" : "drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        }`}
        style={{ animationDuration: spinDuration }}
        aria-hidden
      >
        <defs>
          {/* heavy metal/glass dome */}
          <radialGradient id={gid} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a1c29" />
            <stop offset="50%" stopColor={MIDNIGHT} />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          {/* specular rim highlight */}
          <linearGradient id={`${gid}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="50%" stopColor={color} stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* solid body */}
        <circle cx="50" cy="50" r="41" fill={`url(#${gid})`} />

        <g fill="none">
          {/* inner bevel */}
          <circle cx="50" cy="50" r="39" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          {/* thick mechanical cogs (dashed outer ring) */}
          <circle cx="50" cy="50" r="45" stroke={`url(#${gid}-rim)`} strokeWidth="8" strokeDasharray="6 8" />
          {/* glowing structural rims */}
          <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="2" opacity={isCenter ? 1 : 0.7} />
          <circle cx="50" cy="50" r="37" stroke={color} strokeWidth="1" opacity="0.3" />

          {/* spokes — PM hub is multi-armed; desks are 3-spoke */}
          <g stroke={color} strokeWidth={isCenter ? 5 : 4} opacity={isCenter ? 0.9 : 0.6}>
            {isCenter ? (
              <>
                <path d="M 50 18 L 50 40" />
                <path d="M 50 60 L 50 82" />
                <path d="M 18 50 L 40 50" />
                <path d="M 60 50 L 82 50" />
                <path d="M 27 27 L 43 43" />
                <path d="M 73 73 L 57 57" />
                <path d="M 27 73 L 43 57" />
                <path d="M 73 27 L 57 43" />
              </>
            ) : (
              <>
                <path d="M 50 50 L 50 16" />
                <path d="M 50 50 L 21 67" />
                <path d="M 50 50 L 79 67" />
              </>
            )}
          </g>

          {/* reactor hub */}
          <circle cx="50" cy="50" r="22" stroke="rgba(0,0,0,0.8)" strokeWidth="3" fill={VOID} />
          <circle cx="50" cy="50" r="14" stroke={color} strokeWidth="2" opacity="0.8" />

          {/* glowing axis */}
          <circle cx="50" cy="50" r="6" fill={color} fillOpacity={isCenter ? 1 : 0.5} />
          <circle cx="50" cy="50" r="3" fill="#fff" fillOpacity={isCenter ? 0.8 : 0.2} />
        </g>
      </svg>

      {/* HUD label — floats off the gear, lifts + brightens on hover */}
      <div
        className={`absolute select-none rounded-full border px-3 py-1.5 font-mono font-bold backdrop-blur-md transition-all duration-700 ${
          hover ? "z-50 -translate-y-12 scale-110 text-[12px]" : "z-30 text-[10px] md:text-[11px]"
        }`}
        style={{
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          letterSpacing: "0.2em",
          color: isCenter || hover ? "#fff" : color,
          backgroundColor: hover ? "rgba(5,6,15,0.9)" : "rgba(5,6,15,0.6)",
          borderColor: hover ? glow ?? color : GLASS_BORDER,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════ the hero ═══════════════════════════════════════════
export default function HeroEngine() {
  const reduce = useReducedMotion() ?? false;
  const gears = useMemo(() => placeGears(), []);
  const particles = useMemo(() => buildParticles(0x4e1105, 34), []);

  // gate idle loops + post-assembly spin until after first paint (SSR markup parity)
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  useEffect(() => setMounted(true), []);

  // engage continuous rotation once the slam sequence has resolved (or immediately if reduced)
  useEffect(() => {
    if (reduce) {
      setSpinning(false);
      return;
    }
    const t = window.setTimeout(() => setSpinning(true), ASSEMBLE_MS);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const live = mounted && !reduce;

  // centre impact pulse — squash inward as each desk lands, then spring back. Keyframed once,
  // timed across the desk cascade. Under reduced motion the centre is simply static.
  const impactTimes = useMemo(() => {
    const pts: number[] = [0];
    const span = DESK_BASE_DELAY + DESK_STAGGER * (gears.length - 1) + 0.3;
    for (let i = 0; i < gears.length; i++) {
      const t = (DESK_BASE_DELAY + i * DESK_STAGGER) / span;
      pts.push(Math.min(0.985, t), Math.min(0.99, t + 0.05));
    }
    pts.push(1);
    return pts;
  }, [gears.length]);
  const impactScale = useMemo(() => {
    const vals: number[] = [1];
    for (let i = 0; i < gears.length; i++) vals.push(0.965, 1.035);
    vals.push(1);
    return vals;
  }, [gears.length]);
  const impactDuration = (DESK_BASE_DELAY + DESK_STAGGER * (gears.length - 1) + 0.6);

  return (
    <section
      id="top"
      className="relative isolate flex min-h-screen w-full items-center overflow-hidden px-6 pb-12 pt-28 md:px-12 md:pt-32"
      style={{ backgroundColor: MIDNIGHT, color: ICE_TEXT }}
      aria-label="HeliQuant — the all-seeing quant"
    >
      {/* ░░░ atmosphere: blueprint grid · solar core glow · seeded particle field ░░░ */}
      <div aria-hidden className="bg-blueprint pointer-events-none absolute inset-0 z-0 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "rgba(255,208,106,0.05)", filter: "blur(120px)" }}
      />
      {/* a faint warm bias toward the engine side (right), like Helios off-frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 46%, rgba(250,82,15,0.07) 0%, rgba(161,19,26,0.03) 34%, transparent 64%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.span
            key={`pt-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              backgroundColor: "#ffffff",
              boxShadow: "0 0 10px 2px rgba(255,255,255,0.2)",
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={live ? { opacity: [0, p.opacity, 0], y: [0, -26, 0] } : { opacity: reduce ? p.opacity : 0 }}
            transition={
              live
                ? { duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }
                : { duration: 1 }
            }
          />
        ))}
      </div>

      {/* ░░░ content: copy (left) + gear engine (right) ░░░ */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row">
        {/* ───────── LEFT — copy ───────── */}
        <div className="z-20 flex max-w-xl flex-1 flex-col items-start pb-4 text-left lg:pb-0">
          {/* eyebrow badge */}
          <motion.div
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="mb-8 flex flex-wrap items-center gap-4 rounded-full border px-5 py-2 font-mono uppercase backdrop-blur-md"
            style={{
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: SOLAR_CORE,
              backgroundColor: "rgba(5,6,15,0.8)",
              borderColor: "rgba(186,215,247,0.08)",
              boxShadow: "rgba(186,215,247,0.12) 0px 0px 0px 1px inset",
            }}
          >
            <span className="flex items-center gap-2">
              <motion.span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: BULL }}
                animate={live ? { opacity: [1, 0.4, 1] } : undefined}
                transition={live ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
              />
              Systems Online
            </span>
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "rgba(186,215,247,0.3)" }} />
            <span>Mantle Sepolia</span>
          </motion.div>

          {/* headline */}
          <motion.h1
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.25, ease: [0.2, 0.8, 0.2, 1.05] }}
            className="font-display mb-8 text-balance"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
              color: "#ffffff",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
              textShadow: "0 2px 40px rgba(0,0,0,0.6)",
            }}
          >
            The{" "}
            <i className="text-solar-gradient" style={{ fontStyle: "italic" }}>
              all-seeing
            </i>{" "}
            quant.
          </motion.h1>

          {/* subhead */}
          <motion.p
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="mb-12 max-w-xl"
            style={{
              fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
              color: ICE_TEXT,
              opacity: 0.78,
              fontWeight: 300,
              fontSize: "clamp(1rem, 1.4vw, 1.125rem)",
              lineHeight: 1.65,
            }}
          >
            Autonomous multi-source intelligence trading firm on Mantle. Seven AI desks debate, a PM
            decides &mdash; every call is gated, sized by validated edge, and anchored on-chain.
          </motion.p>

          {/* CTAs — the ONE chartreuse moment + an ice-blue ghost link */}
          <motion.div
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0 } : { ...SLAM_SPRING, delay: 0.6 }}
            className="flex flex-wrap items-center gap-6"
          >
            <a
              href="#org"
              className="group relative inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-sm font-semibold uppercase transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                backgroundColor: CTA,
                color: "#000000",
                letterSpacing: "0.12em",
                boxShadow: "rgba(208,241,0,0.4) 0px 0px 12px 0px, rgba(255,255,255,0.4) 0px 1px 1px 0px inset",
                outlineColor: CTA,
              }}
            >
              Enter the Observatory
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              >
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </a>
            <a
              href="#ledger"
              className="border-b pb-0.5 font-mono uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                fontFamily: "var(--font-mono, ui-monospace, monospace)",
                fontSize: "11px",
                letterSpacing: "0.16em",
                color: ICE_MUTED,
                borderColor: "rgba(186,215,247,0.15)",
                outlineColor: ICE_GLOW,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = ICE_MUTED;
                e.currentTarget.style.borderColor = "rgba(186,215,247,0.15)";
              }}
            >
              View the ledger
            </a>
          </motion.div>

          {/* telemetry strip */}
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.85, ease: [0.4, 0, 0.2, 1] }}
            className="mt-16 flex flex-wrap gap-8 border-t pt-8"
            style={{ borderColor: "rgba(186,215,247,0.08)" }}
          >
            {TELEMETRY.map((stat) => (
              <div key={stat.label} className="flex flex-col items-start gap-2">
                <span
                  className="font-mono"
                  style={{
                    fontFamily: "var(--font-mono, ui-monospace, monospace)",
                    fontSize: "10px",
                    letterSpacing: "0.2em",
                    color: ICE_MUTED,
                  }}
                >
                  {stat.label}
                </span>
                <span
                  className="font-mono font-medium"
                  style={{
                    fontFamily: "var(--font-mono, ui-monospace, monospace)",
                    fontSize: "14px",
                    color: "#ffffff",
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ───────── RIGHT — the clustered gear engine (3D perspective stage) ───────── */}
        <div
          className="relative mt-12 flex h-[500px] w-full flex-1 items-center justify-center lg:mt-0 lg:h-[600px]"
          style={{ perspective: "1000px" }}
        >
          {/* the cluster origin is the PM gear; nudge it so the asymmetric constellation
              (OI upper-left ↔ CHAIN right) reads optically centred within the stage */}
          <div
            className="relative flex items-center justify-center"
            style={{ transformStyle: "preserve-3d", transform: "translate(10px, 18px)" }}
          >
            {/* CENTER — PM AGENT (rises from the void, then absorbs each landing) */}
            <motion.div
              className="absolute flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
              initial={reduce ? { opacity: 1, scale: 1, rotateZ: 0, z: 0 } : { opacity: 0, scale: 0.2, rotateZ: -90, z: -500 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0, z: 0 }}
              transition={reduce ? { duration: 0 } : { ...CENTER_SPRING, delay: CENTER_RISE_DELAY }}
            >
              {/* impact-squash wrapper — keyframed pulses as desks slam home */}
              <motion.div
                className="flex items-center justify-center"
                animate={live ? { scale: impactScale } : undefined}
                transition={
                  live
                    ? {
                        duration: impactDuration,
                        times: impactTimes,
                        ease: "easeOut",
                        delay: CENTER_RISE_DELAY + 0.2,
                      }
                    : undefined
                }
              >
                <Gear
                  size={CENTER_SIZE}
                  color={SOLAR_CORE}
                  glow="rgba(250, 82, 15, 0.4)"
                  label="PM AGENT"
                  speed={CENTER_SPEED}
                  reverse={false}
                  isCenter
                  spinning={spinning}
                  reduce={reduce}
                />
              </motion.div>
            </motion.div>

            {/* the 7 desk gears — fly in from deep Z-space and SLAM into the cluster */}
            {gears.map((g, i) => {
              // start far out along the resting vector (×5) + deep Z, scaled to a speck, pre-spun
              const startX = g.x * 5;
              const startY = g.y * 5;
              return (
                <motion.div
                  key={g.key}
                  className="absolute flex items-center justify-center"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={
                    reduce
                      ? { x: g.x, y: g.y, z: 0, opacity: 1, scale: 1, rotateZ: 0 }
                      : { x: startX, y: startY, z: -1000, opacity: 0, scale: 0.1, rotateZ: 720 }
                  }
                  animate={{ x: g.x, y: g.y, z: 0, opacity: 1, scale: 1, rotateZ: 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { ...SLAM_SPRING, delay: DESK_BASE_DELAY + i * DESK_STAGGER }
                  }
                >
                  <Gear
                    size={g.size}
                    color={g.accent ? CTA : ICE_GLOW}
                    glow={g.accent ? "rgba(208, 241, 0, 0.5)" : null}
                    label={g.label}
                    speed={g.speed}
                    reverse={g.reverse}
                    isCenter={false}
                    spinning={spinning}
                    reduce={reduce}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* legibility scrim on mobile — engine stacks under copy at narrow widths */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-1/3 lg:hidden"
        style={{ background: `linear-gradient(to top, ${MIDNIGHT} 0%, rgba(5,6,15,0.6) 40%, transparent 100%)` }}
      />
    </section>
  );
}
