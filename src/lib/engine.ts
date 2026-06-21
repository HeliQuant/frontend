/**
 * Runtime engine URL — the multi-user switch.
 *
 * The dApp defaults to the OWNER showcase (the founder's always-on Railway firm). A visitor can
 * point the whole dashboard at THEIR OWN local engine (run `agents-localReady`, expose it via a
 * tunnel like ngrok, paste the URL on /setup). Every live fetch reads getEngineUrl(), so the moment
 * a user connects, all panels re-point to their firm. Stored in localStorage — keys never touch us.
 */

export const OWNER_ENGINE_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "https://agents-production-5a3d.up.railway.app";

const KEY = "hq_engine_url";

function norm(u: string): string {
  return u.trim().replace(/\/+$/, "");
}

/** The engine the dApp is currently reading — the user's saved URL, else the Owner showcase. */
export function getEngineUrl(): string {
  if (typeof window === "undefined") return OWNER_ENGINE_URL;
  try {
    const u = window.localStorage.getItem(KEY);
    return u && u.trim() ? norm(u) : OWNER_ENGINE_URL;
  } catch {
    return OWNER_ENGINE_URL;
  }
}

export function setEngineUrl(url: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, norm(url));
  } catch {
    /* ignore */
  }
}

export function clearEngineUrl(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** True when the dApp is reading the Owner showcase (no per-user engine connected). */
export function isOwnerEngine(): boolean {
  return getEngineUrl() === OWNER_ENGINE_URL;
}

/** Health-check an engine URL before connecting (hits /health). */
export async function pingEngine(url: string): Promise<boolean> {
  try {
    const r = await fetch(`${norm(url)}/health?cb=${Date.now()}`, { cache: "no-store" });
    return r.ok;
  } catch {
    return false;
  }
}
