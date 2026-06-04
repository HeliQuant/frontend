import HeroEngine from "@/components/observatory/HeroEngine";
import PillNav from "@/components/observatory/PillNav";
import ObservatoryConsole from "@/components/observatory/ObservatoryConsole";
import TheLedger from "@/components/observatory/TheLedger";
import TheMirage from "@/components/observatory/TheMirage";
import TheOneVein from "@/components/observatory/TheOneVein";
import TheStack from "@/components/observatory/TheStack";

export default function HomePage() {
  return (
    <>
      <PillNav />
      <main id="top" className="flex-1">
        {/* 1 — THE GEAR ENGINE · the firm as a precision machine */}
        <HeroEngine />

        {/* 2 — THE FIRM CONSOLE · the living decision loop (70% UI / 30% caption) */}
        <section
          id="org"
          className="relative isolate overflow-hidden px-6 py-28 sm:px-10 lg:px-16"
          style={{ backgroundColor: "#05060f" }}
        >
          {/* faint top seam so the void flows on from the hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
          />
          {/* blueprint grid — the hero's quiet unifying texture, faded at the edges; sits behind everything */}
          <div aria-hidden className="bg-blueprint pointer-events-none absolute inset-0 z-0 opacity-30" />
          <div className="relative z-10 mx-auto max-w-xl">
            <p
              className="font-mono text-[11px] uppercase"
              style={{ color: "#7d93b0", letterSpacing: "0.26em" }}
            >
              <span style={{ color: "#fa520f" }}>◦</span>{" "}
              <span style={{ color: "#d8ecf8", opacity: 0.82 }}>THE FIRM · SEVEN DESKS · ONE LOOP</span>
            </p>
            <h2
              className="font-display mt-5 text-balance"
              style={{
                color: "#d8ecf8",
                fontWeight: 300,
                fontSize: "clamp(2rem, 4.6vw, 3.3rem)",
                lineHeight: 1.04,
                letterSpacing: "0.01em",
              }}
            >
              Watch it{" "}
              <span
                style={{
                  fontStyle: "italic",
                  background: "linear-gradient(95deg, #ffd06a, #fa520f)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                think.
              </span>
            </h2>
            <p
              className="mt-5 max-w-md text-balance"
              style={{ color: "#d8ecf8", opacity: 0.6, fontSize: "1rem", lineHeight: 1.65 }}
            >
              Scan, argue, gate, seal — one loop on every read. On MNT today there is no validated edge,
              so it holds. That restraint is the product.
            </p>
          </div>

          <div className="relative z-10 mt-14">
            <ObservatoryConsole />
          </div>
        </section>

        {/* 3 — THE ONE VEIN · the one validated edge among dead strategies */}
        <TheOneVein />

        {/* 4 — THE MIRAGE · we rejected our own +96% (honesty-by-design) */}
        <TheMirage />

        {/* 5 — THE LEDGER · live decisions sealed on-chain */}
        <TheLedger />

        {/* 6 — THE STACK · the firm's machinery, deployed on Mantle */}
        <TheStack />
      </main>

      <footer style={{ backgroundColor: "#05060f", borderTop: "1px solid rgba(186, 215, 247, 0.08)" }}>
        <div
          className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-10 font-mono md:flex-row md:items-center md:justify-between"
          style={{ fontSize: "11px", letterSpacing: "0.18em", color: "#81899b", textTransform: "uppercase" }}
        >
          <p>HeliQuant · The all-seeing quant · Mantle Turing Test 2026</p>
          <p style={{ opacity: 0.8 }}>Honesty-by-design · verifiable on-chain · we publish what doesn&apos;t work too</p>
        </div>
      </footer>
    </>
  );
}
