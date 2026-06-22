"use client";

/**
 * THE BLACK BOX — the on-chain ledger as a flight recorder (Night Garage §6.5).
 *
 * Every decision — including every ABSTAIN — is recorded; the anchor lives on Mantle
 * (first anchor: block 39,402,623 · MNT · ABSTAIN · 0xa052ee03…de69b53). The feed below is
 * LIVE from the public-read decisions table; if it can't load, the recorder shows the
 * documented anchor rows instead (clearly labeled). A black box you can't read is a
 * paperweight — ours is public.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { fetchDecisions } from "@/lib/supabase";
import { FIRST_ANCHOR, MANTLESCAN, type Decision } from "@/lib/heliquant";

const ANCHOR = {
  block: FIRST_ANCHOR.block.toLocaleString("en-US"),
  tx: `${FIRST_ANCHOR.txHash.slice(0, 10)}…${FIRST_ANCHOR.txHash.slice(-8)}`,
  href: `${MANTLESCAN}/tx/${FIRST_ANCHOR.txHash}`,
};

// documented fallback rows (real, from the lab books) — used only if the live feed is empty
const FALLBACK: Array<Pick<Decision, "ts" | "ticker" | "decision" | "direction">> = [
  { ts: "2026-06-10", ticker: "ETH", decision: "ABSTAIN", direction: "NONE" },
  { ts: "2026-06-09", ticker: "BTC", decision: "ABSTAIN", direction: "NONE" },
  { ts: "2026-06-09", ticker: "XRP", decision: "ABSTAIN", direction: "NONE" },
];

function stanceColor(d: string) {
  if (d === "ENTER") return "text-chartreuse";
  if (d === "ABSTAIN") return "text-bone/80";
  return "text-signal2";
}

export default function BlackBox() {
  const reduced = useReducedMotion();
  const [rows, setRows] = useState<Decision[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchDecisions(9).then((d) => {
      if (alive) setRows(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  const live = rows !== null && rows.length > 0;
  const feed = live ? rows! : null;

  return (
    <section id="blackbox" className="relative isolate overflow-hidden bg-carbon px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-30" />

      <div className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-chartreuse">▮</span> VERIFIABILITY · MANTLE · PUBLIC READ
        </p>
        <h2
          className="mt-4 max-w-3xl font-display font-extrabold uppercase leading-[0.9] text-bone"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
        >
          The black box <span className="text-chartreuse">is public</span>
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-bone/65">
          Flight recorders survive the crash — that&apos;s the point. Every cycle&apos;s decision,
          even the restraint, lands in a public table and anchors to Mantle.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ── the anchor plaque ── */}
          <div className="gr-shadow-chart relative flex flex-col justify-between border-2 border-bone bg-pitch p-7">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">
                first anchor · proof-stone
              </p>
              <p className="mt-4 font-display text-6xl font-extrabold leading-none text-bone">
                BLOCK
                <br />
                <span className="text-chartreuse">{ANCHOR.block}</span>
              </p>
              <p className="mt-5 font-mono text-sm tracking-wide text-bone/75">{ANCHOR.tx}</p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
                MNTUSDT · ABSTAIN · sealed on Mantle
              </p>
            </div>
            <a
              href={ANCHOR.href}
              target="_blank"
              rel="noreferrer"
              className="gr-press mt-8 inline-block w-fit border-2 border-bone bg-chartreuse px-5 py-2.5 font-display text-base font-bold uppercase tracking-wide text-pitch"
              style={{ boxShadow: "4px 4px 0 rgba(242,239,230,0.9)" }}
            >
              Verify on Mantlescan ↗
            </a>
          </div>

          {/* ── the lap log (live feed) ── */}
          <div className="border-2 border-bone/25 bg-pitch">
            <div className="flex items-center justify-between border-b-2 border-bone/15 px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">
                lap log · decisions_hq
              </p>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span className={`inline-block h-2 w-2 ${live ? "bg-chartreuse" : "bg-steel"} ${reduced ? "" : "gr-spark"}`} />
                <span className={live ? "text-chartreuse" : "text-steel"}>{live ? "live" : "documented"}</span>
              </p>
            </div>

            <div className="divide-y divide-bone/10">
              {(feed ?? FALLBACK).map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 px-5 py-3 sm:grid-cols-[auto_1fr_auto_auto]">
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-steel sm:block">
                    {String(r.ts).slice(0, 10)}
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-bone/80">
                    {r.ticker}USDT
                  </span>
                  <span className={`font-display text-base font-bold uppercase tracking-wide ${stanceColor(String(r.decision))}`}>
                    {r.decision}
                    {r.direction && r.direction !== "NONE" ? ` · ${r.direction}` : ""}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-chartreuse/80">
                    sealed ▮
                  </span>
                </div>
              ))}
            </div>

            <p className="border-t-2 border-bone/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
              {live ? (
                <>reading the public table directly — no middleman<span className="gr-blink text-chartreuse">_</span></>
              ) : (
                <>live feed unreachable here — rows above are the documented anchors</>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
