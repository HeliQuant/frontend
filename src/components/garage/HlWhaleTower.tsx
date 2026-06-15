"use client";

/**
 * HlWhaleTower — THE TIMING TOWER, primary section (Night Garage §6.7).
 *
 * The REAL per-asset smart-money grid the firm acts on: the Hyperliquid top-PnL leaderboard,
 * read LIVE per traded asset (BTC/ETH/SOL/HYPE/SUI — MNT is not on Hyperliquid). One row per
 * asset, ranked by net conviction (net_usd). Geometry encodes the data (doctrine Law 2):
 *   · position box        = rank by net conviction (leader = chartreuse plate)
 *   · long-vs-short bar    = the split of holders (long count green / short count orange)
 *   · net-notional bar     = centered interval bar, length ∝ |net_usd|, side = LONG/SHORT
 *   · stance chip          = tire-compound chip (LONG / SHORT / NEUTRAL)
 *   · "N hold" + avg ROE   = telemetry; the `brief` reveals on row expand
 *
 * Honest by construction: when none of the top-N tracked traders hold an asset
 * (whales_in_position === 0) the row says so plainly — no fabricated conviction. Polls every
 * ~20s like the Tuning Bay; the LiveBadge shows the last good read.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { fetchWhales, type WhaleAsset, type WhalesResponse } from "@/lib/campaign";
import LiveBadge from "@/components/garage/LiveBadge";

const POLL_MS = 20000;

const fmtUsd = (v: number) => {
  const a = Math.abs(v);
  return `$${a >= 1e6 ? `${(a / 1e6).toFixed(2)}m` : a >= 1e3 ? `${(a / 1e3).toFixed(1)}k` : a.toFixed(0)}`;
};

// tire-compound chip per stance (F1 coding: each compound a hard color)
function stanceChip(s: WhaleAsset["stance"]) {
  if (s === "LONG") return { label: "LONG", cls: "border-chartreuse text-chartreuse" };
  if (s === "SHORT") return { label: "SHORT", cls: "border-signal2 text-signal2" };
  return { label: "NEUTRAL", cls: "border-bone/40 text-bone/60" };
}

function hhmm(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }).slice(0, 5);
}

export default function HlWhaleTower() {
  const [data, setData] = useState<WhalesResponse | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);
  const [lastGood, setLastGood] = useState<Date | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const r = await fetchWhales();
      if (!alive) return;
      setReached(Boolean(r));
      if (r) {
        setData(r);
        setLastGood(new Date());
      }
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // rank by net conviction (|net_usd| desc); assets nobody holds sink to the bottom but still show
  const rows = useMemo(() => {
    const a = [...(data?.assets ?? [])];
    return a.sort((x, y) => {
      if (x.whales_in_position === 0 && y.whales_in_position !== 0) return 1;
      if (y.whales_in_position === 0 && x.whales_in_position !== 0) return -1;
      return Math.abs(y.net_usd) - Math.abs(x.net_usd);
    });
  }, [data]);

  const maxAbsNet = useMemo(() => Math.max(1, ...rows.map((r) => Math.abs(r.net_usd))), [rows]);
  const leaderKey = rows.find((r) => r.whales_in_position > 0)?.asset;

  return (
    <div>
      {/* section head + proof-of-life */}
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-2 border-bone/15 pb-3">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-4xl font-extrabold leading-none text-bone/15">01</span>
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">
              Live grid · Hyperliquid top-PnL whales
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
              the real per-asset smart-money the firm acts on · {data?.source ?? "hyperliquid"} ·{" "}
              {reached === false ? "desk unreachable, retrying" : "per traded asset"}
            </p>
          </div>
        </div>
        <LiveBadge at={lastGood} />
      </div>

      {/* column legend — geometry is the primary content */}
      <div className="grid grid-cols-[40px_1fr_88px] items-end gap-3 border-b-2 border-bone/25 pb-2 sm:grid-cols-[40px_120px_1fr_140px_96px_64px]">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">pos</span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">asset</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">
          net notional ← short · long → <span className="text-bone/60">(bar = |net $|)</span>
        </span>
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">
          long·short split
        </span>
        <span className="hidden text-right font-mono text-[9px] uppercase tracking-[0.2em] text-steel sm:block">
          hold · roe
        </span>
        <span className="text-right font-mono text-[9px] uppercase tracking-[0.2em] text-steel">stance</span>
      </div>

      {/* loading / unreachable / empty */}
      {data == null && reached === false && (
        <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-steel">
          grid unreachable — the firm runs on Railway; retrying every 20s
        </p>
      )}
      {data == null && reached !== false && (
        <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-steel">reading the leaderboard…</p>
      )}
      {data != null && rows.length === 0 && (
        <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-steel">no traded assets reported</p>
      )}

      {/* ── THE TOWER ── one row per asset */}
      {rows.map((w, i) => {
        const chip = stanceChip(w.stance);
        const held = w.whales_in_position > 0;
        const isLeader = held && w.asset === leaderKey;
        const frac = Math.abs(w.net_usd) / maxAbsNet;
        const positive = w.net_usd >= 0;
        const totSide = Math.max(1, w.long + w.short);
        const longPct = (w.long / totSide) * 100;
        const isOpen = open === w.asset;

        return (
          <div
            key={w.asset}
            className="gr-rise border-b border-bone/10"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : w.asset)}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[40px_1fr_88px] items-center gap-3 py-3 text-left transition-colors hover:bg-carbon sm:grid-cols-[40px_120px_1fr_140px_96px_64px]"
            >
              {/* position box — leader gets the chartreuse plate */}
              <span
                className={
                  isLeader
                    ? "gr-shadow-bone grid h-9 w-9 place-items-center border-2 border-bone bg-chartreuse font-display text-lg font-extrabold text-pitch"
                    : "grid h-9 w-9 place-items-center border-2 border-bone/25 font-display text-lg font-bold text-bone/70"
                }
              >
                {i + 1}
              </span>

              {/* asset ticker + link to Hyperliquid */}
              <span className="hidden flex-col gap-1 sm:flex">
                <a
                  href={`https://app.hyperliquid.xyz/trade/${encodeURIComponent(w.asset)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-display text-2xl font-extrabold uppercase leading-none text-bone hover:text-chartreuse"
                >
                  {w.asset}
                </a>
                <span className="font-mono text-[9px] tracking-[0.12em] text-steel">
                  {held ? (isLeader ? "TOP CONVICTION" : `${w.n_tracked} tracked`) : "none in position"}
                </span>
              </span>

              {/* net-notional interval bar — length = |net $|, side = LONG/SHORT */}
              <span className="relative block h-7 border border-bone/15 bg-pitch">
                <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-bone/25" />
                {held && (
                  <span
                    className={
                      positive
                        ? "absolute inset-y-1 left-1/2 bg-chartreuse/80"
                        : "absolute inset-y-1 right-1/2 bg-signal2/80"
                    }
                    style={{ width: `${Math.max(2, frac * 48)}%` }}
                  />
                )}
                <span
                  className={`absolute inset-y-0 flex items-center font-mono text-[10px] tracking-wide ${
                    !held ? "left-3 text-steel" : positive ? "left-[52%] pl-1.5 text-chartreuse" : "right-[52%] pr-1.5 text-signal2"
                  }`}
                >
                  {held ? `${positive ? "+" : "−"}${fmtUsd(w.net_usd)}` : "flat"}
                </span>
              </span>

              {/* long·short split bar (count split): green = long, orange = short */}
              <span className="hidden items-center gap-2 sm:flex">
                <span className="relative block h-3 flex-1 overflow-hidden border border-bone/20 bg-pitch">
                  {held ? (
                    <>
                      <span className="absolute inset-y-0 left-0 bg-chartreuse/75" style={{ width: `${longPct}%` }} />
                      <span className="absolute inset-y-0 right-0 bg-signal2/70" style={{ width: `${100 - longPct}%` }} />
                    </>
                  ) : (
                    <span className="absolute inset-0 bg-bone/5" />
                  )}
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-[10px] tracking-wide text-bone/55">
                  {held ? `${w.long}·${w.short}` : "—"}
                </span>
              </span>

              {/* hold count · avg ROE */}
              <span className="hidden flex-col items-end gap-0.5 text-right sm:flex">
                <span className="font-mono text-[11px] tracking-wide text-bone/70">
                  {held ? `${w.whales_in_position} hold` : "0 hold"}
                </span>
                <span
                  className={`font-mono text-[10px] tracking-wide ${
                    w.avg_roe_pct == null ? "text-steel" : w.avg_roe_pct >= 0 ? "text-chartreuse" : "text-signal2"
                  }`}
                >
                  {w.avg_roe_pct == null ? "— roe" : `${w.avg_roe_pct >= 0 ? "+" : ""}${w.avg_roe_pct.toFixed(1)}%`}
                </span>
              </span>

              {/* stance compound chip */}
              <span className="flex justify-end">
                <span className={`border px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-[0.14em] ${chip.cls}`}>
                  {chip.label}
                </span>
              </span>
            </button>

            {/* expand: the brief + honest empty state */}
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <p className="border-l-2 border-bone/25 bg-carbon px-4 py-3 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-bone/70">
                  {held
                    ? w.brief || `${w.long} long · ${w.short} short across ${w.n_tracked} tracked top-PnL traders.`
                    : `none of the top-${w.n_tracked || 30} HL traders hold ${w.asset} right now — no conviction to read.`}
                  {held && (
                    <span className="mt-1 block text-steel">
                      long {fmtUsd(w.long_usd)} · short {fmtUsd(w.short_usd)} · net {positive ? "+" : "−"}
                      {fmtUsd(w.net_usd)}
                    </span>
                  )}
                </p>
                {held && w.whales && w.whales.length > 0 && (
                  <div className="border-l-2 border-bone/25 bg-carbon px-4 pb-3">
                    <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-steel">
                      the actual wallets · top-PnL HL traders holding {w.asset} · tap to verify ↗
                    </p>
                    <div className="flex flex-col gap-1">
                      {w.whales.map((h) => (
                        <a
                          key={h.address}
                          href={`https://hypurrscan.io/address/${h.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border border-bone/10 px-2 py-1 font-mono text-[10px] transition-colors hover:border-chartreuse/50 hover:bg-pitch"
                        >
                          <span className="truncate text-bone/70">
                            {h.address.slice(0, 6)}…{h.address.slice(-4)}
                          </span>
                          <span className={h.side === "LONG" ? "text-chartreuse" : "text-signal2"}>{h.side}</span>
                          <span className="text-bone/55">{fmtUsd(h.notional_usd)}</span>
                          <span className={h.roe_pct >= 0 ? "text-chartreuse" : "text-signal2"}>
                            {h.roe_pct >= 0 ? "+" : ""}
                            {h.roe_pct.toFixed(0)}%
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        );
      })}

      <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
        rows ranked by net conviction (|net $|) · long/short split = holder count · click a row for the read ·
        feed asof {hhmm(data?.asof)} UTC · MNT is not on Hyperliquid (see the Mantle DEX snapshot below)
      </p>
    </div>
  );
}
