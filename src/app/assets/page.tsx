import { Header } from "@/components/header";

// Honest, reproducible result: MNT on the committed fixed dataset (scripts/10).
const HERO = {
  ticker: "MNT",
  name: "Mantle",
  cfg: "RSI 25/75 · TP 1.8×ATR · flat-gate 3%",
  win: "69%",
  roi: "+1.36%",
  pf: "1.70",
};

// Multi-asset exploration — honest finding, not a profit claim.
const EXPLORED = [
  { ticker: "BTC", name: "Bitcoin" },
  { ticker: "mETH", name: "Mantle Staked Ether" },
  { ticker: "fBTC", name: "Function BTC" },
  { ticker: "cmETH", name: "Mantle Restaked ETH" },
  { ticker: "USDe", name: "Ethena USDe" },
];

export const dynamic = "force-dynamic";

export default function AssetsPage() {
  return (
    <main className="flex-1">
      <Header />
      <section className="border-b border-neutral-800/60">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/90">
            Validated market
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            MNT/USDC — the calibrated showcase
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            HELIQUANT is fully tuned and validated on MNT, the native Mantle asset, over a
            committed 90-day hourly dataset with realistic 0.10% per-swap costs. This is the
            one result we present as reproducible — it runs from a fixed dataset, not a
            live-refetched window.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Win rate" value={HERO.win} />
            <Stat label="ROI (90d)" value={HERO.roi} />
            <Stat label="Profit factor" value={HERO.pf} />
            <Stat label="vs buy-and-hold" value="+8.4pp" />
          </div>
          <p className="mt-3 font-mono text-xs text-neutral-500">{HERO.cfg}</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400/90">
            Honest research finding
          </p>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            Multi-asset: the overfitting wall
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            We built a per-asset config system and a grid-search tuner
            (<code className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[0.7rem]">scripts/12_tune_asset.py</code>)
            to extend across the Mantle ecosystem basket. The tuner finds configs that look
            strong on the window they were tuned on — but those gains did <strong>not</strong>{" "}
            reproduce when the strategy was re-tested on a fresh data window. A BTC config that
            scored +0.94% in-sample fell to −0.31% out-of-sample.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">
            That is textbook overfitting — the exact failure mode that makes most retail
            &quot;AI trading&quot; claims hollow. Rather than ship inflated numbers, we disclose it:
            these assets are <strong>explored, not validated</strong>. Robust multi-asset
            deployment requires walk-forward optimization, which is our explicit roadmap.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {EXPLORED.map((a) => (
              <span
                key={a.ticker}
                className="rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-3 py-1.5 text-xs text-neutral-400"
              >
                <span className="font-semibold text-neutral-200">{a.ticker}</span> · {a.name}{" "}
                <span className="ml-1 text-amber-400/80">explored</span>
              </span>
            ))}
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            The framework is asset-agnostic; the pipeline (data → features → regime model →
            lifecycle-gated strategy router) runs unchanged on any pair. What does not
            generalize for free is the parameter set — and we would rather say that plainly
            than annualize a lucky week.
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold text-emerald-300">{value}</p>
    </div>
  );
}
