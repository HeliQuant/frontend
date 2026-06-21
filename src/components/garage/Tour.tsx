"use client";

/**
 * Tour — a lightweight spotlight walkthrough (Night Garage). No deps.
 *
 * Give it ordered steps that each target an element by CSS selector ([data-tour="…"]).
 * It dims the page, rings the target in chartreuse, and shows a next/back/skip card. Used on
 * /onboarding to walk a new user through the form AND every navbar bay (what each is for).
 */

import { useCallback, useEffect, useState } from "react";

export type TourStep = { sel: string; title: string; body: string };

export default function Tour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const find = useCallback((): HTMLElement | null => {
    const s = steps[i];
    return s ? (document.querySelector(s.sel) as HTMLElement | null) : null;
  }, [i, steps]);

  // scroll the target into view, then measure (after the smooth scroll settles)
  useEffect(() => {
    const el = find();
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = window.setTimeout(() => setRect(find()?.getBoundingClientRect() ?? null), 340);
    return () => window.clearTimeout(t);
  }, [find]);

  // keep the ring glued to the target on scroll / resize
  useEffect(() => {
    const on = () => setRect(find()?.getBoundingClientRect() ?? null);
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [find]);

  // keyboard: → / Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "Enter") setI((p) => (p < steps.length - 1 ? p + 1 : p));
      else if (e.key === "ArrowLeft") setI((p) => (p > 0 ? p - 1 : p));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length, onClose]);

  const step = steps[i];
  if (!step) return null;

  const next = () => (i < steps.length - 1 ? setI(i + 1) : onClose());
  const prev = () => i > 0 && setI(i - 1);

  const W = typeof window !== "undefined" ? window.innerWidth : 1280;
  const H = typeof window !== "undefined" ? window.innerHeight : 800;
  const tipW = 320;
  const below = rect ? rect.bottom + 230 < H : true;
  const tipTop = rect ? (below ? rect.bottom + 12 : Math.max(12, rect.top - 218)) : H / 2 - 110;
  const tipLeft = rect ? Math.min(Math.max(12, rect.left), W - tipW - 12) : W / 2 - tipW / 2;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Guided tour" aria-modal="true">
      {/* spotlight ring — a transparent box over the target with a huge shadow dimming the rest */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed border-2 border-chartreuse"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: "0 0 0 9999px rgba(11,11,11,0.8)", borderRadius: 4, transition: "all 0.18s ease" }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0" style={{ background: "rgba(11,11,11,0.8)" }} />
      )}

      {/* the card */}
      <div className="fixed border-2 border-chartreuse bg-carbon p-4" style={{ top: tipTop, left: tipLeft, width: tipW, boxShadow: "6px 6px 0 rgba(201,242,75,0.4)" }}>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-chartreuse">{i + 1} / {steps.length} · guided tour</p>
        <p className="mt-2 font-display text-lg font-extrabold uppercase leading-tight tracking-wide text-bone">{step.title}</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-bone/65">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onClose} className="font-mono text-[10px] uppercase tracking-[0.16em] text-steel hover:text-bone">skip tour</button>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={prev} className="border-2 border-bone/40 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-bone/85 hover:border-chartreuse hover:text-chartreuse">back</button>
            )}
            <button onClick={next} className="gr-press border-2 border-bone bg-chartreuse px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-pitch">{i < steps.length - 1 ? "next ▸" : "done"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
