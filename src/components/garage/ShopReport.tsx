"use client";

/**
 * THE SHOP REPORT — the teardown log as a QC INSPECTION SHEET (Night Garage).
 *
 * The landing's one place that shows the WHOLE honesty record. Every finding is a real
 * automotive part on the inspection bench — piston, gear, valve, spark plug, coil spring,
 * timing chain, brake rotor, crankshaft — stamped with its verdict and tinted by it: parts
 * we KEPT glow chartreuse, parts we SCRAPPED bleed signal orange. The point is geometric —
 * count the scraps against the keeps: a firm whose bench is mostly rejects is a firm whose
 * passes mean something. Curated from profile/FINDINGS.md (28 logged); full report linked.
 * Real automotive components as UI, on a continuous inspection sheet — not a card wall.
 */

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const FINDINGS_URL = "https://github.com/HeliQuant/.github/blob/main/profile/FINDINGS.md";

type Verdict = "REAL" | "REJECTED" | "RETIRED" | "DECAYED" | "ABSTAIN";
type Part = "piston" | "gear" | "spring" | "plug" | "chain" | "valve" | "rotor" | "crank";

/** Line-art automotive components (real parts; stroke = currentColor so the verdict tints them). */
function PartIcon({ kind }: { kind: Part }) {
  const common = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-7 w-7",
  };
  switch (kind) {
    case "piston": // head with rings + connecting rod to the crank pin
      return (
        <svg {...common}>
          <rect x="9" y="4" width="14" height="11" rx="2" />
          <path d="M11 8h10M11 11h10" />
          <path d="M16 15v8" />
          <circle cx="16" cy="25.5" r="2.6" />
        </svg>
      );
    case "gear": // cog: hub + radial teeth
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="5.5" />
          <circle cx="16" cy="16" r="2" />
          <path d="M16 4v3.5M16 24.5V28M4 16h3.5M24.5 16H28M7.5 7.5l2.5 2.5M22 22l2.5 2.5M24.5 7.5L22 10M10 22l-2.5 2.5" />
        </svg>
      );
    case "spring": // coil / pegas
      return (
        <svg {...common}>
          <path d="M8 6h16M8 6l16 5M24 11H8M8 11l16 5M24 16H8M8 16l16 5M24 21H8M8 21l16 5M24 26H8" />
        </svg>
      );
    case "plug": // spark plug: ceramic body, hex, electrode
      return (
        <svg {...common}>
          <path d="M13 3h6v8h-6z" />
          <path d="M12 11h8v4h-8z" />
          <path d="M16 15v8" />
          <path d="M16 23l-3 3" />
        </svg>
      );
    case "chain": // timing chain links
      return (
        <svg {...common}>
          <ellipse cx="9.5" cy="16" rx="3" ry="5.5" />
          <ellipse cx="16" cy="16" rx="3" ry="5.5" />
          <ellipse cx="22.5" cy="16" rx="3" ry="5.5" />
        </svg>
      );
    case "valve": // poppet valve: mushroom head + stem + keeper
      return (
        <svg {...common}>
          <path d="M9 8q7-6 14 0" />
          <path d="M16 8v16" />
          <path d="M13 24h6" />
        </svg>
      );
    case "rotor": // brake disc: ring + vents
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="10" />
          <circle cx="16" cy="16" r="3" />
          <path d="M16 6v3M16 23v3M6 16h3M23 16h3" />
        </svg>
      );
    case "crank": // crankshaft journal + pin + counterweight
      return (
        <svg {...common}>
          <circle cx="11" cy="16" r="4" />
          <path d="M15 16h5" />
          <circle cx="22" cy="12" r="2.4" />
          <path d="M19 19l4 2" />
        </svg>
      );
  }
}

const REAL: Verdict[] = ["REAL"];

const ROWS: { n: number; part: Part; title: string; line: string; verdict: Verdict }[] = [
  { n: 5, part: "valve", title: "Accuracy ≠ profit", line: "A model right 70% of the time still loses if the 30% are the big moves.", verdict: "REAL" },
  { n: 7, part: "spring", title: "The one real edge: OI-contrarian", line: "Hedge-like, +28.9% OOS on MNT — earned on its window, not a forward promise.", verdict: "REAL" },
  { n: 9, part: "plug", title: "Honesty-by-design", line: "No number is shown that a real run this session didn't print.", verdict: "REAL" },
  { n: 14, part: "rotor", title: "Verifiable on Mantle", line: "Every gated decision sealed on-chain — the ledger is public, not a screenshot.", verdict: "REAL" },
  { n: 11, part: "piston", title: "We validated MNT — then our own loop RETIRED it", line: "The self-learning engine demoted its own flagship when the edge decayed.", verdict: "RETIRED" },
  { n: 22, part: "gear", title: "We tested ML too — no free pass", line: "RandomForest + XGBoost on MNT: ~51% accuracy, −50/−62% OOS. Abstain.", verdict: "ABSTAIN" },
  { n: 15, part: "chain", title: "We rejected our own +96% backtest", line: "mETH/ETH convergence — priced at real slippage it paid −73 bps/trade. Out.", verdict: "REJECTED" },
  { n: 24, part: "gear", title: "A collaborator's “+36% BTC” ML", line: "Re-run honest on 10× data with fees + walk-forward: −12.8%. A backtest isn't an edge.", verdict: "REJECTED" },
  { n: 26, part: "spring", title: "HYPE's +142% snapshot DECAYED", line: "Probation, not graduation — days later it earned no edge at all. We'd already held.", verdict: "DECAYED" },
  { n: 28, part: "crank", title: "We found a +64% edge — and rejected it live", line: "MNT OI-contrarian, p=0.025 — but unstable at the 0.9 cutoff. Registry stays empty.", verdict: "REJECTED" },
];

