"use client";

/**
 * OrgLoop — "THE LOOP". HeliQuant's full autonomous org cycle as a node graph whose END feeds back into
 * its START through a real learning loop. STEWARD → INGEST → 12 desks → PM → RISK GATE → VERDICT →
 * (ENTER) EXECUTE on Bitget → ANCHOR on Mantle → EDGE-LAB learns → MEMORY stores → back to STEWARD.
 * Every connector carries a flowing data dot; the cycle self-alternates ABSTAIN / ENTER. Hovering any
 * node opens a card explaining what it represents.
 *
 * Honest: real components + 12 real desks; reads are qualitative (no fabricated numbers); ENTER is an
 * aligned/exploration trade (real on the Bitget testnet), ABSTAIN is the default (registry empty by design).
 */

import { useEffect, useState } from "react";

const C = {
  carbon: "var(--color-carbon)",
  bone: "var(--color-bone)",
  steel: "var(--color-steel)",
  chart: "var(--color-chartreuse)",
  bitget: "var(--color-bitget)",
  signal2: "var(--color-signal2)",
};

type Vote = "abstain" | "skip" | "fade" | "neutral" | "long" | "confirm" | "lean";
const isUp = (v: Vote) => v === "long" || v === "confirm" || v === "lean";
const voteColor = (v: Vote) => (isUp(v) ? C.chart : v === "fade" ? C.signal2 : v === "neutral" ? C.bone : C.steel);

const DESK_NAMES = ["REGIME", "OI-CONTRARIAN", "SMART-MONEY", "ON-CHAIN", "MACRO · ALLORA", "SENTIMENT", "CARRY", "MANTLE-FUND", "TIMESFM · VOL", "MULTI-TF", "FLOW-INTEL", "WHALE"];
const DESK_DESC = [
  "Classifies the tape — trend vs chop (82.6% OOS). The gate: the firm won't fight a clear trend, nor trade a marginal one.",
  "Fades open-interest extremes. The one edge that cleared the cost-aware OOS bar (+28.9%) — since decayed and retired; watched for its return.",
  "Reads high-conviction Hyperliquid whales (≥2, real notional, proven ROE). Won't buy a top the smart money is shorting.",
  "Mantle + DEX flows, staking, exchange netflow (Etherscan / DexScreener). Context, not alpha — and we say so.",
  "First Allora oracle consumer live on Mantle: decentralized macro inference, fed into the debate.",
  "Fear & Greed + CoinGecko + social mindshare (Elfa). A mood read — weighed, never obeyed.",
  "Delta-neutral funding carry per asset, live from Bitget funding. Harvest only when rich + crash-robust; usually thin → skip.",
  "Mantle-ecosystem fundamentals — TVL, fees, staking flow (DeFiLlama). Risk-on / risk-off context.",
  "Google TimesFM 2.5 forecaster (HF Space): a volatility / risk read plus vol-targeted sizing.",
  "TradingView 1h/4h/1D alignment gate. Fades or abstains when the daily opposes the entry — kills counter-trend bounces.",
  "The self-learning desk: an FDR-gated edge registry. Graduates only edges that survive OOS + walk-forward + Benjamini-Hochberg.",
  "Per-asset Hyperliquid whale tracker — live net positioning and conviction.",
];

const SCEN = [
  {
    asset: "BTC", verdict: "ABSTAIN", dir: "", exec: false, pmSub: "no edge · holds", riskSub: "no size",
    reads: [["choppy / no trend", "neutral"], ["no extreme", "abstain"], ["whales split", "abstain"], ["flows quiet", "abstain"],
      ["no signal", "abstain"], ["mixed", "abstain"], ["funding thin", "skip"], ["no catalyst", "abstain"],
      ["forecast flat", "abstain"], ["1h vs 1D opposed", "fade"], ["no FDR edge", "abstain"], ["no conviction", "abstain"]] as [string, Vote][],
  },
  {
    asset: "HYPE", verdict: "ENTER", dir: "LONG", exec: true, pmSub: "trend + multi-TF", riskSub: "¼-Kelly · 1.7×",
    reads: [["clean uptrend", "long"], ["no extreme", "abstain"], ["whales long", "long"], ["inflows", "lean"],
      ["bullish", "long"], ["positive", "lean"], ["funding ok", "skip"], ["n/a", "abstain"],
      ["vol expanding", "long"], ["1h·4h·1D aligned", "confirm"], ["no FDR edge", "abstain"], ["accumulating", "long"]] as [string, Vote][],
  },
];

