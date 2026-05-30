import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

import { Header } from "@/components/header";

interface WhaleProfile {
  address: string;
  pools: string[];
  total_volume_usd: number;
  net_volume_usd: number;
  buy_volume_usd: number;
  sell_volume_usd: number;
  buy_count: number;
  sell_count: number;
  realized_pnl_usd: number;
  avg_buy_price: number;
  avg_sell_price: number;
  first_seen_utc: string | null;
  last_seen_utc: string | null;
  rank_score: number;
  direction_bias: "accumulating" | "distributing" | "neutral";
}

async function getWhales(): Promise<WhaleProfile[]> {
  const filePath = path.join(process.cwd(), "public/data/whale_watchlist.json");
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as WhaleProfile[];
  } catch {
    return [];
  }
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function biasColor(bias: WhaleProfile["direction_bias"]) {
  switch (bias) {
    case "accumulating":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "distributing":
      return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    default:
      return "text-neutral-400 bg-neutral-500/10 border-neutral-500/30";
  }
}

export default async function WhalesPage() {
  const whales = await getWhales();
  const accumulating = whales.filter((w) => w.direction_bias === "accumulating").length;
  const distributing = whales.filter((w) => w.direction_bias === "distributing").length;
  const totalVolume = whales.reduce((sum, w) => sum + w.total_volume_usd, 0);

  return (
    <main className="flex-1">
      <Header />

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
            Smart money watchlist
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Live whale activity on Mantle DEXs
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            Auto-detected from on-chain trade history across top MNT-related pools
            (USDe/WMNT, WMNT/USDT, WETH/WMNT, USDC/WMNT). Wallets ranked by composite
            score combining log-volume, simplified FIFO realized PnL, and trade frequency.
            Updated by `agents/scripts/07_build_whale_watchlist.py`.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label="Tracked wallets" value={whales.length.toString()} />
            <Metric label="Accumulating" value={accumulating.toString()} accent="emerald" />
            <Metric label="Distributing" value={distributing.toString()} accent="rose" />
            <Metric label="Total volume" value={`$${(totalVolume / 1000).toFixed(0)}k`} />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="overflow-hidden rounded-xl border border-neutral-800/60">
            <table className="min-w-full divide-y divide-neutral-800/60 text-sm">
              <thead className="bg-neutral-900/50 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Rank</th>
                  <th className="px-4 py-3 text-left font-medium">Address</th>
                  <th className="px-4 py-3 text-left font-medium">Bias</th>
                  <th className="px-4 py-3 text-right font-medium">Total vol</th>
                  <th className="px-4 py-3 text-right font-medium">Net vol</th>
                  <th className="px-4 py-3 text-right font-medium">Realized PnL</th>
                  <th className="px-4 py-3 text-right font-medium">Trades</th>
                  <th className="px-4 py-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/50">
                {whales.map((w, idx) => (
                  <tr key={w.address} className="transition hover:bg-neutral-900/60">
                    <td className="px-4 py-3 font-mono text-neutral-300">
                      #{idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`https://explorer.mantle.xyz/address/${w.address}`}
                        target="_blank"
                        className="font-mono text-xs text-emerald-300 underline decoration-emerald-700/50 hover:decoration-emerald-300"
                      >
                        {shortAddr(w.address)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide ${biasColor(w.direction_bias)}`}
                      >
                        {w.direction_bias}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-neutral-200">
                      ${w.total_volume_usd.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${w.net_volume_usd >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      ${w.net_volume_usd >= 0 ? "+" : ""}
                      {w.net_volume_usd.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${w.realized_pnl_usd > 0 ? "text-emerald-400" : w.realized_pnl_usd < 0 ? "text-rose-400" : "text-neutral-400"}`}
                    >
                      {w.realized_pnl_usd === 0
                        ? "n/a"
                        : `$${w.realized_pnl_usd > 0 ? "+" : ""}${w.realized_pnl_usd.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">
                      {w.buy_count + w.sell_count}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">
                      {w.rank_score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            Methodology: GeckoTerminal trades API (~24h coverage, free tier), composite
            ranking = log10(volume) + tanh(PnL/$1k) + 0.5 * log10(trade_count). Production
            roadmap: direct RPC scan for 30-90 day history.
          </p>
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose";
}) {
  const valueClass =
    accent === "emerald"
      ? "text-emerald-300"
      : accent === "rose"
        ? "text-rose-300"
        : "text-neutral-100";
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
