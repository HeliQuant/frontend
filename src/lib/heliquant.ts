/**
 * HeliQuant data layer — types + verified static content + the live decisions feed.
 * Every number here traces to a real run/probe (honesty-by-design). Sections import from here.
 */

// ───────────────────────────── types (mirror Supabase decisions_hq) ─────────────────────────────
export type TakeProfit = { label: string; price: number; rr: number; close_pct: number; basis?: string };

export type TradeTicket = {
  direction: "LONG" | "SHORT";
  conviction: string;
  entry: number;
  entry_range: [number, number];
  invalidation: number;
  stop_loss: number;
  stop_distance_atr: number;
  stop_basis: string;
  take_profit: TakeProfit[];
  mode: "SAFE" | "AGGRESSIVE" | string;
  risk_pct: number;
  effective_risk_pct?: number;
  notional_usd: number;
  position_size_pct: number;
  leverage: number;
  kelly_fraction_star?: number | null;
};

export type Decision = {
  id: number;
  ts: string;
  ticker: string;
  regime: string | null;
  decision: "ENTER" | "ABSTAIN" | string;
  direction: "LONG" | "SHORT" | "NONE" | string;
  confidence: string | null;
  entry: number | null;
  stop_loss: number | null;
  tp1: number | null;
  reasoning: string | null;
  ticket_json: TradeTicket | null;
  status: "open" | "resolved" | "abstain" | string;
  outcome: "TP" | "SL" | "TIMEOUT" | null;
  pnl_pct: number | null;
  exit_price: number | null;
  resolved_ts: string | null;
  created_at?: string;
  tx_hash?: string | null; // on-chain anchor (added later)
};

export type Finding = { n: number; theme: string; title: string; body: string; isNew?: boolean; tone?: "win" | "honest" | "neutral" };
export type Asset = { sym: string; name: string; tier: "mantle-eco" | "macro"; mode: "CONTRACT" | "POSITIONING"; edge: "validated" | "monitored" | "context" };
export type Contract = { name: string; address: string };

// ───────────────────────────── on-chain (Mantle Sepolia, chain 5003) ─────────────────────────────
export const MANTLESCAN = "https://sepolia.mantlescan.xyz";
export const CHAIN_ID = 5003;

export const CONTRACTS: Contract[] = [
  { name: "IdentityRegistry", address: "0x0fAE6342195fdc0007B94Fb3293bF56463C55ff3" },
  { name: "ReputationRegistry", address: "0x5A18F8D33D551666233701025754274dCA9B2929" },
  { name: "ValidationRegistry", address: "0x8e55E41dc9a93E30aaf580DBA0B3Ee6B34e14a1B" },
  { name: "AlloraConsumer", address: "0x7A072465AC232709C114C5DAa842a9b7010D1d4f" },
  { name: "TradingVault", address: "0x3BbD1f5e8733e901A8FdFf5cFA7E18e575896424" },
  { name: "JobManager", address: "0x10421Eb1A230F484eEdB64642505d073e791823c" },
];

/** First live decision anchored on-chain (verified). */
export const FIRST_ANCHOR = {
  txHash: "0xa052ee03dca16bbac3b69285e062d6b18349c9809b99e5b186d4f2e91de69b53",
  block: 39402623,
  ticker: "MNT",
  decision: "ABSTAIN",
  recordHash: "0x792b7941c3a1be5e0e162503a254104545fa16297ee6d74996c9626a98684660",
};

// ───────────────────────────── the ONE validated edge ─────────────────────────────
export const EDGE = {
  name: "OI-Contrarian",
  asset: "MNT",
  pWin: 0.588,
  payoff: 1.3,
  trades: 34,
  oosRoiPct: 28.9,
  caveat: "Hedge-like, bear-amplified, small-sample (n=34), inconsistent fold-to-fold — fractional-Kelly sized, never a guarantee.",
  method: "Fade perp OI 24h-change extremes (top quintile → SHORT, bottom → LONG); the one edge surviving cost-aware OOS.",
};

