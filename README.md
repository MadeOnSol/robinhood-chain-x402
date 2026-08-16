# robinhood-chain-x402

[![npm version](https://img.shields.io/npm/v/robinhood-chain-x402?style=flat-square)](https://www.npmjs.com/package/robinhood-chain-x402)
[![npm downloads](https://img.shields.io/npm/dm/robinhood-chain-x402?style=flat-square)](https://www.npmjs.com/package/robinhood-chain-x402)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> 📂 **[Examples](./examples/)** · 📚 **[API docs](https://madeonsol.com/api-docs)** · 🤖 **[Robinhood Chain](https://madeonsol.com/robinhood)** · 💰 **[Free API key](https://madeonsol.com/pricing)**

**TypeScript SDK for the [MadeOnSol](https://madeonsol.com/robinhood) Robinhood Chain API — EVM-native on-chain trading intelligence for Robinhood Chain, chain id 4663.**

Robinhood Chain is an Arbitrum Orbit L2. This SDK gives you the same intel you get on Solana — live KOL trades, a DEX trade tape, token discovery, launch-bundle detection, early-buyer quality, deployer reputation and smart-money wallets — but EVM-native: lowercase `0x` addresses, `eth_amount`, `tx_hash`, `block_number`, `net_flow_eth`. Data comes from our **self-hosted RHC node**. The KOL→EVM mapping is recovered by tracing each Solana KOL's bridge deposits (deBridge / Relay / Mayan / Wormhole) — a dataset unique to MadeOnSol.

RHC coverage is **bundled into every tier at no extra cost** — same API key, same base URL. Get a free key (200 req/day, no card) at [madeonsol.com/pricing](https://madeonsol.com/pricing).

> **Two auth modes.** **Key mode** — an `msk_` Bearer API key calls every Robinhood Chain v1 route below (49 methods, all tiers). **Keyless x402 mode** (since 0.7.0) — pass an EVM `privateKey` instead and the client pays per call in **USDG on Robinhood Chain** on the 10-endpoint x402 rail (from $0.04/call, no signup, wallet needs USDG but no ETH — our facilitator relays gas). It handles the 402 → sign EIP-3009 `transferWithAuthorization` → retry flow itself; the rail is discoverable at [`/api/x402/rhc`](https://madeonsol.com/api/x402/rhc) and documented at [madeonsol.com/robinhood/x402](https://madeonsol.com/robinhood/x402). For keyless USDC-per-call on the Solana API, use [`madeonsol-x402`](https://www.npmjs.com/package/madeonsol-x402).

> **New in 0.7.0 — keyless x402 mode.** `createKeylessClient("0x…")` / `new RobinhoodChainX402({ privateKey })`: any EVM wallet holding USDG on chain 4663 can call `kolFeed`, `kolHotTokens`, `kolLeaderboard`, `token`, `tokenBuyerQuality`, `tokenKolConsensus`, `tokenRisk`, `tokenHolders`, `walletPnl` and `deployerAlerts` with no API key. The signature is EIP-712 over the USDG domain `{ Global Dollar, 1, 4663 }`, one payment attempt per call, `client.lastPayment` exposes the on-chain settlement (`transaction`, `payer`). Requires the optional peer dependency `viem` (`npm i viem`); key mode still has zero runtime deps. Calling any other method on a keyless client throws `KeylessNotAvailableError` — it names the rail, it does not silently downgrade. Also new on the server this release: `/rhc/equities` (beacon-verified tokenized stocks/ETFs), `/rhc/tokens?sort=newest&since=`, `/rhc/lp-events` — key-mode bindings for those follow in the next minor.

> **New in 0.6.0 — wallet intelligence.** Ten new operations covering the Robinhood Chain wallet surface, which had no SDK binding at all until now: `wallet()` (90-day profile with reputation flags), `walletPnl()` (FIFO PnL with daily curve, closed and open positions), `walletPositions()` (open book marked to market), `walletTrades()` (per-wallet keyset-paginated tape), plus the watchlist — `walletTrackerList()`, `walletTrackerAdd()`, `walletTrackerRemove()`, `walletTrackerRelabel()`, `walletTrackerTrades()` and `walletTrackerSummary()`. Everything is **ETH**-denominated, and cost basis is FIFO over a rolling 90-day window — `cost_basis_observable_from` names the date the window opens, so a position opened before it reads as a sell with no matching buy. The profile / PnL / positions trio shares ONE snapshot cache server-side, so calling all three on an address costs roughly one computation rather than three; `cache_hit` says which call paid for it. Watchlist quotas are **per chain** (PRO 50 / ULTRA 100 / BUSINESS 500 RHC wallets), independent of your Solana list. Dependency ranges are now bounded to the versions actually tested (`@x402/*` `^2.x`, `@solana/kit` `^5.5.1`) instead of open-ended `>=0.0.1`, and the lazily-imported x402 peers are marked optional — a keyed install no longer pulls the whole Solana stack.

## Install

```bash
npm install robinhood-chain-x402
# keyless x402 mode additionally needs viem:
npm install viem
```

> Zero required runtime dependencies in key mode. The live stream will use the optional [`ws`](https://www.npmjs.com/package/ws) package on Node when present (recommended on Node ≥ 22 for a clean process exit); the browser uses the native `WebSocket`.

## Quick start (10 seconds)

```ts
import { createClient } from "robinhood-chain-x402";

const client = createClient("msk_your_api_key_here"); // free tier at madeonsol.com/pricing

// Live KOL buys/sells on Robinhood Chain (chain id 4663)
const { trades } = await client.kolFeed({ limit: 10, action: "buy" });
console.log(trades);
```

### Advanced initialization

```ts
import { RobinhoodChainX402 } from "robinhood-chain-x402";

const client = new RobinhoodChainX402({
  apiKey: "msk_...",
  baseUrl: "https://madeonsol.com", // optional override
});
```

### Keyless x402 mode — pay per call in USDG, no API key

```ts
import { createKeylessClient } from "robinhood-chain-x402";

// An EVM wallet that holds USDG on Robinhood Chain (chain 4663). No ETH needed.
// Read the key from the environment — never hard-code it.
const agent = createKeylessClient(process.env.RHC_PAYER_KEY!);

const risk = await agent.tokenRisk("0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec"); // NVDA, $0.02
console.log(risk.score, risk.sellability, agent.lastPayment?.transaction); // settlement tx on Robinhood Chain

// Keyless rail = 10 endpoints; anything else throws KeylessNotAvailableError:
console.log(agent.constructor.KEYLESS_ENDPOINTS);
```

How it works: the first request gets a `402` with `accepts[]`; the client picks the `eip155:4663` leg, signs an EIP-3009 `transferWithAuthorization` (EIP-712 domain `{ name: "Global Dollar", version: "1", chainId: 4663 }`, 5-minute validity, random 32-byte nonce) with `viem`, and retries with `PAYMENT-SIGNATURE`. Our facilitator verifies balance + nonce and settles on-chain (`transferWithAuthorization`, gas paid by us); the `PAYMENT-RESPONSE` header comes back decoded on `client.lastPayment`. Prices: from **$0.04** on the USDG leg (the relayer's gas floor); the same endpoints also accept USDC on Solana via [`madeonsol-x402`](https://www.npmjs.com/package/madeonsol-x402).

## Endpoints — all 52 Robinhood Chain routes

Every method maps 1:1 to an /api/v1/rhc/… route. Fields are EVM-native. Everything is a GET except the four rule engines at the bottom, which are full CRUD.

### KOL intelligence

| Method | Route | Tier | Description |
|---|---|---|---|
| `kolFeed(params?)` | `/api/v1/rhc/kol/feed` | BASIC | Real-time KOL trade feed — every buy/sell from tracked KOLs' verified EVM wallets, enriched with MC/peak and `mc_multiple_since_trade` |
| `kolLeaderboard(params?)` | `/api/v1/rhc/kol/leaderboard` | BASIC | KOLs ranked by trade count then net ETH flow over `24h`/`7d`/`30d` |
| `kolHotTokens(params?)` | `/api/v1/rhc/kol/hot-tokens` | BASIC | Consensus tokens bought by 2+ distinct KOLs in the window |
| `kol(wallet)` | `/api/v1/rhc/kol/{wallet}` | BASIC | Single KOL profile — aggregate stats + 50 most recent trades |

### DEX trade tape

| Method | Route | Tier | Description |
|---|---|---|---|
| `trades(params?)` | `/api/v1/rhc/trades` | PRO+ | Every Uniswap v2/v3/v4 swap with the effective `trader_eoa`, gas/ordering for MEV, and KOL/deployer flags |

> **`trader_eoa` is the effective trading account**, not simply `tx.from`. On an ordinary transaction it *is* `tx.from`; when the trade was bundled through ERC-4337 it is the userOp sender (`UserOperationEvent`), never the bundler that relayed it. It is still an EOA either way — on Robinhood Chain a userOp sender is a normal EOA carrying an EIP-7702 delegation. Use `trader` only for the swap-log recipient (the router on aggregated swaps).

### Token discovery + intelligence

| Method | Route | Tier | Description |
|---|---|---|---|
| `tokens(params?)` | `/api/v1/rhc/tokens` | PRO+ | Live-priced token discovery — MC, liquidity, peak MC + drawdown, launchpad, deployer tier |
| `token(address)` | `/api/v1/rhc/tokens/{address}` | BASIC | Full token snapshot — price/MC/FDV, graduation, deployer block, KOL activity, pools |
| `tokenCandles(address, params?)` | `/api/v1/rhc/tokens/{address}/candles` | PRO+ | 1-minute OHLC candles — price + MC OHLC, close liquidity, volume with buy/sell split |
| `tokenKolConsensus(address)` | `/api/v1/rhc/tokens/{address}/kol-consensus` | PRO+ | KOL positioning — buyers vs sellers, exit rate, `net_flow_eth`, median entry MC (ULTRA adds wallet lists) |
| `tokenBuyerQuality(address)` | `/api/v1/rhc/tokens/{address}/buyer-quality` | BASIC | 0–100 early-buyer quality with bundle-buyer + dump-cluster legs |
| `tokenBundle(address)` | `/api/v1/rhc/tokens/{address}/bundle` | BASIC | Launch-bundle detection (`same_block`) + how much the cohort still holds |
| `tokenTopTraders(address, params?)` | `/api/v1/rhc/tokens/{address}/top-traders` | PRO+ | Traders ranked by REALIZED ETH (`sell − buy`) — **not PnL**; a wallet still holding ranks last |
| `tokenFlow(address, window?)` | `/api/v1/rhc/tokens/{address}/flow` | PRO+ | Net flow split by cohort (kol → bot → dump_cluster → early_buyer → …); positive `net_eth` means that cohort distributed |
| `tokenPeakHistory(address, params?)` | `/api/v1/rhc/tokens/{address}/peak-history` | PRO+ | Two peaks because they disagree — `peak_mc_usd_recorded` (stored high-water) vs `peak_mc_usd_observed` (candle highs) |
| `tokenRisk(address)` | `/api/v1/rhc/tokens/{address}/risk` | PRO+ | EVM-native risk computed live on-chain — proxy upgradeability, LP custody, simulated **sellability** (never cached) |
| `tokenHolders(address, params?)` | `/api/v1/rhc/tokens/{address}/holders` | PRO+ | Exact holder set from `Transfer` logs + concentration. **Check `verified` first**; `balance` is a raw uint256 string |

### Deployer hunter + smart money

| Method | Route | Tier | Description |
|---|---|---|---|
| `deployerLeaderboard(params?)` | `/api/v1/rhc/deployer-hunter/leaderboard` | BASIC | 99k+ deployers ranked by reputation — `graduation_rate` ($40K+ peak MC), `runner_rate` ($100K+) |
| `deployer(address)` | `/api/v1/rhc/deployer-hunter/{address}` | BASIC | Single deployer profile + 50 most recent tokens (unknown wallets → `is_deployer: false`) |
| `deployerAlerts(params?)` | `/api/v1/rhc/deployer-hunter/alerts` | BASIC · keyless $0.01 | Launch alerts from tracked (graded) deployers — tier, lifetime bond rate, MC at alert; `since` = polling cursor (feed back `next_since`) |
| `alphaWallets(params?)` | `/api/v1/rhc/alpha-wallets` | PRO+ | Smart-money wallets ranked by realized performance — `net_eth`, `win_rate`, `memecoin_share`, `likely_bot` |

### Rule engines — push, not polling

Four server-side rule engines that watch the RHC tape for you and deliver over webhook or WebSocket. **Every quota is per chain** — configuring RHC rules never consumes your Solana budget. A `webhook_secret` is returned exactly once on create; payloads are signed HMAC-SHA256 over `` `<timestamp>.<body>` `` in the `X-MadeOnSol-Signature` header.

| Method | Route | Tier | Description |
|---|---|---|---|
| `copyTradeList()` | `GET /api/v1/rhc/copytrade/subscriptions` | PRO+ | Your copy-trade rules |
| `copyTradeCreate(params)` | `POST /api/v1/rhc/copytrade/subscriptions` | PRO+ | Follow up to 250 wallets; sizes are **ETH**, and there is no MC band (the RHC notify payload carries no market cap) |
| `copyTradeGet(id)` | `GET /api/v1/rhc/copytrade/subscriptions/{id}` | PRO+ | One rule (numeric id) |
| `copyTradeUpdate(id, params)` | `PATCH /api/v1/rhc/copytrade/subscriptions/{id}` | PRO+ | Partial update; the wallet cap is re-checked so a rule cannot be PATCHed past its tier |
| `copyTradeDelete(id)` | `DELETE /api/v1/rhc/copytrade/subscriptions/{id}` | PRO+ | Delete a rule (signals cascade) |
| `copyTradeSignals(params?)` | `GET /api/v1/rhc/copytrade/signals` | PRO+ | Fire history — the catch-up path for a missed webhook. Retained 7 days |
| `priceAlertsList()` | `GET /api/v1/rhc/price-alerts` | PRO+ | Your price alerts |
| `priceAlertsCreate(params)` | `POST /api/v1/rhc/price-alerts` | PRO+ | Baseline MC is captured at creation; token must already be tracked with an MC |
| `priceAlertsGet(id)` | `GET /api/v1/rhc/price-alerts/{id}` | PRO+ | One alert (numeric id) |
| `priceAlertsUpdate(id, params)` | `PATCH /api/v1/rhc/price-alerts/{id}` | PRO+ | Only `name`, `delivery_mode`, `webhook_url`, `is_active` are mutable |
| `priceAlertsDelete(id)` | `DELETE /api/v1/rhc/price-alerts/{id}` | PRO+ | Delete an alert (events cascade) |
| `priceAlertsEvents(params?)` | `GET /api/v1/rhc/price-alerts/events` | PRO+ | Dip/recovery fire history. Retained 30 days |
| `coordinationAlertsList()` | `GET /api/v1/rhc/kol/coordination/alerts` | PRO+ | Your coordination rules |
| `coordinationAlertsCreate(params)` | `POST /api/v1/rhc/kol/coordination/alerts` | PRO+ | Fire when N+ tracked KOLs buy the same token inside a rolling window |
| `coordinationAlertsGet(id)` | `GET /api/v1/rhc/kol/coordination/alerts/{id}` | PRO+ | One rule (UUID) |
| `coordinationAlertsUpdate(id, params)` | `PATCH /api/v1/rhc/kol/coordination/alerts/{id}` | PRO+ | Partial update |
| `coordinationAlertsDelete(id)` | `DELETE /api/v1/rhc/kol/coordination/alerts/{id}` | PRO+ | Delete a rule (cooldown state + signals cascade) |
| `firstTouchSubscriptionsList()` | `GET /api/v1/rhc/kol/first-touches/subscriptions` | ULTRA+ | Your first-touch subscriptions |
| `firstTouchSubscriptionsCreate(params)` | `POST /api/v1/rhc/kol/first-touches/subscriptions` | ULTRA+ | Push when a token gets its FIRST tracked-KOL buy |
| `firstTouchSubscriptionsGet(id)` | `GET /api/v1/rhc/kol/first-touches/subscriptions/{id}` | ULTRA+ | One subscription (UUID) |
| `firstTouchSubscriptionsUpdate(id, params)` | `PATCH /api/v1/rhc/kol/first-touches/subscriptions/{id}` | ULTRA+ | `filters` is a whole-object **replace**, not a merge |
| `firstTouchSubscriptionsDelete(id)` | `DELETE /api/v1/rhc/kol/first-touches/subscriptions/{id}` | ULTRA+ | Delete a subscription |

> **RHC price alerts are polled (~15s), not live.** `rhc_token_prices` is written by the RHC ingester on a separate box and emits no `pg_notify`, so there is nothing to react to. Effective latency is that interval plus the token's own price-update cadence — **do not assume parity with the Solana alerts, which are sub-second.** The create response spells this out in its `evaluation` block.

> **Coordination scoring is comparable to Solana, but not identical.** The shared v1 scorer runs, `quality` is a real KOL win-rate, and `earliness` is **defaulted** — RHC has no early-entry equivalent. Every fired signal records which components were real in `score_inputs`.

> **First-touch filters are not the Solana set.** RHC has no scout score, so `min_scout_tier` and `min_n_touches` do not exist here rather than silently matching nothing; `min_kol_winrate` and `strategy` are the quality gates. Unknown filter keys are rejected with a 400, not ignored.

```ts
// Follow three wallets, 0.05 ETH per copy, pushed over WebSocket
const { subscription, webhook_secret } = await client.copyTradeCreate({
  name: "degen desk",
  source_wallets: ["0xaaa...", "0xbbb...", "0xccc..."],
  min_trade_eth: 0.01,
  sizing_mode: "fixed",
  sizing_amount: 0.05,
  delivery_mode: "websocket",
});

// Catch up on anything the webhook missed in the last hour
const since = new Date(Date.now() - 3_600_000).toISOString();
const { signals } = await client.copyTradeSignals({ subscription_id: subscription.id, since });

// Alert me if this token drops 30% from where it is right now
await client.priceAlertsCreate({ token_address: "0xToken...", drop_pct: 30, recovery_pct: 15, webhook_url: "https://example.com/hook" });
```

### Examples

> **Deployer tiers ride `runner_rate`, not `graduation_rate`.** Since migrations 267 + 269, `elite` = 5+ tokens, 24h+ of deployer history, `runner_rate >= 0.50` ($100K+ peak MC); `good` = same with `>= 0.25`. `graduation_rate` still means the $40K bar and is still returned on every row — it just no longer sets the tier (it proved farmable by operators rotating wallets). Only `spammer` still keys off it (20+ tokens, `graduation_rate < 0.05`).

```ts
// Deployer reputation leaderboard — elite deployers first
const { deployers } = await client.deployerLeaderboard({ sort: "runner_rate", tier: "elite" });

// Is this token's early cohort a launch bundle that's still holding?
const { bundle } = await client.tokenBundle("0xToken...");
console.log(bundle.bundle_kind, bundle.held_pct_of_supply);

// Smart-money memecoin traders only, biggest net ETH first
const { wallets } = await client.alphaWallets({ classification: "smart_money", min_memecoin_share: 0.7 });
```

## Streaming

Managed WebSocket stream over ws-streaming (`wss://madeonsol.com/ws/v1/stream`). Handles the token fetch + 24h refresh, auto-reconnect with backoff, and heartbeat liveness. Six RHC channels:

| Channel | Emits | Tier | Scope |
|---|---|---|---|
| `rhc:kol_trades` | `rhc:kol_trade` | PRO+ | broadcast — the live KOL tape |
| `rhc:dex_trades` | `rhc:dex_trade` | **ULTRA+** | broadcast — the full DEX firehose |
| `rhc:copytrade:signals` | `rhc:copytrade:signal` | PRO+ | user-scoped — only **your** rules' fires |
| `rhc:price_alert:events` | `rhc:price_alert:dip`, `rhc:price_alert:recovery` | PRO+ | user-scoped; ~15s polled, not sub-second |
| `rhc:kol:coordination` | `rhc:kol:coordination` | PRO+ | user-scoped — only **your** rules' fires |
| `rhc:kol:first_touches` | `rhc:kol:first_touch` | PRO+ | broadcast — ULTRA gates only the first-touch *subscription CRUD*, not this channel |

> **Deprecated:** `rhc:trades` was never a real channel — 0.4.0 subscribers got a `channels_rejected` warning and silence. The server now accepts it as an alias of `rhc:dex_trades` (and acks it under the canonical name), and the SDK keeps the literal marked `@deprecated` so 0.4.0 code compiles. Use `rhc:dex_trades`.

```ts
const stream = client.stream();

stream.on("rhc:kol_trade", (t) => console.log("KOL trade", t));
stream.on("rhc:dex_trade", (t) => console.log("DEX trade", t)); // ULTRA+
stream.on("open", () => console.log("connected to chain 4663"));
// New in 0.5.0 — a refused channel (typo or tier gate) is surfaced instead of
// leaving the stream silently quiet.
stream.on("warning", (w) => console.warn("rejected:", w.code, w.rejected, w.valid_channels));

stream.subscribe(["rhc:kol_trades", "rhc:dex_trades"]);

// later
stream.close();
```

### New in 0.5.0 — stream fixes

- **Channel names corrected.** `StreamChannel` now lists the six real RHC channels above. 0.4.0's `rhc:trades` never existed server-side; it is now a server-accepted deprecated alias of `rhc:dex_trades` and stays in the union as `@deprecated`.
- **Event names corrected.** The firehose broadcasts `rhc:dex_trade` — a 0.4.0 `on("rhc:trade", …)` handler never fired, and is now a **compile error** so you find it. `StreamEventName` covers all six channels' events.
- **Server warnings surfaced.** `channels_rejected` frames used to be silently dropped; they now emit a typed `"warning"` lifecycle event (`StreamWarning`: `code`, `rejected`, `valid_channels`, `message`).

## Rate limits

Every successful response updates `client.lastRateLimit` from the `X-RateLimit-*` headers:

```ts
await client.kolFeed({ limit: 5 });
console.log(client.lastRateLimit); // { limit, remaining, reset, requestId }
```

## Links

- 🤖 Robinhood Chain overview — https://madeonsol.com/robinhood
- 💰 Pricing & free API key — https://madeonsol.com/pricing
- 📚 API docs — https://madeonsol.com/api-docs

## License

MIT © MadeOnSol
