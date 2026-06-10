"use client";

/**
 * HERO — "THE ENGINE BAY" (Night Garage v2 · dark inverse of Aval's light brutalism)
 *
 * The firm idling at readiness, represented as a night-garage instrument cluster:
 *   • a giant TACHOMETER — the needle sweeps to 82.6% (regime classifier OOS accuracy,
 *     the one read the firm trusts) and breathes there; the red zone is the forced-trade
 *     territory the firm refuses to enter.
 *   • the brand rotor idles at the hub like a turbine (continuous slow spin).
 *   • a GEARBOX strip holds N — the registry is empty today, so the firm is in NEUTRAL.
 *     Restraint made physical: no validated edge, no spark, no gear.
 *   • a pit-wall ticker marquees the real, verified numbers (including the retired edge
 *     and the rejected +96% — honesty on the wall).
 * Every figure on this screen is real. No invented metrics, ever.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";

// ── real, verified figures (see docs/design.md §7 — honesty rules) ──
const REGIME_ACC = 82.6; // regime classifier OOS accuracy (%)
const SWEEP_DEG = 210; // tach sweep
const START_DEG = -105; // needle angle at 0%
const NEEDLE_DEG = START_DEG + (SWEEP_DEG * REGIME_ACC) / 100; // ≈ +68.5°

const TICKER = [
  "REGIME CLASSIFIER 82.6% OOS",
  "LEDGER +28.9% OOS — THAT EDGE LATER DECAYED → RETIRED BY THE LAB",
  "+96.0% BACKTEST CRASH-TESTED → REJECTED AT −73 BPS SLIPPAGE",
  "EVERY DECISION SEALED ON MANTLE · BLOCK 39,402,623",
  "100/100 LIVE SPOT FILLS · BYBIT",
  "24 HYPOTHESES TESTED → 23 SCRAPPED",
  "WE PUBLISH WHAT DOESN'T WORK",
];

const GEARS = ["R", "N", "1", "2", "3"];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** SVG arc path between two angles (degrees, 0 = up). */
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

