/**
 * Live campaign feed — reads the always-on firm's /campaign endpoint on Railway.
 * Paper positions at live prices; the firm opens them ONLY on quantitative desk votes, each
 * sized by ATR (SL 1.8×ATR / TP 2.5×ATR / 4h max-hold). Real capital still needs a validated
 * edge — this is the disciplined hunt, made visible.
 */

import { getEngineUrl, OWNER_ENGINE_URL } from "./engine";

/** Back-compat re-export of the Owner-showcase URL. Live fetches use getEngineUrl() (runtime-switchable). */
export const AGENT_URL = OWNER_ENGINE_URL;

export type OpenPosition = {
  id: number;
  asset: string;
  dir: "LONG" | "SHORT";
  tier: "STRONG" | "LEAN";
  entry: number;
  sl: number | null;
  tp: number | null;
  sl_pct: number | null;
  tp_pct: number | null;
  votes: number;
  reasons?: string[];
  utc_open: string;
  now?: number;
  upnl_pct?: number;
  horizon_h?: number;        // the dynamic hold-time this position trades on (3h fade / 8h trend / 24h edge)
  held_h?: number;           // hours held so far
  tp_progress_pct?: number;  // 0..100 — how far price has travelled toward TP
  near_tp?: boolean;         // in the near-TP band (>=80% to TP, not broken through)
  near_tp_lock_in_s?: number; // seconds until the near-TP lock fires (banks the near-win)
  venue?: string | null;     // "bybit-testnet-spot" | "bybit-testnet-perp" | null/absent = paper
};

export type ClosedPosition = {
  id: number;
  asset: string;
  dir: "LONG" | "SHORT";
  exit: number | null;
  exit_reason: "TP" | "SL" | "TIME" | "TRAIL" | "STALL" | "NEARTP" | null;
  net_pct: number | null;
  pnl_usd: number | null;
  utc_close: string | null;
};

export type CampaignStatus = {
  target: number | null; // null = continuous (no lifetime cap — fully autonomous)
  continuous?: boolean;
  opened: number;
  closed: number;
  open_now: number;
  win_pct: number;
  net_usd: number;
  done: boolean;
  testnet_fills: number;
  exits_by_reason: { TP: number; SL: number; TIME: number; TRAIL?: number; STALL?: number; NEARTP?: number };
  edge_open?: number;
  sized_up_open?: number;
  skips?: number;
  recent_skips?: { asset: string; dir: string; regime: string; utc: string }[];
  learned?: { tracked: number; faded: number; records: { cond: string; n: number; wins: number; pnl: number }[] };
  last_scan?: Record<string, string>;
  failed_conditions: number;
  horizon_h: number;
  risk_model: string;
  open_positions: OpenPosition[];
  recent_closes: ClosedPosition[];
  principle: string;
  capital?: Capital;
};

export type Capital = {
  starting_capital_usd: number;
  realized_pnl_usd: number;
  unrealized_pnl_usd: number;
  equity_usd: number;
  roi_pct: number;
  basis: string;
  bitget_saldo?: { available_usd: number; equity_usd: number; demo: boolean };
};

export async function fetchCampaign(): Promise<CampaignStatus | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/campaign?cb=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as CampaignStatus;
  } catch {
    return null;
  }
}

// ── strategic learning layers (for the Tuning Bay) ──
export type DeskWeights = {
  desks: string[];
  bounds: [number, number];
  min_samples: number;
  weights: Record<string, number>;
  detail: Record<string, { weight: number; samples: number; align_rate: number | null }>;
};
export type EdgeRec = {
  edge: string;
  asset: string;
  validated: boolean;
  horizon_h?: number;
  p_win?: number;
  payoff_b?: number;
  sample_n?: number;
  oos_roi_pct?: number;
  pval?: number;
  tier?: string;
  confirmations?: number;
  note?: string;
};
export type EdgeRegistry = {
  validated: Record<string, EdgeRec>;
  candidate: Record<string, EdgeRec>;
  last_run?: string | null; // ISO of the last edge-lab sweep — proves the lab is still running
};

