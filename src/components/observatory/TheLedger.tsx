"use client";

/**
 * TheLedger — the live, on-chain decision ledger as an immersive diorama (anti-card).
 *
 * METAPHOR: a flowing vertical stream of sealed decisions descends toward a glowing faceted
 * Mantle chain-block at the base. Each carries a tx-hash "engraved" into the chain; the first
 * anchored decision (FIRST_ANCHOR) stands as the PROOF-STONE, sealed onto the block face with
 * the rationed chartreuse ring (continuity with ObservatoryConsole's SEAL scene). An
 * observatory's logbook, sealed on-chain.
 *
 * DATA — only ever REAL:
 *   • LIVE FEED  fetchDecisions() (client useEffect) → terse mono rows; loading / empty / error
 *                are handled gracefully (the demo DB may be empty — NEVER crash on []).
 *   • PROOF-STONE FIRST_ANCHOR (block 39,402,623 · MNT · ABSTAIN · 0xa052ee03…de69b53), always
 *                shown, engraved on the faceted block with a Mantlescan link.
 *
 * Self-contained: every colour/easing constant is LOCAL; only --font-mono + REAL data are
 * borrowed. Loops gate behind a `mounted` flag (no hydration drift) and freeze to a sensible
 * final state under prefers-reduced-motion. THE LAW: midnight void (#05060f — hero standard, never #000),
 * blue-tinted glass hairlines, blueprint-grid texture behind, depth via glow not black shadow, mono
 * all-caps wide-tracked for ALL telemetry/numbers/hashes, chartreuse RATIONED to the on-chain seal ring ONLY.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { fetchDecisions } from "@/lib/supabase";
import { type Decision, FIRST_ANCHOR, MANTLESCAN } from "@/lib/heliquant";

// ───────────────────────────── the LAW: local palette (mirrors the hero standard tokens) ─────────────────────────────
const VOID = "#05060f"; // midnight abyss — matches the hero base (NEVER pure #000)
const PANEL = "#0d0d0e"; // glass surface base
const SURFACE_1 = "#141416"; // raised inner surface / block body
const HAIRLINE = "rgba(186, 215, 247, 0.08)"; // blue-tinted glass hairline (hero standard)
const ICE = "#d8ecf8"; // comet — primary text on dark
const MUTE = "#81899b"; // interstellar gray — dim instrument label
const MUTE_2 = "#4d535d"; // dimmer / future
const SOLAR = "#ffd06a"; // warm core / energy
const FLAME = "#fa520f"; // solar flame
const AMBER = "#ffd600"; // ABSTAIN verdict (restraint)
const EMERALD = "#72ce7b"; // ENTER verdict
const CRIMSON = "#ff6467"; // risk / SHORT
const CHARTREUSE = "#d0f100"; // RATIONED — the on-chain SEAL RING only, nowhere else
const IRID_A = "#bbdef2"; // seal shimmer cool
const IRID_B = "#d1aad7"; // seal shimmer warm

// ───────────────────────────── motion physics (authored) ─────────────────────────────
const POP = [0.175, 0.885, 0.32, 1.275] as const; // elastic pop (benchmark)
const SWEEP = [0.4, 0, 0.2, 1] as const; // sweep / slide
const DAMPED = [0.16, 1, 0.3, 1] as const; // settling / exhale (no overshoot — restraint)
const SPRING_SETTLE = { type: "spring" as const, stiffness: 120, damping: 18, mass: 0.9 };

const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const FEED_LIMIT = 8; // rows that fit the stream gracefully

type LoadState = "loading" | "ready" | "error";

// ───────────────────────────── helpers ─────────────────────────────
function truncHash(h: string, head = 8, tail = 6): string {
  if (!h) return "";
  if (h.length <= head + tail + 1) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

/** Compact, locale-stable UTC stamp (no cross-machine drift): MM-DD HH:MM. */
function shortTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const md = d.toLocaleDateString("en-CA", { timeZone: "UTC", month: "2-digit", day: "2-digit" });
  const hm = d.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
  return `${md} ${hm}`;
}

