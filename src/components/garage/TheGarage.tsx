/**
 * THE GARAGE — the stack as a parts wall (Night Garage §6.6).
 *
 * Six subsystems hang on the tool board as engraved part tags. The cloud org runs 24/7
 * on Railway (chartreuse edge = live now); everything else is the machinery it drives.
 * Server component — the wall is static; the liveness dot is CSS.
 */

const PARTS: Array<{
  no: string;
  name: string;
  desc: string;
  live?: boolean;
}> = [
  {
    no: "HQ-001",
    name: "THE ORG BRAIN",
    desc: "9-desk firm + PM debate loop · Groq LLMs · runs every cycle in the cloud",
    live: true,
  },
  {
    no: "HQ-002",
    name: "THE EDGE LAB",
    desc: "cost-aware OOS · walk-forward · outlier-robust · FDR — the dyno itself",
  },
  {
    no: "HQ-003",
    name: "THE EXECUTOR",
    desc: "Bitget testnet rails — real demo fills · Kelly-capped tickets",
  },
  {
    no: "HQ-004",
    name: "THE CONTRACTS",
    desc: "ERC-8004 identity · TradingVault · JobManager — deployed on Mantle",
  },
  {
    no: "HQ-005",
    name: "THE RECORDER",
    desc: "every decision sealed: Supabase public table + Mantle anchor",
  },
  {
    no: "HQ-006",
    name: "THE FEEDERS",
    desc: "local telemetry rigs push positioning, carry & whale data hourly",
  },
];

export default function TheGarage() {
  return (
    <section id="garage" className="relative isolate overflow-hidden bg-pitch px-6 py-24 sm:px-10">
      <div aria-hidden className="gr-carbon-dots absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto max-w-[1280px] xl:px-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
          <span className="text-chartreuse">▮</span> THE MACHINERY · ALWAYS-ON · RAILWAY + MANTLE
        </p>
        <h2
          className="mt-4 max-w-3xl font-display font-extrabold uppercase leading-[0.9] text-bone"
          style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)" }}
        >
          Runs while <span className="text-chartreuse">you sleep</span>
        </h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PARTS.map((p) => (
            <div
              key={p.no}
              className={`group relative border-2 bg-carbon p-5 transition-colors ${
                p.live ? "border-chartreuse" : "border-bone/25 hover:border-bone/60"
              }`}
              style={p.live ? { boxShadow: "6px 6px 0 rgba(201,242,75,0.5)" } : undefined}
            >
              {/* hanging hole — toolboard detail */}
              <span aria-hidden className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full border border-bone/30 bg-pitch" />

              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">{p.no}</span>
                {p.live && (
                  <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-chartreuse">
                    <span className="gr-spark inline-block h-1.5 w-1.5 bg-chartreuse" /> live
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-bone">
                {p.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-bone/55">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
