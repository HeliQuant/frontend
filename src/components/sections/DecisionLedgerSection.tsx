"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { fetchDecisions } from "@/lib/supabase";
import { type Decision, MANTLESCAN, FIRST_ANCHOR } from "@/lib/heliquant";

// ───────────────────────────── helpers ─────────────────────────────

/** Truncate an address/hash to 0x1234…abcd. Short strings pass through untouched. */
function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Compact, locale-stable timestamp for a data-dense row (UTC, no surprises across machines). */
function formatTs(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const date = d.toLocaleDateString("en-CA", { timeZone: "UTC" }); // YYYY-MM-DD
  const time = d.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

/** Signed, fixed-precision percentage. null → em dash. */
function formatPct(pct: number | null): string {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function isEnter(decision: string): boolean {
  return decision.toUpperCase() === "ENTER";
}

type LoadState = "loading" | "ready" | "error";

type Stats = {
  total: number;
  open: number;
  resolved: number;
  winRate: number | null; // fraction 0..1 across resolved-with-outcome rows; null if none
};

function computeStats(rows: Decision[]): Stats {
  const total = rows.length;
  const open = rows.filter((r) => r.status === "open").length;
  const resolved = rows.filter((r) => r.status === "resolved").length;
  const decided = rows.filter((r) => r.outcome === "TP" || r.outcome === "SL");
  const wins = decided.filter((r) => r.outcome === "TP").length;
  const winRate = decided.length > 0 ? wins / decided.length : null;
  return { total, open, resolved, winRate };
}

// ───────────────────────────── motion ─────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 90, damping: 16, mass: 0.9 };

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...SPRING, delay: 0.05 + i * 0.06 },
  }),
};

// ───────────────────────────── leaf presentational pieces ─────────────────────────────

function DecisionBadge({ decision }: { decision: string }) {
  const enter = isEnter(decision);
  const label = decision.toUpperCase();
  return (
    <span
      className={
        enter
          ? "inline-flex items-center rounded-card-sm border border-win px-2 py-0.5 font-mono text-caption font-medium text-win"
          : "inline-flex items-center rounded-card-sm px-2 py-0.5 font-mono text-caption font-medium text-abstain"
      }
    >
      {label}
    </span>
  );
}

function OutcomeCell({ outcome }: { outcome: Decision["outcome"] }) {
  if (outcome === "TP") return <span className="font-mono text-caption font-medium text-win">TP</span>;
  if (outcome === "SL") return <span className="font-mono text-caption font-medium text-loss">SL</span>;
  if (outcome === "TIMEOUT")
    return <span className="font-mono text-caption text-ash-medium">TIMEOUT</span>;
  return <span className="font-mono text-caption text-ash-medium">—</span>;
}

function PnlCell({ pnl }: { pnl: number | null }) {
  const text = formatPct(pnl);
  const tone =
    pnl === null || pnl === undefined || Number.isNaN(pnl)
      ? "text-ash-medium"
      : pnl > 0
        ? "text-win"
        : pnl < 0
          ? "text-loss"
          : "text-slate-ink";
  return <span className={`font-mono text-caption ${tone}`}>{text}</span>;
}

