/**
 * /app — THE LIVE FLOOR. HeliQuant as it actually trades right now, read live from the
 * always-on firm on Railway: the engine (interactive V8), the org pulse, the live book
 * (every open position drawn against its stop & target on a real candlestick), and the
 * PM's decision feed. This is the running demo — paper at live prices, real capital still
 * gated on a validated edge. To put capital through it, the hire flow lives at /hire.
 */

import AppNav from "@/components/garage/AppNav";
import TheCore from "@/components/garage/TheCore";
import LiveFloor from "@/components/garage/LiveFloor";

export default function AppPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        {/* hero */}
        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> LIVE · PAPER AT LIVE PRICES · MANTLE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The live <span className="text-chartreuse">floor</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Not a screenshot — the firm, running. Nine desks vote, the PM mostly{" "}
            <span className="text-bone">holds</span>, and the exploration floor opens desk-justified
            paper positions you can watch resolve against their stops and targets. Drag the engine; read the book.
          </p>
        </section>

        {/* the engine */}
        <div className="relative z-10 mt-8">
          <TheCore />
        </div>

        {/* the live demo */}
        <section className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-10 xl:px-4">
          <LiveFloor />

          {/* hire CTA */}
          <div className="mt-14 flex flex-col items-start gap-4 border-2 border-bone/25 bg-carbon px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl font-bold uppercase text-bone">Want to run capital through it?</p>
              <p className="mt-1 text-sm text-bone/55">
                Deposit into the on-chain escrow, set the term, let the firm decide and settle on Mantle.
              </p>
            </div>
            <a
              href="/hire"
              className="gr-press shrink-0 border-2 border-bone bg-chartreuse px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-pitch"
              style={{ boxShadow: "5px 5px 0 rgba(242,239,230,0.9)" }}
            >
              Hire the engine →
            </a>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE LIVE FLOOR · paper at live prices — real capital needs a validated edge
          </p>
        </div>
      </footer>
    </>
  );
}
