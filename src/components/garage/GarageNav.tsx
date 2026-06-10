/**
 * GarageNav — pit-lane top bar (Night Garage).
 * Brand mark mounted as a racing sticker on a bone plate (the black+chartreuse logo
 * only reads on dark when plated — asset rule in docs/design.md §5).
 */

import Image from "next/image";

const LINKS = [
  { href: "/#engine", label: "Engine" },
  { href: "/#dyno", label: "Dyno" },
  { href: "/#blackbox", label: "Black box" },
  { href: "/whales", label: "Telemetry" },
  { href: "/assets", label: "Dyno bays" },
  { href: "/firms/heliquant", label: "License" },
];

export default function GarageNav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-bone/15 bg-pitch/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3 sm:px-10 xl:px-4">
        <a href="#top" className="flex items-center gap-3">
          <span className="gr-shadow-bone grid h-10 w-10 place-items-center border-2 border-pitch bg-bone p-1">
            <Image src="/brand/logo.png" alt="HeliQuant rotor mark" width={32} height={33} priority />
          </span>
          <span className="font-display text-2xl font-extrabold uppercase tracking-wide text-bone">
            Heli<span className="text-chartreuse">Quant</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/65 transition-colors hover:text-chartreuse"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="/app"
          className="gr-press border-2 border-bone bg-chartreuse px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-pitch"
          style={{ boxShadow: "4px 4px 0 rgba(242,239,230,0.9)" }}
        >
          Console
        </a>
      </div>
    </header>
  );
}
