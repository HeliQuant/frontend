import Link from "next/link";

import { Header } from "@/components/header";

const STRATEGY_TABLE = [
  {
    name: "Mean Reversion",
    state: "ACTIVE",
    trades: 9,
    wins: 7,
    winRate: "77.78%",
    totalPnl: "+$12.30",
    role: "Workhorse — fades RSI extremes when regime classifies Ranging.",
  },
  {
    name: "Momentum Breakout",
    state: "PENDING",
    trades: 0,
    wins: 0,
    winRate: "n/a",
    totalPnl: "$0",
    role: "Auto-disabled by Strategy Lifecycle Manager during sideways/bear MNT phase. Re-activates when 30-day macro trend confirms.",
  },
  {
    name: "Defensive (kill-switch)",
    state: "STANDBY",
    trades: 0,
    wins: 0,
    winRate: "n/a",
    totalPnl: "$0",
    role: "Triggers on High_Volatility regime or rugpull veto. Rotates principal to stablecoin yield.",
  },
];

const SOURCES = [
  {
    name: "Allora Network",
    description:
      "Decentralised AI inference — pulls BTC 8h price prediction (Topic 14) signed via EIP-712.",
    role: "Macro filter",
    status: "Live on Mantle (first relayer submission tx 0x0d7c...c469)",
  },
  {
    name: "On-chain Whale Flow",
    description:
      "Auto-detected smart-money wallets from Mantle DEX swap events across 5 top MNT pools.",
    role: "Smart money confirmation",
    status: "GeckoTerminal indexer, top 20 ranked by composite score",
  },
  {
    name: "Sentiment proxy",
    description:
      "Composite price/volume/trending sentiment from CoinGecko free API.",
    role: "Crowd/momentum side-check",
    status: "Live, 100% data coverage",
  },
  {
    name: "Rugpull screener",
    description:
      "GoPlus token security for the traded asset. Hard veto on honeypot or extreme holder concentration.",
    role: "Safety layer",
    status: "Hard veto, sub-second response",
  },
];

const ITERATIONS = [
  { v: "V0", desc: "Baseline replay (raw multi-strategy)", winRate: "49.02%", roi: "-5.27%" },
  { v: "V1", desc: "+Defensive priority for HighVol regime", winRate: "52.78%", roi: "-3.47%" },
  { v: "V2", desc: "+ADX 35 + volume confirmation on momentum", winRate: "61.11%", roi: "-1.31%" },
  { v: "V3", desc: "+EMA trend stack + RSI non-extreme", winRate: "63.64%", roi: "-0.66%" },
  { v: "V4", desc: "+Strategy Lifecycle Manager (PENDING fallback)", winRate: "63.64%", roi: "-0.66%" },
  { v: "V5", desc: "Momentum disabled per MNT bear context", winRate: "77.78%", roi: "+1.23%" },
];

export default function HeliQuantFirmPage() {
  return (
    <main className="flex-1">
      <Header />

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
                Firm
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
                HELIQUANT
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300">
                Autonomous adaptive trading firm. Currently configured for MNT/USDC on
                Mantle DEX with Strategy Lifecycle Manager keeping Momentum dormant
                during the asset&apos;s bear phase.
              </p>
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
              Hire HELIQUANT
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Win rate" value="77.78%" caption="9 of last 9 setups" />
            <Stat label="ROI 90d" value="+1.23%" caption="vs buy-and-hold -7%" />
            <Stat label="Profit factor" value="1.70" caption="gains / losses" />
            <Stat label="Max drawdown" value="1.75%" caption="V5 production" />
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-xl font-semibold md:text-2xl">Strategy roster</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800/60">
            <table className="min-w-full divide-y divide-neutral-800/60 text-sm">
              <thead className="bg-neutral-900/50 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Strategy</th>
                  <th className="px-4 py-3 text-left font-medium">State</th>
                  <th className="px-4 py-3 text-right font-medium">Trades</th>
                  <th className="px-4 py-3 text-right font-medium">Win rate</th>
                  <th className="px-4 py-3 text-right font-medium">PnL (90d)</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                {STRATEGY_TABLE.map((s) => (
                  <tr key={s.name}>
                    <td className="px-4 py-3 font-medium text-neutral-100">{s.name}</td>
                    <td className="px-4 py-3">
                      <StateBadge state={s.state} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-300">
                      {s.trades}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      {s.winRate}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-200">
                      {s.totalPnl}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{s.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-xl font-semibold md:text-2xl">
            Intelligence sources
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SOURCES.map((src) => (
              <div
                key={src.name}
                className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-300">{src.name}</p>
                  <span className="text-[0.65rem] uppercase tracking-wide text-neutral-500">
                    {src.role}
                  </span>
                </div>
                <p className="mt-3 text-sm text-neutral-300">{src.description}</p>
                <p className="mt-3 text-xs text-neutral-500">{src.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-xl font-semibold md:text-2xl">Iteration history</h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">
            Data-driven tuning across 6 architecture revisions, all replayed against the
            same 90-day MNT/USD dataset.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800/60">
            <table className="min-w-full divide-y divide-neutral-800/60 text-sm">
              <thead className="bg-neutral-900/50 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Version</th>
                  <th className="px-4 py-3 text-left font-medium">Change</th>
                  <th className="px-4 py-3 text-right font-medium">Win rate</th>
                  <th className="px-4 py-3 text-right font-medium">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                {ITERATIONS.map((it, idx) => (
                  <tr
                    key={it.v}
                    className={idx === ITERATIONS.length - 1 ? "bg-emerald-900/10" : ""}
                  >
                    <td className="px-4 py-3 font-mono text-emerald-300">{it.v}</td>
                    <td className="px-4 py-3 text-neutral-300">{it.desc}</td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-200">
                      {it.winRate}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${it.roi.startsWith("+") ? "text-emerald-300" : "text-rose-300"}`}
                    >
                      {it.roi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-emerald-300">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{caption}</p>
    </div>
  );
}

function StateBadge({ state }: { state: string }) {
  const palette =
    state === "ACTIVE"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
      : state === "PENDING"
        ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
        : "text-neutral-300 bg-neutral-500/10 border-neutral-500/30";
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide ${palette}`}
    >
      {state}
    </span>
  );
}
