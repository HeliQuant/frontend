/**
 * /whales — "THE TIMING TOWER" (Night Garage §6.7)
 *
 * Smart-money wallets on Mantle DEX rendered as an F1 timing tower: position by composite
 * rank score, gap-to-leader, net-volume interval bars, bias as a tire-compound chip,
 * buy/sell sector counts, last pit stop. Geometry encodes the data (doctrine Law 2) — the
 * row IS the telemetry, no cards.
 *
 * HONESTY PLATE: this watchlist is pit-wall CONTEXT, not alpha — investigation showed these
 * are churners/arb bots, not patient holders. The live firm tracks a different grid: the
 * Hyperliquid top-PnL leaderboard, per traded asset, in the cloud.
 */

import { promises as fs } from "fs";
import path from "path";

import GarageNav from "@/components/garage/GarageNav";

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

const fmtUsd = (v: number) =>
  `$${Math.abs(v) >= 1e6 ? `${(Math.abs(v) / 1e6).toFixed(2)}M` : Math.abs(v) >= 1e3 ? `${(Math.abs(v) / 1e3).toFixed(1)}k` : Math.abs(v).toFixed(0)}`;

const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const since = (iso: string | null) => {
  if (!iso) return "—";
  const h = Math.max(0, (Date.now() - new Date(iso).getTime()) / 36e5);
  return h < 1 ? "<1h" : h < 48 ? `${h.toFixed(0)}h` : `${(h / 24).toFixed(0)}d`;
};

// tire-compound chip per bias (F1 coding: each compound a hard color)
function compound(bias: WhaleProfile["direction_bias"]) {
  if (bias === "accumulating") return { label: "ACC", cls: "border-chartreuse text-chartreuse" };
  if (bias === "distributing") return { label: "DST", cls: "border-signal2 text-signal2" };
  return { label: "NEU", cls: "border-bone/40 text-bone/60" };
}

export const dynamic = "force-dynamic";

export default async function WhalesPage() {
  const whales = (await getWhales()).sort((a, b) => b.rank_score - a.rank_score).slice(0, 16);
  const leader = whales[0];
  const maxAbsNet = Math.max(1, ...whales.map((w) => Math.abs(w.net_volume_usd)));

  return (
    <>
      <GarageNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> TELEMETRY · MANTLE DEX · SMART-MONEY GRID
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The timing <span className="text-chartreuse">tower</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Every driver on the Mantle DEX track, ranked by composite score — volume, activity,
            realized PnL. Watch their lines; don&apos;t copy them blind.
          </p>

          {/* honesty plate — what this grid IS and is not */}
          <div className="mt-6 inline-block border-2 border-bone/30 bg-carbon px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
              pit-wall <span className="text-bone">context, not alpha</span> — investigation showed this grid is
              churners &amp; bots, not holders.
              <br />
              the live firm follows a different grid:{" "}
              <span className="text-chartreuse">Hyperliquid top-PnL whales, per asset, in the cloud.</span>
            </p>
          </div>

          {/* ── THE TOWER ── */}
          <div className="mt-10 max-w-4xl">
            {/* column legend — large, geometry is primary content */}
            <div className="grid grid-cols-[44px_1fr_64px] items-end gap-3 border-b-2 border-bone/25 pb-2 sm:grid-cols-[44px_150px_1fr_92px_64px_56px]">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">pos</span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">driver</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">
                net flow ← sell · buy → <span className="text-bone/60">(bar = net DEX volume)</span>
              </span>
              <span className="hidden text-right font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">
                buys·sells
              </span>
              <span className="hidden text-right font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">
                pnl
              </span>
              <span className="text-right font-mono text-[9px] uppercase tracking-[0.2em] text-steel">pit</span>
            </div>

            {whales.length === 0 && (
              <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-steel">
                grid empty — watchlist file not found
              </p>
            )}

            {whales.map((w, i) => {
              const chip = compound(w.direction_bias);
              const gap = leader ? (leader.rank_score - w.rank_score).toFixed(1) : "0.0";
              const frac = Math.abs(w.net_volume_usd) / maxAbsNet;
              const positive = w.net_volume_usd >= 0;
              return (
                <div
                  key={w.address}
                  className="gr-rise grid grid-cols-[44px_1fr_64px] items-center gap-3 border-b border-bone/10 py-3 transition-colors hover:bg-carbon sm:grid-cols-[44px_150px_1fr_92px_64px_56px]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* position box — leader gets the chartreuse plate */}
                  <span
                    className={
                      i === 0
                        ? "gr-shadow-bone grid h-9 w-9 place-items-center border-2 border-bone bg-chartreuse font-display text-lg font-extrabold text-pitch"
                        : "grid h-9 w-9 place-items-center border-2 border-bone/25 font-display text-lg font-bold text-bone/70"
                    }
                  >
                    {i + 1}
                  </span>

                  {/* driver: addr + compound chip + gap-to-leader */}
                  <span className="hidden flex-col gap-1 sm:flex">
                    <a
                      href={`https://mantlescan.xyz/address/${w.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[12px] tracking-wide text-bone/85 hover:text-chartreuse"
                    >
                      {shortAddr(w.address)}
                    </a>
                    <span className="flex items-center gap-2">
                      <span className={`border px-1.5 py-px font-mono text-[8px] font-bold tracking-[0.14em] ${chip.cls}`}>
                        {chip.label}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.12em] text-steel">
                        {i === 0 ? "LEADER" : `+${gap}`}
                      </span>
                    </span>
                  </span>

                  {/* net-flow interval bar — length = |net volume|, side = direction */}
                  <span className="relative block h-7 border border-bone/15 bg-pitch">
                    <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-bone/25" />
                    <span
                      className={
                        positive
                          ? "absolute inset-y-1 left-1/2 bg-chartreuse/80"
                          : "absolute inset-y-1 right-1/2 bg-signal2/80"
                      }
                      style={{ width: `${Math.max(2, frac * 48)}%` }}
                    />
                    <span
                      className={`absolute inset-y-0 flex items-center font-mono text-[10px] tracking-wide ${
                        positive ? "left-[52%] pl-1.5 text-chartreuse" : "right-[52%] pr-1.5 text-signal2"
                      }`}
                    >
                      {positive ? "+" : "−"}
                      {fmtUsd(w.net_volume_usd)}
                    </span>
                  </span>

                  {/* sectors: buys · sells */}
                  <span className="hidden text-right font-mono text-[11px] tracking-wide text-bone/60 sm:block">
                    {w.buy_count}·{w.sell_count}
                  </span>

                  {/* realized pnl (single-pool round-trips only — the honest measure) */}
                  <span
                    className={`hidden text-right font-mono text-[11px] tracking-wide sm:block ${
                      w.realized_pnl_usd > 0 ? "text-chartreuse" : w.realized_pnl_usd < 0 ? "text-signal2" : "text-steel"
                    }`}
                  >
                    {w.realized_pnl_usd === 0 ? "—" : `${w.realized_pnl_usd > 0 ? "+" : "−"}${fmtUsd(w.realized_pnl_usd)}`}
                  </span>

                  {/* last pit stop */}
                  <span className="text-right font-mono text-[11px] tracking-wide text-steel">
                    {since(w.last_seen_utc)}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-6 max-w-4xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
            pnl counts single-pool round-trips only (cross-pool figures were artifacts — we dropped them) ·
            source: Mantle DEX swap events, top pools · refreshed by the local telemetry rig
          </p>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE TIMING TOWER · context feeds the desks — the dyno decides
          </p>
        </div>
      </footer>
    </>
  );
}
