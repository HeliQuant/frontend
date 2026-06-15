"use client";

/**
 * LiveBadge — the proof-of-life chip (Night Garage). A chartreuse pulse dot + "LIVE · updated
 * HH:MM:SS", where the time is the moment of the LAST SUCCESSFUL client fetch (passed in as `at`).
 * This visually proves a page is live — it kills the "is this static?" doubt for judges.
 *
 * Honest by construction: if `at` is null the firm hasn't reached the feed this session, so the
 * dot goes dark (steel) and it reads "feed: never". If the last good read is stale (older than
 * `staleAfterMs`, default 90s) the dot turns signal-orange and it reads "stale" — never a green
 * light over a dead feed.
 */

import { useEffect, useState } from "react";

function hhmmss(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" });
}

export default function LiveBadge({
  at,
  staleAfterMs = 90_000,
  label = "LIVE",
}: {
  at: Date | number | null;
  staleAfterMs?: number;
  label?: string;
}) {
  // tick "now" into state once a second so freshness (live → stale) is evaluated against the
  // wall clock even between parent polls — without calling an impure clock during render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ts = at == null ? null : at instanceof Date ? at.getTime() : at;
  const stale = ts != null && now - ts > staleAfterMs;
  const live = ts != null && !stale;

  const dotCls = live
    ? "bg-chartreuse animate-pulse"
    : stale
      ? "bg-signal2"
      : "bg-steel";
  const textCls = live ? "text-chartreuse" : stale ? "text-signal2" : "text-steel";
  const text =
    ts == null
      ? "FEED · NEVER"
      : stale
        ? `STALE · ${hhmmss(new Date(ts))} UTC`
        : `${label} · UPDATED ${hhmmss(new Date(ts))} UTC`;

  return (
    <span
      className="inline-flex items-center gap-2 border border-bone/20 bg-pitch px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
      title={ts == null ? "no successful read this session" : `last good read ${new Date(ts).toISOString()}`}
    >
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${dotCls}`} />
      <span className={textCls}>{text}</span>
    </span>
  );
}
