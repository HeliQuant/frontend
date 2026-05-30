"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantle, mantleSepoliaTestnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "HELIQUANT",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo-project-id",
  chains: [mantleSepoliaTestnet, mantle],
  ssr: true,
});
