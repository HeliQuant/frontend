"use client";

/**
 * LiveFloor — THE LIVE FLOOR. The always-on firm, shown as it actually trades right now:
 * the org pulse (cycles + health), the live book (every open campaign position drawn on its
 * own candlestick against entry / SL / TP), and the PM's decision feed (mostly ABSTAIN — the
 * discipline IS the demo). Reads the Railway endpoints directly; polls so it stays live.
 *
 * Honest by construction: paper positions at live prices, real capital still gated on a
 * validated edge. Nothing here is mocked — empty states say "unreachable", never fake data.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { fetchCampaign, venueBadge, type CampaignStatus, type OpenPosition } from "@/lib/campaign";
import { fetchStatus, fetchDecisions, fetchCandles, type OrgStatus, type Decision, type Candle } from "@/lib/live";
import MiniCandles from "./MiniCandles";

const POLL_MS = 20000;
const CANDLE_MS = 60000;

function ago(iso?: string | null): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 90) return `${s}s ago`;
  if (s < 5400) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">{label}</p>
      <p className={`mt-1 font-display text-3xl font-extrabold leading-none ${accent ?? "text-bone"}`}>{value}</p>
    </div>
  );
}

export default function LiveFloor() {
  const [camp, setCamp] = useState<CampaignStatus | null>(null);
  const [status, setStatus] = useState<OrgStatus | null>(null);
  const [decisions, setDecisions] = useState<Decision[] | null>(null);
  const [candles, setCandles] = useState<Record<string, Candle[]>>({});
  const [reached, setReached] = useState<boolean | null>(null);
  const candleAssets = useRef<string>("");

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const [c, s, d] = await Promise.all([fetchCampaign(), fetchStatus(), fetchDecisions()]);
      if (!alive) return;
      setReached(Boolean(c || s || d));
      if (c) setCamp(c);
      if (s) setStatus(s);
      if (d) setDecisions(d);
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const openAssets = useMemo(
    () => Array.from(new Set((camp?.open_positions ?? []).map((p) => p.asset))),
    [camp]
  );

  useEffect(() => {
    let alive = true;
    const key = openAssets.slice().sort().join(",");
    const load = async () => {
      const entries = await Promise.all(
        openAssets.map(async (a) => [a, (await fetchCandles(a))?.candles ?? []] as const)
      );
      if (!alive) return;
      setCandles((prev) => {
        const next = { ...prev };
        for (const [a, cs] of entries) if (cs.length) next[a] = cs;
        return next;
      });
    };
    if (key && key !== candleAssets.current) {
      candleAssets.current = key;
      load();
    }
    const id = setInterval(load, CANDLE_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [openAssets]);

  if (reached === false && !camp) {
    return (
      <div className="border-2 border-bone/20 bg-carbon px-6 py-16 text-center font-mono text-sm uppercase tracking-[0.2em] text-steel">
        the floor is unreachable — the firm runs on Railway; retrying every 20s
      </div>
    );
  }

  const opened = camp?.opened ?? 0;
  const net = camp?.net_usd ?? 0;
  const exits = camp?.exits_by_reason ?? { TP: 0, SL: 0, TIME: 0 };

  return (
    <div className="space-y-10">
      {/* ── ORG PULSE ── */}
      <div className="border-2 border-bone/25 bg-carbon">
        <div className="flex items-center justify-between border-b-2 border-bone/15 px-5 py-3">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse" /> live floor · paper at live prices
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
            cycle #{status?.cycles ?? "—"} · last {ago(status?.last_cycle_utc)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 px-5 py-5 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label={camp?.target == null ? "opened · live" : "opened"} value={camp?.target == null ? `${opened}` : `${opened}/${camp.target}`} />
          <Stat label="open now" value={`${camp?.open_now ?? 0}`} />
          <Stat label="closed" value={`${camp?.closed ?? 0}`} />
          <Stat label="win rate" value={`${(camp?.win_pct ?? 0).toFixed(0)}%`} />
          <Stat label="net (paper)" value={`${net >= 0 ? "+" : ""}$${net.toFixed(2)}`} accent={net >= 0 ? "text-chartreuse" : "text-signal2"} />
          <Stat label="sized-up" value={`${camp?.sized_up_open ?? 0}`} accent={(camp?.edge_open ?? 0) > 0 ? "text-chartreuse" : "text-bone/40"} />
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t-2 border-bone/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-steel">
          <span>exits</span>
          <span className="text-chartreuse">🎯 {exits.TP}</span>
          <span className="text-signal2">🛑 {exits.SL}</span>
          <span className="text-bone/70">⏱ {exits.TIME}</span>
          {(exits.TRAIL ?? 0) > 0 && <span className="text-chartreuse">🪤 {exits.TRAIL}</span>}
          {(exits.NEARTP ?? 0) > 0 && <span className="text-chartreuse">🏁 {exits.NEARTP}</span>}
          {(exits.STALL ?? 0) > 0 && <span className="text-bone/70">✂ {exits.STALL}</span>}
          {(camp?.skips ?? 0) > 0 && <span className="text-bone/70">⊘ {camp!.skips} vetoed</span>}
          <span className="ml-auto text-bone/45">{camp?.risk_model}</span>
        </div>
        {camp?.recent_skips && camp.recent_skips.length > 0 && (
          <div className="border-t-2 border-bone/10 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
            regime veto (don&apos;t fight the trend) · latest{" "}
            <span className="text-bone/80">
              {camp.recent_skips[camp.recent_skips.length - 1].asset}{" "}
              {camp.recent_skips[camp.recent_skips.length - 1].dir} — regime{" "}
              {camp.recent_skips[camp.recent_skips.length - 1].regime}
            </span>
          </div>
        )}
      </div>

      {/* honesty plate */}
      <div className="border-l-2 border-chartreuse bg-carbon px-5 py-3">
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
          paper capital at live prices · <span className="text-chartreuse">real capital still requires a validated edge</span> · opened only on quantitative desk votes
        </p>
      </div>

      {/* ── THE LIVE BOOK ── */}
      <div>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
          the live book · {camp?.open_now ?? 0} open · each drawn against its stop &amp; target
        </p>
        {(camp?.open_positions?.length ?? 0) === 0 ? (
          <div className="border-2 border-bone/15 bg-carbon px-6 py-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
            no open positions — desks flat or in cooldown (no coin-flips, even on paper)
          </div>
        ) : (
          <div className="space-y-px bg-bone/10">
            {camp!.open_positions.map((p) => (
              <PositionRow key={p.id} p={p} candles={candles[p.asset] ?? []} />
            ))}
          </div>
        )}
      </div>

      {/* ── DECISION FEED ── */}
      <div>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
          the PM speaks · last decisions (mostly ABSTAIN — that restraint is the product)
        </p>
        <div className="divide-y divide-bone/10 border-2 border-bone/25 bg-carbon">
          {(decisions ?? []).slice(0, 6).map((d, i) => (
            <div key={`${d.utc}-${i}`} className="flex items-start gap-4 px-5 py-3">
              <span className="w-12 shrink-0 font-display text-base font-bold uppercase text-bone">{d.asset}</span>
              <span
                className={`w-20 shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.12em] ${
                  d.decision === "ENTER" ? "text-chartreuse" : "text-bone/55"
                }`}
              >
                {d.decision}
                {d.direction && d.direction !== "NONE" ? ` ${d.direction}` : ""}
              </span>
              <span className="min-w-0 flex-1 text-[12px] leading-relaxed text-bone/55">{d.reason}</span>
              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-steel">{ago(d.utc)}</span>
            </div>
          ))}
          {(decisions?.length ?? 0) === 0 && (
            <div className="px-5 py-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">awaiting first decision…</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PositionRow({ p, candles }: { p: OpenPosition; candles: Candle[] }) {
  const up = (p.upnl_pct ?? 0) >= 0;
  return (
    <div className="grid gap-5 bg-carbon px-5 py-5 lg:grid-cols-[1fr_360px]">
      {/* thesis */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-2xl font-extrabold uppercase text-bone">{p.asset}</span>
          <span className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${p.dir === "SHORT" ? "border-signal2/60 text-signal2" : "border-chartreuse/60 text-chartreuse"}`}>
            {p.dir}
          </span>
          {(() => { const v = venueBadge(p.venue); return (
            <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${v.cls}`}>{v.label}</span>
          ); })()}
          <span className="border border-bone/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">{p.tier}</span>
          {p.horizon_h != null && (
            <span className="border border-bone/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/55">
              ⏱ {(p.held_h ?? 0).toFixed(1)}/{p.horizon_h}h
            </span>
          )}
          {p.upnl_pct != null && (
            <span className={`font-mono text-sm font-bold ${up ? "text-chartreuse" : "text-signal2"}`}>
              {up ? "+" : ""}
              {p.upnl_pct.toFixed(2)}% <span className="text-[10px] text-steel">uPnL</span>
            </span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[11px]">
          <Lvl label="entry" v={p.entry} color="text-bone" />
          <Lvl label="stop" v={p.sl} color="text-signal2" pct={p.sl_pct} />
          <Lvl label="target" v={p.tp} color="text-chartreuse" pct={p.tp_pct} />
        </div>
        {p.near_tp && (
          <p className="mt-3 inline-block border border-chartreuse/50 bg-chartreuse/5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-chartreuse">
            🏁 near TP{p.tp_progress_pct != null ? ` ${p.tp_progress_pct.toFixed(0)}%` : ""} ·{" "}
            {p.near_tp_lock_in_s != null ? `lock in ${mmss(p.near_tp_lock_in_s)}` : "banking the near-win"}
          </p>
        )}
        {p.now != null && (
          <p className="mt-3 font-mono text-[11px] text-bone/70">
            mark <span className="text-[#6ea8ff]">{fmt(p.now)}</span> · opened {ago(p.utc_open)}
          </p>
        )}
        {p.reasons && p.reasons.length > 0 && (
          <p className="mt-2 text-[11px] leading-relaxed text-bone/45">
            <span className="text-steel">desks:</span> {p.reasons.slice(0, 3).join(" · ")}
          </p>
        )}
      </div>
      {/* chart */}
      <div className="border border-bone/15">
        <MiniCandles candles={candles} entry={p.entry} sl={p.sl} tp={p.tp} now={p.now ?? null} dir={p.dir} />
      </div>
    </div>
  );
}

function Lvl({ label, v, color, pct }: { label: string; v: number | null; color: string; pct?: number | null }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-steel">{label}</p>
      <p className={`mt-0.5 font-mono text-[13px] font-semibold ${color}`}>{v == null ? "—" : fmt(v)}</p>
      {pct != null && <p className="font-mono text-[9px] text-steel">{pct > 0 ? `${pct.toFixed(1)}%` : ""}</p>}
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (n >= 1) return n.toFixed(2);
  return n.toPrecision(4);
}

function mmss(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.max(0, Math.round(s - m * 60))).padStart(2, "0")}`;
}
