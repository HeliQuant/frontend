"use client";

/**
 * AppNav — the INTERNAL pit-lane nav (Night Garage), distinct from the landing GarageNav.
 * Once you're past the gate (wallet connected, inside the firm) the marketing anchors
 * (Engine / Dyno) no longer apply — this bar links ACROSS the functional bays instead,
 * highlights where you are, and collapses to a hamburger on narrow screens so no page is
 * ever reachable only by typing its route. Brand mark exits back to the landing site.
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/app", label: "The floor" },
  { href: "/campaign", label: "The grid" },
  { href: "/trade", label: "Your floor" },
  { href: "/carry", label: "The edge" },
  { href: "/learning", label: "Tuning bay" },
  { href: "/agents", label: "The crew" },
  { href: "/ledger", label: "Ledger" },
  { href: "/performance", label: "Track record" },
  { href: "/whales", label: "Telemetry" },
  { href: "/assets", label: "Dyno bays" },
  { href: "/hire", label: "Hire" },
  { href: "/firms/heliquant", label: "License" },
  { href: "/onboarding", label: "Register" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppNav() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-bone/15 bg-pitch/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-3 sm:px-10 xl:px-8">
        {/* brand mark → exit back to the landing site */}
        <Link href="/" className="flex items-center gap-3" aria-label="HeliQuant — back to site">
          <span className="gr-shadow-bone grid h-10 w-10 place-items-center border-2 border-pitch bg-bone p-1">
            <Image src="/brand/logo.png" alt="HeliQuant rotor mark" width={32} height={33} priority />
          </span>
          <span className="font-display text-2xl font-extrabold uppercase tracking-wide text-bone">
            Heli<span className="text-chartreuse">Quant</span>
          </span>
        </Link>

        {/* functional bays — active bay reads chartreuse */}
        <nav className="hidden items-center gap-x-5 xl:flex 2xl:gap-x-7">
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-tour={l.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                  active ? "text-chartreuse" : "text-bone/65 hover:text-chartreuse"
                }`}
              >
                {active ? `▸ ${l.label}` : l.label}
              </Link>
            );
          })}
        </nav>

        {/* right: exit to the public site (desktop) · hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="gr-press hidden border-2 border-bone/40 bg-transparent px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-bone xl:inline-block"
          >
            View site
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center border-2 border-bone/40 text-bone xl:hidden"
          >
            <span className="font-mono text-lg leading-none">{open ? "✕" : "≡"}</span>
          </button>
        </div>
      </div>

      {/* mobile drawer — every bay reachable without typing a route */}
      {open && (
        <nav className="border-t-2 border-bone/15 bg-pitch/95 px-6 py-4 xl:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block border-l-2 py-2 pl-3 font-mono text-xs uppercase tracking-[0.22em] ${
                      active
                        ? "border-chartreuse text-chartreuse"
                        : "border-bone/20 text-bone/70 hover:text-chartreuse"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block border-l-2 border-bone/20 py-2 pl-3 font-mono text-xs uppercase tracking-[0.22em] text-bone/50 hover:text-bone"
              >
                ← View site
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
