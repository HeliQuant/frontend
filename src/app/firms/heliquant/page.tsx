/**
 * /firms/heliquant — "THE HOMOLOGATION PAPERS" (Night Garage §6.9)
 *
 * A racing team doesn't get on track by claiming it's fast — it gets HOMOLOGATED:
 * registered, scrutineered, bound by rules. This page is the firm's license: the chassis
 * plate (ERC-8004 identity), the scrutineering stamps (six deployed contracts, every
 * address real and linked), the crew roster (nine desks), the license conditions (the
 * honesty gates), and the service history (real milestones only).
 *
 * REPLACES the stale firm page that still showed the SCRUBBED V5 77.78% / +1.23% metrics
 * and a fictional strategy roster — those numbers were retired by the lab and must never
 * reappear. The license states what is true today: registry empty, firm in N, every
 * decision sealed.
 */

import AppNav from "@/components/garage/AppNav";
import { CONTRACTS, FIRST_ANCHOR, MANTLESCAN } from "@/lib/heliquant";

const CREW = [
  { role: "REGIME / TECHNICAL", duty: "reads the tape's state — trend, range, chop" },
  { role: "MACRO · ALLORA", duty: "decentralized AI inference as the macro read" },
  { role: "ON-CHAIN / RISK", duty: "wallet flows, token safety, rug veto" },
  { role: "SMART-MONEY FLOW", duty: "DEX + staking flow of informed wallets" },
  { role: "RESEARCH", duty: "public-source diligence on the asset" },
  { role: "OI-CONTRARIAN", duty: "crowd positioning extremes (the retired edge's desk)" },
  { role: "FLOW-INTEL", duty: "self-learning which flow signals validate — FDR-gated" },
  { role: "WHALE TRACKER", duty: "Hyperliquid top-PnL wallets, per traded asset" },
  { role: "MANTLE FUNDAMENTALS", duty: "DeFiLlama chain TVL + fees — ecosystem risk-on/off" },
];

const CONDITIONS = [
  "ENTER only on an edge that survives cost-aware OOS + anchored walk-forward + FDR",
  "no validated edge → ABSTAIN (the gearbox holds N) — restraint over fee donation",
  "every decision, including the abstain, is sealed on-chain on Mantle",
  "winners get crash-tested; survivors get re-tested on fresh data; decayed edges are retired",
  "failures are published — the scrap shelf is part of the product",
  "position sizing: quarter-Kelly, hard caps, drawdown breaker — never a full-send",
];

const HISTORY = [
  { date: "2026-05", event: "regime classifier validated — 82.6% OOS accuracy" },
  { date: "2026-06-02", event: `first decision anchored on Mantle — block ${FIRST_ANCHOR.block.toLocaleString("en-US")} (ABSTAIN, sealed)` },
  { date: "2026-06-02", event: "OI-contrarian edge validated +28.9% OOS — licensed to trade" },
  { date: "2026-06-02", event: "mETH/ETH +96% backtest crash-tested → REJECTED (−73 bps slippage)" },
  { date: "2026-06-07", event: "execution proven — 100/100 live spot round-trips filled on exchange testnet" },
  { date: "2026-06-07", event: "the validated edge DECAYED on fresh data → retired; registry now empty" },
  { date: "2026-06-08", event: "always-on cloud floor live on Railway — cycles self-driving, state persisted" },
];

export default function HeliQuantFirmPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> HOMOLOGATION · ERC-8004 · MANTLE
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            Racing <span className="text-chartreuse">license</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            A firm doesn&apos;t earn trust by claiming it&apos;s fast. It gets registered, scrutineered,
            and bound by rules it can&apos;t quietly break. All of it on-chain.
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ── left: chassis plate + scrutineering stamps ── */}
            <div className="space-y-8">
              {/* chassis plate */}
              <div className="gr-shadow-chart relative border-2 border-bone bg-carbon p-6">
                {/* rivets */}
                {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((pos) => (
                  <span key={pos} aria-hidden className={`absolute ${pos} h-2 w-2 rounded-full border border-bone/50 bg-pitch`} />
                ))}
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">chassis plate · identity</p>
                <p className="mt-3 font-display text-5xl font-extrabold uppercase leading-none text-bone">
                  Heli<span className="text-chartreuse">Quant</span>
                </p>
                <div className="mt-4 space-y-1.5 font-mono text-[11px] tracking-wide text-bone/70">
                  <p>
                    <span className="text-steel">CLASS ▸</span> AUTONOMOUS TRADING FIRM · 9 DESKS · 1 PM
                  </p>
                  <p>
                    <span className="text-steel">SERIES ▸</span> AI TRADING &amp; STRATEGY
                  </p>
                  <p>
                    <span className="text-steel">IDENTITY ▸</span> ERC-8004 REGISTRY (on-chain, verifiable)
                  </p>
                  <p>
                    <span className="text-steel">STATE ▸</span>{" "}
                    <span className="text-bone">REGISTRY EMPTY → GEAR N · STILL SEALING EVERY CYCLE</span>
                  </p>
                </div>
              </div>

              {/* scrutineering stamps — the six deployed contracts */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">
                  scrutineering stamps · deployed contracts (tap to verify)
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {CONTRACTS.map((c, i) => (
                    <a
                      key={c.name}
                      href={`${MANTLESCAN}/address/${c.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gr-rise group border-2 border-bone/25 bg-pitch px-4 py-3 transition-colors hover:border-chartreuse"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <p className="flex items-center justify-between font-display text-lg font-bold uppercase tracking-wide text-bone group-hover:text-chartreuse">
                        {c.name}
                        <span aria-hidden className="text-chartreuse">✓</span>
                      </p>
                      <p className="mt-1 break-all font-mono text-[10px] tracking-wide text-steel">{c.address}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── right: crew + conditions ── */}
            <div className="space-y-8">
              {/* crew roster */}
              <div className="border-2 border-bone/25 bg-carbon p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">crew roster · the nine desks</p>
                <ul className="mt-4 divide-y divide-bone/10">
                  {CREW.map((c) => (
                    <li key={c.role} className="flex items-baseline justify-between gap-4 py-2">
                      <span className="shrink-0 font-display text-base font-bold uppercase tracking-wide text-bone">
                        {c.role}
                      </span>
                      <span className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-steel">
                        {c.duty}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* license conditions — the honesty gates */}
              <div className="border-2 border-chartreuse bg-carbon p-5" style={{ boxShadow: "6px 6px 0 rgba(201,242,75,0.5)" }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-chartreuse">
                  license conditions · breach = the product is void
                </p>
                <ul className="mt-4 space-y-2.5">
                  {CONDITIONS.map((c, i) => (
                    <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-bone/75">
                      <span className="font-mono text-chartreuse">{String(i + 1).padStart(2, "0")}</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── service history — real milestones only ── */}
          <div className="mt-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">service history · stamped entries</p>
            <div className="mt-4 border-2 border-bone/25 bg-carbon">
              {HISTORY.map((h, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[96px_1fr] items-baseline gap-4 border-b border-bone/10 px-5 py-3 last:border-b-0"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{h.date}</span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-bone/75">{h.event}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
              first anchor tx ▸{" "}
              <a
                href={`${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-chartreuse hover:underline"
              >
                {FIRST_ANCHOR.txHash.slice(0, 12)}…{FIRST_ANCHOR.txHash.slice(-8)} ↗
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · HOMOLOGATED ON MANTLE · the license is public, the rules are code
          </p>
        </div>
      </footer>
    </>
  );
}
