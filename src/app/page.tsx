/**
 * HeliQuant landing — "THE NIGHT GARAGE" (dark automotive brutalism, brand v2).
 * The deliberate inverse of Aval's light "Liquid Capital": pitch floor, bone ink, one
 * chartreuse livery accent, hazard seams — and the engine, not the liquid, as the
 * metaphor family. Spec + per-section briefs: frontend/docs/design.md
 */

import GarageNav from "@/components/garage/GarageNav";
import HeroEngineBay from "@/components/garage/HeroEngineBay";
import EngineCycle from "@/components/garage/EngineCycle";
import DynoRoom from "@/components/garage/DynoRoom";
import CrashTest from "@/components/garage/CrashTest";
import BlackBox from "@/components/garage/BlackBox";
import TheGarage from "@/components/garage/TheGarage";

export default function HomePage() {
  return (
    <>
      <GarageNav />
      <main className="flex-1 bg-pitch">
        {/* 1 — THE ENGINE BAY · tach + turbine + gearbox holding N */}
        <HeroEngineBay />

        {/* 2 — THE ENGINE CYCLE · the org loop as a 4-stroke engine */}
        <EngineCycle />

        {/* 3 — THE DYNO ROOM · 24 in, 23 scrapped, 1 passed → retired */}
        <DynoRoom />

        {/* 4 — THE CRASH TEST · the +96% we rejected ourselves */}
        <CrashTest />

        {/* 5 — THE BLACK BOX · decisions sealed on Mantle, publicly readable */}
        <BlackBox />

        {/* 6 — THE GARAGE · the always-on machinery */}
        <TheGarage />
      </main>

      {/* license plate */}
      <footer className="bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE DISCIPLINED TRADING ENGINE · MANTLE TURING TEST 2026
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel/80">
            honesty-by-design — <span className="text-chartreuse">we publish what doesn&apos;t work</span>
          </p>
        </div>
      </footer>
    </>
  );
}
