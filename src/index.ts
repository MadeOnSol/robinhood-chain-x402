/**
 * robinhood-chain-x402 — TypeScript client for the MadeOnSol Robinhood Chain
 * (chain id 4663) API.
 *
 * Robinhood Chain is an Arbitrum Orbit L2. This package is **key-mode only**:
 * it authenticates with an `msk_` Bearer API key against the Robinhood Chain
 * (/api/v1/rhc/…) endpoints. The x402 pay-per-call rail is live on Robinhood Chain too (6 keyless endpoints), but its signing path is NOT ported here
 * — see the Solana `madeonsol-x402` package for on-chain USDC micropayments.
 *
 * Get a free API key (200 req/day, no card) at https://madeonsol.com/pricing —
 * RHC coverage is bundled into every tier at no extra cost.
 */
import type {
  KolFeedParams,
  KolFeedResponse,
  KolLeaderboardParams,
  KolLeaderboardResponse,
  KolHotTokensParams,
  KolHotTokensResponse,
  RhcKolProfileResponse,
  TradesParams,
  TradesResponse,
  TokensParams,
  TokensResponse,
  RhcTokenDetailResponse,
  CandlesParams,
  CandlesResponse,
  RhcKolConsensusResponse,
  RhcBuyerQualityResponse,
  RhcBundleResponse,
  DeployerLeaderboardParams,
  DeployerLeaderboardResponse,
  RhcDeployerProfileResponse,
  AlphaWalletsParams,
  AlphaWalletsResponse,
  RhcDeletedResponse,
  CopyTradeListResponse,
  CopyTradeCreateParams,
  CopyTradeCreateResponse,
  CopyTradeGetResponse,
  CopyTradeUpdateParams,
  CopyTradeSignalsParams,
  CopyTradeSignalsResponse,
  PriceAlertListResponse,
  PriceAlertCreateParams,
  PriceAlertCreateResponse,
  PriceAlertGetResponse,
  PriceAlertUpdateParams,
  PriceAlertEventsParams,
  PriceAlertEventsResponse,
  CoordinationAlertListResponse,
  CoordinationAlertCreateParams,
  CoordinationAlertCreateResponse,
  CoordinationAlertGetResponse,
  CoordinationAlertUpdateParams,
  FirstTouchSubscriptionListResponse,
  FirstTouchSubscriptionCreateParams,
  FirstTouchSubscriptionCreateResponse,
  FirstTouchSubscriptionGetResponse,
  FirstTouchSubscriptionUpdateParams,
  RhcWalletProfileResponse,
  RhcWalletPnlResponse,
  RhcWalletPositionsResponse,
  WalletTradesParams,
  RhcWalletTradesResponse,
  WalletTrackerWatchlistResponse,
  WalletTrackerAddParams,
  WalletTrackerWalletResponse,
  WalletTrackerRemovedResponse,
  WalletTrackerTradesParams,
  WalletTrackerTradesResponse,
  WalletTrackerSummaryParams,
  WalletTrackerSummaryResponse,
  StreamToken,
} from "./types.js";

import { RobinhoodChainStream } from "./stream.js";
import type { StreamClientOptions } from "./stream.js";
import { VERSION } from "./version.js";

export { RobinhoodChainStream } from "./stream.js";
export type {
  StreamClientOptions,
  StreamChannel,
  StreamEventName,
  StreamEvent,
  StreamLifecycleEvent,
  StreamWarning,
} from "./stream.js";

