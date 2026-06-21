"use client";

/**
 * /app — HeliQuant's on-chain trading PRODUCT: "hire the firm".
 *
 * A client deposits mUSDC into the JobManager escrow; the firm runs its gated decision loop and,
 * on MNT today, most often ABSTAINS (capital preserved — that restraint IS the product). When the
 * job matures anyone may settle it on-chain; profit splits by performance fee, losses are the
 * client's. This page is the deposit + live dashboard, rendered at the gear-engine design standard:
 * blueprint void, dark glass panels, wide-tracked mono telemetry, chartreuse RATIONED to the one
 * primary action.
 *
 * Stack: Next 16 · React 19 · wagmi v2 · viem · motion/react. Strict TS, no `any`.
 * Every async surface has idle / pending / confirming / success / error states and never crashes:
 * getJob & getJobBalance are only read for ids returned by jobsByClient (getJob reverts otherwise).
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, parseUnits, type Address, type Hex } from "viem";

import AppNav from "@/components/garage/AppNav";
import RadialEngine from "@/components/garage/RadialEngine";
import {
  ADDRESSES,
  CHAIN_ID,
  DEFAULT_PERF_FEE_BPS,
  DURATION_PRESETS,
  erc20Abi,
  FIRM_TOKEN_ID,
  jobManagerAbi,
  JobState,
  mantlescanAddress,
  mantlescanTx,
  PRINCIPAL_DECIMALS,
  tradingVaultAbi,
} from "@/lib/contracts";

// ───────────────────────────── the LAW: local palette (NIGHT GARAGE tokens — brand v2) ─────────────────────────────
const VOID = "#0b0b0b"; // pitch — deepest backdrop
const MIDNIGHT = "#0b0b0b"; // pitch — page base
const PANEL = "#161614"; // carbon panel
const SURFACE_1 = "#1e1e1b"; // carbon2 raised
const HAIRLINE = "rgba(242, 239, 230, 0.14)"; // bone hairline
const HAIRLINE_HOVER = "rgba(242, 239, 230, 0.36)";
const ICE = "#f2efe6"; // bone — ink on dark
const ICE_GLOW = "#f2efe6";
const MUTE = "#8b8b80"; // steel
const MUTE_2 = "#5b5b53";
const SOLAR = "#f2efe6"; // warm accents fold into bone (no solar in the garage)
const FLAME = "#ff5a1f"; // signal — rare alert only
const AMBER = "#f2efe6"; // Active / ABSTAIN — discipline reads bone, never warning-colored
const EMERALD = "#c9f24b"; // Settled / profit — chartreuse is the win color
const CRIMSON = "#ff5a1f"; // loss / error
const CHARTREUSE = "#c9f24b"; // RATIONED — the ONE primary action only

const MONO = "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)";
const DISPLAY = "var(--font-display, ui-sans-serif, system-ui, sans-serif)";

const SWEEP = [0.4, 0, 0.2, 1] as const;
const DAMPED = [0.16, 1, 0.3, 1] as const;

const ZERO = BigInt(0); // ES2017 target → no 0n literal

// ───────────────────────────── tiny formatting helpers (locale-stable, never throw) ─────────────────────────────
function fmtUnits(value: bigint | undefined, decimals: number, maxFrac = 2): string {
  if (value === undefined) return "—";
  try {
    const n = Number(formatUnits(value, decimals));
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: maxFrac });
  } catch {
    return "—";
  }
}
function truncHash(h: string, head = 6, tail = 4): string {
  if (!h) return "";
  return h.length <= head + tail + 1 ? h : `${h.slice(0, head)}…${h.slice(-tail)}`;
}
function shortError(msg: string | undefined): string {
  if (!msg) return "Transaction failed";
  // viem messages are verbose — take the first meaningful line, cap length
  const first = msg.split("\n").find((l) => l.trim().length > 0) ?? msg;
  const trimmed = first.replace(/\.$/, "").trim();
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;
}

/** Human countdown to maturity (or "Matured"). Pure — caller supplies `now` for reactivity. */
function maturityLabel(startTime: bigint, duration: bigint, nowSec: number): { matured: boolean; text: string } {
  const end = Number(startTime) + Number(duration);
  const remaining = end - nowSec;
  if (remaining <= 0) return { matured: true, text: "Matured" };
  const d = Math.floor(remaining / 86_400);
  const h = Math.floor((remaining % 86_400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  if (d > 0) return { matured: false, text: `${d}d ${h}h` };
  if (h > 0) return { matured: false, text: `${h}h ${m}m` };
  if (m > 0) return { matured: false, text: `${m}m ${s}s` };
  return { matured: false, text: `${s}s` };
}

// a shared 1-second clock so countdowns tick without each panel owning a timer
function useNowSeconds(): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

// ───────────────────────────── shared glass panel ─────────────────────────────
function Panel({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: DAMPED, delay }}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(180deg, ${PANEL} 0%, ${VOID} 100%)`,
        border: `1px solid ${HAIRLINE}`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.02), 0 30px 80px -28px rgba(250,82,15,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </motion.div>
  );
}

function PanelHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="px-5 py-4" style={{ borderBottom: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.24em", color: MUTE }}>{kicker}</div>
      <div className="mt-1" style={{ fontFamily: MONO, fontSize: "13px", letterSpacing: "0.14em", color: ICE }}>
        {title}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.22em", color: MUTE, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

// status pill (ENTER-ish accent dot + text)
function StatusPill({ color, label, pulse }: { color: string; label: string; pulse?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse ? (
          <span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: color, opacity: 0.7, animation: "hq-ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        ) : null}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      <span style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.2em", color }}>{label}</span>
    </span>
  );
}

// ───────────────────────────── primary (chartreuse) + ghost buttons ─────────────────────────────
type BtnState = "idle" | "disabled" | "pending";

function PrimaryButton({
  children,
  onClick,
  state = "idle",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  state?: BtnState;
  type?: "button" | "submit";
}) {
  const disabled = state !== "idle";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-busy={state === "pending"}
      className="group relative inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 enabled:hover:scale-[1.02] disabled:cursor-not-allowed"
      style={{
        fontFamily: DISPLAY,
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        backgroundColor: disabled ? "rgba(208,241,0,0.18)" : CHARTREUSE,
        color: disabled ? "rgba(255,255,255,0.55)" : "#000000",
        boxShadow: disabled
          ? "rgba(186,215,247,0.12) 0px 0px 0px 1px inset"
          : "rgba(208,241,0,0.4) 0px 0px 12px 0px, rgba(255,255,255,0.4) 0px 1px 1px 0px inset",
        outlineColor: CHARTREUSE,
      }}
    >
      {state === "pending" ? <Spinner /> : null}
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  state = "idle",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  state?: BtnState;
}) {
  const disabled = state !== "idle";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={state === "pending"}
      className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 enabled:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        fontFamily: MONO,
        fontSize: "10px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: ICE,
        border: `1px solid ${HAIRLINE}`,
        background: "rgba(255,255,255,0.02)",
        outlineColor: ICE_GLOW,
      }}
    >
      {state === "pending" ? <Spinner muted /> : null}
      {children}
    </button>
  );
}

function Spinner({ muted }: { muted?: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
      style={{ color: muted ? ICE : "#000", opacity: 0.85 }}
    />
  );
}

// ───────────────────────────── tx status line (idle/pending/confirming/success/error) ─────────────────────────────
type TxPhase = "idle" | "signing" | "confirming" | "success" | "error";

function TxStatus({ phase, hash, error, label }: { phase: TxPhase; hash?: Hex; error?: string; label?: string }) {
  if (phase === "idle") return null;
  const color =
    phase === "success" ? EMERALD : phase === "error" ? CRIMSON : SOLAR;
  const text =
    phase === "signing"
      ? `${label ?? "Transaction"} — confirm in wallet…`
      : phase === "confirming"
        ? `${label ?? "Transaction"} — confirming on Mantle…`
        : phase === "success"
          ? `${label ?? "Transaction"} confirmed`
          : shortError(error);
  return (
    <div className="mt-3 flex items-start gap-2.5" role="status" aria-live="polite">
      <span className="relative mt-[3px] flex h-1.5 w-1.5 shrink-0">
        {phase === "signing" || phase === "confirming" ? (
          <span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: color, opacity: 0.7, animation: "hq-ping 1.6s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        ) : null}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      <div className="min-w-0">
        <p style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color, lineHeight: 1.5 }}>{text}</p>
        {hash ? (
          <a
            href={mantlescanTx(hash)}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 transition-colors hover:text-white focus-visible:outline-none"
            style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.16em", color: MUTE }}
          >
            {truncHash(hash, 10, 8)} <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════ 2 — FAUCET ═══════════════════════════════════════════
function FaucetPanel({ address, onMinted }: { address: Address; onMinted: () => void }) {
  const bal = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: { refetchInterval: 12_000 },
  });

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const phase: TxPhase = receipt.isError
    ? "error"
    : receipt.isSuccess
      ? "success"
      : hash
        ? "confirming"
        : isPending
          ? "signing"
          : "idle";

  // refetch balance once the mint confirms
  useEffect(() => {
    if (receipt.isSuccess) {
      bal.refetch();
      onMinted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess]);

  function mint() {
    reset();
    writeContract({
      address: ADDRESSES.mockUSDC,
      abi: erc20Abi,
      functionName: "mint",
      args: [address, parseUnits("1000", PRINCIPAL_DECIMALS)],
    });
  }

  const btnState: BtnState = phase === "signing" || phase === "confirming" ? "pending" : "idle";

  return (
    <Panel>
      <PanelHeader kicker="STEP 1 · TESTNET" title="GET TEST CAPITAL" />
      <div className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Label>Your mUSDC balance</Label>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span style={{ fontFamily: MONO, fontSize: "30px", letterSpacing: "0.02em", color: ICE, lineHeight: 1 }}>
                {bal.isLoading ? "···" : fmtUnits(bal.data, PRINCIPAL_DECIMALS)}
              </span>
              <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.18em", color: MUTE }}>mUSDC</span>
            </div>
          </div>
          <a
            href={mantlescanAddress(ADDRESSES.mockUSDC)}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 transition-colors hover:text-white focus-visible:outline-none"
            style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.16em", color: MUTE_2 }}
          >
            token ↗
          </a>
        </div>

        <div className="mt-5 w-full sm:max-w-[240px]">
          <GhostButton onClick={mint} state={btnState}>
            Get 1,000 test USDC
          </GhostButton>
        </div>
        <TxStatus phase={phase} hash={hash} error={receipt.error?.message} label="Faucet mint" />
        <p className="mt-3" style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.12em", color: MUTE_2, lineHeight: 1.7 }}>
          MOCK USDC ON MANTLE SEPOLIA · PUBLIC FAUCET · NO REAL VALUE
        </p>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════ 3 — HIRE ═══════════════════════════════════════════
function HirePanel({ address, onHired }: { address: Address; onHired: () => void }) {
  const [amount, setAmount] = useState("100");
  const [durationSec, setDurationSec] = useState<number>(DURATION_PRESETS[0]!.seconds);

  // parse amount → bigint (6dp). invalid / ≤0 disables the action gracefully.
  const parsedAmount = useMemo<bigint | null>(() => {
    const t = amount.trim();
    if (!t || Number(t) <= 0 || Number.isNaN(Number(t))) return null;
    try {
      return parseUnits(t, PRINCIPAL_DECIMALS);
    } catch {
      return null;
    }
  }, [amount]);

  const balance = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: { refetchInterval: 12_000 },
  });
  const allowance = useReadContract({
    address: ADDRESSES.mockUSDC,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address, ADDRESSES.jobManager],
    query: { refetchInterval: 12_000 },
  });

  const insufficient = parsedAmount !== null && balance.data !== undefined && parsedAmount > balance.data;
  const needsApproval =
    parsedAmount !== null && (allowance.data === undefined || allowance.data < parsedAmount);

  // two sequential writes share one hook; we track which leg is in flight.
  const { writeContract, data: hash, isPending, reset, variables } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const leg = variables?.functionName === "approve" ? "approve" : variables?.functionName === "createJob" ? "create" : null;

  // when approve confirms, refresh allowance so the button flips to "Hire"
  useEffect(() => {
    if (receipt.isSuccess && leg === "approve") allowance.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess, leg]);

  // when createJob confirms, reset the form and tell the dashboard to refetch
  useEffect(() => {
    if (receipt.isSuccess && leg === "create") {
      onHired();
      balance.refetch();
      allowance.refetch();
      const t = window.setTimeout(() => reset(), 600); // let the success line breathe, then clear
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess, leg]);

  function approve() {
    if (parsedAmount === null) return;
    reset();
    writeContract({
      address: ADDRESSES.mockUSDC,
      abi: erc20Abi,
      functionName: "approve",
      args: [ADDRESSES.jobManager, parsedAmount],
    });
  }
  function hire() {
    if (parsedAmount === null) return;
    reset();
    writeContract({
      address: ADDRESSES.jobManager,
      abi: jobManagerAbi,
      functionName: "createJob",
      args: [
        FIRM_TOKEN_ID,
        ADDRESSES.mockUSDC,
        parsedAmount,
        ADDRESSES.mockWMNT,
        BigInt(durationSec),
        DEFAULT_PERF_FEE_BPS,
      ],
    });
  }

  const inFlight = isPending || (Boolean(hash) && receipt.isLoading);
  const btnState: BtnState = inFlight ? "pending" : parsedAmount === null || insufficient ? "disabled" : "idle";

  // tx phase for the active leg
  const phase: TxPhase = receipt.isError
    ? "error"
    : receipt.isSuccess
      ? "success"
      : hash
        ? "confirming"
        : isPending
          ? "signing"
          : "idle";
  const legLabel = leg === "approve" ? "Approve mUSDC" : "Hire HeliQuant";

  const onPrimary = needsApproval ? approve : hire;
  const primaryText = inFlight
    ? leg === "approve"
      ? "Approving…"
      : "Hiring…"
    : needsApproval
      ? "Approve mUSDC"
      : "Hire the firm";

  return (
    <Panel>
      <PanelHeader kicker="STEP 2 · ESCROW JOB" title="HIRE HELIQUANT" />
      <div className="p-5">
        {/* amount */}
        <div>
          <div className="flex items-center justify-between">
            <Label>Principal</Label>
            <button
              type="button"
              onClick={() => balance.data !== undefined && setAmount(formatUnits(balance.data, PRINCIPAL_DECIMALS))}
              className="transition-colors hover:text-white focus-visible:outline-none"
              style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.16em", color: MUTE_2 }}
            >
              MAX {fmtUnits(balance.data, PRINCIPAL_DECIMALS)}
            </button>
          </div>
          <div
            className="mt-2 flex overflow-hidden rounded-xl"
            style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}
          >
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="100"
              aria-label="Principal amount in mUSDC"
              className="flex-1 bg-transparent px-4 py-3 outline-none placeholder:text-[#4d535d]"
              style={{ fontFamily: MONO, fontSize: "16px", letterSpacing: "0.02em", color: ICE }}
            />
            <span className="grid place-items-center px-4" style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.16em", color: MUTE, background: "rgba(255,255,255,0.02)" }}>
              mUSDC
            </span>
          </div>
          {insufficient ? (
            <p className="mt-1.5" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", color: CRIMSON }}>
              Exceeds balance — mint more from the faucet above.
            </p>
          ) : null}
        </div>

        {/* duration */}
        <div className="mt-5">
          <Label>Duration</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {DURATION_PRESETS.map((d) => {
              const active = d.seconds === durationSec;
              return (
                <button
                  key={d.seconds}
                  type="button"
                  onClick={() => setDurationSec(d.seconds)}
                  className="rounded-xl px-2 py-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    fontFamily: MONO,
                    fontSize: "9.5px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: active ? ICE : MUTE,
                    border: `1px solid ${active ? HAIRLINE_HOVER : HAIRLINE}`,
                    background: active ? "rgba(186,215,247,0.06)" : "rgba(255,255,255,0.01)",
                    outlineColor: ICE_GLOW,
                  }}
                  aria-pressed={active}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* perf fee (fixed display — contract default 20%) */}
        <div className="mt-5 flex items-center justify-between rounded-xl px-4 py-3" style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.01)" }}>
          <div>
            <Label>Performance fee</Label>
            <p className="mt-1" style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.1em", color: MUTE_2 }}>
              ON POSITIVE PNL ONLY · LOSSES ARE YOURS
            </p>
          </div>
          <span style={{ fontFamily: MONO, fontSize: "18px", letterSpacing: "0.04em", color: ICE }}>
            {DEFAULT_PERF_FEE_BPS / 100}%
          </span>
        </div>

        {/* approve→hire */}
        <div className="mt-6">
          <PrimaryButton onClick={onPrimary} state={btnState}>
            {primaryText}
          </PrimaryButton>
          {/* two-step hint when an approval is required first */}
          {needsApproval && !inFlight && parsedAmount !== null && !insufficient ? (
            <p className="mt-2 text-center" style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.14em", color: MUTE_2 }}>
              STEP 1 OF 2 · APPROVE, THEN HIRE
            </p>
          ) : null}
          <TxStatus phase={phase} hash={hash} error={receipt.error?.message} label={legLabel} />
        </div>

        {/* honest expectation-setting */}
        <div className="mt-5 rounded-xl px-4 py-3.5" style={{ border: `1px solid ${HAIRLINE}`, background: "rgba(255,214,0,0.04)" }}>
          <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.1em", color: AMBER, lineHeight: 1.7 }}>
            The firm escrows your funds and runs its gated decision loop. On MNT today it most often{" "}
            <span style={{ color: ICE }}>ABSTAINS — capital preserved</span>. That discipline is the product, not a bug.
          </p>
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════ 4 — DASHBOARD ═══════════════════════════════════════════
type JobTuple = readonly [
  bigint, // jobId
  Address, // client
  bigint, // firmTokenId
  Address, // principalToken
  bigint, // principalAmount
  Address, // baseToken
  bigint, // startTime (uint64)
  bigint, // duration (uint64)
  number, // perfFeeBps (uint16)
  number, // state (uint8)
  bigint, // finalPrincipalBalance
  bigint, // finalPnL (int256)
];
type VaultTuple = readonly [
  Address, // principalToken
  bigint, // principalDeposit
  bigint, // principalBalance
  Address, // baseToken
  bigint, // baseBalance
  bigint, // lastTradeAt (uint64)
  bigint, // tradeCount
];

function Dashboard({ address, refreshKey }: { address: Address; refreshKey: number }) {
  // jobIds for this client
  const jobs = useReadContract({
    address: ADDRESSES.jobManager,
    abi: jobManagerAbi,
    functionName: "jobsByClient",
    args: [address],
    query: { refetchInterval: 15_000 },
  });

  // re-fetch when a new job is created upstream
  useEffect(() => {
    if (refreshKey > 0) jobs.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const jobIds = (jobs.data ?? []) as readonly bigint[];

  // batch getJob + getJobBalance for every id (only ids that exist → no reverts)
  const details = useReadContracts({
    allowFailure: true,
    contracts: jobIds.flatMap((id) => [
      { address: ADDRESSES.jobManager, abi: jobManagerAbi, functionName: "getJob", args: [id] } as const,
      { address: ADDRESSES.tradingVault, abi: tradingVaultAbi, functionName: "getJobBalance", args: [id] } as const,
    ]),
    query: { enabled: jobIds.length > 0, refetchInterval: 15_000 },
  });

  useEffect(() => {
    if (refreshKey > 0 && jobIds.length > 0) details.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, jobIds.length]);

  const loading = jobs.isLoading || (jobIds.length > 0 && details.isLoading);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.22em", color: ICE }}>YOUR JOBS</div>
        <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.18em", color: MUTE }}>
          {jobs.isError ? "FEED ERROR" : `${jobIds.length} ON RECORD`}
        </span>
      </div>

      {jobs.isError ? (
        <Panel>
          <div className="px-5 py-8">
            <StatusPill color={CRIMSON} label="UNREACHABLE" />
            <p className="mt-3" style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.12em", color: MUTE, lineHeight: 1.7 }}>
              Could not read jobs from JobManager. Check your network connection to Mantle Sepolia.
            </p>
          </div>
        </Panel>
      ) : loading ? (
        <Panel>
          <div className="flex items-center gap-3 px-5 py-8" aria-busy="true">
            <Spinner muted />
            <span style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.22em", color: MUTE }}>READING ESCROW…</span>
          </div>
        </Panel>
      ) : jobIds.length === 0 ? (
        <EmptyJobs />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {jobIds.map((id, i) => {
            const jobRes = details.data?.[i * 2];
            const vaultRes = details.data?.[i * 2 + 1];
            const job = jobRes?.status === "success" ? (jobRes.result as unknown as JobTuple) : undefined;
            const vault = vaultRes?.status === "success" ? (vaultRes.result as unknown as VaultTuple) : undefined;
            return <JobCard key={id.toString()} jobId={id} job={job} vault={vault} index={i} onSettled={() => details.refetch()} />;
          })}
        </div>
      )}
    </div>
  );
}

function EmptyJobs() {
  return (
    <Panel>
      <div className="flex flex-col items-center px-6 py-12 text-center">
        {/* quiet vault glyph */}
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
          <rect x="7" y="11" width="34" height="26" rx="3" stroke={MUTE} strokeWidth="1.4" opacity={0.6} />
          <circle cx="24" cy="24" r="6" stroke={SOLAR} strokeWidth="1.4" opacity={0.7} />
          <line x1="24" y1="24" x2="29" y2="24" stroke={SOLAR} strokeWidth="1.4" opacity={0.7} />
        </svg>
        <p className="mt-4" style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.18em", color: ICE }}>
          NO JOBS YET
        </p>
        <p className="mt-2 max-w-xs" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", color: MUTE, lineHeight: 1.8 }}>
          MINT TEST USDC, THEN HIRE THE FIRM ABOVE. YOUR ESCROWED JOBS — AND EVERY GATED DECISION — APPEAR HERE.
        </p>
      </div>
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
      <Label>{label}</Label>
      <span style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.06em", color: ICE }}>{children}</span>
    </div>
  );
}

function JobCard({
  jobId,
  job,
  vault,
  index,
  onSettled,
}: {
  jobId: bigint;
  job?: JobTuple;
  vault?: VaultTuple;
  index: number;
  onSettled: () => void;
}) {
  const now = useNowSeconds();
  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const phase: TxPhase = receipt.isError
    ? "error"
    : receipt.isSuccess
      ? "success"
      : hash
        ? "confirming"
        : isPending
          ? "signing"
          : "idle";

  useEffect(() => {
    if (receipt.isSuccess) onSettled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt.isSuccess]);

  // if details failed to decode for this id, show a minimal-but-honest card (never crash)
  if (!job) {
    return (
      <Panel delay={index * 0.05}>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "0.16em", color: ICE }}>JOB #{jobId.toString()}</span>
            <StatusPill color={MUTE} label="LOADING" />
          </div>
          <p className="mt-3" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", color: MUTE_2, lineHeight: 1.7 }}>
            Details syncing from chain…
          </p>
          <a
            href={mantlescanAddress(ADDRESSES.jobManager)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 transition-colors hover:text-white focus-visible:outline-none"
            style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.16em", color: MUTE }}
          >
            JobManager ↗
          </a>
        </div>
      </Panel>
    );
  }

  const startTime = job[6];
  const duration = job[7];
  const perfFeeBps = job[8];
  const state = job[9];
  const finalPrincipal = job[10];
  const finalPnL = job[11];
  const principalDeposit = job[4];

  const settled = state === JobState.Settled;
  const { matured, text: maturityText } = maturityLabel(startTime, duration, now);

  const baseBalance = vault?.[4];
  const principalBalance = vault?.[2];
  const tradeCount = vault?.[6];

  const stateColor = settled ? EMERALD : AMBER;
  const stateLabel = settled ? "SETTLED" : "ACTIVE";

  const pnlNum = settled ? Number(formatUnits(finalPnL, PRINCIPAL_DECIMALS)) : null;
  const pnlColor = pnlNum === null ? ICE : pnlNum > 0 ? EMERALD : pnlNum < 0 ? CRIMSON : MUTE;

  function settle() {
    reset();
    writeContract({
      address: ADDRESSES.jobManager,
      abi: jobManagerAbi,
      functionName: "settleJob",
      args: [jobId],
    });
  }

  const settling = isPending || (Boolean(hash) && receipt.isLoading);
  const canSettle = !settled && matured && !settling;

  return (
    <Panel delay={index * 0.05}>
      {/* header: id · firm · state */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2.5">
          <span style={{ fontFamily: MONO, fontSize: "13px", letterSpacing: "0.14em", color: ICE }}>JOB #{jobId.toString()}</span>
          <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.16em", color: MUTE_2 }}>HELIQUANT</span>
        </div>
        <StatusPill color={stateColor} label={stateLabel} pulse={!settled} />
      </div>

      <div className="px-5 py-4">
        {/* headline figure: principal */}
        <div className="flex items-end justify-between">
          <div>
            <Label>{settled ? "Final principal" : "Principal escrowed"}</Label>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span style={{ fontFamily: MONO, fontSize: "26px", letterSpacing: "0.02em", color: ICE, lineHeight: 1 }}>
                {fmtUnits(settled ? finalPrincipal : principalBalance ?? principalDeposit, PRINCIPAL_DECIMALS)}
              </span>
              <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.18em", color: MUTE }}>mUSDC</span>
            </div>
          </div>
          {/* maturity / countdown */}
          <div className="text-right">
            <Label>{settled ? "Status" : matured ? "Maturity" : "Matures in"}</Label>
            <div className="mt-1.5" style={{ fontFamily: MONO, fontSize: "14px", letterSpacing: "0.08em", color: settled ? EMERALD : matured ? SOLAR : ICE }}>
              {settled ? "Closed" : maturityText}
            </div>
          </div>
        </div>

        {/* detail rows */}
        <div className="mt-4">
          <Row label="Deposit">{fmtUnits(principalDeposit, PRINCIPAL_DECIMALS)} mUSDC</Row>
          <Row label="Base (mWMNT)">{baseBalance === undefined ? "—" : fmtUnits(baseBalance, 18, 4)}</Row>
          <Row label="Trades">{tradeCount === undefined ? "—" : tradeCount.toString()}</Row>
          <Row label="Perf fee">{perfFeeBps / 100}%</Row>
          {settled ? (
            <div className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <Label>Realized PnL</Label>
              <span style={{ fontFamily: MONO, fontSize: "13px", letterSpacing: "0.04em", color: pnlColor }}>
                {pnlNum !== null && pnlNum > 0 ? "+" : ""}
                {fmtUnits(finalPnL < ZERO ? -finalPnL : finalPnL, PRINCIPAL_DECIMALS)}
                {pnlNum !== null && pnlNum < 0 ? " (loss)" : ""} mUSDC
              </span>
            </div>
          ) : null}
        </div>

        {/* action / footer */}
        <div className="mt-4">
          {settled ? (
            <a
              href={mantlescanAddress(ADDRESSES.jobManager)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: ICE, border: `1px solid ${HAIRLINE}`, background: "rgba(255,255,255,0.02)", outlineColor: ICE_GLOW }}
            >
              View on MantleScan <span aria-hidden>↗</span>
            </a>
          ) : (
            <>
              <GhostButton onClick={canSettle ? settle : undefined} state={settling ? "pending" : canSettle ? "idle" : "disabled"}>
                {settling ? "Settling…" : matured ? "Settle job" : "Locked until maturity"}
              </GhostButton>
              {!matured ? (
                <p className="mt-2" style={{ fontFamily: MONO, fontSize: "8.5px", letterSpacing: "0.12em", color: MUTE_2, lineHeight: 1.6 }}>
                  ANYONE MAY SETTLE ONCE MATURED · VAULT FLUSHES BASE → PRINCIPAL, THEN SPLITS BY FEE
                </p>
              ) : null}
            </>
          )}
          <TxStatus phase={phase} hash={hash} error={receipt.error?.message} label={`Settle job #${jobId.toString()}`} />
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════ 1 — CONNECT / WRONG-CHAIN GATES ═══════════════════════════════════════════
function ConnectGate() {
  return (
    <Panel className="mx-auto max-w-md">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <motion.div
          aria-hidden
          className="mb-5 grid h-14 w-14 place-items-center rounded-2xl"
          style={{ background: SURFACE_1, border: `1px solid ${HAIRLINE}` }}
          animate={{ boxShadow: [`0 0 0px ${FLAME}00`, `0 0 24px ${FLAME}55`, `0 0 0px ${FLAME}00`] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={SOLAR} strokeWidth="1.6" aria-hidden>
            <rect x="3" y="6" width="18" height="13" rx="2.5" />
            <path d="M16 12h2" strokeLinecap="round" />
            <path d="M3 9h13a2 2 0 0 1 2 2" />
          </svg>
        </motion.div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: "20px", fontWeight: 500, letterSpacing: "0.01em", color: ICE }}>
          Connect to hire the firm
        </h2>
        <p className="mt-2.5 max-w-xs" style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)", fontSize: "13px", color: ICE, opacity: 0.6, lineHeight: 1.65 }}>
          Connect a wallet on Mantle Sepolia to mint test USDC and escrow a trading job.
        </p>
        <div className="mt-6">
          <ConnectButton />
        </div>
      </div>
    </Panel>
  );
}

function WrongChainGate() {
  const { switchChain, isPending, error } = useSwitchChain();
  return (
    <Panel className="mx-auto max-w-md">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <div aria-hidden className="mb-5 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: SURFACE_1, border: `1px solid ${CRIMSON}33` }}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={AMBER} strokeWidth="1.6" aria-hidden>
            <path d="M12 9v4" strokeLinecap="round" />
            <path d="M12 17h.01" strokeLinecap="round" />
            <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h2 style={{ fontFamily: DISPLAY, fontSize: "20px", fontWeight: 500, letterSpacing: "0.01em", color: ICE }}>
          Wrong network
        </h2>
        <p className="mt-2.5 max-w-xs" style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)", fontSize: "13px", color: ICE, opacity: 0.6, lineHeight: 1.65 }}>
          HeliQuant&apos;s contracts live on <span style={{ color: ICE, opacity: 1 }}>Mantle Sepolia</span>. Switch networks to continue.
        </p>
        <div className="mt-6 w-full max-w-[260px]">
          <PrimaryButton onClick={() => switchChain({ chainId: CHAIN_ID })} state={isPending ? "pending" : "idle"}>
            {isPending ? "Switching…" : "Switch to Mantle Sepolia"}
          </PrimaryButton>
        </div>
        {error ? (
          <p className="mt-3" style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.12em", color: CRIMSON }}>
            {shortError(error.message)} — switch manually in your wallet.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════ PAGE ═══════════════════════════════════════════
export default function AppPage() {
  const reduce = useReducedMotion() ?? false;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // gate any animation loops behind a mounted flag (no hydration drift).
  // set inside rAF (not synchronously in the effect body) — matches TheLedger's idiom.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // bump on faucet/hire success → dashboard refetches
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  const wrongChain = isConnected && chainId !== CHAIN_ID;

  return (
    <>
      <AppNav />
      {/* view-only — the on-chain hire / deposit flow (ERC-8183) is still in development */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
        <span
          className="border-2 border-signal2 bg-pitch/92 px-6 py-3 font-display text-base font-extrabold uppercase tracking-[0.18em] text-signal2 sm:text-xl"
          style={{ boxShadow: "6px 6px 0 rgba(255,90,31,0.4)" }}
        >
          🚧 Still in development · view only
        </span>
      </div>
      <main
        className="pointer-events-none relative isolate min-h-screen w-full overflow-hidden px-5 pb-24 pt-16 sm:px-8 md:pt-20 lg:px-12"
        style={{ backgroundColor: MIDNIGHT, color: ICE }}
      >
        {/* atmosphere — carbon dots + faint overhead chartreuse lamp (the garage standard) */}
        <div aria-hidden className="gr-carbon-dots pointer-events-none absolute inset-0 z-0 opacity-40" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,242,75,0.06), transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/* ── masthead ── */}
          <div className="mb-10">
            <motion.p
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.6, ease: SWEEP }}
              className="font-mono uppercase"
              style={{ color: MUTE, letterSpacing: "0.26em", fontSize: "11px" }}
            >
              <span style={{ color: CHARTREUSE }}>▮</span>{" "}
              <span style={{ color: ICE, opacity: 0.82 }}>THE PRODUCT · FUEL THE MACHINE · MANTLE SEPOLIA</span>
            </motion.p>
            <motion.h1
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.08, ease: [0.2, 0.8, 0.2, 1.05] }}
              className="font-display mt-4 text-balance uppercase"
              style={{ color: ICE, fontWeight: 800, fontSize: "clamp(2.6rem, 6vw, 4.4rem)", lineHeight: 0.92, letterSpacing: "0.005em" }}
            >
              Hire the <span style={{ color: CHARTREUSE }}>engine.</span>
            </motion.h1>
            <motion.p
              initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.8, delay: 0.18, ease: SWEEP }}
              className="mt-4 max-w-xl"
              style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)", color: ICE, opacity: 0.7, fontSize: "1rem", lineHeight: 1.65, fontWeight: 300 }}
            >
              Deposit test USDC into the on-chain escrow. The firm runs its gated decision loop for the
              term you set, then settles deterministically — profit splits by performance fee, losses are
              yours. No counterparty, full audit trail.
            </motion.p>
          </div>

          {/* ── THE LIVE FLOOR — the 9-cylinder radial (the firm at work, runs hired or not) ── */}
          <section aria-label="The live floor" className="mb-12 border-2 p-5 sm:p-7" style={{ borderColor: HAIRLINE, backgroundColor: PANEL }}>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono uppercase" style={{ color: MUTE, letterSpacing: "0.26em", fontSize: "10px" }}>
                THE LIVE FLOOR · A NINE-CYLINDER RADIAL · ONE CYLINDER PER DESK
              </p>
              <p className="font-mono uppercase" style={{ color: MUTE, letterSpacing: "0.18em", fontSize: "10px" }}>
                pistons always run — <span style={{ color: ICE }}>the spark needs a validated edge</span>
              </p>
            </div>
            <RadialEngine decision="ABSTAIN" />
          </section>

          {/* ── body: gated by connection + chain ── */}
          {!mounted ? (
            <div className="py-16" />
          ) : !isConnected || !address ? (
            <ConnectGate />
          ) : wrongChain ? (
            <WrongChainGate />
          ) : (
            <div className="flex flex-col gap-10">
              {/* faucet + hire (two columns on wide screens) */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                <FaucetPanel address={address} onMinted={bump} />
                <HirePanel address={address} onHired={bump} />
              </div>

              {/* dashboard */}
              <section aria-label="Your trading jobs">
                <Dashboard address={address} refreshKey={refreshKey} />
              </section>
            </div>
          )}
        </div>

        {/* local keyframes (ping) — self-contained */}
        <style>{`@keyframes hq-ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }`}</style>
      </main>

      <footer style={{ backgroundColor: MIDNIGHT, borderTop: `1px solid ${HAIRLINE}` }}>
        <div
          className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-10 font-mono md:flex-row md:items-center md:justify-between"
          style={{ fontSize: "11px", letterSpacing: "0.18em", color: MUTE, textTransform: "uppercase" }}
        >
          <p>HeliQuant · Hire the firm · Mantle Sepolia 5003</p>
          <p style={{ opacity: 0.8 }}>Escrowed · gated · settled on-chain · losses are the client&apos;s</p>
        </div>
      </footer>
    </>
  );
}