function isEnter(decision: string): boolean {
  return decision.toUpperCase() === "ENTER";
}
function decisionColor(decision: string): string {
  return isEnter(decision) ? EMERALD : AMBER; // ENTER emerald · ABSTAIN amber
}
function dirColor(direction: string): string {
  const d = direction.toUpperCase();
  if (d === "LONG") return EMERALD;
  if (d === "SHORT") return CRIMSON;
  return MUTE_2;
}
function dirLabel(direction: string): string {
  const d = (direction || "").toUpperCase();
  return d && d !== "NONE" ? d : "—";
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

// ───────────────────────────── shared SVG defs (the block's iridescence + core glow) ─────────────────────────────
function LedgerDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="lg-irid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={IRID_A} stopOpacity="0.0" />
          <stop offset="40%" stopColor={IRID_A} stopOpacity="0.5" />
          <stop offset="60%" stopColor={IRID_B} stopOpacity="0.5" />
          <stop offset="100%" stopColor={IRID_B} stopOpacity="0.0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// A single decision in the descending stream — terse mono row + a "sealed" link node.
// Rows fade in from the top and settle (staggered, organic). Anchored rows glow iridescent.
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
function StreamRow({
  d,
  index,
  reduce,
}: {
  d: Decision;
  index: number;
  reduce: boolean;
}) {
  const accent = decisionColor(d.decision);
  const anchored = Boolean(d.tx_hash);
  const conf = d.confidence ?? "—";

  const inner = (
    <div
      className="flex items-center gap-3 py-2.5 pl-7 pr-3 sm:gap-4 sm:pl-9"
      style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.14em" }}
    >
      {/* the bead riding the rail (left) — emerald ENTER / amber ABSTAIN */}
      <span aria-hidden className="absolute left-[14px] sm:left-[18px] flex h-2.5 w-2.5 -translate-x-1/2 items-center justify-center">
        <span className="absolute h-2.5 w-2.5 rounded-full" style={{ background: accent, opacity: 0.18 }} />
        <span
          className="relative h-1.5 w-1.5 rounded-full"
          style={{ background: accent, boxShadow: anchored ? `0 0 8px ${accent}88` : "none" }}
        />
      </span>

      {/* ticker */}
      <span className="w-[3.2rem] shrink-0 font-medium" style={{ color: ICE, letterSpacing: "0.1em" }}>
        {d.ticker}
      </span>
      {/* decision verdict */}
      <span className="w-[4.2rem] shrink-0" style={{ color: accent }}>
        {d.decision.toUpperCase()}
      </span>
      {/* direction */}
      <span className="hidden w-[3.4rem] shrink-0 sm:inline" style={{ color: dirColor(d.direction) }}>
        {dirLabel(d.direction)}
      </span>
      {/* confidence */}
      <span className="hidden w-[3rem] shrink-0 sm:inline" style={{ color: MUTE }}>
        {conf}
      </span>
      {/* timestamp — fills, right-aligned */}
      <span className="ml-auto whitespace-nowrap text-right" style={{ color: MUTE_2, fontSize: "9.5px", letterSpacing: "0.16em" }}>
        {shortTs(d.ts)}
      </span>
      {/* sealed marker / Mantlescan link */}
      {anchored ? (
        <span
          className="inline-flex shrink-0 items-center gap-1 transition-colors group-hover/row:text-[var(--irid)]"
          style={{ ["--irid" as string]: IRID_A, color: IRID_A, fontSize: "9px", letterSpacing: "0.16em" }}
        >
          SEALED
          <span aria-hidden className="transition-transform group-hover/row:translate-x-0.5">↗</span>
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center" style={{ color: MUTE_2, fontSize: "9px", letterSpacing: "0.16em" }}>
          OFF-CHAIN
        </span>
      )}
    </div>
  );

  return (
    <motion.li
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { ...SPRING_SETTLE, delay: 0.08 + index * 0.09 }}
      className="group/row relative"
      style={{
        borderBottom: `1px solid ${HAIRLINE}`,
        background: anchored
          ? "linear-gradient(90deg, rgba(187,222,242,0.05), transparent 60%)"
          : "transparent",
      }}
    >
      {/* faint hover wash — diorama, not a clickable card; only the SEALED link navigates */}
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover/row:opacity-100" style={{ background: "rgba(255,255,255,0.02)" }} />
      {anchored && d.tx_hash ? (
        <a
          href={`${MANTLESCAN}/tx/${d.tx_hash}`}
          target="_blank"
          rel="noreferrer"
          title={d.tx_hash}
          className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
          style={{ outlineColor: IRID_A }}
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </motion.li>
  );
}

// ───────────────────────────── feed states (loading / empty / error) ─────────────────────────────
function SyncingState({ live }: { live: boolean }) {
  return (
    <div className="flex items-center gap-3 py-7 pl-7 sm:pl-9" aria-busy="true" aria-label="Syncing ledger">
      <span className="relative flex h-2 w-2">
        {live ? (
          <span className="absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: SOLAR, opacity: 0.6, animation: "lg-ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }} />
        ) : null}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: SOLAR }} />
      </span>
      <span style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.24em", color: MUTE }}>
        SYNCING LEDGER<span style={{ color: SOLAR }}>…</span>
      </span>
    </div>
  );
}

