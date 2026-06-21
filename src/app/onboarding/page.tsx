"use client";

/**
 * /onboarding — "REGISTER YOUR ENGINE" (Night Garage)
 *
 * NO-CUSTODY register. You run `agents-localReady` on your own machine, expose it via a tunnel
 * (ngrok), and this form POSTs your keys STRAIGHT to YOUR engine's /register — they're stored in its
 * local SQLite and never touch our server. After register, the dashboard connects to your engine.
 *
 * Groq: ten key slots (min 10) → joined into one comma-separated string the firm rotates across.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import AppNav from "@/components/garage/AppNav";
import { pingEngine, setEngineUrl } from "@/lib/engine";

type Cred = {
  key: string;
  label: string;
  why: string;
  group: "memory" | "guards" | "fuel";
  secret: boolean;
  placeholder: string;
  defaultValue?: string;
};

const CREDS: Cred[] = [
  { key: "SUPABASE_URL", label: "Supabase URL", why: "state that survives redeploys — swap for your own project", group: "memory", secret: false, placeholder: "https://xxxx.supabase.co", defaultValue: "https://dreexbadvlxufkrvvwrq.supabase.co" },
  { key: "SUPABASE_KEY", label: "Supabase service-role key", why: "server-side writes to hq_state + decisions_hq — lives only on your engine", group: "memory", secret: true, placeholder: "sb_secret_…" },
  { key: "ASSETS", label: "Assets", why: "what the floor analyzes, comma-separated, one rotated per cycle", group: "guards", secret: false, placeholder: "MNT,BTC,ETH,SOL,HYPE,SUI", defaultValue: "MNT,BTC,ETH,SOL,HYPE,SUI" },
  { key: "INTERVAL_MIN", label: "Cycle interval (min)", why: "minutes between org cycles — 30+ keeps a free Groq tier comfortable", group: "guards", secret: false, placeholder: "30", defaultValue: "30" },
  { key: "REFRESH_DATA", label: "Self-refresh data (0/1)", why: "1 = the engine re-fetches fresh market data each cycle", group: "guards", secret: false, placeholder: "1", defaultValue: "1" },
  // ── Bitget (execution) ──
  { key: "BITGET_API_KEY", label: "Bitget API key", why: "Bitget futures execution (long + short). Demo SUSDT-FUTURES needs no real funds", group: "fuel", secret: true, placeholder: "optional" },
  { key: "BITGET_API_SECRET", label: "Bitget API secret", why: "pairs with the Bitget key", group: "fuel", secret: true, placeholder: "optional" },
  { key: "BITGET_PASSPHRASE", label: "Bitget passphrase", why: "the passphrase you set on the Bitget API key", group: "fuel", secret: true, placeholder: "optional" },
  { key: "BITGET_DEMO", label: "Bitget demo (0/1)", why: "1 = demo (no real funds, safe). 0 = mainnet — eyes open", group: "fuel", secret: false, placeholder: "1", defaultValue: "1" },
  { key: "BITGET_EXECUTE", label: "Bitget execute (0/1)", why: "1 = place real Bitget orders. 0 = paper", group: "fuel", secret: false, placeholder: "0", defaultValue: "0" },
  { key: "HQ_DUAL_VENUE", label: "Dual venue (0/1)", why: "1 = a LONG opens on Bybit testnet + Bitget; SHORT on Bitget; else paper-for-learning", group: "fuel", secret: false, placeholder: "0", defaultValue: "0" },
  // ── optional power-ups ──
  { key: "DEPLOYER_PRIVATE_KEY", label: "Mantle wallet private key", why: "anchors decisions on-chain — testnet wallet only, never your main", group: "fuel", secret: true, placeholder: "optional — testnet only" },
  { key: "ALLORA_API_KEY", label: "Allora API key", why: "Macro desk — decentralized-AI 8h BTC/ETH prediction (degrades gracefully)", group: "fuel", secret: true, placeholder: "optional" },
  { key: "NANSEN_API_KEY", label: "Nansen API key", why: "Smart-Money desk depth — funds' real ETH netflow", group: "fuel", secret: true, placeholder: "optional" },
  { key: "ELFA_API_KEY", label: "Elfa API key", why: "Smart-Social desk — narrative / mindshare from smart accounts", group: "fuel", secret: true, placeholder: "optional" },
  { key: "MANTLESCAN_API_KEY", label: "Mantlescan API key", why: "On-chain desk — Etherscan-v2 Mantle reads", group: "fuel", secret: true, placeholder: "optional" },
];

const GROUPS: Array<{ id: Cred["group"]; title: string; sub: string }> = [
  { id: "memory", title: "MEMORY", sub: "survives redeploys" },
  { id: "guards", title: "GUARDS", sub: "how it runs" },
  { id: "fuel", title: "FUEL LINES", sub: "execution + optional power-ups" },
];

const GROQ_SLOTS = 10;

export default function OnboardingPage() {
  const router = useRouter();
  const [engineUrl, setEngineUrlInput] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [groq, setGroq] = useState<string[]>(Array(GROQ_SLOTS).fill(""));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(CREDS.filter((c) => c.defaultValue).map((c) => [c.key, c.defaultValue!])),
  );
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<"idle" | "registering" | "ok" | "fail">("idle");
  const [msg, setMsg] = useState("");

  const setGroqAt = (i: number, v: string) => setGroq((g) => g.map((x, j) => (j === i ? v : x)));
  const setVal = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const groqFilled = groq.filter((g) => g.trim()).length;
  const connectReady = engineUrl.trim().length > 0 && setupToken.trim().length > 0;
  const credCount = CREDS.filter((c) => (values[c.key] ?? "").trim()).length;

  function buildCreds(): Record<string, string> {
    const creds: Record<string, string> = {};
    const gk = groq.map((g) => g.trim()).filter(Boolean).join(","); // 10 slots → ONE comma-separated string
    if (gk) creds.GROQ_API_KEY = gk;
    for (const c of CREDS) {
      const v = (values[c.key] ?? "").trim();
      if (v) creds[c.key] = v;
    }
    return creds;
  }

  async function onRegister() {
    const url = engineUrl.trim().replace(/\/+$/, "");
    if (!connectReady) {
      setStatus("fail");
      setMsg("engine URL + setup token required (set HQ_SETUP_TOKEN on your engine)");
      return;
    }
    setStatus("registering");
    setMsg("checking your engine…");
    if (!(await pingEngine(url))) {
      setStatus("fail");
      setMsg("engine unreachable — is agents-localReady running + tunnelled?");
      return;
    }
    try {
      const r = await fetch(`${url}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: setupToken.trim(), creds: buildCreds() }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setEngineUrl(url); // the dashboard now reads YOUR engine
        setStatus("ok");
        setMsg(`registered ${j.saved} credentials on your engine — launching your floor…`);
        setTimeout(() => router.push("/app"), 1100);
      } else {
        setStatus("fail");
        setMsg(j.error || `register failed (HTTP ${r.status})`);
      }
    } catch {
      setStatus("fail");
      setMsg("could not reach your engine's /register — check the URL + that it's running");
    }
  }

  async function onLogin() {
    // already set up: just point the dashboard at your engine (no creds re-submit)
    const url = engineUrl.trim().replace(/\/+$/, "");
    if (!url) {
      setStatus("fail");
      setMsg("enter your engine URL to connect");
      return;
    }
    setStatus("registering");
    setMsg("connecting…");
    if (!(await pingEngine(url))) {
      setStatus("fail");
      setMsg("engine unreachable — is it running + tunnelled?");
      return;
    }
    setEngineUrl(url);
    setStatus("ok");
    setMsg("connected — launching your floor…");
    setTimeout(() => router.push("/app"), 800);
  }

  return (
    <>
      <AppNav />
      <main className="min-h-screen bg-pitch pb-20">
        <div aria-hidden className="gr-carbon-dots fixed inset-0 opacity-40" />

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pt-16 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-steel">
            <span className="text-chartreuse">▮</span> REGISTER · RUN YOUR OWN FIRM · NO CUSTODY
          </p>
          <h1 className="mt-4 font-display font-extrabold uppercase leading-[0.9] text-bone" style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}>
            Register your <span className="text-chartreuse">engine</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bone/65">
            Run <span className="font-mono text-bone">agents-localReady</span> on your machine, tunnel it, then submit your keys
            below. They POST <span className="text-chartreuse">straight to your engine</span> — stored in its local SQLite,
            never on our servers.
          </p>

          {/* security plate */}
          <div className="mt-6 inline-block border-2 border-chartreuse bg-carbon px-4 py-2.5" style={{ boxShadow: "5px 5px 0 rgba(201,242,75,0.45)" }}>
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/85">
              <span className="text-chartreuse">⚿ no custody</span> — your keys go from this page directly to YOUR engine (over your
              own tunnel) and into ITS SQLite. We never see or store them.
            </p>
          </div>

          {/* ── 1 · connect to your engine ── */}
          <div className="mt-10 border-2 border-bone/25 bg-carbon">
            <div className="flex items-baseline justify-between border-b-2 border-bone/15 px-5 py-3">
              <p className="font-display text-xl font-bold uppercase tracking-wide text-bone">01 · YOUR ENGINE</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">tunnel URL + setup token</p>
            </div>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">engine URL (ngrok / cloud)</p>
                <input value={engineUrl} onChange={(e) => setEngineUrlInput(e.target.value)} placeholder="https://xxxx.ngrok-free.app" spellCheck={false} autoComplete="off"
                  className="mt-1.5 w-full border-2 border-bone/25 bg-pitch px-3 py-2 font-mono text-[12px] text-bone placeholder:text-steel/60 focus:border-chartreuse focus:outline-none" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">setup token (HQ_SETUP_TOKEN)</p>
                <input value={setupToken} onChange={(e) => setSetupToken(e.target.value)} type={reveal ? "text" : "password"} placeholder="the token you set on your engine" spellCheck={false} autoComplete="off"
                  className="mt-1.5 w-full border-2 border-bone/25 bg-pitch px-3 py-2 font-mono text-[12px] text-bone placeholder:text-steel/60 focus:border-chartreuse focus:outline-none" />
              </div>
            </div>
          </div>

          {/* ── 2 · Groq keys (ten slots → one comma-string) ── */}
          <div className="mt-7 border-2 border-bone/25 bg-carbon">
            <div className="flex items-baseline justify-between border-b-2 border-bone/15 px-5 py-3">
              <p className="font-display text-xl font-bold uppercase tracking-wide text-bone">02 · THE BRAIN · GROQ KEYS</p>
              <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${groqFilled >= GROQ_SLOTS ? "text-chartreuse" : "text-steel"}`}>{groqFilled}/{GROQ_SLOTS} filled · min 10</p>
            </div>
            <div className="px-5 py-4">
              <p className="mb-3 text-[11px] leading-relaxed text-bone/45">
                The desks rotate across many free Groq keys to dodge rate limits — paste <span className="text-bone">ten</span>{" "}
                (<span className="font-mono text-bone">console.groq.com</span>, free). They're joined into one comma-separated string on submit.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {groq.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`grid h-6 w-7 shrink-0 place-items-center border font-mono text-[10px] font-bold ${g.trim() ? "border-chartreuse text-chartreuse" : "border-bone/25 text-steel"}`}>{i + 1}</span>
                    <input value={g} onChange={(e) => setGroqAt(i, e.target.value)} type={reveal ? "text" : "password"} placeholder={`gsk_… #${i + 1}`} spellCheck={false} autoComplete="off"
                      className="w-full border-2 border-bone/25 bg-pitch px-3 py-1.5 font-mono text-[12px] text-bone placeholder:text-steel/50 focus:border-chartreuse focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3 · the rest of the credentials ── */}
          <div className="mt-7 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel">03 · MEMORY · GUARDS · FUEL — {credCount} set</p>
            <button onClick={() => setReveal((r) => !r)} className="border border-bone/30 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-bone/70 hover:border-chartreuse hover:text-chartreuse">{reveal ? "mask" : "reveal"}</button>
          </div>
          <div className="mt-3 space-y-6">
            {GROUPS.map((grp) => (
              <div key={grp.id} className="border-2 border-bone/25 bg-carbon">
                <div className="flex items-baseline justify-between border-b-2 border-bone/15 px-5 py-2.5">
                  <p className="font-display text-lg font-bold uppercase tracking-wide text-bone">{grp.title}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">{grp.sub}</p>
                </div>
                <div className="divide-y divide-bone/10">
                  {CREDS.filter((c) => c.group === grp.id).map((c) => (
                    <div key={c.key} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[210px_1fr]">
                      <div>
                        <p className="flex items-center gap-2">
                          <span className={`inline-block h-2.5 w-2.5 ${(values[c.key] ?? "").trim() ? "bg-chartreuse" : "border border-bone/30 bg-pitch"}`} />
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bone/85">{c.label}</span>
                        </p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">{c.key}</p>
                      </div>
                      <div>
                        <input value={values[c.key] ?? ""} onChange={(e) => setVal(c.key, e.target.value)} type={c.secret && !reveal ? "password" : "text"} placeholder={c.placeholder} spellCheck={false} autoComplete="off"
                          className="w-full border-2 border-bone/25 bg-pitch px-3 py-2 font-mono text-[12px] text-bone placeholder:text-steel/60 focus:border-chartreuse focus:outline-none" />
                        <p className="mt-1.5 text-[11px] leading-relaxed text-bone/45">{c.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── launch row ── */}
          <div className="mt-8 flex flex-col gap-4 border-2 border-chartreuse bg-carbon p-5 sm:flex-row sm:items-center sm:justify-between" style={{ boxShadow: "6px 6px 0 rgba(201,242,75,0.4)" }}>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">{groqFilled >= GROQ_SLOTS && connectReady ? "ready to register" : `need: ${connectReady ? "" : "engine + token · "}${groqFilled >= GROQ_SLOTS ? "" : "10 groq keys"}`}</p>
              {msg && <p className={`mt-1 font-mono text-[12px] ${status === "ok" ? "text-chartreuse" : status === "fail" ? "text-signal2" : "text-bone/70"}`}>{msg}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onLogin} disabled={status === "registering"} className="gr-press border-2 border-bone/60 px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-bone/85 hover:border-chartreuse hover:text-chartreuse disabled:opacity-50">
                Already set up → connect
              </button>
              <button onClick={onRegister} disabled={status === "registering" || groqFilled < GROQ_SLOTS || !connectReady} className="gr-press border-2 border-bone bg-chartreuse px-6 py-2.5 font-display text-base font-bold uppercase tracking-wide text-pitch disabled:opacity-40" style={{ boxShadow: "3px 3px 0 rgba(242,239,230,0.9)" }}>
                {status === "registering" ? "registering…" : "Register your engine"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-pitch">
        <div aria-hidden className="gr-hazard h-[14px] opacity-90" />
        <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-10 xl:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">HELIQUANT · REGISTER YOUR ENGINE · your keys, your machine, no custody</p>
        </div>
      </footer>
    </>
  );
}
