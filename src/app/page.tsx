import Link from "next/link";

import { Header } from "@/components/header";
import {
  ALLORA_RELAY_TX,
  DEPLOYED_CONTRACTS,
  MANTLESCAN_BASE,
} from "@/lib/contracts";

export const dynamic = "force-dynamic";

const HERO_METRICS = [
  { label: "Win rate (MNT 90d)", value: "77.78%", caption: "9 trades / 7 wins" },
  { label: "ROI (90d MNT replay)", value: "+1.23%", caption: "vs buy-and-hold -7%" },
  { label: "Outperformance", value: "+8.23pp", caption: "during MNT bear phase" },
  { label: "Profit factor", value: "1.70", caption: "max drawdown 1.75%" },
];

const LAYERS = [
  {
    label: "Layer 1 — Regime",
    body:
      "Deterministic rules detect current market state; XGBoost forecasts t+4h regime; trade only at conf >= 0.65.",
    accent: "from-emerald-500/20",
  },
  {
    label: "Layer 2 — Intelligence",
    body:
      "Four independent signals vote: Allora decentralised AI, Mantle on-chain whale flow, price/volume sentiment, GoPlus safety veto.",
    accent: "from-sky-500/20",
  },
  {
    label: "Layer 3 — Reconciliation",
    body:
      "Strategy decision and source-vote must agree. Hard veto for safety. Position sized by combined conviction.",
    accent: "from-violet-500/20",
  },
];

const CONTRACTS: { label: string; address: string }[] = [
  { label: "IdentityRegistry (ERC-8004)", address: DEPLOYED_CONTRACTS.identityRegistry },
  { label: "ReputationRegistry (ERC-8004)", address: DEPLOYED_CONTRACTS.reputationRegistry },
  { label: "ValidationRegistry (ERC-8004)", address: DEPLOYED_CONTRACTS.validationRegistry },
  { label: "AlloraConsumer (EIP-712)", address: DEPLOYED_CONTRACTS.alloraConsumer },
  { label: "TradingVault", address: DEPLOYED_CONTRACTS.tradingVault },
  { label: "JobManager (ERC-8183)", address: DEPLOYED_CONTRACTS.jobManager },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      <Header />

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
            Mantle Turing Test Hackathon 2026 · Track 1 AI Trading &amp; Strategy
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            See everything.
            <span className="text-neutral-400"> Trade with </span>
            discipline.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg">
            HELIQUANT is an autonomous multi-source intelligence trading firm native to Mantle.
            Like Helios who sees all from the sky, it aggregates four signal layers
            (decentralized AI, on-chain whale flow, sentiment, safety veto) and executes with
            quant-grade discipline -- verifiable on-chain via ERC-8004 reputation and
            ERC-8183 job escrow.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HERO_METRICS.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4"
              >
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  {m.label}
                </p>
                <p className="mt-2 font-mono text-2xl font-semibold text-emerald-300">
                  {m.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{m.caption}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            Source: historical replay over 90 days hourly MNT/USD data with realistic
            execution costs (0.10% per swap), strategy lifecycle manager, mean-reversion
            driving the alpha during MNT bear phase. Production scripts in
            <code className="ml-1 rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[0.7rem] text-neutral-300">
              agents/scripts/10_historical_replay.py
            </code>
            .
          </p>
        </div>
      </section>

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            How HELIQUANT decides
          </p>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            A three-layer decision pipeline
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            Every trade decision walks through three gates. Strategy can only fire when
            the regime classifier, multi-source vote, and reconciliation all agree.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {LAYERS.map((layer) => (
              <div
                key={layer.label}
                className={`relative overflow-hidden rounded-2xl border border-neutral-800/60 bg-gradient-to-br ${layer.accent} via-neutral-950/0 to-neutral-950 p-6`}
              >
                <p className="text-sm font-semibold text-emerald-300">
                  {layer.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  {layer.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Live on Mantle Sepolia
          </p>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            Six contracts deployed and verified
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            All HELIQUANT infrastructure is live on Mantle Sepolia, source code verified on
            Mantlescan. HELIQUANT is also the first Allora prediction consumer deployed on
            Mantle -- extending the decentralised AI inference layer to the ecosystem.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {CONTRACTS.map((c) => (
              <Link
                key={c.address}
                href={`${MANTLESCAN_BASE}/${c.address}`}
                target="_blank"
                className="group flex items-center justify-between rounded-xl border border-neutral-800/60 bg-neutral-900/40 p-4 transition hover:border-emerald-600/40 hover:bg-neutral-900/70"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-100">{c.label}</p>
                  <p className="mt-1 font-mono text-xs text-neutral-400 group-hover:text-emerald-300">
                    {c.address}
                  </p>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-emerald-300">
                  Mantlescan
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-emerald-700/40 bg-emerald-700/10 p-4">
            <p className="text-sm text-emerald-200">
              <span className="font-semibold">First Allora-on-Mantle submission:</span>{" "}
              <Link
                href={ALLORA_RELAY_TX}
                target="_blank"
                className="underline decoration-emerald-500/40 hover:decoration-emerald-200"
              >
                relayer tx 0x0d7c...c469
              </Link>{" "}
              -- BTC 8h price prediction signed, submitted, queryable on-chain via
              AlloraConsumer.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-800/60 bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>
            HELIQUANT · Mantle Turing Test Hackathon 2026 · Track 1
          </p>
          <p>
            Iteration story: V0 49% to V5 77.78% win rate. Honest, data-driven, on-chain
            auditable.
          </p>
        </div>
      </footer>
    </main>
  );
}
