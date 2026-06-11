"use client";

/**
 * LearningBay — THE TUNING BAY. HeliQuant's self-learning made watchable across its THREE layers:
 *   L1 · Edge Discovery   — the edge registry (edge_lab): validated edges gate aggression; candidates
 *                            on probation. "Earn the edge."
 *   L2 · Desk Reliability  — desk_performance: each of the 9 desks earns a weight 0.6–1.4 by track record.
 *   L3 · Tactical Re-map   — campaign cond_record (regime-aware) + intake refusals + cooling bays.
 *
 * Distinct metaphor from THE GRID (race lanes): a tuning console — bars are the data geometry.
 * Reads /edges, /desks, /campaign, live (20s poll). Honest throughout: 0 edges faked.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import {
  fetchCampaign,
  fetchDesks,
  fetchEdges,
  type CampaignStatus,
  type DeskWeights,
  type EdgeRegistry,
  type EdgeRec,
} from "@/lib/campaign";

const POLL_MS = 20000;

/* ───────────────────────── helpers ───────────────────────── */
type Cell = { key: string; asset: string; signal: string; regime: string; n: number; wins: number; pnl: number; status: "faded" | "trusted" | "watching"; mult: number };

function parseCond(rec: { cond: string; n: number; wins: number; pnl: number }): Cell {
  const [body, regime = "flat"] = rec.cond.split(" @");
  const [asset, ...sig] = body.split("|");
  const avg = rec.n ? rec.pnl / rec.n : 0;
  const status: Cell["status"] = rec.n < 4 ? "watching" : avg < 0 ? "faded" : "trusted";
  return { key: rec.cond, asset, signal: sig.join(" · "), regime, n: rec.n, wins: rec.wins, pnl: rec.pnl, status, mult: status === "faded" ? 0.5 : 1 };
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

function LayerHead({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-4 border-b-2 border-bone/15 pb-3">
      <span className="font-display text-5xl font-extrabold leading-none text-bone/15">L{n}</span>
      <div>
        <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-bone">{title}</h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{sub}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── component ───────────────────────── */
export default function LearningBay() {
  const [camp, setCamp] = useState<CampaignStatus | null>(null);
  const [desks, setDesks] = useState<DeskWeights | null>(null);
  const [edges, setEdges] = useState<EdgeRegistry | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const [c, d, e] = await Promise.all([fetchCampaign(), fetchDesks(), fetchEdges()]);
      if (!alive) return;
      setReached(Boolean(c || d || e));
      if (c) setCamp(c);
      if (d) setDesks(d);
      if (e) setEdges(e);
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const cells = useMemo(() => (camp?.learned?.records ?? []).map(parseCond).sort((a, b) => a.pnl - b.pnl), [camp]);
  const cooling = useMemo(() => Object.entries(camp?.last_scan ?? {}).filter(([, v]) => v.startsWith("cooldown")), [camp]);
  const skips = camp?.recent_skips ?? [];
  const worstPnl = Math.min(-1, ...cells.map((c) => c.pnl));

  const candidates = useMemo<EdgeRec[]>(() => Object.values(edges?.candidate ?? {}), [edges]);
  const validatedN = Object.keys(edges?.validated ?? {}).length;
  const [lo, hi] = desks?.bounds ?? [0.6, 1.4];
  const deskRows = useMemo(
    () => (desks?.desks ?? []).map((name) => {
      const w = desks?.weights?.[name] ?? 1;
      const det = desks?.detail?.[name];
      return { name, w, samples: det?.samples ?? 0, align: det?.align_rate ?? null };
    }),
    [desks]
  );

  if (reached === false && !camp && !desks && !edges) {
    return (
      <div className="border-2 border-bone/20 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
        tuning bay unreachable — the firm runs on Railway; retrying every 20s
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* ── headline stat strip ── */}
      <div className="grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
        {[
          { k: "validated edges", v: `${validatedN}`, c: validatedN ? "text-chartreuse" : "text-bone" },
          { k: "edges on probation", v: `${candidates.length}`, c: "text-chartreuse" },
          { k: "desks earning trust", v: `${desks?.desks?.length ?? 9}`, c: "text-bone" },
          { k: "conditions learned", v: `${camp?.learned?.tracked ?? 0}`, c: "text-bone" },
        ].map((s) => (
          <div key={s.k} className="bg-carbon px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">{s.k}</p>
            <p className={`mt-1 font-display text-4xl font-extrabold leading-none ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* ════ LAYER 1 · EDGE DISCOVERY ════ */}
      <section>
        <LayerHead n={1} title="Edge discovery" sub="earn the edge · cost-aware OOS + walk-forward + FDR → registry gates aggression" />
        {/* validated banner — honest */}
        <div className={`border-2 px-5 py-4 ${validatedN ? "border-chartreuse/60 bg-chartreuse/5" : "border-signal2/50 bg-carbon"}`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone/80">
            {validatedN ? (
              <><span className="text-chartreuse">{validatedN} VALIDATED EDGE(S)</span> — cleared to earn real aggression.</>
            ) : (
              <><span className="text-signal2">0 VALIDATED EDGES.</span> The firm hunts but won&apos;t fake one — real capital stays gated. Discipline over a fabricated number.</>
            )}
          </p>
        </div>
        {/* candidate cards */}
        <p className="mb-3 mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">on probation · passed OOS, awaiting fresh-data confirmation before graduating</p>
        <div className="grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.length === 0 ? (
            <div className="bg-carbon px-5 py-8 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">no candidates in registry</div>
          ) : (
            candidates.map((e) => {
              const grad = (e.confirmations ?? 0) >= 1;
              return (
                <div key={`${e.asset}-${e.edge}`} className="bg-carbon p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-extrabold uppercase text-bone">{e.asset}</span>
                    <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${grad ? "border-chartreuse/60 text-chartreuse" : "border-bone/30 text-steel"}`}>
                      {grad ? `${e.confirmations}× confirmed` : "probation"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-chartreuse">{e.edge}{e.horizon_h ? ` · ${e.horizon_h}h` : ""}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <Metric k="OOS ROI" v={e.oos_roi_pct != null ? `${e.oos_roi_pct >= 0 ? "+" : ""}${e.oos_roi_pct.toFixed(0)}%` : "—"} good={(e.oos_roi_pct ?? 0) > 0} />
                    <Metric k="payoff" v={e.payoff_b != null ? `${e.payoff_b.toFixed(2)}×` : "—"} good={(e.payoff_b ?? 0) > 1} />
                    <Metric k="p(win)" v={e.p_win != null ? `${(e.p_win * 100).toFixed(1)}%` : "—"} />
                    <Metric k="samples" v={`${e.sample_n ?? "—"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ════ LAYER 2 · DESK RELIABILITY ════ */}
      <section>
        <LayerHead n={2} title="Desk reliability" sub={`who the firm trusts · each desk earns 0.6–1.4 by track record (≥${desks?.min_samples ?? 15} samples)`} />
        <div className="space-y-px bg-bone/10">
          {deskRows.map((d) => {
            const trusted = d.w > 1.05;
            const discounted = d.w < 0.95;
            const color = trusted ? "#c9f24b" : discounted ? "#ff5a1f" : "#8b8b80";
            const wPct = ((d.w - lo) / (hi - lo)) * 100;
            const centerPct = ((1 - lo) / (hi - lo)) * 100;
            const left = Math.min(centerPct, wPct);
            const width = Math.abs(wPct - centerPct);
            const verdict = trusted ? "TRUSTED" : discounted ? "DISCOUNTED" : d.samples < (desks?.min_samples ?? 15) ? "EARNING" : "NEUTRAL";
            return (
              <div key={d.name} className="grid items-center gap-4 bg-carbon px-5 py-3 lg:grid-cols-[230px_1fr_160px]">
                <span className="font-display text-base font-bold uppercase tracking-wide text-bone">{d.name}</span>
                {/* centered weight bar: neutral 1.0 at the tick, fills right=trusted / left=discounted */}
                <div className="flex items-center gap-3">
                  <span className="w-7 shrink-0 text-right font-mono text-[10px] text-steel">{lo}</span>
                  <div className="relative h-3 flex-1 border border-bone/20 bg-pitch">
                    <div className="absolute top-[-2px] h-[calc(100%+4px)] w-px bg-bone/40" style={{ left: `${centerPct}%` }} />
                    <motion.div className="absolute top-0 h-full" style={{ background: color, opacity: 0.85 }} initial={{ width: 0 }} animate={{ left: `${left}%`, width: `${width}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
                  </div>
                  <span className="w-7 shrink-0 font-mono text-[10px] text-steel">{hi}</span>
                  <span className="w-12 shrink-0 text-right font-mono text-xs font-bold" style={{ color }}>×{d.w.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 lg:justify-end">
                  <span className="font-mono text-[10px] text-bone/45">{d.samples} samples{d.align != null ? ` · ${(d.align * 100).toFixed(0)}% aligned` : ""}</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{verdict}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-bone/55">
          neutral 1.0 until a desk proves itself · OI-Contrarian seeded from its OOS replay · weights are an
          ADVISORY prior to the PM — gates still bind
        </p>
      </section>

      {/* ════ LAYER 3 · TACTICAL RE-MAP ════ */}
      <section>
        <LayerHead n={3} title="Tactical re-map" sub="every closed trade dials a condition's throttle · regime-aware" />
        {cells.length === 0 ? (
          <div className="border-2 border-bone/15 bg-carbon px-6 py-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
            still gathering first runs — no condition has enough closes to re-map yet
          </div>
        ) : (
          <div className="space-y-px bg-bone/10">
            {cells.map((c) => {
              const m = STATUS_META[c.status];
              const lossFrac = Math.max(0, Math.min(1, -c.pnl / -worstPnl));
              return (
                <div key={c.key} className="grid items-center gap-4 bg-carbon px-5 py-4 lg:grid-cols-[260px_1fr_200px]">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-extrabold uppercase text-bone">{c.asset}</span>
                    <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${REGIME_COLOR[c.regime] ?? REGIME_COLOR.flat}`}>{c.regime}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone/50">{c.signal}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-steel">throttle</span>
                      <div className="relative h-3 flex-1 border border-bone/20 bg-pitch">
                        <motion.div className="h-full" style={{ background: m.bar, opacity: 0.85 }} initial={{ width: "100%" }} animate={{ width: `${c.mult * 100}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-bone/30" />
                      </div>
                      <span className={`w-12 shrink-0 font-mono text-xs font-bold ${m.color}`}>×{c.mult}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-steel">P&amp;L</span>
                      <div className="h-1.5 flex-1 bg-pitch">
                        <div className="h-full" style={{ width: `${lossFrac * 100}%`, background: c.pnl < 0 ? "#ff5a1f" : "#c9f24b", opacity: 0.6 }} />
                      </div>
                      <span className={`w-16 shrink-0 text-right font-mono text-[11px] ${c.pnl < 0 ? "text-signal2" : "text-chartreuse"}`}>{c.pnl >= 0 ? "+" : ""}${c.pnl.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <span className="font-mono text-[11px] text-bone/55">{c.wins}/{c.n} won</span>
                    <span className={`border-2 px-2.5 py-1 font-display text-xs font-extrabold uppercase tracking-wider ${m.color}`} style={{ borderColor: m.bar }}>{m.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* intake refusals + cooling */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">refused at intake · {camp?.skips ?? 0} counter-trend entries vetoed</p>
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
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">cooling off · benched after a losing round</p>
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
      </section>

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
        three layers, one principle — the firm <span className="text-bone">earns</span> every edge, <span className="text-bone">weights</span> every
        desk by record, and <span className="text-signal2">dials back</span> every proven loser in its regime.
        <span className="text-chartreuse"> no validated edge is faked</span> — discipline is the product.
      </p>
    </div>
  );
}

function Metric({ k, v, good }: { k: string; v: string; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-bone/10 pb-1">
      <span className="text-[9px] uppercase tracking-[0.12em] text-steel">{k}</span>
      <span className={good == null ? "text-bone/80" : good ? "text-chartreuse" : "text-signal2"}>{v}</span>
    </div>
  );
}
