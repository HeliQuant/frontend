"use client";

/**
 * GEAR ENGINE — the firm as interlocking machinery (ported from the user's Hero4.htm right
 * column, re-skinned to the Night Garage language and grown to the CURRENT 9-desk floor).
 *
 * Hero4 → garage translation:
 *   glow/glass/3D-tilt → hard offset shadows + flat carbon (brutalist depth)
 *   rounded HUD pills → square bone-bordered plates
 *   GSAP timeline     → motion springs (center rises, desks slam in staggered, then spin)
 *   ice/solar palette → bone rims, ONE chartreuse accent: the PM hub (the spark decider)
 * Desk gears spin in alternating directions (meshed teeth), speed up on hover, and the
 * whole machine idles forever — the loop never stops. Under it, the honest readout:
 * regime 82.6% OOS and the gearbox holding N (registry empty).
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type DeskGear = {
  label: string;
  size: number;
  x: number; // final center offset from PM hub (px, 560-box space)
  y: number;
  speed: number; // seconds per revolution
};

// the CURRENT nine-desk floor (manifold roster), placed in a tight meshed ring
const DESKS: DeskGear[] = [
  { label: "REGIME", size: 138, x: 0, y: -196, speed: 26 },
  { label: "MACRO", size: 114, x: 128, y: -152, speed: 21 },
  { label: "ON-CHAIN", size: 146, x: 196, y: -32, speed: 30 },
  { label: "SMART-$", size: 122, x: 170, y: 102, speed: 23 },
  { label: "RSRCH", size: 106, x: 66, y: 186, speed: 19 },
  { label: "OI", size: 142, x: -70, y: 188, speed: 28 },
  { label: "FLOW", size: 116, x: -174, y: 100, speed: 22 },
  { label: "WHALE", size: 134, x: -198, y: -34, speed: 27 },
  { label: "MANTLE", size: 120, x: -126, y: -154, speed: 24 },
];

const BONE = "#f2efe6";
const CHART = "#c9f24b";

function GearSvg({
  color,
  isCenter,
  spinning,
  reverse,
  speed,
  hovered,
}: {
  color: string;
  isCenter?: boolean;
  spinning: boolean;
  reverse: boolean;
  speed: number;
  hovered: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`absolute h-full w-full ${spinning ? (reverse ? "gear-spin-reverse" : "gear-spin") : ""}`}
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

      {/* outer teeth — thick mechanical cogs */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={color}
        strokeOpacity={isCenter ? 0.85 : 0.45}
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
  spinning,
  reverse,
  speed,
}: {
  label: string;
  size: number;
  isCenter?: boolean;
  spinning: boolean;
  reverse: boolean;
  speed: number;
}) {
  const [hovered, setHovered] = useState(false);
  const color = isCenter ? CHART : BONE;
  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-300 ease-out"
      style={{ width: size, height: size, transform: hovered ? "scale(1.14)" : "scale(1)", zIndex: hovered ? 50 : isCenter ? 10 : 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GearSvg color={color} isCenter={isCenter} spinning={spinning} reverse={reverse} speed={speed} hovered={hovered} />
      {/* engraved plate — square, bone-bordered (no pills in the garage) */}
      <div
        className="absolute z-30 border-2 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200"
        style={{
          bottom: isCenter ? "50%" : -6,
          transform: isCenter ? "translateY(50%)" : undefined,
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
  const [spinning, setSpinning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // gears engage once the entrance choreography lands (center + 9 staggered desks)
    const t = setTimeout(() => setSpinning(!reduced), reduced ? 0 : 1900);
    return () => clearTimeout(t);
  }, [reduced]);

  const desks = useMemo(() => DESKS, []);

  return (
    <div className="gr-rise relative mx-auto w-full max-w-[470px]" style={{ animationDelay: "0.18s" }}>
      {/* the machine floor */}
      <div className="relative mx-auto aspect-square w-full" style={{ maxWidth: 470 }}>
        {/* scaled stage: coordinates live in a 560px space */}
        <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, -50%) scale(0.82)" }}>
          <div className="relative" style={{ width: 560, height: 560 }}>
            {/* center PM gear — the spark decider, the one chartreuse mass */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              initial={reduced ? false : { opacity: 0, scale: 0.55 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 130, damping: 14, delay: 0.1 }}
              style={{ x: "-50%", y: "-50%" }}
            >
              <Gear label="PM" size={186} isCenter spinning={spinning} reverse={false} speed={40} />
            </motion.div>

            {/* nine desk gears slam in staggered, meshed alternating directions */}
            {desks.map((d, i) => (
              <motion.div
                key={d.label}
                className="absolute left-1/2 top-1/2"
                initial={
                  reduced
                    ? false
                    : { opacity: 0, scale: 0.35, x: d.x * 2.1 - d.size / 2, y: d.y * 2.1 - d.size / 2 }
                }
                animate={
                  mounted
                    ? { opacity: 1, scale: 1, x: d.x - d.size / 2, y: d.y - d.size / 2 }
                    : {}
                }
                transition={{ type: "spring", stiffness: 90, damping: 13, mass: 0.9, delay: reduced ? 0 : 0.45 + i * 0.14 }}
              >
                <Gear label={d.label} size={d.size} spinning={spinning} reverse={i % 2 === 0} speed={d.speed} />
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
