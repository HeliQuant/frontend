/**
 * /carry — THE EDGE. The one strategy that showed a real, positive, cost-aware edge in walk-forward:
 * delta-neutral funding-carry (long spot + short perp, market-neutral, predicts nothing). Honest —
 * validated rates are a dated walk-forward result; live rates are read from real funding; the firm
 * harvests only when carry is rich + crash-robust, and waits when it isn't.
 */

import AppNav from "@/components/garage/AppNav";
import CarryDesk from "@/components/garage/CarryDesk";

export default function CarryPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> THE ONE VALIDATED EDGE · NON-DIRECTIONAL · LIVE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The <span className="text-chartreuse">edge</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Everything else in the firm asks &quot;which way?&quot; and — honestly — finds no edge on a 1–4h tape.
            This one asks a different question: <span className="text-bone">where can we earn yield without
            predicting?</span> Delta-neutral funding-carry — long spot, short perp — is market-neutral and showed
            a <span className="text-chartreuse">real, positive, cost-aware edge in walk-forward</span>. It only
            pays when funding is fat; right now it&apos;s thin, so the firm waits. The edge is real; the discipline
            is harvesting it only when it pays.
          </p>

          <div className="mt-12">
            <CarryDesk />
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE EDGE · a validated, non-directional yield — harvested with discipline, never forced
          </p>
        </div>
      </footer>
    </>
  );
}
