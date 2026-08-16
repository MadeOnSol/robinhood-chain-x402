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

/**
 * Deployer reputation tier (elite → spammer). `elite`/`good` ride `runner_rate`
 * (the $100K peak-MC milestone) and require 24h of deployer history; `spammer`
 * keys off `graduation_rate` (the $40K bar). See `deployerLeaderboard()`.
 */
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
  /** Effective trading account — `tx.from`, or the ERC-4337 userOp sender when bundled. Never the router or the bundler. */
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

/** GET /rhc/deployer-hunter/alerts — tracked-deployer launch alerts (0.7.0). */
export interface DeployerAlertsParams {
  deployer_tier?: DeployerTier;
  priority?: "high" | "medium";
  alert_type?: "new_deploy" | "graduated";
  launchpad?: string;
  /** Minimum market cap at alert (USD). */
  min_mc?: number;
  /** Page size (1–500, default 50). */
  limit?: number;
  offset?: number;
  /** Include alerts whose token has < $500 liquidity (default false). */
  include_untradeable?: boolean;
  /** Only alerts newer than this ISO8601 time — the polling cursor (pass back next_since). */
  since?: string;
  /** Only alerts older than this ISO8601 time — backward pagination. */
  before?: string;
}
export interface DeployerAlert {
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  deployer_address: string;
  deployer_tier: DeployerTier | string;
  alert_type: string;
  priority: string;
  market_cap_usd: number | null;
  liquidity_usd: number | null;
  event_at: string;
  [key: string]: unknown;
}
export interface DeployerAlertsResponse {
  chain: "robinhood";
  alerts: DeployerAlert[];
  limit: number;
  offset: number;
  next_since?: string | null;
  [key: string]: unknown;
}

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
  /** elite/good = `runner_rate` ($100K) + 24h of history; spammer = $40K `graduation_rate`. */
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
  /** elite/good = `runner_rate` ($100K) + 24h of history; spammer = $40K `graduation_rate`. */
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

/* ── RHC rule engines: shared ── */

/**
 * Where a fired rule is delivered. `websocket` requires no `webhook_url`;
 * anything else does. A `webhook_secret` is minted (once) only when a webhook
 * URL is set — payloads are signed HMAC-SHA256 over `<timestamp>.<body>` in the
 * `X-MadeOnSol-Signature` header.
 */
export type DeliveryMode = "webhook" | "websocket" | "both";

/** Every rule-engine DELETE returns this. */
export interface RhcDeletedResponse {
  chain: Chain;
  deleted: boolean;
}

/* ── /rhc/copytrade/subscriptions ── */

/** Which side of the tape a copy-trade rule reacts to. */
export type CopyTradeOnlyAction = "buy" | "sell" | "both";

/** How the suggested size is derived from the source trade. */
export type CopyTradeSizingMode = "fixed" | "proportional" | "percent_source";

