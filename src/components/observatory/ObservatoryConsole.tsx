"use client";

/**
 * ObservatoryConsole — the living "FIRM CONSOLE" centerpiece for HeliQuant.
 *
 * A dark glass instrument panel that cycles HeliQuant's REAL 4-stage decision loop as
 * physical-metaphor mini-dioramas — narrated by motion, not text:
 *   0 SCAN       seven desks read the market field (a scanner beam sweeps, nodes light up)
 *   1 DELIBERATE bull ⇄ bear energies push inward to a contested core (converging arcs)
 *   2 DECIDE     the core hits an R:R≥2 gate → here it RESTRAINS: exhales to amber, "HOLD"
 *   3 SEAL       the verdict crystallises onto a Mantle block; the real tx hash types out
 *
 * Every number is real (from @/lib/heliquant): the 7 DESKS, the MNT EDGE (pWin .588 /
 * payoff 1.3 / +28.9% OOS), and FIRST_ANCHOR (the recorded ABSTAIN, block 39402623).
 *
 * Self-contained: all colour / easing constants are LOCAL; only fonts (--font-mono) and
 * REAL data are borrowed. Loops are gated behind a mounted flag (no hydration drift) and
 * frozen to a sensible final state under prefers-reduced-motion.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { DESKS, EDGE, FIRST_ANCHOR, MANTLESCAN } from "@/lib/heliquant";

// ───────────────────────────── the LAW: local palette (no global-token dependency) ─────────────────────────────
const VOID = "#05060f"; // warm near-black — NEVER pure #000
const PANEL = "#0d0d0e"; // glass surface base
const SURFACE_1 = "#141416"; // raised inner surface
const HAIRLINE = "rgba(186, 215, 247, 0.08)"; // blue-tinted glass hairline (hero standard)
const ICE = "#d8ecf8"; // atmospheric / ghost text
const MUTE = "#81899b"; // dim instrument label
const MUTE_2 = "#4d535d"; // dimmer / future
const SOLAR = "#ffd06a"; // warm core / energy
const FLAME = "#fa520f"; // solar flame
const AMBER = "#ffd600"; // ABSTAIN verdict (restraint)
const EMERALD = "#72ce7b"; // ENTER / bull energy
const CRIMSON = "#ff6467"; // risk / bear energy
const CHARTREUSE = "#d0f100"; // RATIONED — ENTER bloom + seal ring ONLY
const IRID_A = "#bbdef2"; // seal shimmer cool
const IRID_B = "#d1aad7"; // seal shimmer warm

// ───────────────────────────── motion physics (authored) ─────────────────────────────
const POP = [0.175, 0.885, 0.32, 1.275] as const; // elastic pop (benchmark)
const SWEEP = [0.4, 0, 0.2, 1] as const; // sweep / slide
const DAMPED = [0.16, 1, 0.3, 1] as const; // settling / exhale (no overshoot — restraint)
const SPRING_POP = { type: "spring" as const, stiffness: 220, damping: 16 };

const SCENE_MS = 4500;
const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";

// ───────────────────────────── scene metadata (stepper) ─────────────────────────────
type SceneId = 0 | 1 | 2 | 3;
const SCENES: { id: SceneId; key: string; title: string; sub: string }[] = [
  { id: 0, key: "SCAN", title: "READING FEEDS", sub: "7 DESKS · INGEST" },
  { id: 1, key: "DELIBERATE", title: "BULL ⇄ BEAR", sub: "BULL VS BEAR" },
  { id: 2, key: "DECIDE", title: "GATING", sub: "R:R ≥ 2" },
  { id: 3, key: "SEAL", title: "SEALING ON MANTLE", sub: "ANCHOR TX" },
];

// ───────────────────────────── desk → terse mono label (real DESKS) ─────────────────────────────
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
const DESK_LABELS: string[] = DESKS.map((d) => abbr(d.key));

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

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// SCENE 0 — SCAN · "READING FEEDS"
// A faint market field (candles + ticks). A scanner beam sweeps across it; the 7 desk nodes
// light up one-by-one as they "read". If text vanished: a sensor reading a field of data.
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
type Candle = { x: number; bodyY: number; bodyH: number; wickY: number; wickH: number; up: boolean };

function buildCandles(seed: number, n: number): Candle[] {
  const rnd = mulberry32(seed);
  const out: Candle[] = [];
  let price = 50;
  const step = 100 / (n + 1);
  for (let i = 0; i < n; i++) {
    const drift = (rnd() - 0.46) * 16;
    const next = Math.max(20, Math.min(80, price + drift));
    const up = next >= price;
    const top = Math.min(price, next);
    const h = Math.max(3, Math.abs(next - price));
    const wickPad = 3 + rnd() * 7;
    out.push({
      x: step * (i + 1),
      bodyY: top,
      bodyH: h,
      wickY: top - wickPad,
      wickH: h + wickPad * 2,
      up,
    });
    price = next;
  }
  return out;
}

function SceneScan({ live, reduce }: { live: boolean; reduce: boolean }) {
  const candles = useMemo(() => buildCandles(0x5ca4, 14), []);
  // 7 desk nodes laid along a gentle arc beneath the field — uneven, instrument-like
  const nodes = useMemo(() => {
    const rnd = mulberry32(0xde54);
    return DESK_LABELS.map((label, i) => {
      const t = DESK_LABELS.length > 1 ? i / (DESK_LABELS.length - 1) : 0;
      const x = 8 + t * 84;
      const y = 70 + Math.sin(t * Math.PI) * -7 + (rnd() - 0.5) * 4;
      return { label, x, y, lit: t }; // lit = sweep-position threshold
    });
  }, []);

  return (
    <div className="absolute inset-0">
      {/* header chip */}
      <SceneHeader left="DESKS · READING FEEDS" right="SCAN" accent={ICE} live={live} />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        {/* baseline grid hairlines */}
        {[28, 46, 64].map((y) => (
          <line key={y} x1="4" x2="96" y1={y} y2={y} stroke={ICE} strokeWidth="0.12" opacity={0.05} />
        ))}

        {/* faint market field — candles fade in low, the "data" being read */}
        <g>
          {candles.map((c, i) => (
            <motion.g
              key={`c-${i}`}
              initial={reduce ? { opacity: 0.32 } : { opacity: 0 }}
              animate={{ opacity: 0.32 }}
              transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.1 + i * 0.03, ease: SWEEP }}
            >
              <line
                x1={c.x}
                x2={c.x}
                y1={c.wickY}
                y2={c.wickY + c.wickH}
                stroke={c.up ? EMERALD : CRIMSON}
                strokeWidth="0.35"
                opacity={0.55}
              />
              <rect
                x={c.x - 1.6}
                y={c.bodyY}
                width={3.2}
                height={c.bodyH}
                rx={0.5}
                fill={c.up ? EMERALD : CRIMSON}
                opacity={0.7}
              />
            </motion.g>
          ))}
        </g>

        {/* scanner beam — vertical bar sweeping left→right, looping */}
        {live ? (
          <motion.g
            initial={{ x: -46, opacity: 0 }}
            animate={{ x: [-46, 46], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: SWEEP, times: [0, 0.14, 0.86, 1] }}
          >
            <rect x="50" y="6" width="0.5" height="80" fill={SOLAR} opacity={0.9} />
            <rect x="46" y="6" width="8" height="80" fill="url(#sc-beam)" opacity={0.6} />
          </motion.g>
        ) : (
          // reduced motion: park the beam mid-field, statically lit
          <g>
            <rect x="50" y="6" width="0.5" height="80" fill={SOLAR} opacity={0.6} />
            <rect x="46" y="6" width="8" height="80" fill="url(#sc-beam)" opacity={0.4} />
          </g>
        )}

        {/* the 7 desk nodes — light up one-by-one (staggered) as the field is read */}
        <g>
          {nodes.map((n, i) => (
            <g key={`n-${i}`}>
              {/* connector tick up to field */}
              <line x1={n.x} x2={n.x} y1={n.y - 4.5} y2={n.y - 1.6} stroke={MUTE} strokeWidth="0.18" opacity={0.4} />
              {/* halo (pulses once it's lit) */}
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={3.4}
                fill={SOLAR}
                initial={reduce ? { opacity: 0.12 } : { opacity: 0 }}
                animate={
                  live
                    ? { opacity: [0, 0.18, 0.07, 0.14] }
                    : { opacity: reduce ? 0.12 : 0 }
                }
                transition={
                  live
                    ? { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 + i * 0.22 }
                    : { duration: 0.4 }
                }
              />
              {/* node ring */}
              <circle cx={n.x} cy={n.y} r={1.7} fill={PANEL} stroke={MUTE} strokeWidth="0.2" opacity={0.8} />
              {/* core dot — flips warm when "read" */}
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={0.9}
                initial={reduce ? { fill: SOLAR } : { fill: MUTE_2 }}
                animate={
                  live
                    ? { fill: [MUTE_2, SOLAR, SOLAR], scale: [1, 1.5, 1] }
                    : { fill: reduce ? SOLAR : MUTE_2 }
                }
                transition={
                  live
                    ? { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 + i * 0.22, times: [0, 0.12, 1] }
                    : { duration: 0.3 }
                }
              />
              <text
                x={n.x}
                y={n.y + 5.4}
                textAnchor="middle"
                fill={MUTE}
                style={{ fontFamily: MONO, fontSize: "2.4px", letterSpacing: "0.06em" }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// SCENE 1 — DELIBERATE · "BULL ⇄ BEAR"
// Two opposing energies (bull up-left emerald, bear down-right crimson) push toward a
// central contested core; signal arcs converge inward. A small "rounds" counter ticks.
// If text vanished: two forces debating into a single point.
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
const CORE = { x: 50, y: 50 };
type Feed = { x: number; y: number; side: "bull" | "bear" };
function buildFeeds(): Feed[] {
  // 7 inbound feeds (one per desk) — fanned across the two camps, uneven
  const bull: [number, number][] = [
    [12, 22],
    [9, 44],
    [20, 66],
    [16, 14],
  ];
  const bear: [number, number][] = [
    [88, 30],
    [91, 56],
    [82, 74],
  ];
  return [
    ...bull.map(([x, y]) => ({ x, y, side: "bull" as const })),
    ...bear.map(([x, y]) => ({ x, y, side: "bear" as const })),
  ];
}
function feedPath(f: Feed): string {
  const mx = (f.x + CORE.x) / 2;
  const my = (f.y + CORE.y) / 2;
  const bow = f.side === "bull" ? -8 : 8; // opposite bows → visual tension
  return `M ${f.x} ${f.y} Q ${mx + bow * 0.4} ${my - 6} ${CORE.x} ${CORE.y}`;
}

function SceneDeliberate({ live, reduce }: { live: boolean; reduce: boolean }) {
  const feeds = useMemo(() => buildFeeds(), []);
  const [rounds, setRounds] = useState(reduce ? 3 : 1);
  useEffect(() => {
    if (!live) return;
    let r = 1;
    const id = setInterval(() => {
      r = r >= 3 ? 1 : r + 1;
      setRounds(r);
    }, 900);
    return () => clearInterval(id);
  }, [live]);

  return (
    <div className="absolute inset-0">
      <SceneHeader left="PM · BULL ⇄ BEAR" right="DELIBERATE" accent={SOLAR} live={live} />

      {/* opposing-energy field wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(60% 80% at 12% 50%, rgba(114,206,123,0.10), transparent 60%), radial-gradient(60% 80% at 88% 50%, rgba(255,100,103,0.10), transparent 60%)`,
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        {/* converging arcs */}
        <g>
          {feeds.map((f, i) => {
            const d = feedPath(f);
            const color = f.side === "bull" ? EMERALD : CRIMSON;
            return (
              <g key={`f-${i}`}>
                <motion.path
                  d={d}
                  stroke={color}
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  opacity={0.3}
                  initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 0.1 + i * 0.07, ease: SWEEP }}
                />
                {/* signal pulse travelling inward toward the core */}
                {live ? (
                  <motion.circle
                    r="0.85"
                    fill={color}
                    initial={{ offsetDistance: "0%", opacity: 0 }}
                    animate={{ offsetDistance: "100%", opacity: [0, 0.9, 0.9, 0] }}
                    transition={{
                      duration: 1.5 + (i % 3) * 0.25,
                      repeat: Infinity,
                      ease: "easeIn",
                      delay: 0.3 + i * 0.18,
                      times: [0, 0.12, 0.8, 1],
                    }}
                    style={{ offsetPath: `path("${d}")` } as React.CSSProperties}
                  />
                ) : null}
                {/* origin node */}
                <circle cx={f.x} cy={f.y} r="1.3" fill={PANEL} stroke={color} strokeWidth="0.25" opacity={0.85} />
                <circle cx={f.x} cy={f.y} r="0.55" fill={color} opacity={0.85} />
              </g>
            );
          })}
        </g>

        {/* BULL glyph (up arrow) top-left + BEAR glyph (down arrow) bottom-right */}
        <motion.path
          d="M 8 12 l 3 -3 l 3 3"
          stroke={EMERALD}
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={live ? { y: [0, -1.4, 0], opacity: [0.7, 1, 0.7] } : { opacity: 0.8 }}
          transition={live ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
        <motion.path
          d="M 86 88 l 3 3 l 3 -3"
          stroke={CRIMSON}
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={live ? { y: [0, 1.4, 0], opacity: [0.7, 1, 0.7] } : { opacity: 0.8 }}
          transition={live ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 } : { duration: 0.3 }}
        />

        {/* contested core — pressured, jitters between the two energies */}
        <motion.g
          animate={live ? { x: [0, 0.8, -0.6, 0], y: [0, -0.5, 0.6, 0] } : undefined}
          transition={live ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <motion.circle
            cx={CORE.x}
            cy={CORE.y}
            r="5.2"
            fill="none"
            stroke={SOLAR}
            strokeWidth="0.3"
            opacity={0.3}
            animate={live ? { scale: [1, 1.18, 1], opacity: [0.18, 0.4, 0.18] } : { opacity: 0.3 }}
            transition={live ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined}
            style={{ transformOrigin: `${CORE.x}px ${CORE.y}px` }}
          />
          <circle cx={CORE.x} cy={CORE.y} r="3.1" fill="url(#sc-core)" opacity={0.95} />
          <circle cx={CORE.x} cy={CORE.y} r="1.2" fill="#fff2d6" opacity={0.95} />
        </motion.g>
      </svg>

      {/* rounds counter — instrument readout */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono"
        style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.2em", color: MUTE }}
      >
        ROUND <span style={{ color: SOLAR }}>{rounds}</span>
        <span style={{ opacity: 0.5 }}> / 3</span>
      </div>
    </div>
  );
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// SCENE 2 — DECIDE · "GATING · R:R ≥ 2"
// The core gathers the converged energy and hits a GATE. Recorded outcome = ABSTAIN (MNT,
// no validated edge here) → energy EXHALES, dims to AMBER, "HOLD" settles (damped, no bloom).
// The ENTER branch (chartreuse bloom + towering number) is built but OFF by default.
// If text vanished: a charge meets a barrier and is held back, calmly.
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
function SceneDecide({ live, reduce, enter }: { live: boolean; reduce: boolean; enter: boolean }) {
  const verdict = enter ? "ENTER" : "HOLD";
  const verdictColor = enter ? EMERALD : AMBER;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <SceneHeader left="GATE · R:R ≥ 2" right="DECIDE" accent={verdictColor} live={live} />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        {/* the GATE — a slim barrier the energy must clear */}
        <g>
          <line x1="50" x2="50" y1="14" y2="40" stroke={MUTE} strokeWidth="0.4" opacity={0.5} />
          <line x1="50" x2="50" y1="60" y2="86" stroke={MUTE} strokeWidth="0.4" opacity={0.5} />
          {/* gate threshold ticks */}
          {[16, 22, 28, 34].map((y) => (
            <line key={`gt-${y}`} x1="47" x2="53" y1={y} y2={y} stroke={MUTE_2} strokeWidth="0.18" opacity={0.5} />
          ))}
          {[66, 72, 78, 84].map((y) => (
            <line key={`gb-${y}`} x1="47" x2="53" y1={y} y2={y} stroke={MUTE_2} strokeWidth="0.18" opacity={0.5} />
          ))}
        </g>

        {/* charge ring — gathers, then on ABSTAIN exhales (expands + dims to amber) */}
        <motion.circle
          cx="50"
          cy="50"
          r="9"
          fill="none"
          stroke={verdictColor}
          strokeWidth="0.5"
          initial={reduce ? { scale: 1.25, opacity: 0.18 } : { scale: 0.6, opacity: 0 }}
          animate={
            live
              ? enter
                ? { scale: [0.6, 1, 1.18, 1.05], opacity: [0, 0.7, 0.5, 0.6] }
                : { scale: [0.6, 1, 1.4], opacity: [0, 0.65, 0.12] } // exhale → dissipate
              : { scale: reduce ? 1.25 : 0.6, opacity: reduce ? 0.18 : 0 }
          }
          transition={
            live
              ? { duration: 2.4, ease: enter ? POP : DAMPED, times: enter ? [0, 0.4, 0.7, 1] : [0, 0.45, 1] }
              : { duration: 0.4 }
          }
          style={{ transformOrigin: "50px 50px" }}
        />

        {/* core that hit the gate */}
        <motion.g
          initial={reduce ? { scale: 1 } : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: DAMPED }}
        >
          <circle cx="50" cy="50" r="4" fill="url(#sc-core)" opacity={0.9} />
          {/* on ENTER a chartreuse bloom; on ABSTAIN it stays warm→amber, NO chartreuse */}
          <motion.circle
            cx="50"
            cy="50"
            r="4"
            fill="none"
            stroke={enter ? CHARTREUSE : "transparent"}
            strokeWidth={enter ? 0.6 : 0}
            animate={
              live && enter ? { scale: [1, 2.2], opacity: [0.9, 0] } : { opacity: 0 }
            }
            transition={live && enter ? { duration: 1.1, repeat: Infinity, ease: "easeOut" } : { duration: 0 }}
            style={{ transformOrigin: "50px 50px" }}
          />
        </motion.g>
      </svg>

      {/* verdict word — settles damped (ABSTAIN: calm, no bloom). ENTER: a towering mono number. */}
      <div className="relative z-10 flex flex-col items-center" style={{ marginTop: "16%" }}>
        <motion.div
          initial={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.9, delay: 0.7, ease: enter ? POP : DAMPED }
          }
          className="font-mono"
          style={{
            fontFamily: MONO,
            fontSize: "clamp(2rem, 7vw, 3.4rem)",
            fontWeight: 300,
            letterSpacing: "0.18em",
            color: verdictColor,
            textShadow: enter ? `0 0 28px ${EMERALD}66` : "none", // restraint: NO glow on HOLD
            lineHeight: 1,
          }}
        >
          {verdict}
        </motion.div>
        <motion.div
          initial={reduce ? { opacity: 0.8 } : { opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, delay: 1.0, ease: SWEEP }}
          className="mt-2 flex items-center gap-2 font-mono"
          style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.22em", color: MUTE }}
        >
          <span>{EDGE.asset}</span>
          <span style={{ color: MUTE_2 }}>|</span>
          {/* honest framing: ABSTAIN because no validated edge applies on this read */}
          <span>{enter ? `R:R ${EDGE.payoff.toFixed(2)} · p ${EDGE.pWin}` : "NO VALIDATED EDGE"}</span>
        </motion.div>
      </div>
    </div>
  );
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// SCENE 3 — SEAL · "SEALING ON MANTLE"
// The decision crystallises: a seal/stamp presses onto a chain block; the REAL tx hash types
// out in wide-tracked mono, block number appears, an iridescent shimmer washes + a chartreuse
// ring-pulse completes. A subtle link feel toward Mantlescan.
// If text vanished: a stamp pressing a record onto a block, sealed.
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
function truncHash(h: string): string {
  return `${h.slice(0, 8)}…${h.slice(-6)}`;
}

function SceneSeal({ live, reduce }: { live: boolean; reduce: boolean }) {
  const full = truncHash(FIRST_ANCHOR.txHash);
  // count of chars revealed when live (typewriter); when not live we render the full string directly
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (!live) return; // static / reduced-motion: `shown` below falls back to the full string
    // `typed` starts at 0 (this scene is freshly keyed each cycle) → just advance via the functional updater
    const id = setInterval(() => {
      setTyped((i) => {
        if (i + 1 >= full.length) clearInterval(id);
        return i + 1;
      });
    }, 70);
    return () => clearInterval(id);
  }, [live, full.length]);
  const shown = live ? typed : full.length;

  const block = FIRST_ANCHOR.block.toLocaleString("en-US");

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <SceneHeader left="LEDGER · SEALING ON MANTLE" right="SEAL" accent={IRID_A} live={live} />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        {/* the chain block — a faceted slab */}
        <g transform="translate(50 41)">
          <motion.g
            initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: DAMPED }}
            style={{ transformOrigin: "0px 0px" }}
          >
            <rect x="-15" y="-9" width="30" height="18" rx="1.4" fill={SURFACE_1} stroke={HAIRLINE} strokeWidth="0.3" />
            <rect x="-15" y="-9" width="30" height="18" rx="1.4" fill="url(#sc-irid)" opacity={0.0}>
              {/* iridescent wash animated via the overlay below instead */}
            </rect>
            {/* faceted inner edge highlight */}
            <line x1="-15" x2="15" y1="-5.5" y2="-5.5" stroke={ICE} strokeWidth="0.12" opacity={0.1} />
            {/* prev/next block stubs → chain feel */}
            <rect x="-22" y="-5" width="5" height="10" rx="0.8" fill={SURFACE_1} stroke={HAIRLINE} strokeWidth="0.25" opacity={0.5} />
            <rect x="17" y="-5" width="5" height="10" rx="0.8" fill={SURFACE_1} stroke={HAIRLINE} strokeWidth="0.25" opacity={0.5} />
            <line x1="-17" x2="-15" y1="0" y2="0" stroke={MUTE_2} strokeWidth="0.3" opacity={0.6} />
            <line x1="15" x2="17" y1="0" y2="0" stroke={MUTE_2} strokeWidth="0.3" opacity={0.6} />
          </motion.g>

          {/* iridescent shimmer sweeping the block face */}
          {live ? (
            <motion.rect
              x="-15"
              y="-9"
              width="30"
              height="18"
              rx="1.4"
              fill="url(#sc-irid)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0.25, 0.4] }}
              transition={{ duration: 2.2, ease: SWEEP, delay: 0.6, repeat: Infinity, repeatType: "mirror" }}
            />
          ) : (
            <rect x="-15" y="-9" width="30" height="18" rx="1.4" fill="url(#sc-irid)" opacity={0.3} />
          )}

          {/* the SEAL / stamp pressing down onto the block face */}
          <motion.g
            initial={reduce ? { y: 0, scale: 1, opacity: 1 } : { y: -16, scale: 1.4, opacity: 0 }}
            animate={reduce ? { y: 0, scale: 1, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.55, delay: 0.35, ease: POP }}
            style={{ transformOrigin: "0px 0px" }}
          >
            <circle cx="0" cy="0" r="5.2" fill="none" stroke={CHARTREUSE} strokeWidth="0.5" opacity={0.85} />
            <circle cx="0" cy="0" r="3.4" fill="none" stroke={CHARTREUSE} strokeWidth="0.3" opacity={0.6} />
            {/* checkmark — the sealed/verified mark */}
            <motion.path
              d="M -1.8 0 l 1.3 1.5 l 2.6 -3"
              fill="none"
              stroke={CHARTREUSE}
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.4, delay: 0.85, ease: SWEEP }}
            />
          </motion.g>

          {/* chartreuse ring-pulse completing the seal */}
          {live ? (
            <motion.circle
              cx="0"
              cy="0"
              r="5.2"
              fill="none"
              stroke={CHARTREUSE}
              strokeWidth="0.5"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 0.9, repeat: Infinity, repeatDelay: 0.8 }}
              style={{ transformOrigin: "0px 0px" }}
            />
          ) : null}
        </g>
      </svg>

      {/* tx readout — wide-tracked mono, types out; block + Mantlescan link-feel */}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1.5">
        <div
          className="font-mono"
          style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.22em", color: IRID_A }}
        >
          {full.slice(0, shown)}
          {live && shown < full.length ? (
            <span style={{ color: CHARTREUSE }}>_</span>
          ) : null}
        </div>
        <a
          href={`${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 font-mono transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.2em", color: MUTE, opacity: 0.85, outlineColor: IRID_A }}
        >
          <span>BLOCK {block}</span>
          <span style={{ color: MUTE_2 }}>|</span>
          <span style={{ color: AMBER }}>{FIRST_ANCHOR.decision}</span>
          <span style={{ color: MUTE_2 }}>|</span>
          <span className="inline-flex items-center gap-1 group-hover:text-[var(--irid)]" style={{ ["--irid" as string]: IRID_A }}>
            MANTLESCAN
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              {"↗"}
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}

// ───────────────────────────── shared scene header (mono chip) ─────────────────────────────
function SceneHeader({
  left,
  right,
  accent,
  live,
}: {
  left: string;
  right: string;
  accent: string;
  live: boolean;
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-4">
      <span
        className="font-mono"
        style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.22em", color: MUTE }}
      >
        {left}
      </span>
      <span
        className="flex items-center gap-1.5 font-mono"
        style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.22em", color: accent }}
      >
        <span className="relative flex h-1.5 w-1.5">
          {live ? (
            <span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: accent, opacity: 0.7, animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }}
            />
          ) : null}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        </span>
        {right}
      </span>
    </div>
  );
}

// ───────────────────────────── stepper footer ─────────────────────────────
function Stepper({ active, live }: { active: SceneId; live: boolean }) {
  return (
    <div
      className="relative flex items-center justify-between px-6 py-4"
      style={{ borderTop: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.015)" }}
    >
      {/* connecting rail */}
      <div
        aria-hidden
        className="absolute left-10 right-10 top-[26px] h-px"
        style={{ background: HAIRLINE }}
      />
      {SCENES.map((s) => {
        const isActive = s.id === active;
        const isPast = s.id < active;
        const color = isActive ? CHARTREUSE : isPast ? SOLAR : MUTE_2;
        return (
          <div key={s.id} className="relative z-10 flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-6 w-6 items-center justify-center">
              {/* active glow halo (rationed chartreuse) */}
              {isActive && live ? (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: CHARTREUSE }}
                  animate={{ opacity: [0.15, 0.32, 0.15], scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
              <motion.span
                className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? CHARTREUSE : isPast ? SOLAR : "transparent",
                  border: `1px solid ${isActive ? CHARTREUSE : isPast ? SOLAR : MUTE_2}`,
                  boxShadow: isActive ? `0 0 10px ${CHARTREUSE}88` : "none",
                }}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={SPRING_POP}
              >
                {isPast ? (
                  <svg viewBox="0 0 10 10" className="h-1.5 w-1.5" fill="none">
                    <path d="M1.5 5 l2 2 l5 -5.5" stroke={VOID} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </motion.span>
            </div>
            <span
              className="text-center font-mono"
              style={{
                fontFamily: MONO,
                fontSize: "8.5px",
                letterSpacing: "0.16em",
                color,
                opacity: isActive ? 1 : isPast ? 0.85 : 0.55,
                transition: "color 0.4s ease, opacity 0.4s ease",
              }}
            >
              {s.key}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────── reusable SVG defs (gradients shared by scenes) ─────────────────────────────
function ConsoleDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="sc-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={SOLAR} stopOpacity="0" />
          <stop offset="55%" stopColor={SOLAR} stopOpacity="0.35" />
          <stop offset="100%" stopColor={SOLAR} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sc-core" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#fff2d6" />
          <stop offset="40%" stopColor={SOLAR} />
          <stop offset="80%" stopColor={FLAME} />
          <stop offset="100%" stopColor={FLAME} stopOpacity="0.2" />
        </radialGradient>
        <linearGradient id="sc-irid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={IRID_A} stopOpacity="0.0" />
          <stop offset="40%" stopColor={IRID_A} stopOpacity="0.5" />
          <stop offset="60%" stopColor={IRID_B} stopOpacity="0.5" />
          <stop offset="100%" stopColor={IRID_B} stopOpacity="0.0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ───────────────────────────── component ─────────────────────────────
export default function ObservatoryConsole() {
  const reduce = useReducedMotion() ?? false;

  // gate loops until after first paint → SSR markup matches, no hydration drift.
  // defer the flip out of the synchronous effect body (avoids cascading-render lint + a clean post-paint engage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const live = mounted && !reduce;

  // scene cycle
  const [scene, setScene] = useState<SceneId>(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setScene((prev) => ((prev + 1) % SCENES.length) as SceneId);
    }, SCENE_MS);
    return () => clearInterval(id);
  }, [live]);

  // the RECORDED outcome is ABSTAIN → DECIDE defaults to the honest HOLD branch.
  // (The ENTER branch is fully built; flip this to preview it.)
  const enter = false;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <ConsoleDefs />

      {/* ░░░ ambient warm blurred blobs behind the panel (depth via glow, not shadow) ░░░ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-12 -top-10 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${FLAME} 0%, transparent 70%)`, filter: "blur(60px)", opacity: 0.18 }}
        animate={live ? { opacity: [0.12, 0.22, 0.12], scale: [1, 1.1, 1] } : undefined}
        transition={live ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-10 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${SOLAR} 0%, transparent 70%)`, filter: "blur(64px)", opacity: 0.12 }}
        animate={live ? { opacity: [0.08, 0.16, 0.08], scale: [1, 1.12, 1] } : undefined}
        transition={live ? { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 } : undefined}
      />

      {/* ░░░ THE PANEL — dark glass instrument, breathing idle ░░░ */}
      <motion.div
        className="relative z-10 overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(180deg, ${PANEL} 0%, ${VOID} 100%)`,
          border: `1px solid ${HAIRLINE}`,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 30px 80px -28px rgba(250,82,15,0.16), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        animate={
          live
            ? { opacity: 1, y: [0, -4, 0] }
            : { opacity: 1, y: 0 }
        }
        transition={
          live
            ? { opacity: { duration: 0.6 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }
            : reduce
              ? { duration: 0 }
              : { duration: 0.6, ease: DAMPED }
        }
      >
        {/* ── panel header: identity + LIVE ── */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-3">
            {/* tiny dot-core glyph — the firm's "eye" */}
            <div className="relative grid h-8 w-8 place-items-center rounded-lg" style={{ background: SURFACE_1, border: `1px solid ${HAIRLINE}` }}>
              <motion.span
                className="absolute h-4 w-4 rounded-full"
                style={{ background: `radial-gradient(circle, ${SOLAR} 0%, ${FLAME} 70%, transparent 100%)`, filter: "blur(1px)" }}
                animate={live ? { opacity: [0.7, 1, 0.7], scale: [1, 1.12, 1] } : undefined}
                transition={live ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
              />
              <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: "#fff2d6" }} />
            </div>
            <div className="leading-tight">
              <div
                className="font-mono"
                style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.18em", color: ICE }}
              >
                FIRM CONSOLE
              </div>
              <div
                className="font-mono"
                style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.24em", color: MUTE, marginTop: 2 }}
              >
                HELIQUANT · MANTLE SEPOLIA
              </div>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              {live ? (
                <span
                  className="absolute inline-flex h-full w-full rounded-full"
                  style={{ backgroundColor: EMERALD, opacity: 0.7, animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }}
                />
              ) : null}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: EMERALD }} />
            </span>
            <span className="font-mono" style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.22em", color: EMERALD }}>
              LIVE
            </span>
          </div>
        </div>

        {/* ── the stage: cross-fading scenes ── */}
        <div className="relative h-[300px] w-full overflow-hidden" style={{ background: `radial-gradient(120% 90% at 50% 40%, rgba(255,160,60,0.05), transparent 60%)` }}>
          {/* faint inner vignette + top inset highlight (glow-depth, not shadow) */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -40px 60px -40px rgba(0,0,0,0.6)" }} />

          <AnimatePresence mode="sync">
            <motion.div
              key={scene}
              className="absolute inset-0"
              initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, scale: 1.03 }}
              transition={reduce ? { duration: 0 } : { duration: 0.7, ease: SWEEP }}
            >
              {scene === 0 ? <SceneScan live={live} reduce={reduce} /> : null}
              {scene === 1 ? <SceneDeliberate live={live} reduce={reduce} /> : null}
              {scene === 2 ? <SceneDecide live={live} reduce={reduce} enter={enter} /> : null}
              {scene === 3 ? <SceneSeal live={live} reduce={reduce} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── stepper footer ── */}
        <Stepper active={scene} live={live} />
      </motion.div>

      {/* local keyframes (ping) — kept inline so the component is self-contained */}
      <style>{`@keyframes ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }`}</style>
    </div>
  );
}
