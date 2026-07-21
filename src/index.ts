/**
 * robinhood-chain-x402 — TypeScript client for the MadeOnSol Robinhood Chain
 * (chain id 4663) API.
 *
 * Robinhood Chain is an Arbitrum Orbit L2. This package is **key-mode only**:
 * it authenticates with an `msk_` Bearer API key against the Robinhood Chain
 * (/api/v1/rhc/…) endpoints. The x402 pay-per-call rail is Solana-native and is NOT ported here
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
 * reputation, and smart-money wallets. Every method maps 1:1 to a
 * GET /api/v1/rhc/… endpoint. RHC coverage is bundled into every tier.
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

  /* ── KOL intelligence ── */

  /**
   * Real-time KOL trade feed on Robinhood Chain — every buy/sell from tracked
   * Solana KOLs' verified EVM wallets, attributed via tx.from. Tier: **BASIC**.
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
   * carrying the real trader wallet (`trader_eoa`), gas/ordering for MEV
   * analysis, and KOL/deployer flags. Cursor via `next_before`. Tier: **PRO+**.
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

  /* ── Deployer hunter ── */

  /**
   * Deployer reputation leaderboard — RHC deployers ranked by reputation over
   * every indexed launchpad token (40k+ deployers). `graduation_rate` = share at
   * $40K+ peak MC; `runner_rate` = share at $100K+. Tier: **BASIC**.
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
   * events for you. Channels: `rhc:kol_trades`, `rhc:trades`.
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
