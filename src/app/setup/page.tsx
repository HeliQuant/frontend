"use client";

/**
 * /setup — "THE IGNITION SEQUENCE" (Night Garage)
 *
 * Running your own HeliQuant needs credentials — this page is the startup switch panel:
 * each credential is a switch row (status lamp lights chartreuse when armed), the right
 * side live-renders the .env, and the launch checklist walks the deploy (Railway in the
 * Amsterdam region → paste .env → UptimeRobot heartbeat → the cloud self-refreshes its data).
 *
 * SECURITY (the design constraint that shapes everything here):
 *   • This page makes ZERO network calls with your values — no fetch, no analytics, no
 *     storage. State lives in React memory and dies with the tab. We never see your keys.
 *   • The .env is generated client-side for YOU to copy into YOUR Railway project.
 *   • Secrets render masked; the preview masks them too unless you toggle reveal.
 * Every variable name below is real — read from the agents codebase, not invented.
 */

import { useMemo, useState } from "react";

import AppNav from "@/components/garage/AppNav";

type Cred = {
  key: string;
  label: string;
  why: string;
  group: "brain" | "memory" | "guards" | "fuel";
  required: boolean;
  secret: boolean;
  placeholder: string;
  defaultValue?: string;
};

const CREDS: Cred[] = [
  // ── THE BRAIN ──
  {
    key: "GROQ_API_KEY",
    label: "Groq API key",
    why: "the desks + PM think on Groq's free LLMs — console.groq.com, free tier",
    group: "brain",
    required: true,
    secret: true,
    placeholder: "gsk_…",
  },
  {
    key: "GROQ_API_KEY_2",
    label: "Groq key #2 (rotation)",
    why: "optional second key — halves 429 rate-limit pressure",
    group: "brain",
    required: false,
    secret: true,
    placeholder: "gsk_… (optional)",
  },
  // ── THE MEMORY ──
  {
    key: "SUPABASE_URL",
    label: "Supabase URL",
    why: "HeliQuant's shared project is pre-filled — swap it for your own Supabase to self-host. Holds state that survives redeploys: positioning, carry, whales, exploration, decisions",
    group: "memory",
    required: true,
    secret: false,
    placeholder: "https://xxxx.supabase.co",
    defaultValue: "https://dreexbadvlxufkrvvwrq.supabase.co",
  },
  {
    key: "SUPABASE_KEY",
    label: "Supabase service-role key",
    why: "service-role key for THAT project — server-side writes to hq_state + decisions_hq. Never expose it in a browser app; it lives only in your Railway env",
    group: "memory",
    required: true,
    secret: true,
    placeholder: "sb_secret_…",
  },
  // ── THE GUARDS ──
  {
    key: "ASSETS",
    label: "Assets",
    why: "what the floor analyzes, comma-separated — rotated one per cycle (basket size doesn't spike LLM calls)",
    group: "guards",
    required: true,
    secret: false,
    placeholder: "MNT,BTC,ETH,SOL,HYPE,SUI",
    defaultValue: "MNT,BTC,ETH,SOL,HYPE,SUI",
  },
  {
    key: "INTERVAL_MIN",
    label: "Cycle interval (min)",
    why: "minutes between cycles — code default 30; raise it (60+) to keep a free Groq tier comfortable",
    group: "guards",
    required: true,
    secret: false,
    placeholder: "30",
    defaultValue: "30",
  },
  {
    key: "REFRESH_DATA",
    label: "Self-refresh data (0/1)",
    why: "1 = the cloud re-fetches fresh market data each cycle — no external feeder needed (run the Railway service in EU West / Amsterdam so Bybit is reachable)",
    group: "guards",
    required: true,
    secret: false,
    placeholder: "1",
    defaultValue: "1",
  },
  {
    key: "EXECUTE",
    label: "Execute (0/1)",
    why: "0 = analyze + seal only (default). 1 = live execution — only with Bybit keys + eyes open",
    group: "guards",
    required: true,
    secret: false,
    placeholder: "0",
    defaultValue: "0",
  },
  // ── THE FUEL LINES (optional) ──
  {
    key: "BYBIT_API_KEY",
    label: "Bybit API key",
    why: "live spot execution (testnet proven 100/100 fills) — optional",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional",
  },
  {
    key: "BYBIT_API_SECRET",
    label: "Bybit API secret",
    why: "pairs with the key; set BYBIT_TESTNET=1 to stay on testnet",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional",
  },
  {
    key: "BYBIT_TESTNET",
    label: "Bybit testnet (0/1)",
    why: "1 = stay on testnet (safe). 0 = mainnet spot only (derivatives are geo-banned in some regions)",
    group: "fuel",
    required: false,
    secret: false,
    placeholder: "1 (if using Bybit)",
  },
  {
    key: "DEPLOYER_PRIVATE_KEY",
    label: "Mantle wallet private key",
    why: "anchors decisions on-chain (testnet wallet with faucet MNT — never your main wallet)",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional — testnet wallet only",
  },
  {
    key: "ALLORA_API_KEY",
    label: "Allora API key",
    why: "Macro desk — Allora decentralized-AI 8h BTC/ETH prediction — optional, desk degrades gracefully without it",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional",
  },
  {
    key: "NANSEN_API_KEY",
    label: "Nansen API key",
    why: "Smart-Money desk depth — funds' real ETH netflow on majors — optional",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional",
  },
  {
    key: "ELFA_API_KEY",
    label: "Elfa API key",
    why: "Smart-Social desk — narrative / mindshare from smart accounts (not retail noise) — optional",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional",
  },
  {
    key: "MANTLESCAN_API_KEY",
    label: "Mantlescan API key",
    why: "On-chain desk — Etherscan-v2 Mantle (chainid 5000) reads — optional",
    group: "fuel",
    required: false,
    secret: true,
    placeholder: "optional",
  },
];

