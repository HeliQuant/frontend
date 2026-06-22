"use client";

/**
 * CommandConsole — "THE TERMINAL". A looping, self-running animation of how HeliQuant decides: a
 * command types in, the firm's 12 desks report one by one, and the PM lands a verdict — almost always
 * ABSTAIN, because real capital needs a validated edge and the registry is empty. It's the moat made
 * visible: many independent reads → one disciplined call → executed on Bitget, sealed on Mantle.
 *
 * Honest framing: this is the DECISION PROCESS (the real desks, the real abstain-discipline), not a
 * live market tick — the desk reads are qualitative states, never fabricated numbers.
 */

import { useEffect, useState } from "react";

const ASSETS = ["BTC", "ETH", "SOL", "XRP", "HYPE", "SUI"];

type Vote = "ABSTAIN" | "SKIP" | "FADE" | "STAND DOWN";
const DESKS: { name: string; read: string; vote: Vote }[] = [
  { name: "REGIME", read: "choppy / no clear trend", vote: "STAND DOWN" },
  { name: "OI-CONTRARIAN", read: "no positioning extreme", vote: "ABSTAIN" },
  { name: "SMART-MONEY", read: "whales split, low conviction", vote: "ABSTAIN" },
  { name: "ON-CHAIN", read: "flows quiet", vote: "ABSTAIN" },
  { name: "MACRO · ALLORA", read: "no directional signal", vote: "ABSTAIN" },
  { name: "SENTIMENT", read: "mixed", vote: "ABSTAIN" },
  { name: "CARRY", read: "funding thin, below risk-free", vote: "SKIP" },
  { name: "MANTLE-FUND", read: "no catalyst", vote: "ABSTAIN" },
  { name: "TIMESFM · VOL", read: "forecast near-flat", vote: "ABSTAIN" },
  { name: "MULTI-TF", read: "1h vs 1D opposed", vote: "FADE" },
  { name: "FLOW-INTEL", read: "no FDR-gated edge", vote: "ABSTAIN" },
  { name: "WHALE", read: "no high-conviction lean", vote: "ABSTAIN" },
];

const voteCls = (v: Vote) =>
  v === "FADE" ? "text-signal2" : v === "STAND DOWN" ? "text-bone/70" : "text-steel";

const TICK_MS = 130;
const GAP = 2; // ticks between command typed and first desk
const HOLD = 12; // ticks to hold the finished verdict before looping

export default function CommandConsole() {
  const [assetIdx, setAssetIdx] = useState(0);
  const [step, setStep] = useState(0);

  const asset = ASSETS[assetIdx];
  const cmd = `analyze ${asset}`;
  const typeEnd = cmd.length;
  const firstDesk = typeEnd + GAP;
  const verdictAt = firstDesk + DESKS.length + 1;
  const roundEnd = verdictAt + HOLD;

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= roundEnd) {
          setAssetIdx((a) => (a + 1) % ASSETS.length);
          return 0;
        }
        return s + 1;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [roundEnd]);

  const typed = cmd.slice(0, Math.min(step, typeEnd));
  const typing = step < typeEnd;
  const deskCount = Math.max(0, Math.min(step - firstDesk + 1, DESKS.length));
  const showVerdict = step >= verdictAt;

  return (
    <section className="relative bg-pitch">
      <div aria-hidden className="gr-hazard h-[10px] opacity-80" />
      <div className="mx-auto max-w-[1280px] px-6 py-20 sm:px-10 xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-bitget">▮</span> THE TERMINAL · WATCH IT DECIDE
        </p>
        <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          Twelve desks. <span className="text-chartreuse">One</span> verdict.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/60">
          Every cycle, twelve independent desks report and the PM decides. Mostly it{" "}
          <span className="text-bone">refuses</span> — no validated edge, no trade. That discipline is the product;
          the rare ENTER is earned, executed on <span className="text-bitget">Bitget</span>, sealed on Mantle.
        </p>

        {/* terminal */}
        <div className="mt-8 overflow-hidden border-2 border-bone/25 bg-carbon">
          {/* titlebar */}
          <div className="flex items-center gap-2 border-b-2 border-bone/15 bg-pitch px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-signal2/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-bone/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-bitget/70" />
            <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">heliquant — firm decision cycle</span>
          </div>

          <div className="grid gap-px bg-bone/10 lg:grid-cols-[1.1fr_1fr]">
            {/* left: command + desk feed */}
            <div className="min-h-[420px] bg-carbon p-5 font-mono text-[13px] leading-relaxed">
              <p className="text-bone/85">
                <span className="text-bitget">heliquant</span>
                <span className="text-steel"> ~ $ </span>
                <span className="text-bone">{typed}</span>
                {typing && <span className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-chartreuse" />}
              </p>

              {step >= typeEnd && (
                <p className="mt-3 text-steel">▸ {DESKS.length} desks convening on <span className="text-bone">{asset}</span>…</p>
              )}

              <div className="mt-2 space-y-1">
                {DESKS.slice(0, deskCount).map((d) => (
                  <div key={d.name} className="flex items-baseline justify-between gap-3 border-l-2 border-bone/15 pl-2">
                    <span className="shrink-0 text-bone/70">{d.name}</span>
                    <span className="flex-1 truncate text-right text-steel">{d.read}</span>
                    <span className={`w-[84px] shrink-0 text-right text-[11px] font-bold uppercase ${voteCls(d.vote)}`}>{d.vote}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right: PM verdict */}
            <div className="flex min-h-[420px] flex-col justify-center bg-pitch p-5">
              {showVerdict ? (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">── PM verdict ──</p>
                  <p className="mt-3 font-display text-6xl font-extrabold uppercase leading-none text-bone">
                    ABSTAIN
                  </p>
                  <p className="mt-4 max-w-sm font-mono text-[12px] leading-relaxed text-bone/70">
                    No validated edge in a choppy regime. <span className="text-bone">Capital preserved, not risked.</span>{" "}
                    12 desks → 0 actionable → the PM holds.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 border border-bitget/50 px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-bitget" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bitget">
                      on ENTER → fills on Bitget testnet · sealed on Mantle
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-steel">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-chartreuse" />
                  <span className="font-mono text-[12px] uppercase tracking-[0.16em]">PM weighing {deskCount}/{DESKS.length} desks…</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-steel/70">
          illustrative of the live process — the real desks, the real abstain-discipline (registry empty by design)
        </p>
      </div>
    </section>
  );
}
