"use client";

/**
 * BitgetCrowd — "THE CROWD". Live aggregate retail long/short + open interest per traded asset, from
 * Bitget's keyless mainnet positioning endpoints. A CEX exposes no individual whale positions, so this
 * is the CROWD — set against the Hyperliquid smart-money grid above. Read it contrarian: a book leaning
 * hard one way is a caution flag, not a signal to follow. Polls /bitget-crowd (30s).
 */

import { useEffect, useState } from "react";
import Image from "next/image";

import { fetchBitgetCrowd, pairLabel, type BitgetCrowd as Crowd } from "@/lib/campaign";
import LiveBadge from "@/components/garage/LiveBadge";

const POLL_MS = 30000;
const fmtOI = (n: number | null) =>
  n == null ? "—" : Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : n.toFixed(0);

export default function BitgetCrowd() {
  const [data, setData] = useState<Crowd | null>(null);
  const [at, setAt] = useState<Date | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const d = await fetchBitgetCrowd();
      if (!alive) return;
      setReached(Boolean(d));
      if (d) { setData(d); setAt(new Date()); }
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const rows = data?.assets ?? [];

  return (
    <div className="max-w-4xl">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-2 border-bone/15 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-4xl font-extrabold leading-none text-bone/15">02</span>
          <Image src="/brand/bitget.jpg" alt="Bitget" width={26} height={26} />
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">Bitget crowd · long / short</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">live retail positioning per asset — the crowd, not the whales</p>
          </div>
        </div>
        <LiveBadge at={at} />
      </div>

      <div className="mb-5 inline-block border-l-2 border-bitget/50 bg-carbon px-4 py-2.5">
        <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
          aggregate <span className="text-bone">retail</span> long/short from Bitget (a CEX exposes no individual whales) —
          read it <span className="text-bitget">contrarian</span>: a crowd leaning hard one way is a caution flag, not a cue to follow.
        </p>
      </div>

      {reached === false && !data ? (
        <p className="py-8 font-mono text-xs uppercase tracking-[0.2em] text-steel">bitget crowd feed unreachable — the firm runs on Railway; retrying</p>
      ) : rows.length === 0 ? (
        <p className="py-8 font-mono text-xs uppercase tracking-[0.2em] text-steel">loading bitget positioning…</p>
      ) : (
        <>
          <div className="hidden grid-cols-[150px_1fr_96px_72px] gap-3 bg-pitch px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-steel lg:grid">
            <span>asset</span>
            <span>accounts · long ← → short</span>
            <span className="text-right">position L/S</span>
            <span className="text-right">open int.</span>
          </div>
          <div className="space-y-px bg-bone/10">
            {rows.map((r) => {
              const longA = r.long_acct_pct ?? 50;
              const shortA = r.short_acct_pct ?? 100 - longA;
              const crowded = longA >= 65 ? "CROWDED LONG" : longA <= 35 ? "CROWDED SHORT" : null;
              return (
                <div key={r.asset} className="grid grid-cols-2 items-center gap-3 bg-carbon px-4 py-3 lg:grid-cols-[150px_1fr_96px_72px]">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-extrabold uppercase text-bone">{pairLabel(r.asset)}</span>
                    {crowded && <span className="border border-bitget/50 px-1 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.08em] text-bitget">{crowded}</span>}
                  </span>
                  {/* accounts long/short split bar */}
                  <span className="relative block h-7 overflow-hidden border border-bone/15 bg-pitch">
                    <span aria-hidden className="absolute inset-y-0 left-0 bg-chartreuse/70" style={{ width: `${longA}%` }} />
                    <span aria-hidden className="absolute inset-y-0 right-0 bg-signal2/70" style={{ width: `${shortA}%` }} />
                    <span className="absolute inset-y-0 left-1.5 flex items-center font-mono text-[10px] font-bold text-pitch">{longA.toFixed(0)}% L</span>
                    <span className="absolute inset-y-0 right-1.5 flex items-center font-mono text-[10px] font-bold text-pitch">S {shortA.toFixed(0)}%</span>
                  </span>
                  <span className="text-right font-mono text-[11px] text-bone/70">{r.long_pos_pct?.toFixed(0) ?? "—"}/{r.short_pos_pct?.toFixed(0) ?? "—"}</span>
                  <span className="text-right font-mono text-[11px] text-steel">{fmtOI(r.open_interest)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
            live · Bitget keyless mainnet · account-ratio = % of accounts long/short · position-ratio = % of OI · the firm reads this as crowd context, not a follow signal
          </p>
        </>
      )}
    </div>
  );
}
