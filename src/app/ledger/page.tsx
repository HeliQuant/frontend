/**
 * /ledger — THE LEDGER. HeliQuant's complete trade record (every resolved trade + data) on top, the
 * on-chain verifiability trail (decision anchors on Mantle Sepolia, fetched from Etherscan) below.
 * Honest split: trades are paper/testnet; DECISIONS are what get sealed on-chain.
 */

import AppNav from "@/components/garage/AppNav";
import TradeLedger from "@/components/garage/TradeLedger";

export default function LedgerPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> THE COMPLETE RECORD · EVERY TRADE · EVERY DECISION SEALED · LIVE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The <span className="text-chartreuse">ledger</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Every trade the firm has resolved — direction, entry, exit, P&amp;L, why it exited, the regime
            it opened in, and the <span className="text-chartreuse">Mantle transaction</span> that sealed its
            outcome. Tap any tx to verify it yourself on Mantlescan. Nothing hidden, nothing faked.
          </p>

          {/* the trade record — each row carries its own on-chain anchor */}
          <div className="mt-12">
            <TradeLedger />
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE LEDGER · every trade logged, every decision sealed — paper-honest, chain-verified
          </p>
        </div>
      </footer>
    </>
  );
}
