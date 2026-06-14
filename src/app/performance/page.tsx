/**
 * /performance — THE DYNO. The firm's trade ledger on a dynamometer: quantstats-grade metrics
 * (Sharpe / Sortino / max-drawdown / profit-factor) computed from REAL resolved trades, plus the
 * compounded equity power-band. Honest by construction — annualized figures stay withheld until the
 * sample earns them. A dyno can't be marketed past; that's the point.
 */

import AppNav from "@/components/garage/AppNav";
import DynoSheet from "@/components/garage/DynoSheet";

export default function PerformancePage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-signal2 align-middle" /> REAL LEDGER · MEASURED NOT MARKETED · LIVE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The <span className="text-chartreuse">dyno</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            A dynamometer measures an engine&apos;s real output under load — you can&apos;t market your way
            past the curve. So we put the firm&apos;s ledger on it: Sharpe, Sortino, drawdown, profit factor,
            computed from <span className="text-bone">real resolved trades</span>. Annualized numbers stay
            blank until the sample earns them — a 3-day window doesn&apos;t get a CAGR. The directional floor
            has no validated edge, so the curve reads ~breakeven/loss. We show it anyway.
          </p>

          <div className="mt-12">
            <DynoSheet />
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE DYNO · rigorous metrics on the real ledger — including the losses
          </p>
        </div>
      </footer>
    </>
  );
}
