"use client";

/**
 * GEAR ENGINE — the firm as interlocking machinery (Hero4 ported to the Night Garage,
 * grown to the current 9-desk floor).
 *
 * MECHANICAL TRUTH (user-directed): the nine desk gears MESH the PM gear and DRIVE it —
 * exactly like the firm, where the desks feed the PM and the PM moves to decide. So:
 *   • every desk gear's teeth touch the PM's teeth (ring distance = sum of pitch radii),
 *   • all desks spin the SAME direction, the PM spins OPPOSITE (meshed gears counter-rotate),
 *   • angular speeds follow the real gear ratio (same rim speed at the contact point).
 * The slow continuous spin is NEVER killed by prefers-reduced-motion (doctrine §8 — a
 * frozen engine reads as dead); reduced motion only skips the entrance springs.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const BONE = "#f2efe6";
const CHART = "#c9f24b";

// ── meshed geometry ──
// Teeth (pitch) radius = (size/2) * (45/50)  — the r=45 teeth circle in a 100-box SVG.
const PM_SIZE = 210; // PM pitch radius ≈ 94.5
const DESK_SIZE = 106; // desk pitch radius ≈ 47.7
const RING = 141; // ≈ 94.5 + 47.7 − 1 (one tooth of overlap = visibly interlocked)
const PM_SPEED = 44; // s/rev
const DESK_SPEED = PM_SPEED * ((DESK_SIZE / 2) * 0.9) / ((PM_SIZE / 2) * 0.9); // real ratio ≈ 22.2

// the CURRENT nine-desk floor, evenly meshed around the PM (40° pitch, from the top)
const DESKS = ["REGIME", "MACRO", "ON-CHAIN", "SMART-$", "RSRCH", "OI", "FLOW", "WHALE", "MANTLE"].map(
  (label, i) => {
    const a = ((-90 + i * 40) * Math.PI) / 180;
    return { label, x: Math.cos(a) * RING, y: Math.sin(a) * RING, ux: Math.cos(a), uy: Math.sin(a) };
  }
);

function GearSvg({
  color,
  isCenter,
  reverse,
  speed,
  hovered,
}: {
  color: string;
  isCenter?: boolean;
  reverse: boolean;
  speed: number;
  hovered: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`absolute h-full w-full ${reverse ? "gear-spin-reverse" : "gear-spin"}`}
      style={{
        animationDuration: `${hovered ? speed * 0.45 : speed}s`,
        filter: hovered
          ? "drop-shadow(7px 7px 0 rgba(0,0,0,0.7))"
          : "drop-shadow(5px 5px 0 rgba(0,0,0,0.55))",
      }}
    >
      {/* heavy solid body — flat carbon, no glow (garage depth = hard shadow) */}
      <circle cx="50" cy="50" r="41" fill="#161614" />
      <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(242,239,230,0.07)" strokeWidth="1" />

      {/* outer teeth — thick mechanical cogs on the pitch circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={color}
        strokeOpacity={isCenter ? 0.85 : 0.5}
        strokeWidth="8"
        strokeDasharray="6 8"
      />

      {/* structural rims */}
      <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="2" opacity={isCenter ? 1 : 0.65} />
      <circle cx="50" cy="50" r="37" fill="none" stroke={color} strokeWidth="1" opacity="0.28" />

      {/* spokes — PM gets the multi-layer interlocking hub, desks a tri-spoke */}
      <g stroke={color} strokeWidth={isCenter ? 5 : 4} opacity={isCenter ? 0.9 : 0.55} fill="none">
        {isCenter ? (
          <>
            <path d="M 50 18 L 50 40" />
            <path d="M 50 60 L 50 82" />
            <path d="M 18 50 L 40 50" />
            <path d="M 60 50 L 82 50" />
            <path d="M 27 27 L 43 43" />
            <path d="M 73 73 L 57 57" />
            <path d="M 27 73 L 43 57" />
            <path d="M 73 27 L 57 43" />
          </>
        ) : (
          <>
            <path d="M 50 50 L 50 16" />
            <path d="M 50 50 L 21 67" />
            <path d="M 50 50 L 79 67" />
          </>
        )}
      </g>

      {/* reactor hub + axis */}
      <circle cx="50" cy="50" r="22" fill="#0b0b0b" stroke="rgba(0,0,0,0.85)" strokeWidth="3" />
      <circle cx="50" cy="50" r="14" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
      <circle cx="50" cy="50" r="6" fill={color} fillOpacity={isCenter ? 1 : 0.5} />
      <circle cx="50" cy="50" r="3" fill={BONE} fillOpacity={isCenter ? 0.9 : 0.25} />
    </svg>
  );
}

