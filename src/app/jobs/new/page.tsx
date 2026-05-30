import Link from "next/link";

import { Header } from "@/components/header";
import { DEPLOYED_CONTRACTS, MANTLESCAN_BASE } from "@/lib/contracts";

export default function NewJobPage() {
  return (
    <main className="flex-1">
      <Header />

      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
            ERC-8183 escrow job
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Hire HELIQUANT to trade for you
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-300">
            Deposit USDC into the JobManager contract. HELIQUANT trades MNT/USDC for the
            duration you specify, then settles deterministic on-chain: profit splits by
            performance fee, losses absorbed entirely by you. No counterparty risk,
            full audit trail.
          </p>

          <form className="mt-10 space-y-6">
            <Field
              label="Firm to hire"
              control={
                <select
                  disabled
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200"
                  defaultValue="heliquant"
                >
                  <option value="heliquant">HELIQUANT (V5 production, 77.78% historical win rate)</option>
                </select>
              }
              hint="More firms coming when ERC-8004 registry supports third-party deployments."
            />

            <Field
              label="Principal deposit"
              control={
                <div className="flex overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
                  <input
                    type="number"
                    placeholder="100"
                    defaultValue="100"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-100 outline-none"
                  />
                  <span className="grid place-items-center bg-neutral-900/80 px-4 text-sm text-neutral-400">
                    USDC
                  </span>
                </div>
              }
              hint="Mock USDC on Mantle Sepolia. Real USDC support after mainnet deploy."
            />

            <Field
              label="Job duration"
              control={
                <select
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200"
                  defaultValue="86400"
                >
                  <option value="3600">1 hour (demo / smoke test)</option>
                  <option value="86400">24 hours</option>
                  <option value="259200">3 days</option>
                  <option value="604800">7 days</option>
                </select>
              }
            />

            <Field
              label="Performance fee on profit"
              control={
                <div className="flex overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
                  <input
                    type="number"
                    defaultValue="20"
                    min="0"
                    max="30"
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-100 outline-none"
                  />
                  <span className="grid place-items-center bg-neutral-900/80 px-4 text-sm text-neutral-400">
                    %
                  </span>
                </div>
              }
              hint="Capped at 30% in the contract. Charged only on positive PnL at settlement."
            />

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-emerald-700/40 bg-emerald-700/10 px-6 py-3 text-sm font-semibold text-emerald-200/70"
            >
              Connect wallet to deposit (Mantle Sepolia)
            </button>
            <p className="text-xs text-neutral-500">
              Demo build — wallet integration on hire flow is the next milestone. Today
              the contracts are deployed and verified on Mantle Sepolia; submission via
              direct tx on{" "}
              <Link
                href={`${MANTLESCAN_BASE}/${DEPLOYED_CONTRACTS.jobManager}`}
                target="_blank"
                className="underline decoration-emerald-700/50 hover:decoration-emerald-300"
              >
                JobManager
              </Link>
              .
            </p>
          </form>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="text-lg font-semibold">What happens after deposit</h2>
          <ol className="mt-4 space-y-3 text-sm text-neutral-300">
            <li>
              <span className="font-semibold text-emerald-300">1.</span>{" "}
              JobManager escrows your USDC, opens a TradingVault slot tied to your jobId.
            </li>
            <li>
              <span className="font-semibold text-emerald-300">2.</span>{" "}
              HELIQUANT Signal Agent evaluates regime + multi-source vote every 5 minutes.
              When all gates agree, Execution Agent submits the trade through TradingVault.
            </li>
            <li>
              <span className="font-semibold text-emerald-300">3.</span>{" "}
              Every fill emits an on-chain event. Reputation Agent updates ERC-8004
              ReputationRegistry; ValidationRegistry records the credential.
            </li>
            <li>
              <span className="font-semibold text-emerald-300">4.</span>{" "}
              After duration elapses, any caller can settle. Vault flushes any open base
              token back to USDC, JobManager splits the final balance via the deterministic
              formula. Funds are unlocked, no oracle required.
            </li>
          </ol>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  control,
  hint,
}: {
  label: string;
  control: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <div className="mt-2">{control}</div>
      {hint ? <p className="mt-2 text-xs text-neutral-500">{hint}</p> : null}
    </label>
  );
}
