/**
 * /assets — "THE DYNO BAYS" (Night Garage §6.8)
 *
 * Every asset is an engine on a test stand. Each bay shows what the lab actually measured:
 * the PATTERN gauge (return-autocorrelation — under 0.05 the tape is a random walk: don't
 * predict it, follow flow), the live funding-carry read, and the stamped verdict from the
 * edge lab. This page REPLACES the stale "MNT 69% / +1.36%" showcase (an old in-sample
 * replay — superseded). Current truth: all majors test EFFICIENT, the one validated edge
 * decayed and was retired, the registry is empty, the firm holds N.
 */

import AppNav from "@/components/garage/AppNav";

type Bay = {
  no: string;
  ticker: string;
  name: string;
  pattern: { label: string; frac: number; note: string }; // frac = marker position 0..1 on the gauge (0.15 scale)
  carry: string;
  verdict: { stamp: string; tone: "signal" | "bone" | "chartreuse"; story: string };
};

// pattern gauge scale: 0 → 0.15 |acf|; zones: <0.05 efficient · 0.05–0.10 weak · >0.10 patterned
const BAYS: Bay[] = [
  {
    no: "BAY-01",
    ticker: "MNT",
    name: "Mantle",
    pattern: { label: "0.031", frac: 0.031 / 0.15, note: "measured — efficient" },
    carry: "+3.2%/yr live · thin (below risk-free)",
    verdict: {
      stamp: "EDGE RETIRED",
      tone: "signal",
      story:
        "The one edge that ever passed the dyno (OI-contrarian, +28.9% OOS) — until fresh full-history data showed the pattern gone. The lab pulled its license. Honest firms retire edges.",
    },
  },
  {
    no: "BAY-02",
    ticker: "BTC",
    name: "Bitcoin",
    pattern: { label: "<0.05", frac: 0.04 / 0.15, note: "efficient" },
    carry: "+0.6%/yr live · thin",
    verdict: {
      stamp: "FEE-EATEN",
      tone: "signal",
      story:
        "Seven research rounds, including an ML disproof. Every directional signal that survived the math died at the fee line. The most efficient tape we tested — we say so instead of forcing trades.",
    },
  },
  {
    no: "BAY-03",
    ticker: "ETH",
    name: "Ethereum",
    pattern: { label: "<0.05", frac: 0.042 / 0.15, note: "efficient" },
    carry: "+0.8%/yr live · thin",
    verdict: {
      stamp: "NO EDGE",
      tone: "bone",
      story: "Momentum loses out-of-sample. Carry below risk-free. The bay stays instrumented; the engine stays off.",
    },
  },
  {
    no: "BAY-04",
    ticker: "HYPE",
    name: "Hyperliquid",
    pattern: { label: "<0.05", frac: 0.045 / 0.15, note: "efficient" },
    carry: "+1.9%/yr live · backtest best: +7.2%/yr crash-robust",
    verdict: {
      stamp: "PROBATION",
      tone: "chartreuse",
      story:
        "Best delta-neutral carry in the backtest (crash-robust). A flow signal also flashed +92% — one lucky fold drove it, so it sits in candidate probation, not the registry. Forward-confirm or scrap.",
    },
  },
  {
    no: "BAY-05",
    ticker: "SUI",
    name: "Sui",
    pattern: { label: "<0.05", frac: 0.04 / 0.15, note: "efficient" },
    carry: "+5.7%/yr live · backtest +5.1%/yr but lumpy",
    verdict: {
      stamp: "LUMPY CARRY",
      tone: "bone",
      story: "Carry beats risk-free on average but arrives in lumps with crash risk. Tracked, not trusted.",
    },
  },
  {
    no: "BAY-06",
    ticker: "mETH",
    name: "Mantle Staked ETH",
    pattern: { label: "n/a", frac: 0, note: "no perp tape" },
    carry: "no perp venue — carry not executable",
    verdict: {
      stamp: "NO VENUE",
      tone: "signal",
      story:
        "The +96% convergence backtest lived here — and died on thin DEX liquidity (−73 bps a trade). See the crash test on the landing page. No executable venue, no bay time.",
    },
  },
  {
    no: "BAY-07",
    ticker: "SOL",
    name: "Solana",
    pattern: { label: "efficient", frac: 0.04 / 0.15, note: "momentum loses OOS" },
    carry: "−0.6%/yr live · no harvestable carry",
    verdict: {
      stamp: "NO EDGE",
      tone: "bone",
      story:
        "Directional momentum loses out-of-sample and funding offers no carry. The bay stays instrumented; the engine stays off until a signal clears the cost line. Tracked on Bitget, traded by no one here without an edge.",
    },
  },
  {
    no: "BAY-08",
    ticker: "XRP",
    name: "XRP",
    pattern: { label: "new", frac: 0.05 / 0.15, note: "profiling — just listed" },
    carry: "+1.4%/yr live · thin (below risk-free)",
    verdict: {
      stamp: "ENROLLED",
      tone: "chartreuse",
      story:
        "The newest bay — one of three assets that fill on the REAL Bitget testnet (with BTC + ETH). It runs the exact same gate as everything else: no validated edge yet, profiled live before any conviction. New tape earns trust the hard way.",
    },
  },
];

