/**
 * Live-floor feed — reads the always-on firm's operational endpoints on Railway.
 * Pairs with lib/campaign.ts (positions + stats); this adds the org pulse (cycle health),
 * the PM decision feed, and OHLC candles for the position charts.
 */

import { AGENT_URL } from "./campaign";

export type OrgStatus = {
  started_utc?: string;
  cycles?: number;
  last_cycle_utc?: string | null;
  last_error?: string | null;
  assets?: string[];
  interval_min?: number;
  execute?: boolean | number;
};

export type Decision = {
  utc: string;
  asset: string;
  decision: string; // ENTER | ABSTAIN | ...
  direction?: string | null;
  reason?: string;
};

export type Candle = { t: number; o: number; h: number; l: number; c: number };

async function getJSON<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${AGENT_URL}${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const fetchStatus = () => getJSON<OrgStatus>("/status");
export const fetchDecisions = () => getJSON<Decision[]>("/decisions");
export const fetchCandles = (asset: string, interval = "60", limit = 96) =>
  getJSON<{ asset: string; candles: Candle[] }>(`/candles?asset=${asset}&interval=${interval}&limit=${limit}`);