export async function fetchDesks(): Promise<DeskWeights | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/desks?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DeskWeights) : null;
  } catch {
    return null;
  }
}
export async function fetchEdges(): Promise<EdgeRegistry | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/edges?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as EdgeRegistry) : null;
  } catch {
    return null;
  }
}

// ── the trade ledger (every resolved trade) ──
export type Trade = {
  id: number;
  asset: string;
  dir: "LONG" | "SHORT";
  tier: string;
  entry: number;
  exit: number | null;
  exit_reason: "TP" | "SL" | "TIME" | "TRAIL" | "STALL" | "NEARTP" | null;
  net_pct: number | null;
  pnl_usd: number | null;
  size_usd: number;
  regime: string | null;
  reasons: string[] | null;
  utc_open: string;
  utc_close: string | null;
  anchor_tx: string | null; // Mantle Sepolia tx that sealed this trade's outcome (null = pending)
  venue?: string | null;    // "bybit-testnet-spot" | "bybit-testnet-perp" | null/absent = paper
};
export type TradeLog = {
  count: number;
  wins: number;
  win_pct: number;
  net_usd: number;
  open_now: number;
  trades: Trade[];
};
export async function fetchTrades(): Promise<TradeLog | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/trades?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as TradeLog) : null;
  } catch {
    return null;
  }
}

// ── THE DYNO: rigorous performance analytics on the real ledger (/performance) ──
// quantstats-grade metrics, computed numpy-only from resolved trades. Annualized figures are
// suppressed until the sample is meaningful (>=30d & >=30 trades) — the firm refuses to extrapolate
// a fantasy CAGR off a 3-day window, so those fields go null and `annualized` is false.
export type PerfStats = {
  n: number;
  note?: string;
  win_rate?: number;
  total_return_pct?: number;
  mean_trade_pct?: number;
  vol_trade_pct?: number;
  sharpe_per_trade?: number;
  sortino_per_trade?: number;
  sharpe_annualized?: number | null;
  sortino_annualized?: number | null;
  max_drawdown_pct?: number;
  calmar?: number | null;
  cagr_pct?: number | null;
  profit_factor?: number | null;
  avg_win_pct?: number | null;
  avg_loss_pct?: number | null;
  best_pct?: number;
  worst_pct?: number;
  span_days?: number | null;
  trades_per_year?: number | null;
  annualized?: boolean;
  equity_curve?: number[];
  sample_warning?: string | null;
};
export async function fetchPerformance(): Promise<PerfStats | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/performance?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as PerfStats) : null;
  } catch {
    return null;
  }
}

// ── THE EDGE: delta-neutral funding-carry (/carry) — the one validated positive, non-directional edge ──
// Live carry rate per asset from real Bybit funding + the dated crash-robustness verdict. Honest: the firm
// HARVESTS only when carry is rich (>risk-free) AND crash-robust; otherwise it skips (funding thin = wait).
export type CarryRead = {
  carry_ann_pct: number | null;
  crash_class: string | null; // robust | lumpy | moderate | tame | untested
  verdict: string | null;
  source?: string;
};
export type CarryStatus = {
  carry: Record<string, CarryRead>;
  best_harvestable: string;
  asof?: string | null; // ISO of the last funding read — null = feed never/stale
};
export async function fetchCarry(): Promise<CarryStatus | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/carry?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as CarryStatus) : null;
  } catch {
    return null;
  }
}

// ── the on-chain agent roster (ERC-8004) ──
export type Agent = {
  name: string;
  kind: string;
  tokenId: number | null;
  ml: boolean;
  role?: string;
  weight?: number | null;
  reputation?: { total_jobs: number; successful_jobs: number; cum_pnl: number; credentials?: number } | null;
};
export type AgentRoster = { agents: Agent[]; identity?: string; explorer?: string; error?: string };
export async function fetchAgents(): Promise<AgentRoster | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/agents?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as AgentRoster) : null;
  } catch {
    return null;
  }
}

