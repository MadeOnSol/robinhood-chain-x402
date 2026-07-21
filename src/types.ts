/**
 * Type definitions for the MadeOnSol Robinhood Chain (chain id 4663) API.
 *
 * EVM-native throughout: token/wallet addresses are lowercase `0x` hex,
 * trade sizes are `eth_amount` / `*_eth`, on-chain refs are `tx_hash` +
 * `block_number`, and KOL positioning is denominated in `net_flow_eth`.
 * There are NO Solana field names here. Every field mirrors
 * GET /api/v1/rhc/… in the OpenAPI contract.
 */

/** Every RHC response echoes `chain: "robinhood"`. */
export type Chain = "robinhood";

/** Trade side. */
export type TradeAction = "buy" | "sell";

/** Deployer reputation tier (elite → spammer). */
export type DeployerTier = "elite" | "good" | "neutral" | "spammer";

/** Uniswap DEX versions live on Robinhood Chain. */
export type Dex = "uniswap-v2" | "uniswap-v3" | "uniswap-v4";

/** Standard API error envelope. */
export interface RhcError {
  error: string;
  _rid?: string;
}

/* ── /rhc/kol/feed ── */

export interface KolFeedParams {
  /** Page size (1–100, default 50). */
  limit?: number;
  /** Cursor: ISO timestamp; returns trades strictly older than this. */
  before?: string;
  /** Only buys or only sells. */
  action?: TradeAction;
  /** Filter to a single KOL by their EVM wallet (0x, 40 hex). */
  kol?: string;
  /** Minimum trade size in ETH. */
  min_eth?: number;
}

export interface RhcKolTrade {
  /** The KOL's Robinhood-Chain wallet (0x). */
  evm_address: string;
  kol_name: string | null;
  kol_twitter: string | null;
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  /** pons | flap | clanker | hood.fun | virtuals | null. */
  launchpad: string | null;
  is_graduated: boolean | null;
  deployer_tier: DeployerTier | null;
  token_age_minutes: number | null;
  action: TradeAction;
  /** Trade size in ETH. */
  eth_amount: number | null;
  token_amount: number | null;
  price_usd_at_trade: number | null;
  market_cap_usd_at_trade: number | null;
  current_mc_usd: number | null;
  peak_mc_usd: number | null;
  liquidity_usd: number | null;
  /** current_mc_usd ÷ market_cap_usd_at_trade — how far the token ran after the trade. */
  mc_multiple_since_trade: number | null;
  /** uniswap-v2/v3/v4 or the launchpad name for curve trades. */
  dex: string;
  pool: string | null;
  tx_hash: string;
  block_number: number;
  traded_at: string;
}

export interface KolFeedResponse {
  chain: Chain;
  trades: RhcKolTrade[];
  count: number;
  data_age_seconds: number | null;
  next_before: string | null;
}

/* ── /rhc/kol/leaderboard ── */

export type KolLeaderboardPeriod = "24h" | "7d" | "30d";

export interface KolLeaderboardParams {
  period?: KolLeaderboardPeriod;
  limit?: number;
}

export interface RhcKolLeaderboardEntry {
  kol_name: string | null;
  kol_twitter: string | null;
  trades: number;
  buys: number;
  sells: number;
  buy_eth: number;
  sell_eth: number;
  /** buy_eth − sell_eth (flow, not realized PnL). */
  net_eth: number;
  tokens_traded: number;
  last_trade_at: string;
}

export interface KolLeaderboardResponse {
  chain: Chain;
  period: KolLeaderboardPeriod;
  leaderboard: RhcKolLeaderboardEntry[];
  count: number;
}

/* ── /rhc/kol/hot-tokens ── */

export type KolHotTokensWindow = "5m" | "15m" | "1h" | "6h" | "24h";

export interface KolHotTokensParams {
  window?: KolHotTokensWindow;
}

export interface RhcHotToken {
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  launchpad: string | null;
  is_graduated: boolean | null;
  deployer_tier: string | null;
  /** Distinct KOL buyers in the window (>= 2). */
  kols_buying: number;
  buys: number;
  sells: number;
  buy_eth: number;
  net_eth: number;
  market_cap_usd: number | null;
  last_trade_at: string;
}

export interface KolHotTokensResponse {
  chain: Chain;
  window: KolHotTokensWindow;
  tokens: RhcHotToken[];
  count: number;
}

/* ── /rhc/kol/{wallet} ── */

export interface RhcKolProfileStats {
  trades: number;
  buys: number;
  sells: number;
  buy_eth: number;
  sell_eth: number;
  net_eth: number;
  tokens_traded: number;
  /** e.g. "last 200 trades". */
  window: string;
}