function Gear({
  label,
  size,
  isCenter = false,
  reverse,
  speed,
  labelDir,
}: {
  label: string;
  size: number;
  isCenter?: boolean;
  reverse: boolean;
  speed: number;
  labelDir?: { ux: number; uy: number }; // unit vector pointing AWAY from the PM
}) {
  const [hovered, setHovered] = useState(false);
  const color = isCenter ? CHART : BONE;
  // engraved plate sits radially OUTWARD so it never collides with the meshed PM
  const lx = labelDir ? labelDir.ux * (size / 2 + 4) : 0;
  const ly = labelDir ? labelDir.uy * (size / 2 + 4) : 0;
  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-300 ease-out"
      style={{ width: size, height: size, transform: hovered ? "scale(1.12)" : "scale(1)", zIndex: hovered ? 50 : isCenter ? 10 : 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GearSvg color={color} isCenter={isCenter} reverse={reverse} speed={speed} hovered={hovered} />
      <div
        className="absolute z-30 whitespace-nowrap border-2 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200"
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)`,
          background: isCenter ? CHART : "rgba(11,11,11,0.92)",
          borderColor: hovered ? CHART : isCenter ? "#0b0b0b" : "rgba(242,239,230,0.4)",
          color: isCenter ? "#0b0b0b" : hovered ? CHART : "rgba(242,239,230,0.75)",
          boxShadow: isCenter ? "3px 3px 0 rgba(0,0,0,0.6)" : "2px 2px 0 rgba(0,0,0,0.5)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function GearEngine() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="gr-rise relative mx-auto w-full max-w-[470px]" style={{ animationDelay: "0.18s" }}>
      {/* the machine floor */}
      <div className="relative mx-auto aspect-square w-full" style={{ maxWidth: 470 }}>
        {/* scaled stage: coordinates live in a 560px space */}
        <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, -50%) scale(0.86)" }}>
          <div className="relative" style={{ width: 560, height: 560 }}>
            {/* center PM gear — driven by the nine desks, counter-rotating (the decider) */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              initial={reduced ? false : { opacity: 0, scale: 0.55 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 130, damping: 14, delay: 0.1 }}
              style={{ x: "-50%", y: "-50%" }}
            >
              <Gear label="PM" size={PM_SIZE} isCenter reverse={false} speed={PM_SPEED} />
            </motion.div>

            {/* nine desk gears — teeth ON the PM's teeth, all driving the same direction */}
            {DESKS.map((d, i) => (
              <motion.div
                key={d.label}
                className="absolute left-1/2 top-1/2"
                initial={
                  reduced
                    ? false
                    : { opacity: 0, scale: 0.35, x: d.x * 2.3 - DESK_SIZE / 2, y: d.y * 2.3 - DESK_SIZE / 2 }
                }
                animate={
                  mounted
                    ? { opacity: 1, scale: 1, x: d.x - DESK_SIZE / 2, y: d.y - DESK_SIZE / 2 }
                    : {}
                }
                transition={{ type: "spring", stiffness: 95, damping: 13, mass: 0.9, delay: reduced ? 0 : 0.4 + i * 0.12 }}
              >
                <Gear
                  label={d.label}
                  size={DESK_SIZE}
                  reverse
                  speed={DESK_SPEED}
                  labelDir={{ ux: d.ux, uy: d.uy }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* honest readout strip — regime read + the gearbox holding N */}
      <div className="gr-shadow-ink relative mt-2 border-2 border-bone/25 bg-carbon">
        <div className="flex items-stretch justify-between gap-4 p-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-steel">regime confidence · OOS</p>
            <p className="mt-1 font-display text-4xl font-extrabold leading-none text-bone">
              82.6<span className="ml-0.5 text-xl text-chartreuse">%</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1">
              {["R", "N", "1", "2"].map((g) => (
                <span
                  key={g}
                  className={
                    g === "N"
                      ? "gr-shadow-bone grid h-9 w-9 place-items-center border-2 border-bone bg-bone font-display text-lg font-extrabold text-pitch"
                      : "grid h-9 w-9 place-items-center border-2 border-bone/20 font-display text-lg font-semibold text-bone/30"
                  }
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="max-w-[120px] font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-steel">
              registry empty → <span className="text-bone">holds N</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