export default function HeroEngineBay() {
  const reduced = useReducedMotion();
  const [acc, setAcc] = useState(0);
  const counted = useRef(false);

  // count the headline figure up once (0 → 82.6), synced with the needle sweep
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    if (reduced) {
      setAcc(REGIME_ACC);
      return;
    }
    const ctrl = animate(0, REGIME_ACC, {
      duration: 1.4,
      ease: [0.22, 1.1, 0.36, 1],
      onUpdate: (v) => setAcc(v),
    });
    return () => ctrl.stop();
  }, [reduced]);

  // tach geometry
  const CX = 170;
  const CY = 175;
  const R = 138;

  return (
    <section id="top" className="relative isolate overflow-hidden bg-pitch">
      {/* shop-floor texture + overhead lamp vignette */}
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 52% at 50% 0%, rgba(201,242,75,0.07), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-[1280px] gap-14 px-6 pb-16 pt-24 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pt-28 xl:px-4">
        {/* ── LEFT: the claim ── */}
        <div>
          <p className="gr-rise font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> AUTONOMOUS TRADING FIRM · BUILT LIKE AN
            ENGINE · MANTLE
          </p>

          <h1
            className="gr-slam mt-6 font-display font-extrabold uppercase leading-[0.86] text-bone"
            style={{ fontSize: "clamp(3.4rem, 9.2vw, 7.6rem)", letterSpacing: "0.005em" }}
          >
            Most bots
            <br />
            redline.
            <br />
            <span className="text-chartreuse">Ours holds gear.</span>
          </h1>

          <p
            className="gr-rise mt-7 max-w-xl text-pretty text-base leading-relaxed text-bone/70 sm:text-lg"
            style={{ animationDelay: "0.22s" }}
          >
            Nine desks feed the manifold. The debate compresses. The PM fires{" "}
            <span className="font-mono text-chartreuse">ENTER</span> only on a validated edge —
            today the registry is empty, so the gearbox holds{" "}
            <span className="font-mono text-bone">N</span>. Every decision, including the
            restraint, is sealed on-chain.
          </p>

          <div className="gr-rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.34s" }}>
            <a
              href="/app"
              className="gr-shadow-chart gr-press border-2 border-bone bg-bone px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-pitch"
            >
              Open the console
            </a>
            <a
              href="#dyno"
              className="gr-press border-2 border-bone/60 px-7 py-3.5 font-display text-lg font-semibold uppercase tracking-wide text-bone/90 hover:border-chartreuse hover:text-chartreuse"
              style={{ boxShadow: "4px 4px 0 rgba(242,239,230,0.25)" }}
            >
              See the dyno
            </a>
          </div>

          <p className="gr-rise mt-7 font-mono text-[11px] uppercase tracking-[0.22em] text-steel" style={{ animationDelay: "0.46s" }}>
            honesty-by-design — the numbers below include what failed
          </p>
        </div>

        {/* ── RIGHT: the instrument cluster ── */}
        <div className="gr-rise relative mx-auto w-full max-w-[460px]" style={{ animationDelay: "0.18s" }}>
          {/* cluster plate */}
          <div className="gr-shadow-ink relative border-2 border-bone/25 bg-carbon p-6 sm:p-8">
            <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-40" />

            {/* dial */}
            <div className="relative">
              <svg viewBox="0 0 340 210" className="relative z-10 w-full" role="img" aria-label={`Regime confidence ${REGIME_ACC}% out-of-sample`}>
                {/* track */}
                <path d={arc(CX, CY, R, START_DEG, START_DEG + SWEEP_DEG)} fill="none" stroke="rgba(242,239,230,0.16)" strokeWidth="13" />
                {/* live zone (0 → 88%) */}
                <path d={arc(CX, CY, R, START_DEG, START_DEG + SWEEP_DEG * 0.88)} fill="none" stroke="rgba(242,239,230,0.34)" strokeWidth="13" />
                {/* redline — the forced-trade zone we refuse */}
                <path d={arc(CX, CY, R, START_DEG + SWEEP_DEG * 0.88, START_DEG + SWEEP_DEG)} fill="none" stroke="#ff5a1f" strokeWidth="13" />
                {/* needle reading (chartreuse fill to the value) */}
                <path d={arc(CX, CY, R, START_DEG, NEEDLE_DEG)} fill="none" stroke="#c9f24b" strokeWidth="5" />

                {/* major ticks + labels */}
                {[0, 25, 50, 75, 100].map((t) => {
                  const a = START_DEG + (SWEEP_DEG * t) / 100;
                  const o = polar(CX, CY, R + 14, a);
                  const i = polar(CX, CY, R - 13, a);
                  const l = polar(CX, CY, R + 30, a);
                  return (
                    <g key={t}>
                      <line x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke="rgba(242,239,230,0.5)" strokeWidth="2.5" />
                      <text x={l.x} y={l.y + 4} textAnchor="middle" className="fill-steel font-mono" style={{ fontSize: 11 }}>
                        {t}
                      </text>
                    </g>
                  );
                })}

                {/* needle — outer owns the sweep-to-value (motion), inner breathe lives on the group */}
                <motion.g
                  initial={{ rotate: reduced ? NEEDLE_DEG : START_DEG }}
                  animate={{ rotate: NEEDLE_DEG }}
                  transition={{ type: "spring", stiffness: 42, damping: 11, mass: 1.2, delay: 0.15 }}
                  style={{ originX: `${CX}px`, originY: `${CY}px` }}
                >
                  <line x1={CX} y1={CY} x2={CX} y2={CY - R + 22} stroke="#f2efe6" strokeWidth="4" strokeLinecap="round" />
                  <line x1={CX} y1={CY} x2={CX} y2={CY - R + 52} stroke="#c9f24b" strokeWidth="2" strokeLinecap="round" />
                </motion.g>

                {/* hub ring */}
                <circle cx={CX} cy={CY} r="34" fill="#0b0b0b" stroke="rgba(242,239,230,0.35)" strokeWidth="2" />
              </svg>

              {/* the rotor idles at the hub — the brand turbine, always turning */}
              <div
                className="pointer-events-none absolute z-20"
                style={{ left: `${(CX / 340) * 100}%`, top: `${(CY / 210) * 100}%`, transform: "translate(-50%, -50%)" }}
              >
                <Image
                  src="/brand/sixblade-chartreuse.png"
                  alt=""
                  width={52}
                  height={55}
                  className={reduced ? "" : "gr-rotor"}
                  style={{ animationDuration: "9s" }}
                  priority
                />
              </div>
            </div>

            {/* readout row */}
            <div className="relative z-10 mt-2 flex items-end justify-between border-t-2 border-bone/15 pt-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">regime confidence · OOS</p>
                <p className="font-display text-5xl font-extrabold leading-none text-bone">
                  {acc.toFixed(1)}
                  <span className="ml-1 text-2xl text-chartreuse">%</span>
                </p>
              </div>
              <p className="max-w-[150px] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-steel">
                redline = forced trades. <span className="text-signal2">we don&apos;t go there.</span>
              </p>
            </div>

            {/* gearbox — N held (the honest state: registry empty) */}
            <div className="relative z-10 mt-5 flex items-center gap-3 border-t-2 border-bone/15 pt-5">
              <div className="flex gap-1.5">
                {GEARS.map((g) => (
                  <span
                    key={g}
                    className={
                      g === "N"
                        ? "gr-shadow-bone grid h-11 w-11 place-items-center border-2 border-bone bg-bone font-display text-xl font-extrabold text-pitch"
                        : "grid h-11 w-11 place-items-center border-2 border-bone/20 font-display text-xl font-semibold text-bone/30"
                    }
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
                registry empty →<br />
                <span className="text-bone">neutral until an edge validates</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── pit-wall ticker — the real numbers on the wall ── */}
      <div className="relative z-10 border-y-2 border-bone/20 bg-carbon">
        <div className="flex overflow-hidden py-3">
          <div className={`flex shrink-0 items-center gap-10 pr-10 ${reduced ? "" : "gr-marquee"}`}>
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.18em] text-bone/75">
                {t}
                <span aria-hidden className="text-chartreuse">▮</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* hazard seam into the engine */}
      <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
    </section>
  );
}