const GROUPS: Array<{ id: Cred["group"]; title: string; sub: string }> = [
  { id: "brain", title: "01 · THE BRAIN", sub: "what thinks" },
  { id: "memory", title: "02 · THE MEMORY", sub: "what survives redeploys" },
  { id: "guards", title: "03 · THE GUARDS", sub: "how it runs" },
  { id: "fuel", title: "04 · FUEL LINES", sub: "optional power-ups" },
];

const LAUNCH = [
  { step: "T-3", text: "Railway → New Project → deploy the HeliQuant agents repo (Python auto-detected). Pick the EU West / Amsterdam region so Bybit is reachable." },
  { step: "T-2", text: "Variables → paste the .env you built here → save (auto-redeploys)" },
  { step: "T-1", text: "UptimeRobot (free) → HTTP monitor → GET https://<your-app>/run-cycle every ~5 min — the heartbeat that drives cycles" },
  { step: "T-0", text: "REFRESH_DATA=1 lets the cloud self-refresh market data each cycle — no local feeder needed" },
  { step: "GO", text: "Watch /logs, /decisions and /campaign — the floor analyzes, seals every cycle, and holds N until an edge validates. That restraint is the product." },
];

function mask(v: string) {
  if (v.length <= 6) return "•".repeat(Math.max(3, v.length));
  return `${v.slice(0, 4)}${"•".repeat(Math.min(18, v.length - 6))}${v.slice(-2)}`;
}

