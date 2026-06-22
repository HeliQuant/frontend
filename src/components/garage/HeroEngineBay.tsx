"use client";

/**
 * HERO — "THE ENGINE BAY" (Night Garage v2 · dark inverse of Aval's light brutalism)
 *
 * Left: the claim — most bots redline, ours holds gear. Right: the GEAR ENGINE — the firm
 * as interlocking machinery (PM hub + the 9-desk ring, ported from the user's Hero4 and
 * re-skinned to the garage language; see GearEngine.tsx). Below: the pit-wall ticker
 * marquees the real, verified numbers — including the retired edge and the rejected +96%.
 * Every figure on this screen is real. No invented metrics, ever.
 */

import { useReducedMotion } from "motion/react";

import GearEngine from "./GearEngine";

const TICKER = [
  "REGIME CLASSIFIER 82.6% OOS",
  "LEDGER +28.9% OOS — THAT EDGE LATER DECAYED → RETIRED BY THE LAB",
  "+96.0% BACKTEST CRASH-TESTED → REJECTED AT −73 BPS SLIPPAGE",
  "EVERY DECISION SEALED ON MANTLE · BLOCK 39,402,623",
  "REAL FILLS ON BITGET TESTNET",
  "24 HYPOTHESES TESTED → 23 SCRAPPED",
  "WE PUBLISH WHAT DOESN'T WORK",
];

export default function HeroEngineBay() {
  const reduced = useReducedMotion();

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
            A dozen voices feed the manifold. The debate compresses. The PM fires{" "}
            <span className="font-mono text-chartreuse">ENTER</span> only on a validated edge —
            today the registry is empty, so the gearbox holds{" "}
            <span className="font-mono text-bone">N</span>. Every decision, including the
            restraint, is sealed on-chain.
          </p>

          <div className="gr-rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.34s" }}>
            <a
              href="/onboarding"
              className="gr-shadow-chart gr-press border-2 border-pitch bg-chartreuse px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-pitch"
            >
              Register your engine
            </a>
            <a
              href="/campaign"
              className="gr-press border-2 border-bone bg-bone px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-pitch"
            >
              Watch the owner&apos;s floor
            </a>
            <a
              href="#dyno"
              className="gr-press border-2 border-bone/60 px-7 py-3.5 font-display text-lg font-semibold uppercase tracking-wide text-bone/90 hover:border-chartreuse hover:text-chartreuse"
              style={{ boxShadow: "4px 4px 0 rgba(242,239,230,0.25)" }}
            >
              See the dyno
            </a>
            <a
              href="/onboarding"
              className="self-center font-mono text-[12px] uppercase tracking-[0.16em] text-steel underline-offset-4 hover:text-chartreuse hover:underline"
            >
              already have an engine? log in →
            </a>
          </div>

          <p className="gr-rise mt-7 font-mono text-[11px] uppercase tracking-[0.22em] text-steel" style={{ animationDelay: "0.46s" }}>
            honesty-by-design — the numbers below include what failed
          </p>
        </div>

        {/* ── RIGHT: the gear engine (PM hub + 9-desk ring, meshed + idling) ── */}
        <GearEngine />
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