// ── geometry (viewBox 1320 × 900) ──
const VW = 1320, VH = 900;
const DW = 176, DH = 42;
const COL_X = [360, 600];
const ROW_Y = [70, 168, 266, 364, 462, 560];
const dpos = (i: number) => ({ cx: COL_X[i % 2], cy: ROW_Y[Math.floor(i / 2)] });

const INGEST = { cx: 96, cy: 380, w: 128, h: 54, tag: "↯", label: "INGEST", sub: "live telemetry", color: C.bone, desc: "Pulls live telemetry every cycle — Bitget price/funding/OI, Hyperliquid whales, Allora, on-chain flows, DeFiLlama — all keyless." };
const PM = { cx: 884, cy: 330, w: 132, h: 64, tag: "⚖", label: "PM", color: C.chart, desc: "The LLM portfolio manager: runs a bull-vs-bear debate over all 12 desk reads and signs off — or vetoes — every trade. Default is ABSTAIN." };
const VERDICT = { cx: 1146, cy: 120, w: 120, h: 52, desc: "ENTER or ABSTAIN. Real capital needs a validated edge; the registry is empty, so it mostly holds. The discipline is the product." };
const RISK = { cx: 1146, cy: 272, w: 120, h: 52, tag: "⛨", label: "RISK GATE", color: C.bone, desc: "Sizes an ENTER — fractional-Kelly, ¼-capped, ATR stops, drawdown breaker. Repairs an unsafe ticket, or ABSTAINs." };
const EXECUTE = { cx: 1146, cy: 424, w: 120, h: 52, desc: "On ENTER, fires a real market order on the Bitget testnet (BTC/ETH/XRP demo perps). Other assets paper at live marks." };
const ANCHOR = { cx: 1146, cy: 576, w: 120, h: 52, desc: "Hashes the decision and seals it on Mantle (ERC-8004) — a tamper-proof, recomputable record. The trust primitive." };
const LEARN = { cx: 884, cy: 808, w: 176, h: 56, tag: "↻", label: "EDGE-LAB", sub: "learn · re-tune registry", color: C.chart, desc: "Re-tests every hypothesis on fresh data each cycle and graduates or RETIRES edges on evidence — it retired our own +28.9%." };
const MEMORY = { cx: 470, cy: 808, w: 150, h: 56, tag: "❒", label: "MEMORY", sub: "recall · store", color: C.bone, desc: "Stores every decision + learning (Supabase/SQLite), recalled next cycle so the firm compounds instead of forgetting." };
const STEWARD = { cx: 96, cy: 770, w: 128, h: 54, tag: "❖", label: "STEWARD", sub: "wakes the firm", color: C.bone, desc: "Wakes the firm each cycle, picks the asset, and orchestrates desks → PM → execution → learning. The autonomous heartbeat." };

const cH = (x1: number, y1: number, x2: number, y2: number) => { const m = (x1 + x2) / 2; return `M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`; };
const cV = (x1: number, y1: number, x2: number, y2: number) => { const m = (y1 + y2) / 2; return `M ${x1} ${y1} C ${x1} ${m}, ${x2} ${m}, ${x2} ${y2}`; };

const fanIn = DESK_NAMES.map((_, i) => cH(INGEST.cx + INGEST.w / 2, INGEST.cy, dpos(i).cx - DW / 2, dpos(i).cy));
const fanOut = DESK_NAMES.map((_, i) => cH(dpos(i).cx + DW / 2, dpos(i).cy, PM.cx - PM.w / 2, PM.cy));
const eSI = `M ${STEWARD.cx} ${STEWARD.cy - STEWARD.h / 2} L ${INGEST.cx} ${INGEST.cy + INGEST.h / 2}`;
const ePV = cH(PM.cx + PM.w / 2, PM.cy, VERDICT.cx - VERDICT.w / 2, VERDICT.cy);
const eVR = `M ${VERDICT.cx} ${VERDICT.cy + VERDICT.h / 2} L ${RISK.cx} ${RISK.cy - RISK.h / 2}`;
const eRE = `M ${RISK.cx} ${RISK.cy + RISK.h / 2} L ${EXECUTE.cx} ${EXECUTE.cy - EXECUTE.h / 2}`;
const eEA = `M ${EXECUTE.cx} ${EXECUTE.cy + EXECUTE.h / 2} L ${ANCHOR.cx} ${ANCHOR.cy - ANCHOR.h / 2}`;
const eAL = cV(ANCHOR.cx, ANCHOR.cy + ANCHOR.h / 2, LEARN.cx + LEARN.w / 2, LEARN.cy);
const eLM = `M ${LEARN.cx - LEARN.w / 2} ${LEARN.cy} L ${MEMORY.cx + MEMORY.w / 2} ${MEMORY.cy}`;
const eMS = cH(MEMORY.cx - MEMORY.w / 2, MEMORY.cy, STEWARD.cx + STEWARD.w / 2, STEWARD.cy);

