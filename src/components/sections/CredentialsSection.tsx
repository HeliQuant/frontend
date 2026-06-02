"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ───────────────────────── data: BYO data-API keys ─────────────────────────
   DATA-API keys only — never private keys or service-role secrets. */
type CredField = {
  key: string;
  label: string;
  purpose: string;
  placeholder: string;
};

const CREDENTIALS: CredField[] = [
  {
    key: "groq",
    label: "Groq / LLM",
    purpose: "powers the seven AI desks + PM synthesis (BYO any OpenAI-compatible provider)",
    placeholder: "gsk_••••••••••••••••••••",
  },
  {
    key: "mantlescan",
    label: "Mantlescan (Etherscan v2)",
    purpose: "on-chain reads — holder composition, whale & contract flow on Mantle",
    placeholder: "MSC_••••••••••••••••••",
  },
  {
    key: "nansen",
    label: "Nansen",
    purpose: "macro smart-money netflow (majors), where smart money is actually present",
    placeholder: "nansen_••••••••••••••",
  },
  {
    key: "elfa",
    label: "Elfa",
    purpose: "smart-social narratives / mindshare from smart accounts, not retail noise",
    placeholder: "elfa_••••••••••••••••",
  },
  {
    key: "allora",
    label: "Allora",
    purpose: "decentralised-AI macro — BTC/ETH 8h price prediction feed",
    placeholder: "allora_••••••••••••••",
  },
];

const SECURITY_NOTES = [
  "Data-API keys are encrypted at rest (per-user, Row-Level Security) in Supabase.",
  "We NEVER store private keys or service-role keys in the browser or Supabase.",
  "The on-chain executor uses a testnet-only key, server-side.",
];

type TestState = "idle" | "checking" | "ok" | "unset";

const SPRING = { type: "spring" as const, stiffness: 90, damping: 18, mass: 0.9 };

/* small lock glyph — inline SVG, no external assets */
function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
      width="13"
      height="13"
    >
      <rect x="3" y="7" width="10" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M5.2 7V5.4a2.8 2.8 0 0 1 5.6 0V7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className} width="14" height="14">
      <path
        d="M8 1.5 13 3.3v4.1c0 3.2-2.1 5.6-5 7.1-2.9-1.5-5-3.9-5-7.1V3.3L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="m5.8 8 1.6 1.6L10.4 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Mode = "demo" | "byo";