// ── on-chain anchor ledger (THE BLACK BOX) ──
export type OnchainTx = {
  hash: string;
  block: number;
  ts: number;
  to: string;
  from: string;
  value: string;
  method: string;
  is_error: boolean;
  self_anchor: boolean;
};
export type OnchainLedger = {
  wallet: string;
  chain: string;
  chain_id: number;
  explorer: string;
  total: number;
  txs: OnchainTx[];
  configured: boolean;
  error?: string;
};
export async function fetchOnchain(wallet?: string): Promise<OnchainLedger | null> {
  try {
    const q = wallet ? `&wallet=${encodeURIComponent(wallet)}` : "";
    const r = await fetch(`${getEngineUrl()}/onchain?cb=${Date.now()}${q}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as OnchainLedger) : null;
  } catch {
    return null;
  }
}

// ── THE TIMING TOWER: live per-asset Hyperliquid smart-money (/whales) ──
// The REAL per-asset grid the firm acts on: the Hyperliquid top-PnL leaderboard, read live per
// traded asset (BTC/ETH/SOL/HYPE/SUI — MNT is NOT on Hyperliquid). Honest by construction: when
// none of the tracked top traders hold an asset, whales_in_position is 0 and the row says so.
// one individual top-PnL HL trader holding the asset — the clickable wallet rows on /whales
export type WhaleEntry = {
  address: string;
  side: "LONG" | "SHORT";
  notional_usd: number;
  roe_pct: number;
  upnl_usd: number;
};
export type WhaleAsset = {
  asset: string;
  whales_in_position: number; // how many of the tracked top-PnL traders currently hold it
  long: number;               // count on the long side
  short: number;              // count on the short side
  long_usd: number;           // notional held long
  short_usd: number;          // notional held short
  net_usd: number;            // long_usd − short_usd (net conviction)
  avg_roe_pct: number | null; // mean ROE across holders (null = no read)
  stance: "LONG" | "SHORT" | "NEUTRAL";
  n_tracked: number;          // size of the tracked leaderboard for this asset
  brief: string;              // one-line read
  whales?: WhaleEntry[];      // the individual wallets holding it (top by notional)
};
export type WhalesResponse = {
  asof: string;
  source: string;
  assets: WhaleAsset[];
};
export async function fetchWhales(): Promise<WhalesResponse | null> {
  try {
    const r = await fetch(`${getEngineUrl()}/whales?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as WhalesResponse) : null;
  } catch {
    return null;
  }
}

/** Fraction 0..1 along the lane: 0 = at the stop (SL), 1 = at the target (TP). Works for both
 *  directions because (now-SL)/(TP-SL) is sign-stable. */
export function laneFrac(p: OpenPosition): number | null {
  if (p.now == null || p.sl == null || p.tp == null || p.tp === p.sl) return null;
  const f = (p.now - p.sl) / (p.tp - p.sl);
  return Math.max(0, Math.min(1, f));
}

/** Trade-venue badge content. A real Bybit-testnet fill reads ⚡ BYBIT TESTNET (chartreuse);
 *  anything else (null/absent = paper at live prices) reads 📄 PAPER (steel). Returns the label
 *  plus the border/text Tailwind classes — the caller adds its own sibling-chip sizing. */
export function venueBadge(venue?: string | null): { label: string; cls: string } {
  const v = venue || "";
  const bg = v.includes("bitget");
  const bb = v.includes("bybit-testnet");
  if (bg && bb) return { label: "⚡ DUAL · BYBIT+BITGET", cls: "border-chartreuse text-chartreuse" };
  if (bg) return { label: "⚡ BITGET DEMO", cls: "border-chartreuse/50 text-chartreuse" };
  if (bb) return { label: "⚡ BYBIT TESTNET", cls: "border-chartreuse/50 text-chartreuse" };
  if (v.startsWith("paper (learning")) return { label: "📄 PAPER · LEARNING", cls: "border-bone/30 text-steel" };
  return { label: "📄 PAPER", cls: "border-bone/25 text-steel" };
}