// ───────────────────────────── trading universe (2-tier) ─────────────────────────────
export const UNIVERSE: Asset[] = [
  { sym: "MNT", name: "Mantle", tier: "mantle-eco", mode: "CONTRACT", edge: "validated" },
  { sym: "mETH", name: "Mantle Staked ETH", tier: "mantle-eco", mode: "CONTRACT", edge: "monitored" },
  { sym: "cmETH", name: "Compounding mETH", tier: "mantle-eco", mode: "CONTRACT", edge: "monitored" },
  { sym: "fBTC", name: "Mantle BTC", tier: "mantle-eco", mode: "CONTRACT", edge: "monitored" },
  { sym: "USDe", name: "Ethena USD", tier: "mantle-eco", mode: "CONTRACT", edge: "monitored" },
  { sym: "BTC", name: "Bitcoin", tier: "macro", mode: "POSITIONING", edge: "context" },
  { sym: "ETH", name: "Ethereum", tier: "macro", mode: "POSITIONING", edge: "context" },
  { sym: "SOL", name: "Solana", tier: "macro", mode: "POSITIONING", edge: "context" },
];

// ───────────────────────────── the 7 desks ─────────────────────────────
export const DESKS = [
  { key: "Regime/Technical", blurb: "ML regime classifier (82.6% OOS) + trend strength + dynamic R:R" },
  { key: "Macro (Allora)", blurb: "decentralised-AI macro — Allora BTC/ETH 8h price prediction on Mantle" },
  { key: "On-chain/Risk", blurb: "whale flow + watchlist health + GoPlus token-safety veto" },
  { key: "Research", blurb: "external macro — Fear&Greed + global market via public APIs" },
  { key: "Smart-Money Flow", blurb: "dynamic whale/contract flow + Nansen macro smart-money netflow" },
  { key: "Smart-Social", blurb: "narrative/mindshare via Elfa (smart accounts, not retail)" },
  { key: "OI-Contrarian", blurb: "the ONE OOS-validated edge — fade perp OI extremes; the exception to abstain" },
];

