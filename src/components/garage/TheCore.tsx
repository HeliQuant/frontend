/**
 * THE CORE — the literal engine, fully exploded and orbitable (Night Garage).
 *
 * The whole brand is "built like an engine"; this is the engine itself — a real-time
 * Three.js V8 with kinematic pistons, a running timing chain and a spinning crankshaft,
 * that the visitor can grab and orbit 360° / zoom. Embedded as a self-contained WebGL
 * document (public/engine/v8.html, dark-mode + HeliQuant-liveried) so its render loop is
 * fully isolated from React. Spectacle that earns the metaphor — drag it.
 */

export default function TheCore() {
  return (
    <section id="core" className="relative isolate overflow-hidden bg-pitch px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-chartreuse">▮</span> FULLY EXPLODED · LIVE WEBGL · THE LITERAL ENGINE
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2
            className="font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
          >
            The <span className="text-chartreuse">core</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-bone/55">
            We say we&apos;re built like an engine. Here it is — pistons firing, chain running,
            crank turning. <span className="text-bone">Grab it and orbit.</span>
          </p>
        </div>

        {/* the engine — isolated WebGL document */}
        <div className="gr-shadow-bone mt-10 border-2 border-bone/25 bg-pitch">
          <div aria-hidden className="gr-hazard h-[10px] opacity-90" />
          <iframe
            src="/engine/v8.html"
            title="HeliQuant V8 Core — interactive 3D engine"
            loading="lazy"
            className="block w-full border-0 bg-pitch"
            style={{ height: "clamp(440px, 72vh, 760px)" }}
          />
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
          discipline, made of moving parts —{" "}
          <span className="text-chartreuse">every one of them earns its place</span>
        </p>
      </div>
    </section>
  );
}
