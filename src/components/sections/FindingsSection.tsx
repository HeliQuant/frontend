"use client";

import { motion } from "motion/react";
import { FINDINGS, type Finding } from "@/lib/heliquant";

/* ───────────────────────── theme grouping ─────────────────────────
   The 15 honest findings, grouped by theme in a deliberate narrative order:
   Smart Money → Alpha → Execution → Method. Each theme gets a sub-label.
   Finding #15 ("We rejected our own +96% backtest") is pulled out as the
   signature standout card and is NOT rendered inside its theme grid. */

const THEME_ORDER = ["Smart Money", "Alpha", "Execution", "Method"] as const;
type Theme = (typeof THEME_ORDER)[number];

const THEME_LABEL: Record<Theme, string> = {
  "Smart Money": "On smart money",
  Alpha: "On finding alpha",
  Execution: "On execution & discipline",
  Method: "On method & honesty",
};

const FEATURED_N = 15;

/* tone → left-accent treatment for standard cards */
function toneAccent(tone: Finding["tone"]): string {
  switch (tone) {
    case "win":
      return "border-l-2 border-l-win";
    case "neutral":
      return "border-l-2 border-l-onchain";
    case "honest":
      return "border-l-2 border-l-aggressive";
    default:
      return "border-l border-l-fog-border";
  }
}

/* small scroll-reveal helpers (stagger handled by parent variants) */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function NewPill() {
  return (
    <span className="inline-flex items-center rounded-full bg-chartreuse px-2 py-[2px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-midnight-navy">
      New
    </span>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  return (
    <motion.article
      variants={cardVariants}
      className={`flex h-full flex-col gap-3 rounded-card-md border border-fog-border bg-pure-surface p-6 shadow-badge ${toneAccent(
        finding.tone
      )}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-ash-medium">#{finding.n}</span>
        {finding.isNew ? <NewPill /> : null}
      </div>
      <h4 className="font-medium leading-snug text-midnight-navy">{finding.title}</h4>
      <p className="text-sm leading-relaxed text-slate-ink">{finding.body}</p>
    </motion.article>
  );
}

/* ───────────────────────── the signature standout card ─────────────────────────
   Dramatizes "+96% / 95.6% win" with a fade-then-strike reveal, landing on the
   honest verdict: "−73 bps under realistic slippage → rejected." All copy is
   pulled from the FINDINGS entry (title/body) — no separately hardcoded claims. */
function FeaturedHonestCard({ finding }: { finding: Finding }) {
  return (
    <motion.article
      variants={cardVariants}
      className="relative col-span-full overflow-hidden rounded-card border border-fog-border bg-pure-surface p-8 shadow-card md:p-10"
    >
      {/* aggressive (violet) left accent — the dramatic 'honest' treatment */}
      <span className="absolute inset-y-0 left-0 w-[3px] bg-aggressive" aria-hidden />

      <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
        {/* left: the narrative */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ash-medium">#{finding.n}</span>
            <span className="inline-flex items-center rounded-full border border-aggressive/30 bg-aggressive/5 px-2.5 py-[3px] font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.1em] text-aggressive">
              The honesty moment
            </span>
            {finding.isNew ? <NewPill /> : null}
          </div>

          <h3 className="font-display text-heading-sm leading-tight text-midnight-navy md:text-heading">
            {finding.title}
          </h3>

          <p className="max-w-prose text-sm leading-relaxed text-slate-ink md:text-body">
            {finding.body}
          </p>
        </div>

        {/* right: the dramatized numbers — spectacular, then struck out */}
        <div className="flex flex-col gap-4 rounded-card-md border border-fog-border bg-ghost-canvas p-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ash-medium">
            The backtest that looked spectacular
          </span>

          {/* the tempting headline figures — revealed, then faded + struck through */}
          <motion.div
            className="flex flex-wrap items-baseline gap-x-6 gap-y-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.45 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-heading-lg leading-none text-win line-through decoration-loss decoration-2">
              +96%
            </span>
            <span className="font-mono text-sm text-slate-ink line-through decoration-loss decoration-[1.5px]">
              95.6% win
            </span>
          </motion.div>

          {/* the honest verdict — arrives after, in full */}
          <motion.div
            className="flex flex-col gap-1 border-t border-fog-border pt-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <span className="font-display text-heading-sm leading-none text-loss">
              −73 bps / trade
            </span>
            <span className="text-sm leading-relaxed text-midnight-navy">
              under realistic slippage on thin mETH &mdash;{" "}
              <span className="font-medium">a thin-liquidity artifact, not alpha. Rejected.</span>
            </span>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

export default function FindingsSection() {
  const featured = FINDINGS.find((f) => f.n === FEATURED_N);

  // group all non-featured findings by theme, preserving FINDINGS source order
  const grouped = THEME_ORDER.map((theme) => ({
    theme,
    items: FINDINGS.filter((f) => f.theme === theme && f.n !== FEATURED_N),
  })).filter((g) => g.items.length > 0);

  return (
    <section
      id="findings"
      className="mx-auto max-w-[1200px] px-6 py-20 md:py-28"
    >
      {/* heading */}
      <motion.header
        className="mb-14 flex max-w-2xl flex-col gap-4 md:mb-16"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-display text-heading-lg leading-[1.05] text-midnight-navy md:text-display">
          We publish what doesn&rsquo;t work, too.
        </h2>
        <p className="text-body text-slate-ink">
          Honesty is the product. Every finding traces to a real run.
        </p>
      </motion.header>

      {/* themed groups */}
      <div className="flex flex-col gap-14 md:gap-16">
        {grouped.map(({ theme, items }) => (
          <div key={theme} className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-ash-medium">
                {THEME_LABEL[theme as Theme]}
              </span>
              <span className="h-px flex-1 bg-fog-border" aria-hidden />
            </div>

            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              {items.map((finding) => (
                <FindingCard key={finding.n} finding={finding} />
              ))}
            </motion.div>
          </div>
        ))}

        {/* signature standout — full-row featured honesty card */}
        {featured ? (
          <motion.div
            className="grid grid-cols-1"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <FeaturedHonestCard finding={featured} />
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
