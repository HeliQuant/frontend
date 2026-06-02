"use client";

import { motion, useReducedMotion } from "motion/react";
import { DESKS, EDGE } from "@/lib/heliquant";

/** Compact initials for each desk node (e.g. "Regime/Technical" → "RT", "Macro (Allora)" → "MA"). */
function deskInitials(key: string): string {
  const letters = key.match(/[A-Za-z]+/g) ?? [];
  const first = letters[0];
  if (!first) return "•";
  const second = letters[1];
  if (!second) return first.slice(0, 2).toUpperCase();
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
}

const SPRING = { type: "spring" as const, stiffness: 90, damping: 16, mass: 0.9 };

/** Staggered fade-up entrance for hero copy. */
const rise = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...SPRING, delay: 0.12 + i * 0.09 },
  }),
};

const STATS = [
  "82.6% regime OOS",
  `1 validated edge · ${EDGE.asset}`,
  "decisions anchored on-chain",
  "honesty-by-design",
];

export default function HeroSection() {
  const reduce = useReducedMotion();
  const orbitDuration = 40;

  return (
    <section className="hero-gradient relative isolate flex min-h-[90vh] w-full items-center overflow-hidden">
      {/* atmospheric dot-grid wash */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      {/* soft vignette so copy stays legible over the gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 8%, transparent 30%, rgba(0,16,51,0.55) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        {/* ─────────── left: copy ─────────── */}
        <div className="flex flex-col items-start text-left">
          {/* announcement pill */}
          <motion.div
            custom={0}
            variants={rise}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-ice-veil/30 px-4 py-1.5 text-caption text-ice-veil backdrop-blur-sm"
          >
            <span className="hq-pulse text-chartreuse" aria-hidden>
              ●
            </span>
            <span>Live on Mantle Sepolia · 7-desk autonomous org</span>
          </motion.div>

          {/* headline */}
          <motion.h1
            custom={1}
            variants={rise}
            initial="hidden"
            animate="show"
            className="font-display mt-6 text-balance text-5xl font-medium leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            The all-seeing quant.
          </motion.h1>

          {/* subhead */}
          <motion.p
            custom={2}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-2xl text-balance text-subheading leading-relaxed text-ice-veil/80"
          >
            Autonomous multi-source intelligence trading firm on Mantle. Seven AI desks debate, a
            PM decides — every call is gated, sized by validated edge, and anchored on-chain.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#org"
              className="group inline-flex items-center gap-2 rounded-full bg-chartreuse px-7 py-3 text-body font-medium text-midnight-navy shadow-cta transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chartreuse"
            >
              See it think
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-y-0.5"
              >
                ↓
              </span>
            </a>
            <a
              href="#ledger"
              className="inline-flex items-center gap-2 rounded-full border border-ice-veil/60 bg-transparent px-7 py-3 text-body font-medium text-ice-veil transition-colors duration-200 hover:border-ice-veil hover:bg-ice-veil/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ice-veil"
            >
              Decision ledger
            </a>
          </motion.div>
        </div>

        {/* ─────────── right: sun-orbit motif ─────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.2 }}
          className="relative mx-auto hidden aspect-square w-full max-w-md items-center justify-center md:flex"
          aria-hidden
        >
          {/* the sun: layered radial chartreuse → amber glow */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #fffbe0 0%, #d0f100 32%, #f5b400 64%, rgba(245,180,0,0) 78%)",
              boxShadow: "0 0 90px 30px rgba(208,241,0,0.35), 0 0 160px 60px rgba(245,180,0,0.18)",
            }}
            animate={reduce ? undefined : { scale: [1, 1.05, 1], opacity: [0.92, 1, 0.92] }}
            transition={
              reduce
                ? undefined
                : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            }
          />

          {/* faint orbit ring */}
          <div
            className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ice-veil/15"
          />
          <div
            className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ boxShadow: "inset 0 0 60px rgba(95,189,247,0.10)" }}
          />

          {/* rotating system of 7 desk nodes */}
          <motion.div
            className="relative h-full w-full"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={
              reduce ? undefined : { duration: orbitDuration, repeat: Infinity, ease: "linear" }
            }
          >
            {DESKS.map((desk, i) => {
              const angle = (i / DESKS.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 39; // % of container — sits on the orbit ring
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return (
                <div
                  key={desk.key}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={desk.key}
                >
                  {/* counter-rotate so labels stay upright */}
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-ice-veil/25 bg-deep-cosmos/60 text-caption font-medium tracking-tight text-ice-veil backdrop-blur-sm"
                    style={{ boxShadow: "0 0 18px rgba(95,189,247,0.20)" }}
                    animate={reduce ? undefined : { rotate: -360 }}
                    transition={
                      reduce
                        ? undefined
                        : { duration: orbitDuration, repeat: Infinity, ease: "linear" }
                    }
                  >
                    {deskInitials(desk.key)}
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* ─────────── bottom stat strip ─────────── */}
      <motion.div
        custom={4}
        variants={rise}
        initial="hidden"
        animate="show"
        className="absolute inset-x-0 bottom-0 z-10 border-t border-ice-veil/10"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-4 font-mono text-caption text-ice-veil/70">
          {STATS.map((stat, i) => (
            <span key={stat} className="flex items-center gap-3">
              {i > 0 && (
                <span className="text-ice-veil/30" aria-hidden>
                  ·
                </span>
              )}
              <span>{stat}</span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
