"use client";

/**
 * OrgThinkingSection — the demo CENTERPIECE.
 * An animated, cinematic REPLAY of the HeliQuant firm "thinking" through one real
 * recorded run: RECALL -> PLAN (7 desks) -> DEBATE (bull/bear) -> PM DECISION ->
 * TICKET -> EXECUTE -> LEARN. Every word/number shown is pulled from the recording
 * (/data/org_run.json) or the verified lib (@/lib/heliquant) — nothing fabricated.
 * The recorded MNT run is an honest ABSTAIN (no validated edge applies); the ENTER
 * path is built too so the same component lights up green when an edge fires.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { DESKS, EDGE, FIRST_ANCHOR, MANTLESCAN } from "@/lib/heliquant";
import type { TradeTicket } from "@/lib/heliquant";

// ───────────────────────── recorded-run shape (typed, no `any`) ─────────────────────────
type Stance = "bullish" | "bearish" | "neutral" | "avoid" | "unavailable";
type Confidence = "low" | "medium" | "high";

type AnalystRead = {
  stance: Stance;
  confidence: Confidence;
  key_point: string;
};

type DebateSide = {
  case?: string;
  strongest_points?: string[];
  honest_caveats?: string[];
  risks?: string[];
};

type Rebuttal = { rebuttal: string };

type OrgRun = {
  asset: string;
  analysts: Record<string, AnalystRead>;
  debate: {
    bull: DebateSide;
    bear: DebateSide;
    bull_rebuttal: Rebuttal;
    bear_rebuttal: Rebuttal;
  };
  decision: {
    decision: "ENTER" | "ABSTAIN" | string;
    direction: "LONG" | "SHORT" | "NONE" | string;
    confidence: string | null;
    reasoning: string | null;
    desk_consensus?: string | null;
    ticket?: TradeTicket | null;
  };
};

// ───────────────────────── pipeline stages ─────────────────────────
const STAGES = [
  { key: "RECALL", label: "Recall", hint: "memory" },
  { key: "PLAN", label: "Plan", hint: "7 desks" },
  { key: "DEBATE", label: "Debate", hint: "bull · bear" },
  { key: "DECISION", label: "Decision", hint: "PM" },
  { key: "TICKET", label: "Ticket", hint: "gated" },
  { key: "EXECUTE", label: "Execute", hint: "record" },
  { key: "LEARN", label: "Learn", hint: "loop" },
] as const;

/** Cumulative dwell (ms) before entering each stage index, for the auto-stepper. */
const STAGE_DELAYS = [0, 700, 1500, 2700, 3500, 4300, 5100] as const;

// ───────────────────────── helpers ─────────────────────────
function stanceClasses(stance: Stance): { text: string; ring: string; dot: string; label: string } {
  switch (stance) {
    case "bullish":
      return { text: "text-win", ring: "ring-win/30 bg-win/5", dot: "bg-win", label: "bullish" };
    case "bearish":
      return { text: "text-loss", ring: "ring-loss/30 bg-loss/5", dot: "bg-loss", label: "bearish" };
    case "unavailable":
      return { text: "text-ash-medium", ring: "ring-fog-border/60 bg-ghost-canvas", dot: "bg-ash-medium", label: "n/a" };
    case "neutral":
    case "avoid":
    default:
      return { text: "text-abstain", ring: "ring-abstain/30 bg-abstain/5", dot: "bg-abstain", label: stance };
  }
}

function confDots(confidence: Confidence): number {
  return confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
}

