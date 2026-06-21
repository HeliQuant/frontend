"use client";

/**
 * /profile — "YOUR PIT" (Night Garage). The user's own corner: which engine the dashboard reads,
 * its health, the wallet, the credentials on file (KEY NAMES only — never values), and quick links.
 * No-custody: credential names are read from YOUR engine's /setup-status; values never leave it.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import AppNav from "@/components/garage/AppNav";
import { clearEngineUrl, getEngineUrl, isOwnerEngine, pingEngine } from "@/lib/engine";

type SetupStatus = { register_enabled: boolean; stored_keys: string[] };

function trunc(a?: string) {
  return a && a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a ?? "";
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [engineUrl, setEngineUrlState] = useState("");
  const [owner, setOwner] = useState(true);
  const [health, setHealth] = useState<"checking" | "online" | "offline">("checking");
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const url = getEngineUrl();
    const isOwner = isOwnerEngine();
    setEngineUrlState(url);
    setOwner(isOwner);
    (async () => {
      const ok = await pingEngine(url);
      setHealth(ok ? "online" : "offline");
      if (ok && !isOwner) {
        try {
          const r = await fetch(`${url}/setup-status?cb=${Date.now()}`, { cache: "no-store" });
          if (r.ok) setSetup((await r.json()) as SetupStatus);
        } catch {
          /* ignore */
        }
      }
    })();
  }, []);

  const disconnect = () => {
    clearEngineUrl();
    window.location.href = "/profile";
  };

  const dot = health === "online" ? "bg-chartreuse" : health === "offline" ? "bg-signal2" : "bg-steel";

  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />
        <section className="relative z-10 mx-auto max-w-[1100px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> YOUR PIT · ENGINE · WALLET · KEYS
          </p>
          <h1 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.6rem, 6vw, 4.8rem)" }}>
            Your <span className="text-chartreuse">pit</span>
          </h1>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {/* ── ENGINE ── */}
            <div className="border-2 border-bone/25 bg-carbon p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">connected engine</p>
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 ${dot} ${health === "checking" ? "animate-pulse" : ""}`} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-bone/60">{health}</span>
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold uppercase tracking-wide" style={{ color: owner ? "var(--color-bone)" : "var(--color-chartreuse)" }}>
                {owner ? "🏠 Owner showcase" : "🛰 Your engine"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-bone/45">
                {owner ? "the founder's firm, running 24/7 — read-only" : <span className="break-all">{engineUrl}</span>}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/onboarding" className="gr-press border-2 border-bone bg-chartreuse px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-pitch">
                  {owner ? "register your engine" : "update / re-register"}
                </Link>
                {!owner && (
                  <button onClick={disconnect} className="border-2 border-bone/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70 hover:border-signal2 hover:text-signal2">
                    disconnect → showcase
                  </button>
                )}
                <Link href="/trade" className="border-2 border-bone/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70 hover:border-chartreuse hover:text-chartreuse">your floor →</Link>
              </div>
            </div>

            {/* ── WALLET ── */}
            <div className="border-2 border-bone/25 bg-carbon p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">wallet · Mantle Sepolia</p>
              {mounted && isConnected ? (
                <>
                  <p className="mt-3 font-display text-2xl font-extrabold uppercase tracking-wide text-bone">connected</p>
                  <p className="mt-1 font-mono text-[12px] text-chartreuse">{trunc(address)}</p>
                  <p className="mt-3 font-mono text-[10px] leading-relaxed text-bone/45">anchors your firm's decisions on-chain + (later) hires/deposits.</p>
                </>
              ) : (
                <>
                  <p className="mt-3 font-display text-xl font-extrabold uppercase tracking-wide text-bone/40">not connected</p>
                  <div className="mt-3">{mounted ? <ConnectButton /> : null}</div>
                </>
              )}
            </div>

            {/* ── CREDENTIALS ON FILE (your engine only) ── */}
            <div className="border-2 border-bone/25 bg-carbon p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel">credentials on your engine · names only</p>
                <Link href="/onboarding" className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel hover:text-chartreuse">manage →</Link>
              </div>
              {owner ? (
                <p className="mt-3 font-mono text-[12px] leading-relaxed text-bone/45">You're viewing the owner showcase. Connect your own engine to see + manage your credentials here — they live only on your machine.</p>
              ) : health === "offline" ? (
                <p className="mt-3 font-mono text-[12px] text-signal2">your engine is offline — start it + ensure the tunnel is up.</p>
              ) : setup ? (
                setup.stored_keys.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {setup.stored_keys.map((k) => (
                      <span key={k} className="border border-chartreuse/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-chartreuse">✓ {k}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 font-mono text-[12px] text-bone/45">no credentials registered yet — <Link href="/onboarding" className="text-chartreuse underline">register your keys →</Link></p>
                )
              ) : (
                <p className="mt-3 font-mono text-[12px] text-bone/45">reading from your engine…</p>
              )}
              <p className="mt-4 border-t-2 border-bone/10 pt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-steel">
                ⚿ no custody — values never leave your engine's local SQLite. We only read the key <em>names</em> to show what's set.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">HELIQUANT · YOUR PIT · your engine, your keys, no custody</p>
        </div>
      </footer>
    </>
  );
}
