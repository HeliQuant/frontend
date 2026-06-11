"use client";

/**
 * MiniCandles — a hand-drawn SVG candlestick for one open position, with its risk frame:
 * entry (bone dashed), STOP (signal-orange), TARGET (chartreuse), live mark (bright tick).
 * No chart library — the geometry IS the data. The price axis auto-fits candles + the SL/TP
 * lines so the whole trade thesis is always in frame.
 */

type Props = {
  candles: { t: number; o: number; h: number; l: number; c: number }[];
  entry: number | null;
  sl: number | null;
  tp: number | null;
  now?: number | null;
  dir: "LONG" | "SHORT";
};

const W = 360;
const H = 150;
const PAD_R = 46; // room for the right-edge price labels

export default function MiniCandles({ candles, entry, sl, tp, now, dir }: Props) {
  if (!candles || candles.length < 2) {
    return (
      <div className="flex h-[150px] items-center justify-center border border-bone/15 bg-pitch font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
        candle feed warming up…
      </div>
    );
  }

  const lo = Math.min(...candles.map((c) => c.l), ...[sl, tp, entry, now].filter((v): v is number => v != null));
  const hi = Math.max(...candles.map((c) => c.h), ...[sl, tp, entry, now].filter((v): v is number => v != null));
  const span = hi - lo || 1;
  const pad = span * 0.06;
  const yMin = lo - pad;
  const yMax = hi + pad;
  const plotW = W - PAD_R;
  const y = (p: number) => H - ((p - yMin) / (yMax - yMin)) * H;
  const n = candles.length;
  const step = plotW / n;
  const bw = Math.max(1.2, step * 0.62);

  const line = (p: number | null, color: string, label: string, dashed = false) => {
    if (p == null) return null;
    const yy = y(p);
    return (
      <g>
        <line x1={0} x2={plotW} y1={yy} y2={yy} stroke={color} strokeWidth={1} strokeDasharray={dashed ? "4 3" : undefined} opacity={0.9} />
        <rect x={plotW} y={yy - 7} width={PAD_R} height={14} fill="#0b0b0b" />
        <text x={plotW + 3} y={yy + 3} fontSize={8} fontFamily="monospace" fill={color} letterSpacing={0.4}>
          {label}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[150px] w-full bg-pitch" role="img" aria-label="position candlestick">
      {/* risk frame */}
      {line(tp, "#c9f24b", "TP", false)}
      {line(sl, "#ff5a1f", "SL", false)}
      {line(entry, "#f2efe6", "ENT", true)}

      {/* candles */}
      {candles.map((c, i) => {
        const x = i * step + step / 2;
        const up = c.c >= c.o;
        const col = up ? "#c9f24b" : "#8b8b80";
        const yO = y(c.o);
        const yC = y(c.c);
        const top = Math.min(yO, yC);
        const bh = Math.max(1, Math.abs(yC - yO));
        return (
          <g key={c.t}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={0.8} opacity={0.85} />
            <rect x={x - bw / 2} y={top} width={bw} height={bh} fill={col} opacity={0.95} />
          </g>
        );
      })}

      {/* live mark */}
      {now != null && (
        <g>
          <line x1={0} x2={plotW} y1={y(now)} y2={y(now)} stroke="#6ea8ff" strokeWidth={0.8} opacity={0.5} />
          <polygon points={`${plotW - 6},${y(now) - 4} ${plotW},${y(now)} ${plotW - 6},${y(now) + 4}`} fill="#6ea8ff" />
        </g>
      )}

      {/* direction tag */}
      <text x={4} y={12} fontSize={9} fontFamily="monospace" fontWeight={700} fill={dir === "SHORT" ? "#ff5a1f" : "#c9f24b"} letterSpacing={1}>
        {dir}
      </text>
    </svg>
  );
}
