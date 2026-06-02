"use client";

/**
 * TheEdgeSection — the ONE validated edge (MNT · OI-Contrarian) + the 2-tier asset universe.
 * Every figure is read live from `EDGE` / `UNIVERSE` in @/lib/heliquant — nothing is invented.
 * Honesty-by-design: the caveat sits next to the headline numbers, not buried.
 */

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react";

import { EDGE, UNIVERSE, type Asset } from "@/lib/heliquant";

/* ───────────────────────── motion presets ───────────────────────── */

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ───────────────────────── count-up tile ───────────────────────── */

type CountUpProps = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

/** Animated number that runs once when scrolled into view; static when reduced-motion is on. */
function CountUp({ to, decimals = 0, prefix = "", suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);
  const [snapshot, setSnapshot] = useState(`${prefix}${(0).toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (reduce) {
      setSnapshot(`${prefix}${to.toFixed(decimals)}${suffix}`);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, to, { duration: 1.1, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduce, to, decimals, prefix, suffix, mv]);

  if (reduce) return <span ref={ref}>{snapshot}</span>;
  return <motion.span ref={ref}>{text}</motion.span>;
}

/* ───────────────────────── stat tile ───────────────────────── */

type StatTileProps = {
  label: string;
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  accent?: boolean;
};

function StatTile({ label, to, decimals = 0, prefix = "", suffix = "", accent = false }: StatTileProps) {
  return (
    <div className="rounded-card-sm border border-fog-border/70 bg-ghost-canvas px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ash-medium">{label}</p>
      <p
        className={`mt-1.5 font-mono text-[26px] leading-none font-medium tabular-nums ${
          accent ? "text-win" : "text-midnight-navy"
        }`}
      >
        <CountUp to={to} decimals={decimals} prefix={prefix} suffix={suffix} />
      </p>
    </div>
  );
}

/* ───────────────────────── win-rate gauge (SVG) ───────────────────────── */

/** Semicircular gauge filled to `pct` (0–100). Sweeps in once on view. */
function WinGauge({ pct }: { pct: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  // Semicircle arc, radius 70, centered at (90,90), drawn left→right across the top.
  const r = 70;
  const cx = 90;
  const cy = 90;
  const arcLen = Math.PI * r; // half-circumference
  const fillFrac = Math.min(Math.max(pct, 0), 100) / 100;
  const active = reduce ? true : inView;

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={ref}
        viewBox="0 0 180 104"
        role="img"
        aria-label={`Win rate ${pct.toFixed(1)} percent`}
        className="w-[180px]"
      >
        {/* track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--color-fog-border)"
          strokeOpacity={0.55}
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* fill */}
        <motion.path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--color-win)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          initial={{ strokeDashoffset: arcLen }}
          animate={{ strokeDashoffset: active ? arcLen * (1 - fillFrac) : arcLen }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="-mt-7 text-center">
        <p className="font-mono text-[22px] font-medium leading-none text-win tabular-nums">
          <CountUp to={pct} decimals={1} suffix="%" />
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ash-medium">Win rate</p>
      </div>
    </div>
  );
}

/* ───────────────────────── R:R ladder (SVG-ish bars) ───────────────────────── */

type Rung = { label: string; risk: number; reward: number; tone: "abstain" | "aggressive" };

const RUNGS: Rung[] = [
  { label: "SAFE — default posture", risk: 1, reward: 2, tone: "abstain" },
  // payoff is read live from EDGE below (set in component to avoid stale literal)
  { label: "AGGRESSIVE — edge fired", risk: 1, reward: EDGE.payoff, tone: "aggressive" },
];

function RungBar({ rung }: { rung: Rung }) {
  const color = rung.tone === "aggressive" ? "var(--color-aggressive)" : "var(--color-abstain)";
  // Scale: reward of 2.0 → ~58% of the track; clamp so payoff stays in-frame.
  const maxR = 3;
  const rewardW = `${Math.min(rung.reward / maxR, 1) * 100}%`;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span
          className="text-[12px] font-medium tracking-tight"
          style={{ color: rung.tone === "aggressive" ? "var(--color-aggressive)" : "var(--color-slate-ink)" }}
        >
          {rung.label}
        </span>
        <span className="font-mono text-[12px] tabular-nums text-ash-medium">
          1 : {rung.reward.toFixed(rung.reward % 1 === 0 ? 0 : 1)}
        </span>
      </div>
      <div className="mt-1.5 flex h-2.5 items-center gap-1 overflow-hidden rounded-badge bg-ghost-canvas">
        <span className="h-full w-[16px] shrink-0 rounded-l-badge" style={{ background: "var(--color-loss)" }} />
        <motion.span
          className="h-full rounded-r-badge"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: rewardW }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/* ───────────────────────── universe chip ───────────────────────── */

const EDGE_BADGE: Record<Asset["edge"], { label: string; cls: string }> = {
  validated: { label: "validated edge", cls: "bg-win/12 text-win" },
  monitored: { label: "monitored", cls: "bg-slate-ink/10 text-slate-ink" },
  context: { label: "macro context", cls: "bg-ash-medium/10 text-ash-medium" },
};

function AssetChip({ asset, index }: { asset: Asset; index: number }) {
  const isHero = asset.edge === "validated";
  const badge = EDGE_BADGE[asset.edge];
  return (
    <motion.li
      custom={index}
      variants={reveal}
      className={[
        "group relative flex flex-col gap-2 rounded-card-md border p-4 transition-shadow",
        isHero
          ? "border-win/40 bg-pure-surface shadow-card ring-1 ring-win/25"
          : "border-fog-border/70 bg-pure-surface hover:shadow-badge",
      ].join(" ")}
    >
      {isHero && (
        <span className="hq-pulse absolute right-4 top-4 h-2 w-2 rounded-full bg-win" aria-hidden />
      )}
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-[17px] font-medium ${isHero ? "text-win" : "text-midnight-navy"}`}>
          {asset.sym}
        </span>
        <span className="truncate text-[12px] text-ash-medium">{asset.name}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-badge px-2 py-0.5 text-[10.5px] font-semibold tracking-tight ${badge.cls}`}>
          {badge.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ash-medium/80">{asset.mode}</span>
      </div>
    </motion.li>
  );
}

function TierColumn({
  kicker,
  title,
  assets,
}: {
  kicker: string;
  title: string;
  assets: Asset[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="font-display text-[18px] text-midnight-navy">{title}</h4>
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ash-medium">{kicker}</span>
      </div>
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-8% 0px" }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {assets.map((a, i) => (
          <AssetChip key={a.sym} asset={a} index={i} />
        ))}
      </motion.ul>
    </div>
  );
}

/* ───────────────────────── section ───────────────────────── */

export default function TheEdgeSection() {
  const mantleEco = UNIVERSE.filter((a) => a.tier === "mantle-eco");
  const macro = UNIVERSE.filter((a) => a.tier === "macro");
  const winPct = EDGE.pWin * 100;

  return (
    <section id="edge" className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
      {/* heading */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px" }}
        className="max-w-3xl"
      >
        <motion.p
          variants={reveal}
          className="text-[12px] font-semibold uppercase tracking-[0.2em] text-win"
        >
          The edge — and only the edge
        </motion.p>
        <motion.h2
          variants={reveal}
          custom={1}
          className="font-display mt-3 text-[34px] leading-[1.08] text-midnight-navy text-balance md:text-[44px]"
        >
          One real edge. Honestly scoped.
        </motion.h2>
        <motion.p
          variants={reveal}
          custom={2}
          className="mt-4 text-[16px] leading-relaxed text-slate-ink"
        >
          Most projects show a dashboard of imaginary alphas. We registered exactly one that
          survives cost-aware, out-of-sample testing — and we put its caveat right next to its
          headline number.
        </motion.p>
      </motion.div>

      {/* featured edge card */}
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 overflow-hidden rounded-card border border-fog-border/70 bg-pure-surface shadow-card"
      >
        <div className="grid gap-0 lg:grid-cols-[1.45fr_1fr]">
          {/* left — title, stats, method, caveat */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="hq-pulse h-2.5 w-2.5 rounded-full bg-chartreuse ring-2 ring-chartreuse/30" aria-hidden />
              <h3 className="font-display text-[24px] leading-tight text-midnight-navy md:text-[27px]">
                {EDGE.asset} · {EDGE.name}
              </h3>
              <span className="rounded-badge bg-win/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-win">
                Validated
              </span>
            </div>

            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-storm-gray">{EDGE.method}</p>

            {/* stat tiles */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Win" to={winPct} decimals={1} suffix="%" accent />
              <StatTile label="Payoff" to={EDGE.payoff} decimals={2} prefix="×" />
              <StatTile label="Trades" to={EDGE.trades} />
              <StatTile label="OOS ROI" to={EDGE.oosRoiPct} decimals={1} prefix="+" suffix="%" accent />
            </div>

            {/* caveat — honesty front-and-centre */}
            <div
              className="mt-6 flex gap-3 rounded-card-sm border p-4"
              style={{ borderColor: "var(--color-loss)", background: "rgba(229,72,77,0.06)" }}
            >
              <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden>
                <path
                  d="M12 3 1.5 21h21L12 3Z"
                  fill="none"
                  stroke="var(--color-loss)"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                />
                <path d="M12 9.5v5" stroke="var(--color-loss)" strokeWidth={1.8} strokeLinecap="round" />
                <circle cx="12" cy="17.4" r="1" fill="var(--color-loss)" />
              </svg>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-loss">The honest caveat</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-storm-gray">{EDGE.caveat}</p>
              </div>
            </div>
          </div>

          {/* right — gauge + payoff + R:R ladder + unlock note */}
          <div className="border-t border-fog-border/60 bg-ghost-canvas/60 p-6 md:p-8 lg:border-l lg:border-t-0">
            <WinGauge pct={winPct} />

            <div className="mt-7 space-y-4">
              {RUNGS.map((r) => (
                <RungBar key={r.label} rung={r} />
              ))}
            </div>

            <div className="mt-6 rounded-card-sm border border-aggressive/25 bg-aggressive/8 p-4">
              <p className="text-[13px] leading-relaxed text-storm-gray">
                <span className="font-semibold text-aggressive">Validated edge + live signal + aligned direction</span>{" "}
                unlocks <span className="font-mono font-medium text-aggressive">AGGRESSIVE</span> sizing —
                fractional-Kelly, <span className="font-mono">≤3%</span> risk,{" "}
                <span className="font-mono">≤5×</span> leverage. Otherwise the firm stays{" "}
                <span className="font-mono font-medium text-abstain">SAFE</span> or abstains.
              </p>
            </div>
          </div>
        </div>
      </motion.article>

      {/* universe */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px" }}
        className="mt-16 max-w-3xl"
      >
        <motion.p variants={reveal} className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-ink">
          The universe — two tiers, one discipline
        </motion.p>
        <motion.h3
          variants={reveal}
          custom={1}
          className="font-display mt-3 text-[26px] leading-tight text-midnight-navy md:text-[30px]"
        >
          We trade the Mantle ecosystem. The majors give macro context.
        </motion.h3>
        <motion.p variants={reveal} custom={2} className="mt-3 text-[15px] leading-relaxed text-slate-ink">
          Only <span className="font-semibold text-win">{EDGE.asset}</span> carries a validated edge. Every
          other asset runs the same cost-aware, OOS-gated pipeline — and, lacking an edge, most often the
          disciplined answer is to <span className="font-mono font-medium text-abstain">ABSTAIN</span>.
        </motion.p>
      </motion.div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <TierColumn kicker="traded" title="Mantle ecosystem" assets={mantleEco} />
        <TierColumn kicker="macro context" title="Majors" assets={macro} />
      </div>
    </section>
  );
}
