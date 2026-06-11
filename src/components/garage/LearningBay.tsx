"use client";

/**
 * LearningBay — THE TUNING BAY. HeliQuant learning from its losses, shown as an ECU re-map: every
 * losing round dials a condition's throttle DOWN (faded ×0.5), winners stay at full, and the gate
 * refuses counter-trend entries at intake. The learning is now REGIME-AWARE — it learns "shorting
 * this in an UP-market loses", not "this signal always loses" — so each cell carries its regime.
 *
 * Distinct from THE GRID (race lanes): this is a tuning console — throttle bars are the data
 * geometry (a dialed-back bar IS the lesson). Reads /campaign (cond_record + skips + cooldowns), live.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { fetchCampaign, type CampaignStatus } from "@/lib/campaign";

const POLL_MS = 20000;

type Cell = {
  key: string;
  asset: string;
  signal: string;
  regime: string;
  n: number;
  wins: number;
  pnl: number;
  status: "faded" | "trusted" | "watching";
  mult: number;
};

function parseCond(rec: { cond: string; n: number; wins: number; pnl: number }): Cell {
  const [body, regime = "flat"] = rec.cond.split(" @");
  const [asset, ...sig] = body.split("|");
  const avg = rec.n ? rec.pnl / rec.n : 0;
  const status: Cell["status"] = rec.n < 4 ? "watching" : avg < 0 ? "faded" : "trusted";
  return {
    key: rec.cond,
    asset,
    signal: sig.join(" · "),
    regime,
    n: rec.n,
    wins: rec.wins,
    pnl: rec.pnl,
    status,
    mult: status === "faded" ? 0.5 : 1,
  };
}

const REGIME_COLOR: Record<string, string> = {
  up: "text-chartreuse border-chartreuse/50",
  down: "text-signal2 border-signal2/50",
  flat: "text-steel border-bone/30",
};
const STATUS_META = {
  faded: { tag: "DIALED BACK", color: "text-signal2", bar: "#ff5a1f" },
  trusted: { tag: "TRUSTED", color: "text-chartreuse", bar: "#c9f24b" },
  watching: { tag: "LEARNING", color: "text-bone/60", bar: "#8b8b80" },
} as const;

function ago(iso?: string): string {
  if (!iso) return "";
  const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  return s < 90 ? `${s}s` : s < 5400 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 3600)}h`;
}

export default function LearningBay() {
  const [camp, setCamp] = useState<CampaignStatus | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const c = await fetchCampaign();
      if (!alive) return;
      setReached(Boolean(c));
      if (c) setCamp(c);
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const cells = useMemo(
    () => (camp?.learned?.records ?? []).map(parseCond).sort((a, b) => a.pnl - b.pnl),
    [camp]
  );
  const cooling = useMemo(
    () => Object.entries(camp?.last_scan ?? {}).filter(([, v]) => v.startsWith("cooldown")),
    [camp]
  );
  const skips = camp?.recent_skips ?? [];
  const worstPnl = Math.min(-1, ...cells.map((c) => c.pnl));

  return (
    <div className="space-y-12">
      {/* ── feedback loop ribbon ── */}
      <div className="flex flex-wrap items-center gap-3 border-2 border-bone/20 bg-carbon px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em]">
        <span className="text-steel">the loop</span>
        {["a trade closes", "outcome recorded", "loser dialed back", "gate refuses repeats", "sharper next run"].map(
          (s, i) => (
            <span key={s} className="flex items-center gap-3">
              <span className={i === 2 ? "text-signal2" : i === 4 ? "text-chartreuse" : "text-bone/70"}>{s}</span>
              {i < 4 && <span className="text-steel">→</span>}
            </span>
          )
        )}
      </div>

      {/* ── stat strip ── */}
      <div className="grid grid-cols-2 gap-px bg-bone/10 sm:grid-cols-4">
        {[
          { k: "conditions learned", v: `${camp?.learned?.tracked ?? 0}`, c: "text-bone" },
          { k: "dialed back", v: `${camp?.learned?.faded ?? 0}`, c: "text-signal2" },
          { k: "intake refusals", v: `${camp?.skips ?? 0}`, c: "text-chartreuse" },
          { k: "benched (cooldown)", v: `${camp?.failed_conditions ?? 0}`, c: "text-bone/70" },
        ].map((s) => (
          <div key={s.k} className="bg-carbon px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">{s.k}</p>
            <p className={`mt-1 font-display text-4xl font-extrabold leading-none ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* ── the re-map board ── */}
      <div>
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
          the re-map · every condition&apos;s realized record dials its throttle · regime-aware
        </p>
        {reached === false && !camp ? (
          <div className="border-2 border-bone/20 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
            tuning bay unreachable — the firm runs on Railway; retrying every 20s
          </div>
        ) : cells.length === 0 ? (
          <div className="border-2 border-bone/15 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
            the engine is still gathering its first runs — no condition has enough closes to re-map yet
          </div>
        ) : (
          <div className="space-y-px bg-bone/10">
            {cells.map((c) => {
              const m = STATUS_META[c.status];
              const lossFrac = Math.max(0, Math.min(1, -c.pnl / -worstPnl));
              return (
                <div key={c.key} className="grid items-center gap-4 bg-carbon px-5 py-4 lg:grid-cols-[260px_1fr_200px]">
                  {/* identity */}
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-extrabold uppercase text-bone">{c.asset}</span>
                    <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${REGIME_COLOR[c.regime] ?? REGIME_COLOR.flat}`}>
                      {c.regime}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone/50">{c.signal}</span>
                  </div>
                  {/* throttle — the data geometry: a dialed-back bar IS the lesson */}
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-steel">throttle</span>
                      <div className="relative h-3 flex-1 border border-bone/20 bg-pitch">
                        <motion.div
                          className="h-full"
                          style={{ background: m.bar, opacity: 0.85 }}
                          initial={{ width: "100%" }}
                          animate={{ width: `${c.mult * 100}%` }}
                          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-bone/30" />
                      </div>
                      <span className={`w-12 shrink-0 font-mono text-xs font-bold ${m.color}`}>×{c.mult}</span>
                    </div>
                    {/* loss weight bar (how much this lesson cost) */}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-steel">P&amp;L</span>
                      <div className="h-1.5 flex-1 bg-pitch">
                        <div className="h-full" style={{ width: `${lossFrac * 100}%`, background: c.pnl < 0 ? "#ff5a1f" : "#c9f24b", opacity: 0.6 }} />
                      </div>
                      <span className={`w-16 shrink-0 text-right font-mono text-[11px] ${c.pnl < 0 ? "text-signal2" : "text-chartreuse"}`}>
                        {c.pnl >= 0 ? "+" : ""}${c.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {/* verdict */}
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <span className="font-mono text-[11px] text-bone/55">{c.wins}/{c.n} won</span>
                    <span className={`border-2 px-2.5 py-1 font-display text-xs font-extrabold uppercase tracking-wider ${m.color}`} style={{ borderColor: m.bar }}>
                      {m.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── intake refusals (the veto) ── */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
            refused at intake · {camp?.skips ?? 0} counter-trend entries vetoed
          </p>
          <div className="border-2 border-bone/25 bg-carbon">
            {skips.length === 0 ? (
              <p className="px-5 py-6 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">none in window</p>
            ) : (
              <div className="divide-y divide-bone/10">
                {skips.slice().reverse().map((s, i) => (
                  <div key={`${s.utc}-${i}`} className="flex items-center gap-3 px-5 py-2.5 font-mono text-[11px]">
                    <span className="w-12 font-display text-base font-bold uppercase text-bone">{s.asset}</span>
                    <span className="text-signal2">⊘ {s.dir}</span>
                    <span className="text-bone/45">vs regime {s.regime}</span>
                    <span className="ml-auto text-steel">{ago(s.utc)} ago</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* cooling bays */}
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-steel">cooling off · benched after a losing round</p>
          <div className="border-2 border-bone/25 bg-carbon">
            {cooling.length === 0 ? (
              <p className="px-5 py-6 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">all bays active</p>
            ) : (
              <div className="divide-y divide-bone/10">
                {cooling.map(([asset, v]) => (
                  <div key={asset} className="flex items-center gap-3 px-5 py-2.5 font-mono text-[11px]">
                    <span className="w-12 font-display text-base font-bold uppercase text-bone">{asset}</span>
                    <span className="text-bone/55">{v}</span>
                    <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-signal2/70" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
        the firm doesn&apos;t just lose and move on — it <span className="text-signal2">records every loss</span>, dials
        back what&apos;s proven to fail <span className="text-bone">in that regime</span>, and refuses to repeat it.
        <span className="text-chartreuse"> no validated edge is faked</span> — discipline is the product.
      </p>
    </div>
  );
}
