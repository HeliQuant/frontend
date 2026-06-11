/**
 * Live campaign feed — reads the always-on firm's /campaign endpoint on Railway.
 * Paper positions at live prices; the firm opens them ONLY on quantitative desk votes, each
 * sized by ATR (SL 1.8×ATR / TP 2.5×ATR / 4h max-hold). Real capital still needs a validated
 * edge — this is the disciplined hunt, made visible.
 */

export const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "https://agents-production-5a3d.up.railway.app";

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
};

export type ClosedPosition = {
  id: number;
  asset: string;
  dir: "LONG" | "SHORT";
  exit: number | null;
  exit_reason: "TP" | "SL" | "TIME" | "TRAIL" | null;
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
  exits_by_reason: { TP: number; SL: number; TIME: number; TRAIL?: number };
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
};

export async function fetchCampaign(): Promise<CampaignStatus | null> {
  try {
    const r = await fetch(`${AGENT_URL}/campaign?cb=${Date.now()}`, { cache: "no-store" });
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
export type EdgeRegistry = { validated: Record<string, EdgeRec>; candidate: Record<string, EdgeRec> };

export async function fetchDesks(): Promise<DeskWeights | null> {
  try {
    const r = await fetch(`${AGENT_URL}/desks?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as DeskWeights) : null;
  } catch {
    return null;
  }
}
export async function fetchEdges(): Promise<EdgeRegistry | null> {
  try {
    const r = await fetch(`${AGENT_URL}/edges?cb=${Date.now()}`, { cache: "no-store" });
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
  exit_reason: "TP" | "SL" | "TIME" | "TRAIL" | null;
  net_pct: number | null;
  pnl_usd: number | null;
  size_usd: number;
  regime: string | null;
  reasons: string[] | null;
  utc_open: string;
  utc_close: string | null;
  anchor_tx: string | null; // Mantle Sepolia tx that sealed this trade's outcome (null = pending)
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
    const r = await fetch(`${AGENT_URL}/trades?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as TradeLog) : null;
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
    const r = await fetch(`${AGENT_URL}/onchain?cb=${Date.now()}${q}`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as OnchainLedger) : null;
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