export interface RhcCopyTradeSubscription {
  /** Numeric identity PK. */
  id: number;
  name: string | null;
  /** Lowercase 0x wallets this rule follows (the API lowercases on write). */
  source_wallets: string[];
  /** Minimum source-trade size in ETH for the rule to fire. */
  min_trade_eth: number;
  only_action: CopyTradeOnlyAction;
  sizing_mode: CopyTradeSizingMode;
  /** ETH when `sizing_mode` is `fixed`, else a multiplier of the source trade. */
  sizing_amount: number;
  delivery_mode: DeliveryMode;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CopyTradeListResponse {
  chain: Chain;
  subscriptions: RhcCopyTradeSubscription[];
}

export interface CopyTradeCreateParams {
  name?: string;
  /** 1–250 EVM addresses (0x, 40 hex); the per-tier cap is enforced server-side. */
  source_wallets: string[];
  /** Default 0. */
  min_trade_eth?: number;
  /** Default `buy`. */
  only_action?: CopyTradeOnlyAction;
  /** Default `fixed`. */
  sizing_mode?: CopyTradeSizingMode;
  sizing_amount: number;
  /** Default `webhook`. */
  delivery_mode?: DeliveryMode;
  /** HTTPS only. Required unless `delivery_mode` is `websocket`. */
  webhook_url?: string;
}

export interface CopyTradeCreateResponse {
  chain: Chain;
  subscription: RhcCopyTradeSubscription;
  /** Shown ONCE — null when `delivery_mode` is `websocket`. */
  webhook_secret: string | null;
  note: string;
}

export interface CopyTradeGetResponse {
  chain: Chain;
  subscription: RhcCopyTradeSubscription;
}

export interface CopyTradeUpdateParams {
  /** `null` clears the label. */
  name?: string | null;
  source_wallets?: string[];
  min_trade_eth?: number;
  only_action?: CopyTradeOnlyAction;
  sizing_mode?: CopyTradeSizingMode;
  sizing_amount?: number;
  delivery_mode?: DeliveryMode;
  webhook_url?: string | null;
  is_active?: boolean;
}

/* ── /rhc/copytrade/signals ── */

export interface CopyTradeSignalsParams {
  /** Scope to one of your rules — 404 if you do not own it. */
  subscription_id?: number;
  /** ISO 8601 lower bound on `fired_at`. */
  since?: string;
  /** 1–500, default 50. */
  limit?: number;
}

export interface RhcCopyTradeSignal {
  id: number;
  subscription_id: number;
  fired_at: string;
  /** The followed wallet whose trade triggered the fire. */
  source_wallet: string;
  action: TradeAction;
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  /** Size of the source trade, ETH. */
  source_eth_amount: number | null;
  /** Size your rule's sizing_mode implies, ETH. */
  suggested_eth_amount: number | null;
  price_usd: number | null;
  dex: string | null;
  tx_hash: string;
  delivered: boolean;
  delivered_at: string | null;
}

export interface CopyTradeSignalsResponse {
  chain: Chain;
  signals: RhcCopyTradeSignal[];
  count: number;
}

/* ── /rhc/price-alerts ── */

/** Lifecycle of an alert. Terminal states are `recovered` and `expired`. */
export type PriceAlertStatus = "watching" | "dipped" | "recovered" | "expired";

export interface RhcPriceAlert {
  id: number;
  name: string | null;
  token_address: string;
  token_symbol: string | null;
  /** MC captured at creation — an alert is a delta from the moment you set it. */
  baseline_mc_usd: number;
  drop_pct: number;
  /** Null for a dip-only, terminal alert. */
  recovery_pct: number | null;
  status: PriceAlertStatus;
  /** Lowest MC seen since the dip fired. */
  dip_low_mc_usd: number | null;
  dip_fired_at: string | null;
  delivery_mode: DeliveryMode;
  webhook_url: string | null;
  is_active: boolean;
  /** Alerts self-expire 30 days after creation. */
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PriceAlertListResponse {
  chain: Chain;
  alerts: RhcPriceAlert[];
}

export interface PriceAlertCreateParams {
  name?: string;
  /** Must already be tracked on RHC with a market cap, else 400. */
  token_address: string;
  /** 0.01–99.99. */
  drop_pct: number;
  /** 0.01–1000. Omit for a dip-only, terminal alert. */
  recovery_pct?: number;
  /** Default `webhook`. */
  delivery_mode?: DeliveryMode;
  webhook_url?: string;
}

/**
 * How RHC alerts are evaluated. **Not parity with Solana**: these are polled off
 * `rhc_token_prices` rather than reacting to a live price loop, because the RHC
 * price writer emits no pg_notify. Effective latency is the poll interval plus
 * the token's own price-update cadence.
 */
export interface PriceAlertEvaluation {
  mode: "polled";
  interval_seconds: number;
  note: string;
}

export interface PriceAlertCreateResponse {
  chain: Chain;
  alert: RhcPriceAlert;
  /** Shown ONCE — null when `delivery_mode` is `websocket`. */
  webhook_secret: string | null;
  evaluation: PriceAlertEvaluation;
  note: string;
}

export interface PriceAlertGetResponse {
  chain: Chain;
  alert: RhcPriceAlert;
}

/**
 * `token_address`, `drop_pct` and `recovery_pct` are immutable — retuning a
 * threshold mid-flight would make the alert's recorded events uninterpretable.
 * Delete and recreate instead.
 */
export interface PriceAlertUpdateParams {
  name?: string | null;
  delivery_mode?: DeliveryMode;
  webhook_url?: string | null;
  is_active?: boolean;
}

/* ── /rhc/price-alerts/events ── */

export type PriceAlertEventType = "dip" | "recovery";

export interface PriceAlertEventsParams {
  /** Scope to one of your alerts — 404 if you do not own it. */
  alert_id?: number;
  event_type?: PriceAlertEventType;
  /** ISO 8601 lower bound on `fired_at`. */
  since?: string;
  /** 1–500, default 50. */
  limit?: number;
}

export interface RhcPriceAlertEvent {
  id: number;
  alert_id: number;
  event_type: PriceAlertEventType;
  fired_at: string;
  token_address: string;
  baseline_mc_usd: number;
  current_mc_usd: number;
  /** Measured drop at fire time, percent. */
  drop_pct_actual: number | null;
  dip_low_mc_usd: number | null;
  /** Measured bounce off the dip low, percent — recovery events only. */
  recovery_pct_actual: number | null;
  delivered: boolean;
  delivered_at: string | null;
}

export interface PriceAlertEventsResponse {
  chain: Chain;
  events: RhcPriceAlertEvent[];
  count: number;
}

/* ── /rhc/kol/coordination/alerts ── */

export interface RhcCoordinationAlertRule {
  /** UUID. */
  id: string;
  name: string | null;
  /** Distinct tracked KOL buyers needed to fire (2–50). */
  min_kols: number;
  /** Rolling window those buys must land inside (1–60). */
  window_minutes: number;
  min_score: number;
  /** Minutes before the same token can fire again (1–1440). */
  cooldown_min: number;
  /** Score jump that breaks the cooldown early (0–100). */
  score_jump_break: number;
  min_mc_usd: number | null;
  max_mc_usd: number | null;
  delivery_mode: DeliveryMode;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoordinationAlertListResponse {
  chain: Chain;
  rules: RhcCoordinationAlertRule[];
}

export interface CoordinationAlertCreateParams {
  name?: string;
  /** 2–50, default 3. */
  min_kols?: number;
  /** 1–60, default 15. */
  window_minutes?: number;
  /** 0–100, default 0. */
  min_score?: number;
  /** 1–1440, default 30. */
  cooldown_min?: number;
  /** 0–100, default 20. */
  score_jump_break?: number;
  min_mc_usd?: number | null;
  max_mc_usd?: number | null;
  /** Default `websocket`. */
  delivery_mode?: DeliveryMode;
  webhook_url?: string;
}

/**
 * Which scorer components are real on RHC. Scores are comparable to the Solana
 * coordination scorer, but `earliness` is defaulted (RHC has no early-entry
 * equivalent) while `quality` is a real KOL win-rate. Each fired signal records
 * the same breakdown in its `score_inputs`.
 */
export interface CoordinationAlertScoring {
  score_version: string;
  quality: string;
  earliness: string;
  note: string;
}

export interface CoordinationAlertCreateResponse {
  chain: Chain;
  rule: RhcCoordinationAlertRule;
  /** Shown ONCE — null when `delivery_mode` is `websocket`. */
  webhook_secret: string | null;
  scoring: CoordinationAlertScoring;
  note: string;
}

export interface CoordinationAlertGetResponse {
  chain: Chain;
  rule: RhcCoordinationAlertRule;
}

export interface CoordinationAlertUpdateParams {
  name?: string | null;
  min_kols?: number;
  window_minutes?: number;
  min_score?: number;
  cooldown_min?: number;
  score_jump_break?: number;
  min_mc_usd?: number | null;
  max_mc_usd?: number | null;
  delivery_mode?: DeliveryMode;
  webhook_url?: string | null;
  is_active?: boolean;
}

/* ── /rhc/kol/first-touches/subscriptions ── */

/** Auto-classified trader style of the first-touching KOL. */
export type FirstTouchStrategy = "scalper" | "day_trader" | "swing" | "inactive" | "unscored";

/**
 * Push filters. Deliberately NOT the Solana set: RHC has no scout score, so
 * `min_scout_tier` / `min_n_touches` are absent rather than silently matching
 * nothing. Unknown keys are rejected with a 400.
 */
export interface FirstTouchFilters {
  /** Only this KOL's first touches (0x, 40 hex). */
  kol?: string;
  /** Minimum first-buy size in ETH (0–100000). */
  min_first_buy_eth?: number;
  /** 0–1. Win-rate on CLOSED positions; a KOL who has never sold is dropped, not counted as a loser. */
  min_kol_winrate?: number;
  strategy?: FirstTouchStrategy;
  min_mc_usd?: number;
  max_mc_usd?: number;
}

export interface RhcFirstTouchSubscription {
  /** UUID. */
  id: string;
  name: string | null;
  filters: FirstTouchFilters;
  delivery_mode: DeliveryMode;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FirstTouchSubscriptionListResponse {
  chain: Chain;
  subscriptions: RhcFirstTouchSubscription[];
}

export interface FirstTouchSubscriptionCreateParams {
  name?: string;
  /** Default `{}` — every first touch. */
  filters?: FirstTouchFilters;
  /** Default `websocket`. */
  delivery_mode?: DeliveryMode;
  webhook_url?: string;
}

export interface FirstTouchSubscriptionCreateResponse {
  chain: Chain;
  subscription: RhcFirstTouchSubscription;
  /** Shown ONCE — null when `delivery_mode` is `websocket`. */
  webhook_secret: string | null;
  note: string;
}

export interface FirstTouchSubscriptionGetResponse {
  chain: Chain;
  subscription: RhcFirstTouchSubscription;
}

export interface FirstTouchSubscriptionUpdateParams {
  name?: string | null;
  /** Whole-object REPLACE, not a merge — merging would make removing a filter inexpressible. */
  filters?: FirstTouchFilters;
  delivery_mode?: DeliveryMode;
  webhook_url?: string | null;
  is_active?: boolean;
}

/* ── Wallet intelligence ──
 *
 * Every figure on these four endpoints is denominated in **ETH**, not SOL and
 * not USD — RHC settles in ETH. Cost basis is FIFO over a rolling 90-day
 * window, so "open" means FIFO-unmatched buys inside that window: a position
 * opened before it looks like a sell with no matching buy, which is what
 * `partial` / `cost_basis_observable_from` are there to disclose.
 */

export interface RhcWalletStats {
  first_seen: string | null;
  last_seen: string | null;
  total_trades: number;
  /** Trades with a resolvable trader + size — the denominator for every PnL figure. */
  analyzed_trades: number;
  /** Pre-2026-07-18 rows with a NULL `trader_eoa`; unattributable by design. */
  unattributed_trades: number;
  unsized_trades: number;
  buys: number;
  sells: number;
  bought_eth: number;
  sold_eth: number;
  realized_pnl_eth: number;
  unrealized_pnl_eth: number;
  total_pnl_eth: number;
  held_value_eth: number;
  unique_tokens: number;
  open_positions: number;
  window_days: number;
  /** `true` when the wallet hit the per-wallet trade cap and the numbers cover only part of the window. */
  partial: boolean;
}

export interface RhcWalletFlags {
  is_kol: boolean;
  kol_name: string | null;
  is_deployer: boolean;
  deployer_tier: DeployerTier | null;
  deployer_tokens: number | null;
  deployer_runner_rate: number | null;
  is_alpha_tracked: boolean;
  alpha_win_rate: number | null;
  alpha_net_eth: number | null;
  alpha_tokens_traded: number | null;
  likely_bot: boolean | null;
  is_dumper: boolean;
  dump_cluster: Record<string, unknown>;
  early_buyer_tokens: number;
}

export interface RhcWalletDerived {
  win_rate: number | null;
  wins: number;
  losses: number;
  avg_trade_size_eth: number | null;
  is_active: boolean;
}

export interface RhcWalletProfileResponse {
  chain: Chain;
  address: string;
  stats: RhcWalletStats;
  flags: RhcWalletFlags;
  top_tokens: Record<string, unknown>[];
  recent_trades: Record<string, unknown>[];
  derived: RhcWalletDerived;
  /** `true` when the snapshot could not be computed (timeout) — flags still resolve. */
  stats_unavailable: boolean;
  /** The wallet trio shares one snapshot cache; `true` means this call reused it. */
  cache_hit: boolean;
}

export type RhcPositionResult = "win" | "loss" | "breakeven";

export interface RhcWalletPnlSummary {
  realized_eth: number;
  unrealized_eth: number;
  total_pnl_eth: number;
  total_bought_eth: number;
  total_sold_eth: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  profit_factor: number | null;
  avg_hold_minutes: number | null;
  median_hold_minutes: number | null;
  max_drawdown_eth: number;
  open_positions_count: number;
  closed_positions_count: number;
  total_tokens_traded: number;
  best_realized: Record<string, unknown> | null;
  worst_realized: Record<string, unknown> | null;
}

export interface RhcPnlCurvePoint {
  date: string;
  day_pnl: number;
  cumulative_pnl: number;
  trades: number;
}

export interface RhcClosedPosition {
  token_address: string;
  token_symbol: string | null;
  buy_count: number;
  sell_count: number;
  bought_eth: number;
  sold_eth: number;
  pnl_eth: number;
  roi_pct: number | null;
  hold_minutes: number | null;
  result: RhcPositionResult;
  first_trade: string | null;
  last_trade: string | null;
}

export interface RhcWalletPnlNotes {
  denomination: "ETH";
  /** ISO date the FIFO window opens — buys before it are invisible to cost basis. */
  cost_basis_observable_from: string;
  data_through: string | null;
  trades_seen: number;
  trades_analyzed: number;
  trades_unattributed: number;
  trades_unsized: number;
  partial: boolean;
  partial_reason: string;
}

export interface RhcWalletPnlResponse {
  chain: Chain;
  address: string;
  window_days: number;
  summary: RhcWalletPnlSummary;
  pnl_curve: RhcPnlCurvePoint[];
  closed_positions: RhcClosedPosition[];
  open_positions: RhcOpenPosition[];
  notes: RhcWalletPnlNotes;
  cache_hit: boolean;
}

export interface RhcOpenPosition {
  token_address: string;
  token_symbol: string | null;
  token_name: string | null;
  launchpad: string | null;
  is_graduated: boolean | null;
  token_amount: number;
  cost_basis_eth: number;
  avg_entry_price_eth: number;
  current_price_eth: number | null;
  current_value_eth: number | null;
  unrealized_eth: number | null;
  unrealized_pct: number | null;
  current_mc_usd: number | null;
  liquidity_usd: number | null;
  /**
   * `v4_virtual_ceiling` = the pool is a v4 bonding curve, so `liquidity_usd` is
   * a virtual ceiling, NOT withdrawable TVL. Do not size an exit against it.
   */
  liquidity_basis: "v4_virtual_ceiling" | "measured";
  buys_in_position: number;
  realized_so_far_eth: number;
  first_buy_at: string | null;
  last_buy_at: string | null;
}

export interface RhcWalletPositionsSummary {
  open_positions: number;
  total_cost_basis_eth: number;
  total_current_value_eth: number;
  total_unrealized_eth: number;
  /** Positions with no current price — excluded from the value/unrealized totals. */
  unpriced_positions: number;
}

export interface RhcWalletPositionsResponse {
  chain: Chain;
  address: string;
  window_days: number;
  summary: RhcWalletPositionsSummary;
  positions: RhcOpenPosition[];
  notes: Record<string, unknown>;
}

export interface WalletTradesParams {
  /** 1–200, default 50. */
  limit?: number;
  /** Opaque keyset cursor — pass the previous response's `next_before`. */
  before?: string;
  /** ISO-8601 with offset. */
  since?: string;
  action?: TradeAction;
  /** Filter to one token address (0x, 40 hex). */
  token?: string;
}

export interface RhcWalletTrade {
  token_address: string | null;
  token_symbol: string | null;
  token_name: string | null;
  launchpad: string | null;
  action: TradeAction | null;
  eth_amount: number | null;
  token_amount: number | null;
  price_native: number | null;
  price_usd: number | null;
  mc_usd_at_trade: number | null;
  dex: string | null;
  pool: string | null;
  router: string | null;
  method_selector: string | null;
  tx_hash: string;
  log_index: number;
  block_number: number;
  block_time: string;
}

export interface RhcWalletTradesResponse {
  chain: Chain;
  address: string;
  trades: RhcWalletTrade[];
  count: number;
  has_more: boolean;
  /** Opaque cursor for the next page — `null` when the tape is exhausted. */
  next_before: string | null;
}

/* ── Wallet tracker (watchlist) ──
 *
 * Quotas are PER CHAIN: PRO 50 / ULTRA 100 / BUSINESS 500 RHC wallets,
 * independent of the Solana watchlist. Addresses are stored lowercase to match
 * `rhc_trades.trader_eoa` — a checksummed `0xAbC…` would join to nothing and
 * look like a permanently silent wallet.
 */

export interface RhcTrackedWallet {
  wallet_address: string;
  label: string | null;
  added_at: string;
}

export interface WalletTrackerWatchlistResponse {
  chain: Chain;
  wallets: RhcTrackedWallet[];
  count: number;
  /** Per-tier cap for this chain. */
  limit: number;
  remaining: number;
}

export interface WalletTrackerAddParams {
  wallet_address: string;
  label?: string;
}

export interface WalletTrackerWalletResponse {
  chain: Chain;
  wallet: RhcTrackedWallet;
}

export interface WalletTrackerRemovedResponse {
  chain: Chain;
  /** The lowercased address that was removed. */
  removed: string;
}

export interface WalletTrackerTradesParams {
  limit?: number;
  before?: string;
  /** Restrict to one tracked wallet — must already be on the watchlist. */
  wallet?: string;
  action?: TradeAction;
  token?: string;
}

export interface RhcTrackedWalletTrade extends RhcWalletTrade {
  /** Which tracked wallet made the trade. */
  trader_eoa: string | null;
  /** Your watchlist label for that wallet. */
  label: string | null;
}

export interface WalletTrackerTradesResponse {
  chain: Chain;
  trades: RhcTrackedWalletTrade[];
  count: number;
  has_more: boolean;
  next_before: string | null;
}

export interface WalletTrackerSummaryParams {
  /** Lookback window, default `7d`. */
  period?: string;
  /** Restrict the rollup to one tracked wallet. */
  wallet?: string;
}

export interface RhcTrackedWalletStats {
  trades: number;
  buys: number;
  sells: number;
  buy_eth: number;
  sell_eth: number;
  net_eth: number;
  tokens_traded: number;
  last_trade_at: string | null;
}

export interface RhcTrackedWalletSummary extends RhcTrackedWallet {
  stats: RhcTrackedWalletStats;
}

export interface WalletTrackerSummaryResponse {
  chain: Chain;
  period: string;
  interval: string;
  /** `true` when the rollup query timed out — `wallets[].stats` are zeroed, not absent. */
  stats_unavailable: boolean;
  wallets: RhcTrackedWalletSummary[];
}

/* ── Streaming ── */

export interface StreamToken {
  token: string;
  ws_url: string;
  /** Present on some tiers — the all-DEX firehose URL. */
  dex_ws_url?: string;
  expires_at?: string;
}
