/**
 * /whales — "THE TIMING TOWER" (Night Garage §6.7)
 *
 * PRIMARY (live): the Hyperliquid top-PnL whale grid, per traded asset — the REAL per-asset
 * smart-money the firm acts on (BTC/ETH/SOL/HYPE/SUI). Rendered by <HlWhaleTower/> (client,
 * polls /whales every 20s). Geometry encodes the data (doctrine Law 2) — rows, not cards.
 *
 * SECONDARY (context, not live): a Mantle DEX flow SNAPSHOT (May-29 capture). Investigation
 * showed these wallets are churners/arb bots, not patient holders — so it's context for the
 * desks, NOT alpha, and NOT live. Kept, but clearly demoted below the live grid.
 */

import { promises as fs } from "fs";
import path from "path";

import AppNav from "@/components/garage/AppNav";
import HlWhaleTower from "@/components/garage/HlWhaleTower";

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

async function getMantleSnapshot(): Promise<WhaleProfile[]> {
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
  const snapshot = (await getMantleSnapshot()).sort((a, b) => b.rank_score - a.rank_score).slice(0, 12);
  const leader = snapshot[0];
  const maxAbsNet = Math.max(1, ...snapshot.map((w) => Math.abs(w.net_volume_usd)));

  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> TELEMETRY · LIVE SMART-MONEY GRID · PER TRADED ASSET
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The timing <span className="text-chartreuse">tower</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Track the other drivers on the track. The firm reads the{" "}
            <span className="text-bone">Hyperliquid top-PnL leaderboard per traded asset</span> — live —
            and watches who&apos;s long, who&apos;s short, and where the conviction sits. Watch their lines;
            don&apos;t copy them blind.
          </p>

          {/* honesty plate — PRIMARY (live HL) vs SECONDARY (Mantle DEX snapshot) */}
          <div className="mt-6 inline-block border-2 border-bone/30 bg-carbon px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
              <span className="text-chartreuse">primary · live</span> — Hyperliquid top-PnL whales per traded asset
              (the real per-asset smart-money the firm acts on).
              <br />
              <span className="text-bone/70">secondary · snapshot</span> — Mantle DEX flow, a dated capture
              (context / churners, <span className="text-bone">not alpha, not live</span>).
            </p>
          </div>

          {/* ═══════════ PRIMARY · LIVE HYPERLIQUID GRID ═══════════ */}
          <div className="mt-12 max-w-4xl">
            <HlWhaleTower />
          </div>
        </section>

        {/* hazard seam → secondary, demoted Mantle DEX snapshot */}
        <div aria-hidden className="gr-hazard mt-16 h-[12px] opacity-80" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-12 sm:px-10 xl:px-4">
          <div className="max-w-4xl">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-2 border-bone/15 pb-3">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl font-extrabold leading-none text-bone/15">02</span>
                <div>
                  <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone/80">
                    Mantle DEX flow · snapshot
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    context, not live — a dated capture of Mantle DEX swap flow
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 border border-bone/20 bg-pitch px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
                <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-steel" /> SNAPSHOT · NOT LIVE
              </span>
            </div>

            <div className="mb-5 inline-block border-l-2 border-bone/30 bg-carbon px-4 py-2.5">
              <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
                pit-wall <span className="text-bone">context, not alpha</span> — investigation showed this grid is
                churners &amp; bots, not holders. MNT isn&apos;t on Hyperliquid, so this is the only Mantle-native
                flow read — kept as <span className="text-bone">desk context</span> only.
              </p>
            </div>

            {/* column legend */}
            <div className="grid grid-cols-[44px_1fr_64px] items-end gap-3 border-b-2 border-bone/25 pb-2 sm:grid-cols-[44px_150px_1fr_92px_64px_56px]">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">pos</span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">wallet</span>
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

            {snapshot.length === 0 && (
              <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-steel">
                snapshot empty — watchlist file not found
              </p>
            )}

            {snapshot.map((w, i) => {
              const chip = compound(w.direction_bias);
              const gap = leader ? (leader.rank_score - w.rank_score).toFixed(1) : "0.0";
              const frac = Math.abs(w.net_volume_usd) / maxAbsNet;
              const positive = w.net_volume_usd >= 0;
              return (
                <div
                  key={w.address}
                  className="gr-rise grid grid-cols-[44px_1fr_64px] items-center gap-3 border-b border-bone/10 py-3 opacity-80 transition-colors hover:bg-carbon hover:opacity-100 sm:grid-cols-[44px_150px_1fr_92px_64px_56px]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* position box — leader gets the bone plate (muted: this is context, not the live leader) */}
                  <span
                    className={
                      i === 0
                        ? "gr-shadow-bone grid h-9 w-9 place-items-center border-2 border-bone bg-bone/90 font-display text-lg font-extrabold text-pitch"
                        : "grid h-9 w-9 place-items-center border-2 border-bone/25 font-display text-lg font-bold text-bone/70"
                    }
                  >
                    {i + 1}
                  </span>

                  {/* wallet: addr + compound chip + gap-to-leader */}
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

            <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
              snapshot · not live · pnl counts single-pool round-trips only (cross-pool figures were artifacts — we
              dropped them) · source: Mantle DEX swap events, top pools · captured by the local telemetry rig
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE TIMING TOWER · live Hyperliquid grid up top — Mantle DEX is dated context below
          </p>
        </div>
      </footer>
    </>
  );
}
