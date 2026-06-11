/**
 * /learning — THE TUNING BAY. HeliQuant's self-learning made watchable: every loss re-maps the
 * engine (faded conditions = dialed-back throttles), the gate refuses counter-trend repeats, and
 * the learning is regime-aware. Distinct metaphor from THE GRID (race lanes) — a tuning console.
 */

import AppNav from "@/components/garage/AppNav";
import LearningBay from "@/components/garage/LearningBay";

export default function LearningPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-signal2 align-middle" /> SELF-LEARNING · EVERY LOSS RE-MAPS THE ENGINE · LIVE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The tuning <span className="text-chartreuse">bay</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Losses aren&apos;t wasted — they&apos;re the training signal. Each closed trade re-maps the
            engine: a condition proven to lose <span className="text-bone">in this regime</span> gets its
            throttle dialed back, the gate refuses to repeat it, and the firm runs sharper next pass.
            Watch it learn, live.
          </p>

          <div className="mt-12">
            <LearningBay />
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE TUNING BAY · the firm learns from every loss — and never fakes an edge
          </p>
        </div>
      </footer>
    </>
  );
}
