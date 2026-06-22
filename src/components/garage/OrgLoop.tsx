"use client";

/**
 * OrgLoop — "THE LOOP". HeliQuant's autonomous org cycle as a node manifold whose END feeds back into
 * its START. Telemetry fans to ALL 12 desks → they converge into the PM → the PM rules → on ENTER it
 * fills on Bitget + anchors on Mantle → the firm learns → the wire loops back. It self-cycles between a
 * real ABSTAIN read and a real ENTER (open-position) read, so the demo shows BOTH outcomes — the firm
 * opens trades (79 live Bitget-testnet fills) but mostly holds (no validated edge = discipline).
 *
 * Honest: 12 real desks, qualitative reads (no fabricated numbers); ENTER is an exploration/aligned
 * trade (real on the Bitget testnet), ABSTAIN is the default (registry empty by design).
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
const voteColor = (v: Vote) =>
  v === "long" || v === "confirm" || v === "lean" ? C.chart : v === "fade" ? C.signal2 : v === "neutral" ? C.bone : C.steel;

const DESK_NAMES = ["REGIME", "OI-CONTRARIAN", "SMART-MONEY", "ON-CHAIN", "MACRO · ALLORA", "SENTIMENT", "CARRY", "MANTLE-FUND", "TIMESFM · VOL", "MULTI-TF", "FLOW-INTEL", "WHALE"];

// Two real outcomes the loop cycles through. reads[i] = [read, vote] for DESK_NAMES[i].
const SCEN = [
  {
    asset: "BTC", verdict: "ABSTAIN", dir: "", exec: false, pmSub: "no edge · holds",
    reads: [["choppy / no trend", "neutral"], ["no extreme", "abstain"], ["whales split", "abstain"], ["flows quiet", "abstain"],
      ["no signal", "abstain"], ["mixed", "abstain"], ["funding thin", "skip"], ["no catalyst", "abstain"],
      ["forecast flat", "abstain"], ["1h vs 1D opposed", "fade"], ["no FDR edge", "abstain"], ["no conviction", "abstain"]] as [string, Vote][],
  },
  {
    asset: "HYPE", verdict: "ENTER", dir: "LONG", exec: true, pmSub: "trend + multi-TF · sized",
    reads: [["clean uptrend", "long"], ["no extreme", "abstain"], ["whales long", "long"], ["inflows", "lean"],
      ["bullish", "long"], ["positive", "lean"], ["funding ok", "skip"], ["n/a", "abstain"],
      ["vol expanding", "long"], ["1h·4h·1D aligned", "confirm"], ["no FDR edge", "abstain"], ["accumulating", "long"]] as [string, Vote][],
  },
];

// ── geometry (viewBox 1280 × 760) ──
const DW = 176, DH = 46;
const COL_X = [360, 596];
const ROW_Y = [70, 188, 306, 424, 542, 660];
const deskPos = (i: number) => ({ cx: COL_X[i % 2], cy: ROW_Y[Math.floor(i / 2)] });

const INGEST = { cx: 104, cy: 365, w: 116, h: 58 };
const PM = { cx: 884, cy: 365, w: 132, h: 66 };
const VERDICT = { cx: 1146, cy: 175, w: 118, h: 54 };
const EXECUTE = { cx: 1146, cy: 365, w: 118, h: 54 };
const ANCHOR = { cx: 1146, cy: 555, w: 118, h: 54 };

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

const fanIn = DESK_NAMES.map((_, i) => { const p = deskPos(i); return curve(INGEST.cx + INGEST.w / 2, INGEST.cy, p.cx - DW / 2, p.cy); });
const fanOut = DESK_NAMES.map((_, i) => { const p = deskPos(i); return curve(p.cx + DW / 2, p.cy, PM.cx - PM.w / 2, PM.cy); });
const wPV = curve(PM.cx + PM.w / 2, PM.cy, VERDICT.cx, VERDICT.cy + VERDICT.h / 2);
const wVE = `M ${VERDICT.cx} ${VERDICT.cy + VERDICT.h / 2} L ${EXECUTE.cx} ${EXECUTE.cy - EXECUTE.h / 2}`;
const wEA = `M ${EXECUTE.cx} ${EXECUTE.cy + EXECUTE.h / 2} L ${ANCHOR.cx} ${ANCHOR.cy - ANCHOR.h / 2}`;
const wReturn = `M ${ANCHOR.cx} ${ANCHOR.cy + ANCHOR.h / 2} C ${ANCHOR.cx} 720, ${INGEST.cx} 720, ${INGEST.cx} ${INGEST.cy + INGEST.h / 2}`;

function Dot({ path, color, dur, begin, r = 3 }: { path: string; color: string; dur: number; begin: number; r?: number }) {
  return (
    <circle r={r} fill={color} opacity={0}>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={path} begin={`${begin}s`} />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur={`${dur}s`} repeatCount="indefinite" begin={`${begin}s`} />
    </circle>
  );
}

export default function OrgLoop() {
  const [si, setSi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSi((v) => (v + 1) % SCEN.length), 6500);
    return () => clearInterval(id);
  }, []);
  const sc = SCEN[si];
  const entering = sc.verdict === "ENTER";
  const vColor = entering ? C.chart : C.bone;
  const eColor = sc.exec ? C.bitget : C.steel;

  return (
    <section className="relative bg-pitch">
      <div aria-hidden className="gr-hazard h-[10px] opacity-80" />
      <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-bitget">▮</span> THE LOOP · IT RUNS ITSELF · 24/7
        </p>
        <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          Twelve desks, one closed <span className="text-chartreuse">cycle</span>. No off switch.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/60">
          Telemetry fans out to <span className="text-bone">all twelve desks</span>; they converge into the PM.
          Most cycles it <span className="text-bone">holds</span> — no validated edge, no trade. When the desks
          align, it <span className="text-chartreuse">ENTERs</span>, fills on <span className="text-bitget">Bitget</span>,
          and anchors on Mantle — then learns and loops back.
        </p>

        {/* live cycle pill */}
        <div className="mt-6 inline-flex items-center gap-2 border-2 px-3 py-1.5" style={{ borderColor: entering ? C.chart : "rgba(242,239,230,0.25)" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: entering ? C.chart : C.steel }} />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: entering ? C.chart : C.steel }}>
            analyzing {sc.asset} → {entering ? `ENTER ${sc.dir}` : "ABSTAIN"}
          </span>
        </div>

        <div className="mt-6 overflow-hidden border-2 border-bone/20 bg-carbon">
          <div aria-hidden className="gr-carbon-dots" style={{ padding: 8 }}>
            <svg viewBox="0 0 1280 760" className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="HeliQuant autonomous org loop">
              {/* manifold: fan-in + fan-out (thin + faint) */}
              <g fill="none" stroke={C.bone} strokeWidth={0.85} opacity={0.16}>
                {fanIn.map((d, i) => <path key={`i${i}`} d={d} />)}
                {fanOut.map((d, i) => <path key={`o${i}`} d={d} />)}
              </g>

              {/* pipeline wires (EXECUTE/ANCHOR brighten on ENTER) */}
              <path d={wPV} fill="none" stroke={C.chart} strokeWidth={2} opacity={0.5} />
              <path d={wVE} fill="none" stroke={C.bitget} strokeWidth={2} opacity={sc.exec ? 0.7 : 0.18} />
              <path d={wEA} fill="none" stroke={C.bitget} strokeWidth={2} opacity={sc.exec ? 0.7 : 0.18} />
              <path d={wReturn} fill="none" stroke={C.chart} strokeWidth={1.5} strokeDasharray="7 7" opacity={0.65} />

              {/* flowing dots */}
              {[0, 4, 7, 11].map((i, k) => <Dot key={`di${i}`} path={fanIn[i]} color={C.steel} dur={2.4} begin={k * 0.4} r={2.5} />)}
              {[1, 5, 9].map((i, k) => <Dot key={`do${i}`} path={fanOut[i]} color={C.bone} dur={2.4} begin={1 + k * 0.4} r={2.5} />)}
              <Dot path={wPV} color={C.chart} dur={1.6} begin={0} />
              {sc.exec && <Dot path={wVE} color={C.bitget} dur={1.3} begin={0.4} />}
              {sc.exec && <Dot path={wEA} color={C.bitget} dur={1.3} begin={0.9} />}
              <Dot path={wReturn} color={C.chart} dur={3} begin={0} r={3.5} />

              <text x={640} y={714} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.chart} letterSpacing="2" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                LEARN → RE-TUNE → THE LOOP NEVER STOPS
              </text>

              {/* 12 desk nodes */}
              {DESK_NAMES.map((name, i) => {
                const p = deskPos(i);
                const [read, vote] = sc.reads[i];
                const vc = voteColor(vote);
                return (
                  <g key={name}>
                    <rect x={p.cx - DW / 2} y={p.cy - DH / 2} width={DW} height={DH} rx={7} fill={C.carbon} stroke={vote === "long" || vote === "confirm" || vote === "lean" ? C.chart : C.bone} strokeWidth={1.25} opacity={vote === "long" || vote === "confirm" || vote === "lean" ? 1 : 0.9} />
                    <circle cx={p.cx - DW / 2 + 11} cy={p.cy} r={3} fill={vc}>
                      <animate attributeName="opacity" values="1;0.25;1" dur="1.8s" repeatCount="indefinite" begin={`${(i % 6) * 0.25}s`} />
                    </circle>
                    <text x={p.cx - DW / 2 + 22} y={p.cy - 3} fontSize={11} fontWeight={700} fill={C.bone} style={{ fontFamily: "var(--font-mono, monospace)" }}>{name}</text>
                    <text x={p.cx - DW / 2 + 22} y={p.cy + 12} fontSize={9} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{read}</text>
                    <text x={p.cx + DW / 2 - 10} y={p.cy + 4} textAnchor="end" fontSize={8} fontWeight={700} fill={vc} style={{ fontFamily: "var(--font-mono, monospace)" }}>{vote.toUpperCase()}</text>
                  </g>
                );
              })}

              {/* INGEST */}
              <g>
                <rect x={INGEST.cx - INGEST.w / 2} y={INGEST.cy - INGEST.h / 2} width={INGEST.w} height={INGEST.h} rx={9} fill={C.carbon} stroke={C.bone} strokeWidth={2} />
                <text x={INGEST.cx - INGEST.w / 2 + 12} y={INGEST.cy + 1} fontSize={18} fill={C.bone} style={{ fontFamily: "var(--font-mono, monospace)" }}>↯</text>
                <text x={INGEST.cx + 8} y={INGEST.cy - 2} textAnchor="middle" fontSize={13} fontWeight={800} fill={C.bone} style={{ fontFamily: "var(--font-display, sans-serif)" }}>INGEST</text>
                <text x={INGEST.cx + 8} y={INGEST.cy + 14} textAnchor="middle" fontSize={9} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>telemetry</text>
              </g>
              {/* PM */}
              <g>
                <rect x={PM.cx - PM.w / 2} y={PM.cy - PM.h / 2} width={PM.w} height={PM.h} rx={9} fill={C.carbon} stroke={C.chart} strokeWidth={2} />
                <text x={PM.cx - PM.w / 2 + 14} y={PM.cy + 1} fontSize={18} fill={C.chart} style={{ fontFamily: "var(--font-mono, monospace)" }}>⚖</text>
                <text x={PM.cx + 10} y={PM.cy - 2} textAnchor="middle" fontSize={13} fontWeight={800} fill={C.bone} style={{ fontFamily: "var(--font-display, sans-serif)" }}>PM</text>
                <text x={PM.cx + 10} y={PM.cy + 14} textAnchor="middle" fontSize={9} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{sc.pmSub}</text>
              </g>
              {/* VERDICT (dynamic) */}
              <g>
                <rect x={VERDICT.cx - VERDICT.w / 2} y={VERDICT.cy - VERDICT.h / 2} width={VERDICT.w} height={VERDICT.h} rx={9} fill={C.carbon} stroke={vColor} strokeWidth={2} />
                <text x={VERDICT.cx} y={VERDICT.cy - 1} textAnchor="middle" fontSize={16} fontWeight={800} fill={vColor} style={{ fontFamily: "var(--font-display, sans-serif)" }}>{sc.verdict}</text>
                <text x={VERDICT.cx} y={VERDICT.cy + 15} textAnchor="middle" fontSize={9} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{entering ? sc.dir : "PM holds"}</text>
              </g>
              {/* EXECUTE (active on ENTER) */}
              <g opacity={sc.exec ? 1 : 0.5}>
                <rect x={EXECUTE.cx - EXECUTE.w / 2} y={EXECUTE.cy - EXECUTE.h / 2} width={EXECUTE.w} height={EXECUTE.h} rx={9} fill={C.carbon} stroke={eColor} strokeWidth={2} />
                {sc.exec && <circle cx={EXECUTE.cx + EXECUTE.w / 2 - 12} cy={EXECUTE.cy - EXECUTE.h / 2 + 12} r={3.5} fill={C.bitget}><animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" /></circle>}
                <text x={EXECUTE.cx - EXECUTE.w / 2 + 14} y={EXECUTE.cy + 1} fontSize={18} fill={eColor} style={{ fontFamily: "var(--font-mono, monospace)" }}>⚡</text>
                <text x={EXECUTE.cx + 10} y={EXECUTE.cy - 2} textAnchor="middle" fontSize={13} fontWeight={800} fill={C.bone} style={{ fontFamily: "var(--font-display, sans-serif)" }}>EXECUTE</text>
                <text x={EXECUTE.cx + 10} y={EXECUTE.cy + 14} textAnchor="middle" fontSize={9} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{sc.exec ? "fills on Bitget" : "idle — no ENTER"}</text>
              </g>
              {/* ANCHOR */}
              <g opacity={sc.exec ? 1 : 0.6}>
                <rect x={ANCHOR.cx - ANCHOR.w / 2} y={ANCHOR.cy - ANCHOR.h / 2} width={ANCHOR.w} height={ANCHOR.h} rx={9} fill={C.carbon} stroke={C.bitget} strokeWidth={2} />
                <text x={ANCHOR.cx - ANCHOR.w / 2 + 14} y={ANCHOR.cy + 1} fontSize={16} fill={C.bitget} style={{ fontFamily: "var(--font-mono, monospace)" }}>⛓</text>
                <text x={ANCHOR.cx + 10} y={ANCHOR.cy - 2} textAnchor="middle" fontSize={13} fontWeight={800} fill={C.bone} style={{ fontFamily: "var(--font-display, sans-serif)" }}>ANCHOR</text>
                <text x={ANCHOR.cx + 10} y={ANCHOR.cy + 14} textAnchor="middle" fontSize={9} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>sealed on Mantle</text>
              </g>
            </svg>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-steel/70">
          the real 12-desk cycle, self-running · ENTER fills on the Bitget testnet (79 live) · mostly ABSTAINs — discipline, on a loop
        </p>
      </div>
    </section>
  );
}
