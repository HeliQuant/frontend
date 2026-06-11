/**
 * /ledger — THE BLACK BOX. The firm's verifiable on-chain anchor trail (Mantle Sepolia), fetched live
 * from Etherscan v2. Every decision sealed in calldata, tappable to Mantlescan. Modular: trace any
 * wallet. Distinct metaphor — a flight-recorder tape.
 */

import AppNav from "@/components/garage/AppNav";
import OnchainLedger from "@/components/garage/OnchainLedger";

export default function LedgerPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> VERIFIABILITY · MANTLE SEPOLIA · ETHERSCAN-FETCHED · LIVE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The black <span className="text-chartreuse">box</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            A flight recorder survives the crash — that&apos;s the point. Every decision the firm makes is
            hashed and sealed into a Mantle transaction&apos;s calldata. This tape is fetched straight from
            Etherscan; tap any row to verify it yourself on Mantlescan. The firm can&apos;t rewrite history.
          </p>

          <div className="mt-12">
            <OnchainLedger />
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE BLACK BOX · decisions sealed on Mantle — public, verifiable, tamper-proof
          </p>
        </div>
      </footer>
    </>
  );
}
