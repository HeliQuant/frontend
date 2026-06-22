"use client";

/**
 * BitgetConsole — the EXECUTION VENUE banner. Makes HeliQuant's Bitget integration unmissable: a live
 * teal strip showing the real Bitget testnet saldo + fill count when execution is armed, or an honest
 * "paper — standby" state otherwise. Teal (--color-bitget) is reserved for Bitget-venue UI across the
 * dApp; the firm's own chartreuse accent stays untouched, so the venue reads as a distinct integration.
 */

import Image from "next/image";

import type { CampaignStatus } from "@/lib/campaign";

const usd0 = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

function Cell({ label, value, sub, accent, small }: { label: string; value: string; sub: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="bg-carbon p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-steel">{label}</p>
      <p className={`mt-1 font-display ${small ? "text-lg" : "text-3xl"} font-extrabold leading-none ${accent ? "text-bitget" : "text-bone"}`}>
        {value}
      </p>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-steel">{sub}</p>
    </div>
  );
}

export default function BitgetConsole({ data }: { data: CampaignStatus | null }) {
  const bg = data?.capital?.bitget_saldo ?? null;
  const fills = data?.testnet_fills ?? 0;
  const armed = !!bg;

  return (
    <div className={`mt-8 border-2 bg-carbon ${armed ? "border-bitget/60" : "border-bone/20"}`} style={armed ? { boxShadow: "5px 5px 0 rgba(28,229,207,0.28)" } : undefined}>
      {/* header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-bone/15 px-5 py-2.5">
        <p
          className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide"
          style={{ color: armed ? "var(--color-bitget)" : "rgba(242,239,230,0.45)" }}
        >
          <Image src="/brand/bitget.jpg" alt="Bitget" width={18} height={18} className="shrink-0" />
          <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-full ${armed ? "bg-bitget animate-pulse" : "bg-steel"}`} />
          {armed ? "Executing live · Bitget testnet" : "Bitget testnet · standby"}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-steel">
          {armed ? "real demo fills · no real funds · SUSDT-FUTURES perp" : "arm BITGET_EXECUTE to fill live"}
        </p>
      </div>

      {armed ? (
        <div className="grid grid-cols-2 gap-px bg-bone/10 sm:grid-cols-4">
          <Cell label="balance" value={usd0(bg!.equity_usd)} sub="demo equity" accent />
          <Cell label="available" value={usd0(bg!.available_usd)} sub="margin free" />
          <Cell label="testnet fills" value={String(fills)} sub="real orders placed" accent />
          <Cell label="venue perps (demo)" value="SBTC · SETH · SXRP" sub="SUSDT-FUTURES" small />
        </div>
      ) : (
        <div className="px-5 py-6">
          <p className="font-display text-xl font-extrabold uppercase text-bone/45">paper — not armed</p>
          <p className="mt-1.5 max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-steel">
            the floor trades on paper at live prices. Set <span className="text-bitget">BITGET_EXECUTE=1</span> + Bitget
            demo keys on the engine and every BTC/ETH/XRP open becomes a real fill on the Bitget testnet.
          </p>
        </div>
      )}
    </div>
  );
}