/** One of a KOL's 50 most recent trades (token, action, eth_amount, price/MC, dex, tx_hash, traded_at). */
export type RhcKolProfileTrade = Record<string, unknown>;

export interface RhcKolProfileResponse {
  chain: Chain;
  evm_address: string;
  kol_name: string | null;
  kol_twitter: string | null;
  stats: RhcKolProfileStats;
  trades: RhcKolProfileTrade[];
}

/* ── /rhc/trades ── */

export interface TradesParams {
  limit?: number;
  /** Filter to one token address (0x, 40 hex). */
  token?: string;
  dex?: Dex;
  action?: TradeAction;
  min_eth?: number;
  /** Cursor: trades strictly older than this block_time (ISO). */
  before?: string;
}

export interface RhcTrade {
  block_number: number;
  block_time: string;
  tx_hash: string;
  log_index: number;
  dex: string;
  pool: string;
  /** Swap-log recipient — the ROUTER for aggregated swaps. Use trader_eoa for analytics. */
  trader: string | null;
  /** Authoritative trader wallet (tx.from). */
  trader_eoa: string | null;
  /** Router/aggregator contract (tx.to). */
  router: string | null;
  token_address: string | null;
  action: TradeAction | null;
  eth_amount: number | null;
  price_native: number | null;
  price_usd: number | null;
  mc_usd_at_trade: number | null;
  /** Effective gas price, gwei. */
  gas_price: number | null;
  /** Transaction position within the block (ordering / sandwich detection). */
  tx_index: number | null;
  /** 4-byte calldata selector. */
  method_selector: string | null;
  /** v3/v4 in-range liquidity at the trade. */
  liquidity: number | null;
  launchpad: string | null;
  is_kol: boolean;
  kol_name: string | null;
  deployer_tier: DeployerTier | null;
}

export interface TradesResponse {
  chain: Chain;
  trades: RhcTrade[];
  count: number;
  next_before: string | null;
}

/* ── /rhc/tokens ── */

export type TokensSort = "last_trade" | "market_cap" | "liquidity" | "peak_mc";

export interface TokensParams {
  limit?: number;
  sort?: TokensSort;
  min_mc_usd?: number;
  min_liquidity_usd?: number;
  /** pons, flap, clanker, hood.fun, noxa, virtuals. */
  launchpad?: string;
}

export interface RhcTokenListItem {
  token_address: string;
  symbol: string | null;
  name: string | null;
  launchpad: string | null;
  is_graduated: boolean | null;
  deployer_address: string | null;
  deployer_tier: DeployerTier | null;
  price_usd: number | null;
  market_cap_usd: number | null;
  fdv_usd: number | null;
  peak_mc_usd: number | null;
  peak_mc_at: string | null;
  /** Percent below all-time-high MC. */
  drawdown_from_peak_pct: number | null;
  liquidity_usd: number | null;
  primary_dex: string | null;
  primary_pool: string | null;
  last_trade_time: string | null;
}

export interface TokensResponse {
  chain: Chain;
  tokens: RhcTokenListItem[];
  count: number;
  sort: string;
}

/* ── /rhc/tokens/{address} ── */

export interface RhcTokenDeployer {
  address: string;
  tier: DeployerTier;
  tokens_deployed: number;
  graduation_rate: number | null;
  runner_rate: number | null;
  runners: number;
  best_peak_mc_usd: number | null;
  launchpads: string[];
}

export interface RhcTokenKolActivity {
  distinct_kols: number;
  names: string[];
  buys: number;
  sells: number;
  net_eth: number;
}

export interface RhcTokenDetailResponse {
  chain: Chain;
  token_address: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  launchpad: string | null;
  is_graduated: boolean | null;
  graduated_pool: string | null;
  graduated_at: string | null;
  deployer_address: string | null;
  first_seen_at: string | null;
  token_age_minutes: number | null;
  price_usd: number | null;
  price_native: number | null;
  market_cap_usd: number | null;
  fdv_usd: number | null;
  peak_mc_usd: number | null;
  peak_mc_at: string | null;
  drawdown_from_peak_pct: number | null;
  total_supply_raw: string | null;
  liquidity_usd: number | null;
  primary_dex: string | null;
  primary_pool: string | null;
  last_trade_time: string | null;
  deployer: RhcTokenDeployer | null;
  /** Up to 10 other tokens by the same deployer (symbol or address). */
  deployer_other_tokens: string[];
  kol_activity: RhcTokenKolActivity;
  /** Up to 20 pools with reserves/liquidity/sqrt_price. */
  pools: Array<Record<string, unknown>>;
}

/* ── /rhc/tokens/{address}/candles ── */

export interface CandlesParams {
  /** Number of candles (1–1000, default 240). */
  limit?: number;
  /** Lower bound on bucket_start (ISO). */
  from?: string;
  /** Upper bound on bucket_start (ISO). */
  to?: string;
}

