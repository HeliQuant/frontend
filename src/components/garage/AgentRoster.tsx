"use client";

/**
 * AgentRoster — THE CREW. HeliQuant's firm + 9 desks as ERC-8004 on-chain identities (IdentityRegistry
 * on Mantle Sepolia). Each desk is a registered agent with a tokenId, an on-chain reputation that
 * accrues from its track record, and (cross-referenced) its off-chain desk_performance reliability.
 * Reads /agents live. Honest: reputation accrues forward — most read zero until outcomes are recorded.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { fetchAgents, type Agent, type AgentRoster as Roster } from "@/lib/campaign";

const POLL_MS = 60000;

const KIND_COLOR: Record<string, string> = {
  Firm: "text-bone border-bone/40",
  Signal: "text-chartreuse border-chartreuse/40",
  Research: "text-[#7fd1ff] border-[#7fd1ff]/40",
  Risk: "text-signal2 border-signal2/40",
  Execution: "text-bone/70 border-bone/30",
};

export default function AgentRoster() {
  const [data, setData] = useState<Roster | null>(null);
  const [reached, setReached] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      const d = await fetchAgents();
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
  }, []);

  const explorer = data?.explorer ?? "https://sepolia.mantlescan.xyz";
  const identity = data?.identity ?? "";
  const tokenLink = (tid: number | null) =>
    tid != null && identity ? `${explorer}/token/${identity}?a=${tid}` : `${explorer}/address/${identity}`;
  const firm = data?.agents?.find((a) => a.kind === "Firm");
  const desks = data?.agents?.filter((a) => a.kind !== "Firm") ?? [];

  if (reached === false && !data) {
    return (
      <div className="border-2 border-bone/20 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
        roster unreachable — the firm runs on Railway; retrying every 60s
      </div>
    );
  }
  if (data?.error) {
    return (
      <div className="border-2 border-bone/15 bg-carbon px-6 py-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-steel">
        {data.error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* firm card */}
      {firm && (
        <a
          href={tokenLink(firm.tokenId)}
          target="_blank"
          rel="noopener noreferrer"
          className="gr-shadow-chart group flex flex-wrap items-center justify-between gap-4 border-2 border-chartreuse/50 bg-carbon px-6 py-5 hover:bg-bone/[0.03]"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">the firm · ERC-8004 identity</p>
            <p className="mt-1 font-display text-3xl font-extrabold uppercase text-bone">
              Heli<span className="text-chartreuse">Quant</span>
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-bone/50">{firm.role}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-extrabold text-chartreuse">#{firm.tokenId}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel group-hover:text-chartreuse">
              token · verify ↗
            </p>
          </div>
        </a>
      )}

      {/* desk grid */}
      <div className="grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-3">
        {desks.map((a, i) => (
          <AgentCard key={a.tokenId ?? a.name} a={a} href={tokenLink(a.tokenId)} delay={Math.min(i * 0.03, 0.3)} />
        ))}
      </div>

      <p className="border-l-2 border-chartreuse bg-carbon px-5 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/80">
        every desk is a <span className="text-chartreuse">registered on-chain agent</span> (ERC-8004) — not a
        claim. its reputation is its <span className="text-bone">real track record</span>, written to Mantle as
        outcomes resolve. tap any to verify on Mantlescan.
      </p>
    </div>
  );
}

function AgentCard({ a, href, delay }: { a: Agent; href: string; delay: number }) {
  const kc = KIND_COLOR[a.kind] ?? "text-bone/70 border-bone/30";
  const rep = a.reputation;
  const w = a.weight;
  const wColor = w == null ? "text-steel" : w > 1.05 ? "text-chartreuse" : w < 0.95 ? "text-signal2" : "text-bone/60";
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group flex flex-col justify-between bg-carbon p-5 hover:bg-bone/[0.03]"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-display text-lg font-extrabold uppercase leading-tight text-bone">{a.name}</span>
          <span className="shrink-0 font-mono text-sm font-bold text-chartreuse">#{a.tokenId}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${kc}`}>{a.kind}</span>
          {a.ml && (
            <span className="border border-chartreuse/50 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-chartreuse">
              ML · XGBoost
            </span>
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-bone/45">{a.role}</p>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-bone/10 pt-3 font-mono text-[10px]">
        <div>
          <p className="text-steel">on-chain reputation</p>
          <p className="text-bone/70">
            {rep ? `${rep.successful_jobs}/${rep.total_jobs} jobs` : "—"}
            {rep && rep.total_jobs === 0 ? <span className="text-steel"> · accruing</span> : null}
          </p>
        </div>
        <div className="text-right">
          <p className="text-steel">reliability</p>
          <p className={wColor}>{w != null ? `${w.toFixed(2)}×` : "neutral"}</p>
        </div>
      </div>
      <span aria-hidden className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-steel group-hover:text-chartreuse">
        verify on mantlescan ↗
      </span>
    </motion.a>
  );
}
