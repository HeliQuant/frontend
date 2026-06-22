/**
 * /agents — THE CREW. HeliQuant's firm + 9 desks as ERC-8004 on-chain identities, each with a
 * verifiable tokenId + accruing on-chain reputation. The "9 desks" claim, made real on Mantle.
 */

import AgentRoster from "@/components/garage/AgentRoster";
import AppNav from "@/components/garage/AppNav";

export default function AgentsPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-24">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> ERC-8004 IDENTITIES · ON MANTLE · 10 REGISTERED AGENTS
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The <span className="text-chartreuse">crew</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            The firm runs <span className="text-bone">twelve desk-voices</span>; ten already hold an ERC-8004
            identity on Mantle — the firm plus its nine core desks — each with a tokenId and an on-chain
            reputation that accrues from its real track record as outcomes resolve. The Regime desk is the ML
            itself (XGBoost). The rest earn identities as they prove out. Verify any on Mantlescan.
          </p>

          <div className="mt-12">
            <AgentRoster />
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE CREW · 10 ERC-8004 agents on Mantle — identity + reputation, verifiable
          </p>
        </div>
      </footer>
    </>
  );
}
