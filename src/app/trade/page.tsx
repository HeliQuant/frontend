"use client";

/** /trade — YOUR floor: reads your connected local engine. Gated — if no engine is connected, prompt to
 *  register instead of showing the owner showcase's data as "yours". */

import Link from "next/link";
import { useEffect, useState } from "react";

import AppNav from "@/components/garage/AppNav";
import CampaignView from "@/components/garage/CampaignView";
import { isOwnerEngine } from "@/lib/engine";

export default function TradePage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  useEffect(() => setConnected(!isOwnerEngine()), []);

  if (connected === null) {
    return (
      <>
        <AppNav />
        <main className="min-h-screen bg-pitch" />
      </>
    );
  }
  if (connected) return <CampaignView mode="user" />;

  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />
        <section className="relative z-10 mx-auto max-w-[760px] px-6 pt-24 text-center sm:px-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> YOUR FLOOR
          </p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] text-bone">No engine connected</h1>
          <p className="mt-5 text-base leading-relaxed text-bone/65">
            This is <span className="text-chartreuse">your</span> trading floor — it reads your own local engine.
            Register + connect one first. Until then, watch the owner&apos;s firm on The grid.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/onboarding" className="gr-press border-2 border-pitch bg-chartreuse px-6 py-3 font-display text-base font-bold uppercase tracking-wide text-pitch">
              Register your engine
            </Link>
            <Link href="/campaign" className="gr-press border-2 border-bone/50 px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-bone/85 hover:border-chartreuse hover:text-chartreuse">
              Watch the owner&apos;s floor
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