export interface RhcCandle {
  bucket_start: string;
  open_price_usd: number;
  high_price_usd: number;
  low_price_usd: number;
  close_price_usd: number;
  open_mc_usd: number | null;
  high_mc_usd: number | null;
  low_mc_usd: number | null;
  close_mc_usd: number | null;
  close_liquidity_usd: number | null;
  close_supply: number | null;
  volume_usd: number;
  volume_buy_usd: number | null;
  volume_sell_usd: number | null;
  trades: number;
  buy_count: number | null;
  sell_count: number | null;
  dex: string | null;
  pool_address: string | null;
}

export interface CandlesResponse {
  chain: Chain;
  token_address: string;
  timeframe: string;
  candles: RhcCandle[];
  count: number;
}

/* ── /rhc/tokens/{address}/kol-consensus ── */

export interface RhcKolConsensus {
  total_kol_buyers: number;
  total_kol_sellers: number;
  /** Fraction of KOL buyers who also sold (0–1). */
  kol_exit_rate: number;
  net_flow_eth: number;
  total_buy_eth: number;
  total_sell_eth: number;
  first_kol_buy_at: string | null;
  last_kol_buy_at: string | null;
  first_touch_wallet: string | null;
  first_touch_at: string | null;
  median_entry_mc_usd: number | null;
  entry_mc_samples: number;
  total_trades: number;
  /** ULTRA only — distinct KOL buyer wallets. */
  buyers?: string[];
  /** ULTRA only — KOL wallets that bought and sold. */
  exited?: string[];
}

export interface RhcKolConsensusResponse {
  chain: Chain;
  token_address: string;
  current_mc_usd: number | null;
  current_price_usd: number | null;
  consensus: RhcKolConsensus | null;
}

/* ── /rhc/tokens/{address}/buyer-quality ── */

export type BuyerQualityConfidence = "low" | "medium" | "high";
export type BuyerQualitySignal = "positive" | "neutral" | "negative";

export interface RhcBuyerQualityBreakdown {
  early_buyers_analyzed: number;
  alpha_wallet_count: number;
  kol_count: number;
  /** Early buyers flagged as part of a same-block launch bundle. */
  bundle_buyer_count: number;
  /** Early buyers on the rolling dump-cluster list. Informational — does not move the score. */
  dump_cluster_count: number;
  recycled_early_buyer_count: number;
  /** Percent (0–100), non-bot buyers with ≥3 tokens of history. */
  avg_historical_win_rate: number | null;
  bot_dominated: boolean;
}

export interface RhcBuyerQuality {
  score: number;
  confidence: BuyerQualityConfidence;
  signal: BuyerQualitySignal;
  breakdown: RhcBuyerQualityBreakdown;
}

export interface RhcBuyerQualityCoverage {
  bundle_detection: "available";
  dump_cluster_signal: "available";
  note?: string;
}

export interface RhcBuyerQualityResponse {
  chain: Chain;
  token_address: string;
  current_mc_usd: number | null;
  quality: RhcBuyerQuality;
  coverage: RhcBuyerQualityCoverage;
  /** Present only when buyer data is insufficient. */
  note?: string;
}

/* ── /rhc/tokens/{address}/bundle ── */

/** `same_block` = 3+ early buyers first-bought in one block; `none` = no cluster. `atomic_tx` does not exist on EVM. */
export type BundleKind = "same_block" | "none";

export interface RhcBundleSummary {
  wallet_count: number;
  bundle_kind: BundleKind;
  /** Net tokens still held ÷ tokens bought, [0,1]. The primary signal. */
  held_ratio: number | null;
  /** Net tokens held ÷ total supply, [0,1]; null when supply is unknown. */
  held_pct_of_supply: number | null;
  fully_exited: boolean;
  buy_volume: number;
  tokens_held: number;
}

export interface RhcBundleWallet {
  /** Early-buyer rank (1 = first buyer). */
  rank: number;
  wallet: string;
  held_ratio: number | null;
  has_sold: boolean;
  is_kol: boolean;
  /** ULTRA only — historical win-rate [0,1]. */
  win_rate?: number | null;
  /** ULTRA only — bot heuristic from mv_rhc_alpha_wallets. */
  likely_bot?: boolean;
  /** ULTRA only — net position, human-scaled. */
  tokens_held?: number;
}

export interface RhcBundleResponse {
  chain: Chain;
  token_address: string;
  bundle: RhcBundleSummary;
  /** Empty for BASIC; top-10 for PRO; full cohort for ULTRA. */
  wallets: RhcBundleWallet[];
}

/* ── /rhc/deployer-hunter/leaderboard ── */

