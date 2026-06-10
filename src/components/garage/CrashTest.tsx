"use client";

/**
 * THE CRASH TEST — we crash-test our own winners (Night Garage §6.4).
 *
 * The story, verbatim from the lab books: an mETH/ETH convergence strategy backtested
 * +96.0% OOS with a 95.6% win rate — the kind of number other decks lead with. We drove
 * it into the slippage wall: priced realistically, thin mETH liquidity costs −73 bps a
 * trade. The profit was an artifact. REJECTED. This is the only section allowed to bleed
 * signal orange.
 */

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export default function CrashTest() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <section id="crash" className="relative isolate overflow-hidden bg-pitch px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-40" />
      {/* warning wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 45% at 78% 40%, rgba(255,90,31,0.08), transparent 70%)" }}
      />

      <div ref={ref} className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-signal2">▮</span> HONESTY LAB · FINDING #15
        </p>
        <h2
          className="mt-4 max-w-3xl font-display font-extrabold uppercase leading-[0.9] text-bone"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
        >
          We crash-test <span className="text-signal2">our own winners</span>
        </h2>

        <div className="mt-12 grid items-stretch gap-0 lg:grid-cols-[1fr_auto_1fr]">
          {/* ── the beautiful number, driven at the wall ── */}
          <motion.div
            initial={false}
            animate={inView && !reduced ? { x: [0, 26, 22] } : {}}
            transition={{ delay: 0.5, duration: 0.45, ease: [0.5, 0, 1, 1] }}
            className="relative flex flex-col justify-center border-2 border-bone/25 bg-carbon p-8 lg:border-r-0"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">
              the backtest · mETH/ETH convergence
            </p>
            <p className={`mt-3 font-display font-extrabold leading-none text-bone ${inView && !reduced ? "gr-shake" : ""}`} style={{ fontSize: "clamp(4rem, 9vw, 7.5rem)", animationDelay: "0.62s" }}>
              +96.0<span className="text-4xl">%</span>
            </p>
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.2em] text-bone/70">
              95.6% win · paper
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-bone/55">
              The kind of figure that headlines a pitch deck. We put it on the sled instead.
            </p>
          </motion.div>

          {/* ── the wall ── */}
          <div className="gr-hazard relative hidden w-[64px] border-y-2 border-bone/25 lg:block" aria-hidden />

          {/* ── the verdict ── */}
          <div className="relative border-2 border-bone/25 bg-carbon2 p-8 lg:border-l-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">
              impact report · realistic execution
            </p>
            <p className="mt-3 font-display font-extrabold leading-none text-signal2" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              −73 <span className="text-3xl">bps</span>
            </p>
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-bone/70">
              per trade · thin mETH slippage
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-bone/60">
              Priced against the real order book, every &quot;win&quot; paid more in slippage than it
              earned. A thin-liquidity artifact — <span className="text-bone">we threw it out.</span>
            </p>

            {/* REJECTED stamp */}
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 2.2, rotate: -10 }}
              animate={inView ? { opacity: 1, scale: 1, rotate: -10 } : {}}
              transition={{ delay: reduced ? 0 : 1.05, duration: 0.45, ease: [0.2, 1.4, 0.3, 1] }}
              className="absolute right-6 top-6 border-[3px] border-signal2 px-4 py-2"
            >
              <p className="font-display text-2xl font-extrabold uppercase tracking-wider text-signal2">
                Rejected
              </p>
            </motion.div>
          </div>
        </div>

        <p className="mt-8 max-w-2xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-steel">
          a firm that publishes its crashes is a firm whose{" "}
          <span className="text-chartreuse">passes mean something</span>
        </p>
      </div>
    </section>
  );
}
