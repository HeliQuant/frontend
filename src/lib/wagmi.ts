"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle } from "wagmi/chains";
import { defineChain } from "viem";

/**
 * Mantle Sepolia (chain id 5003) — defined locally rather than imported from wagmi/chains.
 *
 * wagmi's built-in `mantleSepoliaTestnet` is id 5003 with the right RPC, but its block explorer
 * points at `explorer.sepolia.mantle.xyz`. The whole app (heliquant.ts / contracts.ts / the
 * on-chain Ledger) links to MantleScan (`sepolia.mantlescan.xyz`), and RainbowKit derives its
 * "view on explorer" + account links from the chain's `blockExplorers`. Defining the chain here
 * keeps those links consistent with the rest of the product.
 */
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { decimals: 18, name: "Mantle", symbol: "MNT" },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "MantleScan", url: "https://sepolia.mantlescan.xyz" },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "HELIQUANT",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo-project-id",
  chains: [mantleSepolia, mantle],
  ssr: true,
});