type Hover = { cx: number; cy: number; title: string; desc: string; color: string } | null;

function Dot({ d, color, dur, begin, r = 3 }: { d: string; color: string; dur: number; begin: number; r?: number }) {
  return (
    <circle r={r} fill={color} opacity={0}>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`${begin}s`} />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur={`${dur}s`} repeatCount="indefinite" begin={`${begin}s`} />
    </circle>
  );
}

function Box({ n, label, sub, tag, color, dim, onEnter, onLeave }: { n: { cx: number; cy: number; w: number; h: number }; label: string; sub: string; tag: string; color: string; dim?: boolean; onEnter: () => void; onLeave: () => void }) {
  return (
    <g opacity={dim ? 0.55 : 1} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ cursor: "pointer" }}>
      <rect x={n.cx - n.w / 2} y={n.cy - n.h / 2} width={n.w} height={n.h} rx={9} fill={C.carbon} stroke={color} strokeWidth={2} />
      <circle cx={n.cx + n.w / 2 - 11} cy={n.cy - n.h / 2 + 11} r={3} fill={color}><animate attributeName="opacity" values="1;0.3;1" dur="1.7s" repeatCount="indefinite" /></circle>
      <text x={n.cx - n.w / 2 + 13} y={n.cy + 1} fontSize={17} fill={color} style={{ fontFamily: "var(--font-mono, monospace)" }}>{tag}</text>
      <text x={n.cx + 10} y={n.cy - 2} textAnchor="middle" fontSize={12} fontWeight={800} fill={C.bone} style={{ fontFamily: "var(--font-display, sans-serif)" }}>{label}</text>
      <text x={n.cx + 10} y={n.cy + 13} textAnchor="middle" fontSize={8.5} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{sub}</text>
    </g>
  );
}