// ───────────────────────────── 15 honest findings ─────────────────────────────
export const FINDINGS: Finding[] = [
  { n: 1, theme: "Smart Money", title: "Mantle's smart money is genuinely sparse", body: "Confirmed across Etherscan, Cielo, CoinAlyze AND Nansen: ~1–2 active smart-money traders on core assets. Not a data gap — the activity isn't there. So we don't fake whale-following." },
  { n: 2, theme: "Smart Money", title: "Dynamic whale-vs-contract", body: "Who holds a token decides the signal. EOA-rich (BTC/ETH) → track whales/positioning. Contract-heavy (Mantle LSTs) → track contract flows. We auto-select per asset via on-chain holder composition." },
  { n: 3, theme: "Smart Money", title: "Aggregate or lose", body: "~80% of flow routes through private mempools; ghost-deposits + wallet-splitting are standard. Single-wallet alerts are gameable — we use manipulation-robust cohort flow." },
  { n: 4, theme: "Smart Money", title: "mETH staking = the real conviction signal", body: "~$118M of ETH locked in mETH staking — a hard-to-fake on-chain conviction metric worth tracking, unlike a single '$50k to Binance' alert." },
  { n: 5, theme: "Alpha", title: "Accuracy ≠ Profit", body: "Our regime classifier reads regime at 82–88% OOS accuracy — yet trading it did not profit in sim. Accuracy isn't money-weighted profit; the engine's job is capital allocation, not prediction." },
  { n: 6, theme: "Alpha", title: "No magic price-TA alpha", body: "Trend-following and mean-reversion both fail rigorous walk-forward OOS. Eye-catching single-window returns were artifacts that died on full history. Every strategy must survive unseen data." },
  { n: 7, theme: "Alpha", title: "The one real edge: OI-Contrarian", body: "Open-interest build-up mean-reverts. Positioning contrarian to it returned +47–64% aggregate OOS while the market fell ~60% — hedge-like. Caveat: bear-amplified, inconsistent fold-to-fold." },
  { n: 8, theme: "Alpha", title: "Funding-capture doesn't work here", body: "Funding rates are too small and flip sign too often — fees eat the carry (a naive version lost 30–39%). Tested, measured, rejected." },
  { n: 11, theme: "Alpha", title: "Validated + deployable — on MNT specifically", body: "Per-asset, only MNT clears the cost-aware OOS bar: 58.8% win, 1.30 payoff, 34 trades, +28.9% OOS. The single entry in our validated-edge registry, and the only signal allowed to size up.", isNew: true, tone: "win" },
  { n: 12, theme: "Execution", title: "A trade is a hypothesis with an invalidation — gated", body: "Each decision → structured ticket: entry zone, structural stop, separate invalidation, TP-ladder. A hard R:R ≥ 2:1 gate rejects setups that don't pay — even a validated edge abstains when structure is poor.", isNew: true },
  { n: 13, theme: "Execution", title: "Aggression earned by data", body: "Not a tiny-bet toy, not a YOLO bot. SAFE by default; AGGRESSIVE (fractional-Kelly, ≤3% risk / ≤5× leverage, 20% drawdown breaker) ONLY when an OOS-validated edge's live signal fires and agrees.", isNew: true },
  { n: 14, theme: "Execution", title: "Verifiable on Mantle — the decision ledger on-chain", body: "Each decision's hash is anchored in a live Mantle tx (broadcast-on-ENTER; abstentions stay gas-frugal). On-chain = tamper-proof audit trail; portfolio state lives off-chain.", isNew: true, tone: "neutral" },
  { n: 9, theme: "Method", title: "Honesty-by-design", body: "Deterministic tools compute the numbers; LLM agents debate and decide; the system rejects any strategy that doesn't survive OOS. We never publish a return we can't reproduce — we even retracted our own headline numbers." },
  { n: 10, theme: "Method", title: "A firm of seven AI agents — recorded on Mantle", body: "Seven real-source desks debate bull-vs-bear, then a PM synthesizes a disciplined decision whose hash is anchored on-chain. ERC-8004 identity + TradingVault deployed on Mantle Sepolia. When no edge applies, it abstains." },
  { n: 15, theme: "Method", title: "We rejected our own +96% backtest", body: "An mETH/ETH convergence strategy looked spectacular — +96% OOS, 95.6% win — but it needs to trade thin mETH on both legs. Under realistic slippage it turns to −73 bps/trade: a thin-liquidity artifact, not alpha. We threw it out.", isNew: true, tone: "honest" },
  { n: 16, theme: "Execution", title: "Edge fired — the firm still held (proven live)", body: "In a live multi-desk run, the OI-Contrarian validated edge fired an actionable LONG on MNT (58.8% win, +28.9% OOS) — yet the PM ABSTAINED: the R:R ≥ 2 gate couldn't clear and the macro read Extreme Fear with bearish on-chain flow. A tradeable buy signal, declined on structure. Discipline isn't a slogan — it's what the firm did with a live edge in hand.", isNew: true, tone: "honest" },
  { n: 17, theme: "Alpha", title: "Hunted four more assets — earned none", body: "Real-data, cost-aware OOS validation on BTC, ETH, mETH, HYPE: none cleared the bar. BTC's OI edge is fee-eaten; ETH/SOL flip to momentum and lose; mETH has no liquid perp; HYPE's open-interest moves WITH price (momentum, not contrarian) and underperforms buy-and-hold. MNT stays the single validated edge — we trade only what we can prove.", isNew: true, tone: "honest" },
  { n: 18, theme: "Execution", title: "AGGRESSIVE is earned, not granted — proven as a truth-table", body: "High-conviction sizing (fractional-Kelly, ≤3% risk / ≤5× lev, 20% DD-breaker) unlocks if-and-only-if the asset has an OOS-validated edge (≥20 trades) AND the account isn't past 20% drawdown. Proven live on MNT: validated+healthy → AGGRESSIVE; n=12 → SAFE; −22% DD → breaker forces SAFE; no edge → SAFE. The dial is risk %, not leverage.", isNew: true, tone: "win" },
  { n: 19, theme: "Execution", title: "39% win rate, still +24% OOS — payoff over hit-rate", body: "Funded $1,000, trading the validated edge out-of-sample with live AGGRESSIVE sizing: won only 13 of 33 (39.4%) yet finished $1,243.81 (+24.4%, −11.5% max DD), net of fees on real Bybit data. Profit from payoff asymmetry, not hit-rate. An honest edge needs positive expectancy, not frequent wins.", isNew: true, tone: "honest" },
  { n: 20, theme: "Method", title: "An onboarding lab that held back a +92% candidate", body: "New assets earn their place via a hypothesis library (OI, price-momentum, funding, order-flow) under one gate: cost-aware OOS + 5-fold walk-forward + drop-the-best-fold robustness. 6 assets × 4 hypotheses = 24 tests; only MNT clears it robustly (4/5 folds, +28.9%). HYPE order-flow flashed +92% OOS but ~65% came from one fold (drop it → +1.9%), so we held it back. The registry grows only when an edge is earned across folds — the self-learning loop's honest spine.", isNew: true, tone: "honest" },
];

// Live decisions feed lives in ./supabase (fetchDecisions) to keep this module server-safe.