const stampCls = (tone: Bay["verdict"]["tone"]) =>
  tone === "signal"
    ? "border-signal2 text-signal2"
    : tone === "chartreuse"
      ? "border-chartreuse text-chartreuse"
      : "border-bone/60 text-bone/80";

export default function AssetsPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> THE TEST CELLS · PER-ASSET CHARACTER · LIVE READS
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The dyno <span className="text-chartreuse">bays</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Six machines on six stands. The pattern gauge reads return-autocorrelation — under{" "}
            <span className="font-mono text-bone">0.05</span> the tape is a random walk:{" "}
            <span className="text-bone">you don&apos;t predict it, you follow flow.</span> Verdicts are
            stamped by the edge lab, not by marketing.
          </p>

          {/* ── the bays ── */}
          <div className="mt-12 space-y-5">
            {BAYS.map((b, i) => (
              <div
                key={b.ticker}
                className="gr-rise relative grid gap-5 border-2 border-bone/25 bg-carbon p-5 sm:p-6 lg:grid-cols-[210px_1fr_300px]"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* stand plate */}
                <div className="flex items-start gap-4 lg:flex-col lg:gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">{b.no}</p>
                  <p className="font-display text-5xl font-extrabold leading-none text-bone">{b.ticker}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{b.name}</p>
                </div>

                {/* gauges */}
                <div className="flex flex-col justify-center gap-4">
                  {/* pattern gauge: zones efficient | weak | patterned, marker at the measured acf */}
                  <div>
                    <div className="flex items-baseline justify-between">
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">
                        pattern gauge · |return acf|
                      </p>
                      <p className="font-mono text-[11px] tracking-wide text-bone/80">
                        {b.pattern.label} <span className="text-steel">· {b.pattern.note}</span>
                      </p>
                    </div>
                    <div className="relative mt-2 h-6 border border-bone/20 bg-pitch">
                      {/* zones: 0–0.05 (efficient · 33%) | 0.05–0.10 (weak) | 0.10–0.15 (patterned) */}
                      <span aria-hidden className="absolute inset-y-0 left-1/3 w-px bg-bone/25" />
                      <span aria-hidden className="absolute inset-y-0 left-2/3 w-px bg-bone/25" />
                      <span className="absolute bottom-full left-0 pb-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-steel/0">.</span>
                      {/* marker */}
                      {b.pattern.frac > 0 && (
                        <span
                          className="absolute inset-y-0 w-[3px] bg-chartreuse"
                          style={{ left: `${Math.min(97, b.pattern.frac * 100)}%` }}
                        />
                      )}
                      <span className="absolute inset-y-0 left-1.5 flex items-center font-mono text-[8px] uppercase tracking-[0.16em] text-steel">
                        efficient
                      </span>
                      <span className="absolute inset-y-0 left-[35%] flex items-center font-mono text-[8px] uppercase tracking-[0.16em] text-steel/70">
                        weak
                      </span>
                      <span className="absolute inset-y-0 left-[68%] flex items-center font-mono text-[8px] uppercase tracking-[0.16em] text-steel/70">
                        patterned → predict
                      </span>
                    </div>
                  </div>
                  {/* carry line */}
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/70">
                    <span className="text-steel">funding carry ▸</span> {b.carry}
                  </p>
                </div>

                {/* verdict stamp + story */}
                <div className="flex flex-col justify-center gap-3">
                  <span
                    className={`w-fit -rotate-3 border-[3px] px-3 py-1 font-display text-xl font-extrabold uppercase tracking-wider ${stampCls(b.verdict.tone)}`}
                  >
                    {b.verdict.stamp}
                  </span>
                  <p className="text-[13px] leading-relaxed text-bone/55">{b.verdict.story}</p>
                </div>
              </div>
            ))}
          </div>

          {/* the floor's honest state */}
          <div className="mt-10 border-2 border-bone/30 bg-carbon px-5 py-4">
            <p className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-steel">
              registry today: <span className="text-bone">EMPTY</span> — every bay idle, the firm holds{" "}
              <span className="text-bone">N</span>. exploration keeps hunting (paper budget, fresh data,{" "}
              <span className="text-chartreuse">FDR-gated</span>) — the first hypothesis that survives the
              dyno gets the next license.
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE DYNO BAYS · measured, stamped, published — including the failures
          </p>
        </div>
      </footer>
    </>
  );
}