export default function OrgLoop() {
  const [si, setSi] = useState(0);
  const [hover, setHover] = useState<Hover>(null);
  useEffect(() => {
    const id = setInterval(() => setSi((v) => (v + 1) % SCEN.length), 6500);
    return () => clearInterval(id);
  }, []);
  const sc = SCEN[si];
  const entering = sc.verdict === "ENTER";
  const vColor = entering ? C.chart : C.bone;

  // card placement: % of the svg box, flipped near top/edges so it never leaves the frame
  const place = (cx: number, cy: number) => {
    const txX = cx < 280 ? "0%" : cx > 1040 ? "-100%" : "-50%";
    const txY = cy < 210 ? "16px" : "calc(-100% - 16px)";
    return { left: `${(cx / VW) * 100}%`, top: `${(cy / VH) * 100}%`, transform: `translate(${txX}, ${txY})` };
  };

  return (
    <section className="relative bg-pitch">
      <div aria-hidden className="gr-hazard h-[10px] opacity-80" />
      <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-bitget">▮</span> THE LOOP · IT RUNS ITSELF · 24/7
        </p>
        <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          A whole firm on one closed <span className="text-chartreuse">cycle</span>. No off switch.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/60">
          A steward wakes the firm, telemetry fans to <span className="text-bone">all twelve desks</span>, the PM
          rules, the risk gate sizes, a rare ENTER fills on <span className="text-bitget">Bitget</span> and anchors
          on Mantle — then the <span className="text-chartreuse">edge-lab learns</span>, memory stores it, and the
          wire loops back. <span className="text-bone/80">Hover any node to see what it does.</span>
        </p>

        <div className="mt-6 inline-flex items-center gap-2 border-2 px-3 py-1.5" style={{ borderColor: entering ? C.chart : "rgba(242,239,230,0.25)" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: entering ? C.chart : C.steel }} />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: entering ? C.chart : C.steel }}>
            analyzing {sc.asset} → {entering ? `ENTER ${sc.dir}` : "ABSTAIN"}
          </span>
        </div>

        <div className="relative mt-6 overflow-hidden border-2 border-bone/20 bg-carbon">
          <div className="gr-carbon-dots" style={{ padding: 8 }}>
            <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="HeliQuant autonomous org loop">
              {/* decorative layer — wires + flowing dots (never capture hover) */}
              <g style={{ pointerEvents: "none" }}>
                <g fill="none" stroke={C.bone} strokeWidth={0.8} opacity={0.14}>
                  {fanIn.map((d, i) => <path key={`i${i}`} d={d} />)}
                  {fanOut.map((d, i) => <path key={`o${i}`} d={d} />)}
                </g>
                <path d={eSI} fill="none" stroke={C.bone} strokeWidth={1.8} opacity={0.5} />
                <path d={ePV} fill="none" stroke={C.chart} strokeWidth={2} opacity={0.5} />
                <path d={eVR} fill="none" stroke={C.bone} strokeWidth={1.8} opacity={0.5} />
                <path d={eRE} fill="none" stroke={C.bitget} strokeWidth={2} opacity={sc.exec ? 0.7 : 0.2} />
                <path d={eEA} fill="none" stroke={C.bitget} strokeWidth={2} opacity={sc.exec ? 0.7 : 0.2} />
                <path d={eAL} fill="none" stroke={C.chart} strokeWidth={1.6} strokeDasharray="7 7" opacity={0.6} />
                <path d={eLM} fill="none" stroke={C.chart} strokeWidth={1.6} strokeDasharray="7 7" opacity={0.6} />
                <path d={eMS} fill="none" stroke={C.chart} strokeWidth={1.6} strokeDasharray="7 7" opacity={0.6} />

                {fanIn.map((d, i) => <Dot key={`fi${i}`} d={d} color={C.steel} dur={2.6} begin={(i % 6) * 0.32} r={2.3} />)}
                {fanOut.map((d, i) => <Dot key={`fo${i}`} d={d} color={isUp(sc.reads[i][1]) ? C.chart : C.bone} dur={2.6} begin={1.1 + (i % 6) * 0.32} r={2.3} />)}
                <Dot d={eSI} color={C.bone} dur={1.5} begin={0} />
                <Dot d={ePV} color={C.chart} dur={1.6} begin={0.3} />
                <Dot d={eVR} color={C.bone} dur={1.4} begin={0.6} />
                <Dot d={eRE} color={C.bitget} dur={1.4} begin={0.9} />
                <Dot d={eEA} color={C.bitget} dur={1.4} begin={1.2} />
                <Dot d={eAL} color={C.chart} dur={1.8} begin={0} r={3.4} />
                <Dot d={eLM} color={C.chart} dur={1.6} begin={0.6} r={3.4} />
                <Dot d={eMS} color={C.chart} dur={2.4} begin={1.2} r={3.4} />
              </g>

              {/* 12 desk nodes (hoverable) */}
              {DESK_NAMES.map((name, i) => {
                const p = dpos(i);
                const [read, vote] = sc.reads[i];
                const vc = voteColor(vote);
                return (
                  <g key={name} onMouseEnter={() => setHover({ cx: p.cx, cy: p.cy, title: name, desc: DESK_DESC[i], color: isUp(vote) ? C.chart : C.bitget })} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
                    <rect x={p.cx - DW / 2} y={p.cy - DH / 2} width={DW} height={DH} rx={7} fill={C.carbon} stroke={isUp(vote) ? C.chart : C.bone} strokeWidth={1.25} opacity={isUp(vote) ? 1 : 0.9} />
                    <circle cx={p.cx - DW / 2 + 11} cy={p.cy} r={3} fill={vc}><animate attributeName="opacity" values="1;0.25;1" dur="1.8s" repeatCount="indefinite" begin={`${(i % 6) * 0.25}s`} /></circle>
                    <text x={p.cx - DW / 2 + 22} y={p.cy - 3} fontSize={10.5} fontWeight={700} fill={C.bone} style={{ fontFamily: "var(--font-mono, monospace)" }}>{name}</text>
                    <text x={p.cx - DW / 2 + 22} y={p.cy + 11} fontSize={8.5} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{read}</text>
                    <text x={p.cx + DW / 2 - 9} y={p.cy + 3} textAnchor="end" fontSize={7.5} fontWeight={700} fill={vc} style={{ fontFamily: "var(--font-mono, monospace)" }}>{vote.toUpperCase()}</text>
                  </g>
                );
              })}

              {/* orchestration + decision + learning nodes (hoverable) */}
              <Box n={STEWARD} label={STEWARD.label} sub={STEWARD.sub} tag={STEWARD.tag} color={STEWARD.color} onEnter={() => setHover({ cx: STEWARD.cx, cy: STEWARD.cy, title: STEWARD.label, desc: STEWARD.desc, color: C.bone })} onLeave={() => setHover(null)} />
              <Box n={INGEST} label={INGEST.label} sub={INGEST.sub} tag={INGEST.tag} color={INGEST.color} onEnter={() => setHover({ cx: INGEST.cx, cy: INGEST.cy, title: INGEST.label, desc: INGEST.desc, color: C.bone })} onLeave={() => setHover(null)} />
              <Box n={PM} label={PM.label} sub={sc.pmSub} tag={PM.tag} color={PM.color} onEnter={() => setHover({ cx: PM.cx, cy: PM.cy, title: "PM · PORTFOLIO MANAGER", desc: PM.desc, color: C.chart })} onLeave={() => setHover(null)} />
              <Box n={{ ...VERDICT }} label={sc.verdict} sub={entering ? sc.dir : "PM holds"} tag="◆" color={vColor} onEnter={() => setHover({ cx: VERDICT.cx, cy: VERDICT.cy, title: "VERDICT", desc: VERDICT.desc, color: vColor })} onLeave={() => setHover(null)} />
              <Box n={RISK} label={RISK.label} sub={sc.riskSub} tag={RISK.tag} color={RISK.color} dim={!entering} onEnter={() => setHover({ cx: RISK.cx, cy: RISK.cy, title: RISK.label, desc: RISK.desc, color: C.bone })} onLeave={() => setHover(null)} />
              <Box n={{ ...EXECUTE }} label="EXECUTE" sub={sc.exec ? "fills on Bitget" : "idle — no ENTER"} tag="⚡" color={sc.exec ? C.bitget : C.steel} dim={!entering} onEnter={() => setHover({ cx: EXECUTE.cx, cy: EXECUTE.cy, title: "EXECUTE", desc: EXECUTE.desc, color: C.bitget })} onLeave={() => setHover(null)} />
              <Box n={{ ...ANCHOR }} label="ANCHOR" sub="sealed on Mantle" tag="⛓" color={C.bitget} dim={!entering} onEnter={() => setHover({ cx: ANCHOR.cx, cy: ANCHOR.cy, title: "ANCHOR", desc: ANCHOR.desc, color: C.bitget })} onLeave={() => setHover(null)} />
              <Box n={LEARN} label={LEARN.label} sub={LEARN.sub} tag={LEARN.tag} color={LEARN.color} onEnter={() => setHover({ cx: LEARN.cx, cy: LEARN.cy, title: "EDGE-LAB · SELF-LEARNING", desc: LEARN.desc, color: C.chart })} onLeave={() => setHover(null)} />
              <Box n={MEMORY} label={MEMORY.label} sub={MEMORY.sub} tag={MEMORY.tag} color={MEMORY.color} onEnter={() => setHover({ cx: MEMORY.cx, cy: MEMORY.cy, title: MEMORY.label, desc: MEMORY.desc, color: C.bone })} onLeave={() => setHover(null)} />
            </svg>
          </div>

          {/* hover card */}
          {hover && (
            <div className="pointer-events-none absolute z-20 w-[280px] border-2 bg-carbon p-3.5" style={{ ...place(hover.cx, hover.cy), borderColor: hover.color, boxShadow: "5px 5px 0 rgba(0,0,0,0.55)" }}>
              <p className="font-display text-sm font-bold uppercase tracking-wide" style={{ color: hover.color }}>{hover.title}</p>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-bone/75">{hover.desc}</p>
            </div>
          )}
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-steel/70">
          the real firm, self-running · steward → 12 desks → PM → risk → Bitget → Mantle → edge-lab learns → memory → loop · mostly ABSTAINs (discipline)
        </p>
      </div>
    </section>
  );
}
