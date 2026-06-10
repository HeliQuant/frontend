"use client";

/**
 * THE RADIAL ENGINE — the live floor as a 9-cylinder radial (star) engine.
 *
 * The user asked for V8/V16 engine energy; the mechanically-true fit for NINE desks is a
 * radial: aircraft star engines use an ODD cylinder count so the firing order can skip
 * every other cylinder — for 9 cylinders that is 1-3-5-7-9-2-4-6-8 (verified). Here every
 * cylinder is a desk: pistons stroke toward the central crankcase (master-rod hub = the
 * PM), the firing-order cursor walks the real sequence as desks take their power reads,
 * and the hub shows the honest output state — today: registry empty, NO SPARK, gear N.
 *
 * Pistons run on CSS keyframes phase-offset by the FIRING ORDER (not by position), so the
 * power strokes visibly hop 1→3→5→7→9→2→4→6→8 — the detail that makes it read as a real
 * radial, not a decoration.
 */

import { useEffect, useState } from "react";

const DESKS = [
  "REGIME", // cyl 1 (top, then clockwise)
  "MACRO",
  "ON-CHAIN",
  "SMART-$",
  "RSRCH",
  "OI",
  "FLOW",
  "WHALE",
  "MANTLE",
];

// real 9-cylinder radial firing order (odd-count engines fire every other cylinder)
const FIRING_ORDER = [1, 3, 5, 7, 9, 2, 4, 6, 8]; // 1-indexed cylinder numbers
const STEP_MS = 700; // cursor dwell per cylinder

const BONE = "#f2efe6";
const CHART = "#c9f24b";
const STEEL = "#8b8b80";

