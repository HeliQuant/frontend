"use client";

/**
 * CarryDesk — THE EDGE. The directional floor proves discipline on a no-edge book; THIS is the one
 * strategy that showed a real, positive, cost-aware edge in walk-forward — and it's **non-directional**
 * (long spot + short perp, market-neutral, predicts nothing; it harvests the funding the perp pays).
 *
 * Honest by construction: the validated rates are a DATED walk-forward result (scripts/79, 2026-06-07);
 * the live rates are read from real Bitget funding via /carry. The firm HARVESTS only when carry is rich
 * (> risk-free) AND crash-robust — otherwise it SKIPS. Right now funding is thin, so it waits. The edge
 * is real; the discipline is taking it only when it pays.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { fetchCarry, type CarryStatus } from "@/lib/campaign";
import LiveBadge from "@/components/garage/LiveBadge";

const POLL_MS = 30000;

// "updated HH:MM UTC" from the feed's own asof; honest fallbacks when the feed is missing/dead
function asofLabel(asof: string | null | undefined): string {
  if (asof === undefined) return "live";
  if (asof === null) return "feed: never / stale";
  const d = new Date(asof);
  if (Number.isNaN(d.getTime())) return "feed: stale";
  return `updated ${d.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }).slice(0, 5)} UTC`;
}
const RISK_FREE = 5.0; // ~stablecoin yield benchmark — carry must clear this to be worth the legs

// Validated WALK-FORWARD carry (scripts/79, 2026-06-07 — net of funding + 4-leg costs, 90d hold, dated):
const VALIDATED = [
  { asset: "HYPE", wf: 5.8, tier: "PRIMARY", crash: "robust", note: "the only carry that beats risk-free AND survives crashes — basis held ≤29 bps through a −17.3% crash · 100% of walk-forward buckets positive" },
  { asset: "SUI", wf: 4.3, tier: "diversifier", crash: "lumpy", note: "100% WF+ but sub-risk-free · basis dislocated −166 bps in the worst crashes → size down" },
  { asset: "MNT", wf: 3.3, tier: "diversifier", crash: "moderate", note: "Mantle-eco carry · 100% WF+ but sub-RF · basis near-robust, funding turns slightly −ve in crashes" },
  { asset: "BTC", wf: 2.8, tier: "weak", crash: "tame", note: "tame basis but thin funding · one WF bucket negative" },
  { asset: "ETH", wf: 2.5, tier: "weak", crash: "tame", note: "tame basis, thin funding" },
  { asset: "SOL", wf: -0.6, tier: "none", crash: "—", note: "no harvestable carry" },
];

const CRASH_COLOR: Record<string, string> = {
  robust: "text-chartreuse border-chartreuse/50",
  lumpy: "text-signal2 border-signal2/50",
  moderate: "text-bone/70 border-bone/30",
  tame: "text-steel border-bone/25",
  "—": "text-steel border-bone/20",
};

export default function CarryDesk() {
  const [c, setC] = useState<CarryStatus | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);
  const [lastGood, setLastGood] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const r = await fetchCarry();
      if (!alive) return;
      setReached(Boolean(r));
      if (r) {
        setC(r);
        setLastGood(new Date());
      }
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const live = c?.carry ?? {};
  const liveFor = (a: string) => live[`${a}USDT`] ?? null;
  const harvestable = c?.best_harvestable ?? "";

  return (
    <div className="space-y-12">
      {/* proof-of-life */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">delta-neutral funding-carry desk</p>
        <LiveBadge at={lastGood} />
      </div>

      {/* headline strip */}
      <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
        <div className="bg-carbon px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">strategy</p>
          <p className="mt-1 font-display text-2xl font-extrabold leading-none text-chartreuse">delta-neutral</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/40">long spot · short perp · predicts nothing</p>
        </div>
        <div className="bg-carbon px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">validated primary</p>
          <p className="mt-1 font-display text-3xl font-extrabold leading-none text-chartreuse">HYPE +5.8%</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/40">walk-forward /yr · crash-robust</p>
        </div>
        <div className="bg-carbon px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">risk-free bar</p>
          <p className="mt-1 font-display text-3xl font-extrabold leading-none text-bone">{RISK_FREE}%</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/40">carry must clear this</p>
        </div>
        <div className="bg-carbon px-5 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">harvestable now</p>
          <p className={`mt-1 font-display text-2xl font-extrabold leading-none ${harvestable.startsWith("none") ? "text-signal2" : "text-chartreuse"}`}>
            {harvestable.startsWith("none") ? "none — wait" : "live"}
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/40">funding thin → skip</p>
        </div>
      </div>

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-bone/80">
        the directional floor proves discipline on a <span className="text-signal2">no-edge</span> book. THIS is the
        one strategy that showed a <span className="text-chartreuse">real, positive, cost-aware edge</span> in
        walk-forward — and it&apos;s <span className="text-bone">non-directional</span>. It earns the funding the perp
        pays, market-neutral. We harvest it only when it&apos;s rich + crash-robust — otherwise we wait.
      </p>

      {/* validated walk-forward */}
      <section>
        <div className="mb-5 flex items-baseline gap-4 border-b-2 border-bone/15 pb-3">
          <span className="font-display text-4xl font-extrabold leading-none text-bone/15">01</span>
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">Validated in walk-forward</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">scripts/79 · 2026-06-07 · net of funding + 4-leg costs · 90d hold</p>
          </div>
        </div>
        <div className="space-y-px bg-bone/10">
          {VALIDATED.map((v) => {
            const beats = v.wf >= RISK_FREE;
            const frac = Math.max(0, Math.min(1, v.wf / 7)); // scale to ~7%/yr
            const rfFrac = RISK_FREE / 7;
            const bar = v.crash === "robust" ? "#c9f24b" : v.crash === "lumpy" ? "#ff5a1f" : "#8b8b80";
            return (
              <div key={v.asset} className="grid items-center gap-4 bg-carbon px-5 py-4 lg:grid-cols-[210px_1fr_300px]">
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl font-extrabold uppercase text-bone">{v.asset}USDT</span>
                  <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${CRASH_COLOR[v.crash] ?? CRASH_COLOR["—"]}`}>{v.crash}</span>
                  {v.tier === "PRIMARY" ? <span className="border border-chartreuse/60 bg-chartreuse/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-chartreuse">harvest</span> : null}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative h-3 flex-1 border border-bone/20 bg-pitch">
                    <div className="absolute top-[-3px] z-10 h-[calc(100%+6px)] w-px bg-bone/60" style={{ left: `${rfFrac * 100}%` }} title="risk-free 5%" />
                    <motion.div className="absolute left-0 top-0 h-full" style={{ background: bar, opacity: 0.85 }} initial={{ width: 0 }} animate={{ width: `${frac * 100}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
                  </div>
                  <span className={`w-14 shrink-0 text-right font-mono text-sm font-bold ${beats ? "text-chartreuse" : v.wf < 0 ? "text-signal2" : "text-steel"}`}>{v.wf >= 0 ? "+" : ""}{v.wf}%</span>
                </div>
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-bone/45">{v.note}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/55">
          the white tick = risk-free ({RISK_FREE}%). only <span className="text-chartreuse">HYPE</span> clears it AND is
          crash-robust → the one harvestable edge. the rest are diversifiers or too thin.
        </p>
      </section>

      {/* live carry now */}
      <section>
        <div className="mb-5 flex items-baseline gap-4 border-b-2 border-bone/15 pb-3">
          <span className="font-display text-4xl font-extrabold leading-none text-bone/15">02</span>
          <div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">Live carry — right now</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">read from real Bitget funding · {reached === false ? "desk unreachable, retrying" : asofLabel(c?.asof)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-3">
          {VALIDATED.filter((v) => v.asset !== "SOL").map((v) => {
            const l = liveFor(v.asset);
            const rate = l?.carry_ann_pct ?? null;
            const harvest = (l?.verdict ?? "").toUpperCase().startsWith("HARVEST");
            return (
              <div key={v.asset} className="bg-carbon px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-xl font-extrabold uppercase text-bone">{v.asset}USDT</span>
                  <span className={`font-display text-2xl font-extrabold ${rate == null ? "text-steel" : harvest ? "text-chartreuse" : "text-bone/70"}`}>
                    {rate == null ? "—" : `${rate >= 0 ? "+" : ""}${rate}%`}
                  </span>
                </div>
                <p className={`mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] ${harvest ? "text-chartreuse" : "text-signal2"}`}>
                  {l?.verdict ?? "no live read"}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 border-l-2 border-signal2 bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-bone/75">
          {harvestable.startsWith("none")
            ? "right now: funding is thin across the board — nothing clears risk-free + crash-robust, so the firm SKIPS. The edge is real; we just don't force it when it isn't paying."
            : harvestable}
        </p>
      </section>

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
        this is the honest answer to &quot;where&apos;s the alpha?&quot; — not a faked directional P&amp;L, but a
        <span className="text-chartreuse"> validated, non-directional yield</span> harvested with discipline. The firm
        knows when it pays (fat funding) and when it doesn&apos;t (now) — and <span className="text-bone">waits</span>.
      </p>
    </div>
  );
}
