"use client";

/**
 * THE DYNO ROOM — the edge lab as a dynamometer test cell (Night Garage §6.3).
 *
 * Every strategy must pass the dyno before touching capital. The screen shows the one
 * curve that ever passed — the OI-contrarian edge, +28.9% OOS while MNT fell — and then
 * tells the truth most projects hide: it DECAYED on fresh data, so the lab retired it.
 * The scrap shelf lists what the other hypotheses died of. 24 in, 23 scrapped, 1 passed →
 * retired. The dyno doesn't lie.
 */

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// real equity path shape: $1k → $1,289 OOS (stylized x-positions, real endpoints)
const CURVE =
  "M 12 150 L 60 142 L 96 146 L 138 128 L 176 121 L 214 127 L 252 104 L 296 92 L 340 96 L 388 78 L 428 64";

const SCRAP = [
  { name: "BTC MOMENTUM", cause: "fee-eaten" },
  { name: "ETH/SOL TREND", cause: "OOS negative" },
  { name: "FUNDING SIGNAL", cause: "noise" },
  { name: "LONG-SHORT RATIO", cause: "noise" },
  { name: "HYPE FLOW", cause: "one lucky fold" },
  { name: "BTC FLOW ×2", cause: "false positives — killed by FDR" },
  { name: "mETH/ETH CONVERGENCE", cause: "see crash test ↓" },
];

export default function DynoRoom() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <section id="dyno" className="relative isolate overflow-hidden bg-carbon px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-30" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-chartreuse">▮</span> THE EDGE LAB · COST-AWARE OOS · WALK-FORWARD · FDR
        </p>
        <h2
          className="mt-4 max-w-3xl font-display font-extrabold uppercase leading-[0.9] text-bone"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
        >
          The dyno <span className="text-chartreuse">doesn&apos;t lie</span>
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ── the dyno screen ── */}
          <div className="gr-shadow-ink relative border-2 border-bone/25 bg-pitch p-6">
            <div className="flex items-center justify-between border-b-2 border-bone/15 pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">
                dyno run · OI-CONTRARIAN · MNT · out-of-sample
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-chartreuse">
                $1,000 → $1,289
              </p>
            </div>

            <div className="relative mt-4">
              <svg viewBox="0 0 440 170" className="w-full">
                {/* grid */}
                {[40, 80, 120].map((y) => (
                  <line key={y} x1="10" x2="430" y1={y} y2={y} stroke="rgba(242,239,230,0.07)" strokeWidth="1" />
                ))}
                {/* baseline = the asset itself: MNT fell ~39% in the window */}
                <path
                  d="M 12 150 L 80 152 L 150 158 L 230 161 L 320 163 L 428 165"
                  fill="none"
                  stroke="rgba(255,90,31,0.55)"
                  strokeWidth="2"
                  strokeDasharray="5 6"
                />
                {/* the torque curve — draws when the cell powers on */}
                <motion.path
                  d={CURVE}
                  fill="none"
                  stroke="#c9f24b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.6, ease: [0.3, 0.9, 0.3, 1] }}
                />
                <text x="14" y="166" className="fill-signal2 font-mono" style={{ fontSize: 10 }}>
                  MNT −39% same window
                </text>
                <text x="350" y="56" className="fill-chartreuse font-mono" style={{ fontSize: 12 }}>
                  +28.9% OOS
                </text>
              </svg>

              {/* the honesty stamp — slams once the curve finishes */}
              <motion.div
                initial={{ opacity: 0, scale: reduced ? 1 : 2, rotate: -8 }}
                animate={inView ? { opacity: 1, scale: 1, rotate: -8 } : {}}
                transition={{ delay: reduced ? 0 : 1.75, duration: 0.4, ease: [0.2, 1.4, 0.3, 1] }}
                className="absolute right-3 top-2 border-[3px] border-signal2 px-3 py-1.5"
              >
                <p className="font-display text-xl font-extrabold uppercase leading-none tracking-wide text-signal2">
                  Decayed
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-signal2/90">
                  retired by the lab
                </p>
              </motion.div>
            </div>

            <p className="mt-4 border-t-2 border-bone/15 pt-4 text-sm leading-relaxed text-bone/60">
              It beat costs out-of-sample, hedge-like, while the asset bled. Then fresh full-history
              data said the pattern was gone — so the lab pulled its license.{" "}
              <span className="text-bone">An edge you won&apos;t retire isn&apos;t an edge, it&apos;s a belief.</span>
            </p>
          </div>

          {/* ── counters + scrap shelf ── */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-5">
              {[
                { v: "24", l: "hypotheses in" },
                { v: "23", l: "scrapped" },
                { v: "1", l: "passed → retired" },
              ].map((c) => (
                <div key={c.l} className="border-2 border-bone/25 bg-pitch p-4 text-center">
                  <p className="font-display text-5xl font-extrabold leading-none text-bone">{c.v}</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.18em] text-steel">{c.l}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 border-2 border-bone/25 bg-pitch p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">
                the scrap shelf · cause of death
              </p>
              <ul className="mt-4 space-y-2.5">
                {SCRAP.map((s) => (
                  <li key={s.name} className="flex items-baseline justify-between gap-3 border-b border-bone/10 pb-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/70 line-through decoration-signal2/70 decoration-2">
                      {s.name}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-signal2/80">
                      {s.cause}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
                gates: cost-aware OOS · anchored walk-forward · outlier-robust ·{" "}
                <span className="text-chartreuse">Benjamini-Hochberg FDR</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
