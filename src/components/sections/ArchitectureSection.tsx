"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";

import {
  DESKS,
  CONTRACTS,
  MANTLESCAN,
  FIRST_ANCHOR,
  type Contract,
} from "@/lib/heliquant";

/* ─────────────────────────────────────────────────────────────────────────
   ArchitectureSection — "Under the hood": the 7 desks, the decision pipeline,
   deployed Mantle Sepolia contracts, and the tech stack. Light Antimetal theme.
   All data sourced from @/lib/heliquant — nothing invented.
   ───────────────────────────────────────────────────────────────────────── */

// PART B — pipeline stages (RECALL → … → LEARN, LEARN loops back to RECALL).
const PIPELINE: { stage: string; role: string }[] = [
  { stage: "RECALL", role: "memory" },
  { stage: "PLAN", role: "frame" },
  { stage: "DEBATE", role: "desks" },
  { stage: "PM", role: "decide" },
  { stage: "TICKET", role: "structure" },
  { stage: "EXECUTE", role: "act" },
  { stage: "LEARN", role: "feedback" },
];

// PART D — tech-stack chips.
const STACK: string[] = [
  "Next.js 16",
  "Tailwind v4",
  "wagmi/viem",
  "Supabase (pgvector)",
  "Allora",
  "Mantle Sepolia",
  "ERC-8004",
];

const EDGE_DESK = "OI-Contrarian";

// Scroll-reveal preset; respects reduced-motion via Motion's viewport handling.
const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/* ───────────────────────── copy-to-clipboard address chip ───────────────────────── */
function AddressCopy({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail silently.
    }
  }, [address]);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Address copied to clipboard" : `Copy address ${address}`}
      title={address}
      className="inline-flex items-center gap-1.5 rounded-badge border border-fog-border bg-ghost-canvas px-2.5 py-1 font-mono text-caption text-midnight-navy transition-colors hover:border-ash-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onchain"
    >
      <span className="tabular-nums">{truncateAddress(address)}</span>
      <span
        aria-hidden="true"
        className={copied ? "text-win" : "text-ash-medium"}
      >
        {copied ? "✓ copied" : "⧉"}
      </span>
    </button>
  );
}

/* ───────────────────────── PART C — one contract row ───────────────────────── */
function ContractRow({ contract }: { contract: Contract }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-ghost-canvas">
      <span className="font-medium text-midnight-navy">{contract.name}</span>
      <span className="flex items-center gap-2">
        <AddressCopy address={contract.address} />
        <a
          href={`${MANTLESCAN}/address/${contract.address}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${contract.name} on Mantlescan`}
          className="rounded-card-sm px-1 text-subheading leading-none text-onchain transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onchain"
        >
          ↗
        </a>
      </span>
    </li>
  );
}

