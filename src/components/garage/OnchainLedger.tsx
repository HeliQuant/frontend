"use client";

/**
 * OnchainLedger — THE BLACK BOX page. The firm's on-chain anchor trail: every decision is sealed as a
 * SHA-256 in a Mantle Sepolia self-send tx's calldata, fetched LIVE from Etherscan v2 (/onchain). A
 * flight recorder — tamper-proof, verifiable on Mantlescan, not a claim. Modular: paste any wallet to
 * trace its trail (BYO credentials use the server's read key). Distinct from the landing BlackBox
 * section (which reads decisions_hq) — this is the raw chain tape.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { fetchOnchain, type OnchainLedger as Ledger } from "@/lib/campaign";

const POLL_MS = 30000;

function ago(sec: number): string {
  const s = Math.max(0, Math.floor(Date.now() / 1000 - sec));
  if (s < 90) return `${s}s`;
  if (s < 5400) return `${Math.floor(s / 60)}m`;
  if (s < 172800) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function OnchainLedger() {
  const [data, setData] = useState<Ledger | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [wallet, setWallet] = useState<string | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const d = await fetchOnchain(wallet);
      if (!alive) return;
      setReached(Boolean(d));
      if (d) setData(d);
    };
    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [wallet]);

  const anchors = useMemo(() => (data?.txs ?? []).filter((t) => t.self_anchor).length, [data]);
  const valid = /^0x[0-9a-fA-F]{40}$/.test(input.trim());

  return (
    <div className="space-y-10">
      {/* recorder head — wallet + chain + counts */}
      <div className="border-2 border-bone/25 bg-carbon">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-bone/15 px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">recorder · wallet</p>
            <a
              href={data ? `${data.explorer}/address/${data.wallet}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate font-mono text-sm text-chartreuse hover:underline"
            >
              {data?.wallet ?? "—"}
            </a>
          </div>
          <div className="flex gap-8">
            <Stat k="chain" v={data?.chain ?? "Mantle Sepolia"} />
            <Stat k="total tx" v={`${data?.total ?? 0}`} />
            <Stat k="sealed anchors" v={`${anchors}`} accent />
          </div>
        </div>
        {/* BYO wallet — modular */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">trace any wallet</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x…"
            spellCheck={false}
            className="min-w-[220px] flex-1 border border-bone/25 bg-pitch px-3 py-1.5 font-mono text-xs text-bone placeholder:text-steel/60 focus:border-chartreuse focus:outline-none"
          />
          <button
            type="button"
            disabled={!valid && input.trim() !== ""}
            onClick={() => setWallet(input.trim() || undefined)}
            className="gr-press border-2 border-bone/40 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-bone disabled:opacity-40"
          >
            Trace
          </button>
          {wallet && (
            <button
              type="button"
              onClick={() => {
                setWallet(undefined);
                setInput("");
              }}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel hover:text-bone"
            >
              ↺ firm wallet
            </button>
          )}
        </div>
      </div>

      {/* the tape */}
      {reached === false && !data ? (
        <div className="border-2 border-bone/20 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
          black box unreachable — the firm runs on Railway; retrying every 30s
        </div>
      ) : data?.error ? (
        <div className="border-2 border-signal2/40 bg-carbon px-6 py-8 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-signal2">
          {data.error}
        </div>
      ) : (data?.txs?.length ?? 0) === 0 ? (
        <div className="border-2 border-bone/15 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
          no transactions recorded for this wallet
        </div>
      ) : (
        <div className="relative">
          <div aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-bone/15" />
          <div className="space-y-px">
            {data!.txs.map((t, i) => (
              <motion.a
                key={t.hash}
                href={`${data!.explorer}/tx/${t.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.015, 0.3) }}
                className="group relative flex items-center gap-4 bg-carbon py-3 pl-8 pr-5 hover:bg-bone/[0.04]"
              >
                <span
                  className={`absolute left-[3px] h-2.5 w-2.5 rounded-full border-2 ${
                    t.is_error
                      ? "border-signal2 bg-pitch"
                      : t.self_anchor
                        ? "border-chartreuse bg-chartreuse"
                        : "border-steel bg-pitch"
                  }`}
                />
                <span className="w-20 shrink-0 font-mono text-[10px] text-steel">#{t.block}</span>
                <span className="flex-1 truncate font-mono text-xs text-bone/85 group-hover:text-chartreuse">{t.hash}</span>
                <span
                  className={`hidden shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] sm:inline ${
                    t.is_error
                      ? "border-signal2/50 text-signal2"
                      : t.self_anchor
                        ? "border-chartreuse/50 text-chartreuse"
                        : "border-bone/25 text-steel"
                  }`}
                >
                  {t.is_error ? "reverted" : t.self_anchor ? "decision sealed" : "tx"}
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-[10px] text-steel">{ago(t.ts)}</span>
                <span aria-hidden className="shrink-0 font-mono text-[10px] text-steel/60 group-hover:text-chartreuse">↗</span>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
        each <span className="text-chartreuse">sealed anchor</span> is a SHA-256 of a decision, written to a
        Mantle Sepolia tx&apos;s calldata — <span className="text-bone">tap any row to verify on Mantlescan.</span>{" "}
        the firm can&apos;t rewrite history; the chain is the witness.
      </p>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-steel">{k}</p>
      <p className={`font-display text-xl font-extrabold leading-none ${accent ? "text-chartreuse" : "text-bone"}`}>{v}</p>
    </div>
  );
}
