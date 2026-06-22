/**
 * HeliQuant landing — "THE NIGHT GARAGE" (dark automotive brutalism, brand v2).
 * The deliberate inverse of Aval's light "Liquid Capital": pitch floor, bone ink, one
 * chartreuse livery accent, hazard seams — and the engine, not the liquid, as the
 * metaphor family. Spec + per-section briefs: frontend/docs/design.md
 */

import GarageNav from "@/components/garage/GarageNav";
import HeroEngineBay from "@/components/garage/HeroEngineBay";
import OrgLoop from "@/components/garage/OrgLoop";
import EngineCycle from "@/components/garage/EngineCycle";
import DynoRoom from "@/components/garage/DynoRoom";
import CrashTest from "@/components/garage/CrashTest";
import ShopReport from "@/components/garage/ShopReport";
import BlackBox from "@/components/garage/BlackBox";
import TheGarage from "@/components/garage/TheGarage";

export default function HomePage() {
  return (
    <>
      <GarageNav />
      <main className="flex-1 bg-pitch">
        {/* 1 — THE ENGINE BAY · tach + turbine + gearbox holding N */}
        <HeroEngineBay />

        {/* 2 — THE LOOP · the autonomous org cycle as a closed node graph (end feeds start, never stops) */}
        <OrgLoop />

        {/* (the live WebGL V8 — "The Core" — now lives on /app, not the landing) */}

        {/* 3 — THE ENGINE CYCLE · the org loop as a 4-stroke engine */}
        <EngineCycle />

        {/* 4 — THE DYNO ROOM · 24 in, 23 scrapped, 1 passed → retired */}
        <DynoRoom />

        {/* 5 — THE CRASH TEST · the +96% we rejected ourselves */}
        <CrashTest />

        {/* 6 — THE SHOP REPORT · the full teardown log, every verdict stamped */}
        <ShopReport />

        {/* 7 — THE BLACK BOX · decisions sealed on Mantle, publicly readable */}
        <BlackBox />

        {/* 8 — THE GARAGE · the always-on machinery */}
        <TheGarage />
      </main>

      {/* license plate */}
      <footer className="bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · AUTONOMOUS MULTI-DESK TRADING FIRM · <span className="text-bitget">BITGET</span> × MANTLE
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel/80">
            <span className="text-chartreuse">we publish the truth</span> — every number is real
          </p>
        </div>
      </footer>
    </>
  );
}