export type DeployerLeaderboardSort =
  | "graduation_rate"
  | "runner_rate"
  | "tokens_deployed"
  | "best_peak_mc_usd"
  | "last_deploy_at";

export interface DeployerLeaderboardParams {
  sort?: DeployerLeaderboardSort;
  tier?: DeployerTier;
  /** Minimum tokens deployed (default 3). */
  min_tokens?: number;
  /** Page size (1–50, default 20). */
  limit?: number;
  /** Pagination offset (0–10000). */
  offset?: number;
}

export interface RhcDeployer {
  deployer_address: string;
  tokens_deployed: number;
  /** Tokens that reached a $40K+ peak MC (the graduation milestone). */
  graduated: number;
  /** graduated ÷ tokens_deployed. */
  graduation_rate: number;
  /** Tokens that peaked ≥ $100K MC. */
  runners: number;
  /** runners ÷ tokens_deployed. */
  runner_rate: number;
  best_peak_mc_usd: number | null;
  launchpads: string[];
  first_deploy_at: string | null;
  last_deploy_at: string | null;
  tier: DeployerTier;
}

export interface DeployerLeaderboardResponse {
  chain: Chain;
  deployers: RhcDeployer[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/* ── /rhc/deployer-hunter/{address} ── */

export interface RhcDeployerProfile {
  deployer_address: string;
  tokens_deployed: number;
  curve_tokens: number;
  graduated: number;
  bonding_rate: number | null;
  runners: number;
  runner_rate: number;
  best_peak_mc_usd: number | null;
  launchpads: string[];
  first_deploy_at: string | null;
  last_deploy_at: string | null;
  tier: DeployerTier;
}

export interface RhcDeployerRecentToken {
  address: string;
  symbol: string | null;
  name: string | null;
  launchpad: string | null;
  is_graduated: boolean | null;
  graduated_at: string | null;
  graduated_pool: string | null;
  first_seen_at: string | null;
  market_cap_usd: number | null;
  peak_mc_usd: number | null;
  peak_mc_at: string | null;
}

export interface RhcDeployerProfileResponse {
  chain: Chain;
  /** False if this wallet has never deployed a tracked token (deployer is then null). */
  is_deployer: boolean;
  address: string;
  deployer: RhcDeployerProfile | null;
  recent_tokens: RhcDeployerRecentToken[];
  /** Rows returned (capped at 50) — the true total is deployer.tokens_deployed. */
  recent_tokens_count: number;
}

/* ── /rhc/alpha-wallets ── */

export type AlphaClassificationFilter = "all" | "human" | "bot" | "smart_money";
export type AlphaIdentityFilter = "all" | "known_kol" | "unknown";
export type AlphaSort =
  | "net_eth"
  | "win_rate"
  | "trades"
  | "tokens"
  | "buy_eth"
  | "memecoin_share"
  | "last_trade_at";
export type AlphaOrder = "desc" | "asc";
/** Per-wallet classification returned in the response. */
export type AlphaWalletClassification = "bot" | "smart_money" | "trader";

export interface AlphaWalletsParams {
  classification?: AlphaClassificationFilter;
  identity?: AlphaIdentityFilter;
  /** Minimum share of trades in launchpad memecoins (0–1). */
  min_memecoin_share?: number;
  /** Maximum average market cap traded — filter to low-cap degens. */
  max_avg_mc_usd?: number;
  min_net_eth?: number;
  min_win_rate?: number;
  max_win_rate?: number;
  min_trades?: number;
  min_tokens?: number;
  /** Minimum ETH deployed (whale/size filter). */
  min_buy_eth?: number;
  /** Only wallets that traded within the last N hours (1–720). */
  active_hours?: number;
  sort?: AlphaSort;
  order?: AlphaOrder;
  /** Page size (1–100, default 25). */
  limit?: number;
  offset?: number;
}

export interface RhcAlphaWallet {
  /** Trader EOA (lowercase 0x). */
  wallet: string;
  classification: AlphaWalletClassification;
  is_known_kol: boolean;
  trades: number;
  tokens: number;
  buy_eth: number;
  sell_eth: number;
  /** Realized net flow (sell − buy). */
  net_eth: number;
  win_rate: number | null;
  /** Share of trades in launchpad memecoins (vs tokenized stocks/stables). */
  memecoin_share: number | null;
  avg_trade_mc_usd: number | null;
  last_trade_at: string | null;
}

export interface AlphaWalletsResponse {
  chain: Chain;
  wallets: RhcAlphaWallet[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/* ── Streaming ── */

export interface StreamToken {
  token: string;
  ws_url: string;
  /** Present on some tiers — the all-DEX firehose URL. */
  dex_ws_url?: string;
  expires_at?: string;
}
