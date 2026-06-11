"use client";

/**
 * TradeLedger — THE LEDGER. Every RESOLVED trade HeliQuant has made, with its full data: direction,
 * entry→exit, net%, PnL$, exit reason, the regime it opened in, and the desk-votes that justified it.
 * Reads /trades live. Honest: these are paper trades at live prices (real fills on Bybit testnet when
 * armed); the DECISIONS are what get sealed on-chain (see the anchor strip below).
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { fetchTrades, type Trade, type TradeLog } from "@/lib/campaign";

const POLL_MS = 20000;

const MANTLESCAN = "https://sepolia.mantlescan.xyz";

const REASON_META: Record<string, { color: string; label: string }> = {
  TP: { color: "text-chartreuse border-chartreuse/50", label: "take-profit" },
  SL: { color: "text-signal2 border-signal2/50", label: "stop-loss" },
  TIME: { color: "text-steel border-bone/30", label: "time-exit" },
  TRAIL: { color: "text-bone/70 border-bone/30", label: "trailed" },
};
const REGIME_COLOR: Record<string, string> = { up: "text-chartreuse", down: "text-signal2", flat: "text-steel" };

function ago(iso: string | null): string {
  if (!iso) return "";
  const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (s < 90) return `${s}s`;
  if (s < 5400) return `${Math.floor(s / 60)}m`;
  if (s < 172800) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function TradeLedger() {
  const [log, setLog] = useState<TradeLog | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const t = await fetchTrades();
      if (!alive) return;
      setReached(Boolean(t));
      if (t) setLog(t);
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const net = log?.net_usd ?? 0;

  return (
    <div className="space-y-8">
      {/* summary blotter */}
      <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
        {[
          { k: "trades resolved", v: `${log?.count ?? 0}`, c: "text-bone" },
          { k: "win rate", v: `${log?.win_pct ?? 0}%`, c: "text-bone" },
          { k: "net P&L (paper)", v: `${net >= 0 ? "+" : ""}$${net.toFixed(2)}`, c: net >= 0 ? "text-chartreuse" : "text-signal2" },
          { k: "open now", v: `${log?.open_now ?? 0}`, c: "text-bone" },
        ].map((s) => (
          <div key={s.k} className="bg-carbon px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">{s.k}</p>
            <p className={`mt-1 font-display text-4xl font-extrabold leading-none ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* the blotter */}
      {reached === false && !log ? (
        <div className="border-2 border-bone/20 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
          ledger unreachable — the firm runs on Railway; retrying every 20s
        </div>
      ) : (log?.trades?.length ?? 0) === 0 ? (
        <div className="border-2 border-bone/15 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
          no resolved trades yet — the floor is still working its first positions
        </div>
      ) : (
        <div className="space-y-px bg-bone/10">
          {/* header row */}
          <div className="hidden grid-cols-[100px_1fr_80px_80px_95px_150px] gap-3 bg-pitch px-5 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-steel lg:grid">
            <span>asset · side</span>
            <span>entry → exit</span>
            <span className="text-right">net %</span>
            <span className="text-right">P&amp;L $</span>
            <span>exit · regime</span>
            <span>on-chain · age</span>
          </div>
          {log!.trades.map((t, i) => (
            <TradeRow key={t.id} t={t} delay={Math.min(i * 0.012, 0.3)} />
          ))}
        </div>
      )}

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/70">
        honest scope — these are <span className="text-bone">paper trades at live prices</span> (real fills route
        to Bybit testnet when armed). real capital still needs a validated edge. every resolved trade&apos;s
        outcome is <span className="text-chartreuse">sealed on Mantle</span> — tap any tx to verify on Mantlescan.
      </p>
    </div>
  );
}

function TradeRow({ t, delay }: { t: Trade; delay: number }) {
  const long = t.dir === "LONG";
  const pnl = t.pnl_usd ?? 0;
  const net = t.net_pct ?? 0;
  const rm = REASON_META[t.exit_reason ?? "TIME"] ?? REASON_META.TIME;
  const win = pnl > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="grid grid-cols-2 items-center gap-3 bg-carbon px-5 py-3 lg:grid-cols-[100px_1fr_80px_80px_95px_150px]"
    >
      {/* asset + side */}
      <div className="flex items-center gap-2">
        <span className="font-display text-xl font-extrabold uppercase text-bone">{t.asset}</span>
        <span className={`font-mono text-[10px] font-bold uppercase ${long ? "text-chartreuse" : "text-signal2"}`}>
          {long ? "↑L" : "↓S"}
        </span>
        <span className="hidden font-mono text-[8px] uppercase tracking-wide text-steel sm:inline">{t.tier}</span>
      </div>
      {/* entry -> exit */}
      <div className="font-mono text-[11px] text-bone/70">
        <span className="text-bone/50">{t.entry}</span>
        <span className="mx-1 text-steel">→</span>
        <span className="text-bone/80">{t.exit ?? "—"}</span>
        {t.reasons?.length ? (
          <span className="ml-2 hidden text-[9px] uppercase tracking-wide text-steel xl:inline">· {t.reasons.slice(0, 2).join(" · ")}</span>
        ) : null}
      </div>
      {/* net % */}
      <span className={`text-right font-mono text-sm font-bold ${win ? "text-chartreuse" : "text-signal2"}`}>
        {net >= 0 ? "+" : ""}{net.toFixed(2)}%
      </span>
      {/* pnl $ */}
      <span className={`text-right font-mono text-sm ${win ? "text-chartreuse" : "text-signal2"}`}>
        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
      </span>
      {/* exit reason + regime */}
      <div className="flex items-center gap-2">
        <span className={`border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] ${rm.color}`}>
          {t.exit_reason ?? "—"}
        </span>
        {t.regime ? <span className={`font-mono text-[9px] uppercase ${REGIME_COLOR[t.regime] ?? "text-steel"}`}>{t.regime}</span> : null}
      </div>
      {/* on-chain anchor + age */}
      <div className="flex items-center justify-between gap-2">
        {t.anchor_tx ? (
          <a
            href={`${MANTLESCAN}/tx/${t.anchor_tx}`}
            target="_blank"
            rel="noopener noreferrer"
            title={t.anchor_tx}
            className="flex items-center gap-1 font-mono text-[10px] text-chartreuse hover:underline"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-chartreuse" />
            {t.anchor_tx.slice(0, 6)}…{t.anchor_tx.slice(-4)} ↗
          </a>
        ) : (
          <span className="flex items-center gap-1 font-mono text-[10px] text-steel">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-steel/70" />
            sealing…
          </span>
        )}
        <span className="font-mono text-[10px] text-steel">{ago(t.utc_close)}</span>
      </div>
    </motion.div>
  );
}