export type {
  Chain,
  TradeAction,
  DeployerTier,
  Dex,
  RhcError,
  KolFeedParams,
  RhcKolTrade,
  KolFeedResponse,
  KolLeaderboardPeriod,
  KolLeaderboardParams,
  RhcKolLeaderboardEntry,
  KolLeaderboardResponse,
  KolHotTokensWindow,
  KolHotTokensParams,
  RhcHotToken,
  KolHotTokensResponse,
  RhcKolProfileStats,
  RhcKolProfileTrade,
  RhcKolProfileResponse,
  TradesParams,
  RhcTrade,
  TradesResponse,
  TokensSort,
  TokensParams,
  RhcTokenListItem,
  TokensResponse,
  RhcTokenDeployer,
  RhcTokenKolActivity,
  RhcTokenDetailResponse,
  CandlesParams,
  RhcCandle,
  CandlesResponse,
  RhcKolConsensus,
  RhcKolConsensusResponse,
  BuyerQualityConfidence,
  BuyerQualitySignal,
  RhcBuyerQualityBreakdown,
  RhcBuyerQuality,
  RhcBuyerQualityCoverage,
  RhcBuyerQualityResponse,
  BundleKind,
  RhcBundleSummary,
  RhcBundleWallet,
  RhcBundleResponse,
  DeployerLeaderboardSort,
  DeployerLeaderboardParams,
  RhcDeployer,
  DeployerLeaderboardResponse,
  RhcDeployerProfile,
  RhcDeployerRecentToken,
  RhcDeployerProfileResponse,
  AlphaClassificationFilter,
  AlphaIdentityFilter,
  AlphaSort,
  AlphaOrder,
  AlphaWalletClassification,
  AlphaWalletsParams,
  RhcAlphaWallet,
  AlphaWalletsResponse,
  DeliveryMode,
  RhcDeletedResponse,
  CopyTradeOnlyAction,
  CopyTradeSizingMode,
  RhcCopyTradeSubscription,
  CopyTradeListResponse,
  CopyTradeCreateParams,
  CopyTradeCreateResponse,
  CopyTradeGetResponse,
  CopyTradeUpdateParams,
  CopyTradeSignalsParams,
  RhcCopyTradeSignal,
  CopyTradeSignalsResponse,
  PriceAlertStatus,
  RhcPriceAlert,
  PriceAlertListResponse,
  PriceAlertCreateParams,
  PriceAlertEvaluation,
  PriceAlertCreateResponse,
  PriceAlertGetResponse,
  PriceAlertUpdateParams,
  PriceAlertEventType,
  PriceAlertEventsParams,
  RhcPriceAlertEvent,
  PriceAlertEventsResponse,
  RhcCoordinationAlertRule,
  CoordinationAlertListResponse,
  CoordinationAlertCreateParams,
  CoordinationAlertScoring,
  CoordinationAlertCreateResponse,
  CoordinationAlertGetResponse,
  CoordinationAlertUpdateParams,
  FirstTouchStrategy,
  FirstTouchFilters,
  RhcFirstTouchSubscription,
  FirstTouchSubscriptionListResponse,
  FirstTouchSubscriptionCreateParams,
  FirstTouchSubscriptionCreateResponse,
  FirstTouchSubscriptionGetResponse,
  FirstTouchSubscriptionUpdateParams,
  RhcWalletStats,
  RhcWalletFlags,
  RhcWalletDerived,
  RhcWalletProfileResponse,
  RhcPositionResult,
  RhcWalletPnlSummary,
  RhcPnlCurvePoint,
  RhcClosedPosition,
  RhcOpenPosition,
  RhcWalletPnlNotes,
  RhcWalletPnlResponse,
  RhcWalletPositionsSummary,
  RhcWalletPositionsResponse,
  WalletTradesParams,
  RhcWalletTrade,
  RhcWalletTradesResponse,
  RhcTrackedWallet,
  WalletTrackerWatchlistResponse,
  WalletTrackerAddParams,
  WalletTrackerWalletResponse,
  WalletTrackerRemovedResponse,
  WalletTrackerTradesParams,
  RhcTrackedWalletTrade,
  WalletTrackerTradesResponse,
  WalletTrackerSummaryParams,
  RhcTrackedWalletStats,
  RhcTrackedWalletSummary,
  WalletTrackerSummaryResponse,
  StreamToken,
} from "./types.js";

const DEFAULT_BASE_URL = "https://madeonsol.com";

type QueryValue = string | number | boolean | undefined;

export interface RobinhoodChainOptions {
  /** MadeOnSol API key (`msk_...`) — get one free at https://madeonsol.com/pricing. */
  apiKey: string;
  /** API base URL (default: https://madeonsol.com). */
  baseUrl?: string;
}

/** Rate-limit headers exposed alongside every successful response. */
export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
  requestId: string | null;
}

/**
 * Key-mode client for the Robinhood Chain (chain id 4663) API surface — live KOL
 * trades, the DEX trade tape, token discovery/bundles/candles, deployer
 * reputation, smart-money wallets, and the four push rule engines (copy-trade,
 * price alerts, KOL coordination, first touches). Every method maps 1:1 to an
 * /api/v1/rhc/… endpoint. RHC coverage is bundled into every tier.
 */
export class RobinhoodChainX402 {
  private baseUrl: string;
  private headers: Record<string, string>;
  /** Last response's rate-limit headers (X-RateLimit-*, X-Request-Id). */
  lastRateLimit: RateLimitInfo = { limit: null, remaining: null, reset: null, requestId: null };

