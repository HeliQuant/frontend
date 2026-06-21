"use client";

/**
 * CampaignView — "THE GRID" (Night Garage · live-trading floor), parameterized by engine.
 *
 * Each open position is a race lane from its STOP (left) to its TARGET (right); the car = the live
 * price. Used twice: /campaign (mode="owner" → pinned to the Owner showcase engine, public) and
 * /trade (mode="user" → reads YOUR connected local engine).
 */

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchCampaign, laneFrac, venueBadge, type CampaignStatus, type OpenPosition } from "@/lib/campaign";
import AppNav from "@/components/garage/AppNav";

const POLL_MS = 20000;

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  return n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : n >= 1 ? n.toFixed(2) : n.toFixed(4);
}

function mmss(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, Math.round(s - m * 60));
  return m + ":" + (sec < 10 ? "0" + sec : "" + sec);
}

function Lane({ p }: { p: OpenPosition }) {
  const frac = laneFrac(p);
  const up = (p.upnl_pct ?? 0) >= 0;
  const carColor = up ? "var(--color-chartreuse)" : "var(--color-signal2)";
  return (
    <div className="border-b border-bone/10 py-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="font-display text-lg font-extrabold uppercase tracking-wide text-bone">{p.asset}</span>
          <span className={`border px-1.5 py-px font-mono text-[9px] font-bold tracking-[0.14em] ${p.dir === "LONG" ? "border-chartreuse text-chartreuse" : "border-bone/45 text-bone/70"}`}>
            {p.dir}
          </span>
          {(() => { const v = venueBadge(p.venue); return (
            <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${v.cls}`}>{v.label}</span>
          ); })()}
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-steel">
            {p.tier} · net {p.votes > 0 ? "+" : ""}{p.votes}
          </span>
          {p.horizon_h != null && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone/45">
              · ⏱ {(p.held_h ?? 0).toFixed(1)}/{p.horizon_h}h
            </span>
          )}
        </span>
        <span className="font-mono text-[12px] tracking-wide" style={{ color: carColor }}>
          {up ? "+" : ""}{(p.upnl_pct ?? 0).toFixed(2)}%
        </span>
      </div>

      <div className="relative h-8 border-2 border-bone/15 bg-pitch">
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-signal2" />
        <span aria-hidden className="gr-hazard absolute inset-y-0 right-0 w-[6px]" style={{ filter: "grayscale(0.2)" }} />
        {frac != null && (
          <span aria-hidden className="absolute inset-y-1 left-[3px]" style={{ width: `calc(${frac * 100}% - 3px)`, background: up ? "rgba(201,242,75,0.16)" : "rgba(255,90,31,0.16)" }} />
        )}
        <span aria-hidden className="absolute inset-y-0 w-px bg-bone/35" style={{ left: "50%" }} title="entry" />
        {frac != null ? (
          <motion.span
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2"
            style={{ left: `${frac * 100}%`, borderColor: carColor, background: "var(--color-pitch)" }}
            animate={{ left: `${frac * 100}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-mono text-[9px] uppercase tracking-widest text-steel">awaiting mark</span>
        )}
        <span className="absolute -bottom-0.5 left-1 translate-y-full font-mono text-[8px] uppercase tracking-[0.12em] text-signal2/80">SL {fmtPrice(p.sl)}</span>
        <span className="absolute -bottom-0.5 left-1/2 translate-y-full -translate-x-1/2 font-mono text-[8px] uppercase tracking-[0.12em] text-steel">@ {fmtPrice(p.entry)}</span>
        <span className="absolute -bottom-0.5 right-1 translate-y-full font-mono text-[8px] uppercase tracking-[0.12em] text-chartreuse/80">TP {fmtPrice(p.tp)}</span>
      </div>
      {p.near_tp && (
        <p className="mt-2.5 inline-block border border-chartreuse/50 bg-chartreuse/5 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-chartreuse">
          🏁 {(p.tp_progress_pct ?? 0) >= 100 ? "at TP" : "near TP " + (p.tp_progress_pct ?? 0).toFixed(0) + "%"} ·{" "}
          {p.near_tp_lock_in_s != null ? "banking in " + mmss(p.near_tp_lock_in_s) : "banking near-win"}
        </p>
      )}
      {p.reasons && p.reasons.length > 0 && (
        <p className="mt-3.5 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">
          ▸ {p.reasons.slice(0, 3).join(" · ")}
        </p>
      )}
    </div>
  );
}

export default function CampaignView({ base, mode }: { base?: string; mode: "owner" | "user" }) {
  const [data, setData] = useState<CampaignStatus | null>(null);
  const [err, setErr] = useState(false);
  const owner = mode === "owner";

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const d = await fetchCampaign(base);
      if (!alive) return;
      if (d) { setData(d); setErr(false); } else { setErr(true); }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [base]);

  const net = data?.net_usd ?? 0;
  const netUp = net >= 0;

  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> {owner ? "THE LIVE FLOOR · DESK-DRIVEN · PAPER AT LIVE PRICES" : "YOUR LIVE FLOOR · YOUR ENGINE · YOUR KEYS"}
          </p>
          <h1 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}>
            {owner ? <>The <span className="text-chartreuse">grid</span></> : <>Your <span className="text-chartreuse">grid</span></>}
          </h1>

          {/* engine badge — whose data this is */}
          <div className="mt-4">
            <span className={`inline-block border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${owner ? "border-bone/40 text-bone/70" : "border-chartreuse text-chartreuse"}`}>
              {owner ? "🏠 owner engine · showcase (running 24/7)" : "🛰 your engine"}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Every car is a position the firm opened on a desk vote. It runs from its{" "}
            <span className="text-signal2">stop</span> to its <span className="text-chartreuse">target</span> —
            where the car sits is how far the trade has travelled. Live.
          </p>

          {/* honesty plate */}
          <div className="mt-6 inline-block border-2 border-chartreuse bg-carbon px-4 py-2.5" style={{ boxShadow: "5px 5px 0 rgba(201,242,75,0.45)" }}>
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/85">
              paper capital at live prices — <span className="text-chartreuse">real capital still requires a validated edge.</span>
              <br />opened only on quantitative desk votes · ATR-sized SL/TP · the discipline is the product.
            </p>
          </div>

          {/* ── CAPITAL · paper accounting vs Bitget testnet (clearly separated) ── */}
          {data?.capital && (() => {
            const c = data.capital;
            const eqUp = c.equity_usd >= c.starting_capital_usd;
            const roiUp = c.roi_pct >= 0;
            const bg = c.bitget_saldo;
            const usd = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
            return (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {/* 📄 PAPER ACCOUNTING — the source of truth */}
                <div className="border-2 border-bone/25 bg-carbon">
                  <div className="flex items-center justify-between border-b-2 border-bone/15 px-5 py-2.5">
                    <p className="font-display text-sm font-bold uppercase tracking-wide text-bone">📄 Paper accounting</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-steel">bankroll at live prices · source of truth</p>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-bone/10">
                    <div className="bg-carbon p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">equity</p>
                      <p className="mt-1 font-display text-3xl font-extrabold leading-none" style={{ color: eqUp ? "var(--color-chartreuse)" : "var(--color-signal2)" }}>{usd(c.equity_usd)}</p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">from {usd(c.starting_capital_usd)}</p>
                    </div>
                    <div className="bg-carbon p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">ROI</p>
                      <p className="mt-1 font-display text-3xl font-extrabold leading-none" style={{ color: roiUp ? "var(--color-chartreuse)" : "var(--color-signal2)" }}>{roiUp ? "+" : ""}{c.roi_pct.toFixed(2)}%</p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">real + unreal</p>
                    </div>
                    <div className="bg-carbon p-4">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">P&amp;L</p>
                      <p className="mt-1.5 font-mono text-[13px] text-bone/85">{c.realized_pnl_usd >= 0 ? "+" : "−"}${Math.abs(c.realized_pnl_usd).toFixed(2)} <span className="text-[9px] text-steel">real</span></p>
                      <p className="mt-1 font-mono text-[13px] text-bone/85">{c.unrealized_pnl_usd >= 0 ? "+" : "−"}${Math.abs(c.unrealized_pnl_usd).toFixed(2)} <span className="text-[9px] text-steel">unreal</span></p>
                    </div>
                  </div>
                </div>

                {/* ⚡ BITGET TESTNET — real demo fills, no real funds */}
                <div className={`border-2 ${bg ? "border-chartreuse/55" : "border-bone/20"} bg-carbon`}>
                  <div className="flex items-center justify-between border-b-2 border-bone/15 px-5 py-2.5">
                    <p className="font-display text-sm font-bold uppercase tracking-wide" style={{ color: bg ? "var(--color-chartreuse)" : "rgba(242,239,230,0.4)" }}>⚡ Bitget testnet</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-steel">real demo fills · no real funds</p>
                  </div>
                  {bg ? (
                    <div className="grid grid-cols-2 gap-px bg-bone/10">
                      <div className="bg-carbon p-4">
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">balance</p>
                        <p className="mt-1 font-display text-3xl font-extrabold leading-none text-chartreuse">{usd(bg.equity_usd)}</p>
                        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">SUSDT demo equity</p>
                      </div>
                      <div className="bg-carbon p-4">
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">available</p>
                        <p className="mt-1 font-display text-3xl font-extrabold leading-none text-bone">{usd(bg.available_usd)}</p>
                        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">BTC / ETH / XRP</p>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-7">
                      <p className="font-display text-2xl font-extrabold uppercase leading-none text-bone/40">not armed</p>
                      <p className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-steel/80">set BITGET_EXECUTE=1 + keys on the engine to trade Bitget testnet — the real demo saldo shows here.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── lap board ── */}
          {data && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-2 border-bone/25 bg-carbon p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">
                  positions opened {data.target == null ? "· always-on" : ""}
                </p>
                <p className="mt-1 font-display text-4xl font-extrabold leading-none text-bone">
                  {data.opened}
                  {data.target != null && <span className="text-xl text-steel">/{data.target}</span>}
                </p>
                <div className="mt-3 h-2 border border-bone/20 bg-pitch">
                  {data.target == null ? (
                    <div className="h-full w-full animate-pulse bg-chartreuse/70" />
                  ) : (
                    <div className="h-full bg-chartreuse" style={{ width: `${(data.opened / data.target) * 100}%` }} />
                  )}
                </div>
              </div>
              <div className="border-2 p-4" style={{ borderColor: netUp ? "var(--color-chartreuse)" : "var(--color-signal2)", background: "var(--color-carbon)" }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">net realized P&amp;L</p>
                <p className="mt-1 font-display text-4xl font-extrabold leading-none" style={{ color: netUp ? "var(--color-chartreuse)" : "var(--color-signal2)" }}>
                  {netUp ? "+" : "−"}${Math.abs(net).toFixed(2)}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-steel">{data.closed} closed · win {data.win_pct}%</p>
              </div>
              <div className="border-2 border-bone/25 bg-carbon p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">exits</p>
                <div className="mt-2 flex items-end gap-3 font-display text-2xl font-extrabold leading-none">
                  <span className="text-chartreuse">🎯{data.exits_by_reason.TP}</span>
                  <span className="text-signal2">🛑{data.exits_by_reason.SL}</span>
                  <span className="text-bone/70">⏱{data.exits_by_reason.TIME}</span>
                  {(data.exits_by_reason.TRAIL ?? 0) > 0 && (
                    <span className="text-chartreuse">🪤{data.exits_by_reason.TRAIL}</span>
                  )}
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-steel">{data.open_now} on track now</p>
              </div>
              <div className="border-2 border-bone/25 bg-carbon p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">testnet fills</p>
                <p className="mt-1 font-display text-4xl font-extrabold leading-none text-bone">{data.testnet_fills}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">{data.risk_model}</p>
              </div>
            </div>
          )}

          {/* ── the grid (open positions as race lanes) ── */}
          <div className="mt-12">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.26em] text-steel">
              on the grid · {data?.open_now ?? 0} cars · <span className="text-signal2">SL</span> ◂ entry ▸ <span className="text-chartreuse">TP</span> · 🔷 = live price
            </p>
            <div className="border-2 border-bone/25 bg-carbon px-4 sm:px-6">
              {!data && !err && <p className="py-10 text-center font-mono text-sm uppercase tracking-[0.2em] text-steel">connecting to the floor…</p>}
              {err && (
                <p className="py-10 text-center font-mono text-sm uppercase tracking-[0.2em] text-steel">
                  {owner ? "floor unreachable — the firm is on Railway; retrying every 20s" : (
                    <>your engine unreachable — is it running + tunnelled? <Link href="/onboarding" className="text-chartreuse underline">register →</Link></>
                  )}
                </p>
              )}
              {data && data.open_positions.length === 0 && (
                <p className="py-10 text-center font-mono text-sm uppercase tracking-[0.2em] text-steel">grid empty — desks flat, nothing to open (the firm doesn&apos;t coin-flip)</p>
              )}
              {data?.open_positions.map((p) => <Lane key={p.id} p={p} />)}
            </div>
          </div>

          {/* ── results strip (recent closes) ── */}
          {data && data.recent_closes.length > 0 && (
            <div className="mt-10">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.26em] text-steel">crossed the line · recent closes</p>
              <div className="flex flex-wrap gap-2">
                {data.recent_closes.slice().reverse().map((c) => {
                  const win = (c.pnl_usd ?? 0) > 0;
                  const icon = c.exit_reason === "TP" ? "🎯" : c.exit_reason === "SL" ? "🛑" : c.exit_reason === "TRAIL" ? "🪤" : c.exit_reason === "NEARTP" ? "🏁" : c.exit_reason === "STALL" ? "✂" : "⏱";
                  return (
                    <span key={c.id} className="flex items-center gap-1.5 border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                      style={{ borderColor: win ? "rgba(201,242,75,0.5)" : "rgba(255,90,31,0.5)", color: win ? "var(--color-chartreuse)" : "var(--color-signal2)" }}>
                      {icon} {c.asset} {c.dir} {(c.net_pct ?? 0) >= 0 ? "+" : ""}{(c.net_pct ?? 0).toFixed(2)}%
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · {owner ? "THE GRID" : "YOUR GRID"} · {data?.principle ?? "paper at live prices — real capital needs a validated edge"}
          </p>
        </div>
      </footer>
    </>
  );
}
