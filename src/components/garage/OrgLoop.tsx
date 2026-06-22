"use client";

/**
 * OrgLoop — "THE LOOP". HeliQuant's autonomous org cycle as an n8n-style node graph whose END feeds
 * back into its START: a single, never-stopping circuit. Telemetry → 12 desks → debate → PM verdict →
 * Bitget execution → on-chain anchor → LEARN → back to telemetry. Data payloads ride the wires
 * continuously (pure SVG/SMIL, no JS tick), so the firm visibly runs itself 24/7 — not on command.
 *
 * Honest framing: the structure + node names are the real cycle; the payload pills are illustrative of
 * the flow (the PM mostly ABSTAINs — the registry is empty by design).
 */

const C = {
  pitch: "var(--color-pitch)",
  carbon: "var(--color-carbon)",
  bone: "var(--color-bone)",
  steel: "var(--color-steel)",
  chart: "var(--color-chartreuse)",
  bitget: "var(--color-bitget)",
};

type Node = { id: string; cx: number; cy: number; title: string; sub: string; tag: string; color: string };
const NODES: Node[] = [
  { id: "ingest", cx: 110, cy: 280, title: "INGEST", sub: "live telemetry", tag: "↯", color: C.bone },
  { id: "desks", cx: 308, cy: 165, title: "12 DESKS", sub: "independent reads", tag: "⌗", color: C.chart },
  { id: "debate", cx: 506, cy: 395, title: "DEBATE", sub: "bull vs bear", tag: "⚖", color: C.bone },
  { id: "verdict", cx: 704, cy: 165, title: "VERDICT", sub: "ENTER · ABSTAIN", tag: "◆", color: C.chart },
  { id: "execute", cx: 902, cy: 395, title: "EXECUTE", sub: "Bitget testnet", tag: "⚡", color: C.bitget },
  { id: "anchor", cx: 1090, cy: 280, title: "ANCHOR", sub: "sealed on Mantle", tag: "⛓", color: C.chart },
];

// handle-to-handle bezier wires (right of Ni → left of Ni+1), then the big return arc N6 → N1
type Seg = { d: string; color: string; dur: number; label: string; dash?: boolean };
const SEGS: Seg[] = [
  { d: "M165,280 C235,280 235,165 253,165", color: C.bone, dur: 3, label: "{ ticks }" },
  { d: "M363,165 C440,165 440,395 451,395", color: C.chart, dur: 3, label: "[ 12 reads ]" },
  { d: "M561,395 C640,395 640,165 649,165", color: C.bone, dur: 3, label: "bull vs bear" },
  { d: "M759,165 C840,165 840,395 847,395", color: C.chart, dur: 3, label: "ABSTAIN" },
  { d: "M957,395 C1020,395 1020,280 1035,280", color: C.bitget, dur: 2.6, label: "⚡ fill" },
  { d: "M1090,307 C1090,500 110,500 110,307", color: C.chart, dur: 5, label: "learn · re-tune", dash: true },
];

function Wire({ s, i }: { s: Seg; i: number }) {
  return (
    <>
      <path d={s.d} fill="none" stroke={s.color} strokeWidth={s.dash ? 1.5 : 2} strokeDasharray={s.dash ? "7 7" : undefined} opacity={s.dash ? 0.7 : 0.55} markerEnd={`url(#hl-arrow-${i})`} />
      {/* traveling payload */}
      <g opacity={0}>
        <rect x={-38} y={-11} width={76} height={22} rx={11} fill={C.carbon} stroke={s.color} strokeWidth={1} />
        <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight={600} fill={s.color} style={{ fontFamily: "var(--font-mono, monospace)" }}>{s.label}</text>
        <animateMotion dur={`${s.dur}s`} repeatCount="indefinite" path={s.d} begin={`${i * 0.5}s`} />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" dur={`${s.dur}s`} repeatCount="indefinite" begin={`${i * 0.5}s`} />
      </g>
    </>
  );
}

export default function OrgLoop() {
  return (
    <section className="relative bg-pitch">
      <div aria-hidden className="gr-hazard h-[10px] opacity-80" />
      <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-bitget">▮</span> THE LOOP · IT RUNS ITSELF · 24/7
        </p>
        <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          One closed <span className="text-chartreuse">cycle</span>. No off switch.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/60">
          Not a command you run — a circuit that never stops. Telemetry feeds twelve desks, the desks
          feed a debate, the PM rules, a rare ENTER fills on <span className="text-bitget">Bitget</span> and
          anchors on Mantle — then the firm <span className="text-bone">learns</span> and the wire loops
          straight back to the start. End meets beginning.
        </p>

        <div className="mt-8 overflow-hidden border-2 border-bone/20 bg-carbon">
          <div aria-hidden className="gr-carbon-dots h-full w-full" style={{ padding: "8px" }}>
            <svg viewBox="0 0 1200 560" className="w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="HeliQuant autonomous org loop">
              <defs>
                {SEGS.map((s, i) => (
                  <marker key={i} id={`hl-arrow-${i}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={s.color} />
                  </marker>
                ))}
              </defs>

              {/* wires + payloads (drawn first, under nodes) */}
              {SEGS.map((s, i) => <Wire key={i} s={s} i={i} />)}

              {/* return-arc caption */}
              <text x={600} y={492} textAnchor="middle" fontSize={12} fontWeight={700} fill={C.chart} letterSpacing="2" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                LEARN → RE-TUNE → THE LOOP NEVER STOPS
              </text>

              {/* nodes */}
              {NODES.map((n) => (
                <g key={n.id}>
                  <rect x={n.cx - 55} y={n.cy - 27} width={110} height={54} rx={9} fill={C.carbon} stroke={n.color} strokeWidth={2} />
                  {/* live dot */}
                  <circle cx={n.cx + 47} cy={n.cy - 19} r={3.5} fill={n.color}>
                    <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                  <text x={n.cx - 42} y={n.cy + 6} fontSize={20} fill={n.color} style={{ fontFamily: "var(--font-mono, monospace)" }}>{n.tag}</text>
                  <text x={n.cx + 6} y={n.cy + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={C.bone} style={{ fontFamily: "var(--font-display, sans-serif)" }}>{n.title}</text>
                  <text x={n.cx} y={n.cy + 46} textAnchor="middle" fontSize={11} fill={C.steel} style={{ fontFamily: "var(--font-mono, monospace)" }}>{n.sub}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-steel/70">
          the real cycle · end feeds start · the PM mostly ABSTAINs (registry empty by design) — discipline, on a loop
        </p>
      </div>
    </section>
  );
}