export default function RadialEngine({ decision = "ABSTAIN" }: { decision?: string }) {
  const [step, setStep] = useState(0); // index into FIRING_ORDER
  const firing = FIRING_ORDER[step]; // 1-indexed cylinder currently on its power read
  const sparks = decision === "ENTER"; // honest: no validated edge -> no spark

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % FIRING_ORDER.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  // geometry (SVG 640-box): crankcase center, cylinders radiating
  const C = 320;
  const SLEEVE_IN = 96; // sleeve inner end (near crankcase)
  const SLEEVE_OUT = 236; // sleeve outer end (cylinder head)
  const SLEEVE_W = 46;

  return (
    <div className="relative">
      <svg viewBox="0 0 640 640" className="mx-auto w-full max-w-[560px]">
        {/* mounting ring */}
        <circle cx={C} cy={C} r={292} fill="none" stroke="rgba(242,239,230,0.10)" strokeWidth="2" />
        <circle cx={C} cy={C} r={262} fill="none" stroke="rgba(242,239,230,0.07)" strokeWidth="1" />

        {DESKS.map((label, i) => {
          const cylNo = i + 1;
          const deg = -90 + i * 40; // cyl 1 at top, clockwise
          const isFiring = cylNo === firing;
          // phase: piston cycle synced to the FIRING ORDER position (power stroke hop)
          const orderPos = FIRING_ORDER.indexOf(cylNo);
          const delay = -(orderPos * STEP_MS) / 1000; // negative delay staggers the loop phase
          const color = isFiring ? (sparks ? CHART : BONE) : STEEL;
          return (
            <g key={label} transform={`rotate(${deg + 90} ${C} ${C})`}>
              {/* the whole cylinder drawn pointing UP from center, then rotated into place */}
              {/* connecting rod — crankpin to piston crown */}
              <line
                x1={C}
                y1={C}
                x2={C}
                y2={C - SLEEVE_IN - 26}
                stroke={isFiring ? color : "rgba(242,239,230,0.25)"}
                strokeWidth="6"
              />
              {/* sleeve */}
              <rect
                x={C - SLEEVE_W / 2}
                y={C - SLEEVE_OUT}
                width={SLEEVE_W}
                height={SLEEVE_OUT - SLEEVE_IN}
                fill="#161614"
                stroke={isFiring ? color : "rgba(242,239,230,0.3)"}
                strokeWidth={isFiring ? 3 : 2}
              />
              {/* cooling fins on the head */}
              {[0, 8, 16].map((o) => (
                <line
                  key={o}
                  x1={C - SLEEVE_W / 2 - 7}
                  y1={C - SLEEVE_OUT + 6 + o}
                  x2={C + SLEEVE_W / 2 + 7}
                  y2={C - SLEEVE_OUT + 6 + o}
                  stroke={isFiring ? color : "rgba(242,239,230,0.22)"}
                  strokeWidth="2.5"
                />
              ))}
              {/* piston — strokes inside the sleeve; phase follows the firing order */}
              <rect
                x={C - SLEEVE_W / 2 + 6}
                y={C - SLEEVE_OUT + 30}
                width={SLEEVE_W - 12}
                height={34}
                fill={isFiring ? color : "rgba(242,239,230,0.55)"}
                className="re-piston"
                style={{ animationDelay: `${delay}s` }}
              />
              {/* spark flash in the chamber — ONLY when the firm actually fires (ENTER) */}
              {isFiring && sparks && (
                <circle cx={C} cy={C - SLEEVE_OUT + 16} r="10" fill={CHART} className="gr-spark" />
              )}
              {/* cylinder number at the head */}
              <text
                x={C}
                y={C - SLEEVE_OUT - 12}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 13, fill: isFiring ? color : "rgba(242,239,230,0.45)", fontWeight: 700 }}
              >
                {cylNo}
              </text>
            </g>
          );
        })}

        {/* crankcase — the PM (master rod hub) */}
        <circle cx={C} cy={C} r={86} fill="#0b0b0b" stroke={BONE} strokeWidth="2.5" />
        <circle cx={C} cy={C} r={70} fill="none" stroke="rgba(242,239,230,0.25)" strokeWidth="1.5" />
        {/* crank counterweight rotating with the firing cursor */}
        <g transform={`rotate(${-90 + (firing - 1) * 40} ${C} ${C})`} style={{ transition: `transform ${STEP_MS}ms linear` }}>
          <line x1={C} y1={C} x2={C + 52} y2={C} stroke={sparks ? CHART : BONE} strokeWidth="8" strokeLinecap="round" />
          <circle cx={C + 52} cy={C} r={9} fill={sparks ? CHART : BONE} />
        </g>
        <circle cx={C} cy={C} r={26} fill="#161614" stroke={sparks ? CHART : BONE} strokeWidth="2" />
      </svg>

      {/* desk labels around the ring (HTML so type stays crisp) */}
      {DESKS.map((label, i) => {
        const a = ((-90 + i * 40) * Math.PI) / 180;
        const r = 47.5; // % of box
        return (
          <span
            key={label}
            className="absolute hidden -translate-x-1/2 -translate-y-1/2 border px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-[0.16em] sm:block"
            style={{
              left: `${50 + r * Math.cos(a)}%`,
              top: `${50 + r * Math.sin(a)}%`,
              background: "rgba(11,11,11,0.92)",
              borderColor: i + 1 === firing ? CHART : "rgba(242,239,230,0.35)",
              color: i + 1 === firing ? CHART : "rgba(242,239,230,0.6)",
            }}
          >
            {label}
          </span>
        );
      })}

      {/* the honest output plate */}
      <div className="mx-auto mt-3 flex max-w-[560px] flex-wrap items-center justify-between gap-3 border-2 border-bone/25 bg-pitch px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel">
          firing order <span className="text-bone">1-3-5-7-9-2-4-6-8</span> · 9 desks, every other cylinder
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
          {sparks ? (
            <span className="text-chartreuse">COMBUSTION — ENTER</span>
          ) : (
            <span className="text-bone">NO SPARK — registry empty → gear N</span>
          )}
        </p>
      </div>

      {/* piston stroke keyframes (scoped) */}
      <style>{`
        @keyframes re-stroke {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(54px); }
        }
        .re-piston { animation: re-stroke ${(STEP_MS * 9) / 2 / 1000}s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