export default function ArchitectureSection() {
  return (
    <section
      id="architecture"
      aria-labelledby="architecture-heading"
      className="mx-auto max-w-[1200px] px-6 py-20 md:py-28"
    >
      {/* Heading */}
      <motion.header {...reveal}>
        <p className="font-mono text-caption uppercase tracking-[0.18em] text-ash-medium">
          Architecture
        </p>
        <h2
          id="architecture-heading"
          className="mt-3 font-display text-heading-lg leading-tight text-midnight-navy md:text-display"
        >
          Under the hood.
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-relaxed text-slate-ink">
          How HeliQuant is built — seven independent desks debate every market, a
          disciplined pipeline turns that debate into a structured trade, and each
          decision is anchored on-chain. Deterministic tools compute; agents decide.
        </p>
      </motion.header>

      {/* ───────────── PART A — the 7 desks roster ───────────── */}
      <motion.div {...reveal} className="mt-14">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-heading-sm text-midnight-navy">
            The seven desks
          </h3>
          <span className="font-mono text-caption text-ash-medium">
            {DESKS.length} real-source desks
          </span>
        </div>
        <ul
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="HeliQuant analysis desks"
        >
          {DESKS.map((desk) => {
            const isEdge = desk.key === EDGE_DESK;
            return (
              <li
                key={desk.key}
                className={[
                  "rounded-card-md border bg-pure-surface p-5 shadow-card transition-colors",
                  isEdge
                    ? "border-chartreuse/60 ring-1 ring-chartreuse/40"
                    : "border-fog-border hover:border-ash-medium",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-midnight-navy">{desk.key}</p>
                  {isEdge && (
                    <span className="shrink-0 rounded-badge bg-chartreuse px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-midnight-navy">
                      validated edge
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-ink">
                  {desk.blurb}
                </p>
              </li>
            );
          })}
        </ul>
      </motion.div>

      {/* ───────────── PART B — the decision pipeline ───────────── */}
      <motion.div {...reveal} className="mt-16">
        <h3 className="font-display text-heading-sm text-midnight-navy">
          The decision pipeline
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-ink">
          Every decision walks the same loop — and learning feeds straight back into
          memory, so the firm compounds context over time.
        </p>

        <div className="mt-7 rounded-card border border-fog-border bg-pure-surface p-6 shadow-card md:p-8">
          <ol
            className="flex flex-wrap items-stretch gap-y-4"
            aria-label="Decision pipeline stages"
          >
            {PIPELINE.map((node, i) => {
              const isLast = i === PIPELINE.length - 1;
              return (
                <li key={node.stage} className="flex items-center">
                  {/* node chip */}
                  <div
                    className={[
                      "flex min-w-[88px] flex-col items-center justify-center rounded-card-sm border px-3 py-2.5 text-center",
                      isLast
                        ? "border-onchain/40 bg-onchain/5"
                        : "border-fog-border bg-ghost-canvas",
                    ].join(" ")}
                  >
                    <span className="font-mono text-[13px] font-medium tracking-tight text-midnight-navy">
                      {node.stage}
                    </span>
                    <span className="mt-0.5 text-[11px] lowercase text-ash-medium">
                      {node.role}
                    </span>
                  </div>

                  {/* connector arrow (between nodes only) */}
                  {!isLast && (
                    <motion.svg
                      aria-hidden="true"
                      width="34"
                      height="12"
                      viewBox="0 0 34 12"
                      fill="none"
                      className="mx-1 shrink-0 text-fog-border"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.4, delay: 0.05 * i }}
                    >
                      <motion.line
                        x1="0"
                        y1="6"
                        x2="26"
                        y2="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.45, delay: 0.05 * i }}
                      />
                      <path
                        d="M26 2.5 32 6 26 9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </motion.svg>
                  )}
                </li>
              );
            })}
          </ol>

          {/* LEARN → RECALL loop-back indicator */}
          <div className="mt-5 flex items-center gap-2 border-t border-fog-border pt-4">
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="shrink-0 text-onchain"
            >
              <path
                d="M16 7a6 6 0 1 0 1.2 3.6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M16 3.5V7h-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-slate-ink">
              <span className="font-medium text-midnight-navy">LEARN</span> loops back
              into <span className="font-medium text-midnight-navy">RECALL</span> —
              every resolved outcome is written to memory and informs the next plan.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ───────────── PART C — deployed contracts ───────────── */}
      <motion.div {...reveal} className="mt-16">
        <h3 className="font-display text-heading-sm text-midnight-navy">
          Deployed on Mantle Sepolia
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-ink">
          ERC-8004 identity registries + a TradingVault, deployed and verified on
          Mantle Sepolia <span className="font-mono text-ash-medium">(chain 5003)</span>.
        </p>

        <div className="mt-6 overflow-hidden rounded-card border border-fog-border bg-pure-surface shadow-card">
          <ul className="divide-y divide-fog-border" aria-label="Deployed contracts">
            {CONTRACTS.map((contract) => (
              <ContractRow key={contract.address} contract={contract} />
            ))}
          </ul>

          {/* featured: first anchored decision */}
          <div className="border-t border-fog-border bg-ghost-canvas px-4 py-3.5">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-ink">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full bg-onchain hq-pulse"
              />
              <span className="font-medium text-midnight-navy">
                First decision anchored:
              </span>
              <a
                href={`${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-onchain underline decoration-onchain/30 underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onchain"
              >
                {truncateAddress(FIRST_ANCHOR.txHash)} ↗
              </a>
              <span className="font-mono text-ash-medium">
                (block {FIRST_ANCHOR.block.toLocaleString()})
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ───────────── PART D — tech stack chips ───────────── */}
      <motion.div {...reveal} className="mt-16">
        <h3 className="font-display text-heading-sm text-midnight-navy">Built with</h3>
        <ul className="mt-5 flex flex-wrap gap-2.5" aria-label="Technology stack">
          {STACK.map((tech) => (
            <li
              key={tech}
              className="rounded-badge border border-fog-border bg-pure-surface px-3 py-1.5 font-mono text-caption text-midnight-navy shadow-badge"
            >
              {tech}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