export default function CredentialsSection() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [mode, setMode] = useState<Mode>("demo");
  const [tests, setTests] = useState<Record<string, TestState>>({});
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const byo = mode === "byo";

  function runTest(fieldKey: string) {
    // DEMO ONLY: faux connectivity check, no network call, no persistence.
    setTests((prev) => ({ ...prev, [fieldKey]: "checking" }));
    window.setTimeout(() => {
      setTests((prev) => ({ ...prev, [fieldKey]: byo ? "ok" : "unset" }));
    }, 900);
  }

  function handleSave() {
    setSaveNote(
      "Demo — in production these are encrypted to your Supabase row. Not persisted here.",
    );
    window.setTimeout(() => setSaveNote(null), 6000);
  }

  return (
    <section
      id="configure"
      className="mx-auto max-w-[1200px] px-6 py-20 md:py-28"
      aria-labelledby={`${baseId}-heading`}
    >
      {/* ─────────── header ─────────── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={SPRING}
        className="max-w-2xl"
      >
        <span className="inline-flex items-center gap-2 rounded-badge border border-fog-border bg-pure-surface px-3 py-1 font-mono text-caption text-slate-ink shadow-badge">
          <ShieldIcon className="text-onchain" />
          Configure
        </span>
        <h2
          id={`${baseId}-heading`}
          className="font-display mt-5 text-balance text-4xl font-medium leading-[1.02] tracking-tight text-midnight-navy sm:text-5xl"
        >
          Run your own firm.
        </h2>
        <p className="mt-4 text-balance text-subheading leading-relaxed text-slate-ink">
          Bring your own data-API keys; HeliQuant orchestrates the rest — seven desks, the PM,
          the gating, and the on-chain ledger.
        </p>
      </motion.div>

      {/* ─────────── the settings card ─────────── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="mt-10 rounded-card border border-fog-border bg-pure-surface p-6 shadow-card sm:p-8"
      >
        {/* mode toggle */}
        <div
          role="radiogroup"
          aria-label="Credential source mode"
          className="inline-flex rounded-pill-lg border border-fog-border bg-ghost-canvas p-1"
        >
          {(
            [
              { id: "demo", label: "Demo mode (project keys)" },
              { id: "byo", label: "Bring your own" },
            ] as const
          ).map((opt) => {
            const active = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(opt.id)}
                className={`relative rounded-pill-lg px-4 py-2 text-caption font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onchain ${
                  active ? "text-midnight-navy" : "text-ash-medium hover:text-slate-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={reduce ? undefined : `${baseId}-pill`}
                    className="absolute inset-0 rounded-pill-lg bg-pure-surface shadow-badge"
                    transition={SPRING}
                    aria-hidden
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* mode note */}
        <p className="mt-4 font-mono text-caption text-slate-ink">
          {byo ? (
            <span className="inline-flex items-center gap-1.5 text-onchain">
              <LockIcon className="text-onchain" />
              Your keys, encrypted to your row — enter them below.
            </span>
          ) : (
            <span className="text-ash-medium">
              Using HeliQuant&apos;s own keys — explore freely.
            </span>
          )}
        </p>

        {/* credential rows */}
        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {CREDENTIALS.map((cred) => {
            const state = tests[cred.key] ?? "idle";
            const fieldId = `${baseId}-${cred.key}`;
            return (
              <div
                key={cred.key}
                className="rounded-card-md border border-fog-border bg-ghost-canvas/60 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <label
                    htmlFor={fieldId}
                    className="flex items-center gap-1.5 text-body font-medium text-midnight-navy"
                  >
                    <LockIcon className="text-ash-medium" />
                    {cred.label}
                  </label>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-ash-medium">
                    data-api
                  </span>
                </div>
                <p className="mt-1 text-caption leading-snug text-slate-ink">{cred.purpose}</p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash-medium">
                      <LockIcon />
                    </span>
                    <input
                      id={fieldId}
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      disabled={!byo}
                      placeholder={byo ? "Paste your key" : cred.placeholder}
                      aria-describedby={`${fieldId}-purpose`}
                      className="w-full rounded-card-sm border border-fog-border bg-ghost-canvas py-2 pl-8 pr-3 font-mono text-caption text-midnight-navy placeholder:text-ash-medium focus:border-onchain focus:outline-none focus-visible:ring-2 focus-visible:ring-onchain/30 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => runTest(cred.key)}
                    disabled={state === "checking"}
                    className="shrink-0 rounded-card-sm border border-fog-border bg-pure-surface px-3 py-2 text-caption font-medium text-slate-ink transition-colors duration-150 hover:border-onchain hover:text-onchain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onchain disabled:opacity-50"
                  >
                    Test
                  </button>
                </div>

                {/* faux test state — clearly a demo */}
                <div className="mt-2 h-4" aria-live="polite">
                  {state === "checking" && (
                    <span className="font-mono text-[11px] text-ash-medium">checking…</span>
                  )}
                  {state === "ok" && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-win">
                      ✓ ok <span className="text-ash-medium">(demo check)</span>
                    </span>
                  )}
                  {state === "unset" && (
                    <span className="font-mono text-[11px] text-ash-medium">
                      not set — switch to “Bring your own”
                    </span>
                  )}
                </div>
                <span id={`${fieldId}-purpose`} className="sr-only">
                  {cred.purpose}
                </span>
              </div>
            );
          })}
        </div>

        {/* ─────────── security panel ─────────── */}
        <div className="mt-6 rounded-card-md border border-onchain/30 bg-onchain/[0.04] p-5">
          <div className="flex items-center gap-2 font-mono text-caption font-medium text-onchain">
            <ShieldIcon />
            Security
          </div>
          <ul className="mt-3 space-y-2 font-mono text-[12px] leading-relaxed text-slate-ink">
            {SECURITY_NOTES.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden className="mt-px shrink-0 text-onchain">
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ─────────── save CTA ─────────── */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-pill-lg bg-chartreuse px-6 py-3 text-body font-medium text-midnight-navy shadow-cta transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chartreuse"
          >
            <LockIcon className="text-midnight-navy" />
            Save configuration
          </button>

          {saveNote && (
            <motion.p
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={SPRING}
              role="status"
              className="max-w-md font-mono text-caption leading-snug text-slate-ink"
            >
              {saveNote}
            </motion.p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