const STAMP: Record<Verdict, string> = {
  REAL: "text-chartreuse border-chartreuse",
  REJECTED: "text-signal2 border-signal2",
  RETIRED: "text-signal2 border-signal2",
  DECAYED: "text-signal2 border-signal2",
  ABSTAIN: "text-bone/70 border-bone/40",
};

const SPROCKET = {
  backgroundImage: "radial-gradient(circle, rgba(242,239,230,0.22) 2.2px, transparent 2.6px)",
  backgroundSize: "16px 26px",
  backgroundPosition: "center top",
};

export default function ShopReport() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const passes = ROWS.filter((r) => REAL.includes(r.verdict)).length;
  const culls = ROWS.length - passes;

  return (
    <section id="report" className="relative isolate overflow-hidden bg-pitch px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-40" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="gr-blink text-signal2">●</span> QC INSPECTION SHEET · 28 FINDINGS · WE PUBLISH WHAT DOESN&apos;T WORK
        </p>
        <h2
          className="mt-4 max-w-3xl font-display font-extrabold uppercase leading-[0.9] text-bone"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
        >
          The <span className="text-chartreuse">shop report</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone/55">
          Every claim hits the bench as a part. Some we keep; most we scrap. Here is the log —
          tinted by verdict, stamped, and linked in full.
        </p>

        {/* honesty ratio — geometry, not a claim: how much of the bench is "didn't work" */}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">bench (shown)</p>
          <div className="flex h-3 w-full max-w-md overflow-hidden border border-bone/25">
            <motion.div
              className="bg-chartreuse"
              initial={{ width: 0 }}
              animate={inView ? { width: `${(passes / ROWS.length) * 100}%` } : {}}
              transition={{ duration: reduced ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="flex-1" style={{ background: "rgba(255,90,31,0.85)" }} />
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone/70">
            <span className="text-chartreuse">{passes} kept</span> · <span className="text-signal2">{culls} scrapped</span>
          </p>
        </div>

        {/* the inspection sheet */}
        <div className="mt-10 flex border-2 border-bone/25 bg-carbon">
          <div aria-hidden className="w-[18px] shrink-0 border-r border-bone/15" style={SPROCKET} />
          <ol className="flex-1">
            {ROWS.map((r, i) => {
              const kept = REAL.includes(r.verdict);
              return (
                <motion.li
                  key={r.n}
                  initial={{ opacity: 0, x: reduced ? 0 : -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: reduced ? 0 : 0.15 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex items-start gap-4 px-5 py-4 ${i % 2 ? "bg-bone/[0.025]" : ""} ${i ? "border-t border-bone/10" : ""}`}
                >
                  {/* the part on the bench — tinted by verdict */}
                  <span className={`mt-0.5 shrink-0 ${kept ? "text-chartreuse" : r.verdict === "ABSTAIN" ? "text-bone/50" : "text-signal2"}`}>
                    <PartIcon kind={r.part} />
                  </span>
                  <span className="mt-1 hidden w-8 shrink-0 font-mono text-xs text-steel sm:block">#{r.n}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-bone">
                      {r.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-bone/55">{r.line}</p>
                  </div>
                  <span
                    className={`mt-0.5 shrink-0 border-2 px-2.5 py-1 font-display text-xs font-extrabold uppercase tracking-wider ${STAMP[r.verdict]}`}
                    style={{ transform: "rotate(-3deg)" }}
                  >
                    {r.verdict}
                  </span>
                </motion.li>
              );
            })}
          </ol>
          <div aria-hidden className="w-[18px] shrink-0 border-l border-bone/15" style={SPROCKET} />
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-steel">
            ten of twenty-eight, signed off — a firm that logs its{" "}
            <span className="text-signal2">scraps</span> is one whose{" "}
            <span className="text-chartreuse">keeps mean something</span>
          </p>
          <a
            href={FINDINGS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gr-press shrink-0 self-start border-2 border-bone bg-transparent px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-bone hover:bg-bone hover:text-pitch sm:self-auto"
          >
            Read all 28 →
          </a>
        </div>
      </div>
    </section>
  );
}
