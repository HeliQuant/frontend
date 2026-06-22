/**
 * /whales — "THE TIMING TOWER" (Night Garage §6.7)
 *
 * Two live reads, per traded asset:
 *   01 · the Hyperliquid top-PnL whale grid — the SMART MONEY the firm acts on (<HlWhaleTower/>).
 *   02 · Bitget aggregate retail long/short + OI — the CROWD, read contrarian (<BitgetCrowd/>).
 * Both poll the engine. (The old Mantle-DEX-flow snapshot was removed — the firm trades the Bitget
 * basket, not MNT, so a dated MNT-native flow capture was off-thesis.)
 */

import AppNav from "@/components/garage/AppNav";
import HlWhaleTower from "@/components/garage/HlWhaleTower";
import BitgetCrowd from "@/components/garage/BitgetCrowd";

export default function WhalesPage() {
  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="inline-block h-2 w-2 animate-pulse bg-chartreuse align-middle" /> TELEMETRY · LIVE · SMART MONEY vs THE CROWD · PER TRADED ASSET
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The timing <span className="text-chartreuse">tower</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Read the other drivers on the track. The firm watches the{" "}
            <span className="text-bone">Hyperliquid top-PnL whales</span> per traded asset — the smart money — and
            sets them against the <span className="text-bitget">Bitget retail crowd</span>. Follow conviction; fade
            the herd. Watch their lines; don&apos;t copy them blind.
          </p>

          {/* honesty plate — 01 smart money (HL) · 02 the crowd (Bitget) */}
          <div className="mt-6 inline-block border-2 border-bone/30 bg-carbon px-4 py-2.5">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-steel">
              <span className="text-chartreuse">01 · smart money</span> — Hyperliquid top-PnL whales per traded asset (live).
              <br />
              <span className="text-bitget">02 · the crowd</span> — Bitget aggregate retail long/short + OI (live, read contrarian).
            </p>
          </div>

          {/* ═══════════ 01 · LIVE HYPERLIQUID GRID (smart money) ═══════════ */}
          <div className="mt-12 max-w-4xl">
            <HlWhaleTower />
          </div>
        </section>

        {/* hazard seam → 02 · THE CROWD (live Bitget aggregate positioning) */}
        <div aria-hidden className="gr-hazard mt-16 h-[12px] opacity-80" />
        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-12 sm:px-10 xl:px-4">
          <BitgetCrowd />
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE TIMING TOWER · Hyperliquid smart money up top · the Bitget crowd below — both live
          </p>
        </div>
      </footer>
    </>
  );
}