  constructor(opts: RobinhoodChainOptions) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    if (!opts.apiKey) {
      console.error(
        "\n[robinhood-chain-x402] Missing apiKey.\n" +
        "  → Get a free API key (200 req/day, no card) at https://madeonsol.com/pricing\n" +
        "  → RHC coverage is bundled into every tier at no extra cost.\n",
      );
      throw new Error("Provide apiKey. Get a free API key at https://madeonsol.com/pricing");
    }
    this.headers = {
      "User-Agent": `robinhood-chain-x402/${VERSION}`,
      Authorization: `Bearer ${opts.apiKey}`,
    };
  }

  private async request<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
    const url = new URL(`/api/v1${path}`, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url.toString(), { headers: this.headers });
    this.lastRateLimit = {
      limit:     numHeader(res, "x-ratelimit-limit"),
      remaining: numHeader(res, "x-ratelimit-remaining"),
      reset:     numHeader(res, "x-ratelimit-reset"),
      requestId: res.headers.get("x-request-id"),
    };
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Robinhood Chain API error ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  /**
   * Body-capable sibling of `request()` for the rule-engine writes. Same
   * `/api/v1` prefix, same rate-limit capture, same error shape — it only adds
   * the method and an optional JSON body. DELETE sends no body.
   */
  private async send<T>(
    method: "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = new URL(`/api/v1${path}`, this.baseUrl);
    const headers = body === undefined
      ? this.headers
      : { ...this.headers, "Content-Type": "application/json" };
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    this.lastRateLimit = {
      limit:     numHeader(res, "x-ratelimit-limit"),
      remaining: numHeader(res, "x-ratelimit-remaining"),
      reset:     numHeader(res, "x-ratelimit-reset"),
      requestId: res.headers.get("x-request-id"),
    };
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Robinhood Chain API error ${res.status}: ${errBody}`);
    }
    return res.json() as Promise<T>;
  }

  /* ── KOL intelligence ── */

  /**
   * Real-time KOL trade feed on Robinhood Chain — every buy/sell from tracked
   * Solana KOLs' verified EVM wallets, attributed to the effective trading
   * account (`tx.from`, or the ERC-4337 userOp sender when the trade was
   * bundled — never the bundler). Tier: **BASIC**.
   * `GET /rhc/kol/feed`
   */
  async kolFeed(params?: KolFeedParams): Promise<KolFeedResponse> {
    return this.request("/rhc/kol/feed", params as Record<string, QueryValue>);
  }

  /**
   * KOL activity leaderboard — RHC KOLs ranked by trade count then net ETH flow
   * over the window. Tier: **BASIC**. `GET /rhc/kol/leaderboard`
   */
  async kolLeaderboard(params?: KolLeaderboardParams): Promise<KolLeaderboardResponse> {
    return this.request("/rhc/kol/leaderboard", params as Record<string, QueryValue>);
  }

  /**
   * Consensus tokens — bought by 2+ distinct tracked KOLs inside the window.
   * Tier: **BASIC**. `GET /rhc/kol/hot-tokens`
   */
  async kolHotTokens(params?: KolHotTokensParams): Promise<KolHotTokensResponse> {
    return this.request("/rhc/kol/hot-tokens", params as Record<string, QueryValue>);
  }

  /**
   * Single KOL profile — aggregate stats over one KOL's last 200 RHC trades plus
   * their 50 most recent trades. Tier: **BASIC**. `GET /rhc/kol/{wallet}`
   * @param wallet KOL EVM wallet address (0x, 40 hex).
   */
  async kol(wallet: string): Promise<RhcKolProfileResponse> {
    return this.request(`/rhc/kol/${encodeURIComponent(wallet)}`);
  }

  /* ── DEX trade tape ── */

  /**
   * Robinhood Chain DEX trade tape — every Uniswap v2/v3/v4 swap, each row
   * carrying the effective trading account (`trader_eoa` — `tx.from`, or the
   * ERC-4337 userOp sender when bundled; never the router or the bundler),
   * gas/ordering for MEV analysis, and KOL/deployer flags. Cursor via
   * `next_before`. Tier: **PRO+**.
   * `GET /rhc/trades`
   */
  async trades(params?: TradesParams): Promise<TradesResponse> {
    return this.request("/rhc/trades", params as Record<string, QueryValue>);
  }

  /* ── Token discovery + intelligence ── */

  /**
   * Robinhood Chain token discovery — live-priced tokens with MC, liquidity,
   * peak MC + drawdown, launchpad, and deployer tier. Tier: **PRO+**.
   * `GET /rhc/tokens`
   */
  async tokens(params?: TokensParams): Promise<TokensResponse> {
    return this.request("/rhc/tokens", params as Record<string, QueryValue>);
  }

  /**
   * Full token snapshot — metadata, live price/MC/FDV, peak MC + drawdown,
   * graduation, deployer reputation, KOL activity, and pool inventory.
   * Tier: **BASIC**. `GET /rhc/tokens/{address}`
   * @param address Token address (0x, 40 hex).
   */
  async token(address: string): Promise<RhcTokenDetailResponse> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}`);
  }

  /**
   * 1-minute OHLC candles — price + market-cap OHLC, close liquidity, volume
   * with buy/sell split, and trade/buy/sell counts. Tier: **PRO+**.
   * `GET /rhc/tokens/{address}/candles`
   */
  async tokenCandles(address: string, params?: CandlesParams): Promise<CandlesResponse> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/candles`, params as Record<string, QueryValue>);
  }

  /**
   * KOL consensus on a token — distinct KOL buyers vs sellers, exit rate, net
   * ETH flow (`net_flow_eth`), median entry MC, and first-touch. ULTRA adds the
   * `buyers`/`exited` wallet lists. Tier: **PRO+**.
   * `GET /rhc/tokens/{address}/kol-consensus`
   */
  async tokenKolConsensus(address: string): Promise<RhcKolConsensusResponse> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/kol-consensus`);
  }

  /**
   * Early-buyer quality — a 0–100 read on a token's first-20 buyer cohort:
   * win-rate, KOL-presence, bot-domination, bundle-buyer, and the informational
   * dump-cluster ensemble. Tier: **BASIC**.
   * `GET /rhc/tokens/{address}/buyer-quality`
   */
  async tokenBuyerQuality(address: string): Promise<RhcBuyerQualityResponse> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/buyer-quality`);
  }

  /**
   * Launch-bundle detection — flags a `same_block` bundle in the earliest-buyer
   * cohort and reports how much of what it bought it still holds. Field-gated by
   * tier: BASIC scalar `bundle`; PRO top-10 wallets; ULTRA full cohort with
   * identity. Tier: **BASIC**. `GET /rhc/tokens/{address}/bundle`
   */
  async tokenBundle(address: string): Promise<RhcBundleResponse> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/bundle`);
  }

  /**
   * Top traders of one token, ranked by REALIZED ETH flow (`sell − buy`),
   * enriched with wallet reputation, dump-cluster membership and early-buyer
   * rank. **`net_eth` is not PnL** — it does not value a trader's remaining bag,
   * so a wallet that bought and still holds ranks last. Tier: **PRO+** (50 rows;
   * ULTRA/BUSINESS 200). `GET /rhc/tokens/{address}/top-traders`
   */
  async tokenTopTraders(
    address: string,
    params?: { limit?: number; offset?: number }
  ): Promise<unknown> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/top-traders`, params);
  }

  /**
   * Net buy/sell flow split by mutually-exclusive trader cohort. Sign
   * convention: `net_eth = sell − buy`, so POSITIVE means that cohort
   * **distributed**. Ladder order is priority order: kol → bot → dump_cluster →
   * early_buyer → unprofiled → smart_money → retail. Tier: **PRO+**.
   * `GET /rhc/tokens/{address}/flow`
   */
  async tokenFlow(address: string, window?: "1h" | "6h" | "24h" | "7d"): Promise<unknown> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/flow`, { window });
  }

  /**
   * Peak market cap, drawdown and running high-water curve. Returns **two peaks
   * because they disagree**: `peak_mc_usd_recorded` is the stored high-water mark
   * other RHC surfaces key off (sampled from write batches, so it can undercount
   * an intra-batch spike), and `peak_mc_usd_observed` is the max of 1-minute
   * candle highs — trade-level truth, always ≥ recorded. Tier: **PRO+**.
   * `GET /rhc/tokens/{address}/peak-history`
   */
  async tokenPeakHistory(
    address: string,
    params?: { window?: "24h" | "7d" | "30d" | "all"; curve?: "true" | "false" }
  ): Promise<unknown> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/peak-history`, params);
  }

  /**
   * EVM-native risk, computed **live** on-chain. Not the Solana model: EVM has no
   * mint/freeze authority, and only ~2% of RHC tokens expose an owner function,
   * so an absent flag is the norm rather than a safety signal. The discriminating
   * signals are proxy upgradeability, LP custody and **sellability**, which is
   * simulated at the chain head and never cached. Tier: **PRO+**.
   * `GET /rhc/tokens/{address}/risk`
   */
  async tokenRisk(address: string): Promise<unknown> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/risk`);
  }

  /**
   * Exact holder set + concentration, folded from ERC-20 `Transfer` logs (not
   * trade-derived) and reconciled against on-chain `totalSupply()`. **Check
   * `verified` first.** Concentration excludes pools and burns from the
   * circulating denominator and reports them separately; `balance` is a raw
   * uint256 returned as a decimal string. Tier: **PRO+** (50 rows;
   * ULTRA/BUSINESS 200). `GET /rhc/tokens/{address}/holders`
   */
  async tokenHolders(
    address: string,
    params?: { limit?: number; offset?: number }
  ): Promise<unknown> {
    return this.request(`/rhc/tokens/${encodeURIComponent(address)}/holders`, params);
  }

  /* ── Deployer hunter ── */

  /**
   * Deployer reputation leaderboard — RHC deployers ranked by reputation over
   * every indexed launchpad token (99k+ deployers). `graduation_rate` = share at
   * $40K+ peak MC; `runner_rate` = share at $100K+.
   *
   * Since migrations 267 + 269 the `elite`/`good` **tier** rides `runner_rate`
   * ($100K) AND requires 24h of deployer history — elite = 5+ tokens, 24h+ old,
   * `runner_rate >= 0.50`; good = same with `>= 0.25`. `graduation_rate` still
   * means the $40K bar and is still returned, but it no longer sets the tier (it
   * proved farmable); only `spammer` still keys off it (20+ tokens,
   * `graduation_rate < 0.05`). Tier: **BASIC**.
   * `GET /rhc/deployer-hunter/leaderboard`
   */
  async deployerLeaderboard(params?: DeployerLeaderboardParams): Promise<DeployerLeaderboardResponse> {
    return this.request("/rhc/deployer-hunter/leaderboard", params as Record<string, QueryValue>);
  }

  /**
   * Single deployer profile — full reputation row plus the 50 most recent tokens
   * enriched with live MC and peak MC. Unknown wallets return 200 with
   * `is_deployer: false`. Tier: **BASIC**. `GET /rhc/deployer-hunter/{address}`
   * @param address Deployer EVM wallet address (0x, 40 hex).
   */
  async deployer(address: string): Promise<RhcDeployerProfileResponse> {
    return this.request(`/rhc/deployer-hunter/${encodeURIComponent(address)}`);
  }

  /* ── Smart money ── */

  /**
   * Smart-money wallet ranking — RHC trader wallets ranked by realized on-chain
   * performance (`net_eth`, `win_rate`, `memecoin_share`, `likely_bot`). Tier:
   * **PRO+**. `GET /rhc/alpha-wallets`
   */
  async alphaWallets(params?: AlphaWalletsParams): Promise<AlphaWalletsResponse> {
    return this.request("/rhc/alpha-wallets", params as Record<string, QueryValue>);
  }

  /* ── Wallet intelligence ──
   *
   * All four read from ONE shared 90-day snapshot cache, so calling
   * `wallet()` then `walletPnl()` then `walletPositions()` on the same address
   * costs roughly one computation, not three — `cache_hit` tells you which
   * call paid for it. Everything is ETH-denominated.
   */

  /**
   * Any Robinhood Chain wallet's 90-day trading profile — FIFO cost-basis PnL,
   * per-token breakdown, recent trades, and a reputation block (tracked KOL,
   * known deployer + tier, alpha-ranked, dump-cluster membership, early-buyer
   * count). Tier: **PRO+**. `GET /rhc/wallet/{address}`
   * @param address Wallet EVM address (0x, 40 hex). Case-insensitive.
   */
  async wallet(address: string): Promise<RhcWalletProfileResponse> {
    return this.request(`/rhc/wallet/${encodeURIComponent(address)}`);
  }

  /**
   * Full FIFO cost-basis PnL for one RHC wallet over 90 days: realized and
   * unrealized split, a daily realized curve, every closed position with ROI
   * and hold time, and every open position marked to the current price. Same
   * FIFO implementation as the Solana `/wallet/{address}/pnl`, so the two
   * chains are directly comparable. Tier: **PRO+**.
   * `GET /rhc/wallet/{address}/pnl`
   * @param address Wallet EVM address (0x, 40 hex).
   */
  async walletPnl(address: string): Promise<RhcWalletPnlResponse> {
    return this.request(`/rhc/wallet/${encodeURIComponent(address)}/pnl`);
  }

  /**
   * Only what the wallet still holds, marked to the current price — the same
   * FIFO pass as {@link walletPnl} without the curve and closed positions, for
   * clients polling "what is this wallet in right now". Check
   * `positions[].liquidity_basis`: `v4_virtual_ceiling` means `liquidity_usd`
   * is a bonding-curve ceiling, not withdrawable TVL. Tier: **PRO+**.
   * `GET /rhc/wallet/{address}/positions`
   * @param address Wallet EVM address (0x, 40 hex).
   */
  async walletPositions(address: string): Promise<RhcWalletPositionsResponse> {
    return this.request(`/rhc/wallet/${encodeURIComponent(address)}/positions`);
  }

  /**
   * One wallet's swaps, newest first, cursor-paginated on an opaque
   * `next_before` keyset. Distinct from `trades({ token })` — that filters the
   * global tape by TOKEN, this filters by WALLET (a different index path).
   * Tier: **PRO+**. `GET /rhc/wallet/{address}/trades`
   * @param address Wallet EVM address (0x, 40 hex).
   */
  async walletTrades(address: string, params?: WalletTradesParams): Promise<RhcWalletTradesResponse> {
    return this.request(
      `/rhc/wallet/${encodeURIComponent(address)}/trades`,
      params as Record<string, QueryValue>,
    );
  }

  /* ── Wallet tracker (watchlist) ── */

  /**
   * Your Robinhood Chain watchlist. Quotas are **per chain** — PRO 50 /
   * ULTRA 100 / BUSINESS 500 RHC wallets, independent of your Solana
   * watchlist, so adopting RHC never shrinks an existing Solana list.
   * Tier: **PRO+**. `GET /rhc/wallet-tracker/watchlist`
   */
  async walletTrackerList(): Promise<WalletTrackerWatchlistResponse> {
    return this.request("/rhc/wallet-tracker/watchlist");
  }

  /**
   * Add a wallet to your RHC watchlist. The address is stored lowercase so it
   * matches `rhc_trades.trader_eoa` — a checksummed `0xAbC…` would join to
   * nothing and look like a permanently silent wallet. Returns 409 if the
   * wallet is already tracked. Tier: **PRO+**.
   * `POST /rhc/wallet-tracker/watchlist`
   */
  async walletTrackerAdd(params: WalletTrackerAddParams): Promise<WalletTrackerWalletResponse> {
    return this.send("POST", "/rhc/wallet-tracker/watchlist", params);
  }

  /**
   * Remove a wallet from your RHC watchlist. Tier: **PRO+**.
   * `DELETE /rhc/wallet-tracker/watchlist/{address}`
   * @param address Tracked wallet EVM address.
   */
  async walletTrackerRemove(address: string): Promise<WalletTrackerRemovedResponse> {
    return this.send("DELETE", `/rhc/wallet-tracker/watchlist/${encodeURIComponent(address)}`);
  }

  /**
   * Relabel a tracked wallet. Tier: **PRO+**.
   * `PATCH /rhc/wallet-tracker/watchlist/{address}`
   * @param address Tracked wallet EVM address.
   * @param label New label — pass `null` to clear it.
   */
  async walletTrackerRelabel(address: string, label: string | null): Promise<WalletTrackerWalletResponse> {
    return this.send("PATCH", `/rhc/wallet-tracker/watchlist/${encodeURIComponent(address)}`, { label });
  }

  /**
   * Every trade by every wallet on your RHC watchlist, newest first, each row
   * labelled with its watchlist label. The cursor is an opaque keyset
   * (`next_before`) matching the rest of the RHC tree, not the Solana
   * tracker's integer epoch. A `wallet` filter must already be tracked.
   * Tier: **PRO+**. `GET /rhc/wallet-tracker/trades`
   */
  async walletTrackerTrades(params?: WalletTrackerTradesParams): Promise<WalletTrackerTradesResponse> {
    return this.request("/rhc/wallet-tracker/trades", params as Record<string, QueryValue>);
  }

  /**
   * Per-wallet buy/sell/volume rollup across your tracked RHC wallets. Sourced
   * from `rhc_trades` directly, not from a per-subscriber capture log — on RHC
   * every swap is already recorded, so adding a wallet gives you its history
   * immediately rather than only from the moment you tracked it.
   * Tier: **PRO+**. `GET /rhc/wallet-tracker/summary`
   */
  async walletTrackerSummary(params?: WalletTrackerSummaryParams): Promise<WalletTrackerSummaryResponse> {
    return this.request("/rhc/wallet-tracker/summary", params as Record<string, QueryValue>);
  }

  /* ── Rule engine: copy-trade ── */

  /**
   * Your Robinhood Chain copy-trade rules. Quotas are **per chain** — a full set
   * of Solana copy-trade rules does not consume RHC capacity. Tier: **PRO+**.
   * `GET /rhc/copytrade/subscriptions`
   */
  async copyTradeList(): Promise<CopyTradeListResponse> {
    return this.request("/rhc/copytrade/subscriptions");
  }

  /**
   * Create a copy-trade rule — fires when one of `source_wallets` trades on RHC.
   * Amounts are ETH, not SOL, and there is no MC band: the RHC notify payload
   * carries no market cap, so a band could only be a per-event DB lookup in the
   * hot path of a ~3.3M trades/day chain. The response carries the
   * `webhook_secret` **once**. Tier: **PRO+**.
   * `POST /rhc/copytrade/subscriptions`
   */
  async copyTradeCreate(params: CopyTradeCreateParams): Promise<CopyTradeCreateResponse> {
    return this.send("POST", "/rhc/copytrade/subscriptions", params);
  }

  /**
   * Fetch one copy-trade rule. Tier: **PRO+**.
   * `GET /rhc/copytrade/subscriptions/{id}`
   * @param id Numeric rule id.
   */
  async copyTradeGet(id: number): Promise<CopyTradeGetResponse> {
    return this.request(`/rhc/copytrade/subscriptions/${id}`);
  }

  /**
   * Partially update a copy-trade rule. The per-tier wallet cap is re-checked,
   * so a PRO rule cannot be PATCHed past its limit. Tier: **PRO+**.
   * `PATCH /rhc/copytrade/subscriptions/{id}`
   * @param id Numeric rule id.
   */
  async copyTradeUpdate(id: number, params: CopyTradeUpdateParams): Promise<CopyTradeGetResponse> {
    return this.send("PATCH", `/rhc/copytrade/subscriptions/${id}`, params);
  }

  /**
   * Delete a copy-trade rule (its fired signals cascade). Tier: **PRO+**.
   * `DELETE /rhc/copytrade/subscriptions/{id}`
   * @param id Numeric rule id.
   */
  async copyTradeDelete(id: number): Promise<RhcDeletedResponse> {
    return this.send("DELETE", `/rhc/copytrade/subscriptions/${id}`);
  }

  /**
   * Fire history for your copy-trade rules — the catch-up path when a webhook
   * was missed or the WS channel dropped. Retained 7 days. Tier: **PRO+**.
   * `GET /rhc/copytrade/signals`
   */
  async copyTradeSignals(params?: CopyTradeSignalsParams): Promise<CopyTradeSignalsResponse> {
    return this.request("/rhc/copytrade/signals", params as Record<string, QueryValue>);
  }

  /* ── Rule engine: price alerts ── */

  /**
   * Your Robinhood Chain price alerts. Quota is per chain. Tier: **PRO+**.
   * `GET /rhc/price-alerts`
   */
  async priceAlertsList(): Promise<PriceAlertListResponse> {
    return this.request("/rhc/price-alerts");
  }

  /**
   * Create a price alert. The baseline MC is captured **now**, so the alert is a
   * delta from the moment you set it, and the token must already be tracked with
   * a market cap. RHC alerts are POLLED (~15s off `rhc_token_prices`), not
   * evaluated in a live price loop — the response's `evaluation` block says so.
   * Tier: **PRO+**. `POST /rhc/price-alerts`
   */
  async priceAlertsCreate(params: PriceAlertCreateParams): Promise<PriceAlertCreateResponse> {
    return this.send("POST", "/rhc/price-alerts", params);
  }

  /**
   * Fetch one price alert. Tier: **PRO+**. `GET /rhc/price-alerts/{id}`
   * @param id Numeric alert id.
   */
  async priceAlertsGet(id: number): Promise<PriceAlertGetResponse> {
    return this.request(`/rhc/price-alerts/${id}`);
  }

  /**
   * Update a price alert. Only `name`, `delivery_mode`, `webhook_url` and
   * `is_active` are mutable — retuning a threshold mid-flight would make the
   * alert's recorded events uninterpretable. Tier: **PRO+**.
   * `PATCH /rhc/price-alerts/{id}`
   * @param id Numeric alert id.
   */
  async priceAlertsUpdate(id: number, params: PriceAlertUpdateParams): Promise<PriceAlertGetResponse> {
    return this.send("PATCH", `/rhc/price-alerts/${id}`, params);
  }

  /**
   * Delete a price alert (its events cascade). Tier: **PRO+**.
   * `DELETE /rhc/price-alerts/{id}`
   * @param id Numeric alert id.
   */
  async priceAlertsDelete(id: number): Promise<RhcDeletedResponse> {
    return this.send("DELETE", `/rhc/price-alerts/${id}`);
  }

  /**
   * Dip and recovery events for your price alerts — the catch-up path for a
   * missed webhook or a dropped WS channel. Retained 30 days. Tier: **PRO+**.
   * `GET /rhc/price-alerts/events`
   */
  async priceAlertsEvents(params?: PriceAlertEventsParams): Promise<PriceAlertEventsResponse> {
    return this.request("/rhc/price-alerts/events", params as Record<string, QueryValue>);
  }

  /* ── Rule engine: KOL coordination ── */

  /**
   * Your RHC coordination rules — fire when N+ tracked KOLs buy the same token
   * inside a rolling window. Quota is per chain. Tier: **PRO+**.
   * `GET /rhc/kol/coordination/alerts`
   */
  async coordinationAlertsList(): Promise<CoordinationAlertListResponse> {
    return this.request("/rhc/kol/coordination/alerts");
  }

  /**
   * Create a coordination rule. Scoring is the shared v1 scorer so the number is
   * comparable to Solana, but the `earliness` component is defaulted on RHC
   * (no early-entry equivalent) while `quality` is a real KOL win-rate — the
   * response's `scoring` block records which components are real.
   * Tier: **PRO+**. `POST /rhc/kol/coordination/alerts`
   */
  async coordinationAlertsCreate(
    params: CoordinationAlertCreateParams
  ): Promise<CoordinationAlertCreateResponse> {
    return this.send("POST", "/rhc/kol/coordination/alerts", params);
  }

  /**
   * Fetch one coordination rule. Tier: **PRO+**.
   * `GET /rhc/kol/coordination/alerts/{id}`
   * @param id Rule UUID.
   */
  async coordinationAlertsGet(id: string): Promise<CoordinationAlertGetResponse> {
    return this.request(`/rhc/kol/coordination/alerts/${encodeURIComponent(id)}`);
  }

  /**
   * Partially update a coordination rule. Tier: **PRO+**.
   * `PATCH /rhc/kol/coordination/alerts/{id}`
   * @param id Rule UUID.
   */
  async coordinationAlertsUpdate(
    id: string,
    params: CoordinationAlertUpdateParams
  ): Promise<CoordinationAlertGetResponse> {
    return this.send("PATCH", `/rhc/kol/coordination/alerts/${encodeURIComponent(id)}`, params);
  }

  /**
   * Delete a coordination rule (its cooldown state and fired signals cascade).
   * Tier: **PRO+**. `DELETE /rhc/kol/coordination/alerts/{id}`
   * @param id Rule UUID.
   */
  async coordinationAlertsDelete(id: string): Promise<RhcDeletedResponse> {
    return this.send("DELETE", `/rhc/kol/coordination/alerts/${encodeURIComponent(id)}`);
  }

  /* ── Rule engine: KOL first touches ── */

  /**
   * Your RHC first-touch subscriptions — push when a token gets its FIRST
   * tracked-KOL buy. Quota is per chain. Tier: **ULTRA+**.
   * `GET /rhc/kol/first-touches/subscriptions`
   */
  async firstTouchSubscriptionsList(): Promise<FirstTouchSubscriptionListResponse> {
    return this.request("/rhc/kol/first-touches/subscriptions");
  }

  /**
   * Create a first-touch subscription. The filter set is deliberately not the
   * Solana one: RHC has no scout score, so `min_scout_tier` / `min_n_touches`
   * are absent rather than silently matching nothing — `min_kol_winrate` and
   * `strategy` are the quality gates. Unknown filter keys are rejected, not
   * ignored. Tier: **ULTRA+**. `POST /rhc/kol/first-touches/subscriptions`
   */
  async firstTouchSubscriptionsCreate(
    params: FirstTouchSubscriptionCreateParams
  ): Promise<FirstTouchSubscriptionCreateResponse> {
    return this.send("POST", "/rhc/kol/first-touches/subscriptions", params);
  }

  /**
   * Fetch one first-touch subscription. Tier: **ULTRA+**.
   * `GET /rhc/kol/first-touches/subscriptions/{id}`
   * @param id Subscription UUID.
   */
  async firstTouchSubscriptionsGet(id: string): Promise<FirstTouchSubscriptionGetResponse> {
    return this.request(`/rhc/kol/first-touches/subscriptions/${encodeURIComponent(id)}`);
  }

  /**
   * Update a first-touch subscription. `filters` is a whole-object **replace**,
   * not a merge — merging would make "remove this filter" inexpressible.
   * Tier: **ULTRA+**. `PATCH /rhc/kol/first-touches/subscriptions/{id}`
   * @param id Subscription UUID.
   */
  async firstTouchSubscriptionsUpdate(
    id: string,
    params: FirstTouchSubscriptionUpdateParams
  ): Promise<FirstTouchSubscriptionGetResponse> {
    return this.send("PATCH", `/rhc/kol/first-touches/subscriptions/${encodeURIComponent(id)}`, params);
  }

  /**
   * Delete a first-touch subscription. Tier: **ULTRA+**.
   * `DELETE /rhc/kol/first-touches/subscriptions/{id}`
   * @param id Subscription UUID.
   */
  async firstTouchSubscriptionsDelete(id: string): Promise<RhcDeletedResponse> {
    return this.send("DELETE", `/rhc/kol/first-touches/subscriptions/${encodeURIComponent(id)}`);
  }

  /* ── Streaming ── */

  /** Generate a 24h WebSocket streaming token (PRO/ULTRA). */
  async getStreamToken(): Promise<StreamToken> {
    const url = new URL("/api/v1/stream/token", this.baseUrl);
    const res = await fetch(url.toString(), { method: "POST", headers: this.headers });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Robinhood Chain API error ${res.status}: ${body}`);
    }
    return res.json() as Promise<StreamToken>;
  }

  /**
   * Open a managed real-time Robinhood Chain WebSocket stream. Handles token
   * fetch + refresh, auto-reconnect with backoff, heartbeat liveness, and typed
   * events for you. Channels: `rhc:kol_trades`, `rhc:dex_trades` (ULTRA+), plus
   * the four rule-engine channels (`rhc:copytrade:signals`,
   * `rhc:price_alert:events`, `rhc:kol:coordination`, `rhc:kol:first_touches`).
   * Listen on `"warning"` to catch server `channels_rejected` frames.
   *
   * @example
   * const stream = client.stream();
   * stream.on("rhc:kol_trade", (t) => console.log(t));
   * stream.subscribe(["rhc:kol_trades"]);
   */
  stream(opts?: Omit<StreamClientOptions, "getToken">): RobinhoodChainStream {
    return new RobinhoodChainStream({ ...opts, getToken: () => this.getStreamToken() });
  }
}

function numHeader(res: Response, name: string): number | null {
  const v = res.headers.get(name);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Create a Robinhood Chain client with API-key auth.
 * @param apiKey Your `msk_` API key — get one free at https://madeonsol.com/pricing.
 * @param baseUrl Optional API base URL override.
 */
export function createClient(apiKey: string, baseUrl?: string): RobinhoodChainX402 {
  return new RobinhoodChainX402({ apiKey, baseUrl });
}
