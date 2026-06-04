"use client";

/**
 * PillNav — HeliQuant's floating glass pill navigation.
 *
 * Fixed to the top, centred, backdrop-blurred over the dark observatory. A pulsing solar dot +
 * wordmark on the left, section anchors in the middle, and a single "Watch it think" pill on the
 * right. Anchors point at the on-page section ids (Observatory/Firm/Edge/Findings/Ledger).
 *
 * Self-contained; only the standard font-family CSS vars + local palette constants are used.
 * Idle pulse gates behind a mounted flag and respects reduced motion.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const SOLAR_CORE = "#ffd06a";
const ICE_MUTED = "#81899b";
const CTA = "#d0f100";

const LINKS: { href: string; label: string }[] = [
  { href: "#top", label: "Observatory" },
  { href: "#org", label: "Firm" },
  { href: "#edge", label: "Edge" },
  { href: "#findings", label: "Findings" },
  { href: "#ledger", label: "Ledger" },
];

export default function PillNav() {
  const reduce = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = mounted && !reduce;

  return (
    <motion.nav
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.2, 0.8, 0.2, 1.05] }}
      className="fixed left-1/2 top-6 z-50 flex w-[90%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border px-6 py-3 backdrop-blur-xl"
      style={{
        backgroundColor: "rgba(5,6,15,0.7)",
        borderColor: "rgba(186,215,247,0.08)",
        boxShadow:
          "rgba(216,236,248,0.15) 0px 1px 1px 0px inset, rgba(168,216,245,0.04) 0px 24px 48px 0px inset, rgba(0,0,0,0.5) 0px 16px 32px 0px",
      }}
      aria-label="Primary"
    >
      {/* wordmark */}
      <a href="#top" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4">
        <motion.span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: SOLAR_CORE, boxShadow: "0 0 10px rgba(255,208,106,0.6)" }}
          animate={live ? { opacity: [1, 0.5, 1] } : undefined}
          transition={live ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <span
          className="font-display text-xs font-medium text-white"
          style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)", letterSpacing: "0.15em" }}
        >
          HELIQUANT
        </span>
      </a>

      {/* section anchors */}
      <div
        className="hidden gap-8 font-mono uppercase md:flex"
        style={{
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: "10px",
          letterSpacing: "0.15em",
          color: ICE_MUTED,
        }}
      >
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* right cluster: ghost "Watch it think" + the restrained chartreuse "Launch app" */}
      <div className="flex items-center gap-2.5">
        <a
          href="#org"
          className="hidden rounded-full px-4 py-1.5 font-mono text-white uppercase transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 sm:inline-block"
          style={{
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: "10px",
            letterSpacing: "0.15em",
            boxShadow: "rgba(186,215,247,0.12) 0px 0px 0px 1px inset",
          }}
        >
          Watch it think
        </a>
        {/* Launch app → product. Chartreuse RATIONED: tinted text + hairline, not a full fill
            (the hero owns the one solid CTA); brightens to a subtle glow on hover. */}
        <Link
          href="/app"
          className="group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono uppercase transition-all focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
            fontSize: "10px",
            letterSpacing: "0.15em",
            color: CTA,
            border: `1px solid ${CTA}66`,
            background: "rgba(208,241,0,0.06)",
            outlineColor: CTA,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(208,241,0,0.12)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(208,241,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(208,241,0,0.06)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Launch app
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </motion.nav>
  );
}
