import { Header } from "@/components/header";

const ASSETS = [
  {
    symbol: "MNT",
    name: "Mantle",
    role: "Native gas + governance token",
    trades: 13,
    positive: 9,
    winRate: "69%",
    roi: "+1.36%",
    roiClass: "text-emerald-300",
    note: "Hero asset — V5 production tuning. Mean reversion thrives in MNT's sideways window.",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    role: "Major benchmark + Allora's primary topic",
    trades: 21,
    positive: 8,
    winRate: "38%",
    roi: "-4.42%",
    roiClass: "text-rose-300",
    note: "Trending dominant; MNT-tuned mean reversion fades the trend and bleeds. Per-asset tuning required.",
  },
  {
    symbol: "mETH",
    name: "Mantle Staked Ether",
    role: "Mantle ecosystem — ETH LSD",
    trades: 19,
    positive: 6,
    winRate: "32%",
    roi: "-6.10%",
    roiClass: "text-rose-300",
    note: "ETH-correlated. Similar trending profile to BTC; needs same per-asset calibration.",
  },
  {
    symbol: "cmETH",
    name: "Mantle Restaked ETH",
    role: "Mantle ecosystem — compounding mETH",
    trades: 17,
    positive: 5,
    winRate: "29%",
    roi: "-4.64%",
    roiClass: "text-rose-300",
    note: "Follows mETH price action with restaking yield drift.",
  },
  {
    symbol: "fBTC",
    name: "Function FBTC",
    role: "Mantle ecosystem — wrapped BTC",
    trades: 16,
    positive: 5,
    winRate: "31%",
    roi: "-3.34%",
    roiClass: "text-rose-300",
    note: "BTC-pegged with some basis fluctuation. Closest to BTC behaviour.",
  },
  {
    symbol: "USDe",
    name: "Ethena USDe",
    role: "Mantle-integrated synthetic stable",
    trades: 1,
    positive: 0,
    winRate: "—",
    roi: "-0.19%",
    roiClass: "text-neutral-400",
    note: "Stablecoin — almost no movement, single trade fired. Working as designed (stable = no signal).",
  },
];

export default function AssetsPage() {
  return (
    <main className="flex-1">
      <Header />

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
            Multi-asset replay
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Cross-asset architecture validation
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            HELIQUANT&apos;s pipeline supports any CoinGecko-listed asset via{" "}
            <code className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[0.75rem] text-neutral-200">
              scripts/multi_asset.py
            </code>
            . Below: 90-day historical replay across MNT plus four Mantle-ecosystem
            assets plus BTC as benchmark. All runs share the same V5 architecture
            (regime classifier + lifecycle manager + strategy router). Strategy
            parameters are MNT-tuned; per-asset calibration is the honest next step.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="overflow-hidden rounded-xl border border-neutral-800/60">
            <table className="min-w-full divide-y divide-neutral-800/60 text-sm">
              <thead className="bg-neutral-900/50 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Asset</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-right font-medium">Trades</th>
                  <th className="px-4 py-3 text-right font-medium">Positive</th>
                  <th className="px-4 py-3 text-right font-medium">Win rate</th>
                  <th className="px-4 py-3 text-right font-medium">ROI 90d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                {ASSETS.map((a) => (
                  <tr key={a.symbol}>
                    <td className="px-4 py-3 align-top">
                      <p className="font-mono text-base font-semibold text-emerald-300">
                        {a.symbol}
                      </p>
                      <p className="text-xs text-neutral-500">{a.name}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-neutral-400">
                      {a.role}
                      <p className="mt-1 text-[0.7rem] text-neutral-500">{a.note}</p>
                    </td>
                    <td className="px-4 py-3 text-right align-top font-mono text-neutral-300">
                      {a.trades}
                    </td>
                    <td className="px-4 py-3 text-right align-top font-mono text-neutral-300">
                      {a.positive}
                    </td>
                    <td className="px-4 py-3 text-right align-top font-mono text-neutral-200">
                      {a.winRate}
                    </td>
                    <td
                      className={`px-4 py-3 text-right align-top font-mono ${a.roiClass}`}
                    >
                      {a.roi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-700/10 p-5">
              <p className="text-sm font-semibold text-emerald-200">
                What this shows
              </p>
              <p className="mt-2 text-sm text-emerald-100/90">
                Architecture (regime classifier, lifecycle manager, strategy router,
                multi-source intelligence) is <strong>asset-agnostic</strong>. Same
                code path runs every asset above with zero modification — just point
                at a different CoinGecko coin id.
              </p>
            </div>
            <div className="rounded-xl border border-amber-700/40 bg-amber-700/10 p-5">
              <p className="text-sm font-semibold text-amber-200">
                What this also shows (honest)
              </p>
              <p className="mt-2 text-sm text-amber-100/90">
                Strategy <strong>parameters</strong> (RSI 25/75, ADX p60, ATR multipliers)
                are MNT-tuned. BTC + mETH-family had trending profiles where mean
                reversion fades cost capital. Per-asset hyperparameter optimisation is
                the Phase 2 engineering roadmap — exactly what real quant funds invest in.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
