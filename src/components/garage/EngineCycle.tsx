"use client";

/**
 * THE ENGINE CYCLE — the org's decision loop as a 4-stroke engine (Night Garage §6.2).
 *
 * One firm cycle IS a 4-stroke cycle:
 *   INTAKE      desks pull market telemetry (Bitget, Hyperliquid, DeFiLlama, whales, Allora…)
 *   COMPRESSION the bull-vs-bear debate compresses nine stances into one read
 *   COMBUSTION  the PM decision — ENTER fires the chartreuse spark; with no validated edge
 *               there is NO SPARK and the gearbox holds N (today's honest state)
 *   EXHAUST     the decision (even the abstain) is sealed on-chain on Mantle
 *
 * The stage highlight advances continuously (the loop never stops); cylinders piston with
 * phase offsets. Latest real decision is shown verbatim — MNT · ABSTAIN.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const STROKES = [
  {
    key: "INTAKE",
    num: "01",
    title: "Intake",
    desc: "Nine desks pull live telemetry — positioning, funding, whales, TVL, macro.",
  },
  {
    key: "COMPRESSION",
    num: "02",
    title: "Compression",
    desc: "Bull argues bear. Nine stances compress into one pressurized read.",
  },
  {
    key: "COMBUSTION",
    num: "03",
    title: "Combustion",
    desc: "The PM is the spark plug. ENTER ignites only on a validated edge.",
  },
  {
    key: "EXHAUST",
    num: "04",
    title: "Exhaust",
    desc: "The decision — even the restraint — is sealed on-chain on Mantle.",
  },
];

const DESKS = [
  "REGIME/TECHNICAL",
  "MACRO · ALLORA",
  "ON-CHAIN/RISK",
  "SMART-MONEY FLOW",
  "RESEARCH",
  "OI-CONTRARIAN",
  "FLOW-INTEL",
  "WHALE TRACKER",
  "MANTLE FUNDAMENTALS · DEFILLAMA",
];

export default function EngineCycle() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  // the loop never stops — advance the active stroke every 1.7s
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStage((s) => (s + 1) % 4), 1700);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <section id="engine" className="relative isolate overflow-hidden bg-pitch px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        {/* section header */}
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-chartreuse">▮</span> THE FIRM · ONE CYCLE · EVERY READ
        </p>
        <h2
          className="mt-4 max-w-3xl font-display font-extrabold uppercase leading-[0.9] text-bone"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
        >
          A four-stroke <span className="text-chartreuse">decision engine</span>
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-bone/65">
          Scan, argue, decide, seal — the same cycle on every read. Today there is no validated
          edge on the floor, so combustion stays dark. That no-spark is the product.
        </p>

        {/* the four cylinders */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STROKES.map((s, i) => {
            const active = stage === i;
            const isCombustion = s.key === "COMBUSTION";
            return (
              <div
                key={s.key}
                className={`relative border-2 p-5 transition-colors duration-300 ${
                  active ? "border-bone bg-carbon2" : "border-bone/20 bg-carbon"
                }`}
                style={active ? { boxShadow: "6px 6px 0 rgba(201,242,75,0.85)" } : undefined}
              >
                {/* stroke number plate */}
                <div className="flex items-start justify-between">
                  <span
                    className={`font-display text-5xl font-extrabold leading-none ${
                      active ? "text-chartreuse" : "text-bone/25"
                    }`}
                  >
                    {s.num}
                  </span>
                  {/* the cylinder: piston rides in a sleeve, phase-offset */}
                  <div className="relative h-16 w-9 overflow-hidden border-2 border-bone/30 bg-pitch">
                    <div
                      className={`absolute left-1 right-1 top-1 h-6 bg-bone/80 ${reduced ? "" : "gr-piston"}`}
                      style={{ animationDelay: `${i * 0.6}s` }}
                    />
                    {/* spark gap — only the combustion chamber can ignite */}
                    {isCombustion && (
                      <div className="absolute inset-x-0 bottom-1 text-center font-mono text-[9px] uppercase tracking-widest text-signal2/80">
                        no spark
                      </div>
                    )}
                  </div>
                </div>

                <h3
                  className={`mt-4 font-display text-2xl font-bold uppercase tracking-wide ${
                    active ? "text-bone" : "text-bone/55"
                  }`}
                >
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bone/55">{s.desc}</p>

                {/* combustion's honest state */}
                {isCombustion && (
                  <p className="mt-3 border-t-2 border-bone/15 pt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
                    registry empty → <span className="text-bone">gear holds N</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* desk roster — the manifold feeding the engine */}
        <div className="mt-12 border-2 border-bone/20 bg-carbon">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-chartreuse">
              the manifold ▸
            </span>
            {DESKS.map((d) => (
              <span key={d} className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone/60">
                {d}
              </span>
            ))}
          </div>
          {/* latest real decision — verbatim from the cloud floor */}
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-bone/15 px-5 py-3.5">
            <span className="gr-spark inline-block h-2.5 w-2.5 bg-chartreuse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80">
              latest cycle · MNT — <span className="text-bone">ABSTAIN</span> · sealed
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
              (the firm holds until the dyno passes an edge)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
