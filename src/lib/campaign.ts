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
  target: number;
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

/** Fraction 0..1 along the lane: 0 = at the stop (SL), 1 = at the target (TP). Works for both
 *  directions because (now-SL)/(TP-SL) is sign-stable. */
export function laneFrac(p: OpenPosition): number | null {
  if (p.now == null || p.sl == null || p.tp == null || p.tp === p.sl) return null;
  const f = (p.now - p.sl) / (p.tp - p.sl);
  return Math.max(0, Math.min(1, f));
}