export default function SetupPage() {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(CREDS.filter((c) => c.defaultValue).map((c) => [c.key, c.defaultValue!]))
  );
  const [reveal, setReveal] = useState(false);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const requiredList = CREDS.filter((c) => c.required);
  const armed = requiredList.filter((c) => (values[c.key] ?? "").trim().length > 0).length;
  const ready = armed === requiredList.length;

  const envText = useMemo(() => {
    const lines: string[] = ["# HeliQuant — generated by THE IGNITION SEQUENCE (client-side only)"];
    for (const g of GROUPS) {
      const rows = CREDS.filter((c) => c.group === g.id && (values[c.key] ?? "").trim());
      if (!rows.length) continue;
      lines.push("", `# ${g.title}`);
      for (const c of rows) lines.push(`${c.key}=${values[c.key].trim()}`);
    }
    return lines.join("\n");
  }, [values]);

  const previewText = useMemo(
    () =>
      reveal
        ? envText
        : envText
            .split("\n")
            .map((l) => {
              const m = l.match(/^([A-Z_0-9]+)=(.*)$/);
              if (!m) return l;
              const cred = CREDS.find((c) => c.key === m[1]);
              return cred?.secret ? `${m[1]}=${mask(m[2])}` : l;
            })
            .join("\n"),
    [envText, reveal]
  );

  const copyEnv = () => navigator.clipboard?.writeText(envText).catch(() => {});
  const downloadEnv = () => {
    const blob = new Blob([envText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = ".env";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> RUN YOUR OWN FIRM · CREDENTIALS · DEPLOY
          </p>
          <h1
            className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone"
            style={{ fontSize: "clamp(2.8rem, 6.4vw, 5.2rem)" }}
          >
            The ignition <span className="text-chartreuse">sequence</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            HeliQuant is open machinery — you run it with YOUR keys. Arm each switch below; the
            panel builds your <span className="font-mono text-bone">.env</span> live.
          </p>

          {/* security plate — the contract of this page */}
          <div className="mt-6 inline-block border-2 border-chartreuse bg-carbon px-4 py-2.5" style={{ boxShadow: "5px 5px 0 rgba(201,242,75,0.45)" }}>
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/85">
              <span className="text-chartreuse">⚿ keys never leave this page</span> — nothing you type is sent
              anywhere: no storage, no request carries your values, state dies with the tab.
              <br />
              you paste the .env into <span className="text-bone">your own Railway project</span>; we never see it.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* ── left: the switch panel ── */}
            <div className="space-y-7">
              {GROUPS.map((g) => (
                <div key={g.id} className="border-2 border-bone/25 bg-carbon">
                  <div className="flex items-baseline justify-between border-b-2 border-bone/15 px-5 py-3">
                    <p className="font-display text-xl font-bold uppercase tracking-wide text-bone">{g.title}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">{g.sub}</p>
                  </div>
                  <div className="divide-y divide-bone/10">
                    {CREDS.filter((c) => c.group === g.id).map((c) => {
                      const filled = (values[c.key] ?? "").trim().length > 0;
                      return (
                        <div key={c.key} className="grid gap-2 px-5 py-4 sm:grid-cols-[210px_1fr]">
                          <div>
                            <p className="flex items-center gap-2">
                              {/* status lamp */}
                              <span
                                className={`inline-block h-2.5 w-2.5 ${filled ? "bg-chartreuse" : c.required ? "border border-signal2/70 bg-pitch" : "border border-bone/30 bg-pitch"}`}
                              />
                              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bone/85">
                                {c.label}
                              </span>
                            </p>
                            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">
                              {c.key} {c.required ? <span className="text-signal2">· required</span> : "· optional"}
                            </p>
                          </div>
                          <div>
                            <input
                              type={c.secret && !reveal ? "password" : "text"}
                              value={values[c.key] ?? ""}
                              onChange={(e) => set(c.key, e.target.value)}
                              placeholder={c.placeholder}
                              autoComplete="off"
                              spellCheck={false}
                              className="w-full border-2 border-bone/25 bg-pitch px-3 py-2 font-mono text-[12px] tracking-wide text-bone placeholder:text-steel/60 focus:border-chartreuse focus:outline-none"
                            />
                            <p className="mt-1.5 text-[11px] leading-relaxed text-bone/45">{c.why}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ── right: readout + .env + launch ── */}
            <div className="space-y-7 lg:sticky lg:top-20 lg:self-start">
              {/* master readout */}
              <div className={`border-2 p-5 ${ready ? "border-chartreuse bg-carbon" : "border-bone/25 bg-carbon"}`} style={ready ? { boxShadow: "6px 6px 0 rgba(201,242,75,0.5)" } : undefined}>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-steel">systems armed</p>
                    <p className="mt-1 font-display text-5xl font-extrabold leading-none text-bone">
                      {armed}
                      <span className="text-2xl text-steel">/{requiredList.length}</span>
                    </p>
                  </div>
                  <p className={`font-display text-2xl font-extrabold uppercase tracking-wide ${ready ? "text-chartreuse" : "text-bone/30"}`}>
                    {ready ? "READY TO LAUNCH" : "STANDBY"}
                  </p>
                </div>
              </div>

              {/* .env preview */}
              <div className="border-2 border-bone/25 bg-pitch">
                <div className="flex items-center justify-between border-b-2 border-bone/15 px-4 py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-steel">.env · live preview</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReveal((r) => !r)}
                      className="border border-bone/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/70 hover:border-chartreuse hover:text-chartreuse"
                    >
                      {reveal ? "mask" : "reveal"}
                    </button>
                    <button
                      onClick={copyEnv}
                      className="gr-press border-2 border-bone bg-chartreuse px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-pitch"
                      style={{ boxShadow: "3px 3px 0 rgba(242,239,230,0.9)" }}
                    >
                      Copy
                    </button>
                    <button
                      onClick={downloadEnv}
                      className="gr-press border-2 border-bone/60 px-3 py-1 font-display text-xs font-semibold uppercase tracking-wide text-bone/85 hover:border-chartreuse hover:text-chartreuse"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <pre className="max-h-[300px] overflow-auto px-4 py-3 font-mono text-[11px] leading-relaxed text-bone/75">
                  {previewText}
                </pre>
              </div>

              {/* launch checklist */}
              <div className="border-2 border-bone/25 bg-carbon p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-steel">launch checklist</p>
                <ol className="mt-4 space-y-3">
                  {LAUNCH.map((l) => (
                    <li key={l.step} className="flex gap-3">
                      <span className={`grid h-8 w-10 shrink-0 place-items-center border-2 font-display text-sm font-extrabold ${l.step === "GO" ? "border-chartreuse text-chartreuse" : "border-bone/30 text-bone/60"}`}>
                        {l.step}
                      </span>
                      <p className="text-[12px] leading-relaxed text-bone/65">{l.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
            HELIQUANT · THE IGNITION SEQUENCE · your keys, your machine, your chain
          </p>
        </div>
      </footer>
    </>
  );
}