// shared motion presets
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// ───────────────────────── component ─────────────────────────
export default function OrgThinkingSection() {
  const [run, setRun] = useState<OrgRun | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // step = highest stage index currently revealed; -1 = idle (nothing playing yet)
  const [step, setStep] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [liveTip, setLiveTip] = useState(false);
  // bumped on each replay so child streamers (debate) remount + restart cleanly
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // fetch the recorded run client-side; degrade gracefully (no crash) on failure
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/data/org_run.json", { cache: "force-cache" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data: OrgRun = await res.json();
        if (alive) setRun(data);
      } catch {
        if (alive) setLoadFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const replay = useCallback(() => {
    clearTimers();
    setPlaying(true);
    setRunKey((k) => k + 1);
    setStep(0);
    // schedule each subsequent stage; final timer flips `playing` off
    for (let i = 1; i < STAGES.length; i++) {
      timers.current.push(setTimeout(() => setStep(i), STAGE_DELAYS[i]));
    }
    timers.current.push(
      setTimeout(() => setPlaying(false), STAGE_DELAYS[STAGES.length - 1] + 900),
    );
  }, [clearTimers]);

  const reached = (idx: number) => step >= idx;
  const isActive = (idx: number) => step === idx;

  const decision = run?.decision;
  const isEnter = decision?.decision === "ENTER";
  const ticket = decision?.ticket ?? null;

  return (
    <section
      id="org"
      className="mx-auto max-w-[1200px] px-6 py-20 md:py-28"
      aria-label="Watch the firm think — recorded org decision replay"
    >
      {/* ── heading ── */}
      <div className="max-w-2xl">
        <p className="font-mono text-caption uppercase tracking-[0.18em] text-onchain">
          Recorded run · decision replay
        </p>
        <h2 className="font-display mt-3 text-heading-lg leading-[1.05] text-midnight-navy md:text-display text-balance">
          Watch the firm think.
        </h2>
        <p className="mt-4 text-body leading-relaxed text-slate-ink">
          Press play to replay one real run end to end — how a seven-desk AI firm reaches a
          decision: it <span className="text-midnight-navy">recalls</span> memory, has each desk{" "}
          <span className="text-midnight-navy">plan</span>, runs a bull-vs-bear{" "}
          <span className="text-midnight-navy">debate</span>, the PM{" "}
          <span className="text-midnight-navy">decides</span>, gates a{" "}
          <span className="text-midnight-navy">ticket</span>, records on Mantle, and{" "}
          <span className="text-midnight-navy">learns</span> from the outcome.
        </p>
      </div>

      {/* ── controls ── */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={replay}
          disabled={!run || playing}
          className="group inline-flex items-center gap-2 rounded-[--radius-pill-lg] bg-chartreuse px-6 py-3 text-subheading font-medium text-midnight-navy shadow-[--shadow-cta] transition-[transform,opacity] duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          aria-live="polite"
        >
          <span aria-hidden className="text-[0.9em]">
            {playing ? "■" : "▶"}
          </span>
          {playing ? "Replaying…" : step >= 0 ? "Replay again" : "Replay org thinking"}
        </button>

        <div
          className="relative"
          onMouseEnter={() => setLiveTip(true)}
          onMouseLeave={() => setLiveTip(false)}
        >
          <button
            type="button"
            aria-disabled="true"
            tabIndex={-1}
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-[--radius-pill-lg] border border-fog-border bg-pure-surface px-5 py-3 text-subheading text-ash-medium"
          >
            <span aria-hidden className="text-[0.9em]">
              ◷
            </span>
            Run live
            <span className="rounded-[--radius-card-sm] border border-fog-border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide text-ash-medium">
              needs backend
            </span>
          </button>
          <AnimatePresence>
            {liveTip && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                role="tooltip"
                className="absolute left-0 top-full z-10 mt-2 w-64 rounded-card-md border border-fog-border bg-pure-surface p-3 text-caption leading-snug text-slate-ink shadow-card"
              >
                Live execution calls the deployed firm + LLM desks on demand. The recorded
                replay is the working path here; live is the optional next step.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {run && (
          <span className="ml-auto font-mono text-caption text-ash-medium">
            asset <span className="text-midnight-navy">{run.asset}</span>
          </span>
        )}
      </div>

      {/* ── load failure fallback (no crash) ── */}
      {loadFailed && !run && <FallbackSummary />}

      {/* ── the replay surface ── */}
      {run && (
        <div className="mt-10 space-y-6">
          <Stepper step={step} />

          {/* idle hint before first play */}
          {step < 0 && (
            <div className="rounded-card border border-dashed border-fog-border bg-pure-surface px-6 py-10 text-center text-slate-ink shadow-card">
              <p className="text-subheading text-midnight-navy">The firm is idle.</p>
              <p className="mt-1 text-body text-ash-medium">
                Hit “Replay org thinking” to step through the recorded decision pipeline.
              </p>
            </div>
          )}

          {/* RECALL */}
          <AnimatePresence>
            {reached(0) && (
              <StageCard
                key="recall"
                index={0}
                title="Recall"
                tag="memory"
                active={isActive(0)}
              >
                <p className="text-body leading-relaxed text-slate-ink">
                  The steward loads prior decisions and the live watchlist from memory
                  (Supabase <span className="font-mono text-midnight-navy">decisions_hq</span>),
                  then re-frames the question for{" "}
                  <span className="text-midnight-navy">{run.asset}</span>: is there a validated
                  edge to act on right now — or is discipline the trade?
                </p>
              </StageCard>
            )}
          </AnimatePresence>

          {/* PLAN — 7 desks */}
          <AnimatePresence>
            {reached(1) && (
              <StageCard
                key="plan"
                index={1}
                title="Plan"
                tag="7 desks"
                active={isActive(1)}
              >
                <p className="mb-5 text-body leading-relaxed text-slate-ink">
                  Seven specialist desks read their own real source in parallel and post a
                  stance. Five posted a read this run; the OI-Contrarian edge stays context
                  unless its live signal fires.
                </p>
                <motion.div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                >
                  {DESKS.map((desk) => (
                    <DeskCard key={desk.key} deskKey={desk.key} blurb={desk.blurb} read={run.analysts[desk.key]} />
                  ))}
                </motion.div>
              </StageCard>
            )}
          </AnimatePresence>

          {/* DEBATE */}
          <AnimatePresence>
            {reached(2) && (
              <StageCard
                key="debate"
                index={2}
                title="Debate"
                tag="bull · bear"
                active={isActive(2)}
              >
                <DebatePanel key={runKey} debate={run.debate} />
              </StageCard>
            )}
          </AnimatePresence>

          {/* DECISION */}
          <AnimatePresence>
            {reached(3) && decision && (
              <StageCard
                key="decision"
                index={3}
                title="PM decision"
                tag="verdict"
                active={isActive(3)}
              >
                <DecisionCard
                  isEnter={isEnter}
                  direction={decision.direction}
                  confidence={decision.confidence}
                  reasoning={decision.reasoning}
                  deskConsensus={decision.desk_consensus ?? null}
                />
              </StageCard>
            )}
          </AnimatePresence>

          {/* TICKET */}
          <AnimatePresence>
            {reached(4) && (
              <StageCard
                key="ticket"
                index={4}
                title="Ticket"
                tag="R:R ≥ 2:1 gate"
                active={isActive(4)}
              >
                {isEnter && ticket ? (
                  <TicketCard ticket={ticket} asset={run.asset} />
                ) : (
                  <AbstainTicket />
                )}
              </StageCard>
            )}
          </AnimatePresence>

          {/* EXECUTE */}
          <AnimatePresence>
            {reached(5) && (
              <StageCard
                key="execute"
                index={5}
                title="Execute"
                tag="record"
                active={isActive(5)}
              >
                <ExecuteRow isEnter={isEnter} />
              </StageCard>
            )}
          </AnimatePresence>

          {/* LEARN */}
          <AnimatePresence>
            {reached(6) && (
              <StageCard
                key="learn"
                index={6}
                title="Learn"
                tag="loop → recall"
                active={isActive(6)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-body leading-relaxed text-slate-ink">
                    The outcome (TP / SL / timeout — or “abstained, capital preserved”) is
                    written back to memory. Each run sharpens the next:{" "}
                    <span className="text-midnight-navy">the firm gets smarter with use.</span>
                  </p>
                  <div
                    className="flex shrink-0 items-center gap-2 rounded-[--radius-pill-lg] border border-onchain/30 bg-onchain/5 px-4 py-2 font-mono text-caption text-onchain"
                    aria-hidden
                  >
                    <span>outcome</span>
                    <span className="text-base leading-none">↺</span>
                    <span>recall</span>
                  </div>
                </div>
              </StageCard>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

// ───────────────────────── stepper ─────────────────────────
function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap items-stretch gap-2 sm:flex-nowrap" aria-label="Pipeline progress">
      {STAGES.map((s, i) => {
        const done = step > i;
        const active = step === i;
        const reached = step >= i;
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-2">
            <div
              className={[
                "flex min-w-0 flex-1 items-center gap-2 rounded-card-md border px-3 py-2 transition-colors duration-300",
                reached
                  ? "border-onchain/40 bg-pure-surface shadow-card"
                  : "border-fog-border bg-ghost-canvas",
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={[
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] transition-colors duration-300",
                  done
                    ? "bg-onchain text-pure-surface"
                    : active
                      ? "bg-chartreuse text-midnight-navy hq-pulse"
                      : "bg-fog-border/40 text-ash-medium",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={[
                    "block truncate text-caption font-medium leading-tight",
                    reached ? "text-midnight-navy" : "text-ash-medium",
                  ].join(" ")}
                >
                  {s.label}
                </span>
                <span className="hidden truncate font-mono text-[10px] uppercase tracking-wide text-ash-medium sm:block">
                  {s.hint}
                </span>
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <span
                aria-hidden
                className={[
                  "hidden h-px w-3 shrink-0 transition-colors duration-300 sm:block",
                  step > i ? "bg-onchain/50" : "bg-fog-border",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ───────────────────────── stage shell ─────────────────────────
function StageCard({
  index,
  title,
  tag,
  active,
  children,
}: {
  index: number;
  title: string;
  tag: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "rounded-card border bg-pure-surface p-6 shadow-card transition-colors duration-300 md:p-7",
        active ? "border-chartreuse/70" : "border-fog-border",
      ].join(" ")}
    >
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-midnight-navy font-mono text-caption text-pure-surface">
          {index + 1}
        </span>
        <h3 className="font-display text-heading-sm text-midnight-navy">{title}</h3>
        <span className="ml-auto rounded-badge border border-fog-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-ash-medium">
          {tag}
        </span>
      </header>
      {children}
    </motion.section>
  );
}

// ───────────────────────── desk card ─────────────────────────
function DeskCard({
  deskKey,
  blurb,
  read,
}: {
  deskKey: string;
  blurb: string;
  read: AnalystRead | undefined;
}) {
  const sc = read ? stanceClasses(read.stance) : null;
  return (
    <motion.article
      variants={fadeUp}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={[
        "flex h-full flex-col rounded-card-md border border-fog-border bg-ghost-canvas p-4 ring-1 ring-inset",
        sc ? sc.ring : "ring-fog-border/50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-subheading font-medium leading-tight text-midnight-navy">{deskKey}</h4>
        {sc ? (
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-badge px-2 py-0.5 text-caption font-medium ${sc.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} aria-hidden />
            {sc.label}
          </span>
        ) : (
          <span className="shrink-0 rounded-badge border border-fog-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ash-medium">
            context
          </span>
        )}
      </div>

      {read ? (
        <>
          <div className="mt-2 flex items-center gap-1.5" aria-label={`confidence ${read.confidence}`}>
            <span className="font-mono text-[10px] uppercase tracking-wide text-ash-medium">conf</span>
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  d < confDots(read.confidence) ? sc!.dot : "bg-fog-border",
                ].join(" ")}
                aria-hidden
              />
            ))}
            <span className="font-mono text-[10px] text-ash-medium">{read.confidence}</span>
          </div>
          <p className="mt-2 text-caption leading-relaxed text-slate-ink">{read.key_point}</p>
        </>
      ) : (
        <p className="mt-2 text-caption leading-relaxed text-ash-medium">{blurb}</p>
      )}
    </motion.article>
  );
}

// ───────────────────────── debate ─────────────────────────
type Bubble = { side: "bull" | "bear"; round: number; lead: string; body: string };

function buildBubbles(debate: OrgRun["debate"]): Bubble[] {
  const out: Bubble[] = [];
  // round 1 — openings
  out.push({
    side: "bull",
    round: 1,
    lead: debate.bull.case ? `Opening · “${debate.bull.case}”` : "Opening",
    body:
      debate.bull.strongest_points?.[0] ??
      "No strong directional conviction; the data does not clearly favour a long.",
  });
  out.push({
    side: "bear",
    round: 1,
    lead: debate.bear.case ? `Opening · “${debate.bear.case}”` : "Opening",
    body:
      debate.bear.strongest_points?.[0] ??
      debate.bear.risks?.[0] ??
      "Without a validated edge, the risk of acting outweighs the reward.",
  });
  // round 2 — rebuttals
  out.push({ side: "bull", round: 2, lead: "Rebuttal", body: debate.bull_rebuttal.rebuttal });
  out.push({ side: "bear", round: 2, lead: "Rebuttal", body: debate.bear_rebuttal.rebuttal });
  return out;
}

function DebatePanel({ debate }: { debate: OrgRun["debate"] }) {
  // mounts fresh on each replay (keyed by runKey), so `shown` starts at 0 — no in-effect reset
  const [shown, setShown] = useState(0);
  const bubbles = buildBubbles(debate);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    // stream bubbles in one-by-one (setState only inside async callbacks, never sync)
    for (let i = 1; i <= bubbles.length; i++) {
      ts.push(setTimeout(() => setShown(i), i * 600));
    }
    return () => ts.forEach((t) => clearTimeout(t));
    // bubble count is stable for a given recording
  }, [bubbles.length]);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
      <div className="hidden items-center gap-2 md:flex">
        <span className="h-2 w-2 rounded-full bg-win" aria-hidden />
        <span className="text-caption font-medium text-win">Bull desk</span>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <span className="h-2 w-2 rounded-full bg-loss" aria-hidden />
        <span className="text-caption font-medium text-loss">Bear desk</span>
      </div>

      {bubbles.map((b, i) => {
        const visible = i < shown;
        const isBull = b.side === "bull";
        return (
          <AnimatePresence key={`${b.side}-${b.round}`}>
            {visible && (
              <motion.div
                initial={{ opacity: 0, x: isBull ? -14 : 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={[
                  "rounded-card-md border p-4",
                  isBull
                    ? "border-win/40 bg-win/5 md:col-start-1"
                    : "border-loss/40 bg-loss/5 md:col-start-2",
                ].join(" ")}
              >
                <p
                  className={[
                    "mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide",
                    isBull ? "text-win" : "text-loss",
                  ].join(" ")}
                >
                  <span className="md:hidden">{isBull ? "Bull" : "Bear"} ·</span>
                  {b.lead}
                </p>
                <p className="text-caption leading-relaxed text-slate-ink">{b.body}</p>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}

// ───────────────────────── decision ─────────────────────────
function DecisionCard({
  isEnter,
  direction,
  confidence,
  reasoning,
  deskConsensus,
}: {
  isEnter: boolean;
  direction: string;
  confidence: string | null;
  reasoning: string | null;
  deskConsensus: string | null;
}) {
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "rounded-card-md border-2 p-5",
        isEnter ? "border-win/50 bg-win/5" : "border-abstain/50 bg-abstain/5",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={[
            "rounded-badge px-3 py-1 font-mono text-heading-sm font-semibold tracking-tight",
            isEnter ? "bg-win/15 text-win" : "bg-abstain/15 text-abstain",
          ].join(" ")}
        >
          {isEnter ? `ENTER · ${direction}` : "ABSTAIN"}
        </span>
        {confidence && (
          <span className="font-mono text-caption uppercase tracking-wide text-ash-medium">
            confidence <span className="text-midnight-navy">{confidence}</span>
          </span>
        )}
        <span
          className={[
            "ml-auto text-subheading font-medium",
            isEnter ? "text-win" : "text-abstain",
          ].join(" ")}
        >
          {isEnter ? "Edge fired — sized & gated" : "No validated edge applies → disciplined ABSTAIN"}
        </span>
      </div>

      {reasoning && (
        <p className="mt-4 text-body leading-relaxed text-slate-ink">{reasoning}</p>
      )}

      {deskConsensus && (
        <div className="mt-4 rounded-card-sm border border-fog-border bg-pure-surface p-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ash-medium">Desk consensus</p>
          <p className="mt-1 text-caption leading-relaxed text-slate-ink">{deskConsensus}</p>
        </div>
      )}
    </motion.div>
  );
}

// ───────────────────────── ticket (both paths) ─────────────────────────
function AbstainTicket() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-subheading font-medium text-midnight-navy">
          No ticket — discipline over action.
        </p>
        <p className="mt-1 max-w-xl text-body leading-relaxed text-slate-ink">
          A trade is only a hypothesis when it has an edge and an invalidation. With no
          validated edge live on this asset, the firm writes no order. The one exception is{" "}
          <span className="text-midnight-navy">{EDGE.name}</span> ({EDGE.asset}) — and only when
          its live signal fires.
        </p>
      </div>
      <span className="shrink-0 self-start rounded-[--radius-pill-lg] border border-abstain/40 bg-abstain/5 px-4 py-2 font-mono text-caption text-abstain">
        flat · 0 size
      </span>
    </div>
  );
}

function TicketCard({ ticket, asset }: { ticket: TradeTicket; asset: string }) {
  const isAggressive = ticket.mode === "AGGRESSIVE";
  const fields: { label: string; value: string }[] = [
    { label: "Entry", value: `$${ticket.entry}` },
    { label: "Stop", value: `$${ticket.stop_loss}` },
    {
      label: "TP1",
      value: ticket.take_profit[0] ? `$${ticket.take_profit[0].price}` : "—",
    },
    { label: "Risk", value: `${ticket.risk_pct}%` },
    { label: "Leverage", value: `${ticket.leverage}×` },
    { label: "Size", value: `${ticket.position_size_pct}%` },
  ];
  return (
    <div
      className={[
        "rounded-card-md border-2 p-5",
        isAggressive ? "border-aggressive/50 bg-aggressive/5" : "border-win/50 bg-win/5",
      ].join(" ")}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-subheading font-semibold text-midnight-navy">
          {asset} · {ticket.direction}
        </span>
        <span
          className={[
            "rounded-badge px-2.5 py-0.5 font-mono text-caption font-medium",
            isAggressive ? "bg-aggressive/15 text-aggressive" : "bg-win/15 text-win",
          ].join(" ")}
        >
          {ticket.mode}
        </span>
        <span className="font-mono text-caption text-ash-medium">{ticket.conviction}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {fields.map((f) => (
          <div key={f.label} className="rounded-card-sm border border-fog-border bg-pure-surface p-3">
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ash-medium">{f.label}</dt>
            <dd className="mt-1 font-mono text-subheading text-midnight-navy">{f.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-caption leading-relaxed text-slate-ink">
        Stop basis: {ticket.stop_basis}. Sized fractional-Kelly behind a hard R:R ≥ 2:1 gate.
      </p>
    </div>
  );
}

// ───────────────────────── execute ─────────────────────────
function ExecuteRow({ isEnter }: { isEnter: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-card-md border border-fog-border bg-ghost-canvas p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-win" aria-hidden />
          <p className="text-subheading font-medium text-midnight-navy">Recorded off-chain</p>
        </div>
        <p className="mt-1 text-caption leading-relaxed text-slate-ink">
          Decision row written to Supabase{" "}
          <span className="font-mono text-midnight-navy">decisions_hq</span> — full ticket,
          reasoning and desk reads, always (even on abstain).
        </p>
      </div>

      <div className="rounded-card-md border border-onchain/30 bg-onchain/5 p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-onchain" aria-hidden />
          <p className="text-subheading font-medium text-midnight-navy">On-chain anchor</p>
          <span className="ml-auto rounded-badge border border-onchain/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-onchain">
            broadcast on ENTER
          </span>
        </div>
        {isEnter ? (
          <p className="mt-1 text-caption leading-relaxed text-slate-ink">
            The decision hash is anchored in a live Mantle transaction — a tamper-proof audit
            trail on{" "}
            <a
              href={MANTLESCAN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-onchain underline decoration-onchain/40 underline-offset-2 hover:decoration-onchain"
            >
              Mantle Sepolia
            </a>
            .
          </p>
        ) : (
          <p className="mt-1 text-caption leading-relaxed text-slate-ink">
            Abstain stays gas-frugal — no transaction is sent (DRY). Anchoring fires only when
            the firm enters. Verified once on{" "}
            <a
              href={`${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-onchain underline decoration-onchain/40 underline-offset-2 hover:decoration-onchain"
            >
              tx {FIRST_ANCHOR.txHash.slice(0, 8)}…
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

// ───────────────────────── graceful fallback ─────────────────────────
function FallbackSummary() {
  return (
    <div className="mt-10 rounded-card border border-fog-border bg-pure-surface p-6 shadow-card">
      <p className="font-mono text-caption uppercase tracking-wide text-abstain">
        Replay data unavailable — static summary
      </p>
      <p className="mt-3 text-body leading-relaxed text-slate-ink">
        Seven specialist desks (
        {DESKS.map((d, i) => (
          <span key={d.key}>
            <span className="text-midnight-navy">{d.key}</span>
            {i < DESKS.length - 1 ? ", " : ""}
          </span>
        ))}
        ) read real sources, debate bull-vs-bear, and a PM synthesises a disciplined decision.
        When no validated edge applies, the firm abstains and stays gas-frugal; when the one
        OOS-validated edge (<span className="text-midnight-navy">{EDGE.name}</span> on{" "}
        {EDGE.asset}) fires, it sizes a gated ticket and anchors the decision hash on Mantle.
      </p>
    </div>
  );
}
