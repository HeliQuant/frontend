"use client";

/**
 * DynoSheet — THE DYNO. A dynamometer measures an engine's REAL output under load; you can't market
 * your way past the curve. So we put the firm's trade ledger on the dyno: quantstats-grade metrics
 * (Sharpe / Sortino / max-drawdown / profit-factor) computed from REAL resolved trades, plus the
 * compounded equity "power band". Honest by construction — annualized figures stay BLANK until the
 * sample is meaningful (≥30d & ≥30 trades), because extrapolating a 3-day window to a CAGR is a lie.
 * The directional floor has no validated edge, so the curve reads ~breakeven/loss; we show it anyway.
 * Reads /performance (live, 20s poll).
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { fetchPerformance, type PerfStats } from "@/lib/campaign";

const POLL_MS = 20000;

function PowerCurve({ eq }: { eq: number[] }) {
  if (!eq || eq.length < 2) return null;
  const W = 800, H = 200, pad = 10;
  const min = Math.min(...eq, 1), max = Math.max(...eq, 1);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (eq.length - 1)) * (W - 2 * pad);
  const y = (v: number) => pad + (1 - (v - min) / range) * (H - 2 * pad);
  const path = eq.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = eq[eq.length - 1];
  const stroke = last >= 1 ? "#c9f24b" : "#ff5a1f";
  const area = `${path} L${x(eq.length - 1).toFixed(1)} ${H - pad} L${x(0).toFixed(1)} ${H - pad} Z`;
  const base = y(1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" preserveAspectRatio="none">
      <line x1={pad} y1={base} x2={W - pad} y2={base} stroke="#fff" strokeOpacity="0.18" strokeDasharray="5 5" />
      <path d={area} fill={stroke} fillOpacity="0.08" />
      <motion.path
        d={path} fill="none" stroke={stroke} strokeWidth="2.5" vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

function Stat({ k, v, tone, sub }: { k: string; v: string; tone?: "good" | "bad" | "muted"; sub?: string }) {
  const color = tone === "good" ? "text-chartreuse" : tone === "bad" ? "text-signal2" : "text-bone";
  return (
    <div className="bg-carbon px-5 py-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">{k}</p>
      <p className={`mt-1 font-display text-3xl font-extrabold leading-none ${color}`}>{v}</p>
      {sub ? <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/40">{sub}</p> : null}
    </div>
  );
}

const sign = (n?: number | null, d = 2, suf = "") =>
  n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(d)}${suf}`;
const tone = (n?: number | null, flip = false): "good" | "bad" | "muted" =>
  n == null ? "muted" : (flip ? n < 0 : n > 0) ? "good" : "bad";

export default function DynoSheet() {
  const [p, setP] = useState<PerfStats | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const r = await fetchPerformance();
      if (!alive) return;
      setReached(Boolean(r));
      if (r) setP(r);
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (reached === false && !p) {
    return (
      <div className="border-2 border-bone/20 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
        dyno unreachable — the firm runs on Railway; retrying every 20s
      </div>
    );
  }
  if (!p) {
    return <div className="border-2 border-bone/15 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">spinning up the dyno…</div>;
  }
  if (!p.n) {
    return (
      <div className="border-2 border-bone/15 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
        no resolved trades yet — the dyno needs a closed run to measure
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* headline strip */}
      <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
        <Stat k="resolved trades" v={`${p.n}`} sub={p.span_days != null ? `over ${p.span_days}d` : undefined} />
        <Stat k="win rate" v={p.win_rate != null ? `${p.win_rate}%` : "—"} tone={(p.win_rate ?? 0) >= 50 ? "good" : "bad"} />
        <Stat k="total return" v={sign(p.total_return_pct, 2, "%")} tone={tone(p.total_return_pct)} sub="$1/trade compounded" />
        <Stat k="profit factor" v={p.profit_factor != null ? p.profit_factor.toFixed(2) : "—"} tone={(p.profit_factor ?? 0) >= 1 ? "good" : "bad"} sub="gross win ÷ gross loss" />
      </div>

      {/* the power band */}
      <section>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">the power band · compounded equity from $1, per trade · dashed line = breakeven (1.0)</p>
        <div className="border-2 border-bone/20 bg-pitch p-4">
          <PowerCurve eq={p.equity_curve ?? []} />
        </div>
      </section>

      {/* per-trade truth — no extrapolation */}
      <section>
        <div className="mb-5 flex items-baseline gap-4 border-b-2 border-bone/15 pb-3">
          <span className="font-display text-4xl font-extrabold leading-none text-bone/15">01</span>
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">Per-trade truth</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">measured, not extrapolated · return = pnl ÷ size</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
          <Stat k="sharpe / trade" v={sign(p.sharpe_per_trade, 3)} tone={tone(p.sharpe_per_trade)} />
          <Stat k="sortino / trade" v={sign(p.sortino_per_trade, 3)} tone={tone(p.sortino_per_trade)} />
          <Stat k="max drawdown" v={sign(p.max_drawdown_pct, 2, "%")} tone="bad" />
          <Stat k="expectancy / trade" v={sign(p.mean_trade_pct, 3, "%")} tone={tone(p.mean_trade_pct)} />
          <Stat k="avg win" v={sign(p.avg_win_pct, 3, "%")} tone="good" />
          <Stat k="avg loss" v={sign(p.avg_loss_pct, 3, "%")} tone="bad" />
          <Stat k="best trade" v={sign(p.best_pct, 2, "%")} tone="good" />
          <Stat k="worst trade" v={sign(p.worst_pct, 2, "%")} tone="bad" />
        </div>
      </section>

      {/* annualized — honest gate */}
      <section>
        <div className="mb-5 flex items-baseline gap-4 border-b-2 border-bone/15 pb-3">
          <span className="font-display text-4xl font-extrabold leading-none text-bone/15">02</span>
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">Annualized</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">only when the sample earns it</p>
          </div>
        </div>
        {p.annualized ? (
          <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
            <Stat k="sharpe (ann.)" v={sign(p.sharpe_annualized, 2)} tone={tone(p.sharpe_annualized)} />
            <Stat k="sortino (ann.)" v={sign(p.sortino_annualized, 2)} tone={tone(p.sortino_annualized)} />
            <Stat k="calmar" v={sign(p.calmar, 2)} tone={tone(p.calmar)} />
            <Stat k="cagr" v={sign(p.cagr_pct, 1, "%")} tone={tone(p.cagr_pct)} sub={p.trades_per_year ? `${p.trades_per_year} trades/yr` : undefined} />
          </div>
        ) : (
          <div className="border-2 border-signal2/50 bg-carbon px-6 py-8">
            <p className="font-display text-2xl font-extrabold uppercase text-signal2">Withheld — on purpose</p>
            <p className="mt-3 max-w-2xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-bone/70">
              {p.sample_warning ??
                "sample too small to annualize honestly"}. A 3-day window of fast trades extrapolates to a
              fantasy CAGR and a double-digit Sharpe — so we refuse to print it. The per-trade numbers above
              are the real ones. <span className="text-chartreuse">Most projects show the fantasy. We don&apos;t.</span>
            </p>
          </div>
        )}
      </section>

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
        the dyno doesn&apos;t lie. the directional floor has <span className="text-bone">no validated edge</span>, so this
        curve reads ~breakeven/loss — and we show it anyway. the only positive edge we found is{" "}
        <span className="text-chartreuse">delta-neutral funding-carry</span> (non-directional), measured on its own
        bench. <span className="text-signal2">honesty is the product.</span>
      </p>
    </div>
  );
}