function OnchainCell({ txHash }: { txHash?: string | null }) {
  if (!txHash) return <span className="font-mono text-caption text-ash-medium">—</span>;
  return (
    <a
      href={`${MANTLESCAN}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-caption text-onchain underline decoration-onchain/30 underline-offset-2 transition-colors hover:decoration-onchain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onchain"
      title={txHash}
    >
      view <span aria-hidden>↗</span>
    </a>
  );
}

// ───────────────────────────── stats strip ─────────────────────────────

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <span className="font-mono text-caption uppercase tracking-wide text-ash-medium">{label}</span>
      <span className="font-mono text-heading-sm font-medium text-midnight-navy">{value}</span>
    </div>
  );
}

function StatsStrip({ stats, cold }: { stats: Stats; cold: boolean }) {
  if (cold) {
    return (
      <div className="mb-10 rounded-card-md border border-fog-border bg-pure-surface px-6 py-5 shadow-card">
        <p className="font-mono text-caption uppercase tracking-wide text-ash-medium">cold start</p>
        <p className="mt-2 text-body text-slate-ink">
          No decisions in the ledger yet. Stats populate as the firm records its first calls — and
          it only acts when a validated edge fires.
        </p>
      </div>
    );
  }
  return (
    <div className="mb-10 flex flex-wrap items-end gap-x-10 gap-y-6 rounded-card-md border border-fog-border bg-pure-surface px-6 py-6 shadow-card">
      <StatItem label="total" value={String(stats.total)} />
      <StatItem label="open" value={String(stats.open)} />
      <StatItem label="resolved" value={String(stats.resolved)} />
      <StatItem
        label="resolved win-rate"
        value={stats.winRate === null ? "—" : `${Math.round(stats.winRate * 100)}%`}
      />
    </div>
  );
}

// ───────────────────────────── table (md+) ─────────────────────────────

const COLS = [
  "ts",
  "ticker",
  "regime",
  "decision",
  "direction",
  "confidence",
  "outcome",
  "pnl %",
  "on-chain",
];

function LedgerTable({ rows }: { rows: Decision[] }) {
  return (
    <div className="hidden overflow-hidden rounded-card border border-fog-border bg-pure-surface shadow-card md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-fog-border">
            {COLS.map((c) => (
              <th
                key={c}
                scope="col"
                className="px-4 py-3 font-mono text-caption font-medium uppercase tracking-wide text-ash-medium"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-fog-border/60 transition-colors last:border-b-0 hover:bg-ghost-canvas"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-caption text-slate-ink">
                {formatTs(r.ts)}
              </td>
              <td className="px-4 py-3 font-mono text-caption font-medium text-midnight-navy">
                {r.ticker}
              </td>
              <td className="px-4 py-3 text-caption text-slate-ink">{r.regime ?? "—"}</td>
              <td className="px-4 py-3">
                <DecisionBadge decision={r.decision} />
              </td>
              <td className="px-4 py-3 font-mono text-caption text-slate-ink">
                {r.direction && r.direction !== "NONE" ? r.direction : "—"}
              </td>
              <td className="px-4 py-3 font-mono text-caption text-slate-ink">
                {r.confidence ?? "—"}
              </td>
              <td className="px-4 py-3">
                <OutcomeCell outcome={r.outcome} />
              </td>
              <td className="px-4 py-3">
                <PnlCell pnl={r.pnl_pct} />
              </td>
              <td className="px-4 py-3">
                <OnchainCell txHash={r.tx_hash} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ───────────────────────────── stacked cards (small screens) ─────────────────────────────

function LedgerCards({ rows }: { rows: Decision[] }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {rows.map((r) => (
        <div
          key={r.id}
          className="rounded-card-md border border-fog-border bg-pure-surface p-4 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-body font-medium text-midnight-navy">{r.ticker}</span>
              <DecisionBadge decision={r.decision} />
            </div>
            <OnchainCell txHash={r.tx_hash} />
          </div>
          <p className="mt-1 font-mono text-caption text-ash-medium">{formatTs(r.ts)}</p>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <Field label="regime" value={r.regime ?? "—"} mono={false} />
            <Field
              label="direction"
              value={r.direction && r.direction !== "NONE" ? r.direction : "—"}
            />
            <Field label="confidence" value={r.confidence ?? "—"} />
            <div className="flex flex-col gap-0.5">
              <dt className="font-mono text-caption uppercase tracking-wide text-ash-medium">
                outcome
              </dt>
              <dd>
                <OutcomeCell outcome={r.outcome} />
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="font-mono text-caption uppercase tracking-wide text-ash-medium">
                pnl %
              </dt>
              <dd>
                <PnlCell pnl={r.pnl_pct} />
              </dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-caption uppercase tracking-wide text-ash-medium">{label}</dt>
      <dd className={`${mono ? "font-mono " : ""}text-caption text-slate-ink`}>{value}</dd>
    </div>
  );
}

// ───────────────────────────── empty state + first-anchor proof ─────────────────────────────

function EmptyState() {
  return (
    <motion.div
      custom={1}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="rounded-card border border-fog-border bg-pure-surface p-8 shadow-card md:p-10"
    >
      <p className="font-mono text-caption uppercase tracking-wide text-ash-medium">empty ledger</p>
      <p className="mt-3 max-w-2xl text-subheading leading-relaxed text-midnight-navy">
        No decisions recorded yet — the firm abstains until a validated edge fires. That discipline
        is the point.
      </p>
    </motion.div>
  );
}

function FirstAnchorProof() {
  const txUrl = `${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`;
  return (
    <motion.div
      custom={2}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-6 overflow-hidden rounded-card border-2 border-chartreuse bg-pure-surface shadow-card"
    >
      <div className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="hq-pulse text-onchain" aria-hidden>
              ●
            </span>
            <span className="font-mono text-caption uppercase tracking-wide text-onchain">
              First decision anchored on-chain
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-body text-midnight-navy">
            <span className="font-medium">{FIRST_ANCHOR.ticker}</span>
            <span className="text-ash-medium" aria-hidden>
              ·
            </span>
            <span className="text-abstain">{FIRST_ANCHOR.decision}</span>
            <span className="text-ash-medium" aria-hidden>
              ·
            </span>
            <span className="text-slate-ink">block {FIRST_ANCHOR.block.toLocaleString("en-US")}</span>
          </div>

          <p className="mt-3 font-mono text-caption text-ash-medium">
            recordHash{" "}
            <span className="text-slate-ink" title={FIRST_ANCHOR.recordHash}>
              {truncateMiddle(FIRST_ANCHOR.recordHash, 10, 8)}
            </span>
          </p>
        </div>

        <a
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-pill-lg bg-chartreuse px-6 py-3 text-body font-medium text-midnight-navy shadow-cta transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chartreuse md:self-auto"
        >
          View on Mantlescan <span aria-hidden>↗</span>
        </a>
      </div>
    </motion.div>
  );
}

// ───────────────────────────── loading / error ─────────────────────────────

function SkeletonRows() {
  return (
    <div
      className="overflow-hidden rounded-card border border-fog-border bg-pure-surface shadow-card"
      aria-busy="true"
      aria-label="Loading decisions"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-fog-border/60 px-4 py-4 last:border-b-0"
        >
          <div className="hq-pulse h-3 w-32 rounded-card-sm bg-ghost-canvas" />
          <div className="hq-pulse h-3 w-14 rounded-card-sm bg-ghost-canvas" />
          <div className="hq-pulse h-3 w-20 rounded-card-sm bg-ghost-canvas" />
          <div className="hq-pulse ml-auto h-3 w-16 rounded-card-sm bg-ghost-canvas" />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="rounded-card border border-fog-border bg-pure-surface p-8 shadow-card">
      <p className="font-mono text-caption uppercase tracking-wide text-loss">feed unavailable</p>
      <p className="mt-3 max-w-2xl text-body leading-relaxed text-slate-ink">
        The live ledger feed couldn’t be reached. The on-chain record below is permanent and
        independently verifiable on Mantlescan.
      </p>
    </div>
  );
}

// ───────────────────────────── section ─────────────────────────────

export default function DecisionLedgerSection() {
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<Decision[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchDecisions(20);
        if (!active) return;
        setRows(data);
        setState("ready");
      } catch {
        if (!active) return;
        setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const hasRows = state === "ready" && rows.length > 0;
  const isEmpty = state === "ready" && rows.length === 0;
  const stats = computeStats(rows);

  return (
    <section id="ledger" className="mx-auto max-w-[1200px] px-6 py-20 md:py-28">
      {/* ─────────── heading ─────────── */}
      <motion.div
        custom={0}
        variants={reduce ? undefined : rise}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, margin: "-80px" }}
      >
        <h2 className="font-display text-heading-lg font-medium leading-tight tracking-tight text-midnight-navy md:text-display">
          The decision ledger.
        </h2>
        <p className="mt-4 max-w-2xl text-subheading leading-relaxed text-slate-ink">
          Every decision the firm makes, recorded — and, on ENTER, anchored on-chain.
        </p>
      </motion.div>

      <div className="mt-12">
        {/* ─────────── stats strip (only with data) ─────────── */}
        {hasRows && <StatsStrip stats={stats} cold={false} />}

        {/* ─────────── body ─────────── */}
        {state === "loading" && <SkeletonRows />}

        {state === "error" && (
          <>
            <ErrorState />
            <FirstAnchorProof />
          </>
        )}

        {hasRows && (
          <>
            <LedgerTable rows={rows} />
            <LedgerCards rows={rows} />
            <p className="mt-4 font-mono text-caption text-ash-medium">
              Showing latest {rows.length} · abstentions are deliberate — the firm only sizes up on a
              validated edge.
            </p>
          </>
        )}

        {isEmpty && (
          <>
            <StatsStrip stats={stats} cold />
            <EmptyState />
            <FirstAnchorProof />
          </>
        )}
      </div>
    </section>
  );
}
