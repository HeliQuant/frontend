/**
 * HeliQuant on-chain product layer — addresses + minimal viem ABIs for the "hire the firm" flow.
 *
 * Verified live on Mantle Sepolia (chain id 5003) before wiring:
 *   • MockUSDC.decimals() = 6 (symbol mUSDC), public mint() faucet
 *   • MockWMNT.decimals() = 18 (symbol mWMNT)
 *   • JobManager + TradingVault bytecode present; getJob() reverts (JobNotFound) for ids that
 *     don't exist — so getJob / getJobBalance are only ever called for ids returned by
 *     jobsByClient(addr).
 *
 * ABIs are intentionally minimal (only the functions the dApp calls) and typed `as const` so
 * viem/wagmi infer exact argument + return types — no `any` anywhere downstream.
 */

import type { Address } from "viem";

// ───────────────────────────── chain / explorer ─────────────────────────────
export const CHAIN_ID = 5003 as const; // Mantle Sepolia
export const MANTLESCAN = "https://sepolia.mantlescan.xyz";

export function mantlescanTx(hash: string): string {
  return `${MANTLESCAN}/tx/${hash}`;
}
export function mantlescanAddress(addr: string): string {
  return `${MANTLESCAN}/address/${addr}`;
}

// ───────────────────────────── deployed addresses (Mantle Sepolia 5003) ─────────────────────────────
export const ADDRESSES = {
  jobManager: "0x10421Eb1A230F484eEdB64642505d073e791823c",
  tradingVault: "0x3BbD1f5e8733e901A8FdFf5cFA7E18e575896424",
  mockUSDC: "0x5E4A7bD88D955d45b61c6dBA0a22345e6DBb9934", // principal — 6 decimals, public mint faucet
  mockWMNT: "0x4E3095a8FfFE77B39E931BFd3569685B5401Beca", // base token traded against
} as const satisfies Record<string, Address>;

export const FIRM_TOKEN_ID = BigInt(1); // tokenId of the HeliQuant firm (ES2017 target → constructor, not 1n literal)
export const PRINCIPAL_DECIMALS = 6 as const; // MockUSDC
export const DEFAULT_PERF_FEE_BPS = 2000 as const; // 20%

/** Job lifecycle state enum (mirrors the contract's uint8: None=0, Active=1, Settled=2). */
export const JobState = { None: 0, Active: 1, Settled: 2 } as const;

/** Duration presets offered in the hire panel (seconds). 1h is the demo / smoke-test option. */
export const DURATION_PRESETS: { label: string; seconds: number }[] = [
  { label: "1 hour · demo", seconds: 3600 },
  { label: "1 day", seconds: 86_400 },
  { label: "7 days", seconds: 604_800 },
];

// ───────────────────────────── ABIs (minimal, `as const`) ─────────────────────────────
export const erc20Abi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const jobManagerAbi = [
  {
    type: "function",
    name: "createJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "firmTokenId", type: "uint256" },
      { name: "principalToken", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "baseToken", type: "address" },
      { name: "duration", type: "uint64" },
      { name: "perfFeeBps", type: "uint16" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "settleJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "jobsByClient",
    stateMutability: "view",
    inputs: [{ name: "client", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        name: "",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "firmTokenId", type: "uint256" },
          { name: "principalToken", type: "address" },
          { name: "principalAmount", type: "uint256" },
          { name: "baseToken", type: "address" },
          { name: "startTime", type: "uint64" },
          { name: "duration", type: "uint64" },
          { name: "perfFeeBps", type: "uint16" },
          { name: "state", type: "uint8" },
          { name: "finalPrincipalBalance", type: "uint256" },
          { name: "finalPnL", type: "int256" },
        ],
      },
    ],
  },
] as const;

export const tradingVaultAbi = [
  {
    type: "function",
    name: "getJobBalance",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        name: "",
        components: [
          { name: "principalToken", type: "address" },
          { name: "principalDeposit", type: "uint256" },
          { name: "principalBalance", type: "uint256" },
          { name: "baseToken", type: "address" },
          { name: "baseBalance", type: "uint256" },
          { name: "lastTradeAt", type: "uint64" },
          { name: "tradeCount", type: "uint256" },
        ],
      },
    ],
  },
] as const;

// ───────────────────────────── legacy exports (kept so the old jobs/new mockup compiles) ─────────────────────────────
export const DEPLOYED_CONTRACTS = {
  identityRegistry: "0x0fAE6342195fdc0007B94Fb3293bF56463C55ff3",
  reputationRegistry: "0x5A18F8D33D551666233701025754274dCA9B2929",
  validationRegistry: "0x8e55E41dc9a93E30aaf580DBA0B3Ee6B34e14a1B",
  alloraConsumer: "0x7A072465AC232709C114C5DAa842a9b7010D1d4f",
  tradingVault: ADDRESSES.tradingVault,
  jobManager: ADDRESSES.jobManager,
} as const;

export const MANTLESCAN_BASE = `${MANTLESCAN}/address`;
export const ALLORA_RELAY_TX = `${MANTLESCAN}/tx/0x0d7c09c945f74595a484b16f185db5c78d175eb286596a881bc78868a6c745b1`;