function AwaitingState({ kind }: { kind: "empty" | "error" }) {
  return (
    <div className="py-7 pl-7 sm:pl-9">
      <div className="flex items-center gap-2.5" style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.2em" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kind === "error" ? CRIMSON : MUTE }} />
        <span style={{ color: kind === "error" ? CRIMSON : MUTE }}>
          {kind === "error" ? "FEED UNREACHABLE" : "AWAITING FIRST BROADCAST"}
        </span>
      </div>
      <p className="mt-2 max-w-sm" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.16em", color: MUTE_2, lineHeight: 1.7 }}>
        {kind === "error"
          ? "THE ON-CHAIN PROOF-STONE BELOW IS PERMANENT · INDEPENDENTLY VERIFIABLE ON MANTLESCAN"
          : "ABSTENTIONS STAY GAS-FRUGAL · ONLY ENTER BROADCASTS · THE PROOF-STONE BELOW IS ALREADY SEALED"}
      </p>
    </div>
  );
}

// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// THE PROOF-STONE — the faceted Mantle chain-block at the base of the stream.
// Reuses ObservatoryConsole's SEAL motif: faceted slab + prev/next chain stubs + iridescent
// shimmer + the rationed chartreuse seal ring + checkmark. The FIRST_ANCHOR hash is engraved
// on the face with a subtle iridescent shimmer; a Mantlescan link sits beneath.
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
function ProofStone({ live, reduce }: { live: boolean; reduce: boolean }) {
  const hash = truncHash(FIRST_ANCHOR.txHash);
  const block = FIRST_ANCHOR.block.toLocaleString("en-US");
  const txUrl = `${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`;

  return (
    <div className="relative">
      {/* ░ warm pool of light the block sits in (depth via glow, not shadow) ░ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-44 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(closest-side, rgba(250,82,15,0.16), rgba(255,208,106,0.06) 45%, transparent 72%)`, filter: "blur(26px)" }}
        animate={live ? { opacity: [0.65, 1, 0.65], scale: [1, 1.05, 1] } : undefined}
        transition={live ? { duration: 7, repeat: Infinity, ease: "easeInOut" } : undefined}
      />

      {/* the block + seal — SVG diorama */}
      <div className="relative mx-auto w-full max-w-[440px]">
        <svg viewBox="0 0 100 56" className="w-full" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden>
          {/* prev / next block stubs → the chain continues both ways */}
          <g opacity={0.5}>
            <rect x="2" y="20" width="9" height="16" rx="1.4" fill={SURFACE_1} stroke={HAIRLINE} strokeWidth="0.4" />
            <rect x="89" y="20" width="9" height="16" rx="1.4" fill={SURFACE_1} stroke={HAIRLINE} strokeWidth="0.4" />
            <line x1="11" x2="16" y1="28" y2="28" stroke={MUTE_2} strokeWidth="0.5" />
            <line x1="84" x2="89" y1="28" y2="28" stroke={MUTE_2} strokeWidth="0.5" />
          </g>

          {/* faceted slab — the anchor block */}
          <motion.g
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: DAMPED }}
          >
            <rect x="16" y="12" width="68" height="32" rx="2" fill={SURFACE_1} stroke={HAIRLINE} strokeWidth="0.5" />
            {/* faceted top-edge highlight */}
            <line x1="16" x2="84" y1="17" y2="17" stroke={ICE} strokeWidth="0.25" opacity={0.1} />
            <line x1="20" x2="20" y1="12" y2="44" stroke={ICE} strokeWidth="0.2" opacity={0.06} />
          </motion.g>

          {/* iridescent shimmer sweeping the block face (looping mirror) */}
          {live ? (
            <motion.rect
              x="16" y="12" width="68" height="32" rx="2"
              fill="url(#lg-irid)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 0.5, 0.22, 0.38] }}
              viewport={{ once: true }}
              transition={{ duration: 2.4, ease: SWEEP, delay: 0.4, repeat: Infinity, repeatType: "mirror" }}
            />
          ) : (
            <rect x="16" y="12" width="68" height="32" rx="2" fill="url(#lg-irid)" opacity={0.28} />
          )}

          {/* the SEAL — chartreuse ring + checkmark pressed onto the block (continuity w/ SEAL scene) */}
          <g transform="translate(50 28)">
            <motion.g
              initial={reduce ? { y: 0, scale: 1, opacity: 1 } : { y: -12, scale: 1.35, opacity: 0 }}
              whileInView={{ y: 0, scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={reduce ? { duration: 0 } : { duration: 0.55, delay: 0.45, ease: POP }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <circle r="7" fill="none" stroke={CHARTREUSE} strokeWidth="0.7" opacity={0.85} />
              <circle r="4.6" fill="none" stroke={CHARTREUSE} strokeWidth="0.4" opacity={0.55} />
              <motion.path
                d="M -2.4 0 l 1.8 2 l 3.4 -4"
                fill="none"
                stroke={CHARTREUSE}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, delay: 1.0, ease: SWEEP }}
              />
            </motion.g>
            {/* the rationed chartreuse ring-pulse — the ONE chartreuse moment in this scene */}
            {live ? (
              <motion.circle
                r="7" fill="none" stroke={CHARTREUSE} strokeWidth="0.6"
                initial={{ scale: 1, opacity: 0 }}
                whileInView={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                viewport={{ once: true }}
                transition={{ duration: 1.7, ease: "easeOut", delay: 1.1, repeat: Infinity, repeatDelay: 1 }}
                style={{ transformOrigin: "0px 0px" }}
              />
            ) : null}
          </g>
        </svg>

        {/* engraved readout — wide-tracked mono, the real anchored hash w/ iridescent shimmer */}
        <div className="-mt-1 flex flex-col items-center gap-2 px-4 text-center sm:-mt-2">
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.22em" }}>
            <span style={{ color: MUTE }}>PROOF-STONE</span>
            <span style={{ color: MUTE_2 }}>·</span>
            <span style={{ color: ICE }}>{FIRST_ANCHOR.ticker}</span>
            <span style={{ color: MUTE_2 }}>·</span>
            <span style={{ color: AMBER }}>{FIRST_ANCHOR.decision}</span>
            <span style={{ color: MUTE_2 }}>·</span>
            <span style={{ color: MUTE }}>BLOCK {block}</span>
          </div>

          {/* the engraved tx hash — subtle iridescent shimmer (continuity w/ SEAL) */}
          <motion.div
            className="relative"
            style={{ fontFamily: MONO, fontSize: "13px", letterSpacing: "0.24em", color: IRID_A }}
            animate={live ? { opacity: [0.78, 1, 0.78] } : undefined}
            transition={live ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            {hash}
            {live ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(110deg, transparent 35%, ${IRID_B}cc 50%, transparent 65%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
                animate={{ backgroundPositionX: ["-180%", "180%"] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
              >
                {hash}
              </motion.span>
            ) : null}
          </motion.div>

          <a
            href={txUrl}
            target="_blank"
            rel="noreferrer"
            className="group/ms mt-1 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)", outlineColor: IRID_A }}
          >
            <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.2em", color: MUTE }}>VIEW ON</span>
            <span className="inline-flex items-center gap-1" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.2em", color: IRID_A }}>
              MANTLESCAN
              <span aria-hidden className="transition-transform group-hover/ms:translate-x-0.5">↗</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── the diorama (stream → block) ─────────────────────────────
function LedgerDiorama() {
  const reduce = useReducedMotion() ?? false;

  // gate loops until after first paint → SSR markup matches, no hydration drift.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const live = mounted && !reduce;

  // live feed — client only; [] is a valid, graceful state (demo DB may be empty)
  const [rows, setRows] = useState<Decision[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchDecisions(FEED_LIMIT);
        if (!active) return;
        setRows(data);
        setState("ready");
      } catch {
        if (!active) return;
        setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // faint descending pulses on the rail (atmosphere) — deterministic offsets
  const railPulses = useMemo(() => {
    const rnd = mulberry32(0x1ed6e7);
    return Array.from({ length: 4 }, (_, i) => ({ delay: i * 1.5 + rnd() * 0.8, dur: 3.4 + rnd() * 1.2 }));
  }, []);

  const hasRows = state === "ready" && rows.length > 0;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <LedgerDefs />

      {/* ░░░ ambient warm blobs behind the panel (depth via glow) ░░░ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${FLAME} 0%, transparent 70%)`, filter: "blur(62px)", opacity: 0.16 }}
        animate={live ? { opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] } : undefined}
        transition={live ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-12 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${SOLAR} 0%, transparent 70%)`, filter: "blur(66px)", opacity: 0.1 }}
        animate={live ? { opacity: [0.07, 0.15, 0.07], scale: [1, 1.12, 1] } : undefined}
        transition={live ? { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 } : undefined}
      />

      {/* ░░░ THE PANEL — dark glass logbook, breathing idle ░░░ */}
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
        whileInView={live ? { opacity: 1, y: [0, -4, 0] } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
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
            <div className="relative grid h-8 w-8 place-items-center rounded-lg" style={{ background: SURFACE_1, border: `1px solid ${HAIRLINE}` }}>
              {/* tiny chain-link glyph */}
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                <rect x="2.5" y="5" width="6.5" height="6" rx="3.25" stroke={IRID_A} strokeWidth="1.1" opacity={0.85} />
                <rect x="7" y="5" width="6.5" height="6" rx="3.25" stroke={SOLAR} strokeWidth="1.1" opacity={0.85} />
              </svg>
            </div>
            <div className="leading-tight">
              <div style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.18em", color: ICE }}>
                DECISION LEDGER
              </div>
              <div style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.24em", color: MUTE, marginTop: 2 }}>
                HELIQUANT · MANTLE SEPOLIA
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}>
            <span className="relative flex h-1.5 w-1.5">
              {live ? (
                <span className="absolute inline-flex h-full w-full rounded-full" style={{ backgroundColor: EMERALD, opacity: 0.7, animation: "lg-ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }} />
              ) : null}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: EMERALD }} />
            </span>
            <span style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.22em", color: EMERALD }}>LIVE</span>
          </div>
        </div>

        {/* ── the stream stage ── */}
        <div className="relative">
          {/* faint inner vignette (glow-depth, not shadow) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }} />

          {/* the vertical chain-rail the stream descends along — a CSS gradient line,
              precisely aligned to the bead column (same left offset as the row beads) */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-[14px] top-0 z-0 w-px sm:left-[18px]"
            style={{ background: `linear-gradient(180deg, transparent 0%, ${MUTE}80 22%, ${SOLAR}8c 78%, transparent 100%)` }}
          />
          {/* descending pulses riding the rail toward the block — a 2px strip centred on the rail */}
          {live ? (
            <svg
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-[13px] top-0 z-0 h-full w-0.5 sm:left-[17px]"
              preserveAspectRatio="none"
              viewBox="0 0 2 100"
            >
              {railPulses.map((p, i) => (
                <motion.circle
                  key={`rp-${i}`}
                  cx="1"
                  r="1"
                  fill={SOLAR}
                  initial={{ cy: -2, opacity: 0 }}
                  animate={{ cy: [-2, 102], opacity: [0, 0.9, 0.9, 0] }}
                  transition={{ duration: p.dur, repeat: Infinity, ease: "easeIn", delay: p.delay, times: [0, 0.08, 0.9, 1] }}
                />
              ))}
            </svg>
          ) : null}

          {/* the descending decision stream */}
          <div className="relative z-10 px-2 pt-2">
            {state === "loading" && <SyncingState live={live} />}
            {state === "error" && <AwaitingState kind="error" />}
            {state === "ready" && !hasRows && <AwaitingState kind="empty" />}
            {hasRows && (
              <ul className="m-0 list-none p-0">
                <AnimatePresence initial={false}>
                  {rows.map((d, i) => (
                    <StreamRow key={d.id} d={d} index={i} reduce={reduce} />
                  ))}
                </AnimatePresence>
              </ul>
            )}

            {/* converging funnel from the last row into the block */}
            <div aria-hidden className="relative h-7">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 24" preserveAspectRatio="none" fill="none">
                <motion.path
                  d="M 18 0 Q 18 14 50 22 Q 82 14 82 0"
                  stroke={SOLAR}
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  opacity={0.4}
                  initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={reduce ? { duration: 0 } : { duration: 0.7, delay: 0.2, ease: SWEEP }}
                />
              </svg>
            </div>
          </div>

          {/* ── the PROOF-STONE block at the base ── */}
          <div className="relative z-10 px-4 pb-9 pt-1">
            <ProofStone live={live} reduce={reduce} />
          </div>
        </div>

        {/* ── policy footer (mono, dim) ── */}
        <div
          className="px-5 py-3.5"
          style={{ borderTop: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.015)" }}
        >
          <p style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.18em", color: MUTE_2, lineHeight: 1.7 }}>
            BROADCAST-ON-ENTER · SHA-256(DECISION) ANCHORED IN A 0-VALUE MANTLE TX · PORTFOLIO STATE OFF-CHAIN
          </p>
        </div>
      </motion.div>

      {/* local keyframes (ping) — kept inline so the component is self-contained */}
      <style>{`@keyframes lg-ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }`}</style>
    </div>
  );
}

// ───────────────────────────── section (caption ~30% · diorama ~70%) ─────────────────────────────
export default function TheLedger() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section id="ledger" className="relative isolate overflow-hidden px-6 py-28 sm:px-10 lg:px-16" style={{ backgroundColor: VOID }}>
      {/* faint top seam so the void flows on from the section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
      />

      {/* blueprint grid — the hero's quiet unifying texture, faded at the edges; sits behind everything */}
      <div aria-hidden className="bg-blueprint pointer-events-none absolute inset-0 z-0 opacity-30" />

      <div className="relative z-10 mx-auto max-w-xl">
        {/* eyebrow */}
        <motion.p
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: SWEEP }}
          className="font-mono text-[11px] uppercase"
          style={{ color: MUTE, letterSpacing: "0.26em" }}
        >
          <span style={{ color: FLAME }}>◦</span>{" "}
          <span style={{ color: ICE, opacity: 0.82 }}>THE LEDGER · SEALED ON MANTLE</span>
        </motion.p>

        {/* headline — whisper-light serif, italic accent */}
        <motion.h2
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.08, ease: [0.2, 0.8, 0.2, 1.05] }}
          className="font-display mt-5 text-balance"
          style={{ color: ICE, fontWeight: 300, fontSize: "clamp(2rem, 4.6vw, 3.3rem)", lineHeight: 1.04, letterSpacing: "0.01em" }}
        >
          Every call,{" "}
          <span
            style={{
              fontStyle: "italic",
              background: "linear-gradient(95deg, #ffd06a, #fa520f)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            on the record.
          </span>
        </motion.h2>

        {/* subline */}
        <motion.p
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.18, ease: SWEEP }}
          className="mt-5 max-w-md text-balance"
          style={{ color: ICE, opacity: 0.6, fontSize: "1rem", lineHeight: 1.65 }}
        >
          Each decision&apos;s hash is anchored in a live Mantle transaction — a tamper-proof audit
          trail. Abstentions stay gas-frugal; only ENTER broadcasts.
        </motion.p>
      </div>

      {/* the diorama (~70%) */}
      <div className="relative z-10 mt-14">
        <LedgerDiorama />
      </div>
    </section>
  );
}
